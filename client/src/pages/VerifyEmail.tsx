import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "../lib/trpc";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [token, setToken] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState(false);

  // 회원가입 후 토큰 요청
  const requestTokenMutation = trpc.auth.requestEmailVerification.useMutation();

  // 이메일 인증
  const verifyMutation = trpc.auth.verifyEmail.useMutation();

  // 페이지 로드 시 토큰 요청
  useEffect(() => {
    const requestToken = async () => {
      try {
        setIsLoading(true);
        const result = await requestTokenMutation.mutateAsync();
        setToken(result.token);
      } catch (err: any) {
        setError(err.message || "토큰 요청 실패");
      } finally {
        setIsLoading(false);
      }
    };

    requestToken();
  }, []);

  const handleVerify = async () => {
    if (!token.trim()) {
      setError("토큰을 입력해주세요");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      await verifyMutation.mutateAsync({ token });
      setSuccess(true);
      setTimeout(() => {
        setLocation("/");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "인증 실패");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">이메일 인증</h1>
        <p className="text-center text-gray-600 mb-6">아래 토큰을 입력하여 이메일을 인증해주세요</p>

        {success ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <p className="text-green-700 font-semibold">✓ 이메일 인증 완료!</p>
            <p className="text-green-600 text-sm mt-2">잠시 후 홈페이지로 이동합니다...</p>
          </div>
        ) : (
          <>
            {/* 토큰 표시 */}
            {token && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">생성된 토큰:</p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={token}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-sm font-mono"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(token);
                      setError("복사되었습니다!");
                      setTimeout(() => setError(""), 2000);
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
                  >
                    복사
                  </button>
                </div>
              </div>
            )}

            {/* 토큰 입력 */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                토큰 입력
              </label>
              <textarea
                value={token}
                onChange={(e) => {
                  setToken(e.target.value);
                  setError("");
                }}
                placeholder="토큰을 입력하거나 위의 토큰을 복사해서 붙여넣으세요"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                rows={4}
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* 인증 버튼 */}
            <button
              onClick={handleVerify}
              disabled={isLoading || !token.trim()}
              className="w-full bg-blue-500 text-white font-semibold py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "인증 중..." : "이메일 인증"}
            </button>

            {/* 안내 메시지 */}
            <p className="text-center text-gray-500 text-xs mt-4">
              위에 표시된 토큰을 복사하여 입력 필드에 붙여넣으세요
            </p>
          </>
        )}
      </div>
    </div>
  );
}
