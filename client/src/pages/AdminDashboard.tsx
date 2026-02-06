import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Search, CheckCircle, XCircle, AlertCircle, Edit, Trash2, Clock, Bug } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMentor, setEditingMentor] = useState<any>(null);

  const { data: mentors } = trpc.admin.getAllMentors.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: pendingVerifications } = trpc.admin.getPendingVerifications.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const { data: bugReports } = trpc.bugReport.getAll.useQuery({
    status: undefined,
  }, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const newBugCount = bugReports?.filter((report: any) => report.status === "new").length || 0;

  const approveMutation = trpc.admin.approveVerification.useMutation({
    onSuccess: () => {
      toast.success("인증이 승인되었습니다.");
    },
    onError: (error) => {
      toast.error(`승인 실패: ${error.message}`);
    },
  });

  const rejectMutation = trpc.admin.rejectVerification.useMutation({
    onSuccess: () => {
      toast.success("인증이 거부되었습니다.");
    },
    onError: (error) => {
      toast.error(`거부 실패: ${error.message}`);
    },
  });

  const updateMentorMutation = trpc.admin.updateMentorProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 업데이트되었습니다.");
      setEditingMentor(null);
    },
    onError: (error) => {
      toast.error(`업데이트 실패: ${error.message}`);
    },
  });

  const deleteMentorMutation = trpc.admin.deleteMentorProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 삭제되었습니다.");
    },
    onError: (error) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>관리자로 로그인해주세요.</CardDescription>
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

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>접근 권한 없음</CardTitle>
            <CardDescription>관리자만 접근할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">홈으로 돌아가기</Button>
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
      <div className="container mx-auto px-4 py-12">
        {/* 대시보드 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">대기 중인 인증</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{pendingVerifications?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">승인 대기 중</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">등록된 멘토</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{mentors?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">활성 멘토</p>
            </CardContent>
          </Card>

          <Link href="/admin/bug-reports">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">버그 신고</CardTitle>
                  <Bug className="h-5 w-5 text-red-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">{newBugCount}</div>
                <p className="text-xs text-muted-foreground mt-1">신규 신고</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        <Tabs defaultValue="mentors" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mentors">멘토 프로필 관리</TabsTrigger>
            <TabsTrigger value="verifications">인증 요청 관리</TabsTrigger>
          </TabsList>

          {/* 멘토 프로필 관리 탭 */}
          <TabsContent value="mentors" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">멘토 프로필 관리</h2>
              
              {/* 검색 */}
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="대학, 전공, 이름으로 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* 멘토 목록 */}
              <div className="space-y-4">
                {filteredMentors.length === 0 ? (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-muted-foreground">멘토가 없습니다.</p>
                    </CardContent>
                  </Card>
                ) : (
                  filteredMentors.map((mentor) => (
                    <Card key={mentor.profile.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{mentor.user?.name || "Unknown"}</CardTitle>
                            <CardDescription>
                              {mentor.profile.university} {mentor.profile.major}
                            </CardDescription>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingMentor(mentor)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              수정
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                if (confirm("정말 삭제하시겠습니까?")) {
                                  deleteMentorMutation.mutate({ mentorId: mentor.profile.userId });
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              삭제
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <p className="text-sm"><strong>학년:</strong> {mentor.profile.grade}</p>
                        <p className="text-sm"><strong>시간당 상담료:</strong> ₩{mentor.profile.hourlyRate}</p>
                        <p className="text-sm"><strong>자기소개:</strong> {mentor.profile.bio}</p>
                        <p className="text-sm">
                          <strong>상태:</strong> {mentor.profile.isActive ? "활성" : "비활성"}
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* 수정 모달 */}
            {editingMentor && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle>멘토 프로필 수정</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>대학</Label>
                    <Input defaultValue={editingMentor.profile.university} />
                  </div>
                  <div>
                    <Label>전공</Label>
                    <Input defaultValue={editingMentor.profile.major} />
                  </div>
                  <div>
                    <Label>학년</Label>
                    <Input defaultValue={editingMentor.profile.grade} />
                  </div>
                  <div>
                    <Label>시간당 상담료</Label>
                    <Input defaultValue={editingMentor.profile.hourlyRate} />
                  </div>
                  <div>
                    <Label>자기소개</Label>
                    <Input defaultValue={editingMentor.profile.bio} />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => setEditingMentor(null)}
                      variant="outline"
                    >
                      취소
                    </Button>
                    <Button
                      onClick={() => {
                        toast.info("수정 기능은 준비 중입니다.");
                      }}
                    >
                      저장
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* 인증 요청 관리 탭 */}
          <TabsContent value="verifications" className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">대기 중인 인증 요청</h2>

              {pendingVerifications && pendingVerifications.length === 0 ? (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-center text-muted-foreground">대기 중인 인증 요청이 없습니다.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {pendingVerifications?.map((verification) => (
                    <Card key={verification.verification.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle>{verification.user.name}</CardTitle>
                            <CardDescription>
                              신청일: {new Date(verification.verification.createdAt).toLocaleDateString("ko-KR")}
                            </CardDescription>
                          </div>
                          <Clock className="h-5 w-5 text-yellow-500" />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label>학생증 이미지</Label>
                          {verification.verification.studentIdImageUrl && (
                            <img
                              src={verification.verification.studentIdImageUrl}
                              alt="Student ID"
                              className="mt-2 max-h-64 rounded-lg border border-border"
                            />
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => {
                              approveMutation.mutate({ verificationId: verification.verification.id });
                            }}
                            disabled={approveMutation.isPending}
                            className="flex-1"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            승인
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const reason = prompt("거부 사유를 입력해주세요:");
                              if (reason) {
                                rejectMutation.mutate({
                                  verificationId: verification.verification.id,
                                  adminNotes: reason,
                                });
                              }
                            }}
                            disabled={rejectMutation.isPending}
                            className="flex-1"
                          >
                            <XCircle className="h-4 w-4 mr-2" />
                            거부
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
