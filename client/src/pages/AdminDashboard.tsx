import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  ShieldCheck, ShieldAlert, Search, CheckCircle, XCircle, Clock,
  Edit, Trash2, Bug, Users, AlertTriangle, Loader2, GraduationCap,
  ChevronDown, ChevronUp, ExternalLink, Calendar, Play, Square, Info, BarChart3
} from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMentor, setEditingMentor] = useState<any>(null);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [expandedImage, setExpandedImage] = useState<number | null>(null);

  const utils = trpc.useUtils();

  const { data: mentors } = trpc.admin.getAllMentors.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: pendingVerifications } = trpc.admin.getPendingVerifications.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
    refetchInterval: 30000,
  });

  const { data: bugReports } = trpc.bugReport.getAll.useQuery(
    { status: undefined },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const newBugCount = bugReports?.filter((r: any) => r.status === "new").length || 0;

  const { data: allBookingsData, refetch: refetchBookings } = trpc.admin.getAllBookings.useQuery(
    { page: 1, limit: 50 },
    { enabled: isAuthenticated && user?.role === "admin" }
  );
  const allBookings = allBookingsData?.bookings ?? [];

  const approveMutation = trpc.admin.approveVerification.useMutation({
    onSuccess: () => {
      toast.success("인증이 승인되었습니다.");
      utils.admin.getPendingVerifications.invalidate();
    },
    onError: (error) => toast.error(`승인 실패: ${error.message}`),
  });

  const rejectMutation = trpc.admin.rejectVerification.useMutation({
    onSuccess: () => {
      toast.success("인증이 거부되었습니다.");
      setRejectingId(null);
      setRejectReason("");
      utils.admin.getPendingVerifications.invalidate();
    },
    onError: (error) => toast.error(`거부 실패: ${error.message}`),
  });

  const deleteMentorMutation = trpc.admin.deleteMentorProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 삭제되었습니다.");
      utils.admin.getAllMentors.invalidate();
    },
    onError: (error) => toast.error(`삭제 실패: ${error.message}`),
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <Card className="max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
              <ShieldCheck className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">로그인이 필요합니다</CardTitle>
            <CardDescription>관리자로 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-green-600 hover:bg-green-700">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-red-50 via-white to-orange-50">
        <Card className="max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center mb-3">
              <ShieldAlert className="h-7 w-7 text-red-600" />
            </div>
            <CardTitle className="text-xl">접근 권한 없음</CardTitle>
            <CardDescription>관리자만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full" variant="outline">홈으로 돌아가기</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredMentors = mentors?.filter((mentor) =>
    mentor.profile.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.profile.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mentor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ) || [];

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-10">

          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">관리자 대시보드</h1>
            <p className="text-gray-500 text-sm">멘토 인증 및 프로필을 관리합니다.</p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">대기 중인 인증</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingVerifications?.length || 0}</p>
                    <p className="text-xs text-gray-400 mt-0.5">승인 대기 중</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-white">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">등록된 멘토</p>
                    <p className="text-3xl font-bold text-green-600">{mentors?.length || 0}</p>
                    <p className="text-xs text-gray-400 mt-0.5">활성 멘토</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/admin/bug-reports">
              <Card className="border-0 shadow-sm bg-white cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">버그 신고</p>
                      <p className="text-3xl font-bold text-red-600">{newBugCount}</p>
                      <p className="text-xs text-gray-400 mt-0.5">신규 신고</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center">
                      <Bug className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 탭 */}
          <Tabs defaultValue="verifications" className="w-full">
            <TabsList className="bg-white border border-gray-200 shadow-sm mb-6 p-1 rounded-xl h-auto">
              <TabsTrigger
                value="verifications"
                className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <ShieldCheck className="h-4 w-4" />
                인증 요청 관리
                {(pendingVerifications?.length || 0) > 0 && (
                  <Badge className="bg-amber-500 text-white text-xs px-1.5 py-0 h-5">
                    {pendingVerifications?.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="mentors"
                className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                멘토 프로필 관리
              </TabsTrigger>
              <TabsTrigger
                value="bookings"
                className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                상담 예약 관리
                {allBookings.filter((b: any) => b.booking.status === "in_progress").length > 0 && (
                  <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0 h-5">
                    {allBookings.filter((b: any) => b.booking.status === "in_progress").length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="statistics"
                className="rounded-lg data-[state=active]:bg-green-600 data-[state=active]:text-white flex items-center gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                상담 통계
              </TabsTrigger>
            </TabsList>

            {/* 인증 요청 관리 탭 */}
            <TabsContent value="verifications" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">대기 중인 인증 요청</h2>
                <Badge variant="outline" className="text-amber-600 border-amber-300">
                  {pendingVerifications?.length || 0}건 대기 중
                </Badge>
              </div>

              {!pendingVerifications || pendingVerifications.length === 0 ? (
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">모든 인증 요청이 처리되었습니다</p>
                    <p className="text-sm text-gray-400">새로운 인증 요청이 들어오면 여기에 표시됩니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingVerifications.map((item: any) => (
                    <Card key={item.verification.id} className="border-0 shadow-sm bg-white overflow-hidden">
                      <CardContent className="p-0">
                        {/* 상단 정보 */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                              <GraduationCap className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.user.name}</p>
                              <p className="text-xs text-gray-500">
                                신청일: {new Date(item.verification.createdAt).toLocaleDateString("ko-KR", {
                                  year: "numeric", month: "long", day: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">
                            <Clock className="h-3 w-3 mr-1" />
                            검토 대기
                          </Badge>
                        </div>

                        {/* 학생증 이미지 */}
                        <div className="px-5 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-sm font-medium text-gray-700">학생증 이미지</Label>
                            <button
                              type="button"
                              onClick={() => setExpandedImage(expandedImage === item.verification.id ? null : item.verification.id)}
                              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700"
                            >
                              {expandedImage === item.verification.id ? (
                                <><ChevronUp className="h-3 w-3" />접기</>
                              ) : (
                                <><ChevronDown className="h-3 w-3" />펼치기</>
                              )}
                            </button>
                          </div>
                          {item.verification.studentIdImageUrl ? (
                            <div className={`overflow-hidden rounded-xl border border-gray-200 transition-all ${expandedImage === item.verification.id ? "max-h-[500px]" : "max-h-32"}`}>
                              <img
                                src={item.verification.studentIdImageUrl}
                                alt="학생증"
                                className="w-full object-cover cursor-pointer"
                                onClick={() => setExpandedImage(expandedImage === item.verification.id ? null : item.verification.id)}
                              />
                            </div>
                          ) : (
                            <div className="bg-gray-50 rounded-xl border border-dashed border-gray-200 py-6 text-center">
                              <p className="text-sm text-gray-400">이미지가 없습니다</p>
                            </div>
                          )}
                        </div>

                        {/* 거부 사유 입력 (거부 버튼 클릭 시 표시) */}
                        {rejectingId === item.verification.id && (
                          <div className="px-5 pb-4">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <Label className="text-sm font-medium text-red-700">거부 사유 입력</Label>
                              </div>
                              <Textarea
                                placeholder="멘토에게 전달될 거부 사유를 입력해주세요..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                className="bg-white border-red-200 focus:border-red-400 text-sm resize-none"
                                rows={3}
                              />
                              <div className="flex gap-2 mt-3">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => { setRejectingId(null); setRejectReason(""); }}
                                  className="flex-1"
                                >
                                  취소
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    if (!rejectReason.trim()) {
                                      toast.error("거부 사유를 입력해주세요.");
                                      return;
                                    }
                                    rejectMutation.mutate({
                                      verificationId: item.verification.id,
                                      adminNotes: rejectReason,
                                    });
                                  }}
                                  disabled={rejectMutation.isPending}
                                  className="flex-1"
                                >
                                  {rejectMutation.isPending ? (
                                    <><Loader2 className="h-3 w-3 animate-spin mr-1" />처리 중</>
                                  ) : (
                                    <><XCircle className="h-3 w-3 mr-1" />거부 확정</>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 승인/거부 버튼 */}
                        {rejectingId !== item.verification.id && (
                          <div className="flex gap-3 px-5 pb-5">
                            <Button
                              onClick={() => approveMutation.mutate({ verificationId: item.verification.id })}
                              disabled={approveMutation.isPending}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              {approveMutation.isPending ? (
                                <><Loader2 className="h-4 w-4 animate-spin mr-2" />처리 중...</>
                              ) : (
                                <><CheckCircle className="h-4 w-4 mr-2" />승인</>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setRejectingId(item.verification.id)}
                              disabled={rejectMutation.isPending}
                              className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              거부
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 멘토 프로필 관리 탭 */}
            <TabsContent value="mentors" className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-gray-900">멘토 프로필 관리</h2>
                <Badge variant="outline" className="text-green-600 border-green-300">
                  총 {filteredMentors.length}명
                </Badge>
              </div>

              {/* 검색 */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="대학, 전공, 이름으로 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white border-gray-200 shadow-sm"
                />
              </div>

              {/* 멘토 목록 */}
              {filteredMentors.length === 0 ? (
                <Card className="border-0 shadow-sm bg-white">
                  <CardContent className="py-16 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-700 font-medium mb-1">
                      {searchQuery ? "검색 결과가 없습니다" : "등록된 멘토가 없습니다"}
                    </p>
                    <p className="text-sm text-gray-400">
                      {searchQuery ? "다른 키워드로 검색해보세요." : "멘토가 등록되면 여기에 표시됩니다."}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredMentors.map((mentor) => (
                    <Card key={mentor.profile.id} className="border-0 shadow-sm bg-white">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-gray-900">{mentor.user?.name || "이름 없음"}</p>
                                <Badge
                                  className={
                                    mentor.profile.verificationStatus === "approved"
                                      ? "bg-green-100 text-green-700 border-green-200 hover:bg-green-100"
                                      : mentor.profile.verificationStatus === "pending"
                                      ? "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100"
                                      : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-100"
                                  }
                                >
                                  {mentor.profile.verificationStatus === "approved"
                                    ? "인증됨"
                                    : mentor.profile.verificationStatus === "pending"
                                    ? "검토 중"
                                    : "미인증"}
                                </Badge>
                                <Badge
                                  className={
                                    mentor.profile.verificationStatus === "approved"
                                      ? "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100"
                                      : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-100"
                                  }
                                >
                                  {mentor.profile.verificationStatus === "approved" ? "인증" : "대기중"}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                {mentor.profile.university} · {mentor.profile.major} · {mentor.profile.grade}학년
                              </p>
                              {mentor.profile.bio && (
                                <p className="text-xs text-gray-400 truncate">{mentor.profile.bio}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-600 hover:bg-red-50"
                              onClick={() => {
                                if (confirm(`${mentor.user?.name || "이 멘토"}의 프로필을 삭제하시겠습니까?`)) {
                                  deleteMentorMutation.mutate({ mentorId: mentor.profile.userId });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* 상담 예약 관리 탭 */}
            <TabsContent value="bookings" className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">상담 예약 관리</h2>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-gray-600">
                    전체 {allBookings.length}건
                  </Badge>
                  <Badge variant="outline" className="text-blue-600 border-blue-300">
                    진행중 {allBookings.filter((b: any) => b.booking.status === "in_progress").length}건
                  </Badge>
                  <Badge variant="outline" className="text-amber-600 border-amber-300">
                    대기중 {allBookings.filter((b: any) => b.booking.status === "confirmed").length}건
                  </Badge>
                </div>
              </div>

              {allBookings.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">예약 내역이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {allBookings.map((item: any) => {
                    const booking = item.booking;
                    const scheduledAt = new Date(booking.scheduledAt);
                    const statusColors: Record<string, string> = {
                      pending: "border-amber-200 bg-amber-50/30",
                      confirmed: "border-blue-200 bg-blue-50/30",
                      in_progress: "border-green-200 bg-green-50/30",
                      completed: "border-gray-200",
                      cancelled: "border-red-200 bg-red-50/30",
                    };
                    const statusLabels: Record<string, string> = {
                      pending: "대기중",
                      confirmed: "확정",
                      in_progress: "진행중",
                      completed: "완료",
                      cancelled: "취소됨",
                      reschedule_requested: "일정변경요청",
                    };

                    return (
                      <Card key={booking.id} className={`overflow-hidden ${statusColors[booking.status] || ""}`}>
                        <CardContent className="px-4 py-3">
                          <div className="flex items-start justify-between gap-3 mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-sm">
                                  {item.student?.name || "학생"}
                                </span>
                                <span className="text-gray-400 text-xs">→</span>
                                <span className="font-semibold text-sm text-primary">
                                  {item.mentorProfile?.university || "멘토"} {item.mentorProfile?.major || ""}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(scheduledAt, "M월 d일 HH:mm", { locale: ko })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {booking.duration}시간
                                </span>
                                <span>₩{parseInt(booking.totalAmount).toLocaleString()}</span>
                              </div>
                            </div>
                            <Badge
                              variant={booking.status === "completed" ? "outline" : booking.status === "cancelled" ? "destructive" : "default"}
                              className="shrink-0"
                            >
                              {statusLabels[booking.status] || booking.status}
                            </Badge>
                          </div>

                          {/* 시작/종료 이행 현황 */}
                          {(booking.status === "confirmed" || booking.status === "in_progress" || booking.status === "completed") && (
                            <div className="grid grid-cols-2 gap-2 p-3 bg-white/80 rounded-lg border border-gray-100">
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">멘티 확인</p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className={booking.studentStartedAt ? "text-green-600" : "text-gray-300"}>●</span>
                                    <span className={booking.studentStartedAt ? "text-green-700" : "text-gray-400"}>
                                      시작: {booking.studentStartedAt ? format(new Date(booking.studentStartedAt), "HH:mm", { locale: ko }) : "미확인"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className={booking.studentEndedAt ? "text-green-600" : "text-gray-300"}>●</span>
                                    <span className={booking.studentEndedAt ? "text-green-700" : "text-gray-400"}>
                                      종료: {booking.studentEndedAt ? format(new Date(booking.studentEndedAt), "HH:mm", { locale: ko }) : "미확인"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-medium text-gray-600 mb-1">멘토 확인</p>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className={booking.mentorStartedAt ? "text-green-600" : "text-gray-300"}>●</span>
                                    <span className={booking.mentorStartedAt ? "text-green-700" : "text-gray-400"}>
                                      시작: {booking.mentorStartedAt ? format(new Date(booking.mentorStartedAt), "HH:mm", { locale: ko }) : "미확인"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs">
                                    <span className={booking.mentorEndedAt ? "text-green-600" : "text-gray-300"}>●</span>
                                    <span className={booking.mentorEndedAt ? "text-green-700" : "text-gray-400"}>
                                      종료: {booking.mentorEndedAt ? format(new Date(booking.mentorEndedAt), "HH:mm", { locale: ko }) : "미확인"}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {booking.consultationStartedAt && (
                                <div className="col-span-2 pt-2 border-t border-gray-100">
                                  <p className="text-xs text-gray-500">
                                    실제 시작: <span className="font-medium text-gray-700">{format(new Date(booking.consultationStartedAt), "M월 d일 HH:mm", { locale: ko })}</span>
                                    {booking.consultationCompletedAt && (
                                      <> · 완료: <span className="font-medium text-gray-700">{format(new Date(booking.consultationCompletedAt), "HH:mm", { locale: ko })}</span></>
                                    )}
                                  </p>
                                </div>
                              )}
                              {booking.endReason && (
                                <div className="col-span-2">
                                  <p className="text-xs text-amber-600">
                                    종료 사유: {booking.endReason}
                                    {booking.endReasonDetails && ` - ${booking.endReasonDetails}`}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* 상담 통계 탭 */}
            <TabsContent value="statistics" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">전체 상담</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-gray-900">{allBookings.length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">완료된 상담</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-green-600">{allBookings.filter((b: any) => b.booking.status === "completed").length}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">완료율</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-blue-600">
                      {allBookings.length > 0
                        ? Math.round((allBookings.filter((b: any) => b.booking.status === "completed").length / allBookings.length) * 100)
                        : 0}%
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">조기 종료</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-amber-600">
                      {allBookings.filter((b: any) => {
                        if (b.booking.status !== "completed" || !b.booking.consultationCompletedAt) return false;
                        const scheduledEnd = new Date(new Date(b.booking.scheduledAt).getTime() + parseInt(b.booking.duration) * 60 * 60 * 1000);
                        return new Date(b.booking.consultationCompletedAt) < scheduledEnd;
                      }).length}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>상담 통계 요약</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">전체 상담 건수</span>
                      <span className="font-semibold">{allBookings.length}건</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">완료된 상담</span>
                      <span className="font-semibold text-green-600">{allBookings.filter((b: any) => b.booking.status === "completed").length}건</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">진행 중인 상담</span>
                      <span className="font-semibold text-blue-600">{allBookings.filter((b: any) => b.booking.status === "in_progress").length}건</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="text-gray-600">취소된 상담</span>
                      <span className="font-semibold text-red-600">{allBookings.filter((b: any) => b.booking.status === "cancelled").length}건</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">조기 종료 비율</span>
                      <span className="font-semibold text-amber-600">
                        {allBookings.filter((b: any) => b.booking.status === "completed").length > 0
                          ? Math.round(
                              (allBookings.filter((b: any) => {
                                if (b.booking.status !== "completed" || !b.booking.consultationCompletedAt) return false;
                                const scheduledEnd = new Date(new Date(b.booking.scheduledAt).getTime() + parseInt(b.booking.duration) * 60 * 60 * 1000);
                                return new Date(b.booking.consultationCompletedAt) < scheduledEnd;
                              }).length / allBookings.filter((b: any) => b.booking.status === "completed").length) * 100
                            )
                          : 0}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
