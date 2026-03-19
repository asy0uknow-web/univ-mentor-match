import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SignUp() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [userType, setUserType] = useState<"high_school_student" | "university_student" | "">("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const signupMutation = trpc.auth.signup.useMutation();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // 이메일 검증
    if (!email) {
      newErrors.email = "이메일을 입력해주세요";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "올바른 이메일 형식이 아닙니다";
    }

    // 이름 검증
    if (!name) {
      newErrors.name = "이름을 입력해주세요";
    } else if (name.length < 2) {
      newErrors.name = "이름은 2자 이상이어야 합니다";
    }

    // 비밀번호 검증
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

    // 비밀번호 확인 검증
    if (!confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력해주세요";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    // 역할 선택 검증
    if (!userType) {
      newErrors.userType = "역할을 선택해주세요";
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
        userType: userType as "high_school_student" | "university_student",
      });

      toast.success("회원가입이 완료되었습니다!");
      navigate("/");
    } catch (error: any) {
      const errorMessage = error.message || "회원가입에 실패했습니다";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-cream-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8 max-h-[90vh] overflow-y-auto">
        <h1 className="text-3xl font-bold text-navy-900 mb-2">회원가입</h1>
        <p className="text-gray-600 mb-6">UnivMatch에 가입하세요</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* 이메일 */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-navy-900 font-semibold">
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
              className={`border-2 ${errors.email ? "border-red-500" : "border-gray-300"} focus:border-gold-500`}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-navy-900 font-semibold">
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
              className={`border-2 ${errors.name ? "border-red-500" : "border-gray-300"} focus:border-gold-500`}
            />
            {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
          </div>

          {/* 역할 선택 */}
          <div className="space-y-2">
            <Label htmlFor="userType" className="text-navy-900 font-semibold">
              역할 선택
            </Label>
            <Select value={userType} onValueChange={(value) => {
              setUserType(value as "high_school_student" | "university_student");
              if (errors.userType) {
                setErrors({ ...errors, userType: "" });
              }
            }}>
              <SelectTrigger className={`border-2 ${errors.userType ? "border-red-500" : "border-gray-300"}`}>
                <SelectValue placeholder="역할을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school_student">고등학생</SelectItem>
                <SelectItem value="university_student">대학생 (멘토)</SelectItem>
              </SelectContent>
            </Select>
            {errors.userType && <p className="text-red-500 text-sm">{errors.userType}</p>}
          </div>

          {/* 비밀번호 */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-navy-900 font-semibold">
              비밀번호
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="최소 8자, 대문자, 소문자, 숫자 포함"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) {
                  setErrors({ ...errors, password: "" });
                }
              }}
              className={`border-2 ${errors.password ? "border-red-500" : "border-gray-300"} focus:border-gold-500`}
            />
            {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            <p className="text-xs text-gray-500 mt-1">
              • 최소 8자 이상 • 대문자, 소문자, 숫자 포함
            </p>
          </div>

          {/* 비밀번호 확인 */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-navy-900 font-semibold">
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
              className={`border-2 ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:border-gold-500`}
            />
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword}</p>}
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            disabled={isLoading || signupMutation.isPending}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-lg transition-colors mt-6"
          >
            {isLoading || signupMutation.isPending ? "가입 중..." : "회원가입"}
          </Button>
        </form>

        {/* 로그인 링크 */}
        <p className="text-center text-gray-600 mt-4">
          이미 계정이 있으신가요?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-gold-500 hover:text-gold-600 font-semibold"
          >
            로그인
          </button>
        </p>
      </div>
    </div>
  );
}
