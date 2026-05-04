import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background 900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Link href="/">
            <button className="flex items-center gap-2 text-muted-foreground 300 300 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              홈으로 돌아가기
            </button>
          </Link>
        </div>

        <div className="bg-card  rounded-2xl shadow-sm p-8 sm:p-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">이용약관</h1>
          <p className="text-muted-foreground text-sm mb-8">최종 업데이트: 2025년 1월 1일</p>

          <div className="prose prose-gray max-w-none space-y-8">

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제1조 (목적)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                본 약관은 유니브매치(이하 "서비스")가 제공하는 대학생 멘토링 플랫폼 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제2조 (정의)</h2>
              <ul className="text-muted-foreground 300 300 leading-relaxed space-y-2 list-disc list-inside">
                <li><strong>"서비스"</strong>란 유니브매치가 제공하는 대학생 멘토와 고등학생/예비대학생을 연결하는 플랫폼을 의미합니다.</li>
                <li><strong>"멘토"</strong>란 서비스에 등록하여 상담을 제공하는 대학교 재학생을 의미합니다.</li>
                <li><strong>"멘티"</strong>란 서비스를 통해 멘토에게 상담을 신청하는 고등학생 또는 예비대학생을 의미합니다.</li>
                <li><strong>"이용자"</strong>란 서비스에 접속하여 이용하는 모든 회원을 의미합니다.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제3조 (약관의 효력 및 변경)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게 공지함으로써 효력이 발생합니다. 서비스는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 7일 이후부터 효력이 발생합니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제4조 (회원가입)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed mb-3">
                이용자는 서비스가 정한 가입 양식에 따라 회원 정보를 기입한 후 본 약관에 동의한다는 의사표시를 함으로써 회원가입을 신청합니다. 서비스는 다음 각 호에 해당하는 신청에 대해서는 승인을 하지 않을 수 있습니다.
              </p>
              <ul className="text-muted-foreground 300 300 leading-relaxed space-y-1 list-disc list-inside">
                <li>실명이 아니거나 타인의 명의를 이용한 경우</li>
                <li>허위 정보를 기재하거나, 서비스가 제시하는 내용을 기재하지 않은 경우</li>
                <li>이용자의 귀책사유로 인하여 승인이 불가능한 경우</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제5조 (멘토 검증)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                멘토로 활동하기 위해서는 유효한 학생증 또는 재학증명서를 제출하여 재학 여부를 검증받아야 합니다. 허위 서류 제출 시 계정이 즉시 정지되며 법적 책임을 질 수 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제6조 (서비스 이용)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed mb-3">
                이용자는 다음 행위를 해서는 안 됩니다.
              </p>
              <ul className="text-muted-foreground 300 300 leading-relaxed space-y-1 list-disc list-inside">
                <li>타인의 개인정보를 수집, 저장, 공개하는 행위</li>
                <li>서비스를 통해 알게 된 정보를 서비스 이외의 목적으로 사용하는 행위</li>
                <li>서비스의 운영을 방해하거나 안정적인 운영을 방해할 수 있는 정보를 전송하는 행위</li>
                <li>서비스를 이용하여 얻은 정보를 무단으로 복제, 유통, 조장하거나 상업적으로 이용하는 행위</li>
                <li>기타 불법적이거나 부당한 행위</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제7조 (상담 및 결제)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                상담료는 상담 유형에 따라 정해진 금액을 제시하며, 유니브매치는 별도의 중개 수수료를 받지 않습니다. 안전한 거래를 위해 대면 거래를 원칙으로 합니다. 환불 정책은 별도의 환불 정책 페이지를 참고하시기 바랍니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제8조 (책임의 한계)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                서비스는 멘토와 멘티를 연결하는 플랫폼으로서, 상담 내용의 정확성이나 결과에 대해 보증하지 않습니다. 서비스는 이용자 간의 분쟁에 대해 중재 역할을 할 수 있으나, 최종 책임은 당사자에게 있습니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제9조 (분쟁 해결)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                서비스 이용과 관련하여 분쟁이 발생한 경우, 서비스는 분쟁 해결을 위해 성실히 협의합니다. 협의가 이루어지지 않을 경우, 관련 법령에 따라 처리됩니다.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-foreground mb-3">제10조 (문의)</h2>
              <p className="text-muted-foreground 300 300 leading-relaxed">
                본 약관에 관한 문의사항은 아래 연락처로 문의하시기 바랍니다.
              </p>
              <div className="mt-3 p-4 bg-background 900 rounded-lg">
                <p className="text-foreground font-medium">유니브매치 운영팀</p>
                <p className="text-muted-foreground 300 300 text-sm mt-1">이메일: support@univmatch.com</p>
              </div>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}
