import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

interface EmailVerificationProps {
  email: string;
  onVerified: () => void;
}

export default function EmailVerification({ email, onVerified }: EmailVerificationProps) {
  const [code, setCode] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendWaitTime, setResendWaitTime] = useState(0);
  const [isCodeSent, setIsCodeSent] = useState(false);

  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation();
  const verifyCodeMutation = trpc.auth.verifyCode.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!code) {
      newErrors.code = "인증 코드를 입력해주세요";
    } else if (code.length !== 6) {
      newErrors.code = "인증 코드는 6자리입니다";
    } else if (!/^\d+$/.test(code)) {
      newErrors.code = "인증 코드는 숫자만 입력 가능합니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrors({ email: "이메일을 입력해주세요" });
      return;
    }

    try {
      setIsLoading(true);
      setErrors({});
      await sendCodeMutation.mutateAsync({ email });
      setIsCodeSent(true);
      toast.success("인증 코드가 이메일로 발송되었습니다");
      startResendTimer();
    } catch (err: any) {
      const errorMsg = err.message || "코드 발송 실패";
      setErrors({ email: errorMsg });
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("입력 정보를 확인해주세요");
      return;
    }

    setIsLoading(true);

    try {
      await verifyCodeMutation.mutateAsync({ email, code });
      toast.success("이메일 인증이 완료되었습니다!");
      onVerified();
    } catch (error: any) {
      const errorMessage = error.message || "인증에 실패했습니다";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendWaitTime > 0) {
      toast.error(`${resendWaitTime}초 후에 다시 시도해주세요`);
      return;
    }

    try {
      await sendCodeMutation.mutateAsync({ email });
      toast.success("인증 코드가 다시 발송되었습니다");
      startResendTimer();
    } catch (error: any) {
      toast.error(error.message || "인증 코드 재발송에 실패했습니다");
    }
  };

  const startResendTimer = () => {
    setResendWaitTime(300); // 5분 = 300초

    const interval = setInterval(() => {
      setResendWaitTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // 코드 발송 전 - 버튼은 항상 표시
  if (!isCodeSent) {
    return (
      <div className="space-y-4">
        <button
          onClick={handleSendCode}
          disabled={isLoading || sendCodeMutation.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading || sendCodeMutation.isPending ? "발송 중..." : "코드 발송"}
        </button>

        {Object.values(errors).length > 0 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {Object.values(errors)[0]}
          </div>
        )}
      </div>
    );
  }

  // 코드 발송 후 - 인증 코드 입력
  return (
    <div className="space-y-4">
      <form onSubmit={handleVerify} className="space-y-4">
        {/* 인증 코드 입력 */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-sm text-navy-900 font-semibold">
            인증 코드
          </Label>
          <Input
            id="code"
            type="text"
            placeholder="6자리 코드 입력"
            value={code}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setCode(value);
              if (errors.code) {
                setErrors({ ...errors, code: "" });
              }
            }}
            maxLength={6}
            className={`text-center text-lg tracking-widest border-2 ${
              errors.code ? "border-red-500" : "border-gray-300"
            } focus:border-primary px-3 py-3`}
          />
          {errors.code && <p className="text-red-500 text-xs">{errors.code}</p>}
        </div>

        {/* 인증 버튼 */}
        <button
          type="submit"
          disabled={isLoading || verifyCodeMutation.isPending || code.length !== 6}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading || verifyCodeMutation.isPending ? "인증 중..." : "인증하기"}
        </button>
      </form>

      {/* 재발송 버튼 */}
      <div className="text-center">
        <button
          onClick={handleResend}
          disabled={resendWaitTime > 0 || sendCodeMutation.isPending}
          className={`text-sm font-semibold ${
            resendWaitTime > 0
              ? "text-gray-400 cursor-not-allowed"
              : "text-primary hover:text-primary/80 cursor-pointer"
          }`}
        >
          {resendWaitTime > 0
            ? `${formatTime(resendWaitTime)} 후 재발송 가능`
            : "코드를 받지 못했나요? 다시 발송"}
        </button>
      </div>
    </div>
  );
}
