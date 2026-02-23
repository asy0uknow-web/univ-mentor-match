import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

export default function CompleteProfile() {
  const [, navigate] = useLocation();
  const [realName, setRealName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // 현재 사용자 정보 조회
  const { data: user } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "");
    }
  }, [user]);

  // 프로필 완성 API
  const completeProfileMutation = trpc.verification.completeProfile.useMutation();

  // 휴대폰 번호 포맷팅
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: "" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!realName.trim()) {
      newErrors.realName = "실명을 입력해주세요";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "휴대폰 번호를 입력해주세요";
    } else if (!/^01[0-9]-\d{3,4}-\d{4}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "올바른 휴대폰 번호 형식이 아닙니다 (예: 010-1234-5678)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await completeProfileMutation.mutateAsync({
        name: realName.trim(),
        phoneNumber,
        email: userEmail,
      });

      setSuccessMessage("프로필이 저장되었습니다.");
      setRealName("");
      setPhoneNumber("");
      setErrors({});

      // 2초 후 홈페이지로 이동
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);
    } catch (error: any) {
      setErrors({
        submit: error.message || "프로필 저장에 실패했습니다",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">프로필 완성</CardTitle>
          <CardDescription>
            실명인증을 위해 필요한 정보를 입력해주세요
          </CardDescription>
        </CardHeader>

        <CardContent>
          {successMessage && (
            <Alert className="mb-6 border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                {successMessage}
              </AlertDescription>
            </Alert>
          )}

          {errors.submit && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errors.submit}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 이메일 (읽기 전용) */}
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                value={userEmail}
                disabled
                className="bg-gray-100"
              />
              <p className="text-xs text-gray-500">
                OAuth 계정의 이메일입니다. 변경할 수 없습니다.
              </p>
            </div>

            {/* 실명 */}
            <div className="space-y-2">
              <Label htmlFor="realName">
                실명 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="realName"
                type="text"
                placeholder="홍길동"
                value={realName}
                onChange={(e) => {
                  setRealName(e.target.value);
                  if (errors.realName) {
                    setErrors({ ...errors, realName: "" });
                  }
                }}
                className={errors.realName ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.realName && (
                <p className="text-sm text-red-500">{errors.realName}</p>
              )}
            </div>

            {/* 휴대폰 번호 */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                휴대폰 번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="010-1234-5678"
                value={phoneNumber}
                onChange={handlePhoneChange}
                className={errors.phoneNumber ? "border-red-500" : ""}
                disabled={isLoading}
              />
              {errors.phoneNumber && (
                <p className="text-sm text-red-500">{errors.phoneNumber}</p>
              )}
              <p className="text-xs text-gray-500">
                휴대폰 실명인증에 사용됩니다
              </p>
            </div>



            {/* 제출 버튼 */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "프로필 저장"
              )}
            </Button>

            {/* 안내 문구 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              <p className="font-semibold mb-1">💡 다음 단계</p>
              <p>
                프로필을 저장한 후, 카카오페이 또는 NICE 실명인증을 통해 본인을 확인하게 됩니다.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
