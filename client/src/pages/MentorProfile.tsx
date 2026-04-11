import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, CheckCircle, AlertCircle, Clock, Upload, X, Loader2, Shield, ShieldCheck, ShieldAlert, ShieldOff, RefreshCw, User, Mail, LogOut, Lock, BookOpen, MessageSquare, Star, ArrowRight, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  career_counseling: "진로상담",
  university_tour: "대학탐방",
  resume_consulting: "생기부컨설팅",
  academic_management: "학업관리",
};

const REGION_LABELS: Record<string, string> = {
  seoul: "서울",
  gyeonggi: "경기",
  incheon: "인천",
  gangwon: "강원",
  chungcheong: "충청",
  jeolla: "전라",
  gyeongsang: "경상",
  jeju: "제주",
};

export default function MentorProfile() {
  useEffect(() => {
    setPageMeta(PAGE_META.profile);
  }, []);

  const { user, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  // All hooks must be declared before any conditional returns (React Rules of Hooks)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
  
  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("비밀번호가 변경되었습니다");
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    },
    onError: (error: any) => {
      toast.error(error.message || "비밀번호 변경에 실패했습니다");
    },
  });

  const { data: profile, isLoading } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (!isLoading && !profile && isAuthenticated) {
      setLocation("/student-profile");
    }
  }, [profile, isLoading, isAuthenticated, setLocation]);

  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState<"1" | "2" | "3" | "4" | "graduate">("1");
  const [bio, setBio] = useState("");
  const [regions, setRegions] = useState<Array<"seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju">>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; caption: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [emptyFields, setEmptyFields] = useState<Set<string>>(new Set());
  const [consultationTypes, setConsultationTypes] = useState<Array<"career_counseling" | "university_tour" | "resume_consulting" | "academic_management">>([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const utils = trpc.useUtils();

  const { data: myConsultationTypes } = trpc.mentor.getMyConsultationTypes.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateConsultationTypesMutation = trpc.mentor.updateConsultationTypes.useMutation({
    onSuccess: () => {
      toast.success("상담 유형이 업데이트되었습니다");
      utils.mentor.getMyConsultationTypes.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "상담 유형 업데이트에 실패했습니다");
    },
  });

  const { data: verification, refetch: refetchVerification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId: user?.id || 0 },
    { enabled: isAuthenticated && !!user?.id }
  );

  const createProfileMutation = trpc.mentor.createProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 생성되었습니다");
      utils.mentor.getMyProfile.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "프로필 생성에 실패했습니다");
    },
  });

  const updateProfileMutation = trpc.mentor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다");
      utils.mentor.getMyProfile.invalidate();
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "프로필 업데이트에 실패했습니다");
    },
  });

  // 데이터 쿼리
  const { data: myColumns } = trpc.mentorColumns.getMyColumns.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myAnswers } = trpc.qnaAnswer.getMyAnswers.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: myReviews } = trpc.review.getByMentor.useQuery(
    { mentorId: user?.id || 0 },
    { enabled: isAuthenticated && !!user?.id }
  );

  const { data: myBookings } = trpc.mentor.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <PageLayout>
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
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-green-500" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50 py-6 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">멘토 대시보드</h1>
            </div>
            <p className="text-gray-500 text-sm ml-10 sm:ml-13 pl-1">프로필 정보를 관리하고 활동을 추적하세요.</p>
          </div>

          {/* 메인 그리드 레이아웃 */}
          <div className="grid grid-cols-12 gap-6">
            {/* 좌측 사이드바 (3칸) */}
            <div className="col-span-12 lg:col-span-3">
              <div className="sticky top-6 space-y-4">
                {/* 사용자 정보 카드 */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                      <User className="h-8 w-8 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{user?.name || "사용자"}</p>
                      <p className="text-xs text-gray-500 truncate">{user?.email || "이메일 없음"}</p>
                    </div>
                  </div>

                  {/* 활동 지표 */}
                  <div className="space-y-3 mb-6 pb-6 border-b border-gray-100">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">총 상담 수</p>
                      <p className="text-2xl font-bold text-blue-600">{myBookings?.filter(b => b.booking.status === 'completed').length || 0}</p>
                    </div>
                      <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-3">
                      <p className="text-xs text-gray-600 mb-1">평균c 평점</p>
                      <div className="flex items-center gap-2">
                        <p className="text-2xl font-bold text-amber-600">{profile?.averageRating ? parseFloat(profile.averageRating).toFixed(1) : "0.0"}</p>
                        <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      </div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="space-y-2">
                    <Button
                      onClick={() => setIsPasswordModalOpen(true)}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                    >
                      <Lock className="h-3 w-3 mr-2" />
                      비밀번호 변경
                    </Button>
                    <Button
                      onClick={() => {
                        logout?.();
                        setLocation("/");
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs"
                    >
                      <LogOut className="h-3 w-3 mr-2" />
                      로그아웃
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* 우측 콘텐츠 리스트 (9칸) */}
            <div className="col-span-12 lg:col-span-9 space-y-6">
              {/* 그룹 1: 기본 설정 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                      <User className="h-4 w-4 text-green-600" />
                    </div>
                    기본 설정
                  </h2>
                  {!isEditingProfile && (
                    <Button
                      onClick={() => setIsEditingProfile(true)}
                      size="sm"
                      variant="ghost"
                      className="text-green-600 hover:bg-green-50"
                    >
                      수정
                    </Button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">대학교 *</Label>
                        <Input
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="예: 서울대학교"
                          className="mt-1 text-sm h-9"
                        />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">전공 *</Label>
                        <Input
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          placeholder="예: 컴퓨터공학"
                          className="mt-1 text-sm h-9"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-600">학년 *</Label>
                        <Select value={grade} onValueChange={(value: any) => setGrade(value)}>
                          <SelectTrigger className="mt-1 text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1학년</SelectItem>
                            <SelectItem value="2">2학년</SelectItem>
                            <SelectItem value="3">3학년</SelectItem>
                            <SelectItem value="4">4학년</SelectItem>
                            <SelectItem value="graduate">대학원</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-600">상담 가능 지역 *</Label>
                        <Select value={regions[0] || ""} onValueChange={(value) => setRegions([value as any])}>
                          <SelectTrigger className="mt-1 text-sm h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(REGION_LABELS).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600">자기소개 *</Label>
                      <Textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="당신의 멘토링 경험, 강점, 상담 스타일 등을 소개해주세요."
                        className="mt-1 text-sm min-h-24"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-gray-600 mb-2 block">상담 유형 *</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(CONSULTATION_TYPE_LABELS).map(([key, label]: [string, string]) => (
                          <Button
                            key={key}
                            type="button"
                            variant={consultationTypes.includes(key as any) ? "default" : "outline"}
                            onClick={() => {
                              setConsultationTypes(prev =>
                                prev.includes(key as any)
                                  ? prev.filter(t => t !== key as any)
                                  : [...prev, key as any]
                              );
                            }}
                            className="text-xs h-8"
                          >
                            {label}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => setIsEditingProfile(false)}
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        취소
                      </Button>
                      <Button
                        onClick={() => {
                          if (profile) {
                            updateProfileMutation.mutate({
                              university,
                              major,
                              grade,
                              bio,
                              region: regions[0],
                              hourlyRate: "50000",
                            });
                          } else {
                            createProfileMutation.mutate({
                              university,
                              major,
                              grade,
                              bio,
                              region: regions[0],
                              hourlyRate: "50000",
                            });
                          }
                        }}
                        disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                        size="sm"
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        저장
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">대학교</p>
                        <p className="font-medium text-gray-900">{profile?.university || "-"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">전공</p>
                        <p className="font-medium text-gray-900">{profile?.major || "-"}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">자기소개</p>
                      <p className="text-sm text-gray-700 line-clamp-3">{profile?.bio || "-"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-2">상담 유형</p>
                      <div className="flex flex-wrap gap-2">
                        {myConsultationTypes?.map((type: any) => (
                          <Badge key={type.consultationType} variant="secondary" className="bg-green-100 text-green-700">
                            {CONSULTATION_TYPE_LABELS[type.consultationType] || type.consultationType}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 그룹 2: 칼럼 스튜디오 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BookOpen className="h-4 w-4 text-blue-600" />
                    </div>
                    칼럼 스튜디오
                  </h2>
                  <Link href="/columns/new">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      새 칼럼
                    </Button>
                  </Link>
                </div>

                {myColumns && myColumns.length > 0 ? (
                  <div className="space-y-3">
                    {myColumns.slice(0, 5).map((column: any) => (
                      <Link key={column.id} href={`/columns/${column.id}`}>
                        <div className="flex items-start justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate text-sm">{column.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(column.createdAt).toLocaleDateString('ko-KR')}
                            </p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <BookOpen className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">작성한 칼럼이 없습니다</p>
                  </div>
                )}

                {myColumns && myColumns.length > 5 && (
                  <Link href="/mentor/columns">
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-green-600">
                      모두 보기 ({myColumns.length})
                    </Button>
                  </Link>
                )}
              </div>

              {/* 그룹 3: QnA 센터 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                      <MessageSquare className="h-4 w-4 text-purple-600" />
                    </div>
                    QnA 센터
                  </h2>
                </div>

                {myAnswers && myAnswers.length > 0 ? (
                  <div className="space-y-3">
                    {myAnswers.slice(0, 5).map((answer: any) => (
                      <div key={answer.id} className="p-3 rounded-lg hover:bg-gray-50 transition-colors">
                        <p className="text-xs text-gray-500 mb-1">답변한 질문</p>
                        <p className="font-medium text-gray-900 text-sm line-clamp-2">{answer.question?.title || "제목 없음"}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          {new Date(answer.createdAt).toLocaleDateString('ko-KR')}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">답변한 질문이 없습니다</p>
                  </div>
                )}

                {myAnswers && myAnswers.length > 5 && (
                  <Link href="/qna">
                    <Button variant="ghost" size="sm" className="w-full mt-4 text-green-600">
                      모두 보기 ({myAnswers.length})
                    </Button>
                  </Link>
                )}
              </div>

              {/* 그룹 4: 후기 관리 */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <Star className="h-4 w-4 text-amber-600" />
                    </div>
                    후기 관리
                  </h2>
                </div>

                {myReviews && myReviews.length > 0 ? (
                  <div className="space-y-4">
                    {myReviews.slice(0, 5).map((item) => (
                      <div key={item.review.id} className="p-4 rounded-lg bg-gray-50 border border-gray-100">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < item.review.rating
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-xs text-gray-500">
                            {new Date(item.review.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                        <p className="text-sm text-gray-700 line-clamp-2">{item.review.comment || "코멘트 없음"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Star className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">받은 후기가 없습니다</p>
                  </div>
                )}

                {myReviews && myReviews.length > 5 && (
                  <Button variant="ghost" size="sm" className="w-full mt-4 text-green-600">
                    모두 보기 ({myReviews.length})
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
            <DialogDescription>새로운 비밀번호를 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password" className="text-sm">현재 비밀번호</Label>
              <Input
                id="current-password"
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                className="mt-1 text-sm h-9"
              />
              {passwordErrors.currentPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.currentPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="new-password" className="text-sm">새 비밀번호</Label>
              <Input
                id="new-password"
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                className="mt-1 text-sm h-9"
              />
              {passwordErrors.newPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.newPassword}</p>
              )}
            </div>
            <div>
              <Label htmlFor="confirm-password" className="text-sm">비밀번호 확인</Label>
              <Input
                id="confirm-password"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                className="mt-1 text-sm h-9"
              />
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">{passwordErrors.confirmPassword}</p>
              )}
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setIsPasswordModalOpen(false)}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                취소
              </Button>
              <Button
                onClick={() => {
                  changePasswordMutation.mutate(passwordForm);
                }}
                disabled={changePasswordMutation.isPending}
                size="sm"
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                변경
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
