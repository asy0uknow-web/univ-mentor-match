import { useEffect, useState } from "react";

const DARK_MODE_KEY = "univmatch:darkMode";

export function useDarkMode() {
  const [isDark, setIsDark] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // 초기화: 로컬 스토리지에서 다크 모드 설정 읽기
  useEffect(() => {
    const stored = localStorage.getItem(DARK_MODE_KEY);
    
    if (stored !== null) {
      // 로컬 스토리지에 저장된 값이 있으면 사용
      setIsDark(stored === "true");
    } else {
      // 저장된 값이 없으면 시스템 설정 확인
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setIsDark(prefersDark);
    }
    
    setIsLoaded(true);
  }, []);

  // 다크 모드 상태 변경 시 DOM과 로컬 스토리지 업데이트
  useEffect(() => {
    if (!isLoaded) return;

    const html = document.documentElement;
    
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    
    localStorage.setItem(DARK_MODE_KEY, isDark ? "true" : "false");
  }, [isDark, isLoaded]);

  const toggleDarkMode = () => {
    setIsDark((prev) => !prev);
  };

  return {
    isDark,
    toggleDarkMode,
    isLoaded,
  };
}
