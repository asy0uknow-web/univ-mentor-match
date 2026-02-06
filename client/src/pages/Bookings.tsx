import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, Calendar, Clock, MessageCircle, User, BookOpen, LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import BugReportModal from "@/components/BugReportModal";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [showBugReport, setShowBugReport] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });
  
  // 학생 역할: 예약 조회
  const { data: bookings, isLoading: bookingsLoading } = trpc.booking.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.userType === "high_school_student",
  });

  // 멘토 역할: 받은 상담 신청 조회
  const { data: mentorBookings, isLoading: mentorBookingsLoading } = trpc.booking.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.userType === "university_student",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>상담 문의를 보려면 로그인해주세요.</CardDescription>
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

  // 상담 신청 상태 배지
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">대기 중</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500">수락됨</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">완료됨</Badge>;
      case "cancelled":
        return <Badge variant="destructive">거절됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
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

  const handleStartConversation = (studentId: number) => {
    setLocation("/messages");
  };

  // 학생 역할: 예약 내역 표시
  if (user?.userType === "high_school_student") {
    return (
      <div className="min-h-screen">
        {/* Navigation */}
      <nav className="border-b border-border bg-[#fdfcfd] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png" alt="Univ Match" className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto" />
                <span className="hidden sm:inline font-bold text-lg md:text-xl text-foreground">유니브매치</span>
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">상담 문의</Button>
                  </Link>
                  <Link href="/my-profile" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">내 프로필</Button>
                  </Link>
                  <Link href="/notifications" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">알림</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <span className="hidden sm:inline">메뉴</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuItem onClick={() => setShowBugReport(true)} className="hover:bg-blue-100 hover:text-primary">
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

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">상담 문의</h1>

          {bookingsLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((item) => (
                <Card key={item.booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {item.mentor.name || "멘토"}
                        </CardTitle>
                        <CardDescription>
                          {item.mentorProfile?.university} · {item.mentorProfile?.major}
                        </CardDescription>
                      </div>
                      {getStatusBadge(item.booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(item.booking.scheduledAt), "PPP", { locale: ko })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{item.booking.duration}시간</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{getConsultationTypeName(item.booking.consultationType)}</span>
                      </div>
                    </div>

                    {item.booking.studentMessage && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">전달 메시지</p>
                        <p className="mt-1 text-sm whitespace-pre-wrap">{item.booking.studentMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">아직 예약 내역이 없습니다.</p>
                <Link href="/mentors">
                  <Button>멘토 찾아보기</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // 멘토 역할: 상담 문의 목록 표시
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
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">상담 문의</h1>

        {mentorBookingsLoading ? (
          <p className="text-muted-foreground">로딩 중...</p>
        ) : mentorBookings && mentorBookings.length > 0 ? (
          <div className="space-y-4">
            {mentorBookings.map((item: any) => (
              <Card key={item.booking.id} className={item.booking.status === "pending" ? "border-amber-200 bg-amber-50/30" : ""}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-xl">
                          {item.mentor?.name || "학생"}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        {item.mentor?.email}
                      </CardDescription>
                    </div>
                    {getStatusBadge(item.booking.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* 상담 정보 */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(item.booking.scheduledAt), "PPP", { locale: ko })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{item.booking.duration}시간</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BookOpen className="h-4 w-4" />
                        <span>{getConsultationTypeName(item.booking.consultationType)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-semibold">
                        <span className="text-primary">₩{parseInt(item.booking.totalAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* 학생 메시지 */}
                    {item.booking.studentMessage && (
                      <div className="p-3 bg-muted rounded-lg border-l-4 border-primary">
                        <p className="text-sm text-muted-foreground mb-2">학생 메시지</p>
                        <p className="text-sm whitespace-pre-wrap">{item.booking.studentMessage}</p>
                      </div>
                    )}

                    {/* 액션 버튼 */}
                    <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleStartConversation(item.mentor?.id || 0)}
                        className="flex-1"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        메시지 열기
                      </Button>
                      {item.booking.status === "pending" && (
                        <Button 
                          variant="outline"
                          className="flex-1"
                          disabled
                        >
                          메시지에서 응답
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">아직 상담 문의가 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
      {showBugReport && <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />}
    </div>
  );
}
