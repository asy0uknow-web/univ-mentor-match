import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, MessageCircle, ArrowRight } from "lucide-react";

export function FeaturedColumnsSection() {
  const { data: columns, isLoading } = trpc.mentorColumns.getList.useQuery({
    limit: 3,
    sortBy: "latest",
  });

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            멘토 칼럼
          </h2>
          <p className="text-center text-muted-foreground mb-12 sm:mb-16">
            멘토들의 경험과 조언을 담은 칼럼을 읽어보세요
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="rounded-2xl overflow-hidden bg-card  shadow-md ">
                <Skeleton className="w-full h-48" />
                <div className="p-6">
                  <Skeleton className="h-6 w-3/4 mb-3" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!columns || columns.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
            멘토 칼럼
          </h2>
          <p className="text-center text-muted-foreground max-w-2xl mx-auto">
            멘토들의 경험과 조언을 담은 칼럼을 읽어보세요. 진로, 학업, 대학 생활에 대한 실질적인 인사이트를 얻을 수 있습니다.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12">
          {columns.map((column: any) => (
            <Link key={column.id} href={`/columns/${column.id}`}>
              <div className="group rounded-2xl overflow-hidden bg-card  shadow-md  hover:shadow-xl transition-all duration-300 h-full flex flex-col cursor-pointer hover:scale-105 hover:-translate-y-2">
                {/* 커버 이미지 */}
                {column.coverImageUrl && (
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/20 to-primary/5">
                    <img
                      src={column.coverImageUrl}
                      alt={column.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}

                {/* 콘텐츠 */}
                <div className="p-6 flex-1 flex flex-col">
                  {/* 카테고리 배지 */}
                  <div className="mb-3">
                    <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
                      {column.category}
                    </span>
                  </div>

                  {/* 제목 */}
                  <h3 className="text-lg font-bold text-foreground mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                    {column.title}
                  </h3>

                  {/* 요약 */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1 group-hover:text-foreground transition-colors">
                    {column.excerpt || column.content.substring(0, 100)}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{column.likesCount || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      <span>{column.commentsCount || 0}</span>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {new Date(column.createdAt).toLocaleDateString("ko-KR", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
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
