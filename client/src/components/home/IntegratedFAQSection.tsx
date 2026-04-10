import { useState } from "react";
import { Shield, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface FAQItem {
  question: string;
  answer: string;
  category: "cost" | "safety" | "verification" | "general";
  categoryLabel: string;
}

const FAQ_ITEMS: FAQItem[] = [
  // 비용 관련
  {
    question: "상담료는 얼마인가요?",
    answer:
      "상담료는 멘토가 본인의 경력과 상담 내용에 따라 직접 책정합니다. 유니브매치는 중간 수수료를 전혀 받지 않으므로, 타 플랫폼보다 합리적인 가격으로 명문대생의 노하우를 얻으실 수 있습니다.",
    category: "cost",
    categoryLabel: "💰 [비용] 투명하고 정직한 운영",
  },
  {
    question: "환불은 어떻게 되나요?",
    answer:
      "상담 시작 전에는 언제든 100% 환불이 가능합니다. 다만, 상담이 이미 진행되었거나 일정 확정 후 노쇼(No-show)가 발생한 경우 멘토의 시간을 보호하기 위해 자체 환불 규정에 따라 차등 환불됩니다.",
    category: "cost",
    categoryLabel: "💰 [비용] 투명하고 정직한 운영",
  },

  // 검증 관련
  {
    question: "멘토는 정말 대학생인가요?",
    answer:
      "네, 100% 재학생 또는 졸업생입니다. 유니브매치는 **[1. 실물 학생증 확인], [2. 대학 공식 웹메일 인증], [3. 운영진 프로필 심사]**라는 까다로운 3단계 검증 프로세스를 통과한 분들만 멘토로 활동할 수 있습니다.",
    category: "verification",
    categoryLabel: "✅ [검증] 믿을 수 있는 멘토진",
  },

  // 안전 관련
  {
    question: "개인정보는 안전한가요?",
    answer:
      "유니브매치는 사용자의 연락처나 주소 등 민감한 개인정보를 멘토에게 직접 노출하지 않습니다. 모든 상담 연결은 플랫폼 내 자체 채팅 시스템을 통해 이루어지며, 데이터는 암호화되어 안전하게 관리됩니다.",
    category: "safety",
    categoryLabel: "🛡️ [안전] 안심하고 이용하는 환경",
  },
  {
    question: "상담 중 문제가 발생하면 어떻게 되나요?",
    answer:
      "상담 중 불쾌한 언행, 사기 유도, 규정 위반 등이 발생할 경우 채팅창 내 '신고하기' 버튼을 눌러주세요. 운영진이 즉시 개입하여 사실 관계를 확인하며, 위반 사항 발견 시 해당 멘토의 활동은 영구 정지됩니다.",
    category: "safety",
    categoryLabel: "🛡️ [안전] 안심하고 이용하는 환경",
  },

  // 일반 질문
  {
    question: "상담 후 만족하지 않으면 어떻게 되나요?",
    answer:
      "유니브매치는 100% 리뷰 시스템을 운영합니다. 상담에 대한 솔직한 피드백을 남겨주시면 다른 멘티들에게 큰 도움이 됩니다. 만약 서비스 규정을 어긴 불량 상담이었다면 운영진 심사를 통해 적절한 조치를 도와드립니다.",
    category: "general",
    categoryLabel: "❓ [일반] 서비스 이용 및 기대 효과",
  },
  {
    question: "성적 향상을 보장하나요?",
    answer:
      "유니브매치는 단순한 과외 연결을 넘어, 공부 방법과 진로 고민을 해결해 주는 '러닝 메이트'를 지향합니다. 멘토의 노하우를 본인의 것으로 만드는 노력과 병행한다면, 반드시 긍정적인 변화를 경험하실 수 있습니다.",
    category: "general",
    categoryLabel: "❓ [일반] 서비스 이용 및 기대 효과",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  cost: "💰 비용",
  safety: "🛡️ 안전",
  verification: "✅ 검증",
  general: "❓ 일반",
};

export const IntegratedFAQSection = () => {
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // 이메일 복사 이벤트 리스너
  const handleCopyEmail = () => {
    navigator.clipboard.writeText('2026univmatch@gmail.com');
    toast.success('이메일 주소가 복사되었습니다!');
  };

  const filteredFAQs = selectedCategory
    ? FAQ_ITEMS.filter((item) => item.category === selectedCategory)
    : FAQ_ITEMS;

  const categories = ["cost", "verification", "safety", "general"];
  
  // 카테고리별로 그룹화
  const groupedFAQs = categories.map(category => ({
    category,
    label: FAQ_ITEMS.find(item => item.category === category)?.categoryLabel || "",
    items: FAQ_ITEMS.filter(item => item.category === category)
  }));

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
            자주 묻는 질문
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground">
            학생과 학부모님들이 궁금해하는 모든 것을 답변해드립니다.
          </p>
        </div>

        {/* FAQ by Category */}
        <div className="max-w-4xl mx-auto space-y-12 sm:space-y-16">
          {groupedFAQs.map((group, groupIdx) => (
            <div key={group.category} className="space-y-4">
              {/* Category Header */}
              <div className="mb-6 pb-4 border-b-2 border-gray-200">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {group.label}
                </h3>
              </div>

              {/* FAQ Items in Category */}
              <div className="space-y-4">
                {group.items.map((faq, idx) => (
                  <div
                    key={`${group.category}-${idx}`}
                    className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                  >
                    {/* Question */}
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === `${group.category}-${idx}` ? null : `${group.category}-${idx}`)}
                      className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-left hover:bg-gray-50 transition-colors flex items-start justify-between gap-4"
                      aria-expanded={expandedIndex === `${group.category}-${idx}`}
                      aria-controls={`faq-answer-${group.category}-${idx}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground">
                          Q. {faq.question}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        <svg
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-transform duration-300 ${
                            expandedIndex === `${group.category}-${idx}` ? "rotate-180" : ""
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
                    {expandedIndex === `${group.category}-${idx}` && (
                      <div
                        id={`faq-answer-${group.category}-${idx}`}
                        className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 bg-gradient-to-r from-blue-50 to-transparent border-t border-gray-200"
                      >
                        <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed whitespace-pre-wrap">
                          A. {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* More Questions - Email Contact Section */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6 sm:p-8 md:p-10 border border-blue-200">
            <p className="text-base sm:text-lg text-foreground font-semibold mb-4">
              더 궁금한 점이 있으신가요?
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              아래 이메일로 문의해 주세요. 평일 기준 24시간 이내에 운영진이 직접 답변해 드립니다.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm sm:text-base font-mono text-blue-600 font-semibold cursor-pointer hover:text-blue-700 transition-colors" onClick={handleCopyEmail} title="클릭하여 복사">
                2026univmatch@gmail.com
              </span>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm sm:text-base font-semibold"
                title="이메일 주소 복사"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                복사
              </button>
              <a
                href="mailto:2026univmatch@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm sm:text-base font-semibold"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                메일 보내기
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
