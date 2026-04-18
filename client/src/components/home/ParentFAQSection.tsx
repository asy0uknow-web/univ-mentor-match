import { useState } from "react";

// 학부모 FAQ 섹션 컴포넌트
export const ParentFAQSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "상담료는 얼마인가요?",
      answer: "상담료는 멘토마다 다르며, 각 멘토의 프로필 페이지에서 확인할 수 있습니다. 멘토가 직접 상담 유형별 가격을 설정하며, 유니브매치는 별도의 중개 수수료를 받지 않습니다."
    },
    {
      question: "환불은 어떻게 되나요?",
      answer: "상담 예약 후 24시간 이내에 취소하면 100% 환불됩니다. 24시간 이후 취소는 50% 환불되며, 상담 시작 후 취소는 환불이 불가능합니다."
    },
    {
      question: "멘토는 정말 대학생인가요?",
      answer: "네, 모든 멘토는 유효한 학생증을 제출하여 신원을 검증받습니다. 검증된 멘토만 플랫폼에서 활동할 수 있습니다."
    },
    {
      question: "개인정보는 안전한가요?",
      answer: "네, 모든 개인정보는 암호화되어 안전하게 보관됩니다. 개인정보는 상담 진행에만 사용되며, 제3자와 공유되지 않습니다."
    },
    {
      question: "상담 후 만족하지 않으면 어떻게 되나요?",
      answer: "상담 후 만족하지 않으면 고객센터에 문의하세요. 상담 내용을 검토한 후 환불 또는 다른 멘토와의 재상담을 제안해드립니다."
    },
    {
      question: "성적 향상을 보장하나요?",
      answer: "성적 향상은 학생의 노력과 실천이 가장 중요합니다. 우리의 멘토들은 진로 선택, 학습 방법, 대학 정보 등을 제공하여 학생이 올바른 결정을 내릴 수 있도록 돕습니다."
    }
  ];

  return (
    <section id="parent-faq" role="region" className="py-16 sm:py-24 md:py-32 bg-muted/30" aria-label="학부모 FAQ">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            자주 묻는 질문 (FAQ)
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            학부모님들이 자주 묻는 질문과 답변입니다.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-card  rounded-xl border border-border 700 700 shadow-sm hover:shadow-md  transition-shadow duration-300"
              >
                {/* Question */}
                <button
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-background 900 transition-colors"
                  aria-expanded={expandedIndex === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <h3 className="text-base sm:text-lg font-semibold text-foreground pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 ${
                        expandedIndex === idx ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </button>

                {/* Answer */}
                {expandedIndex === idx && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-6 sm:px-8 py-4 sm:py-5 bg-background 900 border-t border-border 700 700"
                  >
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* More Questions */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              더 궁금한 점이 있으신가요?
            </p>
            <a href="mailto:support@univmatch.com" className="text-primary font-semibold hover:underline">
              고객센터에 문의하기 →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
