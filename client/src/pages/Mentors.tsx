import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, X, ChevronRight, Star, MapPin, BadgeCheck } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { getUniversityLogo } from "@/const/universities";
import { COLLEGES, getMajorNames } from "@/const/majors";

const REGIONS = [
  { value: "seoul", label: "서울" },
  { value: "gyeonggi", label: "경기" },
  { value: "incheon", label: "인천" },
  { value: "gangwon", label: "강원" },
  { value: "chungcheong", label: "충청" },
  { value: "jeolla", label: "전라" },
  { value: "gyeongsang", label: "경상" },
  { value: "jeju", label: "제주" },
] as const;

const GRADES = [
  { value: "1", label: "1학년" },
  { value: "2", label: "2학년" },
  { value: "3", label: "3학년" },
  { value: "4", label: "4학년" },
  { value: "graduate", label: "대학원" },
] as const;

// 전공 ID를 field enum으로 매핑하는 함수
const getMajorFieldMapping = (majorId: string): string | null => {
  const fieldMap: Record<string, string> = {
    // 문과대학
    korean_lang_lit: "humanities",
    philosophy: "humanities",
    korean_history: "humanities",
    history: "humanities",
    sociology: "humanities",
    chinese_classics: "humanities",
    english_lit: "humanities",
    german_lit: "humanities",
    french_lit: "humanities",
    chinese_lit: "humanities",
    russian_lit: "humanities",
    japanese_lit: "humanities",
    spanish_lit: "humanities",
    linguistics: "humanities",
    // 정경대학
    political_science: "humanities",
    economics: "business",
    statistics: "natural_science",
    public_admin: "humanities",
    // 경영대학
    business_admin: "business",
    // 이과대학
    mathematics: "natural_science",
    physics: "natural_science",
    chemistry: "natural_science",
    earth_science: "natural_science",
    // 공과대학
    chemical_eng: "engineering",
    materials_eng: "engineering",
    civil_eng: "engineering",
    architecture: "engineering",
    mechanical_eng: "engineering",
    industrial_eng: "engineering",
    electrical_eng: "engineering",
    energy_eng: "engineering",
    semiconductor_eng: "engineering",
    communication_eng: "engineering",
    // 의과대학
    medicine: "medicine",
    // 사범대학
    education: "education",
    korean_education: "education",
    english_education: "education",
    geography_education: "education",
    history_education: "education",
    home_economics_education: "education",
    math_education: "education",
    physical_education: "education",
    // 간호대학
    nursing: "liberal_arts",
  };
  return fieldMap[majorId] || null;
};

