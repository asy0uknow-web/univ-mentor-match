# 유니브매치 (Univ-Mentor-Match) 프로젝트 정리

**프로젝트명**: 유니브매치 (대학 멘토 매칭 플랫폼)  
**현재 버전**: pt 1.0 (프로덕션급 리팩토링 완료)  
**마지막 업데이트**: 2026년 2월 7일

---

## 📋 프로젝트 개요

**유니브매치**는 고등학생이 대학생 멘토와 1:1로 상담하는 플랫폼입니다. 입시 후 전공 선택의 고민을 실제 재학생과 대화하며 해결할 수 있도록 설계되었습니다.

### 핵심 가치
- **실제 경험 공유**: 학과 정보가 아닌 실제 대학 생활 경험 제공
- **신뢰할 수 있는 멘토**: 학생증 인증을 통한 검증된 멘토만 참여
- **효율적인 매칭**: 전공/지역별 필터링을 통한 빠른 멘토 찾기

---

## 🏗️ 기술 스택

### 프론트엔드
- **프레임워크**: React 19.2 + Vite 7.1
- **상태관리**: TanStack React Query 5.90 + tRPC 11.6
- **UI 라이브러리**: Radix UI (완전한 헤드리스 컴포넌트)
- **스타일링**: Tailwind CSS 4.1 + Tailwind Animate
- **라우팅**: Wouter 3.3 (경량 라우터)
- **폼**: React Hook Form 7.64 + Zod 4.1 (타입 안전 검증)
- **아이콘**: Lucide React 0.453
- **애니메이션**: Framer Motion 12.23

### 백엔드
- **런타임**: Node.js (Express 4.21)
- **API 프레임워크**: tRPC 11.6 (타입 안전 RPC)
- **데이터베이스**: MySQL 8.0 + Drizzle ORM 0.44
- **인증**: JWT (jose 6.1)
- **파일 저장**: AWS S3 (AWS SDK 3.693)
- **결제**: Stripe 20.1

### 개발 도구
- **언어**: TypeScript 5.9
- **번들러**: Vite 7.1 (프론트) + esbuild 0.25 (서버)
- **테스트**: Vitest 2.1
- **포매팅**: Prettier 3.6 + ESLint
- **DB 마이그레이션**: Drizzle Kit 0.31

---

## 📁 프로젝트 구조

```
univ-mentor-match/
├── client/                          # 프론트엔드 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/              # 공통 레이아웃 컴포넌트
│   │   │   │   ├── Navbar.tsx       # 네비게이션 바 (단일 소스)
│   │   │   │   ├── Footer.tsx       # 푸터
│   │   │   │   ├── PageLayout.tsx   # 페이지 래퍼
│   │   │   │   └── index.ts
│   │   │   ├── ui/                  # shadcn/ui 컴포넌트
│   │   │   ├── BugReportModal.tsx   # 버그 신고 모달
│   │   │   └── ErrorBoundary.tsx    # 에러 경계
│   │   ├── pages/                   # 페이지 컴포넌트
│   │   │   ├── Home.tsx             # 홈페이지 (히어로 + 문제 정의)
│   │   │   ├── Mentors.tsx          # 멘토 검색 및 필터링
│   │   │   ├── MentorDetail.tsx     # 멘토 상세 프로필 + 상담 예약
│   │   │   ├── MentorProfile.tsx    # 내 멘토 프로필 관리
│   │   │   ├── Bookings.tsx         # 상담 문의 (멘토/멘티 역할 분기)
│   │   │   ├── Messages.tsx         # 메시지 (상담 신청 수락/거절)
│   │   │   ├── Notifications.tsx    # 알림 목록
│   │   │   └── VerifyMentor.tsx     # 멘토 인증 요청
│   │   ├── lib/
│   │   │   └── trpc.ts              # tRPC 클라이언트 설정
│   │   ├── App.tsx                  # 라우팅 + 전역 설정
│   │   └── index.css                # 전역 스타일
│   └── index.html
├── server/                          # 백엔드 (Express + tRPC)
│   ├── _core/
│   │   └── index.ts                 # Express 서버 진입점
│   ├── auth.logout.test.ts          # 테스트
│   ├── routers.ts                   # tRPC 라우터 (12개 도메인)
│   │   ├── auth                     # 인증 (회원가입, 로그인, 로그아웃, 탈퇴)
│   │   ├── mentor                   # 멘토 프로필 (등록, 조회, 수정, 삭제)
│   │   ├── booking                  # 상담 예약 (신청, 수락, 거절)
│   │   ├── review                   # 리뷰 및 평가
│   │   ├── notification             # 알림 시스템
│   │   ├── message                  # 메시지 (상담 신청 관련)
│   │   ├── verification             # 멘토 인증 (학생증)
│   │   ├── admin                    # 관리자 (멘토 승인, 버그 신고)
│   │   ├── gallery                  # 멘토 갤러리 (이미지 업로드)
│   │   └── bugReport                # 버그 신고 시스템
│   └── db.ts                        # 데이터베이스 함수 (35개+)
├── drizzle/
│   ├── schema.ts                    # 데이터베이스 스키마 (13개 테이블)
│   │   ├── users                    # 사용자 (역할: STUDENT/MENTOR)
│   │   ├── mentorProfiles           # 멘토 프로필 (대학, 전공, 학년, 자기소개)
│   │   ├── mentorVerifications      # 멘토 인증 (학생증 이미지)
│   │   ├── bookings                 # 상담 예약 (상담 종류, 시간, 상태)
│   │   ├── reviews                  # 리뷰 (별점, 코멘트)
│   │   ├── notifications            # 알림
│   │   ├── messages                 # 메시지
│   │   ├── galleries                # 멘토 갤러리 이미지
│   │   ├── bugReports               # 버그 신고
│   │   └── ...
│   └── migrations/                  # DB 마이그레이션 파일
├── drizzle.config.ts                # Drizzle 설정
├── vite.config.ts                   # Vite 설정
├── tsconfig.json                    # TypeScript 설정
├── tailwind.config.ts               # Tailwind CSS 설정
├── package.json                     # 의존성 및 스크립트
├── REFACTORING_REPORT.md            # pt 1.0 리팩토링 보고서
├── todo.md                          # 기능 체크리스트 (완료/진행 중)
└── README.md                        # (없음 - 이 문서로 대체)
```

