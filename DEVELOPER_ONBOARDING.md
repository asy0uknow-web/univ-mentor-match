# 유니브매치 개발자 온보딩 가이드

> **버전**: pt 1.4 | **최종 업데이트**: 2026-02-07 | **작성**: Manus AI

---

## 1. 프로젝트 개요

**유니브매치**는 고등학생이 대학생 멘토와 1:1 상담을 통해 전공 정보를 얻는 매칭 플랫폼입니다. "전공 세분화로 각 전공의 정보는 얕아져갑니다"라는 문제 인식에서 출발하여, 실제 재학생의 경험을 기반으로 한 진로 상담 서비스를 제공합니다.

### 핵심 사용자 흐름

```
고등학생(멘티)                          대학생(멘토)
    │                                      │
    ├─ 회원가입 (userType 선택)             ├─ 회원가입 (userType 선택)
    ├─ 멘토 검색 (분야/지역 필터)           ├─ 멘토 프로필 등록
    ├─ 멘토 상세 페이지 열람               ├─ 학생증 인증 요청 (S3 업로드)
    ├─ 상담 신청 (종류/일시/시간 선택)      ├─ 관리자 승인 대기
    ├─ 메시지로 멘토와 대화                ├─ 상담 신청 수락/거절
    └─ 상담 완료 후 리뷰 작성              └─ 메시지로 멘티와 대화
```

---

## 2. 기술 스택

| 계층 | 기술 | 버전 | 역할 |
|------|------|------|------|
| **프론트엔드** | React | 19.2 | UI 라이브러리 |
| **빌드** | Vite | 7.1 | 번들러 + HMR |
| **스타일** | Tailwind CSS | 4.1 | 유틸리티 CSS |
| **UI 컴포넌트** | Radix UI + shadcn/ui | - | 접근성 기반 컴포넌트 |
| **라우팅** | wouter | 3.3 | 경량 클라이언트 라우터 |
| **상태관리** | TanStack Query + tRPC | 5.90 / 11.6 | 서버 상태 관리 + 타입 안전 RPC |
| **백엔드** | Express | 4.21 | HTTP 서버 |
| **API** | tRPC | 11.6 | 타입 안전 API 레이어 |
| **ORM** | Drizzle ORM | 0.44 | SQL 쿼리 빌더 |
| **DB** | MySQL | - | 관계형 데이터베이스 |
| **인증** | JWT + OAuth (Manus) | - | 사용자 인증 |
| **파일 저장** | AWS S3 | - | 이미지 업로드 |
| **결제** | Stripe | 20.1 | 결제 처리 (현재 비활성) |
| **테스트** | Vitest | 2.1 | 유닛 테스트 |

---

## 3. 프로젝트 구조

