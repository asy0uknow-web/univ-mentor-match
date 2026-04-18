import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useLocation, useParams } from "wouter";
import { ArrowLeft, MessageCircle, User, MessageSquare, Star, Flag, CheckCircle2, Clock, AlertCircle, ThumbsUp, Award } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Dialog from "@radix-ui/react-dialog";
import { StatusBadge } from "@/components/StatusBadge";
import { ConsultationCTAButton } from "@/components/ConsultationCTAButton";

const mapStatusToStatusBadge = (status: string) => {
  switch (status) {
    case "awaiting_answer":
      return "pending";
    case "answered":
      return "accepted";
    case "solved":
      return "completed";
    default:
      return "new";
  }
};

export default function QnADetail() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [answerContent, setAnswerContent] = useState("");
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [reportTarget, setReportTarget] = useState<{ type: "question" | "answer" | "reply"; id: number } | null>(null);
  // 좋아요 상태 (answerId -> liked)
  const [likedAnswers, setLikedAnswers] = useState<Set<number>>(new Set());
  // 좋아요 수 (answerId -> count)
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  // 답글 작성 상태 (answerId -> content)
  const [replyContents, setReplyContents] = useState<Record<number, string>>({});
  // 답글 작성 중인 답변 ID
  const [expandedReplyAnswerId, setExpandedReplyAnswerId] = useState<number | null>(null);

  // URL에서 questionId 추출
  const params = useParams();
  const questionId = parseInt(params.id || '0');

  useEffect(() => {
    setPageMeta({ title: "Q&A 상세", description: "Q&A 상세 페이지" });
  }, []);

  // 질문 상세 조회
  const { data: question, isLoading, isError, error, refetch } = trpc.qna.getQuestionById.useQuery(
    { questionId },
    { enabled: questionId > 0, retry: 1 }
  );

  // 질문 데이터 로드 후 좋아요 수 초기화
  useEffect(() => {
    if (question?.answers) {
      const counts: Record<number, number> = {};
      question.answers.forEach((a: any) => {
        counts[a.id] = a.likeCount || 0;
      });
      setLikeCounts(counts);
    }
  }, [question]);

  // 사용자 좋아요 상태 조회
  const answerIds = question?.answers?.map((a: any) => a.id) || [];
  const { data: userLikesData } = trpc.qnaAnswer.getUserLikes.useQuery(
    { answerIds },
    { enabled: isAuthenticated && answerIds.length > 0 }
  );

  useEffect(() => {
    if (userLikesData?.likedAnswerIds) {
      setLikedAnswers(new Set(userLikesData.likedAnswerIds));
    }
  }, [userLikesData]);

  // 답변 작성 뮤테이션
  const createAnswerMutation = trpc.qnaAnswer.create.useMutation({
    onSuccess: () => {
      alert("답변이 작성되었습니다");
      setAnswerContent("");
      refetch();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 질문 상태 업데이트 뮤테이션
  const updateQuestionStatusMutation = trpc.qna.updateQuestionStatus.useMutation({
    onSuccess: () => {
      alert("질문 상태가 업데이트되었습니다");
      refetch();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 신고 뮤테이션
  const createReportMutation = trpc.qna.createReport.useMutation({
    onSuccess: () => {
      alert("신고가 접수되었습니다");
      setReportDialogOpen(false);
      setReportReason("");
      setReportDescription("");
      setReportTarget(null);
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 답변 채택 뮤테이션
  const acceptAnswerMutation = trpc.qnaAnswer.accept.useMutation({
    onSuccess: (data) => {
      alert(data.message);
      refetch();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 좋아요 토글 뮤테이션
  const toggleLikeMutation = trpc.qnaAnswer.toggleLike.useMutation({
    onSuccess: (data, variables) => {
      const answerId = variables.answerId;
      setLikedAnswers(prev => {
        const next = new Set(prev);
        if (data.liked) next.add(answerId);
        else next.delete(answerId);
        return next;
      });
      setLikeCounts(prev => ({ ...prev, [answerId]: data.likeCount }));
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  // 답글 작성 뮤테이션
  const createReplyMutation = trpc.qnaReply.create.useMutation({
    onSuccess: () => {
      alert("답글이 작성되었습니다");
      setReplyContents({});
      setExpandedReplyAnswerId(null);
      refetch();
    },
    onError: (error: any) => {
      alert("오류: " + error.message);
    },
  });

  const handleCreateAnswer = async () => {
    if (!answerContent.trim()) {
      alert("답변 내용을 입력해주세요");
      return;
    }

    await createAnswerMutation.mutateAsync({
      questionId,
      content: answerContent,
    });
  };

  const handleMarkAsSolved = async () => {
    if (confirm("이 질문을 해결됨으로 표시하시겠습니까?")) {
      await updateQuestionStatusMutation.mutateAsync({
        questionId,
        status: "solved",
      });
    }
  };

  const handleReport = async () => {
    if (!reportTarget || !reportReason) {
      alert("신고 사유를 선택해주세요");
      return;
    }

    await createReportMutation.mutateAsync({
      reportType: reportTarget.type,
      contentId: reportTarget.id,
      reason: reportReason,
      description: reportDescription,
    });
  };

  const handleAcceptAnswer = async (answerId: number) => {
    if (confirm("이 답변을 채택하시겠습니까? (채택은 1개만 가능합니다)")) {
      await acceptAnswerMutation.mutateAsync({ answerId });
    }
  };

  const handleToggleLike = async (answerId: number) => {
    if (!isAuthenticated) {
      alert("로그인 후 좋아요를 누를 수 있습니다");
      return;
    }
    await toggleLikeMutation.mutateAsync({ answerId });
  };

  const handleCreateReply = async (answerId: number) => {
    const content = replyContents[answerId]?.trim();
    if (!content) {
      alert("답글 내용을 입력해주세요");
      return;
    }
    await createReplyMutation.mutateAsync({
      answerId,
      content,
    });
  };

  if (!questionId) {
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
              <p className="text-xs sm:text-sm text-muted-foreground">잘못된 질문 ID입니다</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </PageLayout>
    );
  }

  if (isError) {
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
              <p className="text-xs sm:text-sm text-muted-foreground">오류가 발생했습니다</p>
              {error && <p className="text-xs text-red-500 mt-2">{error.message}</p>}
            </CardContent>
          </Card>
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

  const isQuestionAuthor = user?.id === question.authorId;

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
          {/* 질문 카드 */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <CardTitle className="text-xl sm:text-2xl">{question.title}</CardTitle>
                    <StatusBadge status={mapStatusToStatusBadge(question.status)} />
                  </div>
                </div>
                <Dialog.Root open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                  <Dialog.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReportTarget({ type: "question", id: question.id });
                      }}
                      className="text-xs h-8 flex-shrink-0"
                    >
                      <Flag className="h-3 w-3" />
                    </Button>
                  </Dialog.Trigger>
                  <Dialog.Content className="fixed left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%] bg-background border border-border rounded-lg shadow-lg p-4 sm:p-6 max-w-md w-full mx-4 z-50">
                    <Dialog.Title className="text-base sm:text-lg font-semibold mb-4">
                      신고하기
                    </Dialog.Title>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">
                          신고 사유 *
                        </label>
                        <select
                          value={reportReason}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="w-full px-3 py-2 text-xs sm:text-sm border rounded-md"
                        >
                          <option value="">선택해주세요</option>
                          <option value="부적절한_내용">부적절한 내용</option>
                          <option value="개인정보_노출">개인정보 노출</option>
                          <option value="광고_홍보">광고/홍보</option>
                          <option value="비방_욕설">비방/욕설</option>
                          <option value="기타">기타</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs sm:text-sm font-medium mb-2">
                          상세 설명 (선택)
                        </label>
                        <Textarea
                          value={reportDescription}
                          onChange={(e) => setReportDescription(e.target.value)}
                          placeholder="신고 사유를 상세히 설명해주세요"
                          className="text-xs sm:text-sm min-h-20"
                        />
                      </div>
                      <div className="flex gap-2 pt-4 border-t">
                        <Button
                          variant="outline"
                          onClick={() => setReportDialogOpen(false)}
                          className="text-xs sm:text-sm h-9 sm:h-10 flex-1"
                        >
                          취소
                        </Button>
                        <Button
                          onClick={handleReport}
                          disabled={createReportMutation.isPending || !reportReason}
                          className="text-xs sm:text-sm h-9 sm:h-10 flex-1 bg-red-500 hover:bg-red-600"
                        >
                          {createReportMutation.isPending ? "신고 중..." : "신고"}
                        </Button>
                      </div>
                    </div>
                  </Dialog.Content>
                </Dialog.Root>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>{question.isAnonymous ? "익명" : question.author?.name || "사용자"}</span>
                <span>·</span>
                <span>{format(new Date(question.createdAt), "MMM dd HH:mm", { locale: ko })}</span>
              </div>

              {/* 맥락 정보 표시 */}
              {(question.interestUniversity || question.interestMajor || question.gradeLevel) && (
                <div className="flex flex-wrap gap-1">
                  {question.interestUniversity && (
                    <Badge variant="outline" className="text-xs">
                      {question.interestUniversity}
                    </Badge>
                  )}
                  {question.interestMajor && (
                    <Badge variant="outline" className="text-xs">
                      {question.interestMajor}
                    </Badge>
                  )}
                  {question.gradeLevel && (
                    <Badge variant="outline" className="text-xs">
                      {question.gradeLevel}
                    </Badge>
                  )}
                </div>
              )}

              {question.category && (
                <Badge variant="secondary" className="text-xs mt-2">
                  {question.category}
                </Badge>
              )}
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-xs sm:text-sm whitespace-pre-wrap">{question.content}</p>

              {question.contextInfo && (
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-xs font-medium mb-1">추가 정보</p>
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap">{question.contextInfo}</p>
                </div>
              )}

              {/* 질문자 액션 */}
              {isQuestionAuthor && question.status !== "solved" && (
                <div className="flex gap-2 pt-3 border-t">
                  {question.status === "answered" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAsSolved}
                      disabled={updateQuestionStatusMutation.isPending}
                      className="text-xs h-8"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      해결됨으로 표시
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* 답변 목록 */}
          {question.answers && question.answers.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                답변 {question.answers.length}개
              </h2>
              {question.answers
                .slice()
                .sort((a: any, b: any) => {
                  // 채택된 답변를 먼저 정렬
                  if (a.isAccepted && !b.isAccepted) return -1;
                  if (!a.isAccepted && b.isAccepted) return 1;
                  // 단, 답변 중 좋아요 많은 순으로
                  return (b.likeCount || 0) - (a.likeCount || 0);
                })
                .map((answer: any) => (
                <Card
                  key={answer.id}
                  className={`${answer.mentorProfile ? "border-l-4 border-l-blue-500" : ""} ${answer.isAccepted ? "ring-2 ring-green-400 bg-green-50 dark:bg-green-950/30/30" : ""}`}
                >
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        {/* 채택 배지 */}
                        {answer.isAccepted && (
                          <div className="flex items-center gap-1 mb-2">
                            <Award className="h-4 w-4 text-green-600 dark:text-green-400" />
                            <span className="text-xs font-semibold text-green-700 dark:text-green-400">채택된 답변</span>
                          </div>
                        )}
                        {/* 작성자 정보 */}
                        <div className="flex items-center gap-2 mb-2">
                          {answer.mentorProfile && (
                            <Badge className="text-xs bg-blue-500 flex-shrink-0">멘토</Badge>
                          )}
                          <span className="text-xs sm:text-sm font-semibold truncate">
                            {answer.author?.name || "사용자"}
                          </span>
                        </div>

                        {/* 멘토 프로필 정보 */}
                        {answer.mentorProfile && (
                          <div className="text-xs text-muted-foreground mb-2 space-y-1">
                            <p className="truncate">
                              {answer.mentorProfile.university} {answer.mentorProfile.major}
                              {answer.mentorProfile.gradeLevel && ` · ${answer.mentorProfile.gradeLevel}`}
                            </p>
                            {answer.mentorProfile.averageRating !== null && answer.mentorProfile.averageRating !== undefined && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>
                                  {typeof answer.mentorProfile.averageRating === 'number' ? answer.mentorProfile.averageRating.toFixed(1) : '0.0'} 
                                  ({answer.mentorProfile.reviewCount || 0}개 후기)
                                </span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 작성 시간 */}
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(answer.createdAt), "MMM dd HH:mm", { locale: ko })}
                        </p>
                      </div>

                      <div className="flex gap-1 flex-shrink-0 flex-wrap justify-end">
                        {/* 상담 신청 버튼 */}
                        {answer.mentorProfile && isAuthenticated && user?.userType === "high_school_student" && (
                          <ConsultationCTAButton
                            variant="outline"
                            size="sm"
                            onClick={() => setLocation(`/messages?mentorUUID=${answer.mentorProfile.uuid}`)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            상담 신청
                          </ConsultationCTAButton>
                        )}
                        {/* 채택 버튼 (질문 작성자만, 미해결 상태) */}
                        {isQuestionAuthor && question.status !== "solved" && (
                          <Button
                            variant={answer.isAccepted ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleAcceptAnswer(answer.id)}
                            disabled={acceptAnswerMutation.isPending}
                            className={`text-xs h-8 whitespace-nowrap ${answer.isAccepted ? "bg-green-600 hover:bg-green-700" : "border-green-400 text-green-700 dark:text-green-400 hover:bg-green-50 dark:bg-green-950/30"}`}
                          >
                            <Award className="h-3 w-3 mr-1" />
                            {answer.isAccepted ? "채택됨" : "채택"}
                          </Button>
                        )}
                        {/* 신고 버튼 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReportTarget({ type: "answer", id: answer.id });
                            setReportDialogOpen(true);
                          }}
                          className="text-xs h-8"
                        >
                          <Flag className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {/* 답변 내용 */}
                  <CardContent className="space-y-3">
                    <p className="text-xs sm:text-sm whitespace-pre-wrap">{answer.content}</p>

                    {/* 좋아요 버튼 */}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleLike(answer.id)}
                        disabled={toggleLikeMutation.isPending}
                        className={`text-xs h-7 px-2 gap-1 ${likedAnswers.has(answer.id) ? "text-blue-600 bg-primary/5 hover:bg-primary/10 :bg-slate-800 :bg-slate-800" : "text-muted-foreground hover:text-blue-600"}`}
                      >
                        <ThumbsUp className={`h-3 w-3 ${likedAnswers.has(answer.id) ? "fill-blue-600" : ""}`} />
                        <span>도움이 됐어요 {(likeCounts[answer.id] || 0) > 0 ? `(${likeCounts[answer.id]})` : ""}</span>
                      </Button>
                    </div>

                    {/* 답글 목록 */}
                    {answer.replies && answer.replies.length > 0 && (
                      <div className="mt-3 pl-3 sm:pl-4 border-l-2 border-muted space-y-2">
                        {answer.replies.map((reply: any) => (
                          <div key={reply.id} className="text-xs">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-muted-foreground">
                                {reply.author?.name || "사용자"}
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setReportTarget({ type: "reply", id: reply.id });
                                  setReportDialogOpen(true);
                                }}
                                className="text-xs h-6 p-0"
                              >
                                <Flag className="h-2.5 w-2.5" />
                              </Button>
                            </div>
                            <p className="text-muted-foreground whitespace-pre-wrap">
                              {reply.content}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 답글 작성 폴 */}
                    {isAuthenticated && expandedReplyAnswerId !== answer.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedReplyAnswerId(answer.id)}
                        className="text-xs h-7 text-muted-foreground hover:text-blue-600 mt-2"
                      >
                        <MessageCircle className="h-3 w-3 mr-1" />
                        답글 작성
                      </Button>
                    )}

                    {expandedReplyAnswerId === answer.id && (
                      <div className="mt-3 pt-3 border-t space-y-2">
                        <Textarea
                          value={replyContents[answer.id] || ""}
                          onChange={(e) => setReplyContents({ ...replyContents, [answer.id]: e.target.value })}
                          placeholder="이 답변에 대한 의견이나 추가 질문을 남겼주세요"
                          className="text-xs min-h-16 resize-none"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCreateReply(answer.id)}
                            disabled={createReplyMutation.isPending}
                            className="text-xs h-8 bg-blue-600 hover:bg-blue-700 flex-1"
                          >
                            {createReplyMutation.isPending ? "작성 중..." : "답글 등록"}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setExpandedReplyAnswerId(null);
                              setReplyContents({ ...replyContents, [answer.id]: "" });
                            }}
                            className="text-xs h-8"
                          >
                            취소
                          </Button>
                        </div>
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

          {/* 답변 작성 - 멘토만 가능 */}
          {isAuthenticated && user?.role === "mentor" && (
            <Card className="border-green-200 dark:border-green-800/50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <CardTitle className="text-base sm:text-lg text-green-800">답변 작성</CardTitle>
                </div>
                <CardDescription className="text-xs sm:text-sm">
                  멘티의 고민에 성실하게 답변해주세요. 좋은 답변은 멘토 프로필에 표시되며 상담 연결로 이어질 수 있습니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Textarea
                  value={answerContent}
                  onChange={(e) => setAnswerContent(e.target.value)}
                  placeholder="멘티의 실제 경험을 바탕으로 성실한 답변을 작성해주세요"
                  className="text-xs sm:text-sm min-h-24 sm:min-h-32 resize-none border-green-200 dark:border-green-800/50 focus:border-green-400"
                />
                <Button
                  onClick={handleCreateAnswer}
                  disabled={createAnswerMutation.isPending}
                  className="w-full text-xs sm:text-sm h-9 sm:h-10 bg-green-600 hover:bg-green-700"
                >
                  {createAnswerMutation.isPending ? "작성 중..." : "답변 등록하기"}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 멘티에게 답변 작성 안내 (멘토가 아닌 경우) */}
          {isAuthenticated && user?.role !== "mentor" && (
            <Card className="bg-background 900 border-dashed">
              <CardContent className="py-4 text-center">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  답변은 인증된 멘토만 작성할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
