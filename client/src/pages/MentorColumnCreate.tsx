
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
import { ArrowLeft, Save, Eye } from "lucide-react";
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
  const [category, setCategory] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [isPreview, setIsPreview] = useState(false);
  const [isMentor, setIsMentor] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
    description: "멘토 칼럼을 작성해보세요",
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
    if (!category) {
      toast.error("카테고리를 선택해주세요");
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
      category,
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
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">칼럼 작성</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              당신의 경험과 조언을 담은 칼럼을 작성해보세요
            </p>
          </div>

          {isPreview ? (
            /* 미리보기 모드 */
            <Card>
              <CardHeader className="pb-3 sm:pb-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 text-xs">
                      {category}
                    </Badge>
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
            <Card>
              <CardContent className="pt-6 space-y-4 sm:space-y-6">
                {/* 제목 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    제목 <span className="text-red-500">*</span>
                  </label>
                  <Input
                    placeholder="칼럼 제목을 입력해주세요"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={255}
                    className="text-sm"
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
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="카테고리를 선택해주세요" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLUMN_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 커버 이미지 URL */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    커버 이미지 URL (선택)
                  </label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={coverImageUrl}
                    onChange={(e) => setCoverImageUrl(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* 요약 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium mb-2">
                    요약 (선택)
                  </label>
                  <Textarea
                    placeholder="칼럼의 요약을 입력해주세요 (입력하지 않으면 내용의 첫 200자가 사용됩니다)"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    maxLength={500}
                    className="min-h-20 text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {excerpt.length}/500
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
