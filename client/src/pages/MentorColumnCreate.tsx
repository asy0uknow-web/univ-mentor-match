
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, Eye, Sparkles, BookOpen } from "lucide-react";
import { toast } from "sonner";

const COLUMN_CATEGORIES = [
  "전공 선택",
  "대학 생활",
  "학습 방법",
  "진로 준비",
  "시험 준비",
  "동아리 활동",
  "교환학생",
  "대학원 진학",
  "기타",
];

export default function MentorColumnCreate() {
  // 모든 훅을 조건부 return 이전에 선언 (React 훅 규칙)
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isPreview, setIsPreview] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // 멘토 프로필 조회
  const { data: profile } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 멘토 여부 확인
  useEffect(() => {
    if (isAuthenticated) {
      setIsMentor(!!profile);
      setIsLoading(false);
    }
  }, [profile, isAuthenticated]);

  const uploadImageMutation = trpc.mentorColumns.uploadCoverImage.useMutation({
    onSuccess: (data: any) => {
      setCoverImageUrl(data.imageUrl);
      toast.success("이미지가 업로드되었습니다");
    },
    onError: (error: any) => {
      toast.error(`업로드 실패: ${error.message}`);
    },
  });

  const createMutation = trpc.mentorColumns.create.useMutation({
    onSuccess: (data: any) => {
      toast.success("칼럼이 작성되었습니다");
      setLocation(`/columns/${data.id}`);
    },
    onError: (error: any) => {
      toast.error(`오류: ${error.message}`);
    },
  });

  setPageMeta({
    title: "칼럼 작성 | 유니브매치",
    description: "칼럼 스튜디오을 작성해보세요",
  });

  // 조건부 렌더링 (return 제거)
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/login')}
                className="w-full text-xs sm:text-sm h-9 sm:h-10"
              >
                로그인
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  // 로딩 중
  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </PageLayout>
    );
  }

  // 멘토 역할 확인
  if (!isMentor) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <Button
            variant="ghost"
            onClick={() => setLocation("/columns")}
            className="mb-4 text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            돌아가기
          </Button>
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                멘토만 칼럼을 작성할 수 있습니다
              </p>
              <Button onClick={() => setLocation("/columns")}>칼럼 목록으로 이동</Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('이미지 파일만 업로드 가능합니다');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('이미지 크기는 5MB 이하여야 합니다');
      return;
    }

    setIsUploadingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      uploadImageMutation.mutate({ imageData: base64 });
      setIsUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleImageUpload(files[0]);
    }
  };

  const handleSubmit = (submitStatus: "draft" | "published" = status) => {
    // 유효성 검사
    if (!title.trim()) {
      toast.error("제목을 입력해주세요");
      return;
    }
    if (!content.trim()) {
      toast.error("내용을 입력해주세요");
      return;
    }
    if (categories.length === 0) {
      toast.error("카테고리를 적어도 하나 이상 선택해주세요");
      return;
    }
    if (title.length < 5) {
      toast.error("제목은 최소 5자 이상이어야 합니다");
      return;
    }
    if (content.length < 50) {
      toast.error("내용은 최소 50자 이상이어야 합니다");
      return;
    }

    createMutation.mutate({
      title,
      content,
      category: categories.join(", "),
      excerpt: excerpt || content.substring(0, 200),
      coverImageUrl: coverImageUrl || undefined,
      status: submitStatus,
    });
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/columns")}
          className="mb-4 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          돌아가기
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-950/50 dark:to-blue-950/50 p-4 sm:p-6 rounded-lg border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="h-6 w-6 text-indigo-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">칼럼 작성</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              당신의 경험과 조언을 담은 칼럼을 작성해보세요
            </p>
          </div>

          {isPreview ? (
            /* 미리보기 모드 */
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-2">
                      {categories.map((cat) => (
                        <Badge key={cat} variant="secondary" className="text-xs">
                          {cat}
                        </Badge>
                      ))}
                    </div>
                    <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 sm:space-y-6">
                <div className="prose prose-sm sm:prose max-w-none whitespace-pre-wrap text-sm sm:text-base">
                  {content}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreview(false)}
                    className="flex-1"
                  >
                    편집으로 돌아가기
                  </Button>
                  <Button 
                    onClick={() => {
                      setStatus("published");
                      handleSubmit();
                    }} 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "발행 중..." : "칼럼 발행"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            /* 편집 모드 */
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6 space-y-4 sm:space-y-6">
                {/* 제목 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-indigo-600" />
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="칼럼 제목을 입력해주세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={255}
                    className="text-sm hover:border-indigo-300 focus:border-indigo-500 transition-colors"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {title.length}/255
                  </p>
                </div>

                {/* 카테고리 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    카테고리 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {COLUMN_CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => {
                          if (categories.includes(cat)) {
                            setCategories(categories.filter(c => c !== cat));
                          } else {
                            setCategories([...categories, cat]);
                          }
                        }}
                        className={`px-3 py-2 rounded-full text-xs sm:text-sm font-medium transition-all ${
                          categories.includes(cat)
                            ? "bg-indigo-600 text-white border border-indigo-600"
                            : "bg-background border border-input text-foreground hover:border-indigo-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {categories.length > 0 ? `${categories.length}개 선택됨` : "카테고리를 선택해주세요"}
                  </p>
                </div>

                {/* 커버 이미지 업로드 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    커버 이미지
                  </label>
                  
                  {/* 드래그 앤드 드롭 영역 */}
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-300 hover:scale-102 ${
                      dragActive
                        ? 'border-indigo-500 bg-indigo-50 scale-105'
                        : 'border-border bg-background 900 hover:border-indigo-400'
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      id="cover-image-input"
                      disabled={isUploadingImage}
                    />
                    <label htmlFor="cover-image-input" className="cursor-pointer block">
                      <div className="text-xs sm:text-sm text-muted-foreground">
                        {isUploadingImage ? (
                          <>
                            <p className="font-medium">업로드 중...</p>
                          </>
                        ) : (
                          <>
                            <p className="font-medium">이미지를 가져오거나</p>
                            <p className="text-xs mt-1">클릭하여 업로드</p>
                            <p className="text-xs mt-2 text-muted-foreground">(JPEG, PNG, GIF, WebP - 최대 5MB)</p>
                          </>
                        )}
                      </div>
                    </label>
                  </div>
                  
                  {/* 업로드된 이미지 미리보기 */}
                  {coverImageUrl && (
                    <div className="mt-4">
                      <p className="text-xs sm:text-sm font-medium mb-2">미리보기</p>
                      <div className="relative w-full h-40 bg-muted 800 rounded-lg overflow-hidden">
                        <img
                          src={coverImageUrl}
                          alt="Cover preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setCoverImageUrl('')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* 요약 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    요약
                  </label>
                  <Textarea
                    placeholder="이 칼럼에 대해 간단히 설명해주세요!"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    maxLength={200}
                    className="min-h-20 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {excerpt.length}/200
                  </p>
                </div>

                {/* 내용 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    내용 <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    placeholder="칼럼 내용을 입력해주세요"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="min-h-64 text-sm font-mono"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {content.length} 자 (최소 50자)
                  </p>
                </div>

                {/* 상태 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    상태
                  </label>
                  <Select value={status} onValueChange={(v) => setStatus(v as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">임시 저장</SelectItem>
                      <SelectItem value="published">발행</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setLocation("/columns")}
                    className="flex-1"
                  >
                    취소
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setIsPreview(true)}
                    className="flex-1 gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    미리보기
                  </Button>
                  <Button
                    onClick={() => {
                      handleSubmit("published");
                    }}
                    disabled={createMutation.isPending}
                    className="flex-1 gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {createMutation.isPending ? "발행 중..." : "발행"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