export default function Mentors() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [showMajorPanel, setShowMajorPanel] = useState(false);
  const [tempSelectedMajors, setTempSelectedMajors] = useState<string[]>([]);
  const [majorSearchTerm, setMajorSearchTerm] = useState("");
  const [showRegionPanel, setShowRegionPanel] = useState(false);
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);
  const [regionSearchTerm, setRegionSearchTerm] = useState("");

  useEffect(() => {
    setPageMeta(PAGE_META.mentors);
  }, []);

  // 검색 버튼 클릭 또는 Enter 키 처리
  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 지역 필터 적용
  const handleApplyRegionFilter = () => {
    setSelectedRegions(tempSelectedRegions);
    setShowRegionPanel(false);
  };

  // 지역 필터 취소
  const handleCancelRegionFilter = () => {
    setTempSelectedRegions(selectedRegions);
    setShowRegionPanel(false);
  };

  // 전공 필터 적용
  const handleApplyMajorFilter = () => {
    setSelectedMajors(tempSelectedMajors);
    setShowMajorPanel(false);
  };

  // 전공 필터 취소
  const handleCancelMajorFilter = () => {
    setTempSelectedMajors(selectedMajors);
    setShowMajorPanel(false);
  };

  // 지역 필터 초기화
  const handleResetRegionFilter = () => {
    setSelectedRegions([]);
    setTempSelectedRegions([]);
  };

  // 전공 필터 초기화
  const handleResetMajorFilter = () => {
    setSelectedMajors([]);
    setTempSelectedMajors([]);
  };

  // 멘토 데이터 조회
  const { data: mentorsData, isLoading } = trpc.mentor.listAll.useQuery();

  // 필터링된 멘토 목록
  const filteredMentors = useMemo(() => {
    if (!mentorsData) return [];

    return mentorsData.filter((mentor) => {
      const profile = mentor.profile;
      
      // 검색어 필터링 (대학, 전공, 이름)
      if (debouncedSearch.trim()) {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch =
          (profile?.university?.toLowerCase() || "").includes(searchLower) ||
          (profile?.major?.toLowerCase() || "").includes(searchLower) ||
          (mentor.user?.name?.toLowerCase() || "").includes(searchLower);
        if (!matchesSearch) return false;
      }

      // 지역 필터링
      if (selectedRegions.length > 0) {
        if (!profile?.region || !selectedRegions.includes(profile.region)) {
          return false;
        }
      }

      // 전공 필터링 (전공 ID를 field enum으로 매핑)
      if (selectedMajors.length > 0) {
        const matchesField = selectedMajors.some((majorId) => {
          const field = getMajorFieldMapping(majorId);
          return field && profile?.field === field;
        });
        if (!matchesField) return false;
      }

      return true;
    });
  }, [mentorsData, debouncedSearch, selectedRegions, selectedMajors]);

  // 필터링된 학과 목록
  const filteredMajorsBySearch = useMemo(() => {
    if (!majorSearchTerm.trim()) {
      return COLLEGES.flatMap((college) => college.majors);
    }

    const lowerSearchTerm = majorSearchTerm.toLowerCase();
    return COLLEGES.flatMap((college) =>
      college.majors.filter((major) =>
        major.name.toLowerCase().includes(lowerSearchTerm)
      )
    );
  }, [majorSearchTerm]);

  // 필터링된 지역 목록
  const filteredRegionsBySearch = useMemo(() => {
    if (!regionSearchTerm.trim()) {
      return REGIONS;
    }

    const lowerSearchTerm = regionSearchTerm.toLowerCase();
    return REGIONS.filter((region) =>
      region.label.toLowerCase().includes(lowerSearchTerm)
    );
  }, [regionSearchTerm]);

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">멘토 찾기</h1>
          <p className="text-gray-600 mt-2">
            당신의 진로를 함께할 멘토를 찾아보세요
          </p>
        </div>

        {/* 검색 및 필터 섹션 */}
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          {/* 검색바 */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="멘토 이름, 대학, 전공으로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              검색
            </Button>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2 flex-wrap">
            {/* 지역 필터 */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowRegionPanel(!showRegionPanel);
                  setTempSelectedRegions(selectedRegions);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                지역 선택
                {selectedRegions.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">
                    {selectedRegions.length}
                  </span>
                )}
              </button>

              {showRegionPanel && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-64">
                  {/* 지역 검색 */}
                  <input
                    type="text"
                    placeholder="지역 검색..."
                    value={regionSearchTerm}
                    onChange={(e) => setRegionSearchTerm(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* 지역 목록 */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredRegionsBySearch.map((region) => (
                      <label
                        key={region.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedRegions.includes(region.value)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempSelectedRegions([
                                ...tempSelectedRegions,
                                region.value,
                              ]);
                            } else {
                              setTempSelectedRegions(
                                tempSelectedRegions.filter(
                                  (r) => r !== region.value
                                )
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{region.label}</span>
                      </label>
                    ))}
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleApplyRegionFilter}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      적용
                    </button>
                    <button
                      onClick={handleCancelRegionFilter}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 분야 필터 */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowMajorPanel(!showMajorPanel);
                  setTempSelectedMajors(selectedMajors);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
              >
                분야 선택
                {selectedMajors.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-sm">
                    {selectedMajors.length}
                  </span>
                )}
              </button>

              {showMajorPanel && (
                <div className="absolute top-full left-0 mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-10 w-80">
                  {/* 전공 검색 */}
                  <input
                    type="text"
                    placeholder="전공 검색..."
                    value={majorSearchTerm}
                    onChange={(e) => setMajorSearchTerm(e.target.value)}
                    className="w-full mb-3 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {/* 전공 목록 */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredMajorsBySearch.map((major) => (
                      <label
                        key={major.id}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={tempSelectedMajors.includes(major.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTempSelectedMajors([
                                ...tempSelectedMajors,
                                major.id,
                              ]);
                            } else {
                              setTempSelectedMajors(
                                tempSelectedMajors.filter((m) => m !== major.id)
                              );
                            }
                          }}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">{major.name}</span>
                      </label>
                    ))}
                  </div>

                  {/* 버튼 */}
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={handleApplyMajorFilter}
                      className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                    >
                      적용
                    </button>
                    <button
                      onClick={handleCancelMajorFilter}
                      className="flex-1 bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
                    >
                      취소
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 필터 초기화 */}
            {(selectedRegions.length > 0 || selectedMajors.length > 0) && (
              <button
                onClick={() => {
                  handleResetRegionFilter();
                  handleResetMajorFilter();
                }}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                필터 초기화
              </button>
            )}
          </div>

          {/* 필터 상태 표시 */}
          {(selectedRegions.length > 0 || selectedMajors.length > 0) && (
            <div className="text-sm text-gray-600">
              {selectedRegions.length > 0 && (
                <span>
                  지역: {selectedRegions.map((r) => REGIONS.find((region) => region.value === r)?.label).join(", ")}
                </span>
              )}
              {selectedRegions.length > 0 && selectedMajors.length > 0 && (
                <span> | </span>
              )}
              {selectedMajors.length > 0 && (
                <span>
                  분야: {selectedMajors.map((m) => COLLEGES.flatMap((c) => c.majors).find((major) => major.id === m)?.name).join(", ")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* 결과 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">멘토 정보를 불러오는 중...</p>
          </div>
        ) : filteredMentors.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-gray-600">검색 결과가 없습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => {
              const profile = mentor.profile;
              return (
                <Link
                  key={profile.userId}
                  href={`/mentor/${profile.userId}`}
                  asChild
                >
                  <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer overflow-hidden">
                    {/* 프로필 이미지 */}
                    <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                      <div className="text-5xl">👨‍🎓</div>
                    </div>

                    {/* 정보 */}
                    <div className="p-4">
                      {/* 이름 및 검증 배지 */}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {mentor.user?.name || "Unknown"}
                        </h3>
                        {profile?.verificationStatus === "approved" && (
                          <BadgeCheck className="w-5 h-5 text-blue-600" />
                        )}
                      </div>

                      {/* 대학 및 전공 */}
                      <p className="text-sm text-gray-600 mb-1">
                        {profile?.university} {profile?.major}
                      </p>

                      {/* 학년 */}
                      <p className="text-sm text-gray-500 mb-3">
                        {profile?.grade === "graduate"
                          ? "대학원"
                          : `${profile?.grade}학년`}
                      </p>

                      {/* 지역 및 평점 */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {profile?.region}
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {profile?.averageRating || "0.0"}
                          </span>
                        </div>
                      </div>

                      {/* 프로필 보기 버튼 */}
                      <button className="w-full mt-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                        프로필 보기
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
