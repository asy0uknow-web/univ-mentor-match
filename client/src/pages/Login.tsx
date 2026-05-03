import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  const loginMutation = trpc.auth.login.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!email) {
      newErrors.email = "이메일을 입력해주세요";
    }
    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("[Login] Form submitted", { email, password: "***" });

    if (!validateForm()) {
      console.log("[Login] Form validation failed");
      toast.error("입력 정보를 확인해주세요");
      return;
    }

    setIsLoading(true);
    try {
      console.log("[Login] Starting login mutation...");
      const response = await loginMutation.mutateAsync({
        email,
        password,
      });

      console.log("[Login] Login response:", response);

      if (response.user) {
        console.log("[Login] User data received:", response.user);
        
        // Invalidate and refetch user data
        await queryClient.invalidateQueries();
        const userData = await queryClient.refetchQueries();
        console.log("[Login] Refetched queries:", userData);

        toast.success("로그인이 완료되었습니다!");

        // Determine redirect destination
        if (response.user.role === "admin") {
          console.log("[Login] Redirecting to /admin");
          navigate("/admin");
        } else if (!response.user.name || !response.user.userType) {
          console.log("[Login] Redirecting to /complete-profile (incomplete profile)");
          navigate("/complete-profile");
        } else {
          console.log("[Login] Redirecting to / (home)");
          navigate("/");
        }
      } else {
        console.error("[Login] No user data in response");
        toast.error("로그인에 실패했습니다");
      }
    } catch (error: any) {
      console.error("[Login] Login error:", error);
      const errorMessage = error?.message || "로그인에 실패했습니다";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-1 sm:mb-2">로그인</h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">UnivMatch에 로그인하세요</p>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* 이메일 */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="email" className="text-xs sm:text-sm text-navy-900 font-semibold">
              이메일
            </Label>
            <Input
              id="email"
              type="text"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              className={`text-xs sm:text-sm border-2 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-gold-500 px-3 py-2`}
            />
            {errors.email && <p className="text-red-500 text-xs">{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="password" className="text-xs sm:text-sm text-navy-900 font-semibold">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="비밀번호를 입력해주세요"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              className={`text-xs sm:text-sm border-2 ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-gold-500 px-3 py-2`}
            />
            {errors.password && <p className="text-red-500 text-xs">{errors.password}</p>}
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={isLoading || loginMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white text-sm sm:text-base font-semibold py-2 sm:py-3 rounded-lg transition-colors mt-2"
          >
            {isLoading || loginMutation.isPending ? "로그인 중..." : "로그인"}
          </Button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-xs sm:text-sm text-gray-600 mt-4 sm:mt-6">
          계정이 없으신가요?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-gold-500 hover:text-gold-600 font-semibold"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}
