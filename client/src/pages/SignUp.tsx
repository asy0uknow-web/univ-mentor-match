import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import EmailVerification from "./EmailVerification";
import { ArrowRight } from "lucide-react";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"email" | "form">("email"); // 단계: 이메일 인증 또는 회원가입 폼
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const signupMutation = trpc.auth.signup.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    if (!name) {
      newErrors.name = "이름을 입력해주세요";
    } else if (name.length < 2) {
      newErrors.name = "이름은 2자 이상이어야 합니다";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
    } else if (password.length < 8) {
      newErrors.password = "비밀번호는 최소 8자 이상이어야 합니다";
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "비밀번호는 대문자를 포함해야 합니다";
    } else if (!/[a-z]/.test(password)) {
      newErrors.password = "비밀번호는 소문자를 포함해야 합니다";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "비밀번호는 숫자를 포함해야 합니다";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("입력 정보를 확인해주세요");
      return;
    }

    setIsLoading(true);

    try {
      await signupMutation.mutateAsync({
        email,
        password,
        name,
        userType: undefined as any,
      });

      toast.success("회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (error: any) {
      const errorMessage = error.message || "회원가입에 실패했습니다";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailVerified = () => {
    setStep("form");
    toast.success("이메일 인증이 완료되었습니다. 회원가입을 진행해주세요.");
  };

  if (step === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-3 sm:p-4">
        <div className="w-full max-w-md card-premium-lg p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">회원가입</h1>
            <p className="text-base text-muted-foreground">이메일 인증 후 가입하세요</p>
          </div>

          <div className="space-y-5">
            <div>
              <Label className="text-sm font-semibold text-foreground mb-2 block">
                이메일
              </Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                className="text-sm border border-border px-4 py-2.5 rounded-md focus:border-primary transition-colors"
              />
            </div>
            <EmailVerification email={email} onVerified={handleEmailVerified} />
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:text-primary/80 font-semibold transition-colors"
            >
              로그인
            </button>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md card-premium-lg p-6 sm:p-10 max-h-[90vh] overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">회원가입</h1>
          <p className="text-base text-muted-foreground">유니브매치에 가입하세요</p>
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
              className={`text-sm border ${errors.email ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"} px-4 py-2.5 rounded-md transition-colors`}
            />
            {errors.email && <p className="text-red-500 text-xs font-medium">{errors.email}</p>}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-semibold text-foreground">
              이름
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="홍길동"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: "" });
                }
              }}
              className={`text-sm border ${errors.name ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"} px-4 py-2.5 rounded-md transition-colors`}
            />
            {errors.name && <p className="text-red-500 text-xs font-medium">{errors.name}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-semibold text-foreground">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="최소 8자, 대문자, 소문자, 숫자"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              className={`text-sm border ${errors.password ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"} px-4 py-2.5 rounded-md transition-colors`}
            />
            {errors.password && <p className="text-red-500 text-xs font-medium">{errors.password}</p>}
            <p className="text-xs text-muted-foreground mt-1.5">
              최소 8자 이상, 대문자, 소문자, 숫자 포함
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
              비밀번호 확인
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="비밀번호를 다시 입력해주세요"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: "" });
                }
              }}
              className={`text-sm border ${errors.confirmPassword ? "border-red-500 focus:border-red-500" : "border-border focus:border-primary"} px-4 py-2.5 rounded-md transition-colors`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-xs font-medium">{errors.confirmPassword}</p>}
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={isLoading || signupMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white text-base font-semibold py-3 rounded-md transition-all duration-200 shadow-premium-md hover:shadow-premium-lg mt-6 flex items-center justify-center gap-2"
          >
            {isLoading || signupMutation.isPending ? "가입 중..." : (
              <>
                회원가입
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center text-sm text-muted-foreground mt-6">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-primary hover:text-primary/80 font-semibold transition-colors"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
