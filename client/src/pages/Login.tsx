import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Login() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();
  
  useAuth({ redirectOnUnauthenticated: false });

  const loginMutation = trpc.auth.login.useMutation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[Login] Form submitted with:", { email, password });
    
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = "이메일을 입력해주세요";
    if (!password) newErrors.password = "비밀번호를 입력해주세요";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      toast.error("입력 정보를 확인해주세요");
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      console.log("[Login] Calling login mutation...");
      const response = await loginMutation.mutateAsync({ email, password });
      console.log("[Login] Login response:", response);

      toast.success("로그인이 완료되었습니다!");

      // 쿼리 캐시 무효화
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      
      // 새로운 사용자 정보 조회
      await queryClient.refetchQueries({ queryKey: ["auth", "me"] });
      console.log("[Login] User data refetched");

      // 페이지 이동
      setTimeout(() => {
        if (response.user?.role === "admin") {
          navigate("/admin");
        } else if (!response.user?.name || !response.user?.userType) {
          navigate("/complete-profile");
        } else {
          navigate("/");
        }
      }, 500);
    } catch (error: any) {
      console.error("[Login] Error:", error);
      const errorMessage = error.message || "로그인에 실패했습니다";
      toast.error(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md card-premium-lg p-6 sm:p-10">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">로그인</h1>
          <p className="text-base text-muted-foreground">유니브매치에 로그인하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-foreground">
              이메일
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  setErrors({ ...errors, email: "" });
                }
              }}
              disabled={isLoading}
              className={`text-sm border ${errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"} px-4 py-2.5 rounded-md transition-colors`}
            />
            {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
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
              disabled={isLoading}
              className={`text-sm border ${errors.password ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"} px-4 py-2.5 rounded-md transition-colors`}
            />
            {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
          </div>

          {/* 로그인 버튼 */}
          <Button
            type="submit"
            disabled={isLoading || loginMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white text-base font-semibold py-3 rounded-md transition-all duration-200 shadow-md hover:shadow-lg mt-4 flex items-center justify-center gap-2"
          >
            {isLoading || loginMutation.isPending ? "로그인 중..." : (
              <>
                로그인
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* 회원가입 링크 */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          계정이 없으신가요?{" "}
          <button
            onClick={() => navigate("/signup")}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            회원가입
          </button>
        </p>
      </div>
    </div>
  );
}
