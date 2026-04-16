import { useState } from "react";
import { Link } from "wouter";
import SafetyGuideModal from "../modals/SafetyGuideModal";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [isSafetyGuideOpen, setIsSafetyGuideOpen] = useState(false);

  return (
    <>
      <footer className="bg-slate-900 950 text-slate-400 400 animate-in fade-in slide-in-from-bottom-4 duration-300" role="contentinfo" aria-label="사이트 정보">
        <div className="container mx-auto px-4 py-12 sm:py-16 md:py-20">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            {/* Company Info */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">유니브매치</h3>
              <p className="text-sm leading-relaxed mb-4">
                실제 재학생과 함께하는 전공 탐색 플랫폼
              </p>
              <p className="text-xs text-slate-500 space-y-1">
                <span className="block">이메일: 2026univmatch@gmail.com</span>
              </p>
            </div>

            {/* Service Links */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">서비스</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/mentors" className="hover:text-white transition-all duration-200 hover:translate-x-1">멘토 찾기</Link></li>
                <li><Link href="/my-profile" className="hover:text-white transition-all duration-200 hover:translate-x-1">멘토 등록</Link></li>
                <li><Link href="/columns" className="hover:text-white transition-all duration-200 hover:translate-x-1">칼럼 보기</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">지원</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#faq" className="hover:text-white transition-all duration-200 hover:translate-x-1">자주 묻는 질문</a></li>
                <li><button onClick={() => setIsSafetyGuideOpen(true)} className="hover:text-white transition-all duration-200 hover:translate-x-1 text-left">안전 가이드</button></li>
                <li><a href="mailto:2026univmatch@gmail.com" className="hover:text-white transition-all duration-200 hover:translate-x-1">이메일 문의</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-white font-bold text-lg mb-4">법적</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="hover:text-white transition-all duration-200 hover:translate-x-1">이용약관</Link></li>
                <li><Link href="/privacy-policy" className="hover:text-slate-200 transition-all duration-200 hover:translate-x-1 text-slate-300 font-medium">개인정보처리방침</Link></li>
                <li><Link href="/refund-policy" className="hover:text-white transition-all duration-200 hover:translate-x-1">환불 정책</Link></li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-700 mb-8"></div>

          {/* Bottom Footer */}
          <div className="text-center mb-8">
            <p className="text-xs sm:text-sm text-slate-400">
              &copy; {currentYear} 유니브매치. All rights reserved.
            </p>
          </div>

          {/* Disclaimer */}
          <div className="pt-8 border-t border-slate-700 text-center">
            <p className="text-xs text-slate-500 leading-relaxed">
              유니브매치는 통신판매중개자로서 멘토링 시스템만 제공하며, 상담의 이행 및 품질에 대한 책임은 각 멘토에게 있습니다.
            </p>
          </div>
        </div>
      </footer>

      {/* Safety Guide Modal */}
      <SafetyGuideModal isOpen={isSafetyGuideOpen} onClose={() => setIsSafetyGuideOpen(false)} />
    </>
  );
}
