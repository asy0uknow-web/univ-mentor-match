# 멘토 재등록 버그 분석

## 문제 요약
2003yunho(userId=1)가 재등록했지만 멘토 리스트에 보이지 않음.

## DB 상태
- mentor_profiles: 2개 레코드 (id=1: isDeleted=1, id=120001: isDeleted=0, verificationStatus='rejected')
- mentor_verifications: 3개 레코드 (id=1: rejected, id=2: approved, id=120001: approved)

## 근본 원인 (3가지 버그)

### 버그 1: createMentorProfile - 재등록 시 verificationStatus 리셋 안 됨
- `createMentorProfile()`에서 기존 프로필이 있으면 업데이트하지만, `verificationStatus`를 `pending`으로 리셋하지 않음
- 결과: 재등록해도 이전의 `rejected` 상태가 유지됨

### 버그 2: updateMentorProfile - userId 기준 업데이트가 모든 레코드에 적용
- `updateMentorProfile(userId, updates)` 함수가 `WHERE userId = ?`로 업데이트
- userId=1에 대해 2개 레코드(id=1, id=120001)가 모두 업데이트됨
- 결과: 삭제된 프로필(id=1)도 함께 업데이트됨

### 버그 3: approveMentorVerification - 프로필 업데이트 시 isDeleted 미고려
- `approveMentorVerification()`에서 `WHERE userId = ?`로 프로필 업데이트
- 삭제된 프로필과 활성 프로필 모두 업데이트됨
- 하지만 실제로는 활성 프로필(isDeleted=false)만 업데이트해야 함

## 수정 계획

### 1. createMentorProfile 수정
- 재등록 시 verificationStatus를 'pending'으로 리셋
- isDeleted를 false로 설정
- isActive를 true로 설정

### 2. updateMentorProfile 수정
- isDeleted=false 조건 추가하여 활성 프로필만 업데이트

### 3. approveMentorVerification / rejectMentorVerification 수정
- isDeleted=false 조건 추가하여 활성 프로필만 업데이트

### 4. createProfile 라우터 수정
- 재등록 시 새 인증 요청을 반드시 생성하도록 수정
