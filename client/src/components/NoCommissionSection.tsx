import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function NoCommissionSection() {
  return (
    <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent to-green-50">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 p-8 sm:p-10 md:p-12 items-center">
            {/* 이미지 섹션 */}
            <div className="flex justify-center">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/no-commission-highfive-gtZZEvwgFLduhn4DhcJHov.webp"
                alt="수수료 없음 - 하이파이브"
                className="w-full max-w-sm h-auto"
              />
            </div>

            {/* 텍스트 섹션 */}
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                  유니브매치는 수수료를
                  <br />
                  일절 받지 않습니다.
                </h2>
                <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
                  멘토와 멘티의 연결에만 집중하기 위해 추가 비용이나 수수료를 받지 않습니다. 멘토링 비용 100%가 멘토에게 직접 전달됩니다.
                </p>
              </div>

              {/* 버튼 */}
              <div>
                <Link href="/mentors">
                  <Button
                    size="lg"
                    className="w-full sm:w-auto bg-green-700 hover:bg-green-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
                  >
                    멘토 찾으러 가기
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
