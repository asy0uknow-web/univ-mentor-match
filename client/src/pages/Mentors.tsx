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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 학과 패널 열기
  const openMajorPanel = () => {
    setTempSelectedMajors(selectedMajors);
    setMajorSearchTerm("");
    setShowMajorPanel(true);
  };

  // 학과 패널 닫기
  const closeMajorPanel = () => {
    setShowMajorPanel(false);
    setMajorSearchTerm("");
  };

  // 지역 패널 열기
  const openRegionPanel = () => {
    setTempSelectedRegions(selectedRegions);
    setShowRegionPanel(true);
  };

  // 지역 패널 닫기
  const closeRegionPanel = () => {
    setShowRegionPanel(false);
    setRegionSearchTerm("");
  };

  // 지역 선택 적용
  const applyRegionSelection = () => {
    setSelectedRegions(tempSelectedRegions);
    setShowRegionPanel(false);
  };

  // 지역 선택 초기화
  const resetRegionSelection = () => {
    setTempSelectedRegions([]);
  };

  // 지역 개별 선택/제거
  const toggleRegion = (regionValue: string) => {
    setTempSelectedRegions((prev) =>
      prev.includes(regionValue)
        ? prev.filter((r) => r !== regionValue)
        : [...prev, regionValue]
    );
  };

  // 학과 패널 열기
  const openMajorPanel2 = () => {
    setTempSelectedMajors(selectedMajors);
    setMajorSearchTerm("");
    setShowMajorPanel(true);
  };

  // 학과 패널 닫기
  const closeMajorPanel2 = () => {
    setShowMajorPanel(false);
    setMajorSearchTerm("");
  };

  // 학과 패널 닫기 (중복 제거)
  const closeMajorPanel3 = () => {
    setShowMajorPanel(false);
    setMajorSearchTerm("");
  };

  // 학과 선택 적용
  const applyMajorSelection = () => {
    setSelectedMajors(tempSelectedMajors);
    setShowMajorPanel(false);
  };

  // 학과 선택 초기화
  const resetMajorSelection = () => {
    setTempSelectedMajors([]);
  };

  // 학과 개별 선택/제거
  const toggleMajor = (majorId: string) => {
    setTempSelectedMajors((prev) =>
      prev.includes(majorId)
        ? prev.filter((m) => m !== majorId)
        : [...prev, majorId]
    );
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

      // 전공 필터링
      if (selectedMajors.length > 0) {
        if (!profile?.field || !selectedMajors.includes(profile.field)) {
          return false;
        }
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
        <div className="pt-4 pl-2">
          <h1 className="text-2xl sm:text-3xl font-bold">멘토 찾기</h1>
          <p className="text-sm text-muted-foreground mt-1">
            당신의 진로를 함께 고민해줄 멘토를 찾아보세요
          </p>
        </div>

        {/* 통합 검색 카드 */}
        <div className="mt-10">
          <div className="bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 p-2 flex items-center gap-0">
            {/* 좌측 검색 영역 (40%) */}
            <div className="flex-1 flex items-center gap-3 px-6 py-3 hover:bg-gray-50 rounded-l-full transition-colors duration-200 cursor-text">
              <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
              <input
                type="text"
                placeholder="대학, 전공, 이름으로 검색"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm placeholder-gray-400 focus:outline-none"
              />
            </div>

            {/* 구분선 */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* 중앙 지역 필터 (25%) */}
            <div className="flex-1 px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
              <button
                onClick={openRegionPanel}
                className="w-full text-left text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {selectedRegions.length > 0
                  ? `${selectedRegions.length}개 지역 선택`
                  : "지역 선택"}
              </button>
            </div>

            {/* 구분선 */}
            <div className="h-6 w-px bg-gray-200"></div>

            {/* 우측 전공 필터 (25%) */}
            <div className="flex-1 px-4 py-3 hover:bg-gray-50 transition-colors duration-200">
              <button
                onClick={openMajorPanel}
                className="w-full text-left text-sm text-gray-700 hover:text-gray-900 font-medium"
              >
                {selectedMajors.length > 0
                  ? `${selectedMajors.length}개 분야 선택`
                  : "분야 선택"}
              </button>
            </div>

            {/* 검색 버튼 (10%) */}
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-r-full transition-colors duration-200 flex-shrink-0"
            >
              <Search className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 지역 선택 패널 */}
        {showRegionPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">지역 선택</h3>
                <button onClick={closeRegionPanel} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <input
                type="text"
                placeholder="지역 검색"
                value={regionSearchTerm}
                onChange={(e) => setRegionSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-2">
                {filteredRegionsBySearch.map((region) => (
                  <label key={region.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempSelectedRegions.includes(region.value)}
                      onChange={() => toggleRegion(region.value)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{region.label}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetRegionSelection}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={applyRegionSelection}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 전공 선택 패널 */}
        {showMajorPanel && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
            <div className="bg-white w-full rounded-t-2xl p-6 space-y-4 max-h-96 overflow-y-auto">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-bold">분야 선택</h3>
                <button onClick={closeMajorPanel} className="text-gray-400 hover:text-gray-600">
                  <X className="h-6 w-6" />
                </button>
              </div>

              <input
                type="text"
                placeholder="분야 검색"
                value={majorSearchTerm}
                onChange={(e) => setMajorSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="space-y-2">
                {filteredMajorsBySearch.map((major) => (
                  <label key={major.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                    <input
                      type="checkbox"
                      checked={tempSelectedMajors.includes(major.id)}
                      onChange={() => toggleMajor(major.id)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{major.name}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={resetMajorSelection}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  초기화
                </button>
                <button
                  onClick={applyMajorSelection}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  적용
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 멘토 목록 */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">멘토를 불러오는 중...</p>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">조건에 맞는 멘토가 없습니다.</p>
            </div>
          ) : (
            filteredMentors.map((mentor) => (
              <Link key={mentor.profile.id} href={`/mentor/${mentor.profile.id}`}>
                <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{mentor.user?.name}</h3>
                        {mentor.profile.verificationStatus === "approved" && (
                          <BadgeCheck className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{mentor.profile.university} {mentor.profile.major}</p>
                      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                        <MapPin className="h-4 w-4" />
                        {mentor.profile.region}
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  );
}