```
univ-mentor-match/
├── client/                          # 프론트엔드 (React + Vite)
│   ├── index.html                   # 진입점 HTML (메타 태그, OG 태그)
│   └── src/
│       ├── main.tsx                 # React 앱 마운트
│       ├── App.tsx                  # 라우팅 정의 (wouter Switch)
│       ├── index.css                # Tailwind + 커스텀 CSS 변수
│       ├── const.ts                 # 클라이언트 상수 (로그인 URL 등)
│       │
│       ├── components/
│       │   ├── layout/              # ★ 공통 레이아웃 컴포넌트
│       │   │   ├── Navbar.tsx       #   네비게이션 바 (인증 상태별 분기)
│       │   │   ├── Footer.tsx       #   푸터
│       │   │   ├── PageLayout.tsx   #   페이지 래퍼 (Navbar + Footer + BugReport)
│       │   │   └── index.ts        #   barrel export
│       │   ├── ErrorBoundary.tsx    # 전역 에러 바운더리
│       │   └── ui/                  # shadcn/ui 컴포넌트 (50+ 파일)
│       │
│       ├── pages/                   # ★ 페이지 컴포넌트 (라우트별 1:1 매핑)
│       │   ├── Home.tsx             #   / - 랜딩 페이지
│       │   ├── Mentors.tsx          #   /mentors - 멘토 검색/필터
│       │   ├── MentorDetail.tsx     #   /mentor/:id - 멘토 상세 + 상담 신청
│       │   ├── MentorProfile.tsx    #   /my-profile - 내 프로필 (멘토 등록/수정)
│       │   ├── Bookings.tsx         #   /bookings - 상담 문의 목록
│       │   ├── Messages.tsx         #   /messages - 메시지 대화
│       │   ├── Notifications.tsx    #   /notifications - 알림 목록
│       │   ├── VerifyMentor.tsx     #   /verify-mentor - 멘토 인증 요청
│       │   ├── AdminDashboard.tsx   #   /admin - 관리자 대시보드
│       │   ├── AdminBugReports.tsx  #   /admin/bug-reports - 버그 리포트 관리
│       │   ├── DeleteAccount.tsx    #   /delete-account - 계정 탈퇴
│       │   └── NotFound.tsx         #   404 페이지
│       │
│       ├── lib/                     # 유틸리티
│       │   ├── trpc.ts              #   tRPC 클라이언트 설정
│       │   ├── seo.ts              #   페이지별 메타 태그 설정
│       │   └── utils.ts            #   cn() 클래스 병합 유틸
│       │
│       ├── contexts/
│       │   └── ThemeContext.tsx      # 테마 컨텍스트 (light 고정)
│       │
│       └── hooks/                   # 커스텀 훅
│           ├── useComposition.ts    #   IME 입력 처리
│           ├── useMobile.tsx        #   모바일 감지
│           └── usePersistFn.ts      #   함수 참조 유지
│
├── server/                          # 백엔드 (Express + tRPC)
│   ├── routers.ts                   # ★ tRPC 라우터 정의 (823줄, 12개 도메인)
│   ├── db.ts                        # ★ 데이터베이스 쿼리 함수 (663줄, 40+ 함수)
│   ├── stripe-webhook.ts            # Stripe 웹훅 핸들러
│   ├── storage.ts                   # S3 파일 업로드 헬퍼
│   ├── products.ts                  # 상담 상품 정의
│   ├── _core/                       # 프레임워크 코어 (수정 지양)
│   │   ├── env.ts                   #   환경 변수 + 검증
│   │   ├── oauth.ts                 #   OAuth 인증 흐름
│   │   ├── trpc.ts                  #   tRPC 초기화
│   │   ├── context.ts               #   요청 컨텍스트
│   │   └── ...                      #   기타 내부 모듈
│   └── *.test.ts                    # 테스트 파일 (16개, 72개 테스트)
│
├── drizzle/                         # 데이터베이스
│   ├── schema.ts                    # ★ 테이블 스키마 정의 (8개 테이블)
│   ├── relations.ts                 # 테이블 관계 정의
│   ├── 0000~0009_*.sql              # 마이그레이션 파일
│   └── meta/                        # 마이그레이션 메타데이터
│
├── shared/                          # 프론트/백 공유 코드
│   ├── types.ts                     # 공유 타입 정의
│   ├── const.ts                     # 공유 상수
│   └── _core/errors.ts              # 에러 타입
│
├── todo.md                          # 기능/버그 추적 (전체 히스토리)
├── package.json                     # 의존성 + 스크립트
├── tsconfig.json                    # TypeScript 설정
├── vite.config.ts                   # Vite 빌드 설정
├── vitest.config.ts                 # 테스트 설정
└── drizzle.config.ts                # Drizzle ORM 설정
```

### 핵심 파일 크기 참고

| 파일 | 줄 수 | 비고 |
|------|------:|------|
| `server/routers.ts` | 823 | 12개 도메인의 tRPC 프로시저 |
| `server/db.ts` | 663 | 40+ 데이터베이스 쿼리 함수 |
| `MentorProfile.tsx` | 629 | 멘토 등록/수정 폼 |
| `MentorDetail.tsx` | 505 | 멘토 상세 + 상담 신청 다이얼로그 |
| `Messages.tsx` | 388 | 메시지 대화 UI |
| `AdminDashboard.tsx` | 361 | 관리자 대시보드 |
| `drizzle/schema.ts` | 214 | 8개 테이블 정의 |

