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
              유니브매치는 이용자의 개인정보를 보호하고 개인정보와 관련된 고충을 신속하게 처리하기 위해 다음과 같이 개인정보처리방침을 수립·공개합니다.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              <strong>시행일</strong>: 2026년 3월 11일
            </p>
          </div>

          {/* Content */}
          <div className="space-y-12">
            {/* Section 1 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제1조 (개인정보의 처리 목적)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 「개인정보보호법」 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 것입니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">처리 목적</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">처리 항목</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">회원 가입 및 관리</td>
                      <td className="border border-gray-300 px-4 py-2">이름, 이메일, 휴대전화번호, 비밀번호</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">멘토-멘티 매칭 및 상담 서비스 제공</td>
                      <td className="border border-gray-300 px-4 py-2">학교, 전공, 학년, 지역, 자기소개, 상담 유형</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">멘토 신원 확인 및 인증</td>
                      <td className="border border-gray-300 px-4 py-2">학생증 이미지, 신분증 정보</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">서비스 개선 및 통계 분석</td>
                      <td className="border border-gray-300 px-4 py-2">서비스 이용 기록, 접속 로그</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">법적 의무 이행</td>
                      <td className="border border-gray-300 px-4 py-2">결제 기록, 상담 기록</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">부정 이용 방지 및 보안</td>
                      <td className="border border-gray-300 px-4 py-2">접속 IP, 기기 정보, 이용 기록</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 2 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제2조 (처리하는 개인정보의 항목 및 수집 방법)</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">1. 수집하는 개인정보의 항목</h3>
              
              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2">공통 정보 (모든 회원)</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>필수: 이름, 이메일 주소, 휴대전화번호, 비밀번호</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2">멘토 회원 추가 정보</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>필수: 소속 대학, 전공, 학년, 상담 가능 지역, 상담 유형</li>
                  <li>선택: 자기소개, 프로필 사진, 갤러리 이미지</li>
                  <li>인증용: 학생증 이미지</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2">학생 회원 추가 정보</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>필수: 재학 중인 학교, 상담 희망 지역</li>
                  <li>선택: 자기소개</li>
                </ul>
              </div>

              <div className="mb-6">
                <h4 className="font-semibold text-foreground mb-2">자동 수집 정보</h4>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>서비스 이용 기록: 접속 IP, 쿠키, 기기 정보, 접속 시간 및 이용 기록</li>
                  <li>상담 기록: 예약 정보, 메시지 내용, 상담 일시</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 수집 방법</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li>회원 가입 시 직접 입력</li>
                <li>서비스 이용 과정에서 자동 수집 (쿠키, 접속 로그 등)</li>
                <li>서비스 이용 중 생성되는 정보 (메시지, 예약 기록 등)</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제3조 (개인정보의 처리 및 보유 기간)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 법령에 따라 개인정보를 수집하여 처리하는 경우를 제외하고는, 정보주체의 동의 없이 다른 목적으로 이용하지 않습니다. 각 개인정보의 처리 목적 및 보유 기간은 다음과 같습니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">처리 목적</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">보유 기간</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">근거</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">회원 가입 및 관리</td>
                      <td className="border border-gray-300 px-4 py-2">회원 탈퇴 시까지</td>
                      <td className="border border-gray-300 px-4 py-2">이용자 동의</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">분쟁 조정 및 민원 처리</td>
                      <td className="border border-gray-300 px-4 py-2">분쟁 종료 시까지</td>
                      <td className="border border-gray-300 px-4 py-2">이용자 동의</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">소비자 불만 또는 분쟁처리 기록</td>
                      <td className="border border-gray-300 px-4 py-2">3년</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래법</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">계약 또는 청약철회 등에 관한 기록</td>
                      <td className="border border-gray-300 px-4 py-2">5년</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래법</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">표시·광고에 관한 기록</td>
                      <td className="border border-gray-300 px-4 py-2">6개월</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래법</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">서비스 이용 기록 (접속 로그)</td>
                      <td className="border border-gray-300 px-4 py-2">3개월</td>
                      <td className="border border-gray-300 px-4 py-2">통신비밀보호법</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">결제 정보</td>
                      <td className="border border-gray-300 px-4 py-2">5년</td>
                      <td className="border border-gray-300 px-4 py-2">전자상거래법</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">상담 기록 및 메시지</td>
                      <td className="border border-gray-300 px-4 py-2">3년</td>
                      <td className="border border-gray-300 px-4 py-2">소비자보호법</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-900">
                  <strong>베타 서비스 안내:</strong> 현재 베타 테스트 기간 중에는 결제 기능이 없으므로 결제 정보는 수집되지 않습니다. 결제 기능이 추가될 경우 별도의 공지를 통해 안내할 예정입니다.
                </p>
              </div>
            </section>

            {/* Section 4 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제4조 (개인정보의 제3자 제공)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 정보주체의 사전 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 예외적으로 제공할 수 있습니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 멘토-멘티 매칭을 위한 정보 제공</h3>
              <p className="text-muted-foreground mb-4">
                서비스의 핵심 기능인 멘토-멘티 매칭을 위하여, 다음 정보를 상대방에게 제공합니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 mb-6">
                <li><strong>제공 대상:</strong> 매칭된 멘토 또는 멘티</li>
                <li><strong>제공 항목:</strong> 이름, 휴대전화번호, 이메일 주소, 소속 학교/대학, 전공, 학년, 상담 유형</li>
                <li><strong>제공 목적:</strong> 상담 예약 및 진행을 위한 직접 연락</li>
                <li><strong>제공 시기:</strong> 상담 신청 수락 시</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 법령에 따른 제공</h3>
              <p className="text-muted-foreground mb-4">
                다음의 경우에는 관계 법령에 따라 개인정보를 제공할 수 있습니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li>법원의 정식 재판 절차에서 개인정보 열람·제출 명령</li>
                <li>수사 기관의 수사를 위한 개인정보 제출 요청</li>
                <li>기타 법령에서 규정한 의무 이행</li>
              </ul>
            </section>

            {/* Section 5 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제5조 (미성년자 이용자의 개인정보 보호)</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">1. 이용 연령 기준</h3>
              <p className="text-muted-foreground mb-6">
                서비스는 원칙적으로 만 14세 이상의 이용자를 대상으로 합니다. 만 14세 미만 아동이 법정대리인의 동의 없이 가입된 경우, 해당 미성년자의 개인정보는 파기됩니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 미성년자 동의</h3>
              <p className="text-muted-foreground mb-6">
                만 14세 이상 만 19세 미만의 미성년자가 서비스에 가입하는 경우, 해당 미성년자에게 개인정보 수집·이용에 대한 동의 여부를 알리고, 필요시 법정대리인의 동의를 받습니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">3. 미성년자 보호 원칙</h3>
              <p className="text-muted-foreground mb-6">
                서비스는 미성년자 이용자에게 유출된 정보가 불필요하게 노출되지 않도록 노력하며, 미성년자의 개인정보 보호를 위해 필요한 조치를 취합니다.
              </p>
            </section>

            {/* Section 6 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제6조 (정보주체의 권리·의무 및 행사방법)</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">1. 정보주체의 권리</h3>
              <p className="text-muted-foreground mb-4">
                정보주체는 다음의 권리를 가지며, 언제든지 이 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-2 mb-6">
                <li><strong>개인정보 열람 요구:</strong> 자신의 개인정보 열람을 요청할 권리</li>
                <li><strong>오류 등의 정정 요구:</strong> 부정확한 개인정보의 정정을 요청할 권리</li>
                <li><strong>삭제 요구:</strong> 개인정보의 삭제를 요청할 권리</li>
                <li><strong>처리 정지 요구:</strong> 개인정보 처리의 정지를 요청할 권리</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 권리 행사 방법</h3>
              <p className="text-muted-foreground mb-4">
                정보주체는 다음의 방법으로 권리를 행사할 수 있습니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>이메일:</strong> privacy@univmatch.com</li>
                <li><strong>서비스 내 요청:</strong> 마이페이지의 "개인정보 관리" 메뉴</li>
                <li><strong>서신:</strong> 유니브매치 개인정보보호담당자에게 서신 발송</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">3. 처리 기간</h3>
              <p className="text-muted-foreground mb-6">
                서비스는 정보주체의 요청을 받은 날부터 10일 이내에 처리하고, 처리 결과를 통지합니다. 다만, 요청 내용이 복잡한 경우 추가 기간이 소요될 수 있습니다.
              </p>
            </section>

            {/* Section 7 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제7조 (개인정보의 파기)</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">1. 파기 절차</h3>
              <p className="text-muted-foreground mb-4">
                서비스는 개인정보 보유 기간의 경과, 처리 목적의 달성 등 개인정보가 불필요하게 되었을 때에는 지체 없이 해당 개인정보를 파기합니다.
              </p>
              <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 mb-6">
                <p className="text-muted-foreground mb-2"><strong>파기 절차:</strong></p>
                <ol className="list-decimal list-inside text-muted-foreground space-y-1 ml-2">
                  <li>개인정보 파기 사유 발생 (보유 기간 만료, 회원 탈퇴 등)</li>
                  <li>개인정보보호담당자의 확인</li>
                  <li>파기 실행</li>
                </ol>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 파기 방법</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>전자적 파일:</strong> 복구 불가능한 방법으로 영구 삭제 (예: 암호화 후 삭제, 덮어쓰기 등)</li>
                <li><strong>종이 문서:</strong> 분쇄기를 이용하여 분쇄 또는 소각</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제8조 (개인정보의 안전성 확보조치)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 개인정보의 안전성을 확보하기 위해 다음과 같은 조치를 취합니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 관리적 조치</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li>개인정보 처리 직원에 대한 정기적인 교육 실시</li>
                <li>개인정보 접근 권한 제한 및 관리</li>
                <li>개인정보 처리 현황 점검 및 감시</li>
                <li>개인정보 처리 규정 수립 및 시행</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 기술적 조치</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>암호화:</strong> 비밀번호, 결제 정보 등 민감한 정보는 암호화하여 저장 및 전송 (SSL/TLS 프로토콜 사용)</li>
                <li><strong>접근 제어:</strong> 개인정보처리시스템에 대한 접근 권한을 최소한으로 제한</li>
                <li><strong>침입 탐지:</strong> 비정상적인 접근을 감시하고 차단하는 시스템 운영</li>
                <li><strong>백업:</strong> 정기적인 데이터 백업을 통한 손실 방지</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">3. 물리적 조치</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li>서버 및 데이터베이스 보관 공간의 접근 제어</li>
                <li>출입 기록 관리 및 감시 카메라 운영</li>
                <li>중요 정보 저장 매체의 안전한 보관</li>
              </ul>
            </section>

            {/* Section 9 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제9조 (개인정보 보호담당자)</h2>
              <p className="text-muted-foreground mb-6">
                서비스는 개인정보 처리에 관한 업무를 총괄하고, 개인정보 침해에 대한 불만을 처리하기 위하여 다음과 같이 개인정보 보호담당자를 지정하고 있습니다.
              </p>

              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">담당자</td>
                      <td className="border border-gray-300 px-4 py-2">유니브매치 개인정보보호담당자</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">이메일</td>
                      <td className="border border-gray-300 px-4 py-2">privacy@univmatch.com</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-semibold bg-gray-100">연락처</td>
                      <td className="border border-gray-300 px-4 py-2">서비스 내 고객지원 센터</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h3 className="text-xl font-semibold text-foreground mb-3">정보주체 불만 처리 및 피해 구제</h3>
              <p className="text-muted-foreground mb-4">
                정보주체는 개인정보 침해로 인한 불만 및 피해 구제를 위해 다음 기관에 문의할 수 있습니다.
              </p>
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">기관</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">연락처</th>
                      <th className="border border-gray-300 px-4 py-2 text-left font-semibold">웹사이트</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">개인정보보호위원회 개인정보침해신고센터</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 182</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://privacy.go.kr" className="text-primary hover:underline">privacy.go.kr</a></td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">대검찰청 사이버수사과</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 1301</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://spo.go.kr" className="text-primary hover:underline">spo.go.kr</a></td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">경찰청 사이버안전국</td>
                      <td className="border border-gray-300 px-4 py-2">국번없이 182</td>
                      <td className="border border-gray-300 px-4 py-2"><a href="https://cyberbureau.police.go.kr" className="text-primary hover:underline">cyberbureau.police.go.kr</a></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Section 10 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제10조 (쿠키 및 자동 수집 정보)</h2>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">1. 쿠키의 사용</h3>
              <p className="text-muted-foreground mb-4">
                서비스는 이용자의 편의를 위해 쿠키(Cookie)를 사용합니다. 쿠키는 이용자의 브라우저에 저장되는 작은 텍스트 파일로, 다음의 목적으로 사용됩니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>로그인 유지:</strong> 이용자의 로그인 상태 유지</li>
                <li><strong>개인화:</strong> 이용자의 선호도에 따른 서비스 제공</li>
                <li><strong>분석:</strong> 서비스 이용 통계 수집</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 쿠키 거부 방법</h3>
              <p className="text-muted-foreground mb-6">
                이용자는 브라우저 설정을 통해 쿠키를 거부할 수 있습니다. 다만, 쿠키를 거부하면 서비스의 일부 기능이 제한될 수 있습니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">3. 자동 수집 정보</h3>
              <p className="text-muted-foreground mb-4">
                서비스는 이용자의 동의 없이 다음의 정보를 자동으로 수집합니다.
              </p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>접속 정보:</strong> IP 주소, 접속 시간, 접속 기기 정보</li>
                <li><strong>이용 기록:</strong> 클릭한 페이지, 머문 시간, 검색어</li>
                <li><strong>기기 정보:</strong> 운영체제, 브라우저 종류 및 버전</li>
              </ul>
            </section>

            {/* Section 11 */}
            <section>
              <h2 className="text-2xl font-bold text-foreground mb-4">제11조 (개인정보 처리방침의 변경)</h2>
              <p className="text-muted-foreground mb-6">
                이 개인정보처리방침은 법령 및 방침에 따라 변경될 수 있습니다. 변경 내용은 다음과 같이 공지됩니다.
              </p>

              <h3 className="text-xl font-semibold text-foreground mb-3">1. 변경 공지</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2 mb-6">
                <li><strong>중요 변경:</strong> 이용자의 권리에 중대한 영향을 미치는 변경의 경우 변경 예정일 30일 전에 공지</li>
                <li><strong>경미한 변경:</strong> 그 외의 변경은 변경 시행일에 공지</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground mb-3">2. 변경 시행</h3>
              <p className="text-muted-foreground mb-6">
                변경된 개인정보처리방침은 공지한 시행일부터 적용됩니다. 이용자가 변경된 방침에 동의하지 않는 경우, 서비스 이용을 중단하고 탈퇴할 수 있습니다.
              </p>
            </section>

            {/* Footer */}
            <section className="border-t border-gray-300 pt-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-muted-foreground mb-2">
                  <strong>시행일:</strong> 2026년 3월 11일
                </p>
                <p className="text-muted-foreground mb-2">
                  <strong>마지막 수정:</strong> 2026년 3월 11일
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
