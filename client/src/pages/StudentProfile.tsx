import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { MessageCircle, Calendar, User, Mail, Phone, LogOut, Search, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function StudentProfile() {
  useEffect(() => {
    setPageMeta(PAGE_META.profile);
  }, []);

  const { user, isAuthenticated, logout, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: mentorProfile } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!loading && mentorProfile) {
      setLocation("/my-profile");
    }
  }, [mentorProfile, loading, setLocation]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
            <CardDescription className="text-xs sm:text-sm">프로필을 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full text-xs sm:text-sm h-9 sm:h-10">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">내 프로필</h1>

          {/* 프로필 정보 */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                개인 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">이름</p>
                  <p className="font-semibold text-sm sm:text-base">{user?.name || "정보 없음"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">역할</p>
                  <p className="font-semibold text-sm sm:text-base">멘티</p>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  이메일
                </p>
                <p className="font-semibold text-xs sm:text-sm break-all">{user?.email || "정보 없음"}</p>
              </div>
            </CardContent>
          </Card>

          {/* 멘토 찾기 */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                멘토 찾기
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                당신에게 맞는 멘토를 찾아보세요.
              </p>
              <Link href="/mentors">
                <Button className="w-full text-xs sm:text-sm h-9 sm:h-10">멘토 목록 보기</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 예약 내역 */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />
                예약 내역
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                예약한 상담 내역을 확인하세요.
              </p>
              <Link href="/bookings">
                <Button variant="outline" className="w-full text-xs sm:text-sm h-9 sm:h-10">예약 내역 보기</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 메시지 */}
          <Card className="mb-4 sm:mb-6">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                메시지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                멘토와의 메시지를 확인하세요.
              </p>
              <Link href="/messages">
                <Button variant="outline" className="w-full text-xs sm:text-sm h-9 sm:h-10">메시지 보기</Button>
              </Link>
            </CardContent>
          </Card>

          {/* 계정 관리 */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">계정 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 sm:space-y-3">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10"
              >
                <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                로그아웃
              </Button>
              <Link href="/delete-account">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  계정 삭제
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
