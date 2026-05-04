# 유니브매치 - 바로 적용 가능한 리팩토링 패치

## 적용 순서 (1→10)

각 패치는 독립적이며, 우선순위 순서대로 적용하면 됩니다.

---

## 1️⃣ Navbar.tsx - useAuth Import 추가 (P0 - 즉시)

**파일**: `client/src/components/layout/Navbar.tsx`

**변경 사항**: 2줄 추가

```diff
  import { Button } from "@/components/ui/button";
  import { getLoginUrl } from "@/const";
  import { Link } from "wouter";
  import { LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
+ import { useAuth } from "@/_core/hooks/useAuth";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
  } from "@/components/ui/dropdown-menu";
  import { trpc } from "@/lib/trpc";
```

**적용 시간**: 1분

---

## 2️⃣ MentorDetail.tsx - 에러 처리 추가 (P0 - 즉시)

**파일**: `client/src/pages/MentorDetail.tsx`

**변경 사항**: 렌더링 로직 개선

```diff
  export default function MentorDetail() {
    const { id } = useParams();
    const { user, isAuthenticated } = useAuth();
    // ... 상태 정의
    
    const mentorId = id ? parseInt(id, 10) : 0;
    const isValidMentorId = !isNaN(mentorId) && mentorId > 0;
    
-   const { data: mentor, isLoading } = trpc.mentor.getById.useQuery(
+   const { data: mentor, isLoading, isError, error } = trpc.mentor.getById.useQuery(
      { mentorId },
      { enabled: isValidMentorId }
    );
    
    // ... 다른 쿼리들
    
    return (
      <PageLayout>
+       {isError && (
+         <div className="container mx-auto px-4 py-12">
+           <div className="text-center">
+             <h2 className="text-2xl font-bold mb-4">멘토를 찾을 수 없습니다</h2>
+             <p className="text-muted-foreground mb-6">{error?.message || "요청 처리 중 오류가 발생했습니다"}</p>
+             <Link href="/mentors">
+               <Button>멘토 목록으로 돌아가기</Button>
+             </Link>
+           </div>
+         </div>
+       )}
+       
+       {isLoading && (
+         <div className="container mx-auto px-4 py-12">
+           <div className="text-center">
+             <p className="text-muted-foreground">멘토 정보를 불러오는 중입니다...</p>
+           </div>
+         </div>
+       )}
+       
+       {!isError && !isLoading && !mentor && (
+         <div className="container mx-auto px-4 py-12">
+           <div className="text-center">
+             <p className="text-muted-foreground">멘토 정보를 찾을 수 없습니다</p>
+           </div>
+         </div>
+       )}
+       
+       {!isError && !isLoading && mentor && (
          {/* 기존 렌더링 로직 */}
+       )}
      </PageLayout>
    );
  }
```

**적용 시간**: 5분

---

## 3️⃣ MentorDetail.tsx - 중복 신청 방지 (P0 - 즉시)

**파일**: `client/src/pages/MentorDetail.tsx`

**변경 사항**: 버튼 상태 추가

```diff
  const handleBooking = () => {
    if (!scheduledAt || !duration || !scheduledHour || !scheduledMinute) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }
    
    // ... 기존 로직
    
    createBookingMutation.mutate({
      // ...
    });
  };
  
  return (
    // ... 기존 코드
    <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
      <DialogContent>
        {/* ... */}
        <DialogFooter>
-         <Button onClick={handleBooking}>상담 신청</Button>
+         <Button 
+           onClick={handleBooking}
+           disabled={createBookingMutation.isPending}
+         >
+           {createBookingMutation.isPending ? "신청 중..." : "상담 신청"}
+         </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
```

**적용 시간**: 3분

---

## 4️⃣ Navbar.tsx - 메뉴 중복 제거 (P1 - 1시간)

**파일**: `client/src/components/layout/Navbar.tsx`

**변경 사항**: 메뉴 배열 상수화

