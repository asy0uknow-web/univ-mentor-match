import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Cpu, Microscope, Briefcase, BookOpen, GraduationCap, Lightbulb, Stethoscope, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { PromotionCard } from "./PromotionCard";

interface FeaturedMentor {
  id: number;
  uuid?: string;
  name: string;
  university: string;
  major: string;
  bio: string;
  field?: string;
  image?: string;
  rating: number;
  reviewCount: number;
}

const getFieldIcon = (field?: string) => {
  const iconProps = { className: "w-5 h-5" };
  switch (field) {
    case "engineering":
      return <Cpu {...iconProps} />;
    case "natural_science":
      return <Microscope {...iconProps} />;
    case "business":
      return <Briefcase {...iconProps} />;
    case "humanities":
      return <BookOpen {...iconProps} />;
    case "education":
      return <GraduationCap {...iconProps} />;
    case "liberal_arts":
      return <Lightbulb {...iconProps} />;
    case "medicine":
      return <Stethoscope {...iconProps} />;
    default:
      return null;
  }
};

const getFieldLabel = (field?: string) => {
  const labels: Record<string, string> = {
    engineering: "공학",
    natural_science: "자연과학",
    business: "경영/상경",
    humanities: "인문학",
    education: "교육",
    liberal_arts: "교양",
    medicine: "의학",
  };
  return labels[field || ""] || "전공 미등록";
};

