import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, Eye, TrendingUp } from "lucide-react";
import { Link } from "wouter";

interface ColumnStats {
  id: number;
  title: string;
  category: string;
  likesCount: number;
  commentsCount: number;
  viewCount?: number;
  createdAt: string;
}

export default function AdminColumnStats() {
  const { data: columns, isLoading } = trpc.mentorColumns.getList.useQuery({
    limit: 100,
    sortBy: "latest",
  });

  const [categoryStats, setCategoryStats] = useState<Record<string, any>>({});
  const [totalStats, setTotalStats] = useState({
    totalColumns: 0,
    totalLikes: 0,
    totalComments: 0,
  });

  useEffect(() => {
    if (columns && columns.length > 0) {
      // 카테고리별 통계 계산
      const stats: Record<string, any> = {};
      let totalLikes = 0;
      let totalComments = 0;

      columns.forEach((col: any) => {
        const category = col.category || "기타";
        if (!stats[category]) {
          stats[category] = {
            count: 0,
            likes: 0,
            comments: 0,
            avgLikes: 0,
            avgComments: 0,
          };
        }
        stats[category].count += 1;
        stats[category].likes += col.likesCount || 0;
        stats[category].comments += col.commentsCount || 0;
        totalLikes += col.likesCount || 0;
        totalComments += col.commentsCount || 0;
      });

      // 평균값 계산
      Object.keys(stats).forEach((category) => {
        stats[category].avgLikes = Math.round(stats[category].likes / stats[category].count);
        stats[category].avgComments = Math.round(stats[category].comments / stats[category].count);
      });

      setCategoryStats(stats);
      setTotalStats({
        totalColumns: columns.length,
        totalLikes,
        totalComments,
      });
    }
  }, [columns]);

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-8">칼럼 통계</h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="bg-card  rounded-lg p-6 shadow-md ">
                <Skeleton className="h-8 w-1/2 mb-2" />
                <Skeleton className="h-6 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </PageLayout>
    );
  }

  const sortedCategories = Object.entries(categoryStats)
    .sort(([, a]: any, [, b]: any) => b.likes - a.likes);

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">칼럼 통계</h1>
          <p className="text-muted-foreground">멘토 칼럼의 성과를 한눈에 확인하세요</p>
        </div>

        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 shadow-md  border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">총 칼럼 수</p>
                <p className="text-3xl font-bold text-foreground">{totalStats.totalColumns}</p>
              </div>
              <div className="text-4xl opacity-20">📝</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-6 shadow-md  border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">총 좋아요</p>
                <p className="text-3xl font-bold text-foreground">{totalStats.totalLikes}</p>
              </div>
              <Heart className="w-8 h-8 text-red-400 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 shadow-md  border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">총 댓글</p>
                <p className="text-3xl font-bold text-foreground">{totalStats.totalComments}</p>
              </div>
              <MessageCircle className="w-8 h-8 text-green-400 opacity-50" />
            </div>
          </div>
        </div>

        {/* 카테고리별 통계 테이블 */}
        <div className="bg-card  rounded-lg shadow-md  overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="text-xl font-bold">카테고리별 통계</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">카테고리</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">칼럼 수</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4" />
                      좋아요
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <Heart className="w-4 h-4" />
                      평균 좋아요
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      댓글
                    </div>
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-foreground">
                    <div className="flex items-center justify-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      평균 댓글
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedCategories.length > 0 ? (
                  sortedCategories.map(([category, stats]: any) => (
                    <tr key={category} className="border-b border-border hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{category}</td>
                      <td className="px-6 py-4 text-center text-foreground font-semibold">{stats.count}</td>
                      <td className="px-6 py-4 text-center text-foreground">{stats.likes}</td>
                      <td className="px-6 py-4 text-center text-foreground">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-full text-sm">
                          <TrendingUp className="w-3 h-3" />
                          {stats.avgLikes}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-foreground">{stats.comments}</td>
                      <td className="px-6 py-4 text-center text-foreground">
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-sm">
                          <TrendingUp className="w-3 h-3" />
                          {stats.avgComments}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      아직 칼럼이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="mt-8 flex gap-4">
          <Link href="/columns">
            <a>
              <Button variant="outline">모든 칼럼 보기</Button>
            </a>
          </Link>
          <Link href="/columns/new">
            <a>
              <Button>새 칼럼 작성</Button>
            </a>
          </Link>
        </div>
      </div>
    </PageLayout>
  );
}
