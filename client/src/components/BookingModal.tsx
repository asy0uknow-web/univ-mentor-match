import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

const CONSULTATION_TYPES = [
  { id: "career_counseling", label: "진로상담", description: "대학 선택, 전공 선택 등" },
  { id: "university_tour", label: "대학탐방", description: "캠퍼스 투어 및 설명" },
  { id: "resume_consulting", label: "생기부컨설팅", description: "자소서, 생기부 첨삭" },
  { id: "academic_management", label: "학업관리", description: "공부 방법, 시간 관리" },
];

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
];

interface BookingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mentorId: string;
  mentorName: string;
}

export function BookingModal({ isOpen, onOpenChange, mentorId, mentorName }: BookingModalProps) {
  const [step, setStep] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: () => {
      toast.success("상담이 예약되었습니다");
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast.error(error.message || "예약 실패");
    },
  });

  const resetForm = () => {
    setStep(1);
    setSelectedType("");
    setSelectedDate("");
    setSelectedTime("");
  };

  const handleNext = () => {
    if (step === 1 && !selectedType) {
      toast.error("상담 유형을 선택해주세요");
      return;
    }
    if (step === 2 && !selectedDate) {
      toast.error("날짜를 선택해주세요");
      return;
    }
    if (step === 3 && !selectedTime) {
      toast.error("시간을 선택해주세요");
      return;
    }
    setStep(step + 1);
  };

  const handlePrevious = () => {
    setStep(step - 1);
  };

  const handleConfirm = () => {
    // 날짜와 시간을 ISO 형식으로 결합
    const [year, month, day] = selectedDate.split('-');
    const [hours, minutes] = selectedTime.split(':');
    const scheduledAt = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    
    createBookingMutation.mutate({
      mentorId: parseInt(mentorId),
      consultationType: selectedType as "career_counseling" | "university_tour" | "resume_consulting" | "academic_management",
      scheduledAt: scheduledAt.toISOString(),
      duration: "1",
    });
  };

  // 최소 날짜: 내일
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split('T')[0];

  // 최대 날짜: 3개월 후
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>상담 예약</DialogTitle>
          <DialogDescription>{mentorName} 멘토와의 상담을 예약하세요</DialogDescription>
        </DialogHeader>

        {/* 스텝 표시 */}
        <div className="flex justify-between mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                  s === step
                    ? "bg-blue-600 text-white"
                    : s < step
                    ? "bg-green-600 text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              <span className="text-xs font-medium text-center">
                {s === 1 && "상담유형"}
                {s === 2 && "날짜"}
                {s === 3 && "시간"}
                {s === 4 && "확인"}
              </span>
            </div>
          ))}
        </div>

        {/* Step 1: 상담 유형 선택 */}
        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">어떤 상담을 받고 싶으신가요?</p>
            <div className="grid grid-cols-2 gap-3">
              {CONSULTATION_TYPES.map((type) => (
                <Card
                  key={type.id}
                  className={`p-4 cursor-pointer transition-all ${
                    selectedType === type.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setSelectedType(type.id)}
                >
                  <p className="font-semibold text-sm">{type.label}</p>
                  <p className="text-xs text-gray-600 mt-1">{type.description}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: 날짜 선택 */}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              언제 상담받고 싶으신가요?
            </p>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDateStr}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            {selectedDate && (
              <p className="text-xs text-gray-600">
                선택된 날짜: {new Date(selectedDate).toLocaleDateString('ko-KR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            )}
          </div>
        )}

        {/* Step 3: 시간 선택 */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              몇 시에 상담받고 싶으신가요?
            </p>
            <div className="grid grid-cols-6 gap-2">
              {TIME_SLOTS.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 px-2 text-sm font-medium rounded-lg transition-all ${
                    selectedTime === time
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: 확인 */}
        {step === 4 && (
          <div className="space-y-4">
            <p className="text-sm font-medium text-gray-700">예약 내용을 확인해주세요</p>
            <Card className="p-4 space-y-3 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">상담 유형</span>
                <Badge>{CONSULTATION_TYPES.find(t => t.id === selectedType)?.label}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">날짜</span>
                <span className="text-sm font-medium">
                  {new Date(selectedDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">시간</span>
                <span className="text-sm font-medium">{selectedTime}</span>
              </div>
            </Card>
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3 justify-end mt-8">
          {step > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              이전
            </Button>
          )}
          {step < 4 ? (
            <Button
              onClick={handleNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              다음
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={createBookingMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createBookingMutation.isPending ? "예약 중..." : "예약 확정"}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
