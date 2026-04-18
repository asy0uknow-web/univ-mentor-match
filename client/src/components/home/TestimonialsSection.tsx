import { Star } from "lucide-react";
import { Link } from "wouter";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number;
  category: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "이○○",
    role: "고등학교 3학년",
    category: "전공 탐색",
    content:
      "막막했던 진로가 멘토님 덕분에 명확해졌어요. 데이터과학이 정말 내 적성인지 직접 재학생에게 물어볼 수 있어서 좋았고, 대학 선택까지 실질적인 도움을 받았습니다.",
    rating: 5,
  },
  {
    id: "2",
    name: "박○○ 학부모",
    role: "학부모",
    category: "안전 & 신뢰",
    content:
      "아이가 진로 고민이 많았는데, 실제 대학생 멘토와 상담하면서 훨씬 자신감 있어졌어요. 신원이 검증된 멘토라 믿고 맡길 수 있었고, 상담 후 아이의 방향이 뚜렷해졌습니다.",
    rating: 5,
  },
  {
    id: "3",
    name: "최○○",
    role: "예비 대학생",
    category: "대학 생활",
    content:
      "대학 입학 전 궁금했던 점들을 솔직하게 물어볼 수 있어서 정말 좋았어요. 학과 분위기, 실제 수업 방식, 취업 준비까지 생생한 이야기를 들을 수 있었습니다.",
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-card ">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
            💬 학생과 학부모의 목소리
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            생생한 상담 후기
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            유니브매치를 통해 진로를 찾은 학생들과 자녀의 성장을 지켜본 학부모들의 이야기
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-card rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-border hover:scale-105 hover:-translate-y-2 group"
            >
              <span className="inline-block px-3 py-1 bg-primary/5 text-blue-600 rounded-full text-xs font-semibold mb-4 group-hover:bg-indigo-100 group-hover:text-indigo-700 transition-colors">
                {testimonial.category}
              </span>

              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground/40"
                    }`}
                  />
                ))}
              </div>

              <p className="text-base sm:text-lg text-foreground mb-6 leading-relaxed italic transition-colors">
                "{testimonial.content}"
              </p>

              <div className="border-t border-border pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm sm:text-base">
                      {testimonial.name}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 sm:mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            나에게 맞는 멘토를 직접 찾아보세요
          </p>
          <Link href="/mentors">
            <div className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg cursor-pointer hover:scale-105 active:scale-95">
              멘토 찾기
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};
