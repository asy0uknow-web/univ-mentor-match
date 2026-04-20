import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { MentorVerificationSection } from "@/components/home/MentorVerificationSection";
import { MentorVerificationUSPSection } from "@/components/home/MentorVerificationUSPSection";
import { ZeroCommissionUSPSection } from "@/components/home/ZeroCommissionUSPSection";
import { FeaturedMentorsSlide } from "@/components/home/FeaturedMentorsSlide";
import { TestimonialsSection } from "@/components/home/TestimonialsSection";
import { IntegratedFAQSection } from "@/components/home/IntegratedFAQSection";
import { PopularQnASection } from "@/components/home/PopularQnASection";
import { FeaturedColumnsSection } from "@/components/home/FeaturedColumnsSection";
import { RecommendedMentorsSection } from "@/components/home/RecommendedMentorsSection";
import { BookOpen, Compass, Users } from "lucide-react";


// Quick Entry Icons
const MajorIcon = () => (
  <div className="text-4xl sm:text-5xl text-indigo-600">
    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16" />
  </div>
);

const CareerIcon = () => (
  <div className="text-4xl sm:text-5xl text-indigo-600">
    <Compass className="w-12 h-12 sm:w-16 sm:h-16" />
  </div>
);

const LifeIcon = () => (
  <div className="text-4xl sm:text-5xl text-indigo-600">
    <Users className="w-12 h-12 sm:w-16 sm:h-16" />
  </div>
);

// Line Art Icons Component - How It Works Section
const SearchIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl text-indigo-600">
    <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl text-indigo-600">
    <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

const ConsultationIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl text-indigo-600">
    <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6-4v2m0 0v2m0-2h2m-2 0h-2" />
    </svg>
  </div>
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
    if (loading) return;
    if (isAuthenticated && user && (!user.name || !user.userType)) {
      navigate("/complete-profile", { replace: true });
    }
  }, [isAuthenticated, user, navigate, loading]);

  // 프로필 완성 페이지로 리다이렉트 중이면 로드 표시
  if (!loading && isAuthenticated && user && (!user.name || !user.userType)) {
    return (
      <PageLayout showFooter>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-muted-foreground">프로필 완성 페이지로 이동 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      {/* Hero Section */}
      <section 
        id="hero" 
        role="banner"
        className="relative min-h-[90vh] py-12 sm:py-20 md:py-32 overflow-hidden flex items-center w-screen -mx-[calc((100vw-100%)/2)]" 
        style={{
          backgroundImage: 'url(https://private-us-east-1.manuscdn.com/sessionFile/uR1NfZVEpEf0Q3jc4GsDIE/sandbox/kkhznDCMTxjUcFoZRqsZfJ-img-1_1770798947000_na1fn_aGVyby1iYWNrZ3JvdW5kLTNk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdVIxTmZaVkVwRWYwUTNqYzRHc0RJRS9zYW5kYm94L2traHpuRENNVHhqVWNGb1pScXNaZkotaW1nLTFfMTc3MDc5ODk0NzAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1a0xUTmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aFeQKHn-zVK6XIjFXQxhhEFTn1vqNWucnlz~eIlKiPqETvAsL4cIaXDoktOrt-8rR534D05ak-9sQKXu6X5z7tZuRXuL1jEx4KKwwxN2AAj70o6JB6CN1CaIdH42GSGkVJoWyt8IQSQRN7s5eeF-6WeuwgPuiHt~vIoIL2sVoQo0I0uSQY4Ba6BbQVisIjYYl4yU6tEnmr9hbL3HSKQTS53ijk0t8de-C0PT05SBF8eB1T5np9Jhq7-rr2CuH5kW9CPP2CI3V8f7YZ0JoNmkXQsHWWav7C~YGTXHJr10QRI3qPvB9hbrdT-oyTcbTTRU0tzczPaVhrwIv435DAc3xQ__)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundClip: 'border-box'
        }}
        aria-label="히어로 섹션"
      >
        <div className="absolute inset-0 bg-white/60 dark:bg-black/60 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6" id="main-heading">
                전공 선택, 재학생과 먼저 이야기하세요
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium mb-6">
                검색과 후기만으로는 알 수 없는 진짜 대학 생활, 지금 바로 경험해보세요
              </p>
            </div>

            {/* Primary CTA - 4개 병렬 진입점 */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center mb-8 sm:mb-10 flex-wrap">
              {/* 멘토 찾기 */}
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                onClick={() => navigate('/mentors')}
                aria-label="멘토 찾기 페이지로 이동"
              >
                멘토 찾기
              </Button>
              
              {/* Q&A 커뮤니티 */}
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700"
                onClick={() => navigate('/qna')}
                aria-label="Q&A 커뮤니티로 이동"
              >
                Q&A 커뮤니티
              </Button>
              
              {/* 멘토 칼럼 */}
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-6 text-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground font-semibold shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-slate-200 dark:border-slate-700"
                onClick={() => navigate('/columns')}
                aria-label="멘토 칼럼으로 이동"
              >
                멘토 칼럼
              </Button>
              
              {isAuthenticated && (
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-6 text-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                  onClick={() => navigate('/my-profile')}
                >
                  멘토로 참여하기
                </Button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* Quick Entry Section */}
      <section id="quick-entry" role="region" className="py-12 sm:py-16 md:py-20 bg-white dark:bg-slate-950" aria-label="빠른 멘토 탐색">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            어떤 상담이 필요하신가요?
          </h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div 
              className="group cursor-pointer"
              onClick={() => navigate('/mentors?types=생기부컨설팅,학업관리')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/mentors?types=생기부컨설팅,학업관리')}
              role="button"
              tabIndex={0}
              aria-label="전공 탐색 멘토 찾기"
            >
              <div className="bg-card rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-border hover:border-indigo-300 group-hover:-translate-y-2">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <MajorIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground group-hover:text-indigo-600 transition-colors">
                  전공 탐색
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mt-2">
                  실제 전공 생활과 진로를 알고 싶어요
                </p>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              onClick={() => navigate('/mentors?types=진로상담')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/mentors?types=진로상담')}
              role="button"
              tabIndex={0}
              aria-label="진로 상담 멘토 찾기"
            >
              <div className="bg-card rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-border hover:border-indigo-300 group-hover:-translate-y-2">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <CareerIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground group-hover:text-indigo-600 transition-colors">
                  진로 상담
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mt-2">
                  대학에서 어떻게 준비해야 할까요?
                </p>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              onClick={() => navigate('/mentors?types=대학탐방')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/mentors?types=대학탐방')}
              role="button"
              tabIndex={0}
              aria-label="대학 생활 멘토 찾기"
            >
              <div className="bg-card rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-lg hover:scale-105 transition-all duration-300 border border-border hover:border-indigo-300 group-hover:-translate-y-2">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <LifeIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground group-hover:text-indigo-600 transition-colors">
                  대학 생활
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mt-2">
                  캠퍼스 생활과 학교 문화를 알고 싶어요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" role="region" className="py-16 sm:py-24 md:py-32 bg-white dark:bg-slate-900" aria-label="이용 방법">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-12 sm:mb-16 text-foreground">
            3단계로 시작하세요
          </h2>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <SearchIcon />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">
                1. 멘토 검색
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                대학, 전공, 분야로 원하는 멘토를 찾아보세요
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <CalendarIcon />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">
                2. 상담 신청
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                원하는 날짜와 시간을 선택하여 상담을 신청하세요
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mb-6 flex justify-center">
                <ConsultationIcon />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-foreground">
                3. 상담 진행
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                멘토와 함께 대면으로 상담을 진행하세요
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Verification Section */}
      <MentorVerificationSection />

      {/* USP Sections */}
      <MentorVerificationUSPSection />
      <ZeroCommissionUSPSection />

      {/* Featured Mentors */}
      <FeaturedMentorsSlide />

      {/* Recommended Mentors */}
      <RecommendedMentorsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Popular Q&A */}
      <PopularQnASection />

      {/* Featured Columns */}
      <FeaturedColumnsSection />

      {/* FAQ */}
      <IntegratedFAQSection />
    </PageLayout>
  );
}