---

## 4. 데이터베이스 스키마

8개 테이블로 구성되며, 모든 테이블은 `drizzle/schema.ts`에 정의되어 있습니다.

### 4.1 테이블 관계도

```
users (사용자)
  │
  ├──1:1──→ mentorProfiles (멘토 프로필)
  │              │
  │              ├──1:N──→ mentorGallery (갤러리 이미지)
  │              │
  │              └──1:N──→ bookings (상담 예약) ←──N:1── users (학생)
  │                            │
  │                            └──1:1──→ reviews (리뷰)
  │
  ├──1:N──→ mentorVerifications (인증 요청)
  │
  ├──1:N──→ notifications (알림)
  │
  ├──1:N──→ messages (메시지) ──→ messages (수신)
  │
  └──1:N──→ bugReports (버그 신고)
```

### 4.2 테이블 상세

| 테이블 | 역할 | 주요 컬럼 | 비고 |
|--------|------|-----------|------|
| `users` | 사용자 계정 | `openId`, `userType`, `role`, `stripeCustomerId` | OAuth 기반, `role`은 user/admin |
| `mentor_profiles` | 멘토 프로필 | `userId`(UNIQUE), `university`, `major`, `field`, `region`, `verificationStatus`, `isDeleted` | 소프트 삭제 방식 |
| `bookings` | 상담 예약 | `studentId`, `mentorId`, `consultationType`, `status`, `totalAmount` | 상태: pending/confirmed/completed/cancelled |
| `reviews` | 리뷰 | `bookingId`, `studentId`, `mentorId`, `rating`(1-5) | 상담 완료 후 작성 |
| `notifications` | 알림 | `userId`, `type`, `isRead`, `relatedId` | 5가지 알림 유형 |
| `messages` | 메시지 | `senderId`, `recipientId`, `bookingId`, `isRead` | 상담 신청 시 자동 메시지 |
| `mentor_verifications` | 멘토 인증 | `userId`, `studentIdImageUrl`, `status` | 학생증 이미지 S3 저장 |
| `mentor_gallery` | 갤러리 | `mentorId`, `imageUrl`, `displayOrder` | 멘토 프로필 이미지 |
| `bug_reports` | 버그 신고 | `userId`, `severity`, `status` | 사용자 버그 리포트 |

### 4.3 핵심 비즈니스 규칙

**멘토 프로필 생명주기**는 이 프로젝트에서 가장 복잡한 부분입니다.

```
대학생 회원가입
    │
    ▼
멘토 프로필 등록 (createMentorProfile)
    │  → mentor_profiles 생성 (verificationStatus: "pending")
    │  → mentor_verifications 자동 생성 (status: "pending")
    │
    ▼
학생증 업로드 (uploadStudentId → S3)
    │
    ▼
관리자 승인/거절
    │  → 승인: verificationStatus → "approved" (검색에 노출)
    │  → 거절: verificationStatus → "rejected" (재신청 가능)
    │
    ▼
프로필 삭제 시
    │  → 물리적 삭제 X → isDeleted = true (소프트 삭제)
    │  → 재등록 시 기존 레코드 업데이트 (UNIQUE userId 제약)
```

**상담 신청 흐름**은 결제 없이 메시지 기반으로 동작합니다.

```
학생: 상담 신청 (MentorDetail.tsx)
    │  → booking 생성 (status: "pending")
    │  → 멘토에게 자동 메시지 전송 (상담 종류/일시/금액 포함)
    │  → 멘토에게 알림 전송
    │
    ▼
멘토: 수락/거절 (Messages.tsx 내 버튼)
    │  → 수락: booking.status → "confirmed"
    │  → 거절: booking.status → "cancelled"
    │
    ▼
상담 완료 후
    │  → 학생이 리뷰 작성
    │  → 멘토 평균 평점 자동 업데이트
```

