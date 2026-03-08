import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { PageLayout } from "@/components/layout";

type UserRole = "mentor" | "mentee" | null;

export default function CompleteProfile() {
  const [, navigate] = useLocation();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");

  // 멘토 전용 필드
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [mentorRegions, setMentorRegions] = useState<string[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const regionDropdownRef = useRef<HTMLDivElement>(null);

  const regions = [
    { value: "seoul", label: "서울" },
    { value: "gyeonggi", label: "경기" },
    { value: "incheon", label: "인천" },
    { value: "gangwon", label: "강원" },
    { value: "chungcheong", label: "충청" },
    { value: "jeolla", label: "전라" },
    { value: "gyeongsang", label: "경상" },
    { value: "jeju", label: "제주" },
  ] as const;

  // 멘티 전용 필드
  const [school, setSchool] = useState("");
  const [careerGoal, setCareerGoal] = useState("");
  const [menteeRegion, setMenteeRegion] = useState("");

  // 현재 사용자 정보 조회
  const { data: user } = trpc.auth.me.useQuery();

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "");
      // userType이 있으면 자동으로 역할 선택
      if (user.userType) {
        const role = user.userType === "university_student" ? "mentor" : "mentee";
        setUserRole(role);
      }
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

  // 한글, 영어만 허용하는 필터
  const filterSpecialCharacters = (value: string) => {
    return value.replace(/[^\uac00-\ud7a3a-zA-Z\s]/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (errors.name) setErrors({ ...errors, name: "" });
  };

  const handleNameCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const filtered = filterSpecialCharacters(e.currentTarget.value);
    setName(filtered);
  };

  const handleUniversityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUniversity(e.target.value);
    if (errors.university) setErrors({ ...errors, university: "" });
  };

  const handleUniversityCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const filtered = filterSpecialCharacters(e.currentTarget.value);
    setUniversity(filtered);
  };

  const handleMajorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMajor(e.target.value);
    if (errors.major) setErrors({ ...errors, major: "" });
  };

  const handleMajorCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    const filtered = filterSpecialCharacters(e.currentTarget.value);
    setMajor(filtered);
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "이름을 입력해주세요";
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "휴대폰 번호를 입력해주세요";
    } else if (!/^01[0-9]-?\d{3,4}-?\d{4}$/.test(phoneNumber)) {
      newErrors.phoneNumber = "유효한 휴대폰 번호를 입력해주세요";
    }

    if (userRole === "mentor") {
      if (!university.trim()) newErrors.university = "대학교를 입력해주세요";
      if (!major.trim()) newErrors.major = "학과를 입력해주세요";
      if (mentorRegions.length === 0) newErrors.mentorRegions = "상담 가능 지역을 하나 이상 선택해주세요";
    } else if (userRole === "mentee") {
      if (!school.trim()) newErrors.school = "학교를 입력해주세요";
      if (!careerGoal.trim()) newErrors.careerGoal = "희망 진로를 입력해주세요";
      if (!menteeRegion) newErrors.menteeRegion = "상담 희망 지역을 선택해주세요";
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
        name: name.trim(),
        phoneNumber,
        email: userEmail,
        userRole: userRole!,
        university: userRole === "mentor" ? university.trim() : undefined,
        major: userRole === "mentor" ? major.trim() : undefined,
        mentorRegion: userRole === "mentor" ? mentorRegions.join(",") : undefined,
        school: userRole === "mentee" ? school.trim() : undefined,
        careerGoal: userRole === "mentee" ? careerGoal.trim() : undefined,
        menteeRegion: userRole === "mentee" ? menteeRegion : undefined,
      });

      setSuccessMessage("프로필이 저장되었습니다.");
      setName("");
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

  const toggleRegion = (regionValue: string) => {
    setMentorRegions((prev) =>
      prev.includes(regionValue)
        ? prev.filter((r) => r !== regionValue)
        : [...prev, regionValue]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        regionDropdownRef.current &&
        !regionDropdownRef.current.contains(event.target as Node)
      ) {
        setShowRegionDropdown(false);
      }
    };

    if (showRegionDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showRegionDropdown]);



  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">프로필 완성</CardTitle>
            <CardDescription>
              유니브매치에서 시작하는 솔직한 진로 상담을 위해 기본 정보를 입력해주세요.
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
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  {errors.submit}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 역할 선택 */}
              {!userRole && user && !user.userType && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">
                    당신의 역할을 선택해주세요
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setUserRole("mentor")}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="font-semibold">멘토</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        대학생으로서 후배들을 멘토링
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setUserRole("mentee")}
                      className="p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <div className="font-semibold">멘티</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        대학생 멘토로부터 진로 상담 받기
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {userRole && (
                <>
                  {/* 공통 필드 */}
                  <div className="space-y-2">
                    <Label htmlFor="name">이름 *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="실명을 입력해주세요"
                      value={name}
                      onChange={handleNameChange}
                      onCompositionEnd={handleNameCompositionEnd}
                      className={errors.name ? "border-red-500" : ""}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">휴대폰 번호 *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="010-1234-5678"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      className={errors.phoneNumber ? "border-red-500" : ""}
                    />
                    {errors.phoneNumber && (
                      <p className="text-sm text-red-500">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={userEmail}
                      disabled
                      className="bg-muted"
                    />
                  </div>



                  {/* 멘니 전용 필드 */}
                  {userRole === "mentor" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="university">대학교 *</Label>
                        <Input
                          id="university"
                          type="text"
                          placeholder="예: 서울대학교"
                          value={university}
                          onChange={handleUniversityChange}
                          onCompositionEnd={handleUniversityCompositionEnd}
                          className={errors.university ? "border-red-500" : ""}
                        />
                        {errors.university && (
                          <p className="text-sm text-red-500">
                            {errors.university}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="major">학과 *</Label>
                        <Input
                          id="major"
                          type="text"
                          placeholder="예: 컴퓨터공학과"
                          value={major}
                          onChange={handleMajorChange}
                          onCompositionEnd={handleMajorCompositionEnd}
                          className={errors.major ? "border-red-500" : ""}
                        />
                        {errors.major && (
                          <p className="text-sm text-red-500">{errors.major}</p>
                        )}
                      </div>

                      {/* 상담 가능 지역 */}
                      <div className="space-y-2" ref={regionDropdownRef}>
                        <Label>상담 가능 지역 *</Label>
                        <Button
                          onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                          variant="outline"
                          className={`w-full justify-between ${
                            errors.mentorRegions ? "border-red-500" : ""
                          }`}
                        >
                          <span>
                            {mentorRegions.length > 0
                              ? `선택된 지역: ${mentorRegions.length}개`
                              : "지역을 선택해주세요"}
                          </span>
                          {mentorRegions.length > 0 && (
                            <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                              {mentorRegions.length}
                            </span>
                          )}
                        </Button>

                        {/* 드롭다운 리스트 */}
                        {showRegionDropdown && (
                          <div className="absolute z-50 w-full max-w-sm bg-background border border-border rounded-md shadow-lg mt-1">
                            <div className="p-2 space-y-1 max-h-64 overflow-y-auto">
                              {regions.map((region) => (
                                <label
                                  key={region.value}
                                  className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={mentorRegions.includes(region.value)}
                                    onChange={() => toggleRegion(region.value)}
                                    className="rounded"
                                  />
                                  <span className="text-sm">{region.label}</span>
                                </label>
                              ))}
                            </div>
                          </div>
                        )}

                        {errors.mentorRegions && (
                          <p className="text-sm text-red-500">
                            {errors.mentorRegions}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {/* 멘티 전용 필드 */}
                  {userRole === "mentee" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="school">학교 *</Label>
                        <Input
                          id="school"
                          type="text"
                          placeholder="예: 서울고등학교"
                          value={school}
                          onChange={(e) => {
                            setSchool(e.target.value);
                            if (errors.school) setErrors({ ...errors, school: "" });
                          }}
                          className={errors.school ? "border-red-500" : ""}
                        />
                        {errors.school && (
                          <p className="text-sm text-red-500">{errors.school}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="major">학과 *</Label>
                        <Input
                          id="major"
                          type="text"
                          placeholder="예: 컴퓨터공학과"
                          value={major}
                          onChange={handleMajorChange}
                          className={errors.major ? "border-red-500" : ""}
                        />
                        {errors.careerGoal && (
                          <p className="text-sm text-red-500">
                            {errors.careerGoal}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="menteeRegion">상담 희망 지역 *</Label>
                        <select
                          id="menteeRegion"
                          value={menteeRegion}
                          onChange={(e) => {
                            setMenteeRegion(e.target.value);
                            if (errors.menteeRegion)
                              setErrors({ ...errors, menteeRegion: "" });
                          }}
                          className={`w-full px-3 py-2 border rounded-md ${
                            errors.menteeRegion ? "border-red-500" : ""
                          }`}
                        >
                          <option value="">지역을 선택해주세요</option>
                          {regions.map((r) => (
                            <option key={r.value} value={r.value}>
                              {r.label}
                            </option>
                          ))}
                        </select>
                        {errors.menteeRegion && (
                          <p className="text-sm text-red-500">
                            {errors.menteeRegion}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <div className="flex gap-3 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUserRole(null)}
                      disabled={isLoading}
                    >
                      이전
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1"
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
                  </div>
                </>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
