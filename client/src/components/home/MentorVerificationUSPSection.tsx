import { CheckCircle, Award } from "lucide-react";

/**
 * 철저한 멘토 검증 USP 섹션 (지그재그 #1)
 * - 배경: 연한 그레이 (bg-slate-50)
 * - 왼쪽: 멘토 프로필 카드 (검증완료 배지, 명문대 로고)
 * - 오른쪽: 타이포그래피 제목 및 설명
 * - 높이: py-24 (충분한 여백)
 */
export function MentorVerificationUSPSection() {
  return (
    <section className="py-24 bg-slate-50" aria-label="철저한 멘토 검증">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* 지그재그 레이아웃: 왼쪽 카드, 오른쪽 텍스트 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* 왼쪽: 멘토 프로필 카드 (컴팩트) */}
            <div className="flex justify-center">
              <div className="bg-card  rounded-3xl p-8 shadow-lg w-full max-w-sm">
                {/* 프로필 헤더 */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    {/* 아바타 */}
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full mb-4 flex items-center justify-center text-white text-2xl font-bold">
                      김
                    </div>
                    {/* 이름 및 정보 */}
                    <h3 className="text-xl font-bold text-foreground mb-1">김서연</h3>
                    <p className="text-sm text-muted-foreground mb-2">서울대학교 · 컴퓨터공학부</p>
                  </div>
                  {/* 검증완료 배지 */}
                  <div className="flex flex-col items-center gap-1 bg-blue-50 rounded-lg px-3 py-2 border border-blue-200">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-semibold text-blue-600">검증완료</span>
                  </div>
                </div>

                {/* 명문대 로고 (심볼) */}
                <div className="mb-6 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    S
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold text-foreground">서울대학교</p>
                    <p className="text-xs text-muted-foreground">상위 1% 명문대</p>
                  </div>
                </div>

                {/* 간단한 정보 */}
                <div className="space-y-3 pt-4 border-t border-gray-200 700 700">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">학년</span>
                    <span className="font-semibold text-foreground">3학년</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">전공</span>
                    <span className="font-semibold text-foreground">컴퓨터공학</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">평점</span>
                    <span className="font-semibold text-yellow-500">★★★★★ (5.0)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 오른쪽: 타이포그래피 제목 및 설명 */}
            <div className="space-y-6">
              {/* 메인 제목 */}
              <div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                  <span className="text-primary">100% 명문대생</span>
                  <br />
                  멘토, 철저한 신원 인증
                </h2>
              </div>

              {/* 설명 텍스트 */}
              <div className="space-y-4">
                <p className="text-lg text-muted-foreground leading-relaxed">
                  유니브매치의 모든 멘토는 대학 이메일과 학생증으로 100% 검증됩니다. 
                  실제 재학생만 참여하므로 신뢰할 수 있는 정보를 얻을 수 있습니다.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  또한 상위권 대학 멘토들이 중심이 되어 입시 성공뿐 아니라 전공 선택의 정확성까지 
                  높일 수 있습니다.
                </p>
              </div>

              {/* 특징 리스트 */}
              <div className="space-y-3 pt-4">
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base text-foreground font-medium">
                    대학 이메일 + 학생증 이중 인증
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base text-foreground font-medium">
                    상위권 대학 멘토 중심
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <span className="text-base text-foreground font-medium">
                    실제 경험에 기반한 신뢰할 수 있는 조언
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
