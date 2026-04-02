import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";

export default function QnACreate() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    setPageMeta({ title: "Q&A 작성", description: "Q&A 질문 작성 페이지" });
  }, []);

  // 질문 작성 뮤테이션
  const createQuestionMutation = trpc.qna.createQuestion.useMutation({
    onSuccess: (data: any) => {
      alert("질문이 작성되었습니다");
      setLocation(`/qna/${data.questionId}`);
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요");
      return;
    }

    if (!content.trim()) {
      alert("내용을 입력해주세요");
      return;
    }

    await createQuestionMutation.mutateAsync({
      title,
      content,
      category,
      isAnonymous,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
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
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation('/qna')}
          className="mb-4 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          돌아가기
        </Button>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">질문 작성</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              멘토들에게 도움이 될 만한 질문을 작성해주세요
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="text-sm font-semibold mb-2 block">
                제목 *
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="질문의 제목을 입력해주세요"
                className="text-xs sm:text-sm h-9 sm:h-10"
              />
            </div>

            {/* 카테고리 */}
            <div>
              <label htmlFor="category" className="text-sm font-semibold mb-2 block">
                카테고리
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary h-9 sm:h-10"
              >
                <option value="">카테고리 선택</option>
                <option value="career">진로</option>
                <option value="academics">학업</option>
                <option value="university">대학</option>
                <option value="other">기타</option>
              </select>
            </div>

            {/* 내용 */}
            <div>
              <label htmlFor="content" className="text-sm font-semibold mb-2 block">
                내용 *
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="질문의 내용을 자세히 작성해주세요"
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-40 sm:min-h-48 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {content.length} / 2000자
              </p>
            </div>

            {/* 익명 옵션 */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
              />
              <label htmlFor="anonymous" className="text-xs sm:text-sm text-muted-foreground">
                익명으로 질문하기
              </label>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setLocation('/qna')}
                variant="outline"
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createQuestionMutation.isPending}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                {createQuestionMutation.isPending ? "작성 중..." : "질문 작성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
