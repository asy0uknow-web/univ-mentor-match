// 개선된 Footer 컴포넌트
export const ImprovedFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16 md:py-20">
      <div className="container mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">유니브매치</h3>
            <p className="text-sm leading-relaxed mb-4">
              학생의 올바른 진로 선택을 돕는 교육 기술 회사입니다.
            </p>
            <p className="text-xs text-gray-400">
              <span className="block">사업자등록번호: 123-45-67890</span>
              <span className="block">통신판매신고: 2024-서울강남-0001</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/mentors" className="hover:text-white transition-colors">멘토 찾기</a></li>
              <li><a href="/my-profile" className="hover:text-white transition-colors">내 프로필</a></li>
              <li><a href="/messages" className="hover:text-white transition-colors">메시지</a></li>
              <li><a href="/bookings" className="hover:text-white transition-colors">상담 문의</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@univmatch.com" className="hover:text-white transition-colors">이메일 문의</a></li>
              <li><a href="https://open.kakao.com/o/univmatch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">카카오톡 채팅</a></li>
              <li><a href="#parent-faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">약관</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/terms" className="hover:text-white transition-colors">이용약관</a></li>
              <li><a href="/privacy-policy" className="hover:text-white transition-colors">개인정보처리방침</a></li>
              <li><a href="/refund-policy" className="hover:text-white transition-colors">환불 정책</a></li>
              <li><a href="/contact" className="hover:text-white transition-colors">문의하기</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400">
          <p>
            &copy; {currentYear} 유니브매치. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="https://facebook.com/univmatch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Facebook</a>
            <a href="https://instagram.com/univmatch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Instagram</a>
            <a href="https://twitter.com/univmatch" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-400 mb-3">
            🛡️ 모든 멘토는 검증되었으며, 안전한 상담 환경을 보장합니다.
          </p>
          <p className="text-xs text-gray-400">
            개인정보는 암호화되어 안전하게 보관되며, 상담 진행에만 사용됩니다.
          </p>
        </div>
      </div>
    </footer>
  );
};
