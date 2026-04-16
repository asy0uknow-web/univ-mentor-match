import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { ArrowLeft, Plus, MessageCircle, Clock, CheckCircle2, AlertCircle, Award, ThumbsUp } from "lucide-react";
import { useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "awaiting_answer":
      return { label: "답변 대기 중", className: "bg-yellow-100 text-yellow-800" };
    case "answered":
      return { label: "답변 완료", className: "bg-blue-100 text-blue-800" };
    case "solved":
      return { label: "해결됨", className: "bg-green-100 text-green-800" };
    default:
      return { label: status, className: "bg-slate-100 dark:bg-slate-800 text-gray-800" };
  }
};

// 멘티 전용 내 질문 대시보드
function MenteeDashboard() {
  const [, setLocation] = useLocation();
  const { data: myQuestions, isLoading } = trpc.qna.getMyQuestions.useQuery();

  const stats = {
    total: myQuestions?.length || 0,
    awaiting: myQuestions?.filter((q: any) => q.status === "awaiting_answer").length || 0,
    answered: myQuestions?.filter((q: any) => q.status === "answered").length || 0,
    solved: myQuestions?.filter((q: any) => q.status === "solved").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">전체 질문</p>
          </CardContent>
        </Card>
        <Card className="text-center border-yellow-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.awaiting}</p>
            <p className="text-xs text-muted-foreground mt-1">답변 대기</p>
          </CardContent>
        </Card>
        <Card className="text-center border-blue-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.answered}</p>
            <p className="text-xs text-muted-foreground mt-1">답변 완료</p>
          </CardContent>
        </Card>
        <Card className="text-center border-green-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.solved}</p>
            <p className="text-xs text-muted-foreground mt-1">해결됨</p>
          </CardContent>
        </Card>
      </div>

      {/* 질문 목록 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">내 질문 목록</h2>
          <Button
            onClick={() => setLocation('/qna/new')}
            size="sm"
            className="text-xs h-8"
          >
            <Plus className="h-3 w-3 mr-1" />
            새 질문
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        ) : myQuestions && myQuestions.length > 0 ? (
          <div className="space-y-3">
            {myQuestions.map((question: any) => {
              const badge = getStatusBadge(question.status);
              return (
                <Card
                  key={question.id}
                  className="cursor-pointer hover:shadow-md dark:shadow-lg transition-shadow"
                  onClick={() => setLocation(`/qna/${question.id}`)}
                >
                  <CardContent className="py-3 sm:py-4 px-4 sm:px-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-xs flex-shrink-0 ${badge.className}`}>
                            {badge.label}
                          </Badge>
                          {question.category && (
                            <Badge variant="outline" className="text-xs flex-shrink-0">
                              {question.category}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium truncate">{question.title}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            답변 {question.answerCount || 0}개
                          </span>
                          <span>{format(new Date(question.createdAt), "M월 d일", { locale: ko })}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {question.status === "awaiting_answer" && (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        {question.status === "answered" && (
                          <MessageCircle className="h-4 w-4 text-blue-500" />
                        )}
                        {question.status === "solved" && (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">아직 작성한 질문이 없습니다</p>
              <Button
                onClick={() => setLocation('/qna/new')}
                size="sm"
                className="text-xs h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                첫 질문 작성하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

// 멘토 전용 내 답변 대시보드
function MentorDashboard() {
  const [, setLocation] = useLocation();
  const { data: myAnswers, isLoading } = trpc.qnaAnswer.getMyAnswers.useQuery();

  const stats = {
    total: myAnswers?.length || 0,
    accepted: myAnswers?.filter((a: any) => a.isAccepted).length || 0,
    totalLikes: myAnswers?.reduce((sum: number, a: any) => sum + (a.likeCount || 0), 0) || 0,
    activeQuestions: myAnswers?.filter((a: any) => a.question?.status !== "solved").length || 0,
  };

  return (
    <div className="space-y-6">
      {/* 통계 카드 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Card className="text-center">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground mt-1">전체 답변</p>
          </CardContent>
        </Card>
        <Card className="text-center border-green-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.accepted}</p>
            <p className="text-xs text-muted-foreground mt-1">채택된 답변</p>
          </CardContent>
        </Card>
        <Card className="text-center border-blue-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.totalLikes}</p>
            <p className="text-xs text-muted-foreground mt-1">총 좋아요</p>
          </CardContent>
        </Card>
        <Card className="text-center border-yellow-200">
          <CardContent className="pt-4 pb-3">
            <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.activeQuestions}</p>
            <p className="text-xs text-muted-foreground mt-1">진행 중 질문</p>
          </CardContent>
        </Card>
      </div>

      {/* 답변 목록 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">내 답변 목록</h2>
          <Button
            onClick={() => setLocation('/qna')}
            size="sm"
            variant="outline"
            className="text-xs h-8"
          >
            Q&A 목록 보기
          </Button>
        </div>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        ) : myAnswers && myAnswers.length > 0 ? (
          <div className="space-y-3">
            {myAnswers.map((answer: any) => {
              const questionBadge = answer.question ? getStatusBadge(answer.question.status) : null;
              return (
                <Card
                  key={answer.id}
                  className={`cursor-pointer hover:shadow-md dark:shadow-lg transition-shadow ${answer.isAccepted ? "ring-2 ring-green-300" : ""}`}
                  onClick={() => answer.question && setLocation(`/qna/${answer.question.id}`)}
                >
                  <CardContent className="py-3 sm:py-4 px-4 sm:px-5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* 질문 제목 */}
                        {answer.question && (
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {questionBadge && (
                              <Badge className={`text-xs flex-shrink-0 ${questionBadge.className}`}>
                                {questionBadge.label}
                              </Badge>
                            )}
                            {answer.isAccepted && (
                              <Badge className="text-xs flex-shrink-0 bg-green-100 text-green-800">
                                <Award className="h-3 w-3 mr-1" />
                                채택됨
                              </Badge>
                            )}
                          </div>
                        )}
                        <p className="text-xs text-muted-foreground mb-1 truncate">
                          Q: {answer.question?.title || "질문 없음"}
                        </p>
                        <p className="text-sm line-clamp-2 text-foreground">
                          {answer.content}
                        </p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            좋아요 {answer.likeCount || 0}
                          </span>
                          <span>{format(new Date(answer.createdAt), "M월 d일", { locale: ko })}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-10 text-center">
              <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">아직 작성한 답변이 없습니다</p>
              <Button
                onClick={() => setLocation('/qna')}
                size="sm"
                className="text-xs h-8"
              >
                Q&A 목록에서 답변하기
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function QnADashboard() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    setPageMeta({ title: "내 Q&A", description: "내 Q&A 활동 내역" });
  }, []);

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

  const isMentor = user?.role === "mentor";

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-3xl">
        <Button
          variant="ghost"
          onClick={() => setLocation('/qna')}
          className="mb-4 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          Q&A 목록으로
        </Button>

        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">
            {isMentor ? "내 답변 관리" : "내 질문 관리"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isMentor
              ? "내가 작성한 답변과 채택 현황을 확인하세요"
              : "내가 작성한 질문과 답변 현황을 확인하세요"}
          </p>
        </div>

        {isMentor ? <MentorDashboard /> : <MenteeDashboard />}
      </div>
    </PageLayout>
  );
}