---

## 🎯 주요 기능

### 1. 사용자 관리
- **회원가입**: 고등학생(멘티) / 대학생(멘토) 역할 구분
- **프로필**: 역할별 프로필 초기 설정 및 관리
- **계정 탈퇴**: 사용자 데이터 완전 삭제

### 2. 멘토 프로필
- **등록**: 대학명, 전공, 학년, 자기소개, 분야, 지역
- **수정/삭제**: 프로필 업데이트 및 멘토 활동 중단
- **갤러리**: 경험 공유를 위한 이미지 업로드 (S3 저장)
- **인증**: 학생증 이미지 업로드 → 관리자 승인

### 3. 멘토 검색 및 필터링
- **검색**: 전공, 지역, 학년 기반 필터링
- **상세 프로필**: 멘토 정보 및 리뷰 조회
- **필터**: 전체/특정 분야(이공계, 상경계 등), 전체/특정 지역

### 4. 상담 예약 시스템
- **신청**: 상담 종류(생기부, 진로, 학업, 탐방) 선택 → 시간 선택 → 신청
- **가격 정책**: 상담 종류별 기본 1시간 비용 + 추가 시간 비용
- **상태 관리**: 대기 → 수락/거절 → 완료
- **메시지**: 상담 신청 시 멘토에게 자동 메시지 전송

### 5. 메시지 시스템
- **실시간 대화**: 멘토와 멘티 간 1:1 메시지
- **상담 신청 상태**: 메시지 내 수락/거절 버튼
- **읽음 상태**: 메시지 읽음 여부 표시

### 6. 알림 시스템
- **상담 확정 알림**: 상담 신청 수락 시
- **일정 변경 알림**: 예약 변경 시
- **리뷰 알림**: 리뷰 등록 시

### 7. 리뷰 및 평가
- **작성**: 상담 완료 후 별점 + 코멘트
- **표시**: 멘토 프로필에 평점 및 리뷰 목록
- **관리**: 리뷰 조회 및 삭제

### 8. 관리자 기능
- **멘토 승인**: 인증 요청 검토 및 승인/거절
- **버그 신고**: 사용자 버그 신고 수집 및 상태 관리
- **대시보드**: 신규 버그 건수, 멘토 현황 등 모니터링

### 9. 결제 시스템 (Stripe)
- **결제 처리**: 상담료 결제 (현재는 신청 단계에서 제거, 향후 추가 예정)
- **결제 내역**: 결제 이력 조회

---

## 📊 데이터베이스 스키마

### 핵심 테이블 (13개)

| 테이블 | 설명 | 주요 필드 |
|--------|------|----------|
| `users` | 사용자 | id, email, role(STUDENT/MENTOR), createdAt |
| `mentorProfiles` | 멘토 프로필 | userId, university, major, grade, bio, field, region, verificationStatus, isDeleted |
| `mentorVerifications` | 멘토 인증 | mentorId, studentIdImageUrl, status(PENDING/APPROVED/REJECTED), rejectionReason |
| `bookings` | 상담 예약 | studentId, mentorId, consultationType, scheduledTime, status, totalPrice |
| `reviews` | 리뷰 | bookingId, mentorId, rating, comment |
| `notifications` | 알림 | userId, type, message, isRead |
| `messages` | 메시지 | senderId, recipientId, content, bookingId, isRead |
| `galleries` | 갤러리 | mentorId, imageUrl |
| `bugReports` | 버그 신고 | userId, title, description, severity, status |
| `users_oauth` | OAuth 토큰 | userId, provider, accessToken, refreshToken |
| `notifications_settings` | 알림 설정 | userId, emailNotifications, pushNotifications |
| `reviews_summary` | 리뷰 요약 | mentorId, avgRating, totalReviews |
| `audit_logs` | 감사 로그 | userId, action, timestamp |

