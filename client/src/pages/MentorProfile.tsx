import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, CheckCircle, AlertCircle, Clock, Upload, X, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function MentorProfile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState<"1" | "2" | "3" | "4" | "graduate">("1");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");
  const [field, setField] = useState<"engineering" | "natural_science" | "business" | "humanities" | "education" | "liberal_arts" | "medicine" | undefined>();
  const [region, setRegion] = useState<"seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju" | undefined>();
  const [dragActive, setDragActive] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; caption: string }>>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [newCaption, setNewCaption] = useState("");

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
      toast.success("멘토 프로필이 생성되었습니다!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`프로필 생성 실패: ${error.message}`);
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

  useEffect(() => {
    if (profile) {
      setUniversity(profile.university);
      setMajor(profile.major);
      setGrade(profile.grade);
      setBio(profile.bio || "");
      setHourlyRate(profile.hourlyRate.toString());
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

    if (!university || !major || !hourlyRate) {
      toast.error("모든 필수 필드를 입력해주세요.");
      return;
    }

    if (profile) {
      updateProfileMutation.mutate({
        university,
        major,
        grade,
        bio,
        hourlyRate,
        field,
        region,
      });
    } else {
      createProfileMutation.mutate({
        university,
        major,
        grade,
        bio,
        hourlyRate,
        field,
        region,
      });
    }
  };

  return (
    <div className="min-h-screen">
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

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            {profile ? "멘토 프로필 수정" : "멘토 프로필 등록"}
          </h1>

          {isLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : (
            <>
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
                        <p className="text-sm text-blue-900">
                          {verification.status === "approved" && "당신의 멘토 프로필이 인증되었습니다."}
                          {verification.status === "pending" && "관리자가 당신의 인증 요청을 검토 중입니다."}
                          {verification.status === "rejected" && "인증이 거부되었습니다. 다시 신청해주세요."}
                        </p>
                        <Link href="/verify-mentor">
                          <Button variant="outline" size="sm" className="w-full">
                            인증 상태 확인
                          </Button>
                        </Link>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>프로필 정보</CardTitle>
                  <CardDescription>
                    멘토로 활동하기 위한 정보를 입력해주세요.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label htmlFor="university">대학명 *</Label>
                      <Input
                        id="university"
                        value={university}
                        onChange={(e) => setUniversity(e.target.value)}
                        placeholder="예: 서울대학교"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="major">전공 *</Label>
                      <Input
                        id="major"
                        value={major}
                        onChange={(e) => setMajor(e.target.value)}
                        placeholder="예: 컴퓨터공학과"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="grade">학년 *</Label>
                      <Select value={grade} onValueChange={(value: any) => setGrade(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="학년 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1학년</SelectItem>
                          <SelectItem value="2">2학년</SelectItem>
                          <SelectItem value="3">3학년</SelectItem>
                          <SelectItem value="4">4학년</SelectItem>
                          <SelectItem value="graduate">대학원생</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="field">분야 *</Label>
                      <Select value={field || ""} onValueChange={(value) => setField(value as any || undefined)}>
                        <SelectTrigger>
                          <SelectValue placeholder="분야 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="engineering">이공계</SelectItem>
                          <SelectItem value="natural">자연계</SelectItem>
                          <SelectItem value="business">상경계</SelectItem>
                          <SelectItem value="humanities">어문계</SelectItem>
                          <SelectItem value="education">사범계</SelectItem>
                          <SelectItem value="liberal">문과계</SelectItem>
                          <SelectItem value="medicine">의학계</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="region">지역 *</Label>
                      <Select value={region || ""} onValueChange={(value) => setRegion(value as any || undefined)}>
                        <SelectTrigger>
                          <SelectValue placeholder="지역 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="seoul">서울</SelectItem>
                          <SelectItem value="gyeonggi">경기</SelectItem>
                          <SelectItem value="incheon">인천</SelectItem>
                          <SelectItem value="gangwon">강원</SelectItem>
                          <SelectItem value="chungcheong">충청</SelectItem>
                          <SelectItem value="jeolla">전라</SelectItem>
                          <SelectItem value="gyeongsan">경상</SelectItem>
                          <SelectItem value="jeju">제주</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="hourlyRate">시간당 상담료 (원) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="예: 30000"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="bio">자기소개</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="자신의 경험과 상담 가능한 내용을 소개해주세요."
                        rows={6}
                      />
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                    >
                      {createProfileMutation.isPending || updateProfileMutation.isPending
                        ? "저장 중..."
                        : profile
                        ? "프로필 업데이트"
                        : "멘토 등록하기"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>대학생활 갤러리</CardTitle>
                  <CardDescription>
                    당신의 대학생활을 보여주는 사진을 업로드해보세요. 멘티들이 당신을 더 잘 알 수 있습니다.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                      dragActive
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="font-semibold mb-2">이미지를 드래그하거나 클릭하여 업로드</p>
                    <p className="text-sm text-muted-foreground mb-4">JPG, PNG 형식 지원</p>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                      id="gallery-upload"
                    />
                    <label htmlFor="gallery-upload">
                      <Button asChild variant="outline">
                        <span>파일 선택</span>
                      </Button>
                    </label>
                  </div>

                  {uploadedImages.length > 0 && (
                    <div className="space-y-4">
                      <div className="relative">
                        <img
                          src={uploadedImages[0].url}
                          alt="Preview"
                          className="w-full h-64 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => setUploadedImages([])}
                          className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full hover:bg-destructive/90"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div>
                        <Label htmlFor="caption">사진 설명</Label>
                        <Textarea
                          id="caption"
                          placeholder="이 사진에 대한 설명을 입력해주세요 (선택사항)"
                          value={newCaption}
                          onChange={(e) => setNewCaption(e.target.value)}
                          className="resize-none"
                          rows={3}
                        />
                      </div>

                      <Button
                        onClick={handleUpload}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            업로드 중...
                          </>
                        ) : (
                          "사진 업로드"
                        )}
                      </Button>
                    </div>
                  )}

                  {gallery && gallery.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-4">업로드된 사진</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {gallery.map((image) => (
                          <div key={image.id} className="relative group">
                            <img
                              src={image.imageUrl}
                              alt={image.caption || "Gallery image"}
                              className="w-full h-40 object-cover rounded-lg"
                            />
                            {image.caption && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {image.caption}
                              </p>
                            )}
                            <button
                              onClick={() =>
                                deleteGalleryMutation.mutate({ imageId: image.id })
                              }
                              className="absolute top-2 right-2 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