---

## 5. API 구조 (tRPC 라우터)

`server/routers.ts`에 12개 도메인의 tRPC 프로시저가 정의되어 있습니다. 프론트엔드에서는 `trpc.도메인.프로시저명`으로 호출합니다.

### 5.1 라우터 도메인 맵

| 도메인 | 프로시저 | 인증 | 설명 |
|--------|----------|:----:|------|
| **auth** | `me` | 공개 | 현재 로그인 사용자 정보 |
| | `logout` | 공개 | 로그아웃 |
| | `deleteAccount` | 필수 | 계정 삭제 |
| | `setUserType` | 필수 | 사용자 유형 설정 (고등학생/대학생) |
| **mentor** | `createProfile` | 필수 | 멘토 프로필 생성 + 인증 요청 자동 생성 |
| | `getMyProfile` | 필수 | 내 멘토 프로필 조회 |
| | `updateProfile` | 필수 | 멘토 프로필 수정 |
| | `listAll` | 공개 | 승인된 전체 멘토 목록 |
| | `getById` | 공개 | 멘토 상세 정보 (프로필 + 리뷰) |
| | `getMyBookings` | 필수 | 내 상담 예약 목록 (멘토 기준) |
| | `reactivateProfile` | 필수 | 비활성 프로필 재활성화 |
| | `deactivateProfile` | 필수 | 프로필 비활성화 |
| **booking** | `create` | 필수 | 상담 신청 + 자동 메시지 + 알림 |
| | `getById` | 필수 | 예약 상세 조회 |
| | `getMyBookings` | 필수 | 내 상담 예약 목록 (학생 기준) |
| | `updateStatus` | 필수 | 예약 상태 변경 |
| | `acceptBooking` | 필수 | 상담 수락 |
| | `rejectBooking` | 필수 | 상담 거절 |
| | `createCheckoutSession` | 필수 | Stripe 결제 세션 (현재 비활성) |
| **review** | `create` | 필수 | 리뷰 작성 + 평점 자동 계산 |
| | `getByMentor` | 공개 | 멘토별 리뷰 목록 |
| **notification** | `getAll` | 필수 | 알림 목록 |
| | `markAsRead` | 필수 | 알림 읽음 처리 |
| | `getUnreadCount` | 필수 | 읽지 않은 알림 수 |
| **message** | `send` | 필수 | 메시지 전송 |
| | `getConversation` | 필수 | 대화 내역 조회 |
| | `getInbox` | 필수 | 받은 메시지함 |
| | `markAsRead` | 필수 | 메시지 읽음 처리 |
| | `getUnreadCount` | 필수 | 읽지 않은 메시지 수 |
| **verification** | `uploadStudentId` | 필수 | 학생증 이미지 S3 업로드 |
| | `submitVerification` | 필수 | 인증 요청 제출 |
| | `getMyVerification` | 필수 | 내 인증 상태 조회 |
| **admin** | `getPendingVerifications` | 필수 | 대기 중 인증 요청 목록 |
| | `approveVerification` | 필수 | 인증 승인 |
| | `rejectVerification` | 필수 | 인증 거절 |
| | `getAllMentors` | 필수 | 전체 멘토 목록 (관리자) |
| | `updateMentorProfile` | 필수 | 멘토 프로필 수정 (관리자) |
| | `deleteMentorProfile` | 필수 | 멘토 프로필 삭제 (관리자) |
| **mentorSearch** | `getByField` | 공개 | 분야별 멘토 검색 |
| | `getByRegion` | 공개 | 지역별 멘토 검색 |
| | `getByFieldAndRegion` | 공개 | 분야+지역 멘토 검색 |
| **gallery** | `uploadImage` | 필수 | 갤러리 이미지 업로드 |
| | `getByMentorId` | 공개 | 멘토 갤러리 조회 |
| | `deleteImage` | 필수 | 갤러리 이미지 삭제 |
| | `updateOrder` | 필수 | 갤러리 정렬 순서 변경 |
| **bugReport** | `create` | 필수 | 버그 신고 |
| | `getAll` | 공개 | 전체 버그 리포트 목록 |
| | `updateStatus` | 필수 | 버그 상태 변경 (관리자) |

