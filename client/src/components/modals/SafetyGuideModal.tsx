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
      title: "금전 거래 안전",
      description: "직거래 금지",
      details: [
        "반드시 유니브매치 플랫폼 내 결제 시스템을 통해서만 거래하세요.",
        "계좌이체, 현금, 카카오페이 등 외부 결제 수단은 사기의 위험이 있습니다.",
        "선금이나 보증금 요청은 절대 응하지 마세요.",
        "의심거래 발견 시 즉시 운영진에 신고하세요."
      ]
    },
    {
      icon: "🏢",
      title: "만남 안전",
      description: "공공장소에서만 만나기",
      details: [
        "첫 만남은 반드시 카페, 도서관 등 공공장소에서 진행하세요.",
        "개인 주택이나 폐쇄된 공간에서의 만남은 피하세요.",
        "만남 일정과 장소를 신뢰할 수 있는 사람에게 미리 알려주세요.",
        "불편함을 느끼면 언제든 만남을 중단할 수 있습니다."
      ]
    },
    {
      icon: "✅",
      title: "윤리 강령",
      description: "상호 존중과 신뢰",
      details: [
        "상대방을 존중하고 약속을 지키세요.",
        "차별적이거나 부적절한 언행은 금지됩니다.",
        "개인정보(연락처, 주소 등)는 필요한 경우에만 공유하세요.",
        "상담 내용은 비밀로 유지해야 합니다."
      ]
    },
    {
      icon: "🚨",
      title: "신고 방법",
      description: "문제 발생 시 즉시 신고",
      details: [
        "채팅창 내 '신고하기' 버튼을 눌러 신고하세요.",
        "신고 내용: 사기, 부적절한 언행, 규정 위반 등",
        "운영진이 24시간 이내에 확인하고 조치합니다.",
        "신고자의 정보는 보호되며, 보복은 절대 금지됩니다."
      ]
    }
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[70vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 px-6 sm:px-8 py-6 flex items-center justify-between border-b border-blue-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="text-2xl">🛡️</span>
            유니브매치 안전 가이드
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors p-1"
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
                    <h3 className="text-lg font-bold text-gray-900">{rule.title}</h3>
                    <p className="text-sm text-blue-600 font-semibold">{rule.description}</p>
                  </div>
                </div>
                <ul className="space-y-2">
                  {rule.details.map((detail, detailIndex) => (
                    <li key={detailIndex} className="text-sm text-gray-700 flex gap-3">
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
        <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors text-sm sm:text-base"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
