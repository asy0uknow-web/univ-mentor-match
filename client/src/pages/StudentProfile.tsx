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


        </div>
      </div>
    </PageLayout>
  );
}
