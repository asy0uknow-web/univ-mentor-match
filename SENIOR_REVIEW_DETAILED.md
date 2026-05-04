# 유니브매치 시니어 리뷰 - 상세 리뷰 및 개선안

---

## A. 구조/가독성/유지보수

### A1. 중복 API 호출 (Mentors.tsx)

**발견된 문제**:
```tsx
// 4개의 독립적인 useQuery 호출
const { data: allMentors } = trpc.mentor.listAll.useQuery();
const { data: combinedMentors } = trpc.mentorSearch.getByFieldAndRegion.useQuery(...);
const { data: fieldMentors } = trpc.mentorSearch.getByField.useQuery(...);
const { data: regionMentors } = trpc.mentorSearch.getByRegion.useQuery(...);
```

**왜 문제인가**: 필터 선택 시 최대 4개의 API 호출이 동시 실행되어 불필요한 네트워크 요청 발생. 캐싱 전략도 복잡해짐.

**개선안**: 단일 `useQuery`로 통합하고 서버에서 필터 로직 처리.

**적용 예시**:
```tsx
// 개선 전
const { data: allMentors } = trpc.mentor.listAll.useQuery();
const { data: combinedMentors } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
  { field: selectedField !== "all" ? selectedField : undefined, region: selectedRegion !== "all" ? selectedRegion : undefined },
  { enabled: selectedField !== "all" && selectedRegion !== "all" }
);

// 개선 후
const { data: mentors, isLoading } = trpc.mentor.search.useQuery({
  field: selectedField !== "all" ? selectedField : undefined,
  region: selectedRegion !== "all" ? selectedRegion : undefined,
  searchTerm: searchTerm || undefined,
});
```

---

### A2. Navbar 메뉴 코드 중복

**발견된 문제**:
```tsx
// 데스크톱 버튼
<Link href="/mentors" className="hidden md:block">
  <Button variant="ghost" size="sm">멘토 찾기</Button>
</Link>

// 모바일 드롭다운
<DropdownMenuItem asChild className="md:hidden">
  <Link href="/mentors">멘토 찾기</Link>
</DropdownMenuItem>
```

**왜 문제인가**: 메뉴 항목이 두 곳에 중복되어 유지보수 어려움. 새 메뉴 추가 시 두 곳 모두 수정 필요.

**개선안**: 메뉴 배열 상수화 + 반복 렌더링.

**적용 예시**:
```tsx
const NAVBAR_MENU = [
  { href: "/mentors", label: "멘토 찾기", icon: null },
  { href: "/bookings", label: "상담 문의", icon: null },
  { href: "/my-profile", label: "내 프로필", icon: null },
  { href: "/notifications", label: "알림", icon: null },
];

// 렌더링
{NAVBAR_MENU.map((item) => (
  <Link key={item.href} href={item.href} className="hidden md:block">
    <Button variant="ghost" size="sm">{item.label}</Button>
  </Link>
))}

{NAVBAR_MENU.map((item) => (
  <DropdownMenuItem key={item.href} asChild className="md:hidden">
    <Link href={item.href}>{item.label}</Link>
  </DropdownMenuItem>
))}
```

---

### A3. TypeScript `as any` 캐스팅 (Mentors.tsx)

**발견된 문제**:
```tsx
const { data: combinedMentors } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
  { field: (selectedField !== "all" ? selectedField : undefined) as any, region: (selectedRegion !== "all" ? selectedRegion : undefined) as any },
  { enabled: selectedField !== "all" && selectedRegion !== "all" }
);
```

**왜 문제인가**: `as any`는 타입 체크를 무시하여 런타임 에러 위험 증가.

**개선안**: 정확한 타입 정의.

**적용 예시**:
```tsx
type SearchParams = {
  field?: string;
  region?: string;
};

const searchParams: SearchParams = {
  field: selectedField !== "all" ? selectedField : undefined,
  region: selectedRegion !== "all" ? selectedRegion : undefined,
};

const { data: combinedMentors } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
  searchParams,
  { enabled: selectedField !== "all" && selectedRegion !== "all" }
);
```

---

## B. 오류/버그/엣지케이스

### B1. Missing useAuth Import (Navbar.tsx)

**발견된 문제**:
```tsx
export default function Navbar({ onBugReport }: NavbarProps) {
  const { isAuthenticated } = useAuth(); // ← import 없음!
```

**왜 문제인가**: 런타임 에러 발생 → 네비게이션 바 기능 마비.

**개선안**: import 추가.

