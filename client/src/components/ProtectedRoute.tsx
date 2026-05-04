import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { useEffect } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth({ redirectOnUnauthenticated: false });
  const [, setLocation] = useLocation();

  useEffect(() => {
    // 1단계: 로딩 중이면 아무것도 하지 않음 (인증 상태 확인 대기)
    if (loading) return;
    
    // 2단계: 로딩 완료 후 비인증 사용자만 리다이렉트
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, loading, setLocation]);

  // 로딩 중일 때: 로딩 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--brand-primary-700)] mx-auto mb-4"></div>
          <p className="text-[var(--color-text-secondary)]">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증되지 않은 경우: 아무것도 렌더링하지 않음 (리다이렉트 진행 중)
  if (!isAuthenticated) {
    return null;
  }

  // 인증된 경우: 자식 컴포넌트 렌더링
  return <>{children}</>;
}
