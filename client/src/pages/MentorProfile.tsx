import { useAuth } from "@/_core/hooks/useAuth";
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
import { GraduationCap, CheckCircle, AlertCircle, Clock, Upload, X, Loader2, Shield, ShieldCheck, ShieldAlert, ShieldOff, RefreshCw } from "lucide-react";
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

  // 멘티인 경우 StudentProfile 페이지로 리다이렉트
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
    { mentorId: profile?.id || 0 },
    { enabled: !!profile?.id }
  );

  const uploadGalleryMutation = trpc.gallery.uploadImage.useMutation({
    onSuccess: () => {
      toast.success("이미지가 업로드되었습니다");
      setUploadedImages([]);
      setNewCaption("");
      utils.gallery.getByMentorId.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "업로드 실패");
    },
  });

  const deleteGalleryMutation = trpc.gallery.deleteImage.useMutation({
    onSuccess: () => {
      toast.success("이미지가 삭제되었습니다");
      utils.gallery.getByMentorId.invalidate();
    },
  });

  // [오류3 수정] createProfile/updateProfile 조건 반전 수정 (profile 있으면 update, 없으면 create)
  const createProfileMutation = trpc.mentor.createProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토로 등록되었습니다!");
      utils.mentor.getMyProfile.invalidate();
    },
    onError: (error) => {
      toast.error(`멘토 등록 실패: ${error.message}`);
    },
  });

  const updateProfileMutation = trpc.mentor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다!");
      utils.mentor.getMyProfile.invalidate();
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <Card className="max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
              <GraduationCap className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">로그인이 필요합니다</CardTitle>
            <CardDescription>멘토 프로필을 관리하려면 로그인해주세요.</CardDescription>
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
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      handleFiles(files);
    }
  };

  const handleFiles = (files: FileList) => {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const target = e.target as FileReader;
          if (target && target.result) {
            setUploadedImages((prev) => [
              ...prev,
              { url: target.result as string, caption: "" },
            ]);
          }
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleUpload = async () => {
    if (!uploadedImages[0] || !profile?.id) return;
    setIsUploading(true);
    try {
      await uploadGalleryMutation.mutateAsync({
        mentorId: profile.id,
        imageData: uploadedImages[0].url,
        caption: newCaption || undefined,
        displayOrder: (gallery?.length || 0) + 1,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const empty = new Set<string>();
    if (!university) empty.add("university");
    if (!major) empty.add("major");

    if (regions.length === 0) empty.add("regions");

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

    // [오류3 수정] profile이 있으면 update, 없으면 create
    // 학년 값 검증: 유효한 값만 전달
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

    // 프로필 저장 시 상담 유형도 함께 저장
    if (consultationTypes.length > 0) {
      updateConsultationTypesMutation.mutate({ consultationTypes });
    }
  };

  const toggleConsultationType = (type: "career_counseling" | "university_tour" | "resume_consulting" | "academic_management") => {
    const updated = consultationTypes.includes(type)
      ? consultationTypes.filter((t) => t !== type)
      : [...consultationTypes, type];
    setConsultationTypes(updated);
    // 즉시 저장 대신 로컬 상태만 업데이트 (프로필 저장 시 함께 저장)
  };

  // 인증 상태별 UI 설정
  const verificationConfig = {
    approved: {
      icon: <ShieldCheck className="h-5 w-5 text-green-500" />,
      badge: <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">인증 완료</Badge>,
      cardClass: "border-green-200 bg-green-50",
      message: "학생증 인증이 완료되었습니다. 멘토로 활동할 수 있습니다.",
      buttonLabel: "인증서 보기",
      buttonVariant: "outline" as const,
    },
    pending: {
      icon: <Clock className="h-5 w-5 text-amber-500" />,
      badge: <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">검토 중</Badge>,
      cardClass: "border-amber-200 bg-amber-50",
      message: "인증 서류가 제출되었습니다. 관리자 검토 후 승인됩니다. (보통 1~2 영업일 소요)",
      buttonLabel: "제출 내역 확인",
      buttonVariant: "outline" as const,
    },
    rejected: {
      icon: <ShieldAlert className="h-5 w-5 text-red-500" />,
      badge: <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">인증 거부</Badge>,
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
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">

            {/* 헤더 */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profile ? "멘토 프로필 수정" : "멘토로 등록하기"}
                </h1>
              </div>
              <p className="text-gray-500 text-sm ml-13 pl-1">
                {profile ? "프로필 정보를 최신 상태로 유지하세요." : "아래 정보를 입력하고 멘토로 등록하세요."}
              </p>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-green-500" />
              </div>
            ) : (
              <>


                {/* [오류1 수정] 인증 상태 카드 - 상태별 정확한 메시지 표시 */}
                {profile && (
                  <Card className={`mb-5 shadow-sm ${currentVerificationConfig ? currentVerificationConfig.cardClass : "border-blue-200 bg-blue-50"}`}>
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          !verification ? "bg-blue-100" :
                          verification.status === "approved" ? "bg-green-100" :
                          verification.status === "pending" ? "bg-amber-100" : "bg-red-100"
                        }`}>
                          {!verification ? <Shield className="h-4 w-4 text-blue-500" /> : currentVerificationConfig?.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className={`font-semibold text-sm ${
                              !verification ? "text-blue-800" :
                              verification.status === "approved" ? "text-green-800" :
                              verification.status === "pending" ? "text-amber-800" : "text-red-800"
                            }`}>학생증 인증</span>
                            {currentVerificationConfig ? currentVerificationConfig.badge : (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs">미인증</Badge>
                            )}
                          </div>

                          {/* [오류1 수정] 상태별 정확한 메시지 */}
                          <p className={`text-sm mb-3 ${
                            !verification ? "text-blue-700" :
                            verification.status === "approved" ? "text-green-700" :
                            verification.status === "pending" ? "text-amber-700" : "text-red-700"
                          }`}>
                            {!verification
                              ? "멘토로 활동하기 위해 학생증 인증이 필요합니다."
                              : currentVerificationConfig?.message}
                          </p>

                          {/* 거부 사유 표시 */}
                          {verification?.status === "rejected" && verification.adminNotes && (
                            <div className="bg-red-100 border border-red-200 rounded-lg px-3 py-2 mb-3">
                              <p className="text-xs font-medium text-red-700 mb-0.5">거부 사유</p>
                              <p className="text-sm text-red-800">{verification.adminNotes}</p>
                            </div>
                          )}

                          {/* pending 상태: 검토 중 안내 */}
                          {verification?.status === "pending" && (
                            <div className="bg-amber-100 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                              <p className="text-xs text-amber-700">
                                제출일: {new Date(verification.createdAt).toLocaleDateString("ko-KR")}
                              </p>
                            </div>
                          )}

                          <div className="flex gap-2">
                            <Link href="/verify-mentor">
                              <Button
                                size="sm"
                                variant={currentVerificationConfig?.buttonVariant || "default"}
                                className={!verification || verification.status === "rejected" ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                              >
                                {!verification ? "인증하기" : currentVerificationConfig?.buttonLabel}
                              </Button>
                            </Link>
                            {/* [UX7] 인증 상태 수동 갱신 버튼 */}
                            {verification?.status === "pending" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => refetchVerification()}
                                className="text-amber-700 hover:bg-amber-100"
                              >
                                <RefreshCw className="h-3 w-3 mr-1.5" />
                                새로고침
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 멘토 등록 안내 카드 */}
                {!profile && (
                  <Card className="mb-5 border-amber-200 bg-amber-50 shadow-sm">
                    <CardContent className="pt-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <GraduationCap className="h-4 w-4 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-amber-800 text-sm mb-1">멘토 등록 안내</p>
                          <p className="text-sm text-amber-700">
                            아래 정보를 입력하고 등록 버튼을 클릭하면 멘토로 등록됩니다. 등록 후 학생증 인증을 완료해야 멘토로 활동할 수 있습니다.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 프로필 정보 카드 */}
                <Card className="shadow-sm border-0 bg-white">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">프로필 정보</CardTitle>
                    <CardDescription>
                      멘토로 활동하기 위한 정보를 입력해주세요. <span className="text-red-500">*</span> 표시된 항목은 필수입니다.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="university" className="text-sm font-medium">
                            대학교 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="university"
                            placeholder="예: 서울대학교"
                            value={university}
                            onChange={(e) => setUniversity(e.target.value)}
                            className={emptyFields.has("university") ? "border-red-400 focus-visible:ring-red-400" : ""}
                          />
                          {emptyFields.has("university") && (
                            <p className="text-xs text-red-500">대학교를 입력해주세요.</p>
                          )}
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="major" className="text-sm font-medium">
                            전공 <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="major"
                            placeholder="예: 컴퓨터공학"
                            value={major}
                            onChange={(e) => setMajor(e.target.value)}
                            className={emptyFields.has("major") ? "border-red-400 focus-visible:ring-red-400" : ""}
                          />
                          {emptyFields.has("major") && (
                            <p className="text-xs text-red-500">전공을 입력해주세요.</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label htmlFor="grade" className="text-sm font-medium">학년</Label>
                          <Select value={grade} onValueChange={(value: any) => setGrade(value)}>
                            <SelectTrigger id="grade">
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
                        <div className="space-y-1.5">
                          <Label className="text-sm font-medium">
                            지역 <span className="text-red-500">*</span>
                          </Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={`w-full justify-start text-left font-normal ${emptyFields.has("regions") ? "border-red-400" : ""}`}
                              >
                                {regions.length > 0
                                  ? `${regions.length}개 지역 선택됨`
                                  : "지역 선택"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-3" align="start">
                              <div className="grid grid-cols-2 gap-2">
                                {Object.entries(REGION_LABELS).map(([value, label]) => (
                                  <label key={value} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={regions.includes(value as any)}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setRegions([...regions, value as any]);
                                        } else {
                                          setRegions(regions.filter(r => r !== value));
                                        }
                                      }}
                                      className="w-4 h-4 rounded border-gray-300"
                                    />
                                    <span className="text-sm">{label}</span>
                                  </label>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                          {emptyFields.has("regions") && (
                            <p className="text-xs text-red-500">지역을 선택해주세요.</p>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <Label htmlFor="bio" className="text-sm font-medium">자기소개</Label>
                        <Textarea
                          id="bio"
                          placeholder="당신의 멘토링 스타일과 경험을 소개해주세요."
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          rows={4}
                          className="resize-none"
                        />
                      </div>

                      <div className="pt-2 space-y-2">
                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                        >
                          {createProfileMutation.isPending || updateProfileMutation.isPending ? (
                            <><Loader2 className="h-4 w-4 animate-spin mr-2" />처리 중...</>
                          ) : (
                            profile ? "프로필 저장" : "멘토로 등록하기"
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>

                {/* 상담 유형 카드 */}
                {profile && (
                  <Card className="mt-5 shadow-sm border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">상담 유형</CardTitle>
                      <CardDescription>제공할 수 있는 상담 유형을 선택하세요.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {(["career_counseling", "university_tour", "resume_consulting", "academic_management"] as const).map((type) => {
                          const isSelected = consultationTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleConsultationType(type)}
                              className={`p-3 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                                isSelected
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected ? (
                                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <div className="h-4 w-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                                )}
                                {CONSULTATION_TYPE_LABELS[type]}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 갤러리 카드 */}
                {profile && gallery && gallery.length > 0 && (
                  <Card className="mt-5 shadow-sm border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">갤러리</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-3">
                        {gallery.map((image: any) => (
                          <div key={image.id} className="relative group rounded-xl overflow-hidden">
                            <img
                              src={image.imageUrl}
                              alt={image.caption || "Gallery"}
                              className="w-full h-40 object-cover"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            <button
                              onClick={() => deleteGalleryMutation.mutate({ imageId: image.id })}
                              className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-50"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                            {image.caption && (
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                                <p className="text-white text-xs truncate">{image.caption}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 갤러리 이미지 추가 카드 */}
                {profile && (
                  <Card className="mt-5 shadow-sm border-0 bg-white">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg">갤러리 이미지 추가</CardTitle>
                      <CardDescription>멘토링 활동이나 캠퍼스 사진을 공유해보세요.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                          dragActive
                            ? "border-green-400 bg-green-50"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        <Upload className={`h-8 w-8 mx-auto mb-2 ${dragActive ? "text-green-500" : "text-gray-400"}`} />
                        <p className="text-sm text-gray-600 font-medium">이미지를 드래그하거나 클릭하여 업로드</p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF 지원</p>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleChange}
                          className="hidden"
                          id="file-input"
                        />
                        <label htmlFor="file-input" className="cursor-pointer" />
                      </div>

                      {uploadedImages.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {uploadedImages.map((image, idx) => (
                            <div key={idx} className="flex gap-3 items-center bg-gray-50 rounded-xl p-3">
                              <img
                                src={image.url}
                                alt="preview"
                                className="h-14 w-14 object-cover rounded-lg flex-shrink-0"
                              />
                              <Input
                                placeholder="이미지 설명 (선택사항)"
                                value={newCaption}
                                onChange={(e) => setNewCaption(e.target.value)}
                                className="flex-1 bg-white"
                              />
                              <button
                                type="button"
                                onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                                className="text-gray-400 hover:text-red-500 transition-colors"
                              >
                                <X className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                          <Button
                            type="button"
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            {isUploading ? (
                              <><Loader2 className="h-4 w-4 animate-spin mr-2" />업로드 중...</>
                            ) : (
                              "이미지 업로드"
                            )}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
