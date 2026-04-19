// 운영 주체 소개 섹션 컴포넌트
export const CompanyInfoSection = () => {
  const teamMembers = [
    {
      name: "김유니",
      role: "대표 / 창립자",
      description: "서울대학교 컴퓨터공학부 졸업, 10년 이상의 교육 기술 경험",
      icon: "👨‍💼"
    },
    {
      name: "이브매치",
      role: "기술 이사",
      description: "카이스트 전산학과 졸업, 스타트업 기술 리더십 경험",
      icon: "👩‍💻"
    },
    {
      name: "박상담",
      role: "교육 자문가",
      description: "전국 고등학교 진로상담 경험 15년, 대학입시 전문가",
      icon: "👨‍🏫"
    }
  ];

  const values = [
    {
      title: "신뢰",
      description: "모든 멘토는 검증되며, 투명한 정보만 제공합니다.",
      icon: "🤝"
    },
    {
      title: "안전",
      description: "학생과 부모님의 안전을 최우선으로 생각합니다.",
      icon: "🛡️"
    },
    {
      title: "성장",
      description: "올바른 진로 선택으로 학생의 성장을 돕습니다.",
      icon: "📈"
    }
  ];

  return (
    <section id="company-info" role="region" className="py-16 sm:py-24 md:py-32 bg-card " aria-label="운영 주체 소개">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            유니브매치를 소개합니다
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            학생의 올바른 진로 선택을 돕기 위해 설립된 교육 기술 회사입니다.
          </p>
        </div>

        {/* Company Info */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 sm:p-12 border border-blue-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">회사 정보</h3>
                <ul className="space-y-3 text-base sm:text-lg text-muted-foreground">
                  <li><span className="font-semibold text-foreground">회사명:</span> 유니브매치 주식회사</li>
                  <li><span className="font-semibold text-foreground">설립:</span> 2024년 1월</li>
                  <li><span className="font-semibold text-foreground">사업자등록번호:</span> 123-45-67890</li>
                  <li><span className="font-semibold text-foreground">통신판매신고:</span> 2024-서울강남-0001</li>
                </ul>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground mb-4">미션</h3>
                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                  "모든 학생이 자신의 적성과 꿈에 맞는 진로를 선택할 수 있도록 돕는다"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Core Values */}
        <div className="max-w-5xl mx-auto mb-16 sm:mb-20">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">핵심 가치</h3>
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {values.map((value, idx) => (
              <div
                key={idx}
                className="bg-card  rounded-2xl p-6 sm:p-8 shadow-md  hover:shadow-lg transition-shadow duration-300 border border-border 700 700 text-center"
              >
                <div className="text-4xl sm:text-5xl mb-4">
                  {value.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-foreground mb-3">
                  {value.title}
                </h4>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-bold text-center text-foreground mb-12">팀 소개</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
            {teamMembers.map((member, idx) => (
              <div
                key={idx}
                className="bg-card rounded-2xl p-6 sm:p-8 shadow-md  hover:shadow-lg transition-shadow duration-300 border border-border 700 700 text-center"
              >
                <div className="text-5xl sm:text-6xl mb-4">
                  {member.icon}
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-foreground mb-1">
                  {member.name}
                </h4>
                <p className="text-sm sm:text-base font-semibold text-primary mb-3">
                  {member.role}
                </p>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
