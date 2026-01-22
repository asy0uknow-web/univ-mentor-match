# 2003yunho 멘토 프로필 검색 불가 문제 해결 보고서

## 문제 상황

2003yunho의 멘토 프로필이 멘토 리스트에 표시되지 않았습니다.

---

## 원인 분석

### 발견된 데이터 불일치

2003yunho는 2개의 멘토 프로필을 가지고 있었습니다:

| 항목 | 프로필 1 (ID: 1) | 프로필 2 (ID: 120001) |
|------|-----------------|----------------------|
| **대학** | 한국대학교 | Test University |
| **전공** | 학과공학과 | Computer Science |
| **isActive** | 1 (활성화) | 1 (활성화) |
| **isDeleted** | 1 (삭제됨) | 0 (삭제 안 됨) |
| **프로필의 verificationStatus** | rejected | **rejected** ← 문제! |
| **인증 기록의 상태** | rejected | **approved** ← 불일치! |

### 핵심 문제

**프로필 2 (ID: 120001)**:
- 멘토 프로필 테이블의 `verificationStatus` = "rejected"
- 멘토 인증 기록 테이블의 `status` = "approved"
- **두 데이터가 동기화되지 않았음!**

### 멘토 리스트 표시 조건

멘토가 리스트에 표시되려면:
```
isActive = 1 
AND verificationStatus = 'approved'  ← 프로필 테이블에서 확인
AND isDeleted = 0
```

프로필 2는 `verificationStatus = 'rejected'`였기 때문에 조건을 만족하지 못했습니다.

---

## 해결 방법

### 실행한 조치

프로필 2 (ID: 120001)의 `verificationStatus`를 "rejected"에서 **"approved"로 업데이트**

```sql
UPDATE mentor_profiles 
SET verificationStatus = 'approved' 
WHERE id = 120001;
```

### 결과

**✅ 문제 해결 완료**

- 프로필 2의 verificationStatus: rejected → **approved**
- 멘토 리스트 조회 결과: **2003yunho 프로필 표시됨**

```
=== 멘토 리스트 조회 결과 ===
총 2명의 멘토가 검색됨

1. Test University - Computer Science
   이메일: 2003yunho@gmail.com
   프로필 ID: 120001
   ✅ 표시됨

2. 고려대학교 - 데이터과학과
   이메일: yjh032201@gmail.com
   프로필 ID: 30001
```

---

## 근본 원인

### 왜 이런 불일치가 발생했을까?

멘토 인증 프로세스에서:

1. 사용자가 멘토 인증 신청 → `mentor_verifications` 테이블에 기록 생성
2. 관리자가 인증 승인 → `mentor_verifications.status` = "approved"로 업데이트
3. **하지만** → `mentor_profiles.verificationStatus`는 자동으로 업데이트되지 않음

이는 두 테이블 간의 동기화 메커니즘이 없었기 때문입니다.

---

## 개선 제안

### 1. 백엔드 로직 개선 (권장)

멘토 인증 승인 시 프로필도 함께 업데이트하도록 수정:

```typescript
// server/routers.ts - admin.approveMentorVerification
export async function approveMentorVerification(verificationId: number) {
  // 1. 인증 기록 업데이트
  await db.update(mentorVerifications)
    .set({ status: 'approved' })
    .where(eq(mentorVerifications.id, verificationId));
  
  // 2. 프로필도 함께 업데이트 (추가 필요)
  const verification = await getMentorVerificationById(verificationId);
  await db.update(mentorProfiles)
    .set({ verificationStatus: 'approved' })
    .where(eq(mentorProfiles.userId, verification.userId));
}
```

### 2. 데이터 동기화 스크립트

정기적으로 실행하여 불일치 자동 수정:

```sql
-- 최신 인증 상태로 프로필 동기화
UPDATE mentor_profiles mp
SET mp.verificationStatus = (
  SELECT mv.status 
  FROM mentor_verifications mv 
  WHERE mv.userId = mp.userId 
  ORDER BY mv.verifiedAt DESC 
  LIMIT 1
)
WHERE EXISTS (
  SELECT 1 FROM mentor_verifications mv 
  WHERE mv.userId = mp.userId
);
```

---

## 최종 상태

| 항목 | 상태 |
|------|------|
| **2003yunho 프로필** | ✅ 멘토 리스트에 표시됨 |
| **프로필 정보** | Test University, Computer Science |
| **인증 상태** | ✅ Approved |
| **활성화 상태** | ✅ Active |
| **검색 가능** | ✅ 예 |

