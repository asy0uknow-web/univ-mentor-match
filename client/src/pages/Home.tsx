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
import { BookOpen, Compass, Users, ArrowRight } from "lucide-react";


// Quick Entry Icons
const MajorIcon = () => (
  <div className="text-4xl sm:text-5xl text-[var(--brand-primary-700)]">
    <BookOpen className="w-12 h-12 sm:w-16 sm:h-16" />
  </div>
);

const CareerIcon = () => (
  <div className="text-4xl sm:text-5xl text-[var(--brand-primary-700)]">
    <Compass className="w-12 h-12 sm:w-16 sm:h-16" />
  </div>
);

const LifeIcon = () => (
  <div className="text-4xl sm:text-5xl text-[var(--brand-primary-700)]">
    <Users className="w-12 h-12 sm:w-16 sm:h-16" />
  </div>
);

// Line Art Icons Component - How It Works Section
const SearchIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl text-[var(--brand-primary-700)]">
    <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  </div>
);

const CalendarIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl text-[var(--brand-primary-700)]">
    <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  </div>
);

const ConsultationIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl text-[var(--brand-primary-700)]">
    <svg className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.856-1.487M15 10a3 3 0 11-6 0 3 3 0 016 0zM15 20H9m6-4v2m0 0v2m0-2h2m-2 0h-2" />
    </svg>
  </div>
);

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: false });
  const [, navigate] = useLocation();
  
  // 디버그: 인증 상태 로깅
  useEffect(() => {
    console.log('[Home] Auth state:', {
      isAuthenticated,
      loading,
      user: user ? { id: user.id, name: user.name, userType: user.userType } : null,
    });
  }, [isAuthenticated, loading, user]);
  
  // 프로필 완성 상태 조회
  const { data: verificationStatus } = trpc.verification.getProfileVerificationStatus.useQuery(
    undefined,
    { enabled: !!user?.id }
  );

  useEffect(() => {
    setPageMeta(PAGE_META.home);
  }, []);

  // OAuth 로그인 후 프로필 미완성 시 리다이렉트 (비로그인 사용자는 제외)
  useEffect(() => {
    if (loading) return;
    // 비로그인 사용자는 리다이렉트하지 않음 (user.id로 명확히 확인)
    if (!user?.id) {
      console.log('[Home] 비로그인 사용자 - 리다이렉트 안함');
      return;
    }
    // 프로필 미완성 사용자만 리다이렉트
    if (!user.name || !user.userType) {
      console.log('[Home] 프로필 미완성 - 리다이렉트:', { name: user.name, userType: user.userType });
      navigate("/complete-profile", { replace: true });
    }
  }, [user, navigate, loading]);

  // 프로필 완성 페이지로 리다이렉트 중이면 로드 표시 (비로그인 사용자는 제외)
  if (!loading && user?.id && (!user.name || !user.userType)) {
    return (
      <PageLayout showFooter>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary-700)] mx-auto mb-4"></div>
            <p className="text-[var(--color-text-secondary)]">프로필 완성 페이지로 이동 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  // 비로그인 사용자는 홈페이지 정상 렌더링

  return (
    <PageLayout showFooter>
      {/* Hero Section - Premium Design */}
      <section 
        id="hero" 
        role="banner"
        className="relative min-h-[85vh] py-12 sm:py-20 md:py-32 overflow-hidden flex items-center w-screen -mx-[calc((100vw-100%)/2)] bg-gradient-to-br from-background via-background to-muted" 
        style={{
          backgroundImage: 'url(https://private-us-east-1.manuscdn.com/sessionFile/uR1NfZVEpEf0Q3jc4GsDIE/sandbox/kkhznDCMTxjUcFoZRqsZfJ-img-1_1770798947000_na1fn_aGVyby1iYWNrZ3JvdW5kLTNk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdVIxTmZaVkVwRWYwUTNqYzRHc0RJRS9zYW5kYm94L2traHpuRENNVHhqVWNGb1pScXNaZkotaW1nLTFfMTc3MDc5ODk0NzAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1a0xUTmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aFeQKHn-zVK6XIjFXQxhhEFTn1vqNWucnlz~eIlKiPqETvAsL4cIaXDoktOrt-8rR534D05ak-9sQKXu6X5z7tZuRXuL1jEx4KKwwxN2AAj70o6JB6CN1CaIdH42GSGkVJoWyt8IQSQRN7s5eeF-6WeuwgPuiHt~vIoIL2sVoQo0I0uSQY4Ba6BbQVisIjYYl4yU6tEnmr9hbL3HSKQTS53ijk0t8de-C0PT05SBF8eB1T5np9Jhq7-rr2CuH5kW9CPP2CI3V8f7YZ0JoNmkXQsHWWav7C~YGTXHJr10QRI3qPvB9hbrdT-oyTcbTTRU0tzczPaVhrwIv435DAc3xQ__)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundClip: 'border-box'
        }}
        aria-label="히어로 섹션"
      >
        <div className="absolute inset-0 bg-white/70 dark:bg-black/70 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[var(--color-text-primary)] mb-4 sm:mb-6 leading-tight" id="main-heading">
                전공 선택, 재학생과 먼저 이야기하세요
              </h1>
              
              <p className="text-base sm:text-lg md:text-xl text-[var(--color-text-secondary)] font-normal mb-8 leading-relaxed">
                검색과 후기만으로는 알 수 없는 진짜 대학 생활, 지금 바로 경험해보세요
              </p>
            </div>

            {/* Primary CTA - 프리미엄 버튼 스타일 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-10 flex-wrap">
              {/* 멘토 찾기 */}
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] text-white shadow-md hover:shadow-lg transition-all duration-200 rounded-md"
                onClick={() => navigate('/mentors')}
                aria-label="멘토 찾기 페이지로 이동"
              >
                멘토 찾기
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              {/* Q&A 커뮤니티 */}
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-[var(--color-cta-secondary-bg)] hover:bg-[var(--color-cta-secondary-bg-hover)] text-[var(--color-text-primary)] shadow-sm hover:shadow-md transition-all duration-200 border border-[var(--color-border-default)] rounded-md"
                onClick={() => navigate('/qna')}
                aria-label="Q&A 커뮤니티로 이동"
              >
                Q&A 커뮤니티
              </Button>
              
              {/* 칼럼 스튜디오 */}
              <Button 
                size="lg" 
                className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-[var(--color-cta-secondary-bg)] hover:bg-[var(--color-cta-secondary-bg-hover)] text-[var(--color-text-primary)] shadow-sm hover:shadow-md transition-all duration-200 border border-[var(--color-border-default)] rounded-md"
                onClick={() => navigate('/columns')}
                aria-label="칼럼 스튜디오으로 이동"
              >
                칼럼 스튜디오
              </Button>
              
              {isAuthenticated && (
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto px-8 py-3 text-base font-semibold bg-[var(--brand-accent-50)] hover:bg-[var(--brand-accent-50)]/90 text-[var(--brand-accent-700)] shadow-md hover:shadow-lg transition-all duration-200 rounded-md"
                  onClick={() => navigate('/my-profile')}
                >
                  멘토로 참여하기
                </Button>
              )}
            </div>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] font-medium">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* Quick Entry Section - 프리미엄 카드 디자인 */}
      <section id="quick-entry" role="region" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950" aria-label="빠른 멘토 탐색">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--color-text-primary)]">
            어떤 상담이 필요하신가요?
          </h2>
          <p className="text-center text-[var(--color-text-secondary)] mb-12 sm:mb-16 max-w-2xl mx-auto">
            당신의 필요에 맞는 멘토를 찾아보세요
          </p>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div 
              className="group cursor-pointer"
              onClick={() => navigate('/mentors?types=생기부컨설팅,학업관리')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/mentors?types=생기부컨설팅,학업관리')}
              role="button"
              tabIndex={0}
              aria-label="전공 탐색 멘토 찾기"
            >
              <div className="bg-[var(--color-background-card)] p-8 border border-[var(--color-border-default)] rounded-xl hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <MajorIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-[var(--color-text-primary)] group-hover:text-[var(--brand-primary-700)] transition-colors">
                  전공 탐색
                </h3>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mt-3">
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
              <div className="bg-[var(--color-background-card)] p-8 border border-[var(--color-border-default)] rounded-xl hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <CareerIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-[var(--color-text-primary)] group-hover:text-[var(--brand-primary-700)] transition-colors">
                  진로 상담
                </h3>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mt-3">
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
              <div className="bg-[var(--color-background-card)] p-8 border border-[var(--color-border-default)] rounded-xl hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <LifeIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-[var(--color-text-primary)] group-hover:text-[var(--brand-primary-700)] transition-colors">
                  대학 생활
                </h3>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mt-3">
                  캠퍼스 생활과 학교 문화를 알고 싶어요
                </p>
              </div>
            </div>

            <div 
              className="group cursor-pointer"
              onClick={() => navigate('/mentors?types=입시전략')}
              onKeyDown={(e) => e.key === 'Enter' && navigate('/mentors?types=입시전략')}
              role="button"
              tabIndex={0}
              aria-label="입시 전략 멘토 찾기"
            >
              <div className="bg-[var(--color-background-card)] p-8 border border-[var(--color-border-default)] rounded-xl hover:shadow-lg transition-all duration-300 group-hover:-translate-y-1">
                <div className="mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-10 h-10 sm:w-12 sm:h-12 text-[var(--brand-primary-600)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-[var(--color-text-primary)] group-hover:text-[var(--brand-primary-700)] transition-colors">
                  입시 전략
                </h3>
                <p className="text-sm sm:text-base text-[var(--color-text-secondary)] text-center mt-3">
                  효과적인 입시 준비 방법을 배우고 싶어요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section - 프리미엄 스텝 디자인 */}
      <section id="how-it-works" role="region" className="py-16 sm:py-20 md:py-24 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-950" aria-label="이용 방법">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4 text-[var(--color-text-primary)]">
            이용 방법
          </h2>
          <p className="text-center text-[var(--color-text-secondary)] mb-12 sm:mb-16 max-w-2xl mx-auto">
            간단한 3단계로 멘토와 연결되세요
          </p>

          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-[var(--color-background-card)] p-8 text-center border border-[var(--color-border-default)] rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--brand-primary-700)] text-white font-bold mb-4">
                  1
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">멘토 찾기</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  대학, 전공, 상담 분야로 필터링하여 나에게 맞는 멘토를 찾으세요
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[var(--color-border-default)]"></div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-[var(--color-background-card)] p-8 text-center border border-[var(--color-border-default)] rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--brand-primary-700)] text-white font-bold mb-4">
                  2
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">상담 신청</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  멘토와 메시지로 일정, 장소, 상담 내용을 함께 정하세요
                </p>
              </div>
              {/* Connector line */}
              <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-[var(--color-border-default)]"></div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="bg-[var(--color-background-card)] p-8 text-center border border-[var(--color-border-default)] rounded-xl">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[var(--brand-primary-700)] text-white font-bold mb-4">
                  3
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-3">대면 상담</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  약속한 시간에 만나 진로, 학업, 대학 생활에 대해 솔직하게 이야기하세요
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mentor Verification Section */}
      <MentorVerificationUSPSection />

      {/* Zero Commission Section */}
      <ZeroCommissionUSPSection />

      {/* Recommended Mentors Section */}
      <RecommendedMentorsSection />

      {/* Featured Mentors Slide */}
      <FeaturedMentorsSlide />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Section */}
      <IntegratedFAQSection />
    </PageLayout>
  );
}
