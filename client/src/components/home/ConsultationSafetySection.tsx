// 상담 안전 가이드 섹션 컴포넌트
export const ConsultationSafetySection = () => {
  const safetyGuidelines = [
    {
      title: "개인정보 보호",
      description: "주민등록번호, 계좌 정보 등 민감한 개인정보는 절대 공유하지 마세요.",
      icon: "🔒"
    },
    {
      title: "안전한 상담 환경",
      description: "온라인 상담은 안전한 플랫폼을 통해서만 진행되며, 오프라인 상담은 공공장소에서 진행하세요.",
      icon: "🏢"
    },
    {
      title: "신고 및 문제 해결",
      description: "부적절한 행동이나 문제가 발생하면 즉시 고객센터에 신고할 수 있습니다.",
      icon: "📞"
    },
    {
      title: "결제 안전",
      description: "모든 결제는 안전한 결제 시스템을 통해 진행되며, 직거래는 절대 금지입니다.",
      icon: "💳"
    }
  ];

  return (
    <section id="consultation-safety" role="region" className="py-16 sm:py-24 md:py-32 bg-white" aria-label="상담 안전 가이드">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            안전한 상담 환경을 보장합니다
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            학생과 부모님의 안전을 최우선으로 생각합니다.
          </p>
        </div>

        {/* Safety Guidelines Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {safetyGuidelines.map((guideline, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100"
              >
                {/* Icon */}
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">
                  {guideline.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  {guideline.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {guideline.description}
                </p>
              </div>
            ))}
          </div>

          {/* Emergency Contact */}
          <div className="mt-12 sm:mt-16 bg-red-50 rounded-2xl p-6 sm:p-8 border-2 border-red-200">
            <h3 className="text-lg sm:text-xl font-bold text-red-900 mb-3 sm:mb-4">
              🚨 긴급 상황 시
            </h3>
            <p className="text-base sm:text-lg text-red-800 mb-4">
              부적절한 상담이나 문제 상황이 발생하면 즉시 고객센터에 연락하세요.
            </p>
            <p className="text-sm sm:text-base text-red-700">
              <span className="font-bold">고객센터:</span> support@univmatch.com | <span className="font-bold">전화:</span> 1234-5678
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