```diff
+ const NAVBAR_MENU = [
+   { href: "/mentors", label: "멘토 찾기" },
+   { href: "/bookings", label: "상담 문의" },
+   { href: "/my-profile", label: "내 프로필" },
+   { href: "/notifications", label: "알림" },
+ ];

  export default function Navbar({ onBugReport }: NavbarProps) {
    const { isAuthenticated } = useAuth();
    const logoutMutation = trpc.auth.logout.useMutation({
      onSuccess: () => {
        window.location.href = "/";
      },
    });

    return (
      <nav className="border-b border-border bg-[#fdfcfd] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img
                  src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png"
                  alt="Univ Match"
                  className="h-14 sm:h-20 w-auto"
                />
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
-                 <Link href="/mentors" className="hidden md:block">
-                   <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
-                     멘토 찾기
-                   </Button>
-                 </Link>
-                 <Link href="/bookings" className="hidden md:block">
-                   <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
-                     상담 문의
-                   </Button>
-                 </Link>
-                 <Link href="/my-profile" className="hidden md:block">
-                   <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
-                     내 프로필
-                   </Button>
-                 </Link>
-                 <Link href="/notifications" className="hidden md:block">
-                   <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
-                     알림
-                   </Button>
-                 </Link>
+                 {NAVBAR_MENU.map((item) => (
+                   <Link key={item.href} href={item.href} className="hidden md:block">
+                     <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
+                       {item.label}
+                     </Button>
+                   </Link>
+                 ))}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <span className="hidden sm:inline">메뉴</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuItem onClick={onBugReport} className="hover:bg-blue-100 hover:text-primary">
                        <Bug className="h-4 w-4 mr-2" />
                        버그 신고
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
-                     <DropdownMenuItem asChild className="md:hidden">
-                       <Link href="/mentors">멘토 찾기</Link>
-                     </DropdownMenuItem>
-                     <DropdownMenuItem asChild className="md:hidden">
-                       <Link href="/bookings">상담 문의</Link>
-                     </DropdownMenuItem>
-                     <DropdownMenuItem asChild className="md:hidden">
-                       <Link href="/my-profile">내 프로필</Link>
-                     </DropdownMenuItem>
-                     <DropdownMenuItem asChild className="md:hidden">
-                       <Link href="/notifications">알림</Link>
-                     </DropdownMenuItem>
+                     {NAVBAR_MENU.map((item) => (
+                       <DropdownMenuItem key={item.href} asChild className="md:hidden">
+                         <Link href={item.href}>{item.label}</Link>
+                       </DropdownMenuItem>
+                     ))}
                      <DropdownMenuSeparator className="md:hidden" />
                      <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/delete-account">
                          <Trash2 className="h-4 w-4 mr-2" />
                          계정 탈퇴
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                // ... 비로그인 상태
              )}
            </div>
          </div>
        </div>
      </nav>
    );
  }
```

**적용 시간**: 10분

---

## 5️⃣ Mentors.tsx - 검색 디바운스 추가 (P1 - 30분)

**파일**: `client/src/pages/Mentors.tsx`

**변경 사항**: useMemo + useCallback 추가

```diff
- import { useState } from "react";
+ import { useState, useMemo, useCallback } from "react";

  export default function Mentors() {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedField, setSelectedField] = useState<string>("all");
    const [selectedRegion, setSelectedRegion] = useState<string>("all");

    // ... 기존 쿼리들

-   const filteredMentors = mentors?.filter((m) => {
+   const handleSearchChange = useCallback((value: string) => {
+     setSearchTerm(value);
+   }, []);
+
+   const filteredMentors = useMemo(() => {
+     if (!mentors) return [];
      const searchLower = searchTerm.toLowerCase();
      return mentors.filter((m) => {
        const searchLower = searchTerm.toLowerCase();
        return (
          m.profile.university.toLowerCase().includes(searchLower) ||
          m.profile.major.toLowerCase().includes(searchLower) ||
          m.user.name?.toLowerCase().includes(searchLower)
        );
      });
-   });
+   }, [mentors, searchTerm]);

    return (
      <PageLayout>
        {/* ... */}
        <Input
          placeholder="대학, 전공, 이름으로 검색"
          value={searchTerm}
-         onChange={(e) => setSearchTerm(e.target.value)}
+         onChange={(e) => handleSearchChange(e.target.value)}
        />
        {/* ... */}
      </PageLayout>
    );
  }
```

**적용 시간**: 5분

---

## 6️⃣ Home.tsx - 페이지별 메타 태그 유틸 생성 (P1 - 30분)

**파일**: `client/src/lib/seo.ts` (새 파일)

```typescript
export function setPageMeta(
  title: string,
  description: string,
  ogImage?: string
) {
  // 페이지 제목
  document.title = title;

  // Meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", description);
  }

  // OG 태그
  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) {
    ogTitle.setAttribute("content", title);
  }

  const ogDescription = document.querySelector('meta[property="og:description"]');
  if (ogDescription) {
    ogDescription.setAttribute("content", description);
  }

  if (ogImage) {
    const ogImageMeta = document.querySelector('meta[property="og:image"]');
    if (ogImageMeta) {
      ogImageMeta.setAttribute("content", ogImage);
    }
  }
}
```

