import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function Home() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    setPageMeta(PAGE_META.home);
  }, []);

  return (
    <PageLayout showFooter>
      {/* Hero Section with Sacred Geometry */}
      <section className="relative py-12 sm:py-20 md:py-32 overflow-hidden sacred-pattern">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center geometric-circles">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="text-primary">전공 선택</span>은
              <br />
              그저 입시 전략이 아닙니다.
            </h1>
            <p className="subtitle text-base sm:text-lg md:text-xl lg:text-xl mb-6 sm:mb-8 text-muted-foreground leading-relaxed">
              입시 성공과 적성 일치는 다른 문제입니다.
            </p>
            <div className="flex flex-col gap-3 sm:gap-4 justify-center">
              <Link href="/mentors" className="w-full sm:w-auto">
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
            <p className="text-xs sm:text-sm text-muted-foreground mt-6 sm:mt-8">
              실제 재학생만 참여 · 홍보 목적 상담 없음
            </p>
          </div>
        </div>
      </section>

      {/* Problem Definition Section */}
      <section className="py-12 sm:py-20 bg-slate-50 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 sm:p-8 mb-12">
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-8 text-foreground space-y-3">
                <div className="text-black">전공 세분화로 각 전공의 정보는 얕아져갑니다.</div>
                <div className="text-black">전과, 자퇴, 반수는 늘어만갑니다.</div>
              </h2>
              <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground mt-8">
                이제 입시 실패보다 <span className="font-semibold">전공 미스매치의 비용이 더 커졌습니다.</span>
              </p>
            </div>
            
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 sm:mb-8 text-center">
              검색만으론 전공을 알 수 없습니다.
            </h2>
            
            <div className="space-y-8 text-base sm:text-lg leading-relaxed">
              <p className="space-y-3 text-gray-700 font-medium">
                학과 정보는 많지만<br />
                실제 생활 정보는 거의 없습니다.
                <br />
                <br />
                커리큘럼, 분위기, 적성 여부는<br />
                입학 후에야 알게 되고,<br />
                합격 후기와 커뮤니티 글은<br />
                결과 중심이고 편향되어 있습니다.
              </p>
              
              <p className="text-center font-bold text-foreground mt-12 text-2xl sm:text-3xl md:text-4xl">
                <span className="text-primary">유니브매치</span>는<br className="hidden sm:block" />
                이 문제를 해결합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12">
            <span className="text-primary">이용 방법</span>
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
            {[
              { step: 1, title: "멘토 검색", desc: "원하는 대학, 전공, 학년으로 필터링하여 나에게 맞는 멘토를 찾으세요" },
              { step: 2, title: "상담 예약", desc: "멘토의 프로필과 리뷰를 확인하고 원하는 시간에 상담을 예약하세요" },
              { step: 3, title: "1:1 상담", desc: "예약된 시간에 멘토와 만나 진로에 대한 조언을 받으세요" },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex gap-4 sm:gap-6 items-start">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg sm:text-xl">
                  {step}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2">{title}</h3>
                  <p className="text-muted-foreground text-sm sm:text-base md:text-lg">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-primary/10 golden-spiral">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
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
