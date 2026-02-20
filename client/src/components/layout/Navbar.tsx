import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useEffect, useRef } from "react";

interface NavbarProps {
  onBugReport: () => void;
}

const NAVBAR_MENU = [
  { href: "/mentors", label: "멘토 찾기" },
  { href: "/bookings", label: "상담 문의" },
  { href: "/my-profile", label: "내 프로필" },
  { href: "/my-info", label: "내 정보" },
  { href: "/notifications", label: "알림" },
] as const;

// 홈페이지 메뉴 (스크롤 이동)
const HOME_MENU = [
  { id: "hero", label: "전공 선택" },
  { id: "service-intro", label: "서비스 소개" },
  { id: "how-it-works", label: "이용 방법" },
] as const;

const LOGO_URL = "/logo.png";

export default function Navbar({ onBugReport }: NavbarProps) {
  const { isAuthenticated } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const isHomePage = typeof window !== "undefined" && window.location.pathname === "/";

  const handleSmoothScroll = (elementId: string) => {
    const element = document.getElementById(elementId);
    if (element) {
      const navHeight = 80; // 네비게이션 바 높이 (px)
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - navHeight;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav
      className="border-b border-border bg-[#fdfcfd] sticky top-0 z-50 shadow-sm"
      role="navigation"
      aria-label="메인 네비게이션"
    >
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          {/* 왼쪽: 로고 */}
          <Link href="/" aria-label="유니브매치 홈으로 이동">
            <img
              src={LOGO_URL}
              alt="유니브매치 로고"
              className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto cursor-pointer flex-shrink-0"
              width={80}
              height={80}
              loading="eager"
            />
          </Link>

          {/* 중앙: 메뉴 (홈페이지에서만 표시) */}
          {isHomePage && (
            <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {HOME_MENU.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSmoothScroll(item.id)}
                  className="text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors"
                  aria-label={`${item.label} 섹션으로 이동`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* 오른쪽: CTA 또는 메뉴 */}
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                {NAVBAR_MENU.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="hidden md:block"
                    aria-label={`${item.label} 페이지로 이동`}
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-base font-medium hover:bg-blue-100 hover:text-primary"
                    >
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-2"
                      aria-label="네비게이션 메뉴 열기"
                    >
                      <span className="hidden sm:inline">메뉴</span>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 bg-white">
                    <DropdownMenuItem
                      onClick={onBugReport}
                      className="hover:bg-blue-100 hover:text-primary"
                    >
                      <Bug className="h-4 w-4 mr-2" aria-hidden="true" />
                      버그 신고
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {NAVBAR_MENU.map((item) => (
                      <DropdownMenuItem
                        key={item.href}
                        asChild
                        className="md:hidden"
                      >
                        <Link href={item.href}>{item.label}</Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator className="md:hidden" />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/delete-account">
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        계정 탈퇴
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-3 sm:gap-4">
                {/* 로그인 텍스트 링크 */}
                <a 
                  href={getLoginUrl()} 
                  className="text-sm sm:text-base font-medium text-foreground hover:text-primary transition-colors"
                  aria-label="로그인 페이지로 이동"
                >
                  로그인
                </a>
                
                {/* 구분선 (데스크톱에서만) */}
                <div className="hidden sm:block w-px h-6 bg-border"></div>
                
                {/* CTA 버튼 */}
                <a href={getLoginUrl()} aria-label="회원가입 페이지로 이동">
                  <Button 
                    size="lg" 
                    className="rounded-full bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 text-sm sm:text-base"
                  >
                    무료로 시작하기
                  </Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
