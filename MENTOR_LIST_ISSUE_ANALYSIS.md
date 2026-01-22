# 2003yunho가 멘토 리스트에 표시되지 않는 이유

## 결론: ❌ 인증 상태가 "rejected"(거절됨)이기 때문입니다.

---

## 상세 분석

### 1. 2003yunho의 멘토 프로필 현황

| 항목 | 프로필 1 | 프로필 2 |
|------|---------|---------|
| **ID** | 1 | 120001 |
| **대학** | 한국대학교 | Test University |
| **전공** | 학과공학과 | Computer Science |
| **활성화 (isActive)** | ✅ 1 (활성화) | ✅ 1 (활성화) |
| **인증 상태 (verificationStatus)** | ❌ rejected | ❌ rejected |
| **삭제됨 (isDeleted)** | ❌ 1 (삭제됨) | ✅ 0 (삭제 안 됨) |

### 2. 멘토 리스트 표시 조건

멘토가 멘토 리스트에 표시되려면 **3가지 조건을 모두 만족**해야 합니다:

```typescript
// server/db.ts - getAllActiveMentors() 함수
where(
  and(
    eq(mentorProfiles.isActive, true),           // 조건 1: 활성화 = true
    eq(mentorProfiles.verificationStatus, "approved"),  // 조건 2: 인증 상태 = "approved"
    eq(mentorProfiles.isDeleted, false)          // 조건 3: 삭제됨 = false
  )
)
```

### 3. 2003yunho의 조건 검사 결과

#### 프로필 1 (ID: 1)
- ✅ isActive = 1 (활성화됨)
- ❌ **verificationStatus = "rejected"** ← **불만족**
- ❌ isDeleted = 1 (삭제됨) ← **불만족**
- **결과: 표시 안 됨 ❌**

#### 프로필 2 (ID: 120001)
- ✅ isActive = 1 (활성화됨)
- ❌ **verificationStatus = "rejected"** ← **불만족**
- ✅ isDeleted = 0 (삭제 안 됨)
- **결과: 표시 안 됨 ❌**

---

## 원인 설명

### 주요 원인: 인증 상태가 "rejected"

2003yunho의 두 멘토 프로필 모두 인증 상태가 **"rejected"(거절됨)**입니다.

멘토 리스트는 **승인된 멘토만** 표시하도록 설계되어 있습니다. 이는 다음과 같은 이유 때문입니다:

1. **신뢰성 보장**: 검증된 멘토만 학생에게 노출되어야 함
2. **품질 관리**: 부정확한 정보를 가진 멘토 필터링
3. **사기 방지**: 미인증 계정으로부터 학생 보호

### 인증 거절 사유

멘토 인증 거절 기록:

```
프로필 1 (ID: 1)
- 상태: rejected
- 거절 사유: "학생증이 명확하지 않습니다."
- 거절 시간: 2026-01-22 16:10:18
```

---

## 해결 방법

2003yunho가 멘토 리스트에 표시되려면 다음 중 하나를 수행해야 합니다:

### 옵션 1: 멘토 인증 재신청 (권장)
1. 명확한 학생증 사진으로 다시 인증 신청
2. 관리자가 검토 후 승인
3. verificationStatus가 "approved"로 변경되면 자동으로 리스트에 표시됨

### 옵션 2: 관리자가 직접 승인
```sql
UPDATE mentor_verifications 
SET status = 'approved' 
WHERE userId = 1 AND id = 120001;
```

### 옵션 3: 새로운 프로필로 재등록
- 현재 프로필 삭제
- 명확한 정보로 새로운 프로필 등록
- 인증 신청 및 승인 대기

---

## 관련 코드

### 멘토 리스트 조회 함수 (server/db.ts)

```typescript
export async function getAllActiveMentors() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      profile: mentorProfiles,
      user: users,
    })
    .from(mentorProfiles)
    .innerJoin(users, eq(mentorProfiles.userId, users.id))
    .where(
      and(
        eq(mentorProfiles.isActive, true),
        eq(mentorProfiles.verificationStatus, "approved"),  // ← 여기서 필터링
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .orderBy(desc(mentorProfiles.averageRating));
  
  return result;
}
```

---

## 요약

| 항목 | 내용 |
|------|------|
| **문제** | 2003yunho가 멘토 리스트에 표시되지 않음 |
| **원인** | 인증 상태가 "rejected"(거절됨) |
| **필요한 상태** | verificationStatus = "approved" |
| **현재 상태** | verificationStatus = "rejected" |
| **해결 방법** | 명확한 학생증으로 다시 인증 신청 |