export const FeaturedMentorsSlide = () => {
  const [, setLocation] = useLocation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const [maxCardHeight, setMaxCardHeight] = useState(0);

  // 실제 멘토 데이터 조회 (평점 높은 순서, 최대 12개)
  const { data: mentorsData, isLoading, error } = trpc.mentor.getTopMentors.useQuery(
    { limit: 12 },
    { 
      staleTime: 1000 * 60 * 5, // 5분 캐시
      retry: false // 재시도 안 함 - 에러 발생 시 리다이렉트되지 않도록
    }
  );

  const mentors: FeaturedMentor[] = (mentorsData || []).map((mentor: any) => ({
    id: mentor.id,
    uuid: mentor.uuid,
    name: mentor.name || "멘토",
    university: mentor.university || "대학명 미등록",
    major: mentor.major || "전공 미등록",
    bio: mentor.bio || "자기소개 미등록",
    field: mentor.field,
    image: (mentor as any).profileImage,
    rating: mentor.averageRating ? parseFloat(mentor.averageRating.toString()) : 0,
    reviewCount: mentor.reviewCount || 0,
  }));

  // 카드 높이를 고정값으로 설정 (모든 슬라이드에서 일관된 높이)
  useEffect(() => {
    // 모바일에서는 더 작은 높이 사용
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const FIXED_CARD_HEIGHT = isMobile ? 480 : 560;
    setMaxCardHeight(FIXED_CARD_HEIGHT);
  }, []);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlay || mentors.length === 0) return;
    const timer = setInterval(() => {
      if (mentors.length >= 12) {
        // 12명 이상: 3명씩 페이지 단위로 슬라이드
        const maxPages = Math.ceil(mentors.length / 3);
        setCurrentIndex((prev) => {
          const nextPage = Math.floor(prev / 3) + 1;
          return (nextPage % maxPages) * 3;
        });
      } else {
        // 12명 미만: 순환
        setCurrentIndex((prev) => (prev + 1) % mentors.length);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, mentors.length]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    if (mentors.length >= 12) {
      // 12명 이상: 3명씩 이전 페이지로
      const maxPages = Math.ceil(mentors.length / 3);
      setCurrentIndex((prev) => {
        const currentPage = Math.floor(prev / 3);
        const prevPage = (currentPage - 1 + maxPages) % maxPages;
        return prevPage * 3;
      });
    } else {
      // 12명 미만: 순환
      setCurrentIndex((prev) => (prev - 1 + mentors.length) % mentors.length);
    }
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    if (mentors.length >= 12) {
      // 12명 이상: 3명씩 다음 페이지로
      const maxPages = Math.ceil(mentors.length / 3);
      setCurrentIndex((prev) => {
        const currentPage = Math.floor(prev / 3);
        const nextPage = (currentPage + 1) % maxPages;
        return nextPage * 3;
      });
    } else {
      // 12명 미만: 순환
      setCurrentIndex((prev) => (prev + 1) % mentors.length);
    }
  };

  // 중복 제거: 멘토가 12명 이상이면 순환하지 않음
  const visibleMentors = [];
  const maxVisible = Math.min(3, mentors.length);
  for (let i = 0; i < maxVisible; i++) {
    const index = currentIndex + i;
    // 멘토가 12명 이상이면 순환하지 않고, 12명 미만이면 순환
    if (mentors.length >= 12) {
      if (index < mentors.length) {
        visibleMentors.push(mentors[index]);
      }
    } else {
      // 12명 미만인 경우 순환
      visibleMentors.push(mentors[index % mentors.length]);
    }
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              🌟 지금 가장 인기 있는
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              추천 멘토들을 만나보세요
            </h2>
          </div>
          <div className="flex justify-center items-center h-96">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </section>
    );
  }

  // 에러 상태
  if (error || mentors.length === 0) {
    return (
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-primary/10 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
              🌟 지금 가장 인기 있는
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              추천 멘토들을 만나보세요
            </h2>
          </div>
          <div className="text-center text-muted-foreground">
            <p>현재 추천 멘토를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-blue-700 rounded-full text-sm font-semibold mb-4">
            🌟 지금 가장 인기 있는
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            추천 멘토들을 만나보세요
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            검증된 멘토들의 생생한 프로필과 학생들의 평가를 확인하세요
          </p>
        </div>

        {/* Slider Container */}
        <div className="relative max-w-6xl mx-auto">
          {/* Mentor Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {visibleMentors.map((mentor, index) => (
              <>
                {index === 3 && <PromotionCard height={maxCardHeight} />}
                <div
                  key={`${mentor.id}-${currentIndex}`}
                  className="bg-card  rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 hover:-translate-y-2 cursor-pointer flex flex-col h-full group"
                  style={{ height: `${maxCardHeight}px` }}
                >
                  {/* Mentor Image Placeholder */}
                  <div className="w-full flex-shrink-0 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 overflow-hidden" style={{ height: '192px' }}>
                    {/* 프로필 이미지 또는 로고 */}
                    <img
                      src={mentor.image || "/logonew.png"}
                      alt={mentor.image ? mentor.name : "유니브매치 로고"}
                      className={`${mentor.image ? 'w-full h-full object-cover' : 'w-24 h-24 object-contain'} group-hover:scale-125 transition-transform duration-300`}
                    />
                  </div>

                  {/* Mentor Info */}
                  <div className="p-4 sm:p-6 md:p-8 flex flex-col flex-grow">
                    {/* Name */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">
                      {mentor.name}
                    </h3>
                    
                    {/* University */}
                    <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-1">
                      {mentor.university}
                    </p>
                    
                    {/* Major */}
                    <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-2 line-clamp-2">
                      {mentor.major}
                    </p>
                    
                    {/* Rating or New Badge */}
                    <div className="mb-3 sm:mb-4">
                      {mentor.reviewCount === 0 ? (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm whitespace-nowrap">
                          <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">New</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < Math.floor(mentor.rating)
                                    ? "text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-foreground">
                            {mentor.rating.toFixed(1)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Professional Field Badge */}
                    {mentor.field && (
                      <div className="flex items-center gap-2 mb-3 sm:mb-4 px-2 sm:px-3 py-1.5 sm:py-2 bg-primary/5 rounded-lg w-fit">
                        <span className="text-blue-600 w-4 h-4 flex-shrink-0">{getFieldIcon(mentor.field)}</span>
                        <span className="text-xs font-medium text-blue-700">
                          {getFieldLabel(mentor.field)}
                        </span>
                      </div>
                    )}

                    {/* Bio Section with Dynamic Spacing */}
                    <div className="flex-grow mb-3 sm:mb-4">
                      {mentor.bio && mentor.bio !== "자기소개 미등록" ? (
                        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 sm:line-clamp-3">
                          {mentor.bio}
                        </p>
                      ) : null}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => setLocation(`/mentor/${mentor.uuid || mentor.id}`)}
                      className="w-full py-2 sm:py-3 px-3 sm:px-4 bg-blue-600 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-auto"
                    >
                      프로필 보기
                    </button>
                  </div>
              </div>
              </>
            ))}
          </div>

          {/* Navigation Buttons */}
          {mentors.length > 3 && mentors.length >= 12 && (
            <div className="flex justify-center items-center gap-4 mt-8 sm:mt-12">
              <button
                onClick={handlePrev}
                className="p-2 sm:p-3 rounded-full bg-card  shadow-md  hover:shadow-lg hover:bg-background 900 transition-all"
                aria-label="이전 멘토"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {mentors.length >= 12 ? (
                  // 12명 이상: 슬라이드 페이지 표시
                  Array.from({ length: Math.ceil(mentors.length / 3) }).map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsAutoPlay(false);
                        setCurrentIndex(idx * 3);
                      }}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                        Math.floor(currentIndex / 3) === idx ? "bg-blue-600 w-8 sm:w-10" : "bg-muted-foreground/30"
                      }`}
                      aria-label={`${idx + 1}번째 페이지 보기`}
                    />
                  ))
                ) : (
                  // 12명 미만: 개별 멘토 표시
                  mentors.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setIsAutoPlay(false);
                        setCurrentIndex(idx);
                      }}
                      className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                        idx === currentIndex ? "bg-blue-600 w-8 sm:w-10" : "bg-muted-foreground/30"
                      }`}
                      aria-label={`${idx + 1}번째 멘토 보기`}
                    />
                  ))
                )}
              </div>

              <button
                onClick={handleNext}
                className="p-2 sm:p-3 rounded-full bg-card  shadow-md  hover:shadow-lg hover:bg-background 900 transition-all"
                aria-label="다음 멘토"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>
            </div>
          )}

          {/* Auto-play indicator */}
          {mentors.length > 3 && mentors.length >= 12 && (
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
              {isAutoPlay ? "자동 슬라이드 중..." : "수동 조작 중"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
