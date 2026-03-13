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

  // 멘토 프로필 확인
  const { data: mentorProfile } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 멘토인 경우 MentorProfile 페이지로 리다이렉트
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
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>프로필을 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">내 프로필</h1>

          {/* 프로필 정보 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                개인 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">이름</p>
                  <p className="font-semibold">{user?.name || "정보 없음"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">역할</p>
                  <p className="font-semibold">고등학생 (멘티)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    이메일
                  </p>
                  <p className="font-semibold text-sm">{user?.email || "정보 없음"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    전화번호
                  </p>
                  <p className="font-semibold text-sm">{user?.phoneNumber || "정보 없음"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 상담 신청 현황 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                상담 신청
              </CardTitle>
              <CardDescription>신청한 멘토 상담 목록</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p className="mb-4">아직 신청한 상담이 없습니다.</p>
                <Link href="/mentors">
                  <Button className="bg-green-600 hover:bg-green-700 text-white">멘토 찾기</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* 상담 일정 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                상담 일정
              </CardTitle>
              <CardDescription>예정된 멘토 상담</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>예정된 상담이 없습니다.</p>
              </div>
            </CardContent>
          </Card>

          {/* 메시지 */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                메시지
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/messages">
                <Button variant="outline" className="w-full">
                  메시지 보기
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* 멘토 찾기 안내 카드 */}
          <Card className="mb-6 border-blue-200 bg-blue-50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Search className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-blue-900 mb-1">
                    멘토를 찾고 있으신가요?
                  </h3>
                  <p className="text-sm text-blue-800 mb-3">
                    전문 멘토들과 함께 대학 입시, 진로 상담, 학업 관리 등 다양한 도움을 받을 수 있습니다.
                  </p>
                  <Link href="/mentors">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      <Search className="h-4 w-4 mr-2" />
                      멘토 찾기
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 멘토 등록 안내 카드 */}
          <Card className="mb-6 border-amber-200 bg-amber-50 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User className="h-4 w-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-amber-900 mb-1">
                    멘토로 활동하고 싶으신가요?
                  </h3>
                  <p className="text-sm text-amber-800 mb-3">
                    대학생이라면 누구나 멘토로 등록하여 후배들을 도와줄 수 있습니다. 멘토 활동으로 보람찬 경험을 쌓아보세요.
                  </p>
                  <Link href="/my-profile">
                    <Button
                      className="bg-amber-600 hover:bg-amber-700 text-white"
                      size="sm"
                    >
                      멘토 등록하기
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 계정 관리 */}
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-base">계정 관리</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => {
                  if (confirm("정말로 로그아웃하시겠습니까?")) {
                    logout();
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
