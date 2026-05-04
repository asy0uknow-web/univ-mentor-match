import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendingAnswerPopup() {
  const { data: questions, isLoading } = trpc.qna.getQuestions.useQuery({
    limit: 10,
    sortBy: "latest",
  });

  if (isLoading) {
    return (
      <div className="fixed bottom-6 right-6 w-80 bg-card rounded-2xl shadow-2xl p-6 border border-border animate-in slide-in-from-bottom-4 duration-300">
        <Skeleton className="h-6 w-3/4 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-4" />
      </div>
    );
  }

  // 우선순위 로직: 최근 조회수 > 전체 조회수 > 좋아요 > 댓글
  const trendingQuestion = questions?.sort((a: any, b: any) => {
    // 최근 조회수 기준
    if ((a.recentViewCount || 0) !== (b.recentViewCount || 0)) {
      return (b.recentViewCount || 0) - (a.recentViewCount || 0);
    }
    // 전체 조회수 기준
    if ((a.viewCount || 0) !== (b.viewCount || 0)) {
      return (b.viewCount || 0) - (a.viewCount || 0);
    }
    // 좋아요 기준
    if ((a.likeCount || 0) !== (b.likeCount || 0)) {
      return (b.likeCount || 0) - (a.likeCount || 0);
    }
    // 댓글 기준
    return (b.answerCount || 0) - (a.answerCount || 0);
  })[0];

  if (!trendingQuestion) return null;

  // 제목 강조 및 내용 생략
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const contentPreview = trendingQuestion.content
    ? truncateText(trendingQuestion.content.replace(/<[^>]*>/g, ""), 100)
    : "";

  return (
    <Link href={`/qna/${trendingQuestion.id}`}>
      <div className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/20 dark:to-amber-950/10 rounded-2xl shadow-2xl p-6 border-2 border-amber-200 dark:border-amber-800/50 hover:shadow-3xl hover:border-amber-300 dark:hover:border-amber-700 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom-4 duration-300 z-40">
        {/* 배지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
            ⭐ 인기 질문
          </span>
        </div>

        {/* 제목 - 강조 */}
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
          {trendingQuestion.title}
        </h3>

        {/* 내용 미리보기 */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {contentPreview}
        </p>

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{trendingQuestion.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{trendingQuestion.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{trendingQuestion.answerCount || 0}</span>
          </div>
        </div>

        {/* 카테고리 */}
        <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-amber-800/30">
          <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-100 text-xs rounded-full">
            {trendingQuestion.category || "일반"}
          </span>
        </div>
      </div>
    </Link>
  );
}
