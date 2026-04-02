import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, Calendar, Clock, MessageCircle, User, BookOpen, Trash2, ChevronDown, RefreshCw, Play, CheckCircle, Star } from "lucide-react";
import BugReportModal from "@/components/BugReportModal";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";


export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();

  // URL 쿼리 파라미터에서 mentorId 추출
  const params = new URLSearchParams(window.location.search);
  const mentorIdParam = params.get('mentorId');

  useEffect(() => {
    setPageMeta(PAGE_META.bookings);
  }, []);

  // 학생 역할: 예약 조회
  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.booking.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.userType === "high_school_student",
  });

  // 멘토 역할: 받은 상담 신청 조회
  const { data: mentorBookings, isLoading: mentorBookingsLoading, refetch: refetchMentorBookings } = trpc.mentor.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.userType === "university_student",
  });

  // 상담 시작 뮤테이션
  const startConsultationMutation = trpc.booking.startConsultation.useMutation({
    onSuccess: () => {
      alert("상담이 시작되었습니다");
      refetchBookings();
      refetchMentorBookings();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 상담 완료 뮤테이션
  const completeConsultationMutation = trpc.booking.completeConsultation.useMutation({
    onSuccess: () => {
      alert("상담이 완료되었습니다");
      refetchBookings();
      refetchMentorBookings();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
            <CardDescription className="text-xs sm:text-sm">예약 내역을 보려면 로그인해주세요.</CardDescription>
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

  // 상담 신청 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="text-xs">대기 중</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500 text-xs">확정됨</Badge>;
      case "in_progress":
        return <Badge className="bg-blue-500 text-xs">진행 중</Badge>;
      case "completed":
        return <Badge className="bg-purple-500 text-xs">완료됨</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="text-xs">취소됨</Badge>;
      case "reschedule_requested":
        return <Badge className="bg-orange-500 text-xs">일정 변경 요청</Badge>;
      default:
        return <Badge className="text-xs">{status}</Badge>;
    }
  };

  const getConsultationTypeName = (type: string) => {
    switch (type) {
      case "resume_consulting":
        return "생기부 컨설팅";
      case "career_counseling":
        return "진로상담";
      case "academic_management":
        return "학업관리";
      case "university_tour":
        return "대학탐방";
      default:
        return type;
    }
  };

  // 학생 역할: 예약 내역 표시
  if (user?.userType === "high_school_student") {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">예약 내역</h1>

          {bookingsLoading ? (
            <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {bookings.map((item) => {
                const now = new Date();
                const scheduledAt = new Date(item.booking.scheduledAt);
                const durationMs = parseFloat(item.booking.duration.toString()) * 60 * 60 * 1000;
                const scheduledEnd = new Date(scheduledAt.getTime() + durationMs);
                const fiveMinutesMs = 5 * 60 * 1000;
                const canStart = item.booking.status === "confirmed" && 
                  now >= new Date(scheduledAt.getTime() - fiveMinutesMs) && 
                  now <= new Date(scheduledAt.getTime() + fiveMinutesMs);
                const canComplete = item.booking.status === "in_progress" && 
                  now >= new Date(scheduledEnd.getTime() - fiveMinutesMs) && 
                  now <= new Date(scheduledEnd.getTime() + fiveMinutesMs);
                const canReview = item.booking.status === "completed";

                return (
                  <Card key={item.booking.id} className="overflow-hidden">
                    <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-xl truncate">
                            {item.mentor.name || "멘토"}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm truncate">
                            {item.mentorProfile?.university} · {item.mentorProfile?.major}
                          </CardDescription>
                        </div>
                        {getStatusBadge(item.booking.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {format(scheduledAt, "MMM dd HH:mm", { locale: ko })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{item.booking.duration}시간</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground col-span-1 sm:col-span-2">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{getConsultationTypeName(item.booking.consultationType)}</span>
                        </div>
                      </div>

                      {item.booking.studentMessage && (
                        <div className="mt-3 p-2 sm:p-3 bg-muted rounded-lg mb-3">
                          <p className="text-xs text-muted-foreground mb-1">전달 메시지</p>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap line-clamp-3">{item.booking.studentMessage}</p>
                        </div>
                      )}

                      {/* 상담 완료 정보 */}
                      {item.booking.status === "completed" && (
                        <div className="mt-3 p-2 sm:p-3 bg-purple-50 rounded-lg mb-3">
                          <p className="text-xs font-semibold text-purple-700 mb-2">상담 완료 정보</p>
                          <div className="space-y-1 text-xs text-purple-600">
                            <p>예정: {format(scheduledAt, "MMM dd HH:mm", { locale: ko })}</p>
                            {item.booking.consultationStartedAt && (
                              <p>시작: {format(new Date(item.booking.consultationStartedAt), "HH:mm", { locale: ko })}</p>
                            )}
                            {item.booking.consultationCompletedAt && (
                              <p>완료: {format(new Date(item.booking.consultationCompletedAt), "HH:mm", { locale: ko })}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-3 sm:pt-4">
                        <Button 
                          onClick={() => setLocation(`/messages?mentorUUID=${item.mentorProfile?.uuid || 0}`)}
                          className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          메시지
                        </Button>
                        {canStart && (
                          <Button 
                            onClick={() => startConsultationMutation.mutate({ bookingId: item.booking.id })}
                            disabled={startConsultationMutation.isPending}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-blue-500 hover:bg-blue-600"
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            상담 시작
                          </Button>
                        )}
                        {canComplete && (
                          <Button 
                            onClick={() => completeConsultationMutation.mutate({ bookingId: item.booking.id })}
                            disabled={completeConsultationMutation.isPending}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            상담 완료
                          </Button>
                        )}
                        {canReview && (
                          <Button 
                            onClick={() => setLocation(`/reviews/new?bookingId=${item.booking.id}`)}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-yellow-500 hover:bg-yellow-600"
                          >
                            <Star className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            후기 작성
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 sm:py-12 text-center px-4">
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">예약 내역이 존재하지 않습니다.</p>
                <p className="text-xs sm:text-sm text-muted-foreground mb-6">멘토를 찾아 상담을 시작해보세요!</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/mentors">
                    <Button className="text-xs sm:text-sm h-8 sm:h-10">멘토 찾아보기</Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    className="text-xs sm:text-sm h-8 sm:h-10"
                    onClick={() => mentorIdParam ? setLocation(`/messages?mentorId=${mentorIdParam}`) : setLocation('/messages')}
                  >
                    <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    메시지 보내기
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </PageLayout>
    );
  }

  // 멘토 역할: 상담 문의 목록 표시
  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">상담 예약 내역</h1>

        {mentorBookingsLoading ? (
          <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
        ) : mentorBookings && mentorBookings.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {mentorBookings.map((item: any) => {
              const now = new Date();
              const scheduledAt = new Date(item.booking.scheduledAt);
              const durationMs = parseFloat(item.booking.duration.toString()) * 60 * 60 * 1000;
              const scheduledEnd = new Date(scheduledAt.getTime() + durationMs);
              const fiveMinutesMs = 5 * 60 * 1000;
              const canStart = item.booking.status === "confirmed" && 
                now >= new Date(scheduledAt.getTime() - fiveMinutesMs) && 
                now <= new Date(scheduledAt.getTime() + fiveMinutesMs);
              const canComplete = item.booking.status === "in_progress" && 
                now >= new Date(scheduledEnd.getTime() - fiveMinutesMs) && 
                now <= new Date(scheduledEnd.getTime() + fiveMinutesMs);

              return (
                <Card key={item.booking.id} className={`overflow-hidden ${item.booking.status === "pending" ? "border-amber-200 bg-amber-50/30" : ""}`}>
                  <CardHeader className="pb-2 sm:pb-4 px-3 sm:px-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 sm:mb-2">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                          <CardTitle className="text-base sm:text-xl truncate">
                            {item.student?.name || "학생"}
                          </CardTitle>
                        </div>
                        <CardDescription className="text-xs sm:text-sm truncate">
                          {item.student?.email}
                        </CardDescription>
                      </div>
                      {getStatusBadge(item.booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                    <div className="space-y-3 sm:space-y-4">
                      {/* 상담 정보 */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {format(scheduledAt, "MMM dd HH:mm", { locale: ko })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span>{item.booking.duration}시간</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{getConsultationTypeName(item.booking.consultationType)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold">
                          <span className="text-primary">₩{parseInt(item.booking.totalAmount).toLocaleString()}</span>
                        </div>
                      </div>

                      {item.booking.studentMessage && (
                        <div className="p-2 sm:p-3 bg-muted rounded-lg">
                          <p className="text-xs text-muted-foreground mb-1">학생 메시지</p>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap line-clamp-3">{item.booking.studentMessage}</p>
                        </div>
                      )}

                      {/* 상담 완료 정보 */}
                      {item.booking.status === "completed" && (
                        <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-2">상담 완료 정보</p>
                          <div className="space-y-1 text-xs text-purple-600">
                            <p>예정: {format(scheduledAt, "MMM dd HH:mm", { locale: ko })}</p>
                            {item.booking.consultationStartedAt && (
                              <p>시작: {format(new Date(item.booking.consultationStartedAt), "HH:mm", { locale: ko })}</p>
                            )}
                            {item.booking.consultationCompletedAt && (
                              <p>완료: {format(new Date(item.booking.consultationCompletedAt), "HH:mm", { locale: ko })}</p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 액션 버튼 */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-3">
                        <Button 
                          onClick={() => setLocation(`/messages?studentId=${item.student?.id}`)}
                          className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                        >
                          <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          메시지
                        </Button>
                        {item.booking.status === "pending" && (
                          <>
                            <Button 
                              onClick={() => setLocation(`/messages?studentId=${item.student?.id}`)}
                              className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-green-500 hover:bg-green-600"
                            >
                              <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                              수락
                            </Button>
                            <Button 
                              onClick={() => setLocation(`/messages?studentId=${item.student?.id}`)}
                              variant="outline"
                              className="flex-1 text-xs sm:text-sm h-8 sm:h-9"
                            >
                              거절
                            </Button>
                          </>
                        )}
                        {canStart && (
                          <Button 
                            onClick={() => startConsultationMutation.mutate({ bookingId: item.booking.id })}
                            disabled={startConsultationMutation.isPending}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-blue-500 hover:bg-blue-600"
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            상담 시작
                          </Button>
                        )}
                        {canComplete && (
                          <Button 
                            onClick={() => completeConsultationMutation.mutate({ bookingId: item.booking.id })}
                            disabled={completeConsultationMutation.isPending}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-green-500 hover:bg-green-600"
                          >
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            상담 완료
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center px-4">
              <p className="text-xs sm:text-sm text-muted-foreground">상담 예약이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
