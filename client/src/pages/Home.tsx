import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { trpc } from "@/lib/trpc";

// Line Art Icons Component - How It Works Section
const SearchIcon = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 48 48" fill="none" stroke="#2E4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="20" cy="20" r="12" />
    <path d="M32 32L42 42" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 48 48" fill="none" stroke="#2E4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="8" y="10" width="32" height="28" rx="2" />
    <path d="M16 6v8M32 6v8" />
    <path d="M8 18h32" />
    <circle cx="16" cy="28" r="1.5" fill="#2E4A33" />
    <circle cx="28" cy="28" r="1.5" fill="#2E4A33" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 48 48" fill="none" stroke="#2E4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 12C8 10.9 8.9 10 10 10h28c1.1 0 2 0.9 2 2v20c0 1.1-0.9 2-2 2H12l-4 4v-4H10c-1.1 0-2-0.9-2-2V12Z" />
  </svg>
);

// Line Art Icons Component - Service Intro Section
const InfoIcon = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 48 48" fill="none" stroke="#2E4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="18" />
    <path d="M24 16v8" />
    <circle cx="24" cy="34" r="1" fill="#2E4A33" />
  </svg>
);

const TrustIcon = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 48 48" fill="none" stroke="#2E4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M24 4L8 12v12c0 8 16 14 16 14s16-6 16-14V12L24 4Z" />
    <path d="M16 24l6 6 10-10" />
  </svg>
);

const CostIcon = () => (
  <svg className="w-16 h-16 sm:w-20 sm:h-20" viewBox="0 0 48 48" fill="none" stroke="#2E4A33" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="24" cy="24" r="16" />
    <path d="M24 16v16" />
    <path d="M20 20h8" />
    <path d="M20 28h8" />
  </svg>
);

// Organic Blob Background Component
const BlobBackground = ({ idx }: { idx: number }) => (
  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 120 120" preserveAspectRatio="xMidYMid meet">
    <defs>
      <filter id={`blob-blur-${idx}`}>
        <feGaussianBlur in="SourceGraphic" stdDeviation="2" />
      </filter>
    </defs>
    <path d="M60,20 Q90,20 100,50 Q110,80 80,100 Q50,110 30,90 Q10,70 20,40 Q30,15 60,20 Z" fill="#E0E8D9" opacity="0.6" filter={`url(#blob-blur-${idx})`} />
  </svg>
);

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const meQuery = trpc.auth.me.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });
  
  const keywords = [
    "1:1 생기부 컨설팅",
    "솔직한 진로 상담",
    "체계적인 학업 관리",
    "생생한 대학 탐방"
  ];

  // 프로필 완성 상태 조회
  const { data: verificationStatus } = trpc.verification.getProfileVerificationStatus.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  useEffect(() => {
    setPageMeta(PAGE_META.home);
  }, []);

  // OAuth 로그인 후 프로필 미완성 시 리다이렉트
  useEffect(() => {
    // 로딩 중이면 대기
    if (loading || meQuery.isLoading) {
      return;
    }
    
    // 인증됨 + 실명 없음 → 프로필 완성 페이지로 이동
    if (isAuthenticated && user && !user.realName) {
      navigate("/complete-profile", { replace: true });
    }
  }, [isAuthenticated, user, loading, meQuery.isLoading, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [keywords.length]);

  return (
    <PageLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen bg-gradient-to-b from-blue-50 via-white to-white flex items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 opacity-20">
          <BlobBackground idx={1} />
        </div>
        <div className="absolute bottom-0 right-0 w-96 h-96 opacity-20">
          <BlobBackground idx={2} />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            입시는 합격으로 끝이 아닙니다.
            <br />
            <span className="text-primary">전공 선택이 시작입니다.</span>
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            정보 과잉 vs 경험 부재. 당신은 어느 쪽인가요?
            <br />
            실제 대학생 멘토들과 1:1로 이야기하고 전공을 선택하세요.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            {isAuthenticated ? (
              <Link href="/mentors">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg">
                  전공 선택 전에, 이야기부터 들어보기
                </Button>
              </Link>
            ) : (
              <Link href="/api/oauth/login">
                <Button className="w-full sm:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-3 text-lg">
                  전공 선택 전에, 이야기부터 들어보기
                </Button>
              </Link>
            )}
            <Link href="/api/oauth/login">
              <Button variant="outline" className="w-full sm:w-auto border-primary text-primary hover:bg-blue-50 px-8 py-3 text-lg">
                멘토로 참여하기
              </Button>
            </Link>
          </div>

          <p className="text-xs sm:text-sm text-gray-500">
            실제 재학생만 참여 · 홍보 목적 상담 없음
          </p>
        </div>
      </section>

      {/* Problem Definition Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Text */}
            <div className="flex flex-col justify-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                전공 세분화로 각 전공의 정보는 얕아져갑니다.
              </h2>
              <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                전과, 자퇴, 반수는 늘어만갑니다.
              </p>
              <p className="text-base sm:text-lg text-gray-700 font-semibold leading-relaxed">
                이제 입시 실패보다 전공 미스매치의 비용이 더 커졌습니다.
              </p>
            </div>

            {/* Right Column - Problem Box */}
            <div className="flex items-center justify-center">
              <div className="w-full bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 sm:p-10 border border-blue-200">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6 text-center">
                  검색만으론 <span className="text-primary">전공을 알 수 없습니다</span>
                </h3>
                <ul className="space-y-4 text-gray-700 text-sm sm:text-base">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>대학 홈페이지는 좋은 것만 보여줍니다</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>유튜브 후기는 극단적입니다</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold mt-1">•</span>
                    <span>선배는 자신의 경험만 말합니다</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section aria-label="이용 방법" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
            어떻게 이용하나요?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={3} />
              </div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-6">
                  <SearchIcon />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  1. 멘토 찾기
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  관심 있는 대학과 전공의 멘토를 찾아보세요
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={4} />
              </div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-6">
                  <CalendarIcon />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  2. 상담 신청
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  원하는 상담 종류와 시간을 선택하세요
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={5} />
              </div>
              <div className="relative z-10 text-center">
                <div className="flex justify-center mb-6">
                  <ChatIcon />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                  3. 1:1 상담
                </h3>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  멘토와 메시지로 상담하고 질문하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Intro Section */}
      <section aria-label="서비스 소개" className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-12 sm:mb-16">
            UnivMatch의 특징
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Feature 1 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={6} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <InfoIcon />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    정보의 신뢰성
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed ml-20">
                  실제 대학에 재학 중인 학생들만 멘토로 참여합니다
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={7} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <TrustIcon />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    투명한 검증
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed ml-20">
                  모든 멘토는 학생증 인증을 통해 검증됩니다
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={8} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <CostIcon />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    합리적인 가격
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed ml-20">
                  멘토와 학생이 직접 협의하여 결정합니다
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="relative">
              <div className="absolute inset-0 w-full h-full opacity-30">
                <BlobBackground idx={9} />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <ChatIcon />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                    편리한 소통
                  </h3>
                </div>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed ml-20">
                  메시지를 통해 언제든 편하게 소통할 수 있습니다
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">
            지금 바로 시작하세요
          </h2>
          <p className="text-base sm:text-lg mb-8 opacity-90">
            당신의 전공 선택, 더 이상 혼자가 아닙니다
          </p>
          {isAuthenticated ? (
            <Link href="/mentors">
              <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                멘토 찾아보기
              </Button>
            </Link>
          ) : (
            <Link href="/api/oauth/login">
              <Button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                시작하기
              </Button>
            </Link>
          )}
        </div>
      </section>
    </PageLayout>
  );
}
