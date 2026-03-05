import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, CheckCircle, AlertCircle, Clock, Upload, X, Loader2, ChevronDown, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function MentorProfile() {

  useEffect(() => {
    setPageMeta(PAGE_META.profile);
  }, []);
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState<"1" | "2" | "3" | "4" | "graduate">("1");
  const [bio, setBio] = useState("");

  const [field, setField] = useState<"engineering" | "natural_science" | "business" | "humanities" | "education" | "liberal_arts" | "medicine" | undefined>();
  const [region, setRegion] = useState<"seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju" | undefined>();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; caption: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");
  const [emptyFields, setEmptyFields] = useState<Set<string>>(new Set());

  const { data: profile, isLoading } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: verification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
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
    },
    onError: (error) => {
      toast.error(error.message || "업로드 실패");
    },
  });

  const deleteGalleryMutation = trpc.gallery.deleteImage.useMutation({
    onSuccess: () => {
      toast.success("이미지가 삭제되었습니다");
    },
  });

  const createProfileMutation = trpc.mentor.createProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토로 등록되었습니다!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`멘토 등록 실패: ${error.message}`);
    },
  });

  const updateProfileMutation = trpc.mentor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다!");
    },
    onError: (error) => {
      toast.error(`프로필 업데이트 실패: ${error.message}`);
    },
  });

  const reactivateProfileMutation = trpc.mentor.reactivateProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 다시 활성화되었습니다!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`멘토 재등록 실패: ${error.message}`);
    },
  });

  const deactivateProfileMutation = trpc.mentor.deactivateProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 활동이 중지되었습니다.");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`멘토 활동 중지 실패: ${error.message}`);
    },
  });

  useEffect(() => {
    if (profile) {
      setUniversity(profile.university);
      setMajor(profile.major);
      setGrade(profile.grade);
      setBio(profile.bio || "");
      setField(profile.field || undefined);
      setRegion(profile.region || undefined);
    }
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>멘토 프로필을 관리하려면 로그인해주세요.</CardDescription>
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

    if (!field) empty.add("field");
    if (!region) empty.add("region");

    if (empty.size > 0) {
      setEmptyFields(empty);
      const firstEmptyField = Array.from(empty)[0];
      const element = document.getElementById(firstEmptyField);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.focus();
      }
      return;
    }
    setEmptyFields(new Set());

    if (profile) {
      createProfileMutation.mutate({
        university,
        major,
        grade,
        bio,
        hourlyRate: "0",
        field,
        region,
      });
    } else {
      updateProfileMutation.mutate({
        university,
        major,
        grade,
        bio,
        hourlyRate: "0",
        field,
        region,
      });
    }
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            {profile ? "멘토 프로필 수정" : "멘토로 등록하기"}
          </h1>

          {isLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : (
            <>
              {profile && !profile.isActive && (
                <Card className="mb-6 border-red-200 bg-red-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>멘토 상태</span>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-normal text-red-700">비활성화됨</span>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-red-900">
                        멘토 프로필이 비활성화 상태입니다. 아래 버튼으로 멘토 활동을 다시 시작할 수 있습니다.
                      </p>
                  <Button 
                    size="sm" 
                    className="w-full"
                    onClick={() => {
                      if (confirm("정말로 멘토 활동을 다시 시작하시겠습니까?")) {
                        reactivateProfileMutation.mutate();
                      }
                    }}
                    disabled={reactivateProfileMutation.isPending}
                  >
                    {reactivateProfileMutation.isPending ? "단추 중..." : "멘토 다시 등록하기"}
                  </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between text-base">
                      <span>인증 상태</span>
                      {verification && (
                        <div className="flex items-center gap-2">
                          {verification.status === "approved" && (
                            <>
                              <CheckCircle className="h-5 w-5 text-green-500" />
                              <span className="text-sm font-normal text-green-700">인증됨</span>
                            </>
                          )}
                          {verification.status === "pending" && (
                            <>
                              <Clock className="h-5 w-5 text-yellow-500" />
                              <span className="text-sm font-normal text-yellow-700">검토 중</span>
                            </>
                          )}
                          {verification.status === "rejected" && (
                            <>
                              <AlertCircle className="h-5 w-5 text-red-500" />
                              <span className="text-sm font-normal text-red-700">거부됨</span>
                            </>
                          )}
                        </div>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!verification ? (
                      <div className="space-y-3">
                        <p className="text-sm text-blue-900">
                          멘토로 활동하기 위해 학과 재학 인증이 필요합니다.
                        </p>
                        <Link href="/verify-mentor">
                          <Button size="sm" className="w-full">
                            인증하기
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-blue-900">당신의 멘토 프로필이 인증되었습니다.</p>
                        <Link href="/verify-mentor">
                          <Button size="sm" variant="outline" className="w-full">
                            인증 상태 확인
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {!profile && (
                <Card className="mb-6 border-amber-200 bg-amber-50">
                  <CardHeader>
                    <CardTitle className="text-base">멘토 등록 안내</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-amber-900">
                      아래 정보를 입력하고 "멘토로 등록하기" 버튼을 클릭하면 멘토로 등록됩니다. 등록 후 학생증 인증을 완료해야 멘토로 활동할 수 있습니다.
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                  <CardDescription>
                    멘토로 활동하기 위한 정보를 입력해주세요. *표시된 항목은 필수 항목입니다.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="university" className="text-sm font-medium">
                          대학교 *
                        </Label>
                        <Input
                          id="university"
                          placeholder="예: 서울대학교"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          className={emptyFields.has("university") ? "border-red-500" : ""}
                        />
                      </div>
                      <div>
                        <Label htmlFor="major" className="text-sm font-medium">
                          전공 *
                        </Label>
                        <Input
                          id="major"
                          placeholder="예: 컴퓨터공학"
                          value={major}
                          onChange={(e) => setMajor(e.target.value)}
                          className={emptyFields.has("major") ? "border-red-500" : ""}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="grade" className="text-sm font-medium">
                          학년
                        </Label>
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

                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="field" className="text-sm font-medium">
                          분야 *
                        </Label>
                        <Select value={field || ""} onValueChange={(value: any) => setField(value || undefined)}>
                          <SelectTrigger id="field">
                            <SelectValue placeholder="분야 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="engineering">공학</SelectItem>
                            <SelectItem value="natural_science">자연과학</SelectItem>
                            <SelectItem value="business">경영/경제</SelectItem>
                            <SelectItem value="humanities">인문학</SelectItem>
                            <SelectItem value="education">교육</SelectItem>
                            <SelectItem value="liberal_arts">교양</SelectItem>
                            <SelectItem value="medicine">의학</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="region" className="text-sm font-medium">
                          지역 *
                        </Label>
                        <Select value={region || ""} onValueChange={(value: any) => setRegion(value || undefined)}>
                          <SelectTrigger id="region">
                            <SelectValue placeholder="지역 선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="seoul">서울</SelectItem>
                            <SelectItem value="gyeonggi">경기</SelectItem>
                            <SelectItem value="incheon">인천</SelectItem>
                            <SelectItem value="gangwon">강원</SelectItem>
                            <SelectItem value="chungcheong">충청</SelectItem>
                            <SelectItem value="jeolla">전라</SelectItem>
                            <SelectItem value="gyeongsang">경상</SelectItem>
                            <SelectItem value="jeju">제주</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="bio" className="text-sm font-medium">
                        자기소개
                      </Label>
                      <Textarea
                        id="bio"
                        placeholder="당신의 멘토링 스타일과 경험을 소개해주세요."
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                      />
                    </div>

                    <div className="space-y-2">
                      {!profile || profile.isActive ? (
                        <>
                          <Button 
                            type="submit" 
                            className="w-full"
                            disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                          >
                            {createProfileMutation.isPending || updateProfileMutation.isPending 
                              ? "처리 중..." 
                              : profile ? "프로필 수정" : "멘토로 등록하기"}
                          </Button>
                          {profile && profile.isActive && (
                            <Button 
                              type="button"
                              variant="destructive"
                              className="w-full"
                              onClick={() => {
                                if (confirm("정말로 멘토 활동을 중지하시겠습니까? 나중에 다시 시작할 수 있습니다.")) {
                                  deactivateProfileMutation.mutate();
                                }
                              }}
                              disabled={deactivateProfileMutation.isPending}
                            >
                              {deactivateProfileMutation.isPending ? "처리 중..." : "멘토 활동 중지"}
                            </Button>
                          )}
                        </>
                      ) : (
                        <Button 
                          type="button"
                          className="w-full"
                          onClick={() => {
                            if (confirm("정말로 멘토 활동을 재개하시겠습니까?")) {
                              reactivateProfileMutation.mutate();
                            }
                          }}
                          disabled={reactivateProfileMutation.isPending}
                        >
                          {reactivateProfileMutation.isPending ? "처리 중..." : "멘토 활동 재개"}
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              {profile && gallery && gallery.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>갤러리</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      {gallery.map((image: any) => (
                        <div key={image.id} className="relative group">
                          <img 
                            src={image.imageUrl} 
                            alt={image.caption || "Gallery"} 
                            className="w-full h-40 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => deleteGalleryMutation.mutate({ imageId: image.id })}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {profile && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle>갤러리 이미지 추가</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                        dragActive ? "border-primary bg-primary/10" : "border-gray-300"
                      }`}
                    >
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        이미지를 드래그하거나 클릭하여 업로드
                      </p>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleChange}
                        className="hidden"
                        id="file-input"
                      />
                      <label htmlFor="file-input" className="cursor-pointer">
                        <span className="text-xs text-gray-500">JPG, PNG, GIF 등</span>
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="mt-4 space-y-3">
                        {uploadedImages.map((image, idx) => (
                          <div key={idx} className="flex gap-3 items-center">
                            <img 
                              src={image.url} 
                              alt="preview" 
                              className="h-16 w-16 object-cover rounded"
                            />
                            <Input
                              placeholder="이미지 설명 (선택사항)"
                              value={newCaption}
                              onChange={(e) => setNewCaption(e.target.value)}
                              className="flex-1"
                            />
                            <button
                              onClick={() => setUploadedImages(uploadedImages.filter((_, i) => i !== idx))}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        ))}
                        <Button 
                          onClick={handleUpload}
                          disabled={isUploading}
                          className="w-full"
                        >
                          {isUploading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          이미지 업로드
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
    </PageLayout>
  );
}
