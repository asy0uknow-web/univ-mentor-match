import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, ArrowRight, Eye } from "lucide-react";

export function FeaturedColumnsSection() {
  const { data: columns, isLoading } = trpc.mentorColumns.getList.useQuery({
    limit: 6,
    sortBy: "latest",
  });

  if (isLoading) {
    return (
      <section className="py-24 sm:py-30 md:py-36 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            칼럼 스튜디오
          </h2>
          <p className="text-center text-muted-foreground mb-12 sm:mb-16">
            멘토들의 경험과 조언을 담은 칼럼을 읽어보세요
          </p>
          <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8">
            {/* Featured Skeleton */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden bg-card shadow-md">
                <Skeleton className="w-full h-80" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            </div>
            {/* Popular List Skeleton */}
            <div className="lg:col-span-2 space-y-4">
              {[1, 2, 3].map((idx) => (
                <div key={idx} className="p-4 rounded-xl bg-card shadow-sm">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-full mb-2" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!columns || columns.length === 0) {
    return null;
  }

  // Featured column (첫 번째 칼럼)
  const featuredColumn = columns[0];
  // Popular list (나머지 칼럼들)
  const popularColumns = columns.slice(1, 4);

  return (
    <section className="py-24 sm:py-30 md:py-36 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            칼럼 스튜디오
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            멘토들의 다양한 경험을 담은 칼럼을 함께 나누세요.
          </p>
        </div>

        {/* 7:3 Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-8 mb-12">
          {/* Featured Column (70%) */}
          <div className="lg:col-span-5">
            <Link href={`/columns/${featuredColumn.id}`}>
              <div className="group rounded-2xl overflow-hidden bg-card shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer hover:scale-105 hover:-translate-y-2">
                {/* 커버 이미지 */}
                <div className="relative h-80 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                  {featuredColumn.coverImageUrl && (
                    <img
                      src={featuredColumn.coverImageUrl}
                      alt={featuredColumn.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  )}
                  {/* 오버레이 그라데이션 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* 콘텐츠 (이미지 위에 절대 위치) */}
                <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end">
                  {/* 카테고리 배지 */}
                  <div className="mb-4">
                    <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md text-white text-xs font-semibold rounded-full">
                      {featuredColumn.category}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 line-clamp-2 group-hover:text-blue-200 transition-colors">
                    {featuredColumn.title}
                  </h3>

                  {/* 요약 */}
                  <p className="text-sm sm:text-base text-white/90 mb-4 line-clamp-2">
                    {featuredColumn.excerpt || featuredColumn.content.substring(0, 150)}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-6 text-xs text-white/80">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4" />
                      <span>{featuredColumn.viewsCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Heart className="w-4 h-4" />
                      <span>{featuredColumn.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-4 h-4" />
                      <span>{featuredColumn.commentsCount || 0}</span>
                    </div>
                    <div className="ml-auto">
                      {new Date(featuredColumn.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Popular Columns List (30%) */}
          <div className="lg:col-span-2 space-y-4">
            <h4 className="text-lg font-bold text-foreground mb-4">인기 칼럼</h4>
            {popularColumns.map((column: any, index: number) => (
              <Link key={column.id} href={`/columns/${column.id}`}>
                <div className="group p-4 rounded-xl bg-card border border-[#E2E8F0] hover:border-primary/50 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-primary/5">
                  {/* 순위 배지 */}
                  <div className="flex items-start justify-between mb-2">
                    <span className="inline-block w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {index + 2}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(column.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h5 className="text-sm font-semibold text-foreground line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                    {column.title}
                  </h5>

                  {/* 요약 */}
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                    {column.excerpt || column.content.substring(0, 80)}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      <span>{column.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>{column.commentsCount || 0}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 더보기 버튼 */}
        <div className="text-center">
          <Link href="/columns">
            <div>
              <Button variant="outline" size="lg" className="group hover:scale-105 active:scale-95 transition-transform">
                모든 칼럼 보기
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