**적용 예시**:
```tsx
import { useAuth } from "@/_core/hooks/useAuth";

export default function Navbar({ onBugReport }: NavbarProps) {
  const { isAuthenticated } = useAuth();
  // ...
}
```

---

### B2. Missing Error Handling in MentorDetail

**발견된 문제**:
```tsx
const { data: mentor, isLoading } = trpc.mentor.getById.useQuery(
  { mentorId },
  { enabled: isValidMentorId }
);

// isError 상태 미처리
return (
  <PageLayout>
    {isLoading ? <div>로딩중...</div> : (
      <div>{mentor?.profile.university}</div> // mentor가 undefined일 수 있음
    )}
  </PageLayout>
);
```

**왜 문제인가**: 조회 실패 시 빈 화면 또는 크래시.

**개선안**: `isError` 상태 확인 후 에러 UI 렌더링.

**적용 예시**:
```tsx
const { data: mentor, isLoading, isError, error } = trpc.mentor.getById.useQuery(
  { mentorId },
  { enabled: isValidMentorId }
);

if (isError) {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">멘토를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-6">{error?.message}</p>
          <Link href="/mentors">
            <Button>멘토 목록으로 돌아가기</Button>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}

if (isLoading) {
  return <PageLayout><div>로딩중...</div></PageLayout>;
}

if (!mentor) {
  return <PageLayout><div>멘토 정보를 찾을 수 없습니다</div></PageLayout>;
}

return <PageLayout>{/* 정상 렌더링 */}</PageLayout>;
```

---

### B3. URL 파라미터 검증 (MentorDetail.tsx)

**발견된 문제**:
```tsx
const { id } = useParams();
const mentorId = id ? parseInt(id, 10) : 0;
const isValidMentorId = !isNaN(mentorId) && mentorId > 0;

// 하지만 서버에서 추가 검증 없음
const { data: mentor } = trpc.mentor.getById.useQuery(
  { mentorId },
  { enabled: isValidMentorId }
);
```

**왜 문제인가**: 클라이언트 검증만으로는 부족. 서버에서도 타입 검증 필요.

**개선안**: 서버 라우터에서 Zod 스키마 검증.

**적용 예시**:
```tsx
// server/routers.ts
mentor: router({
  getById: publicProcedure
    .input(z.object({ mentorId: z.number().int().positive() }))
    .query(async ({ input }) => {
      const mentor = await getMentorById(input.mentorId);
      if (!mentor) {
        throw new Error("Mentor not found");
      }
      return mentor;
    }),
}),
```

---

### B4. 중복 상담 신청 (MentorDetail.tsx)

**발견된 문제**:
```tsx
const handleBooking = () => {
  // ...
  createBookingMutation.mutate({
    // ...
  });
};

// 버튼 상태 미처리
<Button onClick={handleBooking}>상담 신청</Button>
```

**왜 문제인가**: 로딩 중 버튼 클릭 가능 → 중복 신청.

**개선안**: 로딩 상태로 버튼 비활성화.

**적용 예시**:
```tsx
<Button 
  onClick={handleBooking}
  disabled={createBookingMutation.isPending}
>
  {createBookingMutation.isPending ? "신청 중..." : "상담 신청"}
</Button>
```

---

## C. 성능

### C1. 검색 입력 디바운스 (Mentors.tsx)

**발견된 문제**:
```tsx
const [searchTerm, setSearchTerm] = useState("");

const filteredMentors = mentors?.filter((m) => {
  const searchLower = searchTerm.toLowerCase();
  return (
    m.profile.university.toLowerCase().includes(searchLower) ||
    m.profile.major.toLowerCase().includes(searchLower) ||
    m.user.name?.toLowerCase().includes(searchLower)
  );
});

// 모든 키입력마다 필터링 실행
<Input 
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
/>
```

**왜 문제인가**: 불필요한 렌더링 → 성능 저하.

**개선안**: `useMemo` + `useCallback` 또는 debounce.

**적용 예시**:
```tsx
import { useMemo, useCallback } from "react";

const [searchTerm, setSearchTerm] = useState("");

const handleSearchChange = useCallback((value: string) => {
  setSearchTerm(value);
}, []);

const filteredMentors = useMemo(() => {
  if (!mentors) return [];
  const searchLower = searchTerm.toLowerCase();
  return mentors.filter((m) =>
    m.profile.university.toLowerCase().includes(searchLower) ||
    m.profile.major.toLowerCase().includes(searchLower) ||
    m.user.name?.toLowerCase().includes(searchLower)
  );
}, [mentors, searchTerm]);

<Input 
  value={searchTerm}
  onChange={(e) => handleSearchChange(e.target.value)}
/>
```

---

