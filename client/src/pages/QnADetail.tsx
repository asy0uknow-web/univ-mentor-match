import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, MessageCircle, User } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function QnADetail() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [replyContent, setReplyContent] = useState("");
  const [expandedAnswerId, setExpandedAnswerId] = useState<number | null>(null);

  // URL에서 questionId 추출
  const params = new URLSearchParams(window.location.search);
  const questionId = parseInt(params.get('id') || '0');

  useEffect(() => {
    setPageMeta({ title: "Q&A 상세", description: "Q&A 상세 페이지" });
  }, []);

  // 질문 상세 조회
  const { data: question, isLoading } = trpc.qna.getQuestionById.useQuery(
    { questionId },
    { enabled: questionId > 0 }
  );

  // 답변 작성 뮤테이션
  const createAnswerMutation = trpc.qnaAnswer.create.useMutation({
    onSuccess: () => {
      alert("답변이 작성되었습니다");
      setReplyContent("");
      // 페이지 새로고침
      window.location.reload();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  const handleCreateAnswer = async () => {
    if (!replyContent.trim()) {
      alert("답변 내용을 입력해주세요");
      return;
    }

    await createAnswerMutation.mutateAsync({
      questionId,
      content: replyContent,
    });
  };

  if (!questionId || isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </PageLayout>
    );
  }

  if (!question) {
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
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">질문을 찾을 수 없습니다</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
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

        <div className="max-w-3xl space-y-4 sm:space-y-6">
          {/* 질문 */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <CardTitle className="text-xl sm:text-2xl">{question.title}</CardTitle>
                {question.category && (
                  <Badge variant="secondary" className="text-xs flex-shrink-0">
                    {question.category}
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{question.isAnonymous ? "익명" : question.author?.name || "사용자"}</span>
                <span>·</span>
                <span>{format(new Date(question.createdAt), "MMM dd HH:mm", { locale: ko })}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-xs sm:text-sm whitespace-pre-wrap">{question.content}</p>
            </CardContent>
          </Card>

          {/* 답변 목록 */}
          {question.answers && question.answers.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                답변 {question.answers.length}개
              </h2>
              {question.answers.map((answer: any) => (
                <Card key={answer.id}>
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {answer.mentorProfile && (
                            <Badge className="text-xs bg-blue-500">멘토</Badge>
                          )}
                          <span className="text-xs sm:text-sm font-semibold">
                            {answer.author?.name || "사용자"}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(answer.createdAt), "MMM dd HH:mm", { locale: ko })}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{answer.content}</p>

                    {/* 답글 목록 */}
                    {answer.replies && answer.replies.length > 0 && (
                      <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-muted space-y-2">
                        {answer.replies.map((reply: any) => (
                          <div key={reply.id} className="text-xs">
                            <p className="font-semibold text-muted-foreground mb-1">
                              {reply.author?.name || "사용자"}
                            </p>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-6 sm:py-8 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">아직 답변이 없습니다</p>
              </CardContent>
            </Card>
          )}

          {/* 답변 작성 */}
          {isAuthenticated && user?.userType === "university_student" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base sm:text-lg">답변 작성</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="도움이 될 만한 답변을 작성해주세요"
                  className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-24 sm:min-h-32 resize-none"
                />
                <Button
                  onClick={handleCreateAnswer}
                  disabled={createAnswerMutation.isPending}
                  className="w-full text-xs sm:text-sm h-9 sm:h-10"
                >
                  {createAnswerMutation.isPending ? "작성 중..." : "답변 작성"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
