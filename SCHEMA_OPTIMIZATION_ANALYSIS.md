# 데이터베이스 스키마 최적화 분석

## 종합 평가: ⭐⭐⭐⭐ (4/5)

현재 스키마는 **잘 설계된 스키마**이지만, 몇 가지 최적화 가능 영역이 있습니다.

---

## 1. 잘된 점 ✅

### 1.1 정규화 (Normalization)
- **3정규형 준수**: 테이블이 적절히 분리되어 중복 데이터 최소화
- **외래키 관계 명확**: 테이블 간 관계가 명확하게 정의됨
- **예시**:
  ```
  ✓ 멘토 정보 (MENTOR_PROFILES)
  ✓ 멘토 인증 정보 (MENTOR_VERIFICATIONS) - 분리됨
  ✓ 멘토 갤러리 (GALLERY_IMAGES) - 분리됨
  ```

### 1.2 제약 조건 (Constraints)
- **UNIQUE 제약**: `(userId, isDeleted)` 복합 제약으로 중복 방지
- **외래키 제약**: 데이터 무결성 보장
- **논리적 삭제**: `isDeleted` 플래그로 감사 추적 가능

### 1.3 타임스탬프
- **createdAt, updatedAt**: 모든 테이블에 포함되어 감사 추적 가능
- **verifiedAt**: 인증 시간 기록

### 1.4 비즈니스 로직 반영
- **consultationType**: 상담 종류별 요금 관리 가능
- **verificationStatus**: 멘토 인증 상태 관리
- **status**: 예약 상태 추적

---

## 2. 개선 가능한 점 ⚠️

### 2.1 **인덱싱 전략 부족**
**현재 상태**: 명시적 인덱스 정의 없음

**문제점**:
```sql
-- 이런 쿼리가 느릴 수 있음
SELECT * FROM bookings 
WHERE mentorId = 1 AND status = 'pending' 
ORDER BY scheduledAt DESC;

-- 이런 쿼리도 느릴 수 있음
SELECT * FROM messages 
WHERE recipientId = 1 AND isRead = false;
```

**권장사항**:
```sql
-- 필요한 인덱스
CREATE INDEX idx_bookings_mentorId_status ON bookings(mentorId, status);
CREATE INDEX idx_messages_recipientId_isRead ON messages(recipientId, isRead);
CREATE INDEX idx_mentor_profiles_userId_isDeleted ON mentor_profiles(userId, isDeleted);
CREATE INDEX idx_bookings_scheduledAt ON bookings(scheduledAt);
CREATE INDEX idx_reviews_mentorId ON reviews(mentorId);
```

### 2.2 **denormalization 고려 부족**
**현재 상태**: 완전히 정규화됨

**문제점**:
```sql
-- 이런 쿼리는 여러 테이블 조인 필요
SELECT b.*, u.name, m.university, m.field
FROM bookings b
JOIN users u ON b.studentId = u.id
JOIN mentor_profiles m ON b.mentorId = m.userId
WHERE b.mentorId = 1;
```

**개선 방안** (선택적):
```
MENTOR_PROFILES 테이블에 캐시 필드 추가:
- averageRating (이미 있음 ✓)
- reviewCount (이미 있음 ✓)
- totalBookings (추가 고려)
- responseTime (추가 고려)
```

### 2.3 **데이터 타입 최적화**
**현재 상태**: 대부분 적절하나 개선 가능

**개선 제안**:
```
BOOKINGS.totalAmount
- 현재: decimal (무제한)
- 개선: decimal(10, 2) - 최대 99,999,999.99

REVIEWS.rating
- 현재: int (무제한)
- 개선: tinyint (1-5 범위)

MENTOR_PROFILES.averageRating
- 현재: decimal (무제한)
- 개선: decimal(3, 2) - 0.00 ~ 5.00
```

### 2.4 **파티셔닝 미계획**
**현재 상태**: 파티셔닝 전략 없음

**고려사항** (대규모 데이터 시):
```
MESSAGES 테이블 - 시간 기반 파티셔닝
- 월별 파티션: messages_2026_01, messages_2026_02, ...
- 이유: 메시지는 계속 증가하므로 쿼리 성능 저하

BOOKINGS 테이블 - 상태 기반 파티셔닝
- bookings_pending, bookings_completed, ...
- 이유: 완료된 예약은 자주 조회하지 않음
```

