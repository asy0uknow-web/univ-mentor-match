# profileStatus 필드 추가 - 장단점 분석

## 장점 (Advantages)

### 1. 프로필 히스토리 추적 가능
```sql
-- 사용자의 모든 프로필 버전 조회
SELECT * FROM mentor_profiles 
WHERE userId = 1 
ORDER BY createdAt DESC;

-- 결과:
-- id=120001, profileStatus='active' (현재)
-- id=1, profileStatus='archived' (이전)
```
**이점**: 사용자가 언제 프로필을 변경했는지, 어떤 정보를 수정했는지 추적 가능

### 2. 프로필 복구 기능 구현 가능
```sql
-- 이전 프로필로 복구
UPDATE mentor_profiles 
SET profileStatus = 'active' 
WHERE id = 1 AND userId = 1;

UPDATE mentor_profiles 
SET profileStatus = 'archived' 
WHERE id = 120001 AND userId = 1;
```
**이점**: 실수로 삭제한 프로필을 복구할 수 있음

### 3. 데이터 손실 방지
- 프로필을 물리적으로 삭제하지 않고 논리적으로만 삭제 (Soft Delete)
- 데이터 감사(audit) 및 규정 준수(compliance) 요구사항 충족

### 4. 유연한 쿼리 작성
```sql
-- 현재 활성 프로필만 조회 (기본)
SELECT * FROM mentor_profiles 
WHERE profileStatus = 'active';

-- 특정 사용자의 현재 프로필만 조회
SELECT * FROM mentor_profiles 
WHERE userId = 1 AND profileStatus = 'active';

-- 모든 프로필 조회 (관리자용)
SELECT * FROM mentor_profiles;
```

### 5. userId 유지로 관계 추적 용이
- 같은 사람의 프로필을 userId로 쉽게 추적
- 사용자의 프로필 변경 이력 분석 가능

### 6. 비즈니스 인사이트 수집
```sql
-- 프로필을 몇 번 수정했는가?
SELECT userId, COUNT(*) as profileCount 
FROM mentor_profiles 
GROUP BY userId;

-- 평균 프로필 수정 횟수
SELECT AVG(profileCount) 
FROM (
  SELECT COUNT(*) as profileCount 
  FROM mentor_profiles 
  GROUP BY userId
) t;
```

---

## 단점 (Disadvantages)

### 1. 데이터베이스 용량 증가
- 삭제된 프로필도 계속 저장됨
- 시간이 지날수록 불필요한 데이터 누적
- 예: 1000명의 멘토가 각각 5번씩 프로필 수정 → 5000개 레코드 저장

**영향도**: 중간 (수백만 레코드 수준에서 눈에 띔)

### 2. 쿼리 복잡도 증가
**현재 (UNIQUE 제약 있을 때):**
```sql
SELECT * FROM mentor_profiles WHERE userId = 1;
-- 결과: 1개 (명확함)
```

**변경 후 (profileStatus 필드):**
```sql
SELECT * FROM mentor_profiles 
WHERE userId = 1 AND profileStatus = 'active';
-- 모든 쿼리에 profileStatus 조건 추가 필요
```

**문제점**:
- 개발자가 `profileStatus = 'active'` 조건을 빠뜨릴 수 있음
- 버그 발생 가능성 증가

### 3. 데이터 일관성 유지의 어려움
```sql
-- 문제 상황: 같은 userId에 'active' 프로필이 2개 존재
SELECT * FROM mentor_profiles 
WHERE userId = 1 AND profileStatus = 'active';

-- 결과:
-- id=1, profileStatus='active'
-- id=120001, profileStatus='active'  ← 문제!
```

**해결책 필요**:
- 데이터베이스 제약 추가
- 애플리케이션 로직에서 검증
- 추가 유지보수 비용

### 4. 마이그레이션 복잡도
```sql
-- 기존 데이터 마이그레이션
ALTER TABLE mentor_profiles 
ADD COLUMN profileStatus ENUM('active', 'archived') DEFAULT 'active';

-- 모든 기존 프로필을 'active'로 설정
UPDATE mentor_profiles SET profileStatus = 'active';

-- 문제: 2003yunho의 경우 어느 것을 'active'로 할지?
-- id=1과 id=120001 중 어느 것이 "현재" 프로필인가?
```