### 5.2 프론트엔드에서 API 호출 예시

```tsx
// 쿼리 (데이터 조회)
const { data: mentors } = trpc.mentor.listAll.useQuery();
const { data: profile } = trpc.mentor.getMyProfile.useQuery();

// 뮤테이션 (데이터 변경)
const createBooking = trpc.booking.create.useMutation({
  onSuccess: () => {
    toast.success("상담이 신청되었습니다!");
    utils.booking.getMyBookings.invalidate();
  },
});
createBooking.mutate({ mentorId: 1, scheduledAt: "2026-03-01", duration: "1", consultationType: "career_counseling" });
```

---

## 6. 페이지별 기능 매핑

### 6.1 라우트 → 페이지 → 주요 기능

| 경로 | 페이지 | 사용자 | 핵심 기능 |
|------|--------|--------|-----------|
| `/` | Home.tsx | 모두 | 랜딩 페이지, 문제 정의 섹션, CTA 버튼 |
| `/mentors` | Mentors.tsx | 모두 | 멘토 검색 (분야/지역 필터, 텍스트 검색, useMemo 필터링) |
| `/mentor/:id` | MentorDetail.tsx | 모두 | 멘토 상세 정보, 상담 신청 다이얼로그, 리뷰 목록 |
| `/my-profile` | MentorProfile.tsx | 로그인 | 멘토 등록/수정 폼, 프로필 관리 |
| `/bookings` | Bookings.tsx | 로그인 | 상담 문의 목록 (멘토: 받은 신청 / 학생: 보낸 신청) |
| `/messages` | Messages.tsx | 로그인 | 대화 목록, 실시간 메시지, 상담 수락/거절 버튼 |
| `/notifications` | Notifications.tsx | 로그인 | 알림 목록, 읽음 처리 |
| `/verify-mentor` | VerifyMentor.tsx | 멘토 | 학생증 업로드, 인증 상태 확인, 재신청 |
| `/admin` | AdminDashboard.tsx | 관리자 | 멘토 관리, 인증 승인/거절 |
| `/admin/bug-reports` | AdminBugReports.tsx | 관리자 | 버그 리포트 관리 |
| `/delete-account` | DeleteAccount.tsx | 로그인 | 계정 탈퇴 확인 |

### 6.2 공통 레이아웃 구조

모든 페이지는 `PageLayout` 컴포넌트로 감싸져 있으며, 다음 구조를 공유합니다.

```tsx
<PageLayout>        // client/src/components/layout/PageLayout.tsx
  <Navbar />        // 네비게이션 바 (인증 상태별 분기)
  {children}        // 페이지 고유 콘텐츠
  <Footer />        // 푸터
  <BugReportModal/> // 버그 신고 모달 (Navbar 메뉴에서 트리거)
</PageLayout>
```

**Navbar 인증 상태별 분기:**
- **로그인 상태**: 멘토 찾기, 상담 문의, 내 프로필, 알림 + 메뉴 드롭다운 (버그 신고, 로그아웃, 계정 탈퇴)
- **비로그인 상태**: 로그인 버튼 + 회원가입 버튼

---

## 7. 상담 가격 정책

상담 종류별 기본 1시간 비용 + 추가 시간 비용 구조입니다. `MentorDetail.tsx`에 하드코딩되어 있습니다.

| 상담 종류 | 기본 1시간 | 추가 30분당 |
|-----------|----------:|----------:|
| 생기부 컨설팅 | 50,000원 | 25,000원 |
| 진로상담 | 30,000원 | 15,000원 |
| 학업관리 | 40,000원 | 20,000원 |
| 대학탐방 | 50,000원 | 25,000원 |

---

## 8. 인증 흐름

Manus OAuth 기반 인증을 사용합니다. `server/_core/oauth.ts`에서 처리됩니다.

