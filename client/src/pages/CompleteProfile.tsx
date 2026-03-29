import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { PageLayout } from "@/components/layout";
import { useAuth } from "@/_core/hooks/useAuth";
import * as Select from "@radix-ui/react-select";
import { ChevronDown } from "lucide-react";

type UserRole = "mentor" | "mentee" | null;

export default function CompleteProfile() {
  const [, navigate] = useLocation();
  const { refresh: refreshAuth } = useAuth();
  const [userRole, setUserRole] = useState<UserRole>(null);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState<"1" | "2" | "3" | "4" | "graduate" | "">("");
  const [mentorRegions, setMentorRegions] = useState<string[]>([]);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const regionDropdownRef = useRef<HTMLDivElement>(null);
  const [consultationTypes, setConsultationTypes] = useState<string[]>([]);

  const grades = [
    { value: "1", label: "1학년" },
    { value: "2", label: "2학년" },
    { value: "3", label: "3학년" },
    { value: "4", label: "4학년" },
    { value: "graduate", label: "대학원" },
  ] as const;

  const consultationTypeOptions = [
    { value: "career_counseling", label: "진로상담" },
    { value: "university_tour", label: "대학탐방" },
    { value: "resume_consulting", label: "생기부컨설팅" },
    { value: "academic_management", label: "학업관리" },
  ] as const;

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

  const toggleConsultationType = (type: string) => {
    setConsultationTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const [school, setSchool] = useState("");
  const [menteeRegion, setMenteeRegion] = useState("");

  const { data: user } = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "");
    }
  }, [user]);

  const utils = trpc.useUtils();
  const completeProfileMutation = trpc.verification.completeProfile.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
    },
  });

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 7) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(formatPhoneNumber(e.target.value));
    if (errors.phoneNumber) {
      setErrors((prev) => ({ ...prev, phoneNumber: "" }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!name.trim()) {
      setErrors((prev) => ({ ...prev, name: "이름을 입력해주세요" }));
      return;
    }
    if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
      setErrors((prev) => ({ ...prev, phoneNumber: "유효한 전화번호를 입력해주세요" }));
      return;
    }

    if (userRole === "mentor") {
      if (!university.trim()) {
        setErrors((prev) => ({ ...prev, university: "대학명을 입력해주세요" }));
        return;
      }
      if (!major.trim()) {
        setErrors((prev) => ({ ...prev, major: "전공을 입력해주세요" }));
        return;
      }
      if (!grade) {
        setErrors((prev) => ({ ...prev, grade: "학년을 선택해주세요" }));
        return;
      }
      if (mentorRegions.length === 0) {
        setErrors((prev) => ({ ...prev, mentorRegions: "상담 가능 지역을 선택해주세요" }));
        return;
      }
    } else if (userRole === "mentee") {
      if (!school.trim()) {
        setErrors((prev) => ({ ...prev, school: "학교명을 입력해주세요" }));
        return;
      }
      if (!menteeRegion) {
        setErrors((prev) => ({ ...prev, menteeRegion: "상담 희망 지역을 선택해주세요" }));
        return;
      }
    }

    setIsLoading(true);

    try {
      if (!userRole) {
        setErrors((prev) => ({ ...prev, submit: "역할을 선택해주세요" }));
        return;
      }
      await completeProfileMutation.mutateAsync({
        userRole,
        name: name.trim(),
        phoneNumber,
        email: userEmail,
        university: userRole === "mentor" ? university.trim() : undefined,
        major: userRole === "mentor" ? major.trim() : undefined,
        grade: userRole === "mentor" ? (grade as "1" | "2" | "3" | "4" | "graduate") : undefined,
        mentorRegion: userRole === "mentor" ? mentorRegions[0] : undefined,
        consultationTypes: userRole === "mentor" ? (consultationTypes as ("career_counseling" | "university_tour" | "resume_consulting" | "academic_management")[]) : undefined,
        school: userRole === "mentee" ? school.trim() : undefined,
        menteeRegion: userRole === "mentee" ? menteeRegion : undefined,
      });

      setSuccessMessage("프로필이 저장되었습니다.");
      setIsProfileSaved(true);
      setName("");
      setPhoneNumber("");
      setErrors({});

      setTimeout(async () => {
        await utils.auth.me.refetch();
        navigate("/", { replace: true });
      }, 3000);
    } catch (error: any) {
      setErrors({
        submit: error.message || "프로필 저장에 실패했습니다",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-2xl">
          <Card className="shadow-sm sm:shadow-md">
            <CardHeader className="px-3 sm:px-6 py-4 sm:py-6">
              <div className="mb-4 sm:mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs sm:text-sm font-semibold text-gray-700">진행률</span>
                  <span className="text-xs sm:text-sm font-bold text-primary">
                    {isProfileSaved ? '100%' : userRole ? '50%' : '0%'}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: isProfileSaved ? '100%' : userRole ? '50%' : '0%' }}
                  />
                </div>
              </div>

              <CardTitle className="text-lg sm:text-2xl">프로필 완성</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                유니브매치에서 시작하는 솔직한 진로 상담을 위해 기본 정보를 입력해주세요.
              </CardDescription>
            </CardHeader>

            <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
              {successMessage && (
                <Alert className="mb-4 sm:mb-6 border-green-200 bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm text-green-800">
                    {successMessage}
                  </AlertDescription>
                </Alert>
              )}

              {errors.submit && (
                <Alert className="mb-4 sm:mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                  <AlertDescription className="text-xs sm:text-sm text-red-800">
                    {errors.submit}
                  </AlertDescription>
                </Alert>
              )}

              {!userRole ? (
                <div className="space-y-3 sm:space-y-4">
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">당신의 역할을 선택해주세요</p>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      onClick={() => setUserRole("mentor")}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-xs sm:text-sm font-medium"
                    >
                      🎓 멘토
                    </button>
                    <button
                      onClick={() => setUserRole("mentee")}
                      className="p-3 sm:p-4 border-2 border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-xs sm:text-sm font-medium"
                    >
                      📚 멘티
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-xs sm:text-sm">이름 *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
                      }}
                      placeholder="이름을 입력해주세요"
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-xs sm:text-sm">전화번호 *</Label>
                    <Input
                      id="phone"
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder="010-0000-0000"
                      className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                    />
                    {errors.phoneNumber && <p className="text-xs text-red-600 mt-1">{errors.phoneNumber}</p>}
                  </div>

                  {userRole === "mentor" ? (
                    <>
                      <div>
                        <Label htmlFor="university" className="text-xs sm:text-sm">대학명 *</Label>
                        <Input
                          id="university"
                          value={university}
                          onChange={(e) => {
                            setUniversity(e.target.value);
                            if (errors.university) setErrors((prev) => ({ ...prev, university: "" }));
                          }}
                          placeholder="예: 서울대학교"
                          className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                        />
                        {errors.university && <p className="text-xs text-red-600 mt-1">{errors.university}</p>}
                      </div>

                      <div>
                        <Label htmlFor="major" className="text-xs sm:text-sm">전공 *</Label>
                        <Input
                          id="major"
                          value={major}
                          onChange={(e) => {
                            setMajor(e.target.value);
                            if (errors.major) setErrors((prev) => ({ ...prev, major: "" }));
                          }}
                          placeholder="예: 컴퓨터공학"
                          className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                        />
                        {errors.major && <p className="text-xs text-red-600 mt-1">{errors.major}</p>}
                      </div>

                      <div>
                        <Label htmlFor="grade" className="text-xs sm:text-sm">학년 *</Label>
                        <select
                          id="grade"
                          value={grade}
                          onChange={(e) => {
                            setGrade(e.target.value as any);
                            if (errors.grade) setErrors((prev) => ({ ...prev, grade: "" }));
                          }}
                          className="mt-1 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md"
                        >
                          <option value="">학년을 선택해주세요</option>
                          {grades.map((g) => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                          ))}
                        </select>
                        {errors.grade && <p className="text-xs text-red-600 mt-1">{errors.grade}</p>}
                      </div>

                      <div>
                        <Label className="text-xs sm:text-sm">상담 가능 지역 *</Label>
                        <div ref={regionDropdownRef} className="relative mt-1">
                          <button
                            type="button"
                            onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                            className="w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md text-left bg-white"
                          >
                            {mentorRegions.length > 0 ? `${mentorRegions.length}개 지역 선택됨` : "지역을 선택해주세요"}
                          </button>
                          {showRegionDropdown && (
                            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
                              {regions.map((region) => (
                                <label key={region.value} className="flex items-center px-2 sm:px-3 py-1.5 sm:py-2 hover:bg-gray-50 text-xs sm:text-sm cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={mentorRegions.includes(region.value)}
                                    onChange={() => toggleRegion(region.value)}
                                    className="mr-2"
                                  />
                                  {region.label}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        {errors.mentorRegions && <p className="text-xs text-red-600 mt-1">{errors.mentorRegions}</p>}
                      </div>

                      <div>
                        <Label className="text-xs sm:text-sm">상담 종류</Label>
                        <div className="mt-2 space-y-1.5 sm:space-y-2">
                          {consultationTypeOptions.map((type) => (
                            <label key={type.value} className="flex items-center text-xs sm:text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={consultationTypes.includes(type.value)}
                                onChange={() => toggleConsultationType(type.value)}
                                className="mr-2"
                              />
                              {type.label}
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <Label htmlFor="school" className="text-xs sm:text-sm">학교명 *</Label>
                        <Input
                          id="school"
                          value={school}
                          onChange={(e) => {
                            setSchool(e.target.value);
                            if (errors.school) setErrors((prev) => ({ ...prev, school: "" }));
                          }}
                          placeholder="예: 서울고등학교"
                          className="mt-1 text-xs sm:text-sm h-8 sm:h-10"
                        />
                        {errors.school && <p className="text-xs text-red-600 mt-1">{errors.school}</p>}
                      </div>

                      <div>
                        <Label className="text-xs sm:text-sm">상담 희망 지역 *</Label>
                        <Select.Root value={menteeRegion} onValueChange={(value) => {
                          setMenteeRegion(value);
                          if (errors.menteeRegion) setErrors((prev) => ({ ...prev, menteeRegion: "" }));
                        }}>
                          <Select.Trigger className="mt-1 w-full px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-md inline-flex items-center justify-between bg-white">
                            <Select.Value placeholder="지역을 선택해주세요" />
                            <Select.Icon className="ml-2">
                              <ChevronDown size={16} />
                            </Select.Icon>
                          </Select.Trigger>
                          <Select.Portal>
                            <Select.Content className="bg-white border border-gray-300 rounded-md shadow-lg z-50">
                              <Select.Viewport className="p-1">
                                {regions.map((region) => (
                                  <Select.Item key={region.value} value={region.value} className="px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-gray-100 rounded-md">
                                    <Select.ItemText>{region.label}</Select.ItemText>
                                  </Select.Item>
                                ))}
                              </Select.Viewport>
                            </Select.Content>
                          </Select.Portal>
                        </Select.Root>
                        {errors.menteeRegion && <p className="text-xs text-red-600 mt-1">{errors.menteeRegion}</p>}
                      </div>
                    </>
                  )}

                  <div className="flex gap-2 sm:gap-3 pt-2 sm:pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setUserRole(null)}
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      뒤로
                    </Button>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 text-xs sm:text-sm h-8 sm:h-10"
                    >
                      {isLoading && <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />}
                      프로필 저장
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
