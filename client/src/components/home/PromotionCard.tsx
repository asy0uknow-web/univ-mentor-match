import { Sparkles, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

/**
 * 프로모션 카드 컴포넌트
 * - 멘토 리스트 4번째 위치에 삽입
 * - 배경 그라데이션과 브랜드 배지로 눈에 띄게 표시
 * - 클릭 시 멘토 찾기 페이지로 이동
 */
export const PromotionCard = ({ height }: { height: number }) => {
  const [, setLocation] = useLocation();

  const handleClick = () => {
    setLocation("/mentors");
  };

  return (
    <div
      className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-105 hover:-translate-y-2 cursor-pointer flex flex-col h-full group relative"
      style={{ height: `${height}px` }}
      onClick={handleClick}
    >
      {/* 배경 오버레이 */}
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />

      {/* 데코레이션 요소 */}
      <div className="absolute top-4 right-4 w-16 h-16 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all" />
      <div className="absolute bottom-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-xl group-hover:blur-2xl transition-all" />

      {/* 콘텐츠 */}
      <div className="relative p-4 sm:p-6 md:p-8 flex flex-col flex-grow justify-center items-center text-center z-10">
        {/* 배지 */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-4 group-hover:bg-white/30 transition-colors">
          <Sparkles className="w-4 h-4 text-white" />
          <span className="text-sm font-semibold text-white">특별 추천</span>
        </div>

        {/* 제목 */}
        <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 group-hover:scale-110 transition-transform">
          당신의 멘토를
          <br />
          찾아보세요
        </h3>

        {/* 설명 */}
        <p className="text-sm sm:text-base text-white/90 mb-6 max-w-xs">
          검증된 대학생 멘토와 함께
          <br />
          진로를 설계하세요
        </p>

        {/* CTA 버튼 */}
        <button
          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-white/90 transition-all duration-300 group-hover:gap-3"
          onClick={handleClick}
        >
          <span>멘토 찾기</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* 하단 장식 */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent" />
    </div>
  );
};
