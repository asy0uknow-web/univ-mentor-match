import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect, useState } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  
  const keywords = [
    "1:1 생기부 컨설팅",
    "솔직한 진로 상담",
    "체계적인 학업 관리",
    "생생한 대학 탐방"
  ];

  useEffect(() => {
    setPageMeta(PAGE_META.home);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentKeywordIndex((prev) => (prev + 1) % keywords.length);
    }, 2500); // 2.5초마다 변경
    
    return () => clearInterval(interval);
  }, []);

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

      {/* Hero Section with Rolling Text and 3D Background */}
      <section 
        id="hero" 
        role="banner"
        className="relative py-12 sm:py-20 md:py-32 overflow-hidden" 
        style={{
          backgroundImage: 'url(https://private-us-east-1.manuscdn.com/sessionFile/uR1NfZVEpEf0Q3jc4GsDIE/sandbox/HQgNygizRsU7v6jgv1nKki-img-1_1770453858000_na1fn_aGVyby1iYWNrZ3JvdW5kLTNk.png?x-oss-process=image/resize,w_1280,h_1280/format,webp/quality,q_70&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdVIxTmZaVkVwRWYwUTNqYzRHc0RJRS9zYW5kYm94L0hRZ055Z2l6UnNVN3Y2amd2MW5La2ktaW1nLTFfMTc3MDQ1Mzg1ODAwMF9uYTFmbl9hR1Z5YnkxaVlXTnJaM0p2ZFc1a0xUTmsucG5nP3gtb3NzLXByb2Nlc3M9aW1hZ2UvcmVzaXplLHdfMTkyMCxoXzE5MjAvZm9ybWF0LHdlYnAvcXVhbGl0eSxxXzgwIiwiQ29uZGl0aW9uIjp7IkRhdGVMZXNzVGhhbiI6eyJBV1M6RXBvY2hUaW1lIjoxNzk4NzYxNjAwfX19XX0_&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=sO6kw0dUp-zvryUggCyzgBFXJ0zwaqCKprze9fFkrNJDUvg43ieyUArao2O16oZOJ2GknpgBKjcO92iOS2GfMn~giNLob92FAq~K8hXM3wcdUmaNCnH0nJtTosQDDphwKH7lUUcmltwVztMTjNdDjQ3MKgRd7TK~n2YGhm48Pvnfjdu1R5NA9Z41XgvaK9oyJOlvwaUHstSkzjWoqU5-uLzpYWYvFxMf4hXSr3Iyo2a32~1IxjixZD~vk3nxTvCQnmb69mGAnuWxa60FJXaZ7MDQMXDajhjWAXDyVoVuqYiGJRIHr4J7K0eydx4j5yLDpjDWaAZTv2GiFUcdBld~8g__)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
        aria-label="히어로 섹션"
      >
        {/* 배경 오버레이 - 텍스트 가독성 향상 */}
        <div className="absolute inset-0 bg-white/60 backdrop-blur-sm"></div>
        
        {/* 콘텐츠 */}
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* 메인 헤드라인 */}
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4" id="main-heading">
                유니브매치에서 시작하는
              </h1>
              
              {/* 롤링 텍스트 */}
              <div className="relative h-12 sm:h-14 md:h-16 lg:h-20 overflow-hidden flex items-center justify-center">
                <div 
                  key={currentKeywordIndex} 
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary keyword-rolling whitespace-nowrap"
                >
                  {keywords[currentKeywordIndex]}
                </div>
              </div>
            </div>

            {/* 서브 헤드라인 */}
            <div className="mb-3 sm:mb-4 space-y-2">
              <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold text-foreground">
                전공 선택은 그저 입시 전략이 아닙니다.
              </h2>
              <p className="subtitle text-base sm:text-lg md:text-xl lg:text-xl text-muted-foreground leading-relaxed">
                입시 성공과 적성 일치는 다른 문제입니다.
              </p>
            </div>

            {/* CTA 버튼 */}
            <div className="flex flex-col gap-3 sm:gap-4 justify-center mb-6 sm:mb-8 mt-4 sm:mt-5">
              <Link href="/mentors" className="w-full sm:w-auto" aria-label="멘토 찾기 페이지로 이동">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 font-bold">
                  전공 선택 전에, 이야기부터 들어보기
                </Button>
              </Link>
              {isAuthenticated && (
                <Link href="/my-profile" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 bg-gray-300 hover:bg-gray-400 text-black font-bold">
                    멘토로 참여하기
                  </Button>
                </Link>
              )}
            </div>

            {/* 하단 텍스트 */}
            <p className="text-xs sm:text-sm text-muted-foreground">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* Problem Definition Section - Redesigned */}
      <section id="service-intro" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="문제 정의">
        <div className="container mx-auto px-4">
          {/* 상단 헤드라인 */}
          <div className="max-w-4xl mx-auto text-center mb-8 sm:mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6" id="service-heading">
              검색만으론 전공을 알 수 없습니다.
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              입시 성공보다 전공 미스매치의 비용이 더 커진 시대, 기존 방식의 한계는 명확합니다.
            </p>
          </div>

          {/* 하단 연결 문구 */}
          <div className="text-center mb-10 sm:mb-14 md:mb-16">
            <p className="text-base sm:text-lg md:text-xl font-semibold text-primary">
              유니브매치는 이 문제를 해결합니다 ↓
            </p>
          </div>

          {/* 3단 그리드 카드 */}
          <div className="max-w-6xl mx-auto mb-12 sm:mb-16 md:mb-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                {
                  icon: "🔍",
                  title: "파편화된 정보",
                  desc: "전공 세분화로 정보는 얇아지고, 실제 생활 정보는 검색으로 찾기 어렵습니다."
                },
                {
                  icon: "⚖️",
                  title: "신뢰하기 힘든 합격담",
                  desc: "커뮤니티의 합격 후기는 결과 중심이고 성공담에만 편향되어 있습니다."
                },
                {
                  icon: "⚠️",
                  title: "늘어나는 미스매치 비용",
                  desc: "입학 후에야 적성을 알게 되어 전과, 자퇴, 반수를 선택하는 비율이 늘고 있습니다."
                }
              ].map((card, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-100"
                >
                  {/* 아이콘 */}
                  <div className="text-4xl sm:text-5xl mb-6 sm:mb-8">
                    {card.icon}
                  </div>
                  
                  {/* 제목 */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4 text-left">
                    {card.title}
                  </h3>
                  
                  {/* 설명 */}
                  <p className="text-sm sm:text-base text-muted-foreground leading-relaxed text-left">
                    {card.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* How It Works - Redesigned */}
      <section id="how-it-works" role="region" className="py-16 sm:py-28 md:py-32" aria-label="이용 방법">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-primary" id="how-heading">
            이용 방법
          </h2>
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
              {[
                { 
                  title: "멘토 검색", 
                  desc: "원하는 대학, 전공, 학년으로 필터링하여 나에게 맞는 멘토를 찾으세요",
                  icon: "🔍"
                },
                { 
                  title: "상담 예약", 
                  desc: "멘토의 프로필과 리뷰를 확인하고 원하는 시간에 상담을 예약하세요",
                  icon: "📅"
                },
                { 
                  title: "1:1 상담", 
                  desc: "예약된 시간에 멘토와 만나 진로에 대한 조언을 받으세요",
                  icon: "💬"
                },
              ].map(({ title, desc, icon }, idx) => (
                <div 
                  key={idx} 
                  className="group relative bg-white rounded-3xl p-8 sm:p-10 transition-all duration-300 hover:shadow-2xl hover:scale-105 cursor-pointer"
                  style={{
                    border: '3px solid transparent',
                    backgroundImage: 'linear-gradient(white, white), linear-gradient(135deg, #0066FF 0%, #00D4FF 100%)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'padding-box, border-box',
                  }}
                >
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="text-6xl sm:text-7xl md:text-8xl mb-8 transform group-hover:scale-110 transition-transform duration-300">
                      {icon}
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

      {/* CTA Section */}
      <section role="region" className="py-12 sm:py-20 bg-primary/10 golden-spiral" aria-label="시작하기">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6" id="cta-heading">
            지금 바로 시작하세요
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
            수많은 고등학생들이 유니브매치를 통해 꿈에 한 걸음 더 다가가고 있습니다
          </p>
          <Link href="/mentors" className="inline-block">
            <Button size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6">
              전공 선택 전에, 이야기부터 들어보기
            </Button>
          </Link>
        </div>
      </section>
    </PageLayout>
  );
}
