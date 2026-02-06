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

interface NavbarProps {
  onBugReport: () => void;
}

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
                <Link href="/mentors" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
                    멘토 찾기
                  </Button>
                </Link>
                <Link href="/bookings" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
                    상담 문의
                  </Button>
                </Link>
                <Link href="/my-profile" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
                    내 프로필
                  </Button>
                </Link>
                <Link href="/notifications" className="hidden md:block">
                  <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
                    알림
                  </Button>
                </Link>
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
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/mentors">멘토 찾기</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/bookings">상담 문의</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/my-profile">내 프로필</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="md:hidden">
                      <Link href="/notifications">알림</Link>
                    </DropdownMenuItem>
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
              <div className="flex items-center gap-2">
                <a href={getLoginUrl()}>
                  <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">
                    로그인
                  </Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button size="sm">회원가입</Button>
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
