# 유니브매치 코드 리팩토링 보고서

**버전**: pt 0.9 → pt 1.0  
**작성일**: 2026년 2월 7일  
**작성자**: Manus AI

---

## 1. 리팩토링 배경

유니브매치는 AI 바이브 코딩 방식으로 빠르게 프로토타입이 구축된 프로젝트입니다. 기능 추가가 반복되면서 **가독성**, **코드 중복**, **책임 분리** 측면에서 기술 부채가 누적되었습니다. 이번 리팩토링은 프로덕션급 코드 품질을 확보하기 위해 수행되었으며, 기능 변경 없이 구조만 개선하는 **순수 리팩토링**을 원칙으로 진행했습니다.

---

## 2. 핵심 문제 진단

### 2.1 네비게이션 바 코드 중복 (가장 심각)

리팩토링 전, 네비게이션 바 코드가 **8개 페이지에 약 580줄** 복사-붙여넣기 되어 있었습니다. 각 페이지마다 동일한 로고, 메뉴 링크, 드롭다운 메뉴, 로그인/비로그인 분기, 버그 신고 모달을 독립적으로 관리하고 있었으며, 이로 인해 UI 변경 시 8개 파일을 동시에 수정해야 하는 상황이 반복되었습니다.

### 2.2 단일 파일에 집중된 서버 로직

서버 측에서는 `routers.ts`(823줄)에 12개 도메인의 라우터가, `db.ts`(663줄)에 35개 이상의 데이터베이스 함수가 하나의 파일에 모여 있었습니다. 이는 코드 탐색과 유지보수를 어렵게 만드는 구조입니다.

### 2.3 페이지 컴포넌트의 과도한 책임

각 페이지 컴포넌트가 레이아웃(네비게이션, 푸터), 상태 관리(버그 신고 모달, 로그아웃), 비즈니스 로직을 모두 담당하고 있어 단일 책임 원칙(SRP)을 위반하고 있었습니다.

---

## 3. 폴더 구조 재설계

### 3.1 리팩토링 전 구조

```
client/src/
├── components/
│   ├── ui/              # shadcn/ui 컴포넌트
│   ├── BugReportModal.tsx
│   └── ErrorBoundary.tsx
├── pages/
│   ├── Home.tsx          (258줄, nav 77줄 포함)
│   ├── Mentors.tsx       (302줄, nav 77줄 포함)
│   ├── Bookings.tsx      (360줄, nav 103줄 포함)
│   ├── Messages.tsx      (470줄, nav 77줄 포함)
│   ├── MentorDetail.tsx  (558줄, nav 77줄 포함)
│   ├── MentorProfile.tsx (694줄, nav 68줄 포함)
│   ├── Notifications.tsx (205줄, nav 77줄 포함)
│   └── VerifyMentor.tsx  (266줄, nav 26줄 포함)
└── App.tsx
```

### 3.2 리팩토링 후 구조

```
client/src/
├── components/
│   ├── layout/           # ★ 신규: 공통 레이아웃 컴포넌트
│   │   ├── Navbar.tsx    # 네비게이션 바 (단일 소스)
│   │   ├── Footer.tsx    # 푸터 (단일 소스)
│   │   ├── PageLayout.tsx# 페이지 레이아웃 래퍼
│   │   └── index.ts      # 배럴 파일
│   ├── ui/               # shadcn/ui 컴포넌트
│   ├── BugReportModal.tsx
│   └── ErrorBoundary.tsx
├── pages/
│   ├── Home.tsx          (136줄, nav 제거)
│   ├── Mentors.tsx       (200줄, nav 제거)
│   ├── Bookings.tsx      (245줄, nav 제거)
│   ├── Messages.tsx      (383줄, nav 제거)
│   ├── MentorDetail.tsx  (471줄, nav 제거)
│   ├── MentorProfile.tsx (624줄, nav 제거)
│   ├── Notifications.tsx (118줄, nav 제거)
│   └── VerifyMentor.tsx  (240줄, nav 제거)
└── App.tsx
```

---

## 4. 컴포넌트 분리 기준

이번 리팩토링에서 컴포넌트를 분리한 기준은 다음 세 가지입니다.

### 4.1 중복 제거 (DRY 원칙)

2개 이상의 페이지에서 동일한 코드가 반복되면 공통 컴포넌트로 추출합니다. 네비게이션 바는 8개 페이지에서 동일한 코드가 반복되고 있었으므로 최우선 추출 대상이었습니다.

### 4.2 단일 책임 원칙 (SRP)

하나의 컴포넌트는 하나의 역할만 담당해야 합니다. `PageLayout`은 레이아웃 구성만, `Navbar`는 네비게이션만, 각 페이지는 해당 페이지의 비즈니스 로직만 담당하도록 분리했습니다.

### 4.3 변경 빈도 기반 분리

네비게이션 바와 푸터는 전체 사이트에 영향을 미치는 변경이 잦은 요소입니다. 이를 독립 컴포넌트로 분리하면 변경 시 단일 파일만 수정하면 되므로 변경 영향 범위가 최소화됩니다.

---

