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

  // 초기 프로필 데이터로 상태 초기화
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState<string>("");
  const [bio, setBio] = useState("");
  const [regions, setRegions] = useState<Array<string>>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; caption: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [emptyFields, setEmptyFields] = useState<Set<string>>(new Set());
  const [consultationTypes, setConsultationTypes] = useState<Array<"career_counseling" | "university_tour" | "resume_consulting" | "academic_management">>([])
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const utils = trpc.useUtils();

  const { data: myConsultationTypes } = trpc.mentor.getMyConsultationTypes.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 데이터 쿼리 (useEffect 이전에 선언)
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

  const { data: profile } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 프로필 데이터가 로드되면 폼 상태 초기화 (수정 모드가 아닐 때)
  useEffect(() => {
    if (profile && !isEditingProfile) {
      setUniversity(profile.university || "");
      setMajor(profile.major || "");
      setGrade(profile.grade || "");
      setBio(profile.bio || "");
      setRegions(profile.region ? [profile.region] : []);
    }
  }, [profile]);

  const { data: verification, refetch: refetchVerification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId: user?.id || 0 },
    { enabled: isAuthenticated && !!user?.id }
  );

  // 수정 모드 진입 시 기존 값으로 폼 초기화
  useEffect(() => {
    if (isEditingProfile && profile) {
      setUniversity(profile.university || "");
      setMajor(profile.major || "");
      setGrade(profile.grade || "");
      setBio(profile.bio || "");
      setRegions(profile.region ? [profile.region] : []);
      // 상담 유형은 myConsultationTypes에서 가져옴
      if (myConsultationTypes && myConsultationTypes.length > 0) {
        setConsultationTypes(myConsultationTypes.map((t: any) => t.consultationType));
      }
    }
  }, [isEditingProfile, myConsultationTypes]);

  const updateConsultationTypesMutation = trpc.mentor.updateConsultationTypes.useMutation({
    onSuccess: () => {
      toast.success("상담 유형이 업데이트되었습니다");
      utils.mentor.getMyConsultationTypes.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "상담 유형 업데이트에 실패했습니다");
    },
  });

  const updateProfileMutation = trpc.mentor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다");
      utils.mentor.getMyProfile.invalidate();
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "프로필 업데이트에 실패했습니다";
      toast.error(errorMessage);
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (error.data?.code === "UNAUTHORIZED" || errorMessage.includes("login")) {
        setTimeout(() => {
          setLocation(getLoginUrl());
        }, 1500);
      }
    },
  });

  const createProfileMutation = trpc.mentor.createProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 생성되었습니다");
      utils.mentor.getMyProfile.invalidate();
      setIsEditingProfile(false);
    },
    onError: (error: any) => {
      const errorMessage = error.message || "프로필 생성에 실패했습니다";
      toast.error(errorMessage);
      // 인증 실패 시 로그인 페이지로 리다이렉트
      if (error.data?.code === "UNAUTHORIZED" || errorMessage.includes("login")) {
        setTimeout(() => {
          setLocation(getLoginUrl());
        }, 1500);
      }
    },
  });



  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("비밀번호가 변경되었습니다");
      setIsPasswordModalOpen(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "비밀번호 변경에 실패했습니다");
    },
  });

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      setLocation("/");
    },
  });

  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation({
    onSuccess: () => {
      toast.success("계정이 삭제되었습니다");
      logout();
      setLocation("/");
    },
    onError: (error: any) => {
      toast.error(error.message || "계정 삭제에 실패했습니다");
    },
  });

  const uploadGalleryImageMutation = trpc.gallery.uploadImage.useMutation({
    onSuccess: () => {
      toast.success("이미지가 업로드되었습니다");
      setIsUploading(false);
      setNewCaption("");
      utils.gallery.getByMentorId.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "이미지 업로드에 실패했습니다");
      setIsUploading(false);
    },
  });

  const deleteGalleryImageMutation = trpc.gallery.deleteImage.useMutation({
    onSuccess: () => {
      toast.success("이미지가 삭제되었습니다");
      utils.gallery.getByMentorId.invalidate();
    },
    onError: (error: any) => {
      toast.error(error.message || "이미지 삭제에 실패했습니다");
    },
  });

  if (!isAuthenticated) {
    return <PageLayout><div>로그인이 필요합니다</div></PageLayout>;
  }

  if (!user) {
    return <PageLayout><div>사용자 정보를 불러오는 중...</div></PageLayout>;
  }

  const handlePasswordChange = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
      confirmPassword: passwordForm.confirmPassword,
    });
  };

  const handleConsultationTypeToggle = (type: "career_counseling" | "university_tour" | "resume_consulting" | "academic_management") => {
    const newTypes = consultationTypes.includes(type)
      ? consultationTypes.filter(t => t !== type)
      : [...consultationTypes, type];
    setConsultationTypes(newTypes);
    updateConsultationTypesMutation.mutate({ consultationTypes: newTypes });
  };

  const handleImageUpload = (file: File) => {
    if (!profile) {
      toast.error("멘토 프로필을 먼저 등록해주세요");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64Data = e.target?.result as string;
      setIsUploading(true);
      uploadGalleryImageMutation.mutate({
        mentorId: profile.id,
        imageData: base64Data,
        caption: newCaption,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageUpload(files[0]);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-slate-50">
        {/* 헤더 */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold text-gray-900">멘토 대시보드</h1>
            <p className="text-gray-600 mt-2">프로필 정보를 관리하고 활동을 추적하세요.</p>
          </div>
        </div>

        {/* 메인 콘텐츠 */}
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* 좌측 사이드바 (Sticky) */}
            <div className="col-span-3">
              <div className="sticky top-6 space-y-4">
                {/* 사용자 정보 카드 */}
                <Card className="bg-white">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold">
                        {user.name?.charAt(0) || "M"}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{user.name}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>

                    {/* 활동 지표 */}
                    <div className="space-y-3 mb-6">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">총 상담 수</p>
                        <p className="text-2xl font-bold text-blue-600">{myReviews?.length || 0}</p>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600">평균 평점</p>
                        <div className="flex items-center gap-1">
                          <p className="text-2xl font-bold text-yellow-600">
                            {myReviews && myReviews.length > 0
                              ? (myReviews.reduce((sum: number, r: any) => sum + (r.review?.rating || r.rating || 0), 0) / myReviews.length).toFixed(1)
                              : "-"}
                          </p>
                          <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="space-y-2">
                      <button
                        onClick={() => setIsPasswordModalOpen(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition"
                      >
                        <Lock className="w-4 h-4" />
                        비밀번호 변경
                      </button>
                      <button
                        onClick={() => logoutMutation.mutate()}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition"
                      >
                        <LogOut className="w-4 h-4" />
                        로그아웃
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* 우측 콘텐츠 리스트 (Scrollable) */}
            <div className="col-span-9 space-y-6">
              {/* 그룹 1: 기본 설정 */}
              <Card className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">기본 설정</h2>
                    <p className="text-sm text-gray-600 mt-1">프로필 정보를 관리하세요</p>
                  </div>
                  {!isEditingProfile && (
                    <button
                      onClick={() => setIsEditingProfile(true)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                    >
                      수정
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>대학교 *</Label>
                        <Input
                          placeholder="예: 서울대학교"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          disabled={verification?.status === "approved"}
                          className="mt-2"
                          title={verification?.status === "approved" ? "인증 완료된 대학교는 수정할 수 없습니다" : ""}
                        />
                        {verification?.status === "approved" && (
                          <p className="text-xs text-gray-500 mt-1">✓ 인증 완료된 정보입니다</p>
                        )}
                      </div>
                      <div>
                        <Label>전공 *</Label>
                        <Input
                          placeholder="예: 컴퓨터공학"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          disabled={verification?.status === "approved"}
                          className="mt-2"
                          title={verification?.status === "approved" ? "인증 완료된 전공은 수정할 수 없습니다" : ""}
                        />
                        {verification?.status === "approved" && (
                          <p className="text-xs text-gray-500 mt-1">✓ 인증 완료된 정보입니다</p>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>학년 *</Label>
                        <Select value={grade} onValueChange={(value) => setGrade(value as any)}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="학년 선택" />
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
                        <Label>상담 가능 지역 *</Label>
                        <Select value={regions[0] || ""} onValueChange={(value) => setRegions([value as any])}>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="지역 선택" />
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
                      <Label>자기소개 *</Label>
                      <Textarea
                        placeholder="당신의 멘토링 경험, 강점, 상담 스타일 등을 소개해주세요."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="mt-2 min-h-24"
                      />
                    </div>

                    <div>
                      <Label className="block mb-3">상담 유형 *</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(CONSULTATION_TYPE_LABELS).map(([key, label]) => (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleConsultationTypeToggle(key as any)}
                            className={`px-4 py-2 rounded-lg font-medium transition ${
                              consultationTypes.includes(key as any)
                                ? "bg-green-600 text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition"
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          // 1. regions 배열이 비어있으면 기본값 사용
                          const selectedRegion = regions[0] || "seoul";
                          
                          // 2. 공통 페이로드(전송할 데이터) 구성
                          const payload = {
                            university,
                            major,
                            grade: (grade || "1") as "1" | "2" | "3" | "4" | "graduate",
                            bio,
                            region: selectedRegion as "seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju",
                            hourlyRate: "50000",
                          };

                          // 3. 프로필 존재 여부에 따라 수정(Update) 또는 생성(Create) 분기 처리
                          if (profile) {
                            updateProfileMutation.mutate(payload);
                          } else {
                            createProfileMutation.mutate(payload);
                          }
                        }}
                        disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                      >
                        {(updateProfileMutation.isPending || createProfileMutation.isPending) ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" /> 저장 중...
                          </span>
                        ) : (
                          "저장하기"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">대학교</p>
                        <p className="font-semibold text-gray-900">{profile?.university || "-"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">전공</p>
                        <p className="font-semibold text-gray-900">{profile?.major || "-"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">학년</p>
                        <p className="font-semibold text-gray-900">{profile?.grade || "-"}</p>
                      </div>
                    <div>
                      <p className="text-sm text-gray-600">상담가능지역</p>
                      <p className="font-semibold text-gray-900">{profile?.region ? REGION_LABELS[profile.region] || profile.region : "-"}</p>
                    </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">자기소개</p>
                      <p className="font-semibold text-gray-900">{profile?.bio || "-"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">상담 유형</p>
                      <div className="flex flex-wrap gap-2">
                        {myConsultationTypes?.map((type: any) => (
                          <Badge key={type.consultationType} className="bg-green-100 text-green-800">
                            {CONSULTATION_TYPE_LABELS[type.consultationType]}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* 그룹 2: 칼럼 스튜디오 */}
              <Card className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">칼럼 스튜디오</h2>
                    <p className="text-sm text-gray-600 mt-1">작성한 칼럼 관리</p>
                  </div>
                  <Link href="/columns/new">
                    <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex items-center gap-2">
                      <Plus className="w-4 h-4" />
                      새 칼럼
                    </button>
                  </Link>
                </div>

                {myColumns && myColumns.length > 0 ? (
                  <div className="space-y-3">
                    {myColumns.slice(0, 4).map((column: any) => (
                      <Link key={column.id} href={`/columns/${column.id}`}>
                        <div className="p-3 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition cursor-pointer">
                          <h3 className="font-semibold text-gray-900">{column.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(column.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">작성한 칼럼이 없습니다</p>
                )}
              </Card>

              {/* 그룹 3: QnA 센터 */}
              <Card className="bg-white rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">QnA 센터</h2>
                {myAnswers && myAnswers.length > 0 ? (
                  <div className="space-y-3">
                    {myAnswers.slice(0, 5).map((answer: any) => (
                      <div key={answer.id} className="p-3 border border-gray-200 rounded-lg">
                        <p className="font-semibold text-gray-900">{answer.question?.title || "질문"}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(answer.createdAt).toLocaleDateString("ko-KR")}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">답변한 질문이 없습니다</p>
                )}
              </Card>

              {/* 그룹 4: 후기 관리 */}
              <Card className="bg-white rounded-2xl p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">후기 관리</h2>
                {myReviews && myReviews.length > 0 ? (
                  <div className="space-y-4">
                    {myReviews.map((review: any) => (
                      <div key={review.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(review.createdAt).toLocaleDateString("ko-KR")}
                          </p>
                        </div>
                        <p className="text-gray-700">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">받은 후기가 없습니다</p>
                )}
              </Card>

              {/* 그룹 5: 갤러리 */}
              <Card className="bg-white rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">갤러리</h2>
                  {profile && (
                    <span className="text-sm text-gray-600">{gallery?.length || 0}개 이미지</span>
                  )}
                </div>

                {profile ? (
                  <div className="space-y-6">
                    {/* 이미지 업로드 영역 */}
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition ${
                        dragActive
                          ? "border-green-500 bg-green-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                      <p className="text-xs text-gray-500 mb-4">JPG, PNG 형식 (최대 5MB)</p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                          disabled={isUploading}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                          }}
                          disabled={isUploading}
                          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50"
                        >
                          {isUploading ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" /> 업로드 중...
                            </span>
                          ) : (
                            "파일 선택"
                          )}
                        </button>
                      </label>
                    </div>

                    {/* 캡션 입력 */}
                    <div>
                      <Label>이미지 설명 (선택사항)</Label>
                      <Textarea
                        value={newCaption}
                        onChange={(e) => setNewCaption(e.target.value)}
                        placeholder="이 이미지에 대한 설명을 입력해주세요"
                        className="mt-2"
                        rows={2}
                      />
                    </div>

                    {/* 갤러리 이미지 그리드 */}
                    {gallery && gallery.length > 0 ? (
                      <div className="grid grid-cols-3 gap-4">
                        {gallery.map((image: any) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.imageUrl}
                              alt={image.caption || "갤러리 이미지"}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 rounded-lg transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <button
                                type="button"
                                onClick={() => deleteGalleryImageMutation.mutate({ imageId: image.id })}
                                className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition"
                                title="삭제"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            {image.caption && (
                              <p className="text-xs text-gray-600 mt-2 truncate">{image.caption}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-8">아직 업로드된 이미지가 없습니다</p>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600">멘토 프로필을 먼저 등록해주세요</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* 비밀번호 변경 모달 */}
      <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>비밀번호 변경</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 비밀번호 요구사항 안내 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>비밀번호 요구사항:</strong> 최소 8자 이상이어야 합니다
              </p>
            </div>

            <div>
              <Label>현재 비밀번호</Label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                placeholder="현재 비밀번호를 입력해주세요"
                className="mt-2"
              />
            </div>
            <div>
              <Label>새 비밀번호</Label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                placeholder="새 비밀번호를 입력해주세요 (8자 이상)"
                minLength={8}
                className="mt-2"
              />
              {passwordForm.newPassword && passwordForm.newPassword.length < 8 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 비밀번호는 최소 8자 이상이어야 합니다
                </p>
              )}
            </div>
            <div>
              <Label>새 비밀번호 확인</Label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                placeholder="새 비밀번호를 다시 입력해주세요"
                minLength={8}
                className="mt-2"
              />
              {passwordForm.confirmPassword && passwordForm.confirmPassword.length < 8 && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 비밀번호는 최소 8자 이상이어야 합니다
                </p>
              )}
              {passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
                <p className="text-xs text-red-600 mt-1">
                  ⚠️ 비밀번호가 일치하지 않습니다
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-lg transition"
              >
                취소
              </button>
              <button
                onClick={handlePasswordChange}
                disabled={
                  changePasswordMutation.isPending ||
                  !passwordForm.currentPassword ||
                  passwordForm.newPassword.length < 8 ||
                  passwordForm.confirmPassword.length < 8 ||
                  passwordForm.newPassword !== passwordForm.confirmPassword
                }
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {changePasswordMutation.isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> 변경 중...
                  </span>
                ) : (
                  "변경"
                )}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
