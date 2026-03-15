import { useState, useEffect, useRef } from "react";
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
  const [isProfileSaved, setIsProfileSaved] = useState(false); // 프로필 저장 완료 상태

  // 멘토 전용 필드
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

  // 멘티 전용 필드
  const [school, setSchool] = useState("");
  const [menteeRegion, setMenteeRegion] = useState("");

  // 현재 사용자 정보 조회
  const { data: user } = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (user) {
      setUserEmail(user.email || "");
      // userType이 있어도 사용자가 역할을 직접 선택하도록 함
      // 자동 설정은 하지 않음
    }
  }, [user]);

  // 프로필 완성 API
  const utils = trpc.useUtils();
  const completeProfileMutation = trpc.verification.completeProfile.useMutation({
    onSuccess: async () => {
      // 프로필 저장 성공 후 사용자 데이터 갱신
      await utils.auth.me.invalidate();
    },
  });

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
      if (!grade) newErrors.grade = "학년을 선택해주세요";
      if (consultationTypes.length === 0) newErrors.consultationTypes = "상담 유형을 하나 이상 선택해주세요";
      if (mentorRegions.length === 0) newErrors.mentorRegions = "상담 가능 지역을 하나 이상 선택해주세요";
    } else if (userRole === "mentee") {
      if (!school.trim()) newErrors.school = "학교를 입력해주세요";
      if (!menteeRegion) newErrors.menteeRegion = "상담 희망 지역을 선택해주세요";
    }

    if (!privacyAgreed) newErrors.privacyAgreed = "개인정보처리방침에 동의해주세요";
    if (!termsAgreed) newErrors.termsAgreed = "이용약관에 동의해주세요";

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
        grade: userRole === "mentor" && grade ? (grade as "1" | "2" | "3" | "4" | "graduate") : undefined,
        consultationTypes: userRole === "mentor" ? (consultationTypes as ("career_counseling" | "university_tour" | "resume_consulting" | "academic_management")[]) : undefined,
        mentorRegion: userRole === "mentor" ? mentorRegions.join(",") : undefined,
        school: userRole === "mentee" ? school.trim() : undefined,
        menteeRegion: userRole === "mentee" ? menteeRegion : undefined,
      });

      setSuccessMessage("프로필이 저장되었습니다.");
      setIsProfileSaved(true); // 진행 바 100%로 업데이트
      setName("");
      setPhoneNumber("");
      setErrors({});

      // 사용자 데이터 갱신 (mutation의 onSuccess에서 처리됨)
      
      // 2초 후 홈페이지로 이동
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 2000);

      // 진행률을 100%로 업데이트 (선택사항)
      // setUserRole(null); // 필요시 초기화
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
      <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card>
            <CardHeader>
              {/* 진행률 표시기 */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold text-gray-700">진행률</span>
                  <span className="text-sm font-bold text-primary">{isProfileSaved ? '100%' : userRole ? '50%' : '0%'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-blue-400 h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: isProfileSaved ? '100%' : userRole ? '50%' : '0%' }}
                  />
                </div>
              </div>

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
              {!userRole && user && (
                <div className="space-y-6">
                  <div>
                    <Label className="text-lg font-bold text-gray-900">
                      당신의 역할을 선택해주세요
                    </Label>
                    <p className="text-sm text-gray-600 mt-2">
                      유니브매치에서 어떤 역할로 활동하고 싶으신가요?
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* 멘토 카드 */}
                    <button
                      type="button"
                      onClick={() => setUserRole("mentor")}
                      className="group aspect-[3/4] flex flex-col p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-green-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* 상단: 아이콘 영역 */}
                      <div className="flex-shrink-0 mb-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-100 to-green-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          👨‍🏫
                        </div>
                      </div>

                      {/* 중단: 타이틀과 설명 */}
                      <div className="flex-1 flex flex-col justify-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">멘토</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          대학생으로서 후배들의 진로를 함께 고민하고 경험을 나누며 성장하세요.
                        </p>
                      </div>

                      {/* 하단: 배지 */}
                      <div className="flex-shrink-0 flex flex-wrap gap-2">
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          경험 공유
                        </span>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          수익 창출
                        </span>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          영향력
                        </span>
                      </div>
                    </button>

                    {/* 멘티 카드 */}
                    <button
                      type="button"
                      onClick={() => setUserRole("mentee")}
                      className="group aspect-[3/4] flex flex-col p-6 bg-white border-2 border-gray-200 rounded-2xl hover:border-blue-400 hover:shadow-lg transition-all duration-300 overflow-hidden"
                    >
                      {/* 상단: 아이콘 영역 */}
                      <div className="flex-shrink-0 mb-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                          👨‍🎓
                        </div>
                      </div>

                      {/* 중단: 타이틀과 설명 */}
                      <div className="flex-1 flex flex-col justify-center mb-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">멘티</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          대학생 멘토로부터 진로 상담을 받고 미래의 방향을 함께 찾아보세요.
                        </p>
                      </div>

                      {/* 하단: 배지 */}
                      <div className="flex-shrink-0 flex flex-wrap gap-2">
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          진로 상담
                        </span>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          경험 학습
                        </span>
                        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          성장
                        </span>
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

                      {/* 학년 선택 */}
                      <div className="space-y-2">
                        <Label htmlFor="grade">학년 *</Label>
                        <select
                          id="grade"
                          value={grade}
                          onChange={(e) => setGrade(e.target.value as any)}
                          className="w-full px-3 py-2 border border-border rounded-md bg-background"
                        >
                          <option value="">학년을 선택해주세요</option>
                          {grades.map((g) => (
                            <option key={g.value} value={g.value}>
                              {g.label}
                            </option>
                          ))}
                        </select>
                        {errors.grade && (
                          <p className="text-sm text-red-500">{errors.grade}</p>
                        )}
                      </div>

                      {/* 상담 유형 선택 */}
                      <div className="space-y-2">
                        <Label>상담 유형 *</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {consultationTypeOptions.map((type) => (
                            <label
                              key={type.value}
                              className="flex items-center gap-2 p-2 border border-border rounded-md hover:bg-muted cursor-pointer transition-colors"
                            >
                              <input
                                type="checkbox"
                                checked={consultationTypes.includes(type.value)}
                                onChange={() => toggleConsultationType(type.value)}
                                className="rounded"
                              />
                              <span className="text-sm">{type.label}</span>
                            </label>
                          ))}
                        </div>
                        {errors.consultationTypes && (
                          <p className="text-sm text-red-500">
                            {errors.consultationTypes}
                          </p>
                        )}
                      </div>

                      {/* 상담 가능 지역 */}
                      <div className="space-y-2" ref={regionDropdownRef}>
                        <Label>상담 가능 지역 *</Label>
                        <Button
                          type="button"
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

                  {/* 개인정보 동의 */}
                  <div className="space-y-3 pt-2 border-t border-gray-200">
                    <p className="text-sm font-semibold text-gray-700">약관 동의 (필수)</p>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={privacyAgreed}
                        onChange={(e) => {
                          setPrivacyAgreed(e.target.checked);
                          if (errors.privacyAgreed) setErrors({ ...errors, privacyAgreed: "" });
                        }}
                        className="mt-0.5 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        (필수){" "}
                        <Link href="/privacy-policy" target="_blank" className="text-primary underline hover:text-primary/80">
                          개인정보처리방침
                        </Link>
                        에 동의합니다.
                      </span>
                    </label>
                    {errors.privacyAgreed && (
                      <p className="text-sm text-red-500 ml-7">{errors.privacyAgreed}</p>
                    )}

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => {
                          setTermsAgreed(e.target.checked);
                          if (errors.termsAgreed) setErrors({ ...errors, termsAgreed: "" });
                        }}
                        className="mt-0.5 rounded"
                      />
                      <span className="text-sm text-gray-700">
                        (필수){" "}
                        <Link href="/terms" target="_blank" className="text-primary underline hover:text-primary/80">
                          이용약관
                        </Link>
                        에 동의합니다.
                      </span>
                    </label>
                    {errors.termsAgreed && (
                      <p className="text-sm text-red-500 ml-7">{errors.termsAgreed}</p>
                    )}
                  </div>

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
      </div>
    </PageLayout>
  );
}
