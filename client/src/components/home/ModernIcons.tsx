/**
 * Modern Gradient Icons for Home Page
 * Using brand colors (#00A36C, #008080) with pastel tones
 */

// Search Icon - 돋보기 아이콘 (투명 그라데이션 렌즈)
export const ModernSearchIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="searchGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#00A36C', stopOpacity: 0.9 }} />
        <stop offset="100%" style={{ stopColor: '#008080', stopOpacity: 0.7 }} />
      </linearGradient>
      <linearGradient id="searchLensGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#A8E6D1', stopOpacity: 0.5 }} />
        <stop offset="100%" style={{ stopColor: '#7DD3C0', stopOpacity: 0.3 }} />
      </linearGradient>
    </defs>
    
    {/* 렌즈 부분 (투명 그라데이션) */}
    <circle cx="24" cy="24" r="16" fill="url(#searchLensGradient)" stroke="url(#searchGradient)" strokeWidth="3" />
    
    {/* 손잡이 부분 */}
    <line x1="38" y1="38" x2="52" y2="52" stroke="url(#searchGradient)" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// Calendar Icon - 달력 아이콘
export const ModernCalendarIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="calendarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#00A36C', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#008080', stopOpacity: 0.8 }} />
      </linearGradient>
    </defs>
    
    {/* 달력 본체 */}
    <rect x="12" y="16" width="40" height="40" rx="4" fill="url(#calendarGradient)" />
    
    {/* 상단 바 */}
    <rect x="12" y="16" width="40" height="12" rx="4" fill="url(#calendarGradient)" opacity="0.9" />
    
    {/* 날짜 표시 점들 */}
    <circle cx="20" cy="35" r="2" fill="white" opacity="0.8" />
    <circle cx="32" cy="35" r="2" fill="white" opacity="0.8" />
    <circle cx="44" cy="35" r="2" fill="white" opacity="0.8" />
    <circle cx="20" cy="48" r="2" fill="white" opacity="0.8" />
    <circle cx="32" cy="48" r="2" fill="white" opacity="0.8" />
    <circle cx="44" cy="48" r="2" fill="white" opacity="0.8" />
  </svg>
);

// Message Circle Icon - 말풍선 아이콘
export const ModernMessageIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="messageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#00A36C', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#008080', stopOpacity: 0.8 }} />
      </linearGradient>
    </defs>
    
    {/* 말풍선 원형 */}
    <circle cx="32" cy="28" r="18" fill="url(#messageGradient)" />
    
    {/* 말풍선 꼬리 */}
    <path d="M 24 44 L 20 52 L 28 44 Z" fill="url(#messageGradient)" />
    
    {/* 내부 점들 (대화 표시) */}
    <circle cx="26" cy="28" r="2.5" fill="white" opacity="0.9" />
    <circle cx="32" cy="28" r="2.5" fill="white" opacity="0.9" />
    <circle cx="38" cy="28" r="2.5" fill="white" opacity="0.9" />
  </svg>
);

// Info Icon - 정보 아이콘 (문서)
export const ModernInfoIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="infoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#B8E6D5', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#9DD4C3', stopOpacity: 0.9 }} />
      </linearGradient>
    </defs>
    
    {/* 문서 */}
    <rect x="16" y="12" width="32" height="40" rx="2" fill="url(#infoGradient)" />
    
    {/* 선들 */}
    <line x1="22" y1="24" x2="42" y2="24" stroke="white" strokeWidth="2" opacity="0.8" strokeLinecap="round" />
    <line x1="22" y1="32" x2="42" y2="32" stroke="white" strokeWidth="2" opacity="0.8" strokeLinecap="round" />
    <line x1="22" y1="40" x2="36" y2="40" stroke="white" strokeWidth="2" opacity="0.8" strokeLinecap="round" />
  </svg>
);

// Trust Icon - 신뢰 아이콘 (방패)
export const ModernTrustIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="trustGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFE5B4', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FFD699', stopOpacity: 0.9 }} />
      </linearGradient>
    </defs>
    
    {/* 방패 */}
    <path d="M 32 12 L 20 18 L 20 32 C 20 44 32 52 32 52 C 32 52 44 44 44 32 L 44 18 Z" fill="url(#trustGradient)" />
    
    {/* 체크마크 */}
    <path d="M 28 36 L 30 38 L 36 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
  </svg>
);

// Cost Icon - 비용 아이콘 (동전)
export const ModernCostIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="costGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#FFD4A3', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#FFC299', stopOpacity: 0.9 }} />
      </linearGradient>
    </defs>
    
    {/* 동전 */}
    <circle cx="32" cy="32" r="18" fill="url(#costGradient)" />
    
    {/* 동전 테두리 */}
    <circle cx="32" cy="32" r="18" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
    
    {/* 동전 내부 선 */}
    <line x1="32" y1="18" x2="32" y2="46" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
    <line x1="24" y1="32" x2="40" y2="32" stroke="white" strokeWidth="2" opacity="0.7" strokeLinecap="round" />
  </svg>
);

// Container Component with Background Circle
export const IconWithBackground = ({ children }: { children: React.ReactNode }) => (
  <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 flex items-center justify-center">
    {/* 연한 배경 원형 */}
    <div className="absolute inset-0 bg-slate-50 rounded-full opacity-70"></div>
    {/* 아이콘 */}
    <div className="relative z-10">
      {children}
    </div>
  </div>
);


// Verification Icons

// Student ID Icon - 학생증 아이콘
export const ModernStudentIDIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="studentIDGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#B8E6D5', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#9DD4C3', stopOpacity: 0.9 }} />
      </linearGradient>
    </defs>
    
    {/* 카드 */}
    <rect x="14" y="18" width="36" height="28" rx="2" fill="url(#studentIDGradient)" />
    
    {/* 카드 테두리 */}
    <rect x="14" y="18" width="36" height="28" rx="2" fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
    
    {/* 모자 아이콘 */}
    <path d="M 32 22 L 28 26 L 36 26 Z" fill="white" opacity="0.9" />
    <rect x="28" y="26" width="8" height="2" fill="white" opacity="0.9" />
    
    {/* 이름 줄 */}
    <line x1="18" y1="32" x2="46" y2="32" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
    <line x1="18" y1="38" x2="46" y2="38" stroke="white" strokeWidth="1.5" opacity="0.7" strokeLinecap="round" />
  </svg>
);

// Checkmark Icon - 신원 확인 아이콘
export const ModernCheckmarkIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#A8E6D1', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#7DD3C0', stopOpacity: 0.9 }} />
      </linearGradient>
    </defs>
    
    {/* 원형 배경 */}
    <circle cx="32" cy="32" r="20" fill="url(#checkmarkGradient)" />
    
    {/* 체크마크 */}
    <path d="M 24 32 L 28 36 L 40 24" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
  </svg>
);

// Shield Icon - 검증 완료 아이콘
export const ModernShieldIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
    <defs>
      <linearGradient id="shieldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#00A36C', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#008080', stopOpacity: 0.8 }} />
      </linearGradient>
    </defs>
    
    {/* 방패 */}
    <path d="M 32 14 L 20 20 L 20 34 C 20 46 32 52 32 52 C 32 52 44 46 44 34 L 44 20 Z" fill="url(#shieldGradient)" />
    
    {/* 체크마크 */}
    <path d="M 28 36 L 30 38 L 36 32" stroke="white" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.95" />
  </svg>
);
