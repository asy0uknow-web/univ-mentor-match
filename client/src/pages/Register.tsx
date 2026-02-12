import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const GRADE_OPTIONS = [
  { value: "1", label: "1학년" },
  { value: "2", label: "2학년" },
  { value: "3", label: "3학년" },
  { value: "4", label: "4학년" },
  { value: "graduate", label: "대학원" },
] as const;

export default function Register() {
  const [, navigate] = useLocation();

  const meQuery = trpc.auth.me.useQuery(undefined, { retry: false });

  const [form, setForm] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    realName: "",
    university: "",
    major: "",
    grade: "" as string,
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [usernameChecked, setUsernameChecked] = useState<boolean | null>(null);
  const [usernameCheckLoading, setUsernameCheckLoading] = useState(false);

  const checkUsernameQuery = trpc.user.checkUsername.useQuery(
    { username: form.username },
    {
      enabled: false,
    }
  );

  const registrationMutation = trpc.user.completeRegistration.useMutation({
    onSuccess: () => {
      toast.success("회원가입이 완료되었습니다. 유니브매치에 오신 것을 환영합니다!");
      navigate("/");
    },
    onError: (error) => {
      toast.error(`회원가입 실패: ${error.message}`);
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (meQuery.isError || (!meQuery.isLoading && !meQuery.data)) {
      navigate("/");
    }
  }, [meQuery.isError, meQuery.isLoading, meQuery.data, navigate]);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "username") {
      setUsernameChecked(null);
    }
  };

  const handleCheckUsername = async () => {
    if (!form.username || form.username.length < 2) {
      toast.error("아이디를 2자 이상 입력해주세요.");
      return;
    }
    setUsernameCheckLoading(true);
    try {
      const result = await checkUsernameQuery.refetch();
      setUsernameChecked(result.data?.available ?? false);
      if (result.data?.available) {
        toast.success("사용 가능한 아이디입니다.");
      } else {
        toast.error("이미 사용 중인 아이디입니다.");
      }
    } catch {
      toast.error("아이디 확인에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setUsernameCheckLoading(false);
    }
  };

  // Password validation
  const passwordRegex =
    /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,12}$/;
  const isPasswordValid = passwordRegex.test(form.password);
  const isConfirmMatch =
    form.confirmPassword.length > 0 &&
    form.password === form.confirmPassword;

  // Phone formatting
  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhone(value);
    setForm((prev) => ({ ...prev, phone: formatted }));
  };

  const isFormValid =
    form.username.length >= 2 &&
    usernameChecked === true &&
    isPasswordValid &&
    isConfirmMatch &&
    form.realName.length >= 1 &&
    form.university.length >= 1 &&
    form.major.length >= 1 &&
    form.grade !== "" &&
    form.phone.replace(/\D/g, "").length >= 10;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    registrationMutation.mutate({
      username: form.username,
      password: form.password,
      realName: form.realName,
      university: form.university,
      major: form.major,
      grade: form.grade as "1" | "2" | "3" | "4" | "graduate",
      phone: form.phone.replace(/\D/g, ""),
    });
  };

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8faf8] to-[#eef2ee]">
        <Loader2 className="w-8 h-8 animate-spin text-[#7c9473]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f8faf8] to-[#eef2ee] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2d3a2d] mb-2">회원가입</h1>
          <p className="text-[#5a6b5a]">
            유니브매치에 오신 것을 환영합니다. 아래 정보를 입력해주세요.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-[#e0e8e0] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* 1. 아이디 */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#2d3a2d] font-medium">
                아이디 <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="username"
                    placeholder="아이디를 입력하세요"
                    value={form.username}
                    onChange={(e) => handleChange("username", e.target.value)}
                    className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20"
                  />
                  {usernameChecked !== null && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                    </span>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCheckUsername}
                  disabled={usernameCheckLoading || form.username.length < 2}
                  className="border-[#7c9473] text-[#7c9473] hover:bg-[#7c9473]/10 whitespace-nowrap"
                >
                  {usernameCheckLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "중복 확인"
                  )}
                </Button>
              </div>
            </div>

            {/* 2. 비밀번호 */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#2d3a2d] font-medium">
                비밀번호 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="영문, 특수문자 포함 9~12자리"
                  value={form.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a8a] hover:text-[#5a6b5a]"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {form.password.length > 0 && (
                <p
                  className={`text-xs ${
                    isPasswordValid ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isPasswordValid
                    ? "사용 가능한 비밀번호입니다"
                    : "영문, 특수문자를 포함한 9~12자리를 입력해주세요"}
                </p>
              )}
            </div>

            {/* 3. 비밀번호 확인 */}
            <div className="space-y-2">
              <Label
                htmlFor="confirmPassword"
                className="text-[#2d3a2d] font-medium"
              >
                비밀번호 확인 <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="비밀번호를 다시 입력하세요"
                  value={form.confirmPassword}
                  onChange={(e) =>
                    handleChange("confirmPassword", e.target.value)
                  }
                  className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a8a] hover:text-[#5a6b5a]"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
              {form.confirmPassword.length > 0 && (
                <p
                  className={`text-xs ${
                    isConfirmMatch ? "text-green-600" : "text-red-500"
                  }`}
                >
                  {isConfirmMatch
                    ? "비밀번호가 일치합니다"
                    : "비밀번호가 일치하지 않습니다"}
                </p>
              )}
            </div>

            {/* 4. 이름 (실명) */}
            <div className="space-y-2">
              <Label htmlFor="realName" className="text-[#2d3a2d] font-medium">
                이름 (실명) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="realName"
                placeholder="실명을 입력하세요"
                value={form.realName}
                onChange={(e) => handleChange("realName", e.target.value)}
                className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20"
              />
            </div>

            {/* 5. 대학 */}
            <div className="space-y-2">
              <Label
                htmlFor="university"
                className="text-[#2d3a2d] font-medium"
              >
                대학교 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="university"
                placeholder="대학교명을 입력하세요"
                value={form.university}
                onChange={(e) => handleChange("university", e.target.value)}
                className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20"
              />
            </div>

            {/* 6. 전공 */}
            <div className="space-y-2">
              <Label htmlFor="major" className="text-[#2d3a2d] font-medium">
                전공 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="major"
                placeholder="전공을 입력하세요"
                value={form.major}
                onChange={(e) => handleChange("major", e.target.value)}
                className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20"
              />
            </div>

            {/* 7. 학년 */}
            <div className="space-y-2">
              <Label className="text-[#2d3a2d] font-medium">
                학년 <span className="text-red-500">*</span>
              </Label>
              <Select
                value={form.grade}
                onValueChange={(value) => handleChange("grade", value)}
              >
                <SelectTrigger className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20">
                  <SelectValue placeholder="학년을 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {GRADE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 8. 전화번호 */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[#2d3a2d] font-medium">
                전화번호 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                placeholder="010-0000-0000"
                value={form.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className="border-[#d0d8d0] focus:border-[#7c9473] focus:ring-[#7c9473]/20"
                maxLength={13}
              />
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={!isFormValid || registrationMutation.isPending}
              className="w-full bg-[#7c9473] hover:bg-[#6b8363] text-white py-3 text-base font-medium rounded-xl mt-4 disabled:opacity-50"
            >
              {registrationMutation.isPending ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  처리 중...
                </span>
              ) : (
                "회원가입 완료"
              )}
            </Button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-[#8a9a8a] mt-6">
          회원가입 시 유니브매치의 서비스 이용약관 및 개인정보처리방침에
          동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
