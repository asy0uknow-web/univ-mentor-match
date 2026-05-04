import { PageLayout } from "@/components/layout";
import { useEffect } from "react";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function PrivacyPolicy() {
  useEffect(() => {
    setPageMeta({
      title: "개인정보처리방침 | 유니브매치",
      description: "유니브매치의 개인정보처리방침을 확인하세요."
    });
  }, []);

  return (
    <PageLayout showFooter>
      <div className="min-h-screen bg-white py-12 sm:py-16 md:py-20">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4">
              개인정보처리방침
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground">
              유니브매치(이하 "서비스")는 「개인정보 보호법」 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm text-muted-foreground">
                <strong>시행일</strong>: 2026년 3월 14일 &nbsp;|&nbsp; <strong>최종 수정일</strong>: 2026년 3월 14일
              </p>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-12">

            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제1조 (개인정보의 처리 목적)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보 보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 것입니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">처리 목적</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">처리 항목</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">법적 근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">회원 가입 및 관리</td>
                      <td className="border border-gray-300 px-4 py-2">이름, 이메일, 휴대전화번호</td>
                      <td className="border border-gray-300 px-4 py-2">정보주체 동의 (법 제15조제1항제1호)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">멘토-멘티 매칭 및 상담 서비스 제공</td>
                      <td className="border border-gray-300 px-4 py-2">학교/대학, 전공, 학년, 지역, 자기소개, 상담 유형</td>
                      <td className="border border-gray-300 px-4 py-2">계약 이행 (법 제15조제1항제4호)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">멘토 신원 확인 및 인증</td>
                      <td className="border border-gray-300 px-4 py-2">학생증 이미지</td>
                      <td className="border border-gray-300 px-4 py-2">정보주체 동의 (법 제15조제1항제1호)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">서비스 개선 및 통계 분석</td>
                      <td className="border border-gray-300 px-4 py-2">서비스 이용 기록, 접속 로그</td>
                      <td className="border border-gray-300 px-4 py-2">정당한 이익 (법 제15조제1항제6호)</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">결제 및 환불 처리</td>
                      <td className="border border-gray-300 px-4 py-2">결제 기록 (결제수단 정보는 Stripe에서 직접 처리)</td>
                      <td className="border border-gray-300 px-4 py-2">법적 의무 이행 (법 제15조제1항제2호)</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">부정 이용 방지 및 보안</td>
                      <td className="border border-gray-300 px-4 py-2">접속 IP, 기기 정보, 이용 기록</td>
                      <td className="border border-gray-300 px-4 py-2">정당한 이익 (법 제15조제1항제6호)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제2조 (처리하는 개인정보의 항목 및 수집 방법)</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 수집하는 개인정보의 항목</h3>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">구분</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">필수 항목</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">선택 항목</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">공통 (모든 회원)</td>
                      <td className="border border-gray-300 px-4 py-2">이름, 이메일 주소, 휴대전화번호</td>
                      <td className="border border-gray-300 px-4 py-2">-</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">멘토 추가 정보</td>
                      <td className="border border-gray-300 px-4 py-2">소속 대학, 전공, 학년, 상담 가능 지역, 상담 유형, 학생증 이미지</td>
                      <td className="border border-gray-300 px-4 py-2">자기소개, 프로필 사진, 갤러리 이미지</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">멘티 추가 정보</td>
                      <td className="border border-gray-300 px-4 py-2">재학 중인 학교, 상담 희망 지역</td>
                      <td className="border border-gray-300 px-4 py-2">자기소개</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">자동 수집 정보</td>
                      <td className="border border-gray-300 px-4 py-2">접속 IP, 쿠키, 기기 정보, 접속 시간·이용 기록</td>
                      <td className="border border-gray-300 px-4 py-2">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 수집 방법</h3>
              <p className="text-muted-foreground mb-6">
                서비스는 회원 가입 시 직접 입력, 서비스 이용 과정에서의 자동 수집(쿠키, 접속 로그 등), 그리고 서비스 이용 중 생성되는 정보(메시지, 예약 기록 등)를 통해 개인정보를 수집합니다. 소셜 로그인(Google 등)을 이용하는 경우, 해당 플랫폼으로부터 이름 및 이메일 정보를 제공받을 수 있습니다.
              </p>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제3조 (개인정보의 처리 및 보유 기간)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 법령에 따른 개인정보 보유·이용 기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용 기간 내에서 개인정보를 처리·보유합니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">처리 목적</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">보유 기간</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">회원 가입 및 관리</td>
                      <td className="border border-gray-300 px-4 py-2">회원 탈퇴 시까지</td>
                      <td className="border border-gray-300 px-4 py-2">이용자 동의</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">소비자 불만 또는 분쟁처리 기록</td>
                      <td className="border border-gray-300 px-4 py-2">3년</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래 등에서의 소비자보호에 관한 법률 제6조</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">계약 또는 청약철회 등에 관한 기록</td>
                      <td className="border border-gray-300 px-4 py-2">5년</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래 등에서의 소비자보호에 관한 법률 제6조</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">표시·광고에 관한 기록</td>
                      <td className="border border-gray-300 px-4 py-2">6개월</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래 등에서의 소비자보호에 관한 법률 제6조</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">서비스 이용 기록 (접속 로그)</td>
                      <td className="border border-gray-300 px-4 py-2">3개월</td>
                      <td className="border border-gray-300 px-4 py-2">통신비밀보호법 제15조의2</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">결제 정보</td>
                      <td className="border border-gray-300 px-4 py-2">5년</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래 등에서의 소비자보호에 관한 법률 제6조</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">상담 기록 및 메시지</td>
                      <td className="border border-gray-300 px-4 py-2">3년</td>
                      <td className="border border-gray-300 px-4 py-2">소비자기본법 제16조</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제4조 (개인정보의 제3자 제공)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 정보주체의 개인정보를 제1조에서 명시한 처리 목적의 범위 내에서만 처리하며, 정보주체의 사전 동의 없이 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외적으로 제공할 수 있습니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 멘토-멘티 매칭을 위한 정보 제공</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">제공 대상</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">제공 항목</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">제공 목적</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">보유 기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">매칭된 멘토 또는 멘티</td>
                      <td className="border border-gray-300 px-4 py-2">이름, 휴대전화번호, 이메일, 소속 학교/대학, 전공, 학년, 상담 유형</td>
                      <td className="border border-gray-300 px-4 py-2">상담 예약 및 진행을 위한 직접 연락</td>
                      <td className="border border-gray-300 px-4 py-2">상담 종료 시까지</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 결제 처리를 위한 정보 제공</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">제공 대상</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">제공 항목</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">제공 목적</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Stripe Inc. (미국)</td>
                      <td className="border border-gray-300 px-4 py-2">이름, 이메일, 결제 정보</td>
                      <td className="border border-gray-300 px-4 py-2">결제 처리 및 환불</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-sm text-muted-foreground mb-6">
                ※ Stripe Inc.는 미국에 소재한 결제 대행사로, 개인정보의 국외 이전이 발생합니다. Stripe의 개인정보처리방침은 <a href="https://stripe.com/privacy" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">stripe.com/privacy</a>에서 확인하실 수 있습니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">3. 법령에 따른 제공</h3>
              <p className="text-muted-foreground mb-6">
                법원의 정식 재판 절차에서의 개인정보 열람·제출 명령, 수사기관의 수사를 위한 개인정보 제출 요청, 기타 법령에서 규정한 의무 이행의 경우에는 관계 법령에 따라 개인정보를 제공할 수 있습니다.
              </p>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제5조 (개인정보 처리의 위탁)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 원활한 서비스 제공을 위해 다음과 같이 개인정보 처리 업무를 위탁하고 있습니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">수탁자</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">위탁 업무 내용</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">보유 및 이용 기간</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Stripe Inc.</td>
                      <td className="border border-gray-300 px-4 py-2">결제 처리 및 결제 정보 관리</td>
                      <td className="border border-gray-300 px-4 py-2">위탁 계약 종료 시까지</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">Amazon Web Services (AWS)</td>
                      <td className="border border-gray-300 px-4 py-2">서버 및 데이터 저장·관리</td>
                      <td className="border border-gray-300 px-4 py-2">위탁 계약 종료 시까지</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제6조 (미성년자 개인정보 보호)</h2>

              <p className="text-muted-foreground mb-4">
                서비스는 원칙적으로 만 14세 이상의 이용자를 대상으로 합니다. 만 14세 미만 아동이 법정대리인의 동의 없이 가입된 경우, 해당 미성년자의 개인정보는 지체 없이 파기됩니다.
              </p>
              <p className="text-muted-foreground mb-6">
                만 14세 이상 만 19세 미만의 미성년자가 서비스에 가입하는 경우, 해당 미성년자에게 개인정보 수집·이용에 대한 동의 여부를 명확히 안내합니다. 서비스는 미성년자 이용자의 개인정보가 불필요하게 노출되지 않도록 필요한 조치를 취합니다.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제7조 (정보주체의 권리·의무 및 행사방법)</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 정보주체의 권리</h3>
              <p className="text-muted-foreground mb-4">
                정보주체는 서비스에 대하여 언제든지 다음 각 호의 개인정보 보호 관련 권리를 행사할 수 있습니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">권리</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">개인정보 열람 요구</td>
                      <td className="border border-gray-300 px-4 py-2">자신의 개인정보 처리 현황 및 내용 확인</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">오류 정정 요구</td>
                      <td className="border border-gray-300 px-4 py-2">부정확하거나 불완전한 개인정보의 정정</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">삭제 요구</td>
                      <td className="border border-gray-300 px-4 py-2">법령에서 수집이 의무화된 경우를 제외한 개인정보 삭제</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">처리 정지 요구</td>
                      <td className="border border-gray-300 px-4 py-2">개인정보 처리의 일시적 정지</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">동의 철회</td>
                      <td className="border border-gray-300 px-4 py-2">개인정보 수집·이용·제공에 대한 동의 철회 (회원 탈퇴)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 권리 행사 방법</h3>
              <p className="text-muted-foreground mb-4">
                정보주체는 「개인정보 보호법」 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 권리를 행사할 수 있습니다. 서비스는 이에 대해 지체 없이 조치하겠습니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>이메일:</strong> privacy@univmatch.com</li>
                <li><strong>서비스 내 요청:</strong> 마이페이지 → 개인정보 관리 메뉴</li>
              </ul>
              <p className="text-sm text-muted-foreground mb-6">
                ※ 정보주체의 요청을 받은 날부터 10일 이내에 처리하고 그 결과를 통지합니다. 다만, 정당한 사유가 있는 경우 10일 이내에 그 사유와 처리 일정을 통지하고 최대 30일까지 연장할 수 있습니다.
              </p>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제8조 (개인정보의 파기)</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 파기 절차</h3>
              <p className="text-muted-foreground mb-4">
                서비스는 개인정보 보유 기간의 경과, 처리 목적의 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다. 정보주체로부터 동의받은 개인정보 보유 기간이 경과하거나 처리 목적이 달성되었음에도 불구하고 다른 법령에 따라 개인정보를 계속 보존하여야 하는 경우에는, 해당 개인정보를 별도의 데이터베이스(DB)로 옮기거나 보관 장소를 달리하여 보존합니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 파기 방법</h3>
              <p className="text-muted-foreground mb-6">
                전자적 파일 형태로 기록·저장된 개인정보는 기록을 재생할 수 없도록 파기하며, 종이 문서에 기록·저장된 개인정보는 분쇄기로 분쇄하거나 소각하여 파기합니다.
              </p>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제9조 (개인정보의 안전성 확보조치)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 「개인정보 보호법」 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적·관리적·물리적 조치를 하고 있습니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">구분</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">조치 내용</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">관리적 조치</td>
                      <td className="border border-gray-300 px-4 py-2">내부관리계획 수립·시행, 개인정보 취급 직원 최소화 및 교육</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-medium">기술적 조치</td>
                      <td className="border border-gray-300 px-4 py-2">개인정보처리시스템 접근 권한 관리, 접근통제시스템 설치, 고유식별정보 등의 암호화, 보안프로그램 설치, SSL/TLS 프로토콜 적용</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">물리적 조치</td>
                      <td className="border border-gray-300 px-4 py-2">전산실, 자료보관실 등의 접근 통제</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제10조 (쿠키 및 자동 수집 정보)</h2>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 쿠키의 사용 목적</h3>
              <p className="text-muted-foreground mb-6">
                서비스는 이용자의 편의를 위해 쿠키(Cookie)를 사용합니다. 쿠키는 이용자의 브라우저에 저장되는 작은 텍스트 파일로, 로그인 유지, 이용자 선호도에 따른 서비스 개인화, 서비스 이용 통계 수집 등의 목적으로 사용됩니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 쿠키 설정 거부 방법</h3>
              <p className="text-muted-foreground mb-4">
                이용자는 쿠키 설치에 대한 선택권을 가지고 있으며, 웹 브라우저의 옵션을 통해 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다. 다만, 쿠키 저장을 거부할 경우 로그인이 필요한 일부 서비스 이용에 어려움이 있을 수 있습니다.
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                예) Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터
              </p>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제11조 (개인정보 보호책임자)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 개인정보 처리에 관한 업무를 총괄하고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-semibold bg-gray-100 w-1/3">성명</td>
                      <td className="border border-gray-300 px-4 py-3">유니브매치 개인정보 보호책임자</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3 font-semibold bg-gray-100">이메일</td>
                      <td className="border border-gray-300 px-4 py-3">
                        <a href="mailto:privacy@univmatch.com" className="text-primary hover:underline">privacy@univmatch.com</a>
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-3 font-semibold bg-gray-100">연락처</td>
                      <td className="border border-gray-300 px-4 py-3">서비스 내 고객지원 센터</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <p className="text-muted-foreground mb-4">
                정보주체는 「개인정보 보호법」 제35조에 따른 개인정보의 열람 청구를 아래의 부서에 할 수 있습니다. 서비스는 정보주체의 개인정보 열람 청구가 신속하게 처리되도록 노력하겠습니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">개인정보 침해 신고 및 피해 구제 기관</h3>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">기관명</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">연락처</th>
                      <th className="border border-gray-300 px-4 py-3 text-left font-semibold">웹사이트</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">개인정보보호위원회 개인정보침해신고센터</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 182</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://privacy.go.kr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">privacy.go.kr</a></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">개인정보분쟁조정위원회</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 1833-6972</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://www.kopico.go.kr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">kopico.go.kr</a></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">대검찰청 사이버수사과</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 1301</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://spo.go.kr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">spo.go.kr</a></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">경찰청 사이버안전국</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 182</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://cyberbureau.police.go.kr" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">cyberbureau.police.go.kr</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 12 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제12조 (개인정보처리방침의 변경)</h2>
              <p className="text-muted-foreground mb-6">
                이 개인정보처리방침은 법령·정책 또는 보안 기술의 변경에 따라 내용의 추가·삭제 및 수정이 있을 시에는 변경 사항의 시행 최소 7일 전부터 서비스 공지사항을 통하여 고지할 것입니다. 다만, 이용자의 권리에 중대한 변경이 발생하는 경우에는 최소 30일 전에 고지합니다.
              </p>
            </section>

            {/* Footer */}
            <section className="border-t border-gray-300 pt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-muted-foreground mb-2">
                  <strong>공고일:</strong> 2026년 3월 7일
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>시행일:</strong> 2026년 3월 14일
                </p>
                <p className="text-muted-foreground">
                  <strong>문의:</strong> <a href="mailto:privacy@univmatch.com" className="text-primary hover:underline">privacy@univmatch.com</a>
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
