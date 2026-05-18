import { useState, useEffect } from "react";
import { X, Rocket } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function MentorVerificationBanner() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);

  // 멘토 인증 상태 조회
  const { data: verification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 배너 표시 조건 체크
  useEffect(() => {
    // Admin은 배너 표시 안 함
    if (user?.role === "admin") {
      setIsVisible(false);
      return;
    }

    // localStorage에서 닫힘 상태 확인
    const isBannerClosed = localStorage.getItem("mentor-verification-banner-closed");
    
    // 대학생(멘토 후보)이고, 미인증 상태이고, 닫혀있지 않은 경우에만 표시
    // 고등학생(멘티)은 멘토 인증 배너를 표시하지 않음
    if (
      isAuthenticated &&
      user?.userType === "university_student" &&
      verification?.status !== "approved" &&
      !isBannerClosed
    ) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [isAuthenticated, user, verification, isClosed]);

  const handleClose = () => {
    setIsClosed(true);
    localStorage.setItem("mentor-verification-banner-closed", "true");
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-b border-orange-200 dark:border-orange-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3 sm:gap-4">
          {/* 왼쪽: 메시지 */}
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
            <p className="text-sm sm:text-base font-medium text-orange-900 dark:text-orange-200">
              🎓 학생증 인증을 완료하고 멘토로 활동을 시작하세요!
            </p>
          </div>

          {/* 오른쪽: 버튼 + 닫기 */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              href="/verify-mentor"
              className="inline-flex items-center gap-1 px-3 sm:px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap"
            >
              지금 인증하기
              <span className="text-lg">➔</span>
            </Link>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-orange-200 dark:hover:bg-orange-900/50 rounded-lg transition-colors duration-200 flex-shrink-0"
              aria-label="배너 닫기"
            >
              <X className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
