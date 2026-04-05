import { Link } from "wouter";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo" aria-label="사이트 정보">
      <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
          {/* Company Info */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">유니브매치</h3>
            <p className="text-sm leading-relaxed mb-4">
              학생의 올바른 진로 선택을 돕는 교육 기술 플랫폼입니다.
            </p>
            <p className="text-xs text-gray-400 space-y-1">
              <span className="block">대표: 유니브매치 운영팀</span>
              <span className="block">이메일: support@univmatch.com</span>
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">서비스</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/mentors" className="hover:text-white transition-colors">멘토 찾기</Link></li>
              <li><Link href="/my-profile" className="hover:text-white transition-colors">내 프로필</Link></li>
              <li><Link href="/messages" className="hover:text-white transition-colors">메시지</Link></li>
              <li><Link href="/bookings" className="hover:text-white transition-colors">예약 내역</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">고객지원</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:support@univmatch.com" className="hover:text-white transition-colors">이메일 문의</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">자주 묻는 질문</a></li>
              <li><Link href="/qna" className="hover:text-white transition-colors">Q&A 커뮤니티</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">약관 및 정책</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="hover:text-white transition-colors">이용약관</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-white transition-colors">개인정보처리방침</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">환불 정책</Link></li>
              <li><a href="mailto:support@univmatch.com" className="hover:text-white transition-colors">문의하기</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400 mb-8">
          <p>
            &copy; {currentYear} 유니브매치. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0 text-xs text-gray-500">
            본 서비스는 교육 목적의 멘토링 플랫폼입니다.
          </p>
        </div>

        {/* Trust Badge */}
        <div className="pt-8 border-t border-gray-700 text-center">
          <p className="text-xs text-gray-400 mb-3">
            🛡️ 모든 멘토는 재학 여부가 검증되었으며, 안전한 상담 환경을 보장합니다.
          </p>
          <p className="text-xs text-gray-400">
            개인정보는 암호화되어 안전하게 보관되며, 상담 진행에만 사용됩니다.
          </p>
        </div>
      </div>
    </footer>
  );
}
