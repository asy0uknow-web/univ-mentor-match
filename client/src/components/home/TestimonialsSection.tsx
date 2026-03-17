import { Star } from "lucide-react";

interface Testimonial {
  id: string;
  name: string;
  role: string; // "학생" or "학부모"
  content: string;
  rating: number;
  mentor?: string;
  avatar?: string;
}

const TESTIMONIALS: Testimonial[] = [
  {
    id: "1",
    name: "이지은",
    role: "고등학교 3학년",
    content:
      "막막했던 진로가 멘토님 덕분에 명확해졌어요. 데이터과학이 정말 내 적성인지 알 수 있었고, 대학 선택까지 도움을 받았습니다. 정말 감사합니다!",
    rating: 5,
    mentor: "김데이터 멘토",
  },
  {
    id: "2",
    name: "박준호 학부모",
    role: "학부모",
    content:
      "아이가 진로 고민이 많았는데, 유니브매치를 통해 실제 대학생 멘토와 상담하면서 훨씬 자신감 있어졌어요. 안전하고 투명한 서비스라 믿고 맡길 수 있었습니다.",
    rating: 5,
    mentor: "이컴퓨터 멘토",
  },
  {
    id: "3",
    name: "최수현",
    role: "대학교 1학년",
    content:
      "대학 입학 전 궁금했던 점들을 멘토님께 물어볼 수 있어서 정말 좋았어요. 실제 대학 생활, 학과 선택, 취업까지 생생한 조언을 받을 수 있었습니다.",
    rating: 5,
    mentor: "박의학 멘토",
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-16 sm:py-24 md:py-32 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
            💬 학생과 학부모의 목소리
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            생생한 상담 후기
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            유니브매치를 통해 진로를 찾은 학생들과 자녀의 성장을 지켜본 학부모들의 이야기
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.id}
              className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < testimonial.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>

              {/* Content */}
              <p className="text-base sm:text-lg text-foreground mb-6 leading-relaxed italic">
                "{testimonial.content}"
              </p>

              {/* Author Info */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center gap-3 mb-2">
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
                {testimonial.mentor && (
                  <p className="text-xs sm:text-sm text-blue-600 font-medium">
                    {testimonial.mentor}과 상담
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 sm:mt-16">
          <p className="text-lg text-muted-foreground mb-6">
            당신도 유니브매치에서 진로를 찾을 수 있습니다
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-lg hover:shadow-xl transition-all duration-300 text-base sm:text-lg">
            지금 바로 시작하기
          </button>
        </div>
      </div>
    </section>
  );
};
