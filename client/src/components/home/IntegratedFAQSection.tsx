import { useState } from "react";
import { Shield, AlertCircle, ChevronDown } from "lucide-react";
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
      "유니브매치는 상담 유형에 따라 단계로 정해진 금액을 제시하고 있습니다. 서비스는 멘토와 멘티를 연결하는 플랫폼으로서 별도의 중개 수수료를 받지 않습니다. 안전한 거래를 위해 대면 거래를 원칙으로 하고 있습니다. (이용약관 제7조)",
    category: "cost",
    categoryLabel: " [비용] 투명하고 정직한 운영",
  },
  {
    question: "환불은 어떻게 되나요?",
    answer:
      "환불은 취소 시점에 따라 차등 적용됩니다.\n\n100% 환불: 상담 확정 후 24시간 이내이면서 상담 예정 시간 12시간 전인 경우\n\n50% 환불: 상담 예정 시간 12시간 전까지 (확정 후 24시간 경과 시)\n\n환불 불가: 상담 예정 시간 12시간 이내 또는 상담이 이미 시작된 경우\n\n특별 환불: 멘토의 노쇼, 허위 정보 제공 등 멘토 귀책 사유가 확인될 경우 시점과 관계없이 100% 환불됩니다. (환불 정책)",
    category: "cost",
    categoryLabel: " [비용] 투명하고 정직한 운영",
  },

  // 검증 관련
  {
    question: "멘토는 정말 대학생인가요?",
    answer:
      "네, 100% 대학생입니다. 모든 멘토는 가입 시 유효한 학생증 또는 재학증명서를 제출하여 운영진의 엄격한 재학 여부 검증을 거칩니다. 만약 허위 서류를 제출한 것이 확인될 경우 계정은 즉시 정지되며 관련 법적 책임을 질 수 있습니다. (이용약관 제5조)",
    category: "verification",
    categoryLabel: "✅ [검증] 믿을 수 있는 멘토진",
  },

  // 안전 관련
  {
    question: "개인정보는 안전한가요?",
    answer:
      "유니브매치는 개인정보 보호법에 따라 SSL/TLS 암호화 및 접근 통제 등 기술적·관리적 보호 조치를 수행하고 있습니다. 상담 매칭 시 원활한 연락을 위해 성함, 휴대전화번호, 이메일, 소속 학교 정보가 상대방에게 제공되며, 이 정보는 상담 종료 시까지만 보유함을 원칙으로 합니다. (개인정보처리방침 제4조, 제9조)",
    category: "safety",
    categoryLabel: "️ [안전] 안심하고 이용하는 환경",
  },
  {
    question: "상담 중 문제가 발생하면 어떻게 되나요?",
    answer:
      "운영진은 이용자 간의 분쟁 발생 시 중재 역할을 수행할 수 있습니다. 멘토의 부적절한 언행이나 허위 정보 제공으로 문제가 생긴 경우, 증빙 자료와 함께 2026univmatch@gmail.com으로 문의해 주시면 사실 확인 후 환불 및 이용 제한 등 단호한 조치를 취합니다. (이용약관 제8조, 환불 정책)",
    category: "safety",
    categoryLabel: "️ [안전] 안심하고 이용하는 환경",
  },

  // 일반 질문
  {
    question: "상담 후 만족하지 않으면 어떻게 되나요?",
    answer:
      "유니브매치는 멘토와 멘티를 연결하는 플랫폼으로서 상담 내용의 정확성이나 결과에 대해 개별적인 보증을 하지는 않습니다. 다만, 이용자 간 성실한 협의를 권장하며 분쟁이 원만히 해결되지 않을 경우 서비스가 정한 정책에 따라 대응을 도와드립니다. (이용약관 제8조)",
    category: "general",
    categoryLabel: "❓ [일반] 서비스 이용 및 기대 효과",
  },
  {
    question: "성적 향상을 보장하나요?",
    answer:
      "아니요, 보장하지 않습니다. 멘토링은 전공 탐색과 학습 노하우 공유를 목적으로 하며, 상담 결과에 대한 최종적인 책임은 이용자 당사자에게 있습니다. 자신의 고민에 가장 적합한 멘토를 선택하기 위해 프로필과 칼럼을 꼼꼼히 확인해 보시는 것을 추천합니다. (이용약관 제8조)",
    category: "general",
    categoryLabel: "❓ [일반] 서비스 이용 및 기대 효과",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  cost: " 비용",
  safety: "️ 안전",
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
      className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950"
      aria-label="FAQ 및 안전 가이드"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-blue-700 rounded-full text-sm font-semibold mb-4">
            ️ 안전하고 투명한 서비스
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
              <div className="mb-6 pb-4 border-b-2 border-border 700 700">
                <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                  {group.label}
                </h3>
              </div>

              {/* FAQ Items in Category */}
              <div className="space-y-4">
                {group.items.map((faq, idx) => (
                  <div
                    key={`${group.category}-${idx}`}
                    className="bg-card  rounded-lg border border-border 700 700 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden hover:scale-102 hover:-translate-y-1"
                  >
                    {/* Question */}
                    <button
                      onClick={() => setExpandedIndex(expandedIndex === `${group.category}-${idx}` ? null : `${group.category}-${idx}`)}
                      className="w-full px-4 sm:px-6 md:px-8 py-4 sm:py-5 text-left hover:bg-primary/5 transition-all duration-200 flex items-start justify-between gap-4 group"
                      aria-expanded={expandedIndex === `${group.category}-${idx}`}
                      aria-controls={`faq-answer-${group.category}-${idx}`}
                    >
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm sm:text-base md:text-lg font-semibold text-foreground group-hover:text-indigo-600 transition-colors">
                          Q. {faq.question}
                        </h4>
                      </div>
                      <div className="flex-shrink-0 mt-1">
                        <ChevronDown
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-primary transition-all duration-300 group-hover:scale-110 ${
                            expandedIndex === `${group.category}-${idx}` ? "rotate-180" : ""
                          }`}
                        />
                      </div>
                    </button>

                    {/* Answer */}
                    {expandedIndex === `${group.category}-${idx}` && (
                      <div
                        id={`faq-answer-${group.category}-${idx}`}
                        className="px-4 sm:px-6 md:px-8 py-4 sm:py-5 bg-gradient-to-r from-indigo-50 via-blue-50 to-transparent dark:from-indigo-950/50 dark:via-blue-950/50 dark:to-transparent border-t border-border animate-in fade-in slide-in-from-top-2 duration-300"
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
          <div className="bg-gradient-to-r from-indigo-50 via-blue-50 to-blue-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-6 sm:p-8 md:p-10 border border-blue-200 dark:border-slate-700 hover:shadow-lg hover:scale-102 transition-all duration-300">
            <p className="text-base sm:text-lg text-foreground font-semibold mb-4">
              더 궁금한 점이 있으신가요?
            </p>
            <p className="text-sm sm:text-base text-muted-foreground mb-6">
              아래 이메일로 문의해 주세요. 평일 기준 24시간 이내에 운영진이 직접 답변해 드립니다.
            </p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-sm sm:text-base font-mono text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:text-blue-700 dark:hover:text-blue-300 hover:scale-105 transition-all" onClick={handleCopyEmail} title="클릭하여 복사">
                2026univmatch@gmail.com
              </span>
              <button
                onClick={handleCopyEmail}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform text-sm sm:text-base font-semibold"
                title="이메일 주소 복사"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                복사
              </button>
              <a
                href="mailto:2026univmatch@gmail.com"
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform text-sm sm:text-base font-semibold"
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
