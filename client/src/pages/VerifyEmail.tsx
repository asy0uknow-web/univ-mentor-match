import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";
import { toast } from "sonner";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState<string>("");
  const [code, setCode] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);
  const [resendWaitTime, setResendWaitTime] = useState(0);

  // 인증 코드 발송
  const sendCodeMutation = trpc.auth.sendVerificationCode.useMutation();

  // 인증 코드 검증
  const verifyCodeMutation = trpc.auth.verifyCode.useMutation();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setError("이메일을 입력해주세요");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await sendCodeMutation.mutateAsync({ email });
      toast.success("인증 코드가 이메일로 발송되었습니다");
      startResendTimer();
    } catch (err: any) {
      setError(err.message || "코드 발송 실패");
      toast.error(err.message || "코드 발송 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || code.length !== 6) {
      setError("6자리 코드를 입력해주세요");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await verifyCodeMutation.mutateAsync({ email, code });
      setSuccess(true);
      toast.success("이메일 인증이 완료되었습니다!");
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "인증 실패");
      toast.error(err.message || "인증 실패");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-card dark:bg-card rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">이메일 인증</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-6">이메일로 발송된 6자리 코드를 입력해주세요</p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-semibold">✓ 이메일 인증 완료!</p>
            <p className="text-green-600 text-sm mt-2">잠시 후 홈페이지로 이동합니다...</p>
          </div>
        ) : (
          <>
            {/* 이메일 입력 */}
            {!email && (
              <form onSubmit={handleSendCode} className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    이메일
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="example@email.com"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || sendCodeMutation.isPending}
                  className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading || sendCodeMutation.isPending ? "발송 중..." : "코드 발송"}
                </button>
              </form>
            )}

            {/* 코드 입력 */}
            {email && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                  <strong>{email}</strong>로 발송된 6자리 코드를 입력해주세요
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    인증 코드
                  </label>
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                      setCode(value);
                      setError("");
                    }}
                    placeholder="6자리 코드"
                    maxLength={6}
                    className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading || code.length !== 6 || verifyCodeMutation.isPending}
                  className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading || verifyCodeMutation.isPending ? "인증 중..." : "인증하기"}
                </button>

                {/* 재발송 버튼 */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={resendWaitTime > 0 || sendCodeMutation.isPending}
                    className={`text-sm font-semibold ${
                      resendWaitTime > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-500 hover:text-blue-600 cursor-pointer"
                    }`}
                  >
                    {resendWaitTime > 0
                      ? `${formatTime(resendWaitTime)} 후 재발송 가능`
                      : "코드를 받지 못했나요? 다시 발송"}
                  </button>
                </div>

                {/* 이메일 변경 */}
                <button
                  type="button"
                  onClick={() => {
                    setEmail("");
                    setCode("");
                    setError("");
                    setResendWaitTime(0);
                  }}
                  className="w-full text-sm text-gray-500 hover:text-gray-700 py-2"
                >
                  다른 이메일 사용
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
}