```
사용자 → 로그인 버튼 클릭
    │
    ▼
Manus OAuth 서버로 리다이렉트
    │
    ▼
OAuth 콜백 → JWT 토큰 발급 → 쿠키 저장
    │
    ▼
프론트엔드: useAuth() 훅으로 인증 상태 확인
    │  → trpc.auth.me 쿼리로 사용자 정보 조회
    │
    ▼
최초 로그인 시 userType 미설정
    │  → Home.tsx에서 역할 선택 다이얼로그 표시
    │  → "고등학생" 또는 "대학생" 선택
```

---

## 9. 파일 업로드 (S3)

`server/storage.ts`에 S3 헬퍼 함수가 정의되어 있습니다.

```typescript
// 업로드
const { key, url } = await storagePut(`verification/${userId}/${filename}`, buffer, "image/jpeg");

// 다운로드 URL 생성 (presigned)
const { url } = await storageGet(`verification/${userId}/${filename}`, 3600);
```

**사용처:**
- 멘토 학생증 이미지 업로드 (`verification.uploadStudentId`)
- 멘토 갤러리 이미지 업로드 (`gallery.uploadImage`)

---

## 10. 테스트 구조

16개 테스트 파일, 72개 테스트 케이스가 `server/` 디렉토리에 있습니다.

| 테스트 파일 | 테스트 수 | 대상 |
|-------------|:---------:|------|
| `booking-accept-reject.test.ts` | 8 | 상담 수락/거절 |
| `new-pricing-policy.test.ts` | 6 | 새 가격 정책 |
| `verification.test.ts` | 6 | 멘토 인증 |
| `consultation-pricing.test.ts` | 5 | 상담 가격 계산 |
| `consultation-request.test.ts` | 5 | 상담 신청 |
| `mentor-deletion-reregistration.test.ts` | 5 | 멘토 삭제/재등록 |
| `mentor-resubmit-verification.test.ts` | 5 | 인증 재신청 |
| `message.test.ts` | 5 | 메시지 |
| `search-gallery.test.ts` | 5 | 검색/갤러리 |
| `mentor.test.ts` | 4 | 멘토 기본 |
| `mentor-registration.test.ts` | 4 | 멘토 등록 |
| `gallery-upload-auth.test.ts` | 4 | 갤러리 권한 |
| `s3-upload.test.ts` | 4 | S3 업로드 |
| `mentor-profile-upsert.test.ts` | 3 | 프로필 Upsert |
| `admin.test.ts` | 2 | 관리자 |
| `auth.logout.test.ts` | 1 | 로그아웃 |

**테스트 실행:**

```bash
pnpm test          # 전체 테스트
pnpm test -- --run # CI 모드 (watch 없이)
```

---

## 11. 개발 환경 설정

### 11.1 로컬 개발 서버 시작

```bash
cd /home/ubuntu/univ-mentor-match
pnpm install
pnpm dev           # Vite dev server (포트 3000)
```

### 11.2 데이터베이스 마이그레이션

```bash
pnpm db:push       # 스키마 변경 → 마이그레이션 생성 → 적용
```

### 11.3 환경 변수

`server/_core/env.ts`에서 관리됩니다. 주요 환경 변수는 다음과 같습니다.

