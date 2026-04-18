import { X } from "lucide-react";

interface SafetyGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SafetyGuideModal({ isOpen, onClose }: SafetyGuideModalProps) {
  if (!isOpen) return null;

  const safetyRules = [
    {
      icon: "💰",
      title: "직접 결제 안전",
      description: "신중한 송금과 기록 유지",
      details: [
        "분할 결제 권장: 처음부터 고액의 상담료를 한꺼번에 입금하기보다, 1회차 상담 후 결제하거나 회차별로 나누어 송금하는 것을 권장합니다.",
        "예금주 확인: 송금 전, 대화 중 확인한 멘토의 실명과 계좌 예금주가 일치하는지 반드시 확인하세요.",
        "기록 보존: 입금 내역, 대화 캡처 등 거래 증빙 자료는 상담이 완전히 종료될 때까지 반드시 보관하세요. 문제가 발생했을 때 중요한 근거가 됩니다.",
        "과도한 선금 주의: 무리한 보증금이나 장기 결제를 강요하는 경우 상담을 중단하고 신중히 결정하세요."
      ]
    },
    {
      icon: "🏢",
      title: "만남 안전",
      description: "공공장소에서만 만나기",
      details: [
        "첫 만남은 반드시 공공장소: 카페, 스터디룸, 학교 도서관 등 유동인구가 많은 밝은 장소에서 만나세요.",
        "폐쇄 공간 기피: 개인 주택, 자취방 또는 인적이 드문 폐쇄된 공간에서의 상담은 절대 피해야 합니다.",
        "일정 공유: 상담 장소와 시간을 가족이나 지인에게 미리 공유해 두세요.",
        "중단 권리: 상담 중 조금이라도 위협이나 불편함을 느낀다면 즉시 자리를 피하고 도움을 요청하세요."
      ]
    },
    {
      icon: "✅",
      title: "윤리 강령",
      description: "상호 존중과 신뢰",
      details: [
        "매너 채팅: 서로의 인격을 존중하고 약속 시간을 엄격히 지켜주세요.",
        "사적 연락 금지: 상담 목적 외의 사적인 연락이나 과도한 일상 공유 요구는 자제해야 합니다.",
        "정보 보호: 상담 과정에서 알게 된 서로의 개인정보나 학습 비밀을 외부로 유출하지 마세요.",
        "성실 의무: 멘토는 약속한 상담 시간을 준수하고, 멘티의 성장을 위해 최선을 다해 노하우를 공유합니다."
      ]
    },
    {
      icon: "🚨",
      title: "신고 방법",
      description: "문제 발생 시 즉시 신고",
      details: [
        "운영진 제보: 상담 중 사기 의심, 부적절한 언행, 성희롱 등이 발생하면 즉시 지원팀 메일로 제보해 주세요.",
        "플랫폼 조치: 유니브매치는 금전적 손실을 직접 배상해 드리기는 어려우나, 사실 확인 후 해당 유저를 영구 제명하여 추가 피해를 막습니다.",
        "증거 제출: 신고 시 관련 대화 캡처나 통화 녹음 등을 첨부해 주시면 더 신속한 처리가 가능합니다."
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-card  rounded-3xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 sm:px-8 py-6 flex items-center justify-between border-b border-blue-200">
          <h2 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            유니브매치 안전 가이드
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            aria-label="닫기"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 sm:px-8 py-8">
          <div className="space-y-8">
            {safetyRules.map((rule, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">{rule.icon}</span>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{rule.title}</h3>
                    <p className="text-sm text-blue-600 font-semibold">{rule.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {rule.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-sm text-foreground flex gap-3">
                      <span className="text-blue-500 font-bold">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-background 900 px-6 sm:px-8 py-6 border-t border-border 700 700 flex gap-3 justify-end items-center">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base flex items-center justify-center h-10"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
