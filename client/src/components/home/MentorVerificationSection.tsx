// 멘토 검증 방식 섹션 컴포넌트
export const MentorVerificationSection = () => {
  const verificationSteps = [
    {
      step: 1,
      title: "학생증 인증",
      description: "모든 멘토는 유효한 학생증을 제출하여 현재 대학생임을 증명합니다. 만료된 학생증은 인정되지 않습니다.",
      icon: "🎓"
    },
    {
      step: 2,
      title: "이메일 인증",
      description: "대학 공식 이메일 주소로 인증을 완료합니다. 이를 통해 실제 재학생임을 한 번 더 확인합니다.",
      icon: "✉️"
    },
    {
      step: 3,
      title: "프로필 심사",
      description: "멘토의 경력, 자격, 상담 분야를 검토하여 플랫폼 기준을 충족하는지 확인합니다.",
      icon: "📋"
    }
  ];

  return (
    <section id="mentor-verification" role="region" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-white to-gray-50" aria-label="멘토 검증 방식">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            검증된 멘토, 신뢰할 수 있습니다
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            3단계 검증 프로세스를 통해 정말 믿을 수 있는 멘토만 활동합니다.
          </p>
        </div>

        {/* Verification Steps */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {verificationSteps.map((item, idx) => (
              <div
                key={idx}
                className="bg-card dark:bg-card rounded-2xl p-6 sm:p-8 shadow-md dark:shadow-lg hover:shadow-lg transition-shadow duration-300 relative"
              >
                {/* Step Number Badge */}
                <div className="absolute -top-4 -left-4 w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base">
                  {item.step}
                </div>

                {/* Icon */}
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">
                  {item.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground mb-3 sm:mb-4">
                  {item.title}
                </h3>

                {/* Description */}
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>

          {/* Additional Info */}
            <div className="mt-12 sm:mt-16 bg-blue-50 rounded-2xl p-6 sm:p-8 border border-blue-100">
            <p className="text-base sm:text-lg text-foreground">
              <span className="font-bold">✓ 안심하세요:</span> 3단계 검증을 모두 통과한 멘토만 플랫폼에서 활동합니다. 모든 멘토 프로필에는 검증 배지가 표시되므로 안전하게 상담을 진행할 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
