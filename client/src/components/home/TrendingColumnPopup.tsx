import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function TrendingColumnPopup() {
  const { data: columns, isLoading } = trpc.mentorColumns.getList.useQuery({
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
  const trendingColumn = columns?.sort((a: any, b: any) => {
    // 최근 조회수 기준 (recentViewCount)
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
    return (b.commentCount || 0) - (a.commentCount || 0);
  })[0];

  if (!trendingColumn) return null;

  // 제목 강조 및 내용 생략
  const truncateText = (text: string, maxLength: number = 80) => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const contentPreview = trendingColumn.content
    ? truncateText(trendingColumn.content.replace(/<[^>]*>/g, ""), 100)
    : "";

  return (
    <Link href={`/columns/${trendingColumn.id}`}>
      <div className="fixed bottom-6 right-6 w-80 bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl shadow-2xl p-6 border-2 border-primary/30 hover:shadow-3xl hover:border-primary/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:-translate-y-1 animate-in slide-in-from-bottom-4 duration-300 z-40">
        {/* 배지 */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-2 py-1 bg-primary text-white text-xs font-bold rounded-full">
            🔥 오늘의 인기 칼럼
          </span>
        </div>

        {/* 제목 - 강조 */}
        <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 hover:text-primary transition-colors">
          {trendingColumn.title}
        </h3>

        {/* 내용 미리보기 */}
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {contentPreview}
        </p>

        {/* 메타 정보 */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            <span>{trendingColumn.viewCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="w-3 h-3" />
            <span>{trendingColumn.likeCount || 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            <span>{trendingColumn.commentCount || 0}</span>
          </div>
        </div>

        {/* 작성자 정보 */}
        <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
          {trendingColumn.mentor?.profileImageUrl && (
            <img
              src={trendingColumn.mentor.profileImageUrl}
              alt={trendingColumn.mentor.name}
              className="w-6 h-6 rounded-full"
            />
          )}
          <span className="text-xs font-medium text-foreground">
            {trendingColumn.mentor?.name || "멘토"}
          </span>
        </div>
      </div>
    </Link>
  );
}
