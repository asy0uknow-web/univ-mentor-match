import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, Calendar, Clock, MessageCircle, User, BookOpen, CheckCircle, Star, Play, Square, AlertCircle, Info } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";

// 종료 사유 입력 모달
// endType: 'early' | 'late' | 'normal'
function EndReasonModal({
  open,
  onClose,
  onConfirm,
  endType,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string, details: string) => void;
  endType: 'early' | 'late' | 'normal';
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");

  const earlyReasons = [
    { value: "mutual_agreement", label: "상호 합의로 조기 완료" },
    { value: "technical_issue", label: "기술적 문제 발생" },
    { value: "emergency", label: "긴급 상황 발생" },
    { value: "content_completed", label: "상담 내용 조기 완료" },
    { value: "other", label: "기타" },
  ];

  const lateReasons = [
    { value: "content_not_finished", label: "상담 내용 미완료로 지연 완료" },
    { value: "mutual_agreement", label: "상호 합의로 지연 완료" },
    { value: "other", label: "기타" },
  ];

  const normalReasons = [
    { value: "content_completed", label: "정상 완료" },
    { value: "other", label: "기타" },
  ];

  const reasons = endType === 'early' ? earlyReasons : endType === 'late' ? lateReasons : normalReasons;

  const titleMap = {
    early: "조기 완료 사유 입력",
    late: "지연 완료 사유 입력",
    normal: "상담 종료 확인",
  };

  const descMap = {
    early: { bg: "bg-amber-50 dark:bg-amber-950/30", border: "border-amber-200 dark:border-amber-800/50", text: "text-amber-700 dark:text-amber-400", msg: "예정된 상담 시간보다 일직 종료하려 합니다. 조기 완료 사유를 입력해주세요." },
    late: { bg: "bg-primary/5", border: "border-blue-200", text: "text-blue-700", msg: "예정된 상담 시간보다 늘게 종료하려 합니다. 지연 완료 사유를 입력해주세요." },
    normal: { bg: "bg-green-50 dark:bg-green-950/30", border: "border-green-200 dark:border-green-800/50", text: "text-green-700 dark:text-green-400", msg: "상담이 정상적으로 완료되었습니다." },
  };

  const btnColorMap = {
    early: "bg-amber-500 hover:bg-amber-600",
    late: "bg-blue-500 hover:bg-blue-600",
    normal: "bg-green-500 hover:bg-green-600",
  };

  const btnLabelMap = {
    early: "조기 완료 확인",
    late: "지연 완료 확인",
    normal: "종료 확인",
  };

  const desc = descMap[endType];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{titleMap[endType]}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className={`p-3 ${desc.bg} border ${desc.border} rounded-lg text-sm ${desc.text}`}>
            {desc.msg}
          </div>
          <div className="space-y-2">
            <Label>종료 사유</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="사유를 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {reasons.map((r) => (
                  <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>상세 설명 (선택)</Label>
            <Textarea
              placeholder="추가 설명이 있으면 입력해주세요..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button
            onClick={() => {
              if (!reason) { alert("종료 사유를 선택해주세요."); return; }
              onConfirm(reason, details);
            }}
            className={btnColorMap[endType]}
          >
            {btnLabelMap[endType]}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [endModalOpen, setEndModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [endType, setEndType] = useState<'early' | 'late' | 'normal'>('normal');

  const params = new URLSearchParams(window.location.search);
  const mentorIdParam = params.get('mentorId');

  useEffect(() => {
    setPageMeta(PAGE_META.bookings);
  }, []);

  // 멘토 여부 판단: role이 mentor이거나 userType이 university_student인 경우
  const isMentorUser = isAuthenticated && (user?.role === "mentor" || user?.userType === "university_student");
  // 멘티 여부 판단: role이 user이고 userType이 high_school_student인 경우 (또는 university_student가 아닌 경우)
  const isStudentUser = isAuthenticated && !isMentorUser;

  const { data: bookings, isLoading: bookingsLoading, refetch: refetchBookings } = trpc.booking.getMyBookings.useQuery(undefined, {
    enabled: isStudentUser,
    refetchInterval: 10000, // 10초마다 자동 갱신
  });

  const { data: mentorBookings, isLoading: mentorBookingsLoading, refetch: refetchMentorBookings } = trpc.mentor.getMyBookings.useQuery(undefined, {
    enabled: isMentorUser,
    refetchInterval: 10000,
  });

  // 새로운 recordUserStart 뮤테이션
  const recordUserStartMutation = trpc.booking.recordUserStart.useMutation({
    onSuccess: () => {
      refetchBookings();
      refetchMentorBookings();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 새로운 recordUserEnd 뮤테이션
  const recordUserEndMutation = trpc.booking.recordUserEnd.useMutation({
    onSuccess: () => {
      setEndModalOpen(false);
      setSelectedBookingId(null);
      refetchBookings();
      refetchMentorBookings();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  const handleStartClick = (bookingId: number) => {
    if (confirm("상담을 시작하시겠습니까? 상대방도 시작 버튼을 눌러야 상담이 시작됩니다.")) {
      recordUserStartMutation.mutate({ bookingId });
    }
  };

  const handleEndClick = (bookingId: number, type: 'early' | 'late' | 'normal') => {
    setSelectedBookingId(bookingId);
    setEndType(type);
    setEndModalOpen(true);
  };

  const handleEndConfirm = (reason: string, details: string) => {
    if (selectedBookingId !== null) {
      recordUserEndMutation.mutate({
        bookingId: selectedBookingId,
        endReason: reason,
        endReasonDetails: details,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "대기중", variant: "secondary" },
      confirmed: { label: "확정", variant: "default" },
      in_progress: { label: "진행중", variant: "default" },
      completed: { label: "완료", variant: "outline" },
      cancelled: { label: "취소됨", variant: "destructive" },
      reschedule_requested: { label: "일정변경요청", variant: "secondary" },
    };
    const s = statusMap[status] || { label: status, variant: "secondary" as const };
    return <Badge variant={s.variant}>{s.label}</Badge>;
  };

  const getConsultationTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      resume_consulting: "생기부 콘설팅",
      career_counseling: "진로상담",
      academic_management: "학업관리",
      university_tour: "대학탐방",
    };
    return typeMap[type] || type;
  };

  const getEndReasonLabel = (reason: string) => {
    const reasonMap: Record<string, string> = {
      mutual_agreement: "상호 합의로 조기 종료",
      technical_issue: "기술적 문제 발생",
      emergency: "긴급 상황 발생",
      content_completed: "상담 내용 조기 완료",
      content_not_finished: "상담 내용 미완료로 추가 진행",
      other: "기타",
    };
    return reasonMap[reason] || reason;
  };

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

  // 상담 시작/종료 상태 표시 컴포넌트
  const ConsultationStatusInfo = ({ booking, isStudent }: { booking: any; isStudent: boolean }) => {
    const isMentor = !isStudent;
    const myStarted = isStudent ? booking.studentStartedAt : booking.mentorStartedAt;
    const otherStarted = isStudent ? booking.mentorStartedAt : booking.studentStartedAt;
    const myEnded = isStudent ? booking.studentEndedAt : booking.mentorEndedAt;
    const otherEnded = isStudent ? booking.mentorEndedAt : booking.studentEndedAt;

    if (booking.status !== "confirmed" && booking.status !== "in_progress") return null;

    return (
      <div className="mt-3 p-3 bg-primary/5 border border-blue-100 rounded-lg space-y-2">
        <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
          <Info className="h-3 w-3" />
          상담 진행 상태
        </p>
        {booking.status === "confirmed" && (
          <div className="space-y-1 text-xs text-blue-600">
            <div className="flex items-center gap-2">
              <span className={myStarted ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                {myStarted ? "✓" : "○"} 나의 시작 확인
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={otherStarted ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                {otherStarted ? "✓" : "○"} {isStudent ? "멘토" : "멘티"}의 시작 확인
              </span>
            </div>
            {myStarted && !otherStarted && (
              <p className="text-amber-600 text-xs mt-1">
                ⏳ {isStudent ? "멘토" : "멘티"}가 시작 버튼을 누르면 상담이 시작됩니다.
              </p>
            )}
          </div>
        )}
        {booking.status === "in_progress" && (
          <div className="space-y-1 text-xs text-blue-600">
            <p className="text-green-600 dark:text-green-400 font-medium">✓ 상담 진행 중</p>
            <div className="flex items-center gap-2">
              <span className={myEnded ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                {myEnded ? "✓" : "○"} 나의 종료 확인
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={otherEnded ? "text-green-600 dark:text-green-400 font-medium" : "text-muted-foreground"}>
                {otherEnded ? "✓" : "○"} {isStudent ? "멘토" : "멘티"}의 종료 확인
              </span>
            </div>
            {myEnded && !otherEnded && (
              <p className="text-amber-600 text-xs mt-1">
                ⏳ {isStudent ? "멘토" : "멘티"}가 종료 버튼을 누르면 상담이 완료됩니다.
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  // 학생(멘티) 역할
  if (isStudentUser) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">예약 내역</h1>
          <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
            상담이 확정되면 예정 시간 5분 전후에 시작 버튼을 눌러주세요. 멘토와 멘티 모두 시작 버튼을 눌러야 상담이 시작됩니다.
          </p>

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
                const startWindowMs = 60 * 60 * 1000; // 상담 시작 가능 창: 예정 시간 ±60분

                const canStart = item.booking.status === "confirmed" &&
                  now >= new Date(scheduledAt.getTime() - fiveMinutesMs) &&
                  now <= new Date(scheduledAt.getTime() + startWindowMs) &&
                  !item.booking.studentStartedAt; // 아직 시작 안 한 경우만

                const alreadyStarted = item.booking.status === "confirmed" && !!item.booking.studentStartedAt;

                const canEnd = item.booking.status === "in_progress" && !item.booking.studentEndedAt;
                const alreadyEnded = item.booking.status === "in_progress" && !!item.booking.studentEndedAt;

                const currentEndType: 'early' | 'late' | 'normal' = 
                  item.booking.status === "in_progress" && now < new Date(scheduledEnd.getTime() - fiveMinutesMs) ? 'early' :
                  item.booking.status === "in_progress" && now > new Date(scheduledEnd.getTime() + fiveMinutesMs) ? 'late' : 'normal';
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
                            {format(scheduledAt, "M월 d일 HH:mm", { locale: ko })}
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

                      {/* 상담 시작 가능 시간 안내 */}
                      {item.booking.status === "confirmed" && (
                        <div className="p-2 sm:p-3 bg-primary/5 rounded-lg border border-blue-100 mb-3">
                          <p className="text-xs font-semibold text-blue-700 mb-1">상담 시작 가능 시간</p>
                          <p className="text-xs sm:text-sm text-blue-600">
                            {format(new Date(scheduledAt.getTime() - fiveMinutesMs), "HH:mm", { locale: ko })} ~ {format(new Date(scheduledAt.getTime() + startWindowMs), "HH:mm", { locale: ko })}
                          </p>
                        </div>
                      )}

                      {/* 상담 진행 상태 표시 */}
                      <ConsultationStatusInfo booking={item.booking} isStudent={true} />

                      {/* 상담 완료 정보 */}
                      {item.booking.status === "completed" && (
                        <div className="mt-3 p-2 sm:p-3 bg-purple-50 rounded-lg mb-3">
                          <p className="text-xs font-semibold text-purple-700 mb-2">상담 완료 정보</p>
                          <div className="space-y-1 text-xs text-purple-600">
                            <p>예정: {format(scheduledAt, "M월 d일 HH:mm", { locale: ko })}</p>
                            {item.booking.consultationStartedAt && (
                              <p>실제 시작: {format(new Date(item.booking.consultationStartedAt), "HH:mm", { locale: ko })}</p>
                            )}
                            {item.booking.consultationCompletedAt && (
                              <p>실제 완료: {format(new Date(item.booking.consultationCompletedAt), "HH:mm", { locale: ko })}</p>
                            )}
                            {item.booking.endReason && (
                              <p>종료 사유: {getEndReasonLabel(item.booking.endReason)}</p>
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
                            onClick={() => handleStartClick(item.booking.id)}
                            disabled={recordUserStartMutation.isPending}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-blue-500 hover:bg-blue-600"
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            상담 시작
                          </Button>
                        )}

                        {alreadyStarted && (
                          <div className="flex-1 flex items-center justify-center text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 rounded-md px-3 h-8 sm:h-9">
                            ✓ 시작 확인 완료 (멘토 대기중)
                          </div>
                        )}

                        {canEnd && (
                          <Button
                            onClick={() => handleEndClick(item.booking.id, currentEndType)}
                            disabled={recordUserEndMutation.isPending}
                            className={`flex-1 text-xs sm:text-sm h-8 sm:h-9 ${currentEndType === 'early' ? "bg-amber-500 hover:bg-amber-600" : currentEndType === 'late' ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
                          >
                            <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {currentEndType === 'early' ? "조기 완료" : currentEndType === 'late' ? "지연 완료" : "상담 종료"}
                          </Button>
                        )}

                        {alreadyEnded && (
                          <div className="flex-1 flex items-center justify-center text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 rounded-md px-3 h-8 sm:h-9">
                            ✓ 종료 확인 완료 (멘토 대기중)
                          </div>
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

        <EndReasonModal
          open={endModalOpen}
          onClose={() => setEndModalOpen(false)}
          onConfirm={handleEndConfirm}
          endType={endType}
        />
      </PageLayout>
    );
  }

  // 멘토 역할
  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2 sm:mb-4">상담 예약 내역</h1>
        <p className="text-sm text-muted-foreground mb-6 sm:mb-8">
          상담 시간이 되면 시작 버튼을 눌러주세요. 멘티와 멘토 모두 시작 버튼을 눌러야 상담이 시작됩니다.
        </p>

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
              const startWindowMs = 60 * 60 * 1000; // 상담 시작 가능 창: 예정 시간 ±60분

              const canStart = item.booking.status === "confirmed" &&
                now >= new Date(scheduledAt.getTime() - fiveMinutesMs) &&
                now <= new Date(scheduledAt.getTime() + startWindowMs) &&
                !item.booking.mentorStartedAt;

              const alreadyStarted = item.booking.status === "confirmed" && !!item.booking.mentorStartedAt;

              const canEnd = item.booking.status === "in_progress" && !item.booking.mentorEndedAt;
              const alreadyEnded = item.booking.status === "in_progress" && !!item.booking.mentorEndedAt;

              const currentMentorEndType: 'early' | 'late' | 'normal' = 
                item.booking.status === "in_progress" && now < new Date(scheduledEnd.getTime() - fiveMinutesMs) ? 'early' :
                item.booking.status === "in_progress" && now > new Date(scheduledEnd.getTime() + fiveMinutesMs) ? 'late' : 'normal';

              return (
                <Card key={item.booking.id} className={`overflow-hidden ${item.booking.status === "pending" ? "border-amber-200 dark:border-amber-800/50 bg-amber-50 dark:bg-amber-950/30/30" : ""}`}>
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
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">
                            {format(scheduledAt, "M월 d일 HH:mm", { locale: ko })}
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
                          <p className="text-xs text-muted-foreground mb-1">멘티 메시지</p>
                          <p className="text-xs sm:text-sm whitespace-pre-wrap line-clamp-3">{item.booking.studentMessage}</p>
                        </div>
                      )}

                      {/* 상담 시작 가능 시간 안내 */}
                      {item.booking.status === "confirmed" && (
                        <div className="p-2 sm:p-3 bg-primary/5 rounded-lg border border-blue-100">
                          <p className="text-xs font-semibold text-blue-700 mb-1">상담 시작 가능 시간</p>
                          <p className="text-xs sm:text-sm text-blue-600">
                            {format(new Date(scheduledAt.getTime() - fiveMinutesMs), "HH:mm", { locale: ko })} ~ {format(new Date(scheduledAt.getTime() + startWindowMs), "HH:mm", { locale: ko })}
                          </p>
                        </div>
                      )}

                      {/* 상담 진행 상태 표시 */}
                      <ConsultationStatusInfo booking={item.booking} isStudent={false} />

                      {/* 상담 완료 정보 */}
                      {item.booking.status === "completed" && (
                        <div className="p-2 sm:p-3 bg-purple-50 rounded-lg">
                          <p className="text-xs font-semibold text-purple-700 mb-2">상담 완료 정보</p>
                          <div className="space-y-1 text-xs text-purple-600">
                            <p>예정: {format(scheduledAt, "M월 d일 HH:mm", { locale: ko })}</p>
                            {item.booking.consultationStartedAt && (
                              <p>실제 시작: {format(new Date(item.booking.consultationStartedAt), "HH:mm", { locale: ko })}</p>
                            )}
                            {item.booking.consultationCompletedAt && (
                              <p>실제 완료: {format(new Date(item.booking.consultationCompletedAt), "HH:mm", { locale: ko })}</p>
                            )}
                            {item.booking.endReason && (
                              <p>종료 사유: {getEndReasonLabel(item.booking.endReason)}</p>
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
                            onClick={() => handleStartClick(item.booking.id)}
                            disabled={recordUserStartMutation.isPending}
                            className="flex-1 text-xs sm:text-sm h-8 sm:h-9 bg-blue-500 hover:bg-blue-600"
                          >
                            <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            상담 시작
                          </Button>
                        )}

                        {alreadyStarted && (
                          <div className="flex-1 flex items-center justify-center text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 rounded-md px-3 h-8 sm:h-9">
                            ✓ 시작 확인 완료 (멘티 대기중)
                          </div>
                        )}

                        {canEnd && (
                          <Button
                            onClick={() => handleEndClick(item.booking.id, currentMentorEndType)}
                            disabled={recordUserEndMutation.isPending}
                            className={`flex-1 text-xs sm:text-sm h-8 sm:h-9 ${currentMentorEndType === 'early' ? "bg-amber-500 hover:bg-amber-600" : currentMentorEndType === 'late' ? "bg-blue-500 hover:bg-blue-600" : "bg-green-500 hover:bg-green-600"}`}
                          >
                            <Square className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            {currentMentorEndType === 'early' ? "조기 완료" : currentMentorEndType === 'late' ? "지연 완료" : "상담 종료"}
                          </Button>
                        )}

                        {alreadyEnded && (
                          <div className="flex-1 flex items-center justify-center text-xs text-green-600 dark:text-green-400 font-medium bg-green-50 dark:bg-green-950/30 rounded-md px-3 h-8 sm:h-9">
                            ✓ 종료 확인 완료 (멘티 대기중)
                          </div>
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

      <EndReasonModal
        open={endModalOpen}
        onClose={() => setEndModalOpen(false)}
        onConfirm={handleEndConfirm}
        endType={endType}
      />
    </PageLayout>
  );
}
