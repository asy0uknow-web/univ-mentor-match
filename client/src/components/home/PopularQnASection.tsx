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

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      "입시 전략": "bg-primary/10 text-blue-700",
      "전공 선택": "bg-purple-100 text-purple-700",
      "대학 생활": "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
      "학업 관리": "bg-orange-100 text-orange-700",
      "진로 상담": "bg-pink-100 text-pink-700",
      "기타": "bg-muted 800 text-foreground",
    };
    return colors[category] || "bg-muted 800 text-foreground";
  };

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      awaiting_answer: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400",
      answered: "bg-primary/10 text-blue-700",
      solved: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    };
    return colors[status] || "bg-muted 800 text-foreground";
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
      className="py-16 sm:py-24 md:py-32 bg-background"
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
              지금 많은 멘티들이 묻고 있는 질문
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              멘토들의 성실한 답변으로 해결되는 실제 고민들을 살펴보세요.
              당신의 질문도 멘토 커뮤니티에서 답변받을 수 있습니다.
            </p>
          </div>

          {/* Q&A 카드 그리드 */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4 lg:gap-6 mb-8 sm:mb-12">
            {popularQuestions.map((question) => (
              <Link
                key={question.id}
                href={`/qna/${question.id}`}
                className="group"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 border-border 700 700 hover:border-blue-300 cursor-pointer hover:scale-105 hover:-translate-y-2 group">
                  <CardHeader className="pb-3 sm:pb-4">
                    {/* 카테고리 및 상태 배지 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Badge
                        className={`text-xs ${getCategoryBadgeColor(
                          question.category || "기타"
                        )}`}
                        variant="secondary"
                      >
                        {question.category || "기타"}
                      </Badge>
                      <Badge
                        className={`text-xs ${getStatusBadgeColor(
                          question.status || "awaiting_answer"
                        )}`}
                        variant="secondary"
                      >
                        {getStatusLabel(question.status || "awaiting_answer")}
                      </Badge>
                    </div>

                    {/* 질문 제목 */}
                    <h3 className="text-sm sm:text-base font-semibold text-foreground group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {question.title}
                    </h3>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4">
                    {/* 질문 내용 미리보기 */}
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors">
                      {question.content}
                    </p>

                    {/* 답변 수 및 추가 정보 */}
                    <div className="flex items-center justify-between pt-2 border-t border-border 700 700">
                      <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground 300 300">
                        <MessageCircle className="h-4 w-4 text-blue-500" />
                        <span className="font-semibold">{question.answerCount || 0}</span>
                        <span>개의 답변</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {question.isAnonymous ? "익명" : "공개"}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* 하단 CTA */}
          <div className="mt-12 sm:mt-16 p-6 sm:p-8 rounded-xl bg-primary/5 border border-blue-200 text-center">
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
