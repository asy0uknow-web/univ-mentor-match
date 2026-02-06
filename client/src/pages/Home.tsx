import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import { GraduationCap, Users, Star, Calendar, LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import BugReportModal from "@/components/BugReportModal";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [showBugReport, setShowBugReport] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });
  
  useEffect(() => {
    document.title = "대학 멘토 매칭 - 고등학생을 위한 대학생 멘토 상담 플랫폼";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', '고등학생이 대학생 멘토로부터 입시 상담, 학과 정보, 대학생활 조언을 받을 수 있는 1:1 매칭 플랫폼입니다.');
    }
  }, []);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-slate-50 sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png" alt="Univ Match" className="h-14 sm:h-20 w-auto" />
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base hover:bg-primary hover:text-white">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base hover:bg-primary hover:text-white">상담 문의</Button>
                  </Link>
                  <Link href="/my-profile" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base hover:bg-primary hover:text-white">내 프로필</Button>
                  </Link>
                  <Link href="/notifications" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base hover:bg-primary hover:text-white">알림</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <span className="hidden sm:inline">메뉴</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setShowBugReport(true)}>
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
                <a href={getLoginUrl()}>
                  <Button size="sm">로그인</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Sacred Geometry */}
      <section className="relative py-12 sm:py-20 md:py-32 overflow-hidden sacred-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center geometric-circles">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-primary">전공 선택</span>은
              <br />
              단순한 정보 선택이 아닙니다.
            </h1>
            <p className="subtitle text-base sm:text-lg md:text-xl lg:text-xl mb-6 sm:mb-8 text-muted-foreground leading-relaxed">
              대학 중도 내 남은 시간을 어떻게 보내는지,<br className="hidden sm:block" />
              내 적성에 매나는지 알 수 없다면 더 진단이 필요합니다.
              <br className="hidden sm:block" />
              <br className="hidden sm:block" />
              다른 대학생들은 어떻게 다니고 있을까요?
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 justify-center">
              <Link href="/mentors" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                  전공 선택 전에, 이야기부터 들어보기
                </Button>
              </Link>
              {isAuthenticated && (
                <Link href="/my-profile" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
                    멘토로 참여하기
                  </Button>
                </Link>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* New Headline Section */}
      <section className="py-12 sm:py-20 bg-slate-50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 leading-relaxed">
              <span className="text-primary">전공 선택은 고관여 의사결정</span>이 되었지만,<br className="hidden sm:block" />
              <span className="text-primary">검증 수단은 여전히 부족합니다.</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground mt-4 sm:mt-6">
              전공 세분화가 심화되고, 전과·자퇴·반수가 증가하는 이유입니다.<br className="hidden sm:block" />
              이제 입시 실패보다 <span className="font-semibold">전공 미스매치의 비용이 더 커졌습니다.</span>
            </p>
          </div>
        </div>
      </section>

      {/* Problem Definition Section */}
      <section className="py-12 sm:py-20 bg-white border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
              왜 전공 선택은 항상 늦게 후회될까
            </h2>
            
            <div className="space-y-8 text-base sm:text-lg text-muted-foreground leading-relaxed">
              <p className="space-y-3">
                학과 정보는 많지만<br />
                실제 생활 정보는 거의 없습니다.
                <br />
                <br />
                커리큘럼, 분위기, 적성 여부는<br />
                입학 후에야 알게 되고,<br />
                합격 후기와 커뮤니티 글은<br />
                결과 중심이고 편향되어 있습니다.
              </p>
              

              
              <div className="bg-accent/10 border border-accent/20 rounded-lg p-4 sm:p-6 mt-6">
                <p className="font-semibold text-foreground mb-3">
                  전공 선택은 고관여 의사결정이 되었지만, 검증 수단은 여전히 부족합니다.
                </p>
                <p className="text-sm sm:text-base">
                  전공 세분화가 심화되고, 전과·자퇴·반수가 증가하는 이유입니다. 이제 입시 실패보다 전공 미스매치의 비용이 더 커졌습니다.
                </p>
              </div>
              
              <p className="text-center font-semibold text-foreground mt-8">
                그래서 전공 선택에는<br className="hidden sm:block" />
                정보보다 먼저<br className="hidden sm:block" />
                <span className="text-primary">확인이 필요해졌습니다.</span>
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* How It Works */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            <span className="text-primary">이용 방법</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                1
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">멘토 검색</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                  원하는 대학, 전공, 학년으로 필터링하여 나에게 맞는 멘토를 찾으세요
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                2
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">상담 예약</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                  멘토의 프로필과 리뷰를 확인하고 원하는 시간에 상담을 예약하세요
                </p>
              </div>
            </div>

            <div className="flex gap-4 sm:gap-6 items-start">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                3
              </div>
              <div>
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">1:1 상담</h3>
                <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
                  예약된 시간에 멘토와 만나 진로에 대한 조언을 받으세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-primary/10 golden-spiral">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            수많은 고등학생들이 대학 멘토 매칭을 통해 꿈에 한 걸음 더 다가가고 있습니다
          </p>
          <Link href="/mentors" className="inline-block">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
              멘토 찾아보기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm sm:text-base">
          <p>&copy; 2026 대학 멘토 매칭. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Bug Report Modal */}
      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
    </div>
  );
}
