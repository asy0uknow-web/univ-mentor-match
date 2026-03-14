import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

// Line Art Icons Component - How It Works Section
const SearchIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">🔍</div>
);

const CalendarIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">📅</div>
);

const ChatIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">👥</div>
);

// Line Art Icons Component - Service Intro Section
const InfoIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">🧩</div>
);

const TrustIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">⚠️</div>
);

const CostIcon = () => (
  <div className="text-5xl sm:text-6xl md:text-7xl">💸</div>
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
  const { user, isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  
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
    if (isAuthenticated && user && !user.name) {
      // 실명이 없으면 프로필 완성 페이지로 이동
      navigate("/complete-profile", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 2500);
    
    return () => clearInterval(interval);
  }, [keywords.length]);

  // 프로필 완성 페이지로 리다이렉트 중이면 로드 표시
  if (isAuthenticated && user && !user.name) {
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
      <style>{`
        @keyframes slideUpIn {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .keyword-rolling {
          animation: slideUpIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>

      {/* Hero Section with Organic Blobs */}
      <section 
        id="hero" 
        role="banner"
        className="relative min-h-screen py-12 sm:py-20 md:py-32 overflow-hidden flex items-center w-screen -mx-[calc((100vw-100%)/2)]" 
        style={{
          backgroundImage: 'url(https://private-us-east-1.manuscdn.com/sessionFile/uR1NfZVEpEf0Q3jc4GsDIE/sandbox/kkhznDCMTxjUcFoZRqsZfJ-img-1_1770798947000_na1fn_aGVyby1iYWNrZ3JvdW5kLTNk.png?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdVIxTmZaVkVwRWYwUTNqYzRHc0RJRS9zYW5kYm94L2traHpuRENNVHhqVWNGb1pScXNaZkotaW1nLTFfMTc3MDc5ODk0NzAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1a0xUTmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=aFeQKHn-zVK6XIjFXQxhhEFTn1vqNWucnlz~eIlKiPqETvAsL4cIaXDoktOrt-8rR534D05ak-9sQKXu6X5z7tZuRXuL1jEx4KKwwxN2AAj70o6JB6CN1CaIdH42GSGkVJoWyt8IQSQRN7s5eeF-6WeuwgPuiHt~vIoIL2sVoQo0I0uSQY4Ba6BbQVisIjYYl4yU6tEnmr9hbL3HSKQTS53ijk0t8de-C0PT05SBF8eB1T5np9Jhq7-rr2CuH5kW9CPP2CI3V8f7YZ0JoNmkXQsHWWav7C~YGTXHJr10QRI3qPvB9hbrdT-oyTcbTTRU0tzczPaVhrwIv435DAc3xQ__)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundClip: 'border-box'
        }}
        aria-label="히어로 섹션"
      >
        {/* 배경 오버레이 - 텍스트 가독성 향상 */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
        
        {/* Content */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Main Headline */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4" id="main-heading">
                유니브매치에서 시작하는
              </h1>
              
              {/* Rolling Text */}
              <div className="relative h-12 sm:h-14 md:h-16 lg:h-20 overflow-hidden flex items-center justify-center">
                <div 
                  key={currentKeywordIndex} 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary keyword-rolling whitespace-nowrap"
                >
                  {keywords[currentKeywordIndex]}
                </div>
              </div>
            </div>

            {/* Sub Headline */}
            <div className="mb-3 sm:mb-4 space-y-2">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
                전공 선택은 그저 입시 전략이 아닙니다.
              </h2>
              <p className="subtitle text-base sm:text-lg md:text-xl lg:text-xl text-muted-foreground leading-relaxed">
                입시 성공과 적성 일치는 다른 문제입니다.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 mt-4 sm:mt-5">
              <Link href="/mentors" className="w-full sm:w-auto" aria-label="멘토 찾기 페이지로 이동">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-bold shadow-lg hover:shadow-xl transition-shadow">
                  전공 선택 전에, 이야기부터 들어보기
                </Button>
              </Link>
              {isAuthenticated && (
                <Link href="/my-profile" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gray-300 hover:bg-gray-400 text-black font-bold shadow-lg hover:shadow-xl transition-shadow">
                    멘토로 참여하기
                  </Button>
                </Link>
              )}
            </div>

            {/* Footer Text */}
            <p className="text-xs sm:text-sm text-muted-foreground">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* Problem Definition Section */}
      <section id="service-intro" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="문제 정의">
        <div className="container mx-auto px-4">
          {/* Top Headline */}
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6" id="service-heading">
              검색만으론 전공을 알 수 없습니다.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              입시 성공보다 전공 미스매치의 비용이 더 커진 시대, 기존 방식의 한계는 명확합니다.
            </p>
          </div>

          {/* Connection Text */}
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-primary">
              유니브매치는 이 문제를 해결합니다 ↓
            </p>
          </div>

          {/* 3 Column Grid Cards */}
          <div className="max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  iconComponent: InfoIcon,
                  title: "파편화된 정보",
                  desc: "전공 세분화로 정보는 얇아지고, 실제 생활 정보는 검색으로 찾기 어렵습니다."
                },
                {
                  iconComponent: TrustIcon,
                  title: "신뢰하기 힘든 합격담",
                  desc: "커뮤니티의 합격 후기는 결과 중심이고 성공담에만 편향되어 있습니다."
                },
                {
                  iconComponent: CostIcon,
                  title: "늘어나는 미스매치 비용",
                  desc: "입학 후에야 적성을 알게 되어 전과, 자퇴, 반수를 선택하는 비율이 늘고 있습니다."
                }
              ].map(({ iconComponent: IconComponent, title, desc }, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  {/* Icon with Blob Background */}
                  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-6 sm:mb-8 flex items-center justify-center">
                    <BlobBackground idx={idx + 100} />
                    <div className="relative z-10">
                      <IconComponent />
                    </div>
                  </div>
                  
                  {/* Title */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 text-left">
                    {title}
                  </h3>
                  
                  {/* Description */}
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" role="region" className="py-16 sm:py-28 md:py-32 bg-white" aria-label="이용 방법">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground" id="how-heading">
            이용 방법
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { 
                  title: "멘토 검색", 
                  desc: "원하는 대학, 전공, 학년으로 필터링하여 나에게 맞는 멘토를 찾으세요",
                  iconComponent: SearchIcon
                },
                { 
                  title: "상담 예약", 
                  desc: "멘토의 프로필과 리뷰를 확인하고 원하는 시간에 상담을 예약하세요",
                  iconComponent: CalendarIcon
                },
                { 
                  title: "1:1 상담", 
                  desc: "예약된 시간에 1:1 상담으로 진로에 대한 조언을 받으세요",                  iconComponent: ChatIcon
                },
              ].map(({ title, desc, iconComponent: IconComponent }, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-3xl p-8 sm:p-10 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer"
                >
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    {/* Icon with Blob Background */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-8 flex items-center justify-center">
                      <BlobBackground idx={idx} />
                      <div className="relative z-10">
                        <IconComponent />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl sm:text-3xl font-bold mb-6 text-foreground">
                      {title}
                    </h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Blobs */}
      <section role="region" className="relative py-12 sm:py-20 bg-white overflow-hidden" aria-label="시작하기">
        {/* Organic Blobs Background */}
        <div className="organic-blob blob-1" style={{ bottom: '-100px', left: '-100px', opacity: 0.06 }}></div>
        <div className="organic-blob blob-2" style={{ bottom: '50px', right: '-50px', opacity: 0.06 }}></div>
        
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-foreground" id="cta-heading">
            지금 바로 시작하세요
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            수많은 고등학생들이 유니브매치를 통해 꿈에 한 걸음 더 다가가고 있습니다
          </p>
          <a href={getLoginUrl()} className="inline-block">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 shadow-lg hover:shadow-xl transition-shadow">
              유니브매치 로그인
            </Button>
          </a>
        </div>
      </section>
    </PageLayout>
  );
}