| 변수 | 용도 | 위치 |
|------|------|------|
| `JWT_SECRET` | JWT 토큰 서명 | 서버 |
| `OAUTH_SERVER_URL` | OAuth 서버 URL | 서버 |
| `STRIPE_SECRET_KEY` | Stripe 시크릿 키 | 서버 |
| `STRIPE_WEBHOOK_SECRET` | Stripe 웹훅 시크릿 | 서버 |
| `VITE_APP_TITLE` | 앱 제목 | 클라이언트 |
| `VITE_APP_LOGO` | 앱 로고 URL | 클라이언트 |
| `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe 공개 키 | 클라이언트 |
| `VITE_OAUTH_PORTAL_URL` | OAuth 포털 URL | 클라이언트 |

---

## 12. 알려진 제한사항 및 기술 부채

### 12.1 현재 제한사항

| 항목 | 상태 | 설명 |
|------|------|------|
| **서버 코드 단일 파일** | 기술 부채 | `routers.ts`(823줄), `db.ts`(663줄)가 도메인별로 분리되지 않음 |
| **관리자 라우트 인증** | 보안 주의 | `/admin` 라우트에 서버 측 관리자 권한 검증이 불완전 |
| **실시간 알림** | 미구현 | WebSocket/SSE 미적용, 폴링 방식 |
| **갤러리 UI** | 미완성 | 갤러리 이미지 업로드 UI, 그리드 표시 UI 미구현 |
| **결제 시스템** | 비활성 | Stripe 연동 코드 존재하나 현재 상담 신청은 무료 |
| **멘토 찾기 버그** | 미해결 | DB에 멘토 존재하나 검색 결과에 안 뜨는 케이스 존재 가능 |

### 12.2 리팩토링 로드맵

1. **서버 도메인 분리**: `routers.ts` → `routers/mentor.ts`, `routers/booking.ts` 등
2. **DB 레포지토리 분리**: `db.ts` → `repositories/mentor.ts`, `repositories/booking.ts` 등
3. **에러 바운더리 세분화**: 페이지별 ErrorBoundary 추가
4. **로딩 스켈레톤 UI**: 데이터 로딩 중 스켈레톤 표시
5. **E2E 테스트**: Playwright 기반 사용자 시나리오 테스트

---

## 13. 버전 히스토리

| 버전 | 주요 변경사항 |
|------|-------------|
| pt 0.6 | 상담 예약 UI 개선, 가격 정책 변경 |
| pt 0.7 | 네비게이션 바 통일, 버그 신고 기능 |
| pt 0.8 | 홈페이지 UI 개선, 모바일 반응형 |
| pt 0.9 | 비로그인 네비게이션, 문제 정의 섹션 개선 |
| pt 1.0 | 프로덕션급 리팩토링 (Navbar/Footer/PageLayout 추출) |
| pt 1.1 | 메타 태그 개편 (카톡 공유 최적화) |
| pt 1.2 | 전체 페이지 메타 태그 적용 |
| pt 1.3 | 초록색 scrollbar 제거 |
| **pt 1.4** | **시니어 리뷰어 패치 적용 (에러 처리, 환경 변수 검증, 메뉴 중복 제거, API 최적화, 접근성)** |

---

## 14. 자주 묻는 질문 (FAQ)

**Q: 새 페이지를 추가하려면?**

1. `client/src/pages/NewPage.tsx` 생성
2. `PageLayout`으로 감싸기
3. `client/src/App.tsx`의 `Switch`에 `<Route>` 추가
4. 필요시 `lib/seo.ts`에 메타 태그 추가

**Q: 새 API 엔드포인트를 추가하려면?**

1. `drizzle/schema.ts`에 테이블 추가 (필요시)
2. `server/db.ts`에 쿼리 함수 추가
3. `server/routers.ts`에 tRPC 프로시저 추가
4. `pnpm db:push`로 마이그레이션 실행
5. 프론트엔드에서 `trpc.도메인.프로시저명`으로 호출

**Q: 멘토가 검색에 안 뜨는 이유는?**

`mentorProfiles.verificationStatus`가 `"approved"`이고 `isDeleted`가 `false`이며 `isActive`가 `true`인 경우에만 검색 결과에 노출됩니다. 관리자 대시보드(`/admin`)에서 인증 상태를 확인하세요.

**Q: `_core/` 디렉토리는 수정해도 되나요?**

`server/_core/`와 `client/src/_core/`는 프레임워크 코어 코드입니다. 가급적 수정하지 마세요. 환경 변수 검증(`env.ts`)은 예외적으로 수정 가능합니다.

---

> **이 문서에 대한 질문이나 수정 사항이 있으면 `todo.md`에 이슈를 추가해주세요.**