### 5. 검색 성능 저하 가능성
```sql
-- 인덱스 필요
CREATE INDEX idx_userId_profileStatus 
ON mentor_profiles(userId, profileStatus);

-- 없으면 매번 전체 테이블 스캔
```

### 6. 관리 부담 증가
- 주기적으로 오래된 프로필 정리 필요
- 데이터 정책 수립 필요 (몇 개까지 보관할 것인가?)
- 모니터링 필요

### 7. 사용자 입장에서의 혼동
- 여러 버전의 프로필이 존재
- UI에서 어느 프로필을 보여줄지 명확히 해야 함
- 실수로 이전 프로필 정보를 보여줄 수 있음

---

## 대안 비교

### 옵션 1: profileStatus 필드 추가 (현재 제안)
| 항목 | 평가 |
|------|------|
| 프로필 히스토리 추적 | ⭐⭐⭐⭐⭐ |
| 구현 복잡도 | ⭐⭐⭐ (중간) |
| 성능 영향 | ⭐⭐⭐ (중간) |
| 유지보수 비용 | ⭐⭐ (높음) |

### 옵션 2: UNIQUE 제약 추가 (현재 상태 개선)
```sql
ALTER TABLE mentor_profiles 
ADD UNIQUE KEY uk_userId (userId);
```
| 항목 | 평가 |
|------|------|
| 프로필 히스토리 추적 | ⭐ (불가능) |
| 구현 복잡도 | ⭐⭐ (낮음) |
| 성능 영향 | ⭐⭐⭐⭐⭐ (없음) |
| 유지보수 비용 | ⭐⭐⭐⭐⭐ (낮음) |

**문제**: 프로필 수정 시 기존 프로필을 삭제하고 새로 생성해야 함 (히스토리 손실)

### 옵션 3: 별도 테이블 생성
```sql
CREATE TABLE mentor_profile_versions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  mentorProfileId INT NOT NULL,
  userId INT NOT NULL,
  university VARCHAR(255),
  major VARCHAR(255),
  ...
  isCurrentVersion BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```
| 항목 | 평가 |
|------|------|
| 프로필 히스토리 추적 | ⭐⭐⭐⭐⭐ |
| 구현 복잡도 | ⭐ (매우 높음) |
| 성능 영향 | ⭐⭐ (조인 필요) |
| 유지보수 비용 | ⭐ (매우 높음) |

---

## 권장사항

### 현재 상황 분석
- 프로필 히스토리가 **비즈니스 요구사항이 아님**
- 단순히 "현재 프로필"과 "삭제된 프로필"만 구분하면 됨
- 복잡도를 최소화하는 것이 중요

### 최적의 선택: **하이브리드 방식**

```sql
-- 1. UNIQUE 제약 추가 (현재 프로필 보장)
ALTER TABLE mentor_profiles 
ADD UNIQUE KEY uk_userId (userId);

-- 2. 논리적 삭제 플래그 추가 (이전 프로필 보관)
ALTER TABLE mentor_profiles 
ADD COLUMN isDeleted BOOLEAN DEFAULT FALSE;

-- 3. 프로필 수정 시 로직
-- - 기존 프로필: isDeleted = TRUE로 표시
-- - 새 프로필: 새로운 레코드 생성 (UNIQUE 제약 자동 만족)
```

**장점**:
- 간단한 구현
- 프로필 히스토리 추적 가능
- 성능 영향 최소
- 유지보수 용이

---

## 결론

| 방식 | 추천도 | 이유 |
|------|--------|------|
| profileStatus 추가 | ⭐⭐⭐ | 기능은 좋지만 복잡도 증가 |
| UNIQUE 제약만 추가 | ⭐⭐ | 히스토리 손실 |
| 하이브리드 (UNIQUE + isDeleted) | ⭐⭐⭐⭐⭐ | 균형잡힌 선택 |
| 별도 테이블 | ⭐ | 과도한 복잡도 |

**최종 권장**: **하이브리드 방식** (UNIQUE 제약 + isDeleted 플래그)
