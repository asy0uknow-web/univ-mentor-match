/**
 * 중개 수수료 0% USP 섹션 (지그재그 #2)
 * - 배경: 화이트 (bg-card )
 * - 왼쪽: 제목 및 설명 텍스트
 * - 오른쪽: 고급 일러스트레이션 (멘토-멘티 직접 연결)
 * - 높이: py-24 (충분한 여백)
 */
export function ZeroCommissionUSPSection() {
  return (
    <section className="py-24 bg-card " aria-label="중개 수수료 0%">
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

            {/* 오른쪽: 새로운 일러스트 이미지 */}
            <div className="flex justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/Univmatch_susuryo_725194e2.png"
                alt="멘토와 멘티가 대학 도서관에서 만나는 장면"
                className="w-full max-w-md h-auto rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
