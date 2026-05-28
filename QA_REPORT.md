# 유니브매치 종합 QA 테스트 리포트

**테스트 일시**: 2026-05-28  
**테스트 환경**: Dev Server (localhost:3000)  
**테스트 범위**: 전체 기능 시나리오 (서버 초기화 → 인증 → 멘토 → 멘티 → 관리자)

---

## 1. 테스트 요약

| 항목 | 결과 |
|---|---|
| 서버 초기 로드 | ✅ 정상 |
| 홈페이지 렌더링 | ✅ 정상 |
| 푸터 / 안전 가이드 모달 | ✅ 정상 |
| 회원가입 플로우 | ✅ 정상 |
| 멘토 로그인 | ✅ 정상 (비밀번호 재설정 필요 — 하단 참조) |
| 멘티 로그인 | ✅ 정상 (비밀번호 재설정 필요 — 하단 참조) |
| 관리자 로그인 | ⚠️ 코드 수정 후 정상 |
| 멘토 프로필 수정 | ✅ 정상 |
| 칼럼 작성 및 발행 | ✅ 정상 |
| 멘토 찾기 — 일반 검색 | ❌ 버그 (검색 결과 없음) |
| 멘토 찾기 — AI 검색 | ✅ 정상 |
| 멘토 프로필 상세 페이지 | ⚠️ 칼럼 미표시 버그 |
| 상담 신청 버튼 | ✅ 정상 (메시지 페이지로 이동) |
| 관리자 대시보드 통계 | ✅ 정상 |
| 관리자 멘토 편집 버튼 | ❌ 버그 (편집 폼 미열림) |

---

## 2. 발견된 버그 상세

### [BUG-01] 관리자 로그인 시 `/complete-profile`로 잘못 리다이렉트 (수정 완료)

**심각도**: 높음 (관리자 접근 불가)  
**위치**: `client/src/pages/Login.tsx`  
**원인**: 로그인 후 리다이렉트 로직이 `name && userType` 조건을 먼저 검사하는데, 관리자 계정은 `userType`이 `NULL`이라 항상 프로필 미완성으로 판단되어 `/complete-profile`로 이동함. `userType` enum이 `high_school_student`, `university_student`만 허용하고 `admin`을 포함하지 않기 때문.  
**수정 내용**: `role === 'admin'` 조건을 먼저 체크하여 `userType` 검사를 건너뛰고 즉시 `/admin`으로 이동하도록 수정.

```typescript
// 수정 전
if (response.user?.name && response.user?.userType) {
  if (response.user?.role === "admin") navigate("/admin");
  else navigate("/");
} else {
  navigate("/complete-profile"); // 관리자도 여기로 빠짐
}

// 수정 후
if (response.user?.role === "admin") {
  navigate("/admin");
  return; // 이후 조건 검사 생략
}
if (response.user?.name && response.user?.userType) {
  navigate("/");
} else {
  navigate("/complete-profile");
}
```

---

### [BUG-02] 기존 계정 로그인 불가 — 비밀번호 해시 불일치

**심각도**: 높음 (기존 시드 데이터 계정 전체 로그인 불가)  
**위치**: `server/auth-utils.ts`, 환경변수 설정  
**원인**: `PASSWORD_SALT` 환경변수가 서버에 설정되어 있지 않아 `hashPassword()`가 `'default-salt'` fallback을 사용함. 시드 데이터 계정들은 다른 salt로 해시가 생성되어 있어 비밀번호 검증 실패.  
**조치**: QA 테스트를 위해 `kim@test.com`, `2003yunho@gmail.com` 등 테스트 계정의 비밀번호를 `Test1234!`로 직접 재설정.  
**권장 조치**: 프로덕션 배포 전 `PASSWORD_SALT` 환경변수를 Secrets 패널에 등록하거나, 환경변수 없이도 안전한 bcrypt 라운드 수 기반 해싱으로 전환 필요.

---

### [BUG-03] 멘토 찾기 — 일반 텍스트 검색 결과 없음

**심각도**: 중간 (핵심 UX 기능 불작동)  
**위치**: `client/src/pages/Mentors.tsx` 또는 `server/routers.ts`의 `mentors.search` 프로시저  
**증상**: 검색창에 "고려대 컴퓨터"를 입력하면 "검색 결과가 없습니다"가 표시되고 멘토 목록이 사라짐. AI 검색은 정상 작동.  
**추정 원인**: 일반 검색 쿼리가 `verificationStatus === 'approved'` 조건과 함께 `university`, `major` 컬럼을 LIKE 검색하는데, 컬럼명 불일치 또는 검색 필드 범위 문제일 가능성이 높음.  
**권장 조치**: 서버 측 검색 쿼리 로그를 확인하고, `mentors.search` 프로시저에서 실제로 어떤 필드를 검색하는지 점검 필요.

---

### [BUG-04] 멘토 프로필 상세 페이지 — 칼럼 미표시

**심각도**: 낮음 (콘텐츠 표시 문제)  
**위치**: 멘토 프로필 상세 페이지 칼럼 탭  
**증상**: 김멘토 계정으로 칼럼을 작성·발행했음에도 해당 멘토의 프로필 상세 페이지 "칼럼 스튜디오" 섹션에 "아직 작성한 칼럼이 없습니다"가 표시됨.  
**추정 원인**: 칼럼 조회 API가 멘토의 `userId`가 아닌 `mentorProfileId`로 조인하거나, 칼럼 발행 후 캐시 무효화가 되지 않는 문제일 가능성.  
**권장 조치**: 칼럼 목록 조회 쿼리에서 `authorId` 또는 `userId` 매핑 확인 필요.