### C2. 이미지 최적화 (Navbar 로고)

**발견된 문제**:
```tsx
<img
  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png"
  alt="Univ Match"
  className="h-14 sm:h-20 w-auto"
/>
```

**왜 문제인가**: 외부 CDN URL 하드코딩 + 크기 지정 없음 (Cumulative Layout Shift).

**개선안**: 로컬 이미지 import + width/height 지정.

**적용 예시**:
```tsx
import logoImage from "@/assets/logo.png";

<img
  src={logoImage}
  alt="Univ Match"
  className="h-14 sm:h-20 w-auto"
  width={80}
  height={80}
/>
```

---

## D. 보안

### D1. Unprotected Admin Routes

**발견된 문제**:
```tsx
// client/src/App.tsx
<Route path={"/admin"} component={AdminDashboard} />
<Route path={"/admin/bug-reports"} component={AdminBugReports} />

// AdminDashboard.tsx
export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  // 클라이언트에서만 검증
  if (user?.role !== "admin") {
    return <div>접근 권한이 없습니다</div>;
  }
  // ...
}
```

**왜 문제인가**: 브라우저 개발자 도구로 URL 직접 접근 시 관리자 기능 노출 가능.

**개선안**: 서버 라우터에서 `adminProcedure` 강화 + 클라이언트 라우트 가드.

**적용 예시**:
```tsx
// server/routers.ts - 강화된 adminProcedure
function adminProcedure(ctx: any) {
  if (!ctx.user) {
    throw new Error("Unauthorized");
  }
  if (ctx.user.role !== "admin") {
    throw new Error("Forbidden: Admin access required");
  }
  return true;
}

export const appRouter = router({
  admin: router({
    getAllMentors: protectedProcedure
      .use((opts) => {
        adminProcedure(opts.ctx);
        return opts.next();
      })
      .query(async () => {
        // ...
      }),
  }),
});

// client/src/App.tsx - 라우트 가드
function ProtectedRoute({ path, component: Component }: any) {
  const { user } = useAuth();
  
  if (user?.role !== "admin") {
    return <Route path={path} component={NotFound} />;
  }
  
  return <Route path={path} component={Component} />;
}

<ProtectedRoute path="/admin" component={AdminDashboard} />
<ProtectedRoute path="/admin/bug-reports" component={AdminBugReports} />
```

---

### D2. Hardcoded 로고 URL

**발견된 문제**:
```tsx
<img
  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png"
  alt="Univ Match"
/>
```

**왜 문제인가**: 외부 의존성 + 이미지 URL 변경 시 모든 페이지 영향.

**개선안**: 환경 변수 또는 로컬 import.

**적용 예시**:
```tsx
// .env
VITE_LOGO_URL=https://files.manuscdn.com/...

// Navbar.tsx
const logoUrl = import.meta.env.VITE_LOGO_URL || "/logo.png";

<img src={logoUrl} alt="Univ Match" />
```

---

## E. SEO/메타/공유

### E1. 페이지별 메타 태그 부재

**발견된 문제**:
```tsx
// Home.tsx만 동적 메타 태그 설정
useEffect(() => {
  document.title = "유니브매치 - ...";
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', '...');
  }
}, []);

// 다른 페이지는 기본값 사용 (index.html의 메타 태그)
```

**왜 문제인가**: 검색 엔진 최적화 저하, 소셜 공유 시 썸네일 미표시.

**개선안**: 모든 페이지에 동적 메타 태그 설정 또는 `react-helmet` 도입.

**적용 예시**:
```tsx
// lib/seo.ts
export function setPageMeta(title: string, description: string, ogImage?: string) {
  document.title = title;
  
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute('content', description);
  }
  
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute('content', title);
  }
  
  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute('content', description);
  }
  
  if (ogImage) {
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute('content', ogImage);
    }
  }
}

// Mentors.tsx
useEffect(() => {
  setPageMeta(
    "멘토 찾기 - 유니브매치",
    "원하는 대학, 전공, 학년으로 멘토를 검색하고 상담을 예약하세요."
  );
}, []);
```

---

## F. 접근성(A11y)

### F1. Missing aria-label

**발견된 문제**:
```tsx
<Button variant="ghost" size="sm" className="gap-2">
  <span className="hidden sm:inline">메뉴</span>
  <ChevronDown className="h-4 w-4" />
</Button>

<Link href="/mentors">
  <Button variant="ghost" size="sm">멘토 찾기</Button>
</Link>
```

**왜 문제인가**: 스크린 리더 사용자가 버튼 목적을 이해하기 어려움.

