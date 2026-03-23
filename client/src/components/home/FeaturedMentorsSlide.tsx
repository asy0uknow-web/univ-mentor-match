import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Cpu, Microscope, Briefcase, BookOpen, GraduationCap, Lightbulb, Stethoscope } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

interface FeaturedMentor {
  id: number;
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
    { staleTime: 1000 * 60 * 5 } // 5분 캐시
  );

   const mentors: FeaturedMentor[] = (mentorsData || []).map((mentor: any) => ({
    id: mentor.id,
    name: mentor.name || "멘토",
    university: mentor.university || "대학명 미등록",
    major: mentor.major || "전공 미등록",
    bio: mentor.bio || "자기소개 미등록",
    field: mentor.field,
    rating: mentor.averageRating ? parseFloat(mentor.averageRating.toString()) : 0,
    reviewCount: mentor.reviewCount || 0,
  }));

  // 모든 멘토 데이터 로드 후 최대 높이 계산
  useEffect(() => {
    if (mentors.length === 0) return;
    // 최대 높이 설정: 이미지(h-48 sm:h-56) + 정보 영역 + 여백
    // 소개글이 3줄(line-clamp-3) + 배지 + 버튼
    const estimatedHeight = 224 + 200; // 약 424px (h-48 = 192px + 정보 영역 약 200px)
    setMaxCardHeight(estimatedHeight);
  }, [mentors.length]);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlay || mentors.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mentors.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay, mentors.length]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + mentors.length) % mentors.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % mentors.length);
  };

  const visibleMentors = [];
  for (let i = 0; i < Math.min(3, mentors.length); i++) {
    visibleMentors.push(mentors[(currentIndex + i) % mentors.length]);
  }

  // 로딩 상태
  if (isLoading) {
    return (
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
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
      <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
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
    <section className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {visibleMentors.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer flex flex-col h-full"
              >
                {/* Mentor Image Placeholder */}
                <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-5xl font-bold">
                  {mentor.name.charAt(0)}
                </div>

                {/* Mentor Info */}
                <div className="p-6 sm:p-8">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
                    {mentor.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-1">
                    {mentor.university}
                  </p>
                  <p className="text-sm font-semibold text-blue-600 mb-4">
                    {mentor.major}
                  </p>

                  {/* Professional Field Badge */}
                  {mentor.field && (
                    <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-blue-50 rounded-lg w-fit">
                      <span className="text-blue-600">{getFieldIcon(mentor.field)}</span>
                      <span className="text-xs sm:text-sm font-medium text-blue-700">
                        {getFieldLabel(mentor.field)}
                      </span>
                    </div>
                  )}

                  <p className="text-sm sm:text-base text-muted-foreground mb-6 line-clamp-3" style={{ minHeight: '4rem' }}>
                    {mentor.bio}
                  </p>

                  {/* Rating or New Mentor Badge */}
                  {mentor.reviewCount === 0 ? (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 shadow-sm mb-4">
                      <span className="text-xs font-bold tracking-wider text-emerald-700 uppercase">New</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 mb-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-lg ${
                              i < Math.floor(mentor.rating)
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {mentor.rating.toFixed(1)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ({mentor.reviewCount}개 후기)
                      </span>
                    </div>
                  )}

                  {/* CTA Button */}
                  <button
                    onClick={() => setLocation(`/mentor/${mentor.id}`)}
                    className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors mt-auto"
                  >
                    프로필 보기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {mentors.length > 3 && (
            <div className="flex justify-center items-center gap-4 mt-8 sm:mt-12">
              <button
                onClick={handlePrev}
                className="p-2 sm:p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
                aria-label="이전 멘토"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>

              {/* Dots Indicator */}
              <div className="flex gap-2">
                {mentors.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setIsAutoPlay(false);
                      setCurrentIndex(idx);
                    }}
                    className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all ${
                      idx === currentIndex ? "bg-blue-600 w-8 sm:w-10" : "bg-gray-300"
                    }`}
                    aria-label={`${idx + 1}번째 멘토 보기`}
                  />
                ))}
              </div>

              <button
                onClick={handleNext}
                className="p-2 sm:p-3 rounded-full bg-white shadow-md hover:shadow-lg hover:bg-gray-50 transition-all"
                aria-label="다음 멘토"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              </button>
            </div>
          )}

          {/* Auto-play indicator */}
          {mentors.length > 3 && (
            <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
              {isAutoPlay ? "자동 슬라이드 중..." : "수동 조작 중"}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};