### 2.5 **캐싱 전략 부재**
**현재 상태**: 캐싱 고려 없음

**권장사항**:
```
자주 조회되는 데이터:
1. 멘토 목록 (필터링 포함)
   - Redis 캐시: 1시간 TTL
   
2. 멘토 프로필 상세
   - Redis 캐시: 30분 TTL
   
3. 리뷰 및 평점
   - Redis 캐시: 1시간 TTL
   
4. 사용자 정보
   - Redis 캐시: 세션 기간
```

### 2.6 **소프트 삭제 전략**
**현재 상태**: MENTOR_PROFILES에만 적용

**개선 제안**:
```
다른 테이블에도 적용 고려:
- BOOKINGS: isDeleted (취소된 예약 추적)
- REVIEWS: isDeleted (삭제된 리뷰 추적)
- MESSAGES: isDeleted (삭제된 메시지 추적)

장점:
✓ 감사 추적
✓ 실수로 삭제한 데이터 복구 가능
✓ 통계 데이터 정확성
```

### 2.7 **아카이빙 전략 미흡**
**현재 상태**: 오래된 데이터 관리 전략 없음

**권장사항**:
```
1년 이상 된 데이터:
- MESSAGES: 아카이브 테이블로 이동
- BOOKINGS (completed): 아카이브 테이블로 이동
- REVIEWS: 아카이브 테이블로 이동

이유:
✓ 활성 테이블 크기 감소 → 쿼리 성능 향상
✓ 백업 시간 단축
✓ 스토리지 비용 절감
```

---

## 3. 현재 스키마의 성능 예측

### 예상 성능 (사용자 수 기준)

| 사용자 수 | 성능 | 개선 필요 |
|---------|------|---------|
| 1,000 | ✅ 우수 | 불필요 |
| 10,000 | ✅ 양호 | 인덱싱 권장 |
| 100,000 | ⚠️ 주의 | 인덱싱 + 캐싱 필요 |
| 1,000,000+ | ❌ 개선 필수 | 파티셔닝 + 캐싱 + 아카이빙 필수 |

---

## 4. 우선순위별 개선 로드맵

### Phase 1: 즉시 적용 (현재)
```
1. 인덱스 추가
   - 예상 효과: 쿼리 성능 50-80% 향상
   - 구현 난이도: 낮음
   - 시간: 1-2시간

2. 데이터 타입 최적화
   - 예상 효과: 스토리지 10-15% 절감
   - 구현 난이도: 낮음
   - 시간: 1시간
```

### Phase 2: 중기 (사용자 10,000명 이상)
```
1. Redis 캐싱 도입
   - 예상 효과: 응답 시간 70-90% 단축
   - 구현 난이도: 중간
   - 시간: 5-10시간

2. 소프트 삭제 확대
   - 예상 효과: 감사 추적 강화
   - 구현 난이도: 중간
   - 시간: 3-5시간
```

### Phase 3: 장기 (사용자 100,000명 이상)
```
1. 테이블 파티셔닝
   - 예상 효과: 쿼리 성능 30-50% 향상
   - 구현 난이도: 높음
   - 시간: 10-20시간

2. 데이터 아카이빙
   - 예상 효과: 활성 테이블 크기 50-70% 감소
   - 구현 난이도: 높음
   - 시간: 10-15시간
```

---

## 5. 최종 평가

### 현재 상태
- **정규화**: ✅ 우수
- **제약 조건**: ✅ 우수
- **타임스탐프**: ✅ 우수
- **인덱싱**: ⚠️ 부족
- **캐싱**: ❌ 미흡
- **파티셔닝**: ❌ 미계획
- **아카이빙**: ❌ 미계획

### 결론
**현재 스키마는 소규모~중규모 서비스(사용자 10,000명 이하)에 최적화되어 있습니다.**

- ✅ 설계 원칙이 잘 지켜짐
- ✅ 비즈니스 요구사항 반영 잘됨
- ⚠️ 대규모 확장을 위한 준비 필요
- 💡 Phase 1 개선만으로도 상당한 성능 향상 가능

### 다음 단계
1. **즉시**: 인덱스 추가 (1-2시간)
2. **중기**: 캐싱 도입 (사용자 증가 시)
3. **장기**: 파티셔닝 + 아카이빙 (대규모 확장 시)
