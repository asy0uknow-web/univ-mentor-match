import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
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
  // 모든 훅을 조건부 return 이전에 선언 (React 훅 규칙)
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
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

  const updateMentorMutation = trpc.admin.updateMentorProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 수정되었습니다.");
      setEditingMentor(null);
      utils.admin.getAllMentors.invalidate();
    },
    onError: (error) => toast.error(`수정 실패: ${error.message}`),
  });

  // 로딩 중일 때
  if (loading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-green-600 dark:text-green-400" />
            <p className="text-muted-foreground 300 300">로딩 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 조건부 렌더링 (return 제거)
  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">접근 권한이 없습니다</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/')}
                className="w-full text-xs sm:text-sm h-9 sm:h-10"
              >
                홈으로 이동
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const filteredMentors = mentors?.filter((mentor) =>
    mentor.profile.university.toLowerCase().includes(searchQuery.toLowerCase()) ||
    mentor.profile.major.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (mentor.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  ) || [];

  return (
    <PageLayout>
      <div className="min-h-screen bg-background 900">
        <div className="container mx-auto px-4 py-10">

          {/* 헤더 */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-1">관리자 대시보드</h1>
            <p className="text-muted-foreground text-sm">멘토 인증 및 프로필을 관리합니다.</p>
          </div>

          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="border-0 shadow-sm bg-card ">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">대기 중인 인증</p>
                    <p className="text-3xl font-bold text-amber-600">{pendingVerifications?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">승인 대기 중</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm bg-card ">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1">등록된 멘토</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{mentors?.length || 0}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">활성 멘토</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Link href="/admin/bug-reports">
              <Card className="border-0 shadow-sm bg-card  cursor-pointer hover:shadow-md  transition-shadow">
                <CardContent className="pt-5 pb-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">버그 신고</p>
                      <p className="text-3xl font-bold text-red-600">{newBugCount}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">신규 신고</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <Bug className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* 탭 */}
          <Tabs defaultValue="verifications" className="w-full">
            <TabsList className="bg-card  border border-border 700 700 shadow-sm mb-6 p-1 rounded-xl h-auto">
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
                통계
              </TabsTrigger>
            </TabsList>

            {/* 인증 요청 관리 탭 */}
            <TabsContent value="verifications" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">인증 요청 관리</CardTitle>
                  <CardDescription>멘토 신원 인증 요청을 검토하고 승인/거부합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  {pendingVerifications && pendingVerifications.length > 0 ? (
                    <div className="space-y-4">
                      {pendingVerifications.map((verification: any) => (
                        <div key={verification.id} className="border border-border 700 700 rounded-lg p-4 hover:shadow-sm transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h3 className="font-semibold text-foreground">{verification.user?.name}</h3>
                              <p className="text-sm text-muted-foreground">{verification.user?.email}</p>
                            </div>
                            <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50">
                              대기 중
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">대학교</p>
                              <p className="font-medium text-foreground">{verification.university}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">학과</p>
                              <p className="font-medium text-foreground">{verification.major}</p>
                            </div>
                          </div>

                          {verification.documentUrl && (
                            <div className="mb-4">
                              <p className="text-sm text-muted-foreground mb-2">제출 서류</p>
                              <a 
                                href={verification.documentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-green-600 dark:text-green-400 hover:text-green-700 dark:text-green-400 text-sm flex items-center gap-1"
                              >
                                <ExternalLink className="h-4 w-4" />
                                서류 보기
                              </a>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => approveMutation.mutate({ verificationId: verification.id })}
                              disabled={approveMutation.isPending}
                            >
                              {approveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                              승인
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectingId(rejectingId === verification.id ? null : verification.id)}
                            >
                              <XCircle className="h-4 w-4" />
                              거부
                            </Button>
                          </div>

                          {rejectingId === verification.id && (
                            <div className="mt-3 p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50">
                              <Label className="text-sm text-foreground mb-2 block">거부 사유</Label>
                              <Textarea
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                                placeholder="거부 사유를 입력하세요..."
                                className="mb-2 text-sm"
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  className="bg-red-600 hover:bg-red-700"
                                  onClick={() => {
                                  rejectMutation.mutate({
                                    verificationId: verification.id,
                                    adminNotes: rejectReason,
                                  });
                                  }}
                                  disabled={rejectMutation.isPending || !rejectReason.trim()}
                                >
                                  {rejectMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "거부 확인"}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setRejectingId(null);
                                    setRejectReason("");
                                  }}
                                >
                                  취소
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                      <p className="text-muted-foreground 300 300">대기 중인 인증 요청이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 멘토 프로필 관리 탭 */}
            <TabsContent value="mentors" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">멘토 프로필 관리</CardTitle>
                  <CardDescription>등록된 멘토 프로필을 검색하고 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="대학, 학과, 이름으로 검색..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {filteredMentors && filteredMentors.length > 0 ? (
                    <div className="space-y-3">
                      {filteredMentors.map((mentor: any) => (
                        <div key={mentor.id}>
                          <div className="border border-border 700 700 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">{mentor.user?.name}</h3>
                                <p className="text-sm text-muted-foreground">{mentor.profile.university} · {mentor.profile.major}</p>
                              </div>
                              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-0">활성</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground 300 300 mb-3">{mentor.profile.bio}</p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingMentor(editingMentor?.id === mentor.id ? null : mentor)}
                              >
                                <Edit className="h-4 w-4" />
                                편집
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm("정말 이 멘토를 삭제하시겠습니까?")) {
                                    deleteMentorMutation.mutate({ mentorId: mentor.id });
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                                삭제
                              </Button>
                            </div>
                          </div>
                          
                          {/* 편집 폼 */}
                          {editingMentor?.id === mentor.id && editingMentor?.profile && (
                            <div className="border border-blue-200 bg-primary/5 rounded-lg p-4 mt-2">
                              <h4 className="font-semibold text-foreground mb-3">프로필 편집</h4>
                              <div className="space-y-3">
                                <div>
                                  <Label className="text-sm">대학교</Label>
                                  <Input
                                    value={editingMentor.profile?.university || ""}
                                    onChange={(e) => setEditingMentor({
                                      ...editingMentor,
                                      profile: { ...editingMentor.profile, university: e.target.value }
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label className="text-sm">학과</Label>
                                  <Input
                                    value={editingMentor.profile?.major || ""}
                                    onChange={(e) => setEditingMentor({
                                      ...editingMentor,
                                      profile: { ...editingMentor.profile, major: e.target.value }
                                    })}
                                    className="mt-1"
                                  />
                                </div>
                                <div className="flex gap-2 pt-2">
                                  <Button
                                    size="sm"
                                    onClick={() => {
                                      if (editingMentor?.profile) {
                                        updateMentorMutation.mutate({
                                          mentorId: mentor.id,
                                          university: editingMentor.profile.university,
                                          major: editingMentor.profile.major,
                                        });
                                      }
                                    }}
                                    disabled={updateMentorMutation.isPending}
                                  >
                                    {updateMentorMutation.isPending ? (
                                      <>
                                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                        저장 중...
                                      </>
                                    ) : (
                                      "저장"
                                    )}
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingMentor(null)}
                                  >
                                    취소
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground 300 300">검색 결과가 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 상담 예약 관리 탭 */}
            <TabsContent value="bookings" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">상담 예약 관리</CardTitle>
                  <CardDescription>모든 상담 예약을 확인하고 관리합니다.</CardDescription>
                </CardHeader>
                <CardContent>
                  {allBookings && allBookings.length > 0 ? (
                    <div className="space-y-3">
                      {allBookings.map((item: any) => (
                        <div key={item.booking.id} className="border border-border 700 700 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="font-semibold text-foreground">{item.booking.mentee?.name} → {item.booking.mentor?.name}</h3>
                              <p className="text-sm text-muted-foreground">{format(new Date(item.booking.scheduledAt), "PPP p", { locale: ko })}</p>
                            </div>
                            <Badge className={
                              item.booking.status === "completed" ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" :
                              item.booking.status === "in_progress" ? "bg-primary/10 text-blue-700" :
                              item.booking.status === "cancelled" ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400" :
                              "bg-muted 800 text-foreground"
                            }>
                              {item.booking.status === "completed" ? "완료" :
                               item.booking.status === "in_progress" ? "진행 중" :
                               item.booking.status === "cancelled" ? "취소됨" : "예약됨"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground 300 300">{item.booking.topic}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-muted-foreground 300 300">상담 예약이 없습니다.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* 통계 탭 */}
            <TabsContent value="statistics" className="space-y-4">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">통계</CardTitle>
                  <CardDescription>서비스 통계 및 분석</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-primary/5 rounded-lg border border-blue-200">
                      <p className="text-sm text-blue-600 font-medium mb-1">총 멘토 수</p>
                      <p className="text-2xl font-bold text-blue-900">{mentors?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800/50">
                      <p className="text-sm text-amber-600 font-medium mb-1">대기 중인 인증</p>
                      <p className="text-2xl font-bold text-amber-900">{pendingVerifications?.length || 0}</p>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800/50">
                      <p className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">완료된 상담</p>
                      <p className="text-2xl font-bold text-green-900">{allBookings.filter((b: any) => b.booking.status === "completed").length}</p>
                    </div>
                    <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800/50">
                      <p className="text-sm text-red-600 font-medium mb-1">신규 버그 신고</p>
                      <p className="text-2xl font-bold text-red-900">{newBugCount}</p>
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
