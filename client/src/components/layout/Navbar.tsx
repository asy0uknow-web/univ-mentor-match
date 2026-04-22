import { useAuth } from "@/_core/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { LogOut, Trash2, ChevronDown, Bug, Sun, Moon, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

interface NavbarProps {
  onBugReport: () => void;
}

// 로그인 상태별 메뉴
const AUTHENTICATED_MENU = [
  { href: "/mentors", label: "멘토 찾기" },
  { href: "/messages", label: "상담 신청" },
  { href: "/bookings", label: "예약 내역" },
  { href: "/qna", label: "Q&A" },
  { href: "/columns", label: "멘토 칼럼" },
] as const;

// 로그인 전 메뉴 (항상 표시)
const UNAUTHENTICATED_MENU = [
  { href: "/mentors", label: "멘토 찾기" },
  { href: "/qna", label: "Q&A" },
  { href: "/columns", label: "멘토 칼럼" },
] as const;

const DROPDOWN_MENU = [
  { href: "/my-profile", label: "내 프로필" },
  { href: "/notifications", label: "알림" },
] as const;

const LOGO_URL = "/logonew.png";

export default function Navbar({ onBugReport }: NavbarProps) {
  const { isAuthenticated, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });
  
  // 멘티의 미확인 답변 알림 수 조회
  // 차후 API 구현 예정
  const unreadAnswerCount = 0; // 임시 값

  const isHomePage = typeof window !== "undefined" && window.location.pathname === "/";

  return (
    <nav
      className="border-b border-border bg-background sticky top-0 z-50 shadow-sm"
      role="navigation"
      aria-label="메인 네비게이션"
    >
      <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-16">
          {/* 왼쪽: 로고 + 브랜드 텍스트 */}
          <Link href="/" aria-label="유니브매치 홈으로 이동" className="flex items-center gap-2 flex-shrink-0">
            <img
              src={LOGO_URL}
              alt="유니브매치 로고"
              className="h-10 sm:h-12 w-auto cursor-pointer"
              width={80}
              height={80}
              loading="eager"
            />
            <span className="font-bold text-sm sm:text-lg lg:text-xl text-foreground">유니브매치</span>
          </Link>

          {/* 중앙: 주요 네비게이션 메뉴 (md 이상에서만) */}
          <div className="hidden md:flex items-center gap-8 flex-1 justify-center">
            {(isAuthenticated ? AUTHENTICATED_MENU : UNAUTHENTICATED_MENU).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-foreground hover:text-primary transition-all duration-200 relative group"
                aria-label={`${item.label} 페이지로 이동`}
              >
                {item.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}
          </div>

          {/* 오른쪽: 다크 모드 토글 + 로그인 상태별 메뉴 */}
          <div className="flex items-center gap-2 sm:gap-4 ml-auto">
            {/* 다크 모드 토글 버튼 */}
            {toggleTheme && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full w-9 h-9 p-0 hover:bg-muted"
                aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
              >
                {theme === 'dark' ? (
                  <Sun className="h-4 w-4 text-yellow-400" />
                ) : (
                  <Moon className="h-4 w-4 text-foreground" />
                )}
              </Button>
            )}

            {isAuthenticated ? (
              <>
                {/* 데스크톱: 가로 메뉴 (이미 중앙에 표시됨) */}

                {/* 드롭다운 메뉴 (모든 화면에서) */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 px-2 sm:px-3"
                      aria-label="네비게이션 메뉴 열기"
                    >
                      <span className="hidden sm:inline text-sm font-medium">메뉴</span>
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-52 bg-card shadow-lg">
                    {/* 모바일: 인증 메뉴 */}
                    <div className="md:hidden">
                      {AUTHENTICATED_MENU.map((item) => (
                        <DropdownMenuItem key={item.href} asChild>
                          <Link href={item.href} className="cursor-pointer">
                            {item.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                    </div>

                    {/* 드롭다운 메뉴 항목 */}
                    {DROPDOWN_MENU.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onBugReport()}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Bug className="h-4 w-4 mr-2" aria-hidden="true" />
                      버그 신고
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => logoutMutation.mutate()}
                      disabled={logoutMutation.isPending}
                      className="cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
                      {logoutMutation.isPending ? "로그아웃 중..." : "로그아웃"}
                    </DropdownMenuItem>

                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/delete-account" className="cursor-pointer">
                        <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
                        계정 탈퇴
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* 모바일: 드롭다운 메뉴 */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="md:hidden gap-1 px-2"
                      aria-label="네비게이션 메뉴 열기"
                    >
                      <ChevronDown className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="bottom" sideOffset={8} className="w-52 bg-card shadow-lg">
                    {UNAUTHENTICATED_MENU.map((item) => (
                      <DropdownMenuItem key={item.href} asChild>
                        <Link href={item.href} className="cursor-pointer">
                          {item.label}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onBugReport()}
                      className="hover:bg-primary/10 cursor-pointer"
                    >
                      <Bug className="h-4 w-4 mr-2" aria-hidden="true" />
                      버그 신고
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 로그인 버튼 */}
                <Link href="/login" aria-label="로그인 페이지로 이동">
                  <Button 
                    size="sm"
                    className="rounded-md bg-primary hover:bg-primary/90 text-white font-medium px-4 sm:px-6 text-xs sm:text-sm shadow-sm transition-all duration-200"
                  >
                    로그인
                  </Button>
                </Link>
                {/* 회원가입 버튼 */}
                <Link href="/signup" aria-label="회원가입 페이지로 이동">
                  <Button 
                    size="sm"
                    variant="outline"
                    className="rounded-md border border-border text-foreground hover:bg-muted font-medium px-4 sm:px-6 text-xs sm:text-sm transition-colors duration-200"
                  >
                    회원가입
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
