import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedMentor {
  id: string;
  name: string;
  university: string;
  major: string;
  bio: string;
  image?: string;
  rating: number;
  reviewCount: number;
}

// 임시 멘토 데이터
const FEATURED_MENTORS: FeaturedMentor[] = [
  {
    id: "1",
    name: "김데이터",
    university: "서울대학교",
    major: "데이터과학",
    bio: "AI/ML 전공, 데이터 분석 경력 2년",
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: "2",
    name: "이컴퓨터",
    university: "카이스트",
    major: "컴퓨터공학",
    bio: "웹 개발, 스타트업 창업 경험",
    rating: 4.8,
    reviewCount: 38,
  },
  {
    id: "3",
    name: "박의학",
    university: "연세대학교",
    major: "의학",
    bio: "의대 입시 전문, 의료 진로 상담",
    rating: 4.95,
    reviewCount: 52,
  },
  {
    id: "4",
    name: "최경영",
    university: "고려대학교",
    major: "경영학",
    bio: "금융/컨설팅 진로, 인턴십 준비",
    rating: 4.7,
    reviewCount: 31,
  },
];

export const FeaturedMentorsSlide = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);

  // 자동 슬라이드
  useEffect(() => {
    if (!isAutoPlay) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % FEATURED_MENTORS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlay]);

  const handlePrev = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev - 1 + FEATURED_MENTORS.length) % FEATURED_MENTORS.length);
  };

  const handleNext = () => {
    setIsAutoPlay(false);
    setCurrentIndex((prev) => (prev + 1) % FEATURED_MENTORS.length);
  };

  const visibleMentors = [];
  for (let i = 0; i < 3; i++) {
    visibleMentors.push(FEATURED_MENTORS[(currentIndex + i) % FEATURED_MENTORS.length]);
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
            {visibleMentors.map((mentor, idx) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 cursor-pointer"
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

                  <p className="text-sm sm:text-base text-muted-foreground mb-6 line-clamp-2">
                    {mentor.bio}
                  </p>

                  {/* Rating */}
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
                      {mentor.rating}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({mentor.reviewCount}개 후기)
                    </span>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                    프로필 보기
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
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
              {FEATURED_MENTORS.map((_, idx) => (
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

          {/* Auto-play indicator */}
          <p className="text-center text-xs sm:text-sm text-muted-foreground mt-6">
            {isAutoPlay ? "자동 슬라이드 중..." : "수동 조작 중"}
          </p>
        </div>
      </div>
    </section>
  );
};
