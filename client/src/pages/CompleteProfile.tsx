import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function CompleteProfile() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [realName, setRealName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const completeProfileMutation = trpc.verification.completeProfile.useMutation();

  // 휴대폰 번호 자동 포맷팅
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 휴대폰 번호 검증
      const phoneRegex = /^01[0-9]-\d{3,4}-\d{4}$/;
      if (!phoneRegex.test(phoneNumber)) {
        setError("올바른 휴대폰 번호 형식이 아닙니다. (예: 010-1234-5678)");
        setLoading(false);
        return;
      }

      if (!user?.email) {
        setError("사용자 이메일을 찾을 수 없습니다.");
        setLoading(false);
        return;
      }

      await completeProfileMutation.mutateAsync({
        realName,
        phoneNumber,
        email: user.email,
      });

      // 성공 후 홈으로 이동
      navigate("/");
    } catch (err) {
      console.error("[CompleteProfile] Error:", err);
      const errorMessage = err instanceof Error ? err.message : "프로필 저장 중 오류가 발생했습니다.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">프로필 완성</h1>
          <p className="text-gray-600 mb-6">추가 정보를 입력해주세요.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 이름 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름 (본명)
              </label>
              <input
                type="text"
                value={realName}
                onChange={(e) => setRealName(e.target.value)}
                placeholder="홍길동"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* 휴대폰 번호 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                휴대폰 번호
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder="010-1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                required
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading || !realName || !phoneNumber}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              {loading ? "저장 중..." : "프로필 저장"}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-4">
            이 정보는 나중에 마이페이지에서 수정할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
