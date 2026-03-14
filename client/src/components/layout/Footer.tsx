import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="py-6 sm:py-8 border-t border-border bg-card" role="contentinfo" aria-label="사이트 정보">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm sm:text-base">
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          <Link href="/privacy-policy" className="hover:text-foreground hover:underline transition-colors">
            개인정보처리방침
          </Link>
          <span className="text-border">|</span>
          <Link href="/terms" className="hover:text-foreground hover:underline transition-colors">
            이용약관
          </Link>
          <span className="text-border">|</span>
          <a href="mailto:privacy@univmatch.com" className="hover:text-foreground hover:underline transition-colors">
            개인정보 문의
          </a>
        </div>
        <p>&copy; 2026 유니브매치. All rights reserved.</p>
      </div>
    </footer>
  );
}