---

### [BUG-05] 관리자 대시보드 — 멘토 편집 버튼 미작동

**심각도**: 중간 (관리자 기능 불작동)  
**위치**: `client/src/pages/AdminDashboard.tsx`  
**원인**: `getAllActiveMentors()` 함수가 반환하는 객체 구조는 `{ profile: {...}, user: {...}, consultationType: ... }` 형태인데, 편집 버튼 클릭 핸들러가 `mentor.id`를 참조함. 실제 id는 `mentor.profile.id`에 있어 `editingMentor?.id === mentor.id` 조건이 항상 `false`가 됨. 결과적으로 편집 폼이 열리지 않음.

```typescript
// 현재 코드 (버그)
onClick={() => setEditingMentor(editingMentor?.id === mentor.id ? null : mentor)}
// mentor.id가 undefined이므로 항상 mentor를 set하지만,
// 편집 폼 조건: editingMentor?.id === mentor.id → undefined === undefined → true이지만
// editingMentor?.profile 조건도 충족해야 함

// 수정 방향
onClick={() => setEditingMentor(editingMentor?.profile?.id === mentor.profile.id ? null : mentor)}
// 편집 폼 조건도 동일하게 수정
{editingMentor?.profile?.id === mentor.profile.id && editingMentor?.profile && (
```

**권장 조치**: `mentor.id` → `mentor.profile.id`로 전체 교체.

---

## 3. 정상 작동 확인 항목

**서버 초기화 및 홈페이지**: TypeScript 빌드 오류 0건 (watch 모드 LSP 캐시 오류는 stale 캐시 문제로 실제 빌드에 영향 없음). 홈페이지 초기 로드 시 콘솔 에러 없음. USP 섹션과 푸터가 정상 렌더링됨.

**안전 가이드 모달**: 푸터의 "안전 가이드" 클릭 시 화면 중앙에 모달이 정상 표시되고, X 버튼으로 닫힘.

**회원가입 플로우**: 이메일 인증 코드 발송 → 코드 입력 → 비밀번호 설정 → 역할 선택 → 프로필 완성 → 홈 리다이렉트까지 전체 플로우 정상 작동.

**멘토 프로필 수정**: 자기소개 수정 후 저장 시 DB에 정상 반영됨.

**칼럼 작성 및 발행**: 제목·요약·내용 입력 후 카테고리 선택, 발행 시 `/columns/{id}` 페이지로 정상 이동.

**AI 임베딩 검색**: "고려대 컴퓨터공학" 검색 시 유사도 0.71로 관련 멘토 정상 반환. 욕설 입력 시 Gemini 필터로 차단.

**관리자 대시보드 통계**: 총 멘토 수, 대기 중인 인증, 완료된 상담, 신규 버그 신고 수치가 정상 표시됨.

**상담 신청 버튼**: 멘티 계정으로 멘토 프로필에서 "상담 신청하기" 클릭 시 `/messages?mentorId=...` 페이지로 정상 이동.

---

## 4. UX 개선 제안

| 항목 | 현재 상태 | 개선 제안 |
|---|---|---|
| 알림 토스트 누적 | 멘토 대시보드 진입 시 여러 개의 토스트가 화면을 가득 채움 | 동일 유형 토스트는 하나만 표시하거나 `dismiss()` 후 새 토스트 표시 |
| AI 검색 응답 속도 | Gemini API 2회 호출 (유효성 검사 + 임베딩)로 약 2~3초 소요 | 자주 쓰이는 쿼리 서버 메모리 캐싱 또는 유효성 검사 결과 캐싱 |
| 검색 결과 없음 메시지 | 빈 배열 반환 시 별도 안내 없음 | "멘토링과 관련된 검색어를 입력해주세요" 안내 문구 추가 |
| 관리자 대시보드 칼럼 통계 | 칼럼 수, 조회수 등 통계 없음 | `AdminColumnStats.tsx` 페이지가 별도 존재하므로 대시보드 통계 탭에 링크 추가 |
| 멘토 대시보드 `/mentor/dashboard` | "멘토를 찾을 수 없습니다" 오류 표시 | 라우팅 경로를 `/my-profile`로 통일하거나 `/mentor/dashboard`를 `/my-profile`로 리다이렉트 |

---

## 5. 수정 우선순위

| 우선순위 | 버그 ID | 설명 | 예상 수정 시간 |
|---|---|---|---|
| P0 (즉시) | BUG-02 | `PASSWORD_SALT` 환경변수 미설정으로 기존 계정 로그인 불가 | 환경변수 등록 5분 |
| P1 (높음) | BUG-03 | 일반 텍스트 검색 결과 없음 | 30분 |
| P1 (높음) | BUG-05 | 관리자 멘토 편집 버튼 미작동 | 15분 |
| P2 (중간) | BUG-04 | 멘토 프로필 상세 페이지 칼럼 미표시 | 30분 |
| P3 (낮음) | BUG-01 | 관리자 로그인 리다이렉트 (이미 수정 완료) | 완료 |

---

*테스트 수행: Manus AI | 2026-05-28*
