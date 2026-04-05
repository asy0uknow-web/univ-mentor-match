// 문의 채널 섹션 컴포넌트
export const ContactSection = () => {
  const contactChannels = [
    {
      title: "이메일",
      description: "support@univmatch.com",
      details: "24시간 이내 응답",
      icon: "📧",
      link: "mailto:support@univmatch.com"
    },
    {
      title: "카카오톡 오픈채팅",
      description: "유니브매치 고객센터",
      details: "평일 10:00 - 18:00",
      icon: "💬",
      link: "https://open.kakao.com/o/univmatch"
    },
    {
      title: "Q&A 커뮤니티",
      description: "질문 등록하기",
      details: "멘토들이 직접 답변해드립니다",
      icon: "💡",
      link: "/qna"
    }
  ];

  return (
    <section id="contact" role="region" className="py-16 sm:py-24 md:py-32 bg-gradient-to-b from-white to-gray-50" aria-label="문의 채널">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="max-w-4xl mx-auto text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 sm:mb-6">
            언제든 문의하세요
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            궁금한 점이나 문제가 있으면 다양한 채널로 연락할 수 있습니다.
          </p>
        </div>

        {/* Contact Channels */}
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {contactChannels.map((channel, idx) => (
              <a
                key={idx}
                href={channel.link}
                target={channel.link.startsWith("http") ? "_blank" : undefined}
                rel={channel.link.startsWith("http") ? "noopener noreferrer" : undefined}
                className="bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300 border border-gray-100 text-center group"
              >
                {/* Icon */}
                <div className="text-4xl sm:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {channel.icon}
                </div>

                {/* Title */}
                <h3 className="text-lg sm:text-xl font-bold text-foreground mb-2">
                  {channel.title}
                </h3>

                {/* Description */}
                <p className="text-base sm:text-lg font-semibold text-primary mb-2">
                  {channel.description}
                </p>

                {/* Details */}
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {channel.details}
                </p>
              </a>
            ))}
          </div>

          {/* FAQ Link */}
          <div className="mt-12 sm:mt-16 text-center">
            <p className="text-base sm:text-lg text-muted-foreground mb-4">
              자주 묻는 질문은 위의 FAQ 섹션을 참고하세요.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
