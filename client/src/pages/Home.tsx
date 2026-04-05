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

// Quick Entry Icons
const MajorIcon = () => (
  <div className="text-4xl sm:text-5xl">🎓</div>
);

const CareerIcon = () => (
  <div className="text-4xl sm:text-5xl">🚀</div>
);

const LifeIcon = () => (
  <div className="text-4xl sm:text-5xl">🏫</div>
);

// Line Art Icons Component - How It Works Section
const SearchIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">🔍</div>
);

const CalendarIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">📅</div>
);

const ConsultationIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">👨‍👩‍💼</div>
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
            <p className="text-gray-600">프로필 완성 페이지로 이동 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showFooter>
      {/* Hero Section - 강한 가치 제안 */}
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
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-6 sm:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 sm:mb-6" id="main-heading">
                전공 선택, 재학생과 먼저 이야기하세요
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground font-medium mb-6">
                검색과 후기만으로는 알 수 없는 진짜 대학 생활, 지금 바로 경험해보세요
              </p>
            </div>

            {/* Primary CTA */}
            <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-8 sm:mb-10">
              <Link href="/mentors" className="w-full sm:w-auto" aria-label="멘토 찾기 페이지로 이동">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 font-bold shadow-lg hover:shadow-xl transition-shadow">
                  멘토 찾기
                </Button>
              </Link>
              {isAuthenticated && (
                <Link href="/my-profile" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-8 sm:px-10 py-6 sm:py-7 bg-gray-300 hover:bg-gray-400 text-black font-bold shadow-lg hover:shadow-xl transition-shadow">
                    멘토로 참여하기
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* Quick Entry Section - 빠른 진입 */}
      <section id="quick-entry" role="region" className="py-12 sm:py-16 md:py-20 bg-gradient-to-b from-slate-50 to-white" aria-label="빠른 멘토 탐색">
        <div className="container mx-auto px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            어떤 상담이 필요하신가요?
          </h2>
          
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Link href="/mentors?field=major" className="group">
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary/30 cursor-pointer">
                <div className="mb-4 flex justify-center">
                  <MajorIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground group-hover:text-primary transition-colors">
                  전공 탐색
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mt-2">
                  실제 전공 생활과 진로를 알고 싶어요
                </p>
              </div>
            </Link>

            <Link href="/mentors?field=career" className="group">
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary/30 cursor-pointer">
                <div className="mb-4 flex justify-center">
                  <CareerIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground group-hover:text-primary transition-colors">
                  진로 상담
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mt-2">
                  대학에서 어떻게 준비해야 할까요?
                </p>
              </div>
            </Link>

            <Link href="/mentors?field=life" className="group">
              <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 hover:border-primary/30 cursor-pointer">
                <div className="mb-4 flex justify-center">
                  <LifeIcon />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-center text-foreground group-hover:text-primary transition-colors">
                  대학 생활
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground text-center mt-2">
                  캠퍼스 생활과 학교 문화를 알고 싶어요
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section - 실제 흐름 */}
      <section id="how-it-works" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="이용 방법">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground" id="how-heading">
            이용 방법
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { 
                  title: "멘토 찾기", 
                  desc: "대학, 전공, 상담 분야로 필터링하여 나에게 맞는 멘토를 찾으세요",
                  iconComponent: SearchIcon
                },
                { 
                  title: "상담 조율", 
                  desc: "멘토와 메시지로 일정, 장소, 상담 내용을 함께 정하세요",
                  iconComponent: CalendarIcon
                },
                { 
                  title: "대면 상담", 
                  desc: "약속한 시간에 만나 진로, 학업, 대학 생활에 대해 솔직하게 이야기하세요",
                  iconComponent: ConsultationIcon
                }
              ].map(({ title, desc, iconComponent: IconComponent }, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="mb-6 sm:mb-8 flex justify-center">
                    <IconComponent />
                  </div>
                  
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 text-center">
                    {title}
                  </h3>
                  
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-center">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Mentors Section - 중립적 제목 */}
      <section id="featured-mentors" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="멘토 탐색">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground">
            지금 둘러보기 좋은 멘토들
          </h2>
          <FeaturedMentorsSlide />
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="상담 후기">
        <div className="container mx-auto px-4">
          <TestimonialsSection />
        </div>
      </section>

      {/* Popular Q&A Section */}
      <PopularQnASection />

      {/* Zig-Zag USP Section #1: Mentor Verification */}
      <MentorVerificationUSPSection />

      {/* Zig-Zag USP Section #2: Zero Commission */}
      <ZeroCommissionUSPSection />

      {/* FAQ Section */}
      <section id="faq" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="자주 묻는 질문">
        <div className="container mx-auto px-4">
          <IntegratedFAQSection />
        </div>
      </section>
    </PageLayout>
  );
}
