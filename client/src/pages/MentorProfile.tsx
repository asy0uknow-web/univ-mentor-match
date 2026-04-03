import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, CheckCircle, AlertCircle, Clock, Upload, X, Loader2, Shield, ShieldCheck, ShieldAlert, ShieldOff, RefreshCw, User, Mail, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

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

  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

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
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingEmail, setIsUpdatingEmail] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const utils = trpc.useUtils();

  const { data: myConsultationTypes } = trpc.mentor.getMyConsultationTypes.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const updateConsultationTypesMutation = trpc.mentor.updateConsultationTypes.useMutation({
    onSuccess: () => {
      toast.success("상담 유형이 업데이트되었습니다!");
      utils.mentor.getMyConsultationTypes.invalidate();
    },
    onError: (error) => {
      toast.error(`상담 유형 업데이트 실패: ${error.message}`);
    },
  });

  useEffect(() => {
    if (myConsultationTypes) {
      setConsultationTypes(myConsultationTypes.map((ct: any) => ct.consultationType));
    }
  }, [myConsultationTypes]);

  const { data: verification, refetch: refetchVerification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: (data: any) => data?.status === "pending" ? 30000 : false,
  });

  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId: user?.id || 0 },
    { enabled: isAuthenticated && !!user?.id }
  );

  const createProfileMutation = trpc.mentor.createProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 생성되었습니다!");
      utils.mentor.getMyProfile.invalidate();
      setIsEditingProfile(false);
    },
    onError: (error) => {
      toast.error(`프로필 생성 실패: ${error.message}`);
    },
  });

  const updateProfileMutation = trpc.mentor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다!");
      utils.mentor.getMyProfile.invalidate();
      setIsEditingProfile(false);
    },
    onError: (error) => {
      toast.error(`프로필 업데이트 실패: ${error.message}`);
    },
  });

  useEffect(() => {
    if (profile) {
      setUniversity(profile.university);
      setMajor(profile.major);
      setGrade(profile.grade);
      setBio(profile.bio || "");
      setRegions(profile.region ? [profile.region] : []);
    }
  }, [profile]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsUploading(true);
    const newImages: Array<{ url: string; caption: string }> = [];

    for (const file of Array.from(files)) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");
        const data = await response.json();
        newImages.push({ url: data.url, caption: "" });
      } catch (error) {
        toast.error("이미지 업로드 실패");
      }
    }

    setUploadedImages([...uploadedImages, ...newImages]);
    setIsUploading(false);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const input = document.getElementById("file-input") as HTMLInputElement;
      input.files = e.dataTransfer.files;
      handleFileChange({ target: input } as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const empty = new Set<string>();
    if (!university) empty.add("university");
    if (!major) empty.add("major");
    if (!bio) empty.add("bio");
    if (regions.length === 0) empty.add("region");

    if (empty.size > 0) {
      setEmptyFields(empty);
      const firstEmptyField = Array.from(empty)[0];
      const element = document.getElementById(firstEmptyField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      toast.error("필수 항목을 모두 입력해주세요.");
      return;
    }
    setEmptyFields(new Set());

    const validGrades = ["1", "2", "3", "4", "graduate"];
    const validGrade = validGrades.includes(grade) ? grade : "1";

    if (profile) {
      updateProfileMutation.mutate({
        university,
        major,
        grade: validGrade,
        bio,
        hourlyRate: "0",
        region: regions[0] || null,
      });
    } else {
      createProfileMutation.mutate({
        university,
        major,
        grade: validGrade,
        bio,
        hourlyRate: "0",
        region: regions[0] || null,
      });
    }

    if (consultationTypes.length > 0) {
      updateConsultationTypesMutation.mutate({ consultationTypes });
    }
  };

  const toggleConsultationType = (type: "career_counseling" | "university_tour" | "resume_consulting" | "academic_management") => {
    const updated = consultationTypes.includes(type)
      ? consultationTypes.filter((t) => t !== type)
      : [...consultationTypes, type];
    setConsultationTypes(updated);
  };

  const verificationConfig = {
    approved: {
      icon: <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />,
      badge: <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100 text-xs sm:text-sm">인증 완료</Badge>,
      cardClass: "border-green-200 bg-green-50",
      message: "학생증 인증이 완료되었습니다. 멘토로 활동할 수 있습니다.",
      buttonLabel: "인증서 보기",
      buttonVariant: "outline" as const,
    },
    pending: {
      icon: <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500" />,
      badge: <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 text-xs sm:text-sm">검토 중</Badge>,
      cardClass: "border-amber-200 bg-amber-50",
      message: "인증 서류가 제출되었습니다. 관리자 검토 후 승인됩니다. (보통 1~2 영업일 소요)",
      buttonLabel: "제출 내역 확인",
      buttonVariant: "outline" as const,
    },
    rejected: {
      icon: <ShieldAlert className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" />,
      badge: <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-xs sm:text-sm">인증 거부</Badge>,
      cardClass: "border-red-200 bg-red-50",
      message: "인증이 거부되었습니다. 사유를 확인하고 다시 신청해주세요.",
      buttonLabel: "재신청하기",
      buttonVariant: "default" as const,
    },
  };

  const currentVerificationConfig = verification ? verificationConfig[verification.status as keyof typeof verificationConfig] : null;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="max-w-2xl mx-auto">
            {/* 헤더 */}
            <div className="mb-6 sm:mb-8">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">
                  {profile ? "멘토 프로필 수정" : "멘토로 등록하기"}
                </h1>
              </div>
              <p className="text-gray-500 text-xs sm:text-sm ml-10 sm:ml-13 pl-1">
                {profile ? "프로필 정보를 최신 상태로 유지하세요." : "아래 정보를 입력하고 멘토로 등록하세요."}
              </p>
            </div>

            {/* 인증 상태 */}
            {currentVerificationConfig && (
              <Card className={`mb-4 sm:mb-6 ${currentVerificationConfig.cardClass}`}>
                <CardContent className="p-3 sm:p-6">
                  <div className="flex items-start gap-2 sm:gap-3">
                    {currentVerificationConfig.icon}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">{currentVerificationConfig.message}</p>
                      <Button
                        variant={currentVerificationConfig.buttonVariant}
                        size="sm"
                        className="text-xs sm:text-sm h-7 sm:h-9"
                        onClick={() => setLocation("/verify-mentor")}
                      >
                        {currentVerificationConfig.buttonLabel}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 탭 기반 프로필 및 계정 설정 */}
            <Tabs defaultValue="profile" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4 sm:mb-6">
                <TabsTrigger value="profile" className="text-xs sm:text-sm">프로필</TabsTrigger>
                <TabsTrigger value="account" className="text-xs sm:text-sm">계정 설정</TabsTrigger>
              </TabsList>

              {/* 프로필 탭 */}
              <TabsContent value="profile" className="space-y-4 sm:space-y-6">
                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                  {/* 기본 정보 */}
                  <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">기본 정보</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="university" className="text-xs sm:text-sm">대학교 *</Label>
                    <Input
                      id="university"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="예: 서울대학교"
                      className="mt-1 sm:mt-2 text-xs sm:text-sm h-8 sm:h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="major" className="text-xs sm:text-sm">전공 *</Label>
                    <Input
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="예: 컴퓨터공학"
                      className="mt-1 sm:mt-2 text-xs sm:text-sm h-8 sm:h-10"
                    />
                  </div>

                  <div>
                    <Label htmlFor="grade" className="text-xs sm:text-sm">학년 *</Label>
                    <Select value={grade} onValueChange={(value: any) => setGrade(value)}>
                      <SelectTrigger id="grade" className="mt-1 sm:mt-2 text-xs sm:text-sm h-8 sm:h-10">
                        <SelectValue placeholder="학년을 선택해주세요" />
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
                    <Label htmlFor="region" className="text-xs sm:text-sm">상담 가능 지역 *</Label>
                    <Select value={regions[0] || ""} onValueChange={(value) => setRegions([value as any])}>
                      <SelectTrigger id="region" className="mt-1 sm:mt-2 text-xs sm:text-sm h-8 sm:h-10">
                        <SelectValue placeholder="지역을 선택해주세요" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(REGION_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* 소개 */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">소개</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="bio" className="text-xs sm:text-sm">자기소개 *</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="당신의 멘토링 경험, 강점, 상담 스타일 등을 소개해주세요."
                    className="mt-1 sm:mt-2 text-xs sm:text-sm min-h-24 sm:min-h-32"
                  />
                </CardContent>
              </Card>

              {/* 상담 유형 */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">상담 유형</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {Object.entries(CONSULTATION_TYPE_LABELS).map(([key, label]) => (
                      <Button
                        key={key}
                        type="button"
                        variant={consultationTypes.includes(key as any) ? "default" : "outline"}
                        onClick={() => toggleConsultationType(key as any)}
                        className="text-xs sm:text-sm h-8 sm:h-10"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 갤러리 */}
              <Card>
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-base sm:text-lg">갤러리</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-4 sm:p-8 text-center cursor-pointer transition-colors ${
                      dragActive ? "border-primary bg-primary/5" : "border-gray-300"
                    }`}
                  >
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="file-input" className="cursor-pointer block">
                      {isUploading ? (
                        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-2" />
                      ) : (
                        <Upload className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-gray-400" />
                      )}
                      <p className="text-xs sm:text-sm font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
                    </label>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {uploadedImages.map((image, idx) => (
                        <div key={idx} className="relative group">
                          <img src={image.url} alt={`갤러리 ${idx}`} className="w-full aspect-square object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* 저장 버튼 */}
              <div className="flex gap-2 sm:gap-3">
                <Button
                  type="submit"
                  disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
                >
                  {createProfileMutation.isPending || updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    "저장하기"
                  )}
                </Button>
              </div>
            </form>
              </TabsContent>

              {/* 계정 설정 탭 */}
              <TabsContent value="account" className="space-y-4 sm:space-y-6">
                {/* 개인 정보 */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <User className="h-4 w-4 sm:h-5 sm:w-5" />
                      개인 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">이름</p>
                        <p className="font-semibold text-sm sm:text-base">{user?.name || "정보 없음"}</p>
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground">역할</p>
                        <p className="font-semibold text-sm sm:text-base">멘토</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
                        <Mail className="h-3 w-3 sm:h-4 sm:w-4" />
                        이메일
                      </p>
                      <p className="font-semibold text-xs sm:text-sm break-all">{user?.email || "정보 없음"}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* 계정 관리 */}
                <Card>
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-base sm:text-lg">계정 관리</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <Button
                      onClick={() => {
                        // 로그아웃 로직
                        toast.success("로그아웃되었습니다");
                      }}
                      variant="outline"
                      className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10"
                    >
                      <LogOut className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                      로그아웃
                    </Button>
                    <Link href="/delete-account">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-xs sm:text-sm h-9 sm:h-10 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        계정 삭제
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
