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
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">대학 멘토 매칭</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors">
                    <Button variant="ghost">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings">
                    <Button variant="ghost">상담 문의</Button>
                  </Link>
                  <Link href="/my-profile">
                    <Button variant="ghost">내 프로필</Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost">알림</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="gap-2">
                        메뉴
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setShowBugReport(true)}>
                        <Bug className="h-4 w-4 mr-2" />
                        버그 신고
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
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
                  <Button>로그인</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Sacred Geometry */}
      <section className="relative py-20 md:py-32 overflow-hidden sacred-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center geometric-circles">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6">
              당신의 꿈을 향한
              <br />
              <span className="text-primary">완벽한 멘토</span>를 만나세요
            </h1>
            <p className="subtitle text-xl md:text-2xl mb-8">
              대학생 선배와의 1:1 상담으로 진로를 설계하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/mentors">
                <Button size="lg" className="text-lg px-8 py-6">
                  멘토 찾아보기
                </Button>
              </Link>
              {isAuthenticated && (
                <Link href="/my-profile">
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                    멘토로 등록하기
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            왜 <span className="text-primary">대학 멘토 매칭</span>인가요?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-primary mb-4" />
                <CardTitle>검증된 멘토</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  현직 대학생들이 직접 경험한 입시와 대학 생활을 공유합니다
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <GraduationCap className="h-12 w-12 text-primary mb-4" />
                <CardTitle>맞춤형 상담</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  원하는 대학과 전공의 선배를 직접 선택하여 상담받으세요
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Star className="h-12 w-12 text-primary mb-4" />
                <CardTitle>리뷰 시스템</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  실제 상담 후기를 통해 신뢰할 수 있는 멘토를 선택하세요
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardHeader>
                <Calendar className="h-12 w-12 text-primary mb-4" />
                <CardTitle>간편한 예약</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  원하는 시간에 바로 예약하고 안전하게 결제하세요
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">
            <span className="text-primary">이용 방법</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">멘토 검색</h3>
                <p className="text-muted-foreground text-lg">
                  원하는 대학, 전공, 학년으로 필터링하여 나에게 맞는 멘토를 찾으세요
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">상담 예약</h3>
                <p className="text-muted-foreground text-lg">
                  멘토의 프로필과 리뷰를 확인하고 원하는 시간에 상담을 예약하세요
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                3
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">안전한 결제</h3>
                <p className="text-muted-foreground text-lg">
                  Stripe를 통한 안전한 결제로 상담료를 지불하세요
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                4
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">1:1 상담</h3>
                <p className="text-muted-foreground text-lg">
                  예약된 시간에 멘토와 만나 진로에 대한 조언을 받으세요
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xl">
                5
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2">리뷰 작성</h3>
                <p className="text-muted-foreground text-lg">
                  상담 후 리뷰를 남겨 다른 학생들에게 도움을 주세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary/10 golden-spiral">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            수많은 고등학생들이 대학 멘토 매칭을 통해 꿈에 한 걸음 더 다가가고 있습니다
          </p>
          <Link href="/mentors">
            <Button size="lg" className="text-lg px-8 py-6">
              멘토 찾아보기
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border bg-card">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2026 대학 멘토 매칭. All rights reserved.</p>
        </div>
      </footer>
      
      {/* Bug Report Modal */}
      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
    </div>
  );
}
