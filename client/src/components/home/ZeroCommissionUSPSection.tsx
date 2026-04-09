/**
 * 중개 수수료 0% USP 섹션 (지그재그 #2)
 * - 배경: 화이트 (bg-white)
 * - 왼쪽: 제목 및 설명 텍스트
 * - 오른쪽: 고급 일러스트레이션 (멘토-멘티 직접 연결)
 * - 높이: py-24 (충분한 여백)
 */
export function ZeroCommissionUSPSection() {
  return (
    <section className="py-24 bg-white" aria-label="중개 수수료 0%">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* 지그재그 레이아웃: 왼쪽 텍스트, 오른쪽 일러스트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* 왼쪽: 제목 및 설명 */}
            <div className="space-y-6">
              {/* 메인 제목 */}
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  <span className="text-primary">중개 수수료 0원</span>
                  <br />
                  정직한 연결의 시작
                </h2>
              </div>

              {/* 설명 텍스트 */}
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  유니브매치는 멘토와 멘티를 직접 연결합니다. 
                  중개 수수료나 숨겨진 비용 없이 순수한 상담료만 지불하면 됩니다.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  멘토는 더 많은 수익을 얻고, 멘티는 더 저렴한 가격에 상담받을 수 있습니다. 
                  양쪽 모두 만족하는 정직한 플랫폼입니다.
                </p>
              </div>

              {/* 가격 비교 */}
              <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                <p className="text-sm text-muted-foreground mb-4">기타 플랫폼 vs 유니브매치</p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">기타 플랫폼</span>
                    <span className="text-sm font-semibold text-red-600">
                      상담료 + 15~30% 수수료
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground">유니브매치</span>
                    <span className="text-sm font-semibold text-primary">
                      상담료만 지불 (수수료 0%)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 고급 일러스트레이션 */}
            <div className="flex justify-center">
              <svg
                viewBox="0 0 500 500"
                className="w-full max-w-md h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 배경 그라데이션 */}
                <defs>
                  <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#F0F9FF', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#ECFDF5', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="mentorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#3B82F6', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#1E40AF', stopOpacity: 1 }} />
                  </linearGradient>
                  <linearGradient id="menteeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: '#047857', stopOpacity: 1 }} />
                  </linearGradient>
                </defs>

                {/* 배경 생략 - 그림 없이 진행 */}

                {/* 왼쪽 멘토 (파란색) */}
                <g>
                  {/* 머리 배경 */}
                  <circle cx="120" cy="100" r="45" fill="url(#mentorGradient)" opacity="0.2" />
                  {/* 머리 */}
                  <circle cx="120" cy="100" r="35" fill="url(#mentorGradient)" />
                  {/* 얼굴 특징 */}
                  <circle cx="110" cy="95" r="4" fill="white" />
                  <circle cx="130" cy="95" r="4" fill="white" />
                  <path d="M 115 110 Q 120 115 125 110" stroke="white" strokeWidth="2" fill="none" />
                  
                  {/* 몸 */}
                  <rect x="95" y="140" width="50" height="60" rx="8" fill="url(#mentorGradient)" opacity="0.8" />
                  {/* 팔 */}
                  <rect x="60" y="155" width="35" height="20" rx="10" fill="url(#mentorGradient)" opacity="0.7" />
                  <rect x="155" y="155" width="35" height="20" rx="10" fill="url(#mentorGradient)" opacity="0.7" />
                  {/* 다리 */}
                  <rect x="100" y="205" width="15" height="50" rx="7" fill="url(#mentorGradient)" />
                  <rect x="125" y="205" width="15" height="50" rx="7" fill="url(#mentorGradient)" />
                  
                  {/* 졸업모 */}
                  <path d="M 85 65 L 155 65 L 150 50 L 90 50 Z" fill="#F59E0B" />
                  <circle cx="120" cy="50" r="8" fill="#F59E0B" />
                </g>

                {/* 오른쪽 멘티 (초록색) */}
                <g>
                  {/* 머리 배경 */}
                  <circle cx="380" cy="100" r="45" fill="url(#menteeGradient)" opacity="0.2" />
                  {/* 머리 */}
                  <circle cx="380" cy="100" r="35" fill="url(#menteeGradient)" />
                  {/* 얼굴 특징 */}
                  <circle cx="370" cy="95" r="4" fill="white" />
                  <circle cx="390" cy="95" r="4" fill="white" />
                  <path d="M 375 110 Q 380 115 385 110" stroke="white" strokeWidth="2" fill="none" />
                  
                  {/* 몸 */}
                  <rect x="355" y="140" width="50" height="60" rx="8" fill="url(#menteeGradient)" opacity="0.8" />
                  {/* 팔 */}
                  <rect x="320" y="155" width="35" height="20" rx="10" fill="url(#menteeGradient)" opacity="0.7" />
                  <rect x="415" y="155" width="35" height="20" rx="10" fill="url(#menteeGradient)" opacity="0.7" />
                  {/* 다리 */}
                  <rect x="360" y="205" width="15" height="50" rx="7" fill="url(#menteeGradient)" />
                  <rect x="385" y="205" width="15" height="50" rx="7" fill="url(#menteeGradient)" />
                  
                  {/* 물음표 아이콘 */}
                  <circle cx="380" cy="60" r="12" fill="#F59E0B" opacity="0.9" />
                  <text x="380" y="68" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">?</text>
                </g>

                {/* 중앙 연결선 (하트와 화살표) */}
                <g>
                  {/* 왼쪽 화살표 */}
                  <path d="M 180 250 L 280 250" stroke="#F59E0B" strokeWidth="4" fill="none" markerEnd="url(#arrowRight)" />
                  {/* 오른쪽 화살표 */}
                  <path d="M 320 250 L 220 250" stroke="#F59E0B" strokeWidth="4" fill="none" markerEnd="url(#arrowLeft)" />
                  
                  {/* 하트 아이콘 */}
                  <path d="M 250 235 C 250 230 245 225 240 225 C 235 225 230 230 230 235 C 230 245 250 260 250 260 C 250 260 270 245 270 235 C 270 230 265 225 260 225 C 255 225 250 230 250 235 Z" fill="#EC4899" opacity="0.8" />
                </g>

                {/* 마커 정의 */}
                <defs>
                  <marker id="arrowRight" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                    <polygon points="0 0, 10 3, 0 6" fill="#F59E0B" />
                  </marker>
                  <marker id="arrowLeft" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto">
                    <polygon points="10 0, 0 3, 10 6" fill="#F59E0B" />
                  </marker>
                </defs>

                {/* 하단 텍스트 */}
                <text
                  x="250"
                  y="380"
                  textAnchor="middle"
                  fontSize="28"
                  fontWeight="bold"
                  fill="#1F2937"
                >
                  직접 연결
                </text>

                <text
                  x="250"
                  y="420"
                  textAnchor="middle"
                  fontSize="36"
                  fontWeight="bold"
                  fill="#3B82F6"
                >
                  수수료 0%
                </text>

                <text
                  x="250"
                  y="455"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#6B7280"
                >
                  중개인 없이 직거래
                </text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
