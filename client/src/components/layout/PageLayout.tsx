import { useState } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BugReportModal from "@/components/BugReportModal";

interface PageLayoutProps {
  children: React.ReactNode;
  showFooter?: boolean;
}

export default function PageLayout({ children, showFooter = false }: PageLayoutProps) {
  const [showBugReport, setShowBugReport] = useState(false);

  return (
    <div className="min-h-screen">
      <Navbar onBugReport={() => setShowBugReport(true)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
      {showFooter && <Footer />}
      <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />
    </div>
  );
}