**개선안**: `aria-label` 추가.

**적용 예시**:
```tsx
<Button 
  variant="ghost" 
  size="sm" 
  className="gap-2"
  aria-label="네비게이션 메뉴 열기"
>
  <span className="hidden sm:inline">메뉴</span>
  <ChevronDown className="h-4 w-4" />
</Button>

<Link href="/mentors" aria-label="멘토 찾기 페이지로 이동">
  <Button variant="ghost" size="sm">멘토 찾기</Button>
</Link>
```

---

### F2. 포커스 스타일 미흡

**발견된 문제**:
```tsx
<Button variant="ghost" size="sm">멘토 찾기</Button>
// 포커스 시 시각적 피드백 부족
```

**왜 문제인가**: 키보드 네비게이션 사용자가 현재 포커스 위치를 알기 어려움.

**개선안**: 포커스 스타일 강화.

**적용 예시**:
```tsx
<Button 
  variant="ghost" 
  size="sm"
  className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
>
  멘토 찾기
</Button>
```

---

## G. 코드스타일/툴링

### G1. console.log 남아있음

**발견된 문제**:
```tsx
// 프로덕션 코드에 9개의 console.log 존재
console.log("mentors:", mentors);
console.log("error:", error);
// ...
```

**왜 문제인가**: 번들 크기 증가, 보안 정보 노출 가능.

**개선안**: 모든 `console.log` 제거 또는 로깅 라이브러리 통합.

**적용 예시**:
```tsx
// 제거
// console.log("mentors:", mentors);

// 또는 로깅 라이브러리 사용
import { logger } from "@/lib/logger";

logger.debug("mentors:", mentors);
```

---

### G2. 환경 변수 분리 부족

**발견된 문제**:
```tsx
// Navbar.tsx
src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png"

// MentorDetail.tsx
const consultationPrices = {
  "resume_consulting": { base: 50000, additional: 30000 },
  // ...
};
```

**왜 문제인가**: 상수값이 코드에 하드코딩되어 변경 시 재배포 필요.

**개선안**: 환경 변수 또는 설정 파일로 분리.

**적용 예시**:
```tsx
// .env
VITE_LOGO_URL=https://files.manuscdn.com/...
VITE_CONSULTATION_PRICE_RESUME=50000
VITE_CONSULTATION_PRICE_CAREER=30000

// const/prices.ts
export const CONSULTATION_PRICES = {
  "resume_consulting": { 
    base: parseInt(import.meta.env.VITE_CONSULTATION_PRICE_RESUME || "50000"),
    additional: 30000 
  },
  // ...
};
```

---

## H. 배포/운영 안정성

### H1. 빌드 에러 가능성 (Missing Import)

**발견된 문제**:
```tsx
// Navbar.tsx에서 useAuth 미import
const { isAuthenticated } = useAuth();
```

**왜 문제인가**: 프로덕션 빌드 실패 또는 런타임 크래시.

**개선안**: import 추가 + ESLint 규칙 강화.

**적용 예시**:
```tsx
// .eslintrc.json
{
  "rules": {
    "no-undef": "error",
    "react-hooks/rules-of-hooks": "error"
  }
}

// Navbar.tsx
import { useAuth } from "@/_core/hooks/useAuth";
```

---

### H2. 환경 변수 검증 부족

**발견된 문제**:
```tsx
// server/_core/index.ts
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});
// 환경 변수 누락 시 런타임 에러
```

**왜 문제인가**: 배포 시 환경 변수 누락 시 서버 크래시.

**개선안**: 시작 시 환경 변수 검증.

**적용 예시**:
```tsx
// server/_core/env.ts
export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "JWT_SECRET",
    "OAUTH_SERVER_URL",
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }
}

// server/_core/index.ts
import { validateEnv } from "./env";

validateEnv();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
```

---

## 📋 요약 테이블

| 범주 | 이슈 수 | 심각도 | 개선 시간 |
|------|:---:|:---:|:---:|
| A. 구조/가독성 | 3 | 중 | 2시간 |
| B. 오류/버그 | 4 | 높음 | 1시간 |
| C. 성능 | 2 | 중 | 1시간 |
| D. 보안 | 2 | 높음 | 1시간 |
| E. SEO | 1 | 중 | 1시간 |
| F. 접근성 | 2 | 낮음 | 1시간 |
| G. 코드스타일 | 2 | 낮음 | 30분 |
| H. 배포 안정성 | 2 | 높음 | 30분 |
| **합계** | **18** | - | **8시간** |

---

**다음 단계**: 바로 적용 가능한 리팩토링 패치 코드 생성 중...