**파일**: `client/src/pages/Mentors.tsx`

```diff
+ import { setPageMeta } from "@/lib/seo";

  export default function Mentors() {
    // ... 상태 정의
    
+   useEffect(() => {
+     setPageMeta(
+       "멘토 찾기 - 유니브매치",
+       "원하는 대학, 전공, 학년으로 멘토를 검색하고 상담을 예약하세요."
+     );
+   }, []);

    return (
      // ... 기존 렌더링
    );
  }
```

**적용 시간**: 10분

---

## 7️⃣ Navbar.tsx - aria-label 추가 (P2 - 15분)

**파일**: `client/src/components/layout/Navbar.tsx`

```diff
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        size="sm" 
        className="gap-2"
+       aria-label="네비게이션 메뉴 열기"
      >
        <span className="hidden sm:inline">메뉴</span>
        <ChevronDown className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    {/* ... */}
  </DropdownMenu>

  {NAVBAR_MENU.map((item) => (
-   <Link key={item.href} href={item.href} className="hidden md:block">
+   <Link 
+     key={item.href} 
+     href={item.href} 
+     className="hidden md:block"
+     aria-label={`${item.label} 페이지로 이동`}
+   >
      <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
        {item.label}
      </Button>
    </Link>
  ))}
```

**적용 시간**: 5분

---

## 8️⃣ 환경 변수 검증 (P0 - 30분)

**파일**: `server/_core/env.ts` (새 파일)

```typescript
export function validateEnv() {
  const required = [
    "DATABASE_URL",
    "STRIPE_SECRET_KEY",
    "JWT_SECRET",
    "OAUTH_SERVER_URL",
  ];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  console.log("✅ All required environment variables are set");
}
```

**파일**: `server/_core/index.ts`

```diff
+ import { validateEnv } from "./env";

+ // 서버 시작 시 환경 변수 검증
+ validateEnv();

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-12-15.clover",
  });
```

**적용 시간**: 10분

---

## 9️⃣ console.log 제거 (P2 - 15분)

**파일**: 프로젝트 전체 검색

```bash
# 모든 console.log 찾기
grep -r "console\." client/src server --include="*.tsx" --include="*.ts"

# 각 파일에서 console.log 제거
```

**적용 시간**: 10분

---

## 🔟 Navbar 로고 이미지 최적화 (P1 - 20분)

**파일**: `client/src/components/layout/Navbar.tsx`

```diff
+ const logoUrl = import.meta.env.VITE_LOGO_URL || "https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png";

  <Link href="/">
    <div className="flex items-center gap-2 cursor-pointer">
      <img
-       src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png"
+       src={logoUrl}
        alt="Univ Match"
        className="h-14 sm:h-20 w-auto"
+       width={80}
+       height={80}
      />
    </div>
  </Link>
```

**파일**: `.env`

```
VITE_LOGO_URL=https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png
```

**적용 시간**: 5분

---

## 📊 적용 요약

| 순서 | 패치 | 파일 | 시간 | 우선순위 |
|:---:|------|------|:---:|:---:|
| 1 | useAuth import | Navbar.tsx | 1분 | P0 |
| 2 | 에러 처리 | MentorDetail.tsx | 5분 | P0 |
| 3 | 중복 신청 방지 | MentorDetail.tsx | 3분 | P0 |
| 4 | 메뉴 중복 제거 | Navbar.tsx | 10분 | P1 |
| 5 | 검색 디바운스 | Mentors.tsx | 5분 | P1 |
| 6 | SEO 메타 태그 | Home.tsx + lib/seo.ts | 10분 | P1 |
| 7 | aria-label | Navbar.tsx | 5분 | P2 |
| 8 | 환경 변수 검증 | server/_core/env.ts | 10분 | P0 |
| 9 | console.log 제거 | 전체 | 10분 | P2 |
| 10 | 로고 최적화 | Navbar.tsx | 5분 | P1 |
| **합계** | - | - | **64분** | - |

---

## 🚀 적용 방법

1. 우선순위 순서대로 패치 적용 (P0 → P1 → P2)
2. 각 패치 적용 후 `pnpm test` 실행
3. 브라우저에서 기능 확인
4. 모든 패치 적용 후 `webdev_save_checkpoint` 실행

---

**다음 단계**: 최종 산출물 (구조 제안, 기대효과, TODO) 생성 중...
