import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { MessageCircle, Calendar, User, Mail, LogOut, Search, Loader2, ArrowRight } from "lucide-react";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function StudentProfile() {
  useEffect(() => {
    setPageMeta(PAGE_META.profile);
  }, []);

  const { user, isAuthenticated, logout, loading } = useAuth({ redirectOnUnauthenticated: false });
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
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-4">
        <div className="card-premium-lg max-w-md w-full p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-muted-foreground mb-6">프로필을 보려면 로그인해주세요.</p>
          <a href={getLoginUrl()}>
            <Button className="w-full text-sm font-semibold py-3 rounded-md bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
              로그인
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <PageLayout>
      <div
        className="fixed inset-0 bg-cover bg-center bg-fixed -z-10"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/student-profile-background-86NR9pzkuz6JK2dxLnWgnL.webp)',
        }}
      >
        <div className="absolute inset-0 bg-white/75 dark:bg-slate-950/80 backdrop-blur-sm"></div>
      </div>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 relative z-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">내 프로필</h1>
          <p className="text-muted-foreground mb-8">멘티 계정 정보 및 활동 관리</p>

          {/* 프로필 정보 */}
          <div className="card-premium-lg p-6 sm:p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">개인 정보</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">이름</p>
                  <p className="font-semibold text-sm sm:text-base text-foreground">{user?.name || "정보 없음"}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1">역할</p>
                  <p className="font-semibold text-sm sm:text-base text-primary">멘티</p>
                </div>
              </div>
              <div>
                <p className="text-xs sm:text-sm text-muted-foreground font-medium mb-1 flex items-center gap-1">
                  <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                  이메일
                </p>
                <p className="font-semibold text-xs sm:text-sm break-all text-foreground">{user?.email || "정보 없음"}</p>
              </div>
            </div>
          </div>

          {/* 멘토 찾기 */}
          <div className="card-premium-lg p-6 sm:p-8 mb-6 group hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">멘토 찾기</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              당신에게 맞는 멘토를 찾아보세요.
            </p>
            <Link href="/mentors">
              <Button className="w-full text-sm font-semibold py-2.5 rounded-md bg-secondary hover:bg-secondary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
                멘토 목록 보기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* 예약 내역 */}
          <div className="card-premium-lg p-6 sm:p-8 mb-6 group hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-accent" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">예약 내역</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              예약한 상담 내역을 확인하세요.
            </p>
            <Link href="/bookings">
              <Button variant="outline" className="w-full text-sm font-semibold py-2.5 rounded-md border border-border hover:bg-muted transition-colors duration-200 flex items-center justify-center gap-2">
                예약 내역 보기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* 메시지 */}
          <div className="card-premium-lg p-6 sm:p-8 mb-6 group hover:-translate-y-1 transition-transform duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground">메시지</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              멘토와의 메시지를 확인하세요.
            </p>
            <Link href="/messages">
              <Button variant="outline" className="w-full text-sm font-semibold py-2.5 rounded-md border border-border hover:bg-muted transition-colors duration-200 flex items-center justify-center gap-2">
                메시지 보기
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* 계정 관리 */}
          <div className="card-premium-lg p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">계정 관리</h2>
            <div className="space-y-3">
              <Button
                onClick={logout}
                variant="outline"
                className="w-full justify-start text-sm font-medium py-2.5 rounded-md border border-border hover:bg-muted transition-colors duration-200"
              >
                <LogOut className="h-4 w-4 mr-2" />
                로그아웃
              </Button>
              <Link href="/delete-account">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm font-medium py-2.5 rounded-md text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 transition-colors duration-200"
                >
                  계정 삭제
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
