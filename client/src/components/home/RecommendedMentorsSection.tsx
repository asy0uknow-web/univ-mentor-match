import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Star, MapPin, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function RecommendedMentorsSection() {
  const { data: mentors, isLoading } = trpc.mentor.listAll.useQuery();

  // 리뷰 수가 많은 순서로 정렬하여 상위 6명 선택
  const recommendedMentors = mentors
    ?.sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0))
    .slice(0, 6);

  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16">
            추천 멘토
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={`skeleton-${i}`}>
                <Skeleton className="h-64 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!recommendedMentors || recommendedMentors.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            추천 멘토
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            많은 학생들이 선택한 경험 많은 멘토들을 만나보세요
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          {recommendedMentors.map((mentor: any) => (
            <Link key={mentor.uuid || mentor.id} href={`/mentor/${mentor.uuid || mentor.id}`}>
              <Card className="group overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer h-full">
                <div className="relative h-40 sm:h-48 bg-gradient-to-br from-purple-400 to-pink-400 overflow-hidden">
                  {mentor.profileImage ? (
                    <img
                      src={mentor.profileImage}
                      alt={mentor.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 text-white text-3xl font-bold">
                      {mentor.name?.[0]}
                    </div>
                  )}
                </div>

                <div className="p-4 sm:p-5">
                  <h3 className="font-bold text-base sm:text-lg line-clamp-1 mb-1 group-hover:text-purple-600 transition-colors">
                    {mentor.name}
                  </h3>

                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-1">
                    <MapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{mentor.university}</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-1">
                    <BookOpen className="w-3 h-3 flex-shrink-0" />
                    <span className="line-clamp-1">{mentor.major}</span>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-sm">
                        {(mentor.averageRating || 0).toFixed(1)}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {mentor.reviewCount || 0}명
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-10 sm:mt-12">
          <Link href="/mentors">
            <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors">
              모든 멘토 보기
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
