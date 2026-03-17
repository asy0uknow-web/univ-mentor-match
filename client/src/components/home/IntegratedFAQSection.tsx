import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
  category: "cost" | "safety" | "verification" | "general";
}

const FAQ_ITEMS: FAQItem[] = [
  // 비용 관련
  {
    question: "상담료는 얼마인가요?",
    answer:
      "상담 종류와 시간에 따라 다릅니다. 생기부 컨설팅은 시간당 50,000원, 진로상담은 30,000원, 학업관리는 40,000원, 대학탐방은 50,000원입니다. 첫 상담은 30분 무료 상담으로 시작할 수 있습니다.",
    category: "cost",
  },
  {
    question: "환불은 어떻게 되나요?",
    answer:
      "상담 예약 후 24시간 이내에 취소하면 100% 환불됩니다. 24시간 이후 취소는 50% 환불되며, 상담 시작 후 취소는 환불이 불가능합니다.",
    category: "cost",
  },

  // 검증 관련
  {
    question: "멘토는 정말 대학생인가요?",
    answer:
      "네, 모든 멘토는 유효한 학생증을 제출하여 신원을 검증받습니다. 검증된 멘토만 플랫폼에서 활동할 수 있으며, 정기적으로 재검증을 진행합니다.",
    category: "verification",
  },

  // 안전 관련
  {
    question: "개인정보는 안전한가요?",
    answer:
      "네, 모든 개인정보는 암호화되어 안전하게 보관됩니다. 개인정보는 상담 진행에만 사용되며, 제3자와 공유되지 않습니다. 주민등록번호, 계좌 정보 등 민감한 개인정보는 절대 공유하지 마세요.",
    category: "safety",
  },
  {
    question: "상담 중 문제가 발생하면 어떻게 되나요?",
    answer:
      "부적절한 행동이나 문제가 발생하면 즉시 고객센터에 신고할 수 있습니다. 온라인 상담은 안전한 플랫폼을 통해서만 진행되며, 오프라인 상담은 공공장소에서 진행하세요. 모든 결제는 안전한 결제 시스템을 통해 진행되며, 직거래는 절대 금지입니다.",
    category: "safety",
  },

  // 일반 질문
  {
    question: "상담 후 만족하지 않으면 어떻게 되나요?",
    answer:
      "상담 후 만족하지 않으면 고객센터에 문의하세요. 상담 내용을 검토한 후 환불 또는 다른 멘토와의 재상담을 제안해드립니다.",
    category: "general",
  },
  {
    question: "성적 향상을 보장하나요?",
    answer:
      "성적 향상은 학생의 노력과 실천이 가장 중요합니다. 우리의 멘토들은 진로 선택, 학습 방법, 대학 정보 등을 제공하여 학생이 올바른 결정을 내릴 수 있도록 돕습니다.",
    category: "general",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  cost: "💰 비용",
  safety: "🛡️ 안전",
  verification: "✅ 검증",
  general: "❓ 일반",
};

export const IntegratedFAQSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFAQs = selectedCategory
    ? FAQ_ITEMS.filter((item) => item.category === selectedCategory)
    : FAQ_ITEMS;

  const categories = ["cost", "safety", "verification", "general"];

  return (
    <section
      id="faq-safety"
      role="region"
      className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-gray-50 to-white"
      aria-label="FAQ 및 안전 가이드"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
            🛡️ 안전하고 투명한 서비스
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
            자주 묻는 질문 & 안전 가이드
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            학부모님과 학생들이 궁금해하는 모든 것을 답변해드립니다.
          </p>
        </div>

        {/* Category Filter */}
        <div className="max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full font-semibold transition-all ${
                selectedCategory === null
                  ? "bg-blue-600 text-white shadow-lg"
                  : "bg-white text-foreground border border-gray-300 hover:border-blue-600"
              }`}
            >
              전체 보기
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full font-semibold transition-all ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white shadow-lg"
                    : "bg-white text-foreground border border-gray-300 hover:border-blue-600"
                }`}
              >
                {CATEGORY_LABELS[category]}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {filteredFAQs.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                {/* Question */}
                <button
                  onClick={() => setExpandedIndex(expandedIndex === idx ? null : idx)}
                  className="w-full px-6 sm:px-8 py-4 sm:py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  aria-expanded={expandedIndex === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xl">{CATEGORY_LABELS[faq.category].split(" ")[0]}</span>
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">
                      {faq.question}
                    </h3>
                  </div>
                  <div className="flex-shrink-0">
                    <svg
                      className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 ${
                        expandedIndex === idx ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  </div>
                </button>

                {/* Answer */}
                {expandedIndex === idx && (
                  <div
                    id={`faq-answer-${idx}`}
                    className="px-6 sm:px-8 py-4 sm:py-5 bg-gray-50 border-t border-gray-200"
                  >
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Emergency Contact Banner */}
          <div className="mt-12 sm:mt-16 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 sm:p-8 border-2 border-red-200">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-3 sm:mb-4">
                  🚨 긴급 상황 시 즉시 연락하세요
                </h3>
                <p className="text-base sm:text-lg text-red-800 mb-4">
                  부적절한 상담이나 문제 상황이 발생하면 즉시 고객센터에 연락하세요. 우리는 24시간 대응 가능합니다.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 text-sm sm:text-base text-red-700">
                  <span>
                    <span className="font-bold">이메일:</span> support@univmatch.com
                  </span>
                  <span className="hidden sm:inline">|</span>
                  <span>
                    <span className="font-bold">전화:</span> 1234-5678
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* More Questions */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              더 궁금한 점이 있으신가요?
            </p>
            <a
              href="mailto:support@univmatch.com"
              className="inline-block text-primary font-semibold hover:underline text-base sm:text-lg"
            >
              고객센터에 문의하기 →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
