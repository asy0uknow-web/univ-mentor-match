/**
 * 중개 수수료 0% USP 섹션 (지그재그 #2)
 * - 배경: 화이트 (bg-white)
 * - 왼쪽: 제목 및 설명 텍스트
 * - 오른쪽: 따뜻한 라인 아이콘 스타일 일러스트
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

            {/* 오른쪽: 라인 아이콘 스타일 일러스트 */}
            <div className="flex justify-center">
              <svg
                viewBox="0 0 400 400"
                className="w-full max-w-md h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* 배경 원 (선택사항) */}
                <circle
                  cx="200"
                  cy="200"
                  r="190"
                  fill="none"
                  stroke="#E0E8D9"
                  strokeWidth="2"
                  opacity="0.3"
                />

                {/* 왼쪽 사람 (멘티) */}
                <g>
                  {/* 머리 */}
                  <circle cx="100" cy="80" r="25" fill="none" stroke="#3B82F6" strokeWidth="2.5" />
                  {/* 몸 */}
                  <line x1="100" y1="105" x2="100" y2="160" stroke="#3B82F6" strokeWidth="2.5" />
                  {/* 팔 */}
                  <line x1="100" y1="125" x2="70" y2="145" stroke="#3B82F6" strokeWidth="2.5" />
                  <line x1="100" y1="125" x2="130" y2="145" stroke="#3B82F6" strokeWidth="2.5" />
                  {/* 다리 */}
                  <line x1="100" y1="160" x2="85" y2="200" stroke="#3B82F6" strokeWidth="2.5" />
                  <line x1="100" y1="160" x2="115" y2="200" stroke="#3B82F6" strokeWidth="2.5" />
                </g>

                {/* 오른쪽 사람 (멘토) */}
                <g>
                  {/* 머리 */}
                  <circle cx="300" cy="80" r="25" fill="none" stroke="#10B981" strokeWidth="2.5" />
                  {/* 몸 */}
                  <line x1="300" y1="105" x2="300" y2="160" stroke="#10B981" strokeWidth="2.5" />
                  {/* 팔 */}
                  <line x1="300" y1="125" x2="270" y2="145" stroke="#10B981" strokeWidth="2.5" />
                  <line x1="300" y1="125" x2="330" y2="145" stroke="#10B981" strokeWidth="2.5" />
                  {/* 다리 */}
                  <line x1="300" y1="160" x2="285" y2="200" stroke="#10B981" strokeWidth="2.5" />
                  <line x1="300" y1="160" x2="315" y2="200" stroke="#10B981" strokeWidth="2.5" />
                </g>

                {/* 중앙 연결선 (화살표) */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="10"
                    refX="9"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3, 0 6" fill="#F59E0B" />
                  </marker>
                </defs>

                {/* 양방향 화살표 */}
                <line
                  x1="135"
                  y1="200"
                  x2="265"
                  y2="200"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />
                <line
                  x1="265"
                  y1="195"
                  x2="135"
                  y2="195"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />

                {/* 중앙 텍스트 */}
                <text
                  x="200"
                  y="240"
                  textAnchor="middle"
                  fontSize="20"
                  fontWeight="bold"
                  fill="#10B981"
                >
                  직접 연결
                </text>

                {/* 하단 텍스트: 수수료 0% */}
                <text
                  x="200"
                  y="290"
                  textAnchor="middle"
                  fontSize="32"
                  fontWeight="bold"
                  fill="#3B82F6"
                >
                  수수료 0%
                </text>

                {/* 하단 설명 */}
                <text
                  x="200"
                  y="330"
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
