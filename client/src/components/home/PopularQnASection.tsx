import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";

export function PopularQnASection() {
  const [popularQuestions, setPopularQuestions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { data: questions } = trpc.qna.getQuestions.useQuery(
    { limit: 100, offset: 0, sortBy: "most_answers" },
    { enabled: true }
  );

  useEffect(() => {
    if (questions && questions.length > 0) {
      // 답변이 많은 상위 6개 질문 선택
      const top6 = questions.slice(0, 6);
      setPopularQuestions(top6);
      setIsLoading(false);
    }
  }, [questions]);

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      awaiting_answer: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      answered: "bg-primary/10 text-blue-700",
      solved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    };
    return colors[status] || "bg-muted text-foreground";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      awaiting_answer: "답변 대기",
      answered: "답변 완료",
      solved: "해결됨",
    };
    return labels[status] || status;
  };

  if (isLoading || popularQuestions.length === 0) {
    return null;
  }

  return (
    <section
      id="popular-qna"
      role="region"
      className="py-24 sm:py-30 md:py-36 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
      aria-label="인기 Q&A"
    >
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* 섹션 헤더 */}
          <div className="text-center mb-12 sm:mb-16">
            <div className="flex items-center justify-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
                커뮤니티
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
              커뮤니티 Q&A
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              다양한 질문과 멘토들의 실질적인 답변을 확인해보세요.
              당신의 고민도 멘토 커뮤니티에서 해결할 수 있습니다.
            </p>
          </div>

          {/* Q&A 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {popularQuestions.map((question) => (
              <Link
                key={question.id}
                href={`/qna/${question.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-[#E2E8F0] hover:border-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-2">
                  <CardHeader className="pb-4 sm:pb-6">
                    {/* 상태 배지만 표시 (카테고리 제거) */}
                    <div className="flex items-start justify-between mb-3">
                      <Badge
                        className={`text-xs ${getStatusBadgeColor(
                          question.status || "awaiting_answer"
                        )}`}
                        variant="secondary"
                      >
                        {getStatusLabel(question.status || "awaiting_answer")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {question.isAnonymous ? "익명" : "공개"}
                      </span>
                    </div>

                    {/* 질문 제목 */}
                    <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2 mb-3">
                      {question.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 가장 반응이 좋은 답변 미리보기 */}
                    {question.bestAnswer && (
                      <div className="p-3 sm:p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-start gap-3 mb-2">
                          {/* 답변 멘토 프로필 이미지 */}
                          <img
                            src={question.bestAnswer.mentorImage || "/logonew.png"}
                            alt={question.bestAnswer.mentorName}
                            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm font-semibold text-foreground">
                              {question.bestAnswer.mentorName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              최고 평가 답변
                            </p>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                          {question.bestAnswer.content}
                        </p>
                      </div>
                    )}

                    {/* 질문 내용 미리보기 (답변이 없을 때) */}
                    {!question.bestAnswer && (
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                        {question.content}
                      </p>
                    )}

                    {/* 답변 수 및 추가 정보 */}
                    <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{question.answerCount || 0}</span>
                        <span>개의 답변</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 하단 CTA */}
          <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-200 dark:border-indigo-800 text-center">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">
              당신의 고민을 멘토 커뮤니티에 물어보세요
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              전공 선택, 대학 생활, 진로 고민 등 무엇이든 성실한 멘토들이 답변해줄 준비가 되어있습니다.
            </p>
            <Link href="/qna">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 font-semibold hover:scale-105 active:scale-95 transition-transform">
                Q&A 커뮤니티 참여하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