## 5. 리팩토링 전/후 비교

### 5.1 코드량 변화

| 파일 | 리팩토링 전 (줄) | 리팩토링 후 (줄) | 감소량 | 감소율 |
|------|:---:|:---:|:---:|:---:|
| Home.tsx | 258 | 136 | -122 | 47.3% |
| Mentors.tsx | 302 | 200 | -102 | 33.8% |
| Bookings.tsx | 360 | 245 | -115 | 31.9% |
| Messages.tsx | 470 | 383 | -87 | 18.5% |
| MentorDetail.tsx | 558 | 471 | -87 | 15.6% |
| MentorProfile.tsx | 694 | 624 | -70 | 10.1% |
| Notifications.tsx | 205 | 118 | -87 | 42.4% |
| VerifyMentor.tsx | 266 | 240 | -26 | 9.8% |
| **합계** | **3,113** | **2,417** | **-696** | **22.4%** |

신규 생성된 공통 컴포넌트는 총 4개 파일, 약 120줄입니다. 순 코드 감소량은 약 **576줄**(18.5%)입니다.

### 5.2 중복 코드 제거 효과

| 항목 | 리팩토링 전 | 리팩토링 후 |
|------|:---:|:---:|
| 네비게이션 바 코드 위치 | 8개 파일에 분산 | `Navbar.tsx` 1개 파일 |
| 네비게이션 바 총 줄 수 | ~580줄 (중복) | ~100줄 (단일) |
| 푸터 코드 위치 | Home.tsx에만 존재 | `Footer.tsx` 1개 파일 |
| 버그 신고 모달 상태 관리 | 8개 파일에 분산 | `PageLayout.tsx` 1개 파일 |
| 로그아웃 뮤테이션 | 8개 파일에 분산 | `Navbar.tsx` 1개 파일 |
| UI 변경 시 수정 파일 수 | 최대 8개 | 1개 |

### 5.3 품질 지표

| 지표 | 리팩토링 전 | 리팩토링 후 |
|------|:---:|:---:|
| TypeScript 컴파일 에러 | 0 | 0 |
| 테스트 통과율 | 71/71 (100%) | 71/71 (100%) |
| 네비게이션 바 일관성 | 수동 동기화 필요 | 자동 보장 |
| 새 페이지 추가 시 네비게이션 코드 | ~77줄 복사 필요 | `<PageLayout>` 1줄 |

---

## 6. 아키텍처 개선 요약

### 6.1 클라이언트 측

리팩토링의 핵심은 **관심사 분리(Separation of Concerns)** 입니다. 각 페이지 컴포넌트에서 레이아웃 책임을 `PageLayout`으로 위임함으로써, 페이지 컴포넌트는 순수하게 해당 페이지의 비즈니스 로직과 UI에만 집중할 수 있게 되었습니다.

```tsx
// 리팩토링 전: 각 페이지마다 77줄의 네비게이션 + 상태 관리
export default function Mentors() {
  const [showBugReport, setShowBugReport] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({ ... });
  return (
    <div className="min-h-screen">
      <nav className="...">  {/* 77줄의 네비게이션 코드 */} </nav>
      {/* 페이지 콘텐츠 */}
      <BugReportModal ... />
    </div>
  );
}

// 리팩토링 후: PageLayout이 레이아웃 전체를 관리
export default function Mentors() {
  return (
    <PageLayout>
      {/* 페이지 콘텐츠만 집중 */}
    </PageLayout>
  );
}
```

### 6.2 서버 측 (향후 과제)

서버 측 `routers.ts`(823줄)와 `db.ts`(663줄)의 도메인별 분리는 이번 리팩토링 범위에서 제외했습니다. 이는 다음 리팩토링 단계에서 진행할 예정이며, 아래와 같은 구조를 권장합니다.

```
server/
├── routers/
│   ├── index.ts          # appRouter 조합
│   ├── mentor.router.ts
│   ├── booking.router.ts
│   ├── review.router.ts
│   ├── notification.router.ts
│   ├── message.router.ts
│   ├── verification.router.ts
│   ├── admin.router.ts
│   ├── gallery.router.ts
│   └── bugReport.router.ts
├── repositories/
│   ├── mentor.repo.ts
│   ├── booking.repo.ts
│   ├── review.repo.ts
│   ├── notification.repo.ts
│   ├── message.repo.ts
│   ├── verification.repo.ts
│   └── gallery.repo.ts
└── db.ts                 # DB 연결만 담당
```

---

## 7. 결론

이번 리팩토링을 통해 클라이언트 측 코드의 중복을 대폭 제거하고, 컴포넌트 간 책임을 명확히 분리했습니다. 네비게이션 바 변경 시 8개 파일을 수정하던 작업이 1개 파일 수정으로 줄었으며, 새로운 페이지를 추가할 때도 `<PageLayout>` 한 줄로 일관된 레이아웃을 적용할 수 있게 되었습니다. 모든 기존 테스트(71개)가 통과하고, TypeScript 컴파일 에러가 없으며, 모든 페이지에서 네비게이션 바가 정상 표시됨을 확인했습니다.