---

## 🚀 현재 상태 (pt 1.0)

### ✅ 완료된 기능
- 모든 핵심 기능 구현 (인증, 멘토 검색, 상담 예약, 메시지, 알림, 리뷰)
- 71개 테스트 전체 통과
- TypeScript 컴파일 에러 0건
- 프로덕션급 리팩토링 완료 (네비게이션 바 중복 제거, 공통 컴포넌트 추출)
- 모든 페이지 네비게이션 바 통일
- 비로그인 사용자 네비게이션 개선 (로그인/회원가입 버튼)
- 문제 정의 섹션 텍스트 최종 변경

### 📈 코드 품질 개선 (pt 0.9 → pt 1.0)
- **코드 감소**: 3,113줄 → 2,417줄 (22.4% 감소)
- **중복 제거**: 네비게이션 바 8개 페이지 중복 → 1개 파일 (Navbar.tsx)
- **컴포넌트 분리**: PageLayout, Footer 공통 컴포넌트 추출
- **변경 영향 최소화**: UI 변경 시 1개 파일 수정으로 모든 페이지 적용

### 🔄 진행 중인 작업
- 서버 측 리팩토링 (routers.ts, db.ts 도메인별 분리) - 향후 단계

### ⏳ 향후 계획
- 서버 코드 도메인별 분리 (routers → 10개 파일, db → 7개 리포지토리)
- E2E 테스트 추가 (Playwright)
- 성능 최적화 (번들 분석, 이미지 최적화)
- SEO 개선 (메타 태그, 구조화된 데이터)
- 접근성 개선 (WCAG 2.1 AA 준수)

---

## 🔧 개발 환경 설정

### 필수 환경 변수
```env
# 데이터베이스
DATABASE_URL=mysql://user:password@host:3306/dbname

# 인증
JWT_SECRET=your_jwt_secret
OAUTH_SERVER_URL=https://your-oauth-server.com

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-northeast-2

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# 기타
OWNER_NAME=your_name
OWNER_OPEN_ID=your_open_id
```

### 개발 서버 실행
```bash
pnpm install
pnpm dev              # 프론트 + 백 동시 실행
pnpm test             # 테스트 실행
pnpm db:push          # DB 마이그레이션
```

### 빌드 및 배포
```bash
pnpm build            # 프론트 + 백 빌드
pnpm start            # 프로덕션 서버 실행
```

---

## 📝 주요 파일 설명

### 프론트엔드
- **App.tsx**: 라우팅 설정 (Wouter) + 전역 설정
- **pages/*.tsx**: 각 페이지 컴포넌트 (비즈니스 로직 집중)
- **components/layout/**: 공통 레이아웃 (Navbar, Footer, PageLayout)
- **lib/trpc.ts**: tRPC 클라이언트 설정

### 백엔드
- **server/_core/index.ts**: Express 서버 설정 + tRPC 라우터 등록
- **server/routers.ts**: 모든 tRPC 라우터 (12개 도메인)
- **server/db.ts**: 데이터베이스 함수 (35개+)
- **drizzle/schema.ts**: 데이터베이스 스키마 (13개 테이블)

---

## 🐛 알려진 이슈 및 해결책

| 이슈 | 상태 | 해결책 |
|------|------|--------|
| 서버 코드 단일 파일 집중 | 진행 중 | 도메인별 분리 예정 |
| 성능 최적화 필요 | 계획 | 번들 분석, 코드 스플리팅 |
| SEO 메타 태그 부족 | 계획 | 동적 메타 태그 추가 |
| 접근성 개선 필요 | 계획 | WCAG 2.1 AA 준수 |

---

## 📚 참고 자료

- **리팩토링 보고서**: `REFACTORING_REPORT.md`
- **기능 체크리스트**: `todo.md`
- **데이터베이스 스키마**: `database-schema.md` / `database-schema.mmd`
- **Changelog**: `CHANGELOG_PT0.6_TO_CURRENT.md`

---

## 👥 팀 정보

- **팀명**: 유니브매치
- **개발 환경**: Node.js 22.13, pnpm 10.4
- **배포 환경**: Cloud Run (Google Cloud)

---

**마지막 업데이트**: 2026년 2월 7일 (pt 1.0 리팩토링 완료)
