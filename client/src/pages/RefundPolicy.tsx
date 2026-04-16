import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 dark:text-gray-300 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              홈으로 돌아가기
            </button>
          </Link>
        </div>

        <div className="bg-card dark:bg-card rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">환불 정책</h1>
          <p className="text-gray-500 text-sm mb-8">최종 업데이트: 2025년 1월 1일</p>

          <div className="prose prose-gray max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">환불 원칙</h2>
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed">
                유니브매치는 이용자의 권익 보호를 위해 명확한 환불 정책을 운영합니다. 아래 기준에 따라 환불이 처리됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">상담 취소 및 환불 기준</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-200 dark:border-slate-700 dark:border-slate-700 text-sm">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <th className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-left font-semibold text-gray-700">취소 시점</th>
                      <th className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-left font-semibold text-gray-700">환불 비율</th>
                      <th className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-left font-semibold text-gray-700">비고</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-600 dark:text-gray-300 dark:text-gray-300">상담 확정 후 24시간 이내</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-green-600 font-semibold">100% 환불</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-500">단, 상담 예정 시간 12시간 이전에 한함</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-600 dark:text-gray-300 dark:text-gray-300">상담 예정 시간 12시간 전</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-yellow-600 font-semibold">50% 환불</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-500">-</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-600 dark:text-gray-300 dark:text-gray-300">상담 예정 시간 12시간 이내</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-red-600 font-semibold">환불 불가</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-500">멘토 귀책 사유 제외</td>
                    </tr>
                    <tr className="bg-slate-50 dark:bg-slate-900">
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-600 dark:text-gray-300 dark:text-gray-300">상담 시작 후</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-red-600 font-semibold">환불 불가</td>
                      <td className="border border-gray-200 dark:border-slate-700 dark:border-slate-700 px-4 py-3 text-gray-500">멘토 귀책 사유 제외</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">멘토 귀책 사유 환불</h2>
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed mb-3">
                다음의 경우 멘토 귀책 사유로 판단하여 100% 환불이 가능합니다.
              </p>
              <ul className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
                <li>멘토가 예약된 상담 시간에 나타나지 않은 경우</li>
                <li>멘토가 상담 시작 버튼을 누르지 않아 상담이 진행되지 않은 경우</li>
                <li>멘토의 부적절한 언행으로 상담이 중단된 경우</li>
                <li>멘토의 허위 정보 제공이 확인된 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">환불 처리 방법</h2>
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed mb-3">
                환불은 결제 수단에 따라 다음과 같이 처리됩니다.
              </p>
              <ul className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed space-y-2 list-disc list-inside">
                <li>신용카드: 결제 취소 처리 (영업일 기준 3~5일 소요)</li>
                <li>계좌이체: 환불 신청 후 영업일 기준 3~5일 이내 입금</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-gray-800 mb-3">환불 신청 방법</h2>
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 leading-relaxed">
                환불을 원하시는 경우 아래 이메일로 문의해 주시기 바랍니다. 예약 번호, 환불 사유, 환불 계좌 정보를 함께 보내주시면 빠르게 처리해 드립니다.
              </p>
              <div className="mt-3 p-4 bg-slate-50 dark:bg-slate-900 rounded-lg">
                <p className="text-gray-700 font-medium">환불 문의</p>
                <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 text-sm mt-1">이메일: support@univmatch.com</p>
                <p className="text-gray-500 text-xs mt-1">영업일 기준 1~2일 이내 답변 드립니다.</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
