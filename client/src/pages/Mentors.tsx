import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useSearchParams } from "wouter";
import { Search, X, ChevronRight, Star, MapPin, BadgeCheck, Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { getUniversityLogo } from "@/const/universities";
import { COLLEGES, getMajorNames } from "@/const/majors";
import { LazyImage } from "@/components/LazyImage";

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

const SORT_OPTIONS = [
  { value: "rating", label: "평점 높은순" },
  { value: "recent", label: "최신 가입순" },
  { value: "reviews", label: "리뷰 많은순" },
  { value: "consultations", label: "상담 많은순" },
] as const;

const CONSULTATION_TYPES = [
  { value: "career_counseling", label: "진로상담" },
  { value: "university_tour", label: "대학탐방" },
  { value: "resume_consulting", label: "생기부컨설팅" },
  { value: "academic_management", label: "학업관리" },
] as const;

export default function Mentors() {
  const [searchParams] = useSearchParams();
  // wouter의 searchParams는 렌더마다 새 인스턴스 → 문자열로 안정화
  const typesParamStr = searchParams.get('types') ?? '';
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  const [selectedConsultationTypes, setSelectedConsultationTypes] = useState<string[]>([]);
  const [showMajorPanel, setShowMajorPanel] = useState(false);
  const [tempSelectedMajors, setTempSelectedMajors] = useState<string[]>([]);
  const [majorSearchTerm, setMajorSearchTerm] = useState("");
  const [showRegionPanel, setShowRegionPanel] = useState(false);
  const [tempSelectedRegions, setTempSelectedRegions] = useState<string[]>([]);
  const [regionSearchTerm, setRegionSearchTerm] = useState("");
  const [showConsultationTypePanel, setShowConsultationTypePanel] = useState(false);
  const [tempSelectedConsultationTypes, setTempSelectedConsultationTypes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("rating");
  const [aiSearchTerm, setAiSearchTerm] = useState("");
  const [showAiResults, setShowAiResults] = useState(false);
  const [aiSearchQuery, setAiSearchQuery] = useState("");
  const [isAiSearchLoading, setIsAiSearchLoading] = useState(false);

  // AI 버튼 검색 쿼리 (버튼 클릭 시만 활성화) - 임베딩 기반 AI 검색 사용
  const { data: aiSearchQueryData = [], isFetching: isAiFetching } = trpc.aiSearch.embeddingSearch.useQuery(
    { query: aiSearchQuery, limit: 20 },
    { enabled: !!aiSearchQuery && aiSearchQuery.length > 0 }
  );

  // isAiFetching이 false로 바뀔 때(=쿼리 완료) 로딩 해제
  useEffect(() => {
    if (!isAiFetching && isAiSearchLoading) {
      setIsAiSearchLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAiFetching]);



  useEffect(() => {
    setPageMeta(PAGE_META.mentors);
  }, []);

  // URL 파라미터에서 상담 유형 필터 읽기 - 문자열 의존성으로 무한 루프 방지
  useEffect(() => {
    if (typesParamStr) {
      const types = typesParamStr.split(',').map(t => t.trim());
      const mappedTypes = types.map(type => {
        const consultationType = CONSULTATION_TYPES.find(ct => ct.label === type);
        return consultationType ? consultationType.value : null;
      }).filter(Boolean) as string[];
      setSelectedConsultationTypes(prev =>
        JSON.stringify(prev) === JSON.stringify(mappedTypes) ? prev : mappedTypes
      );
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typesParamStr]);

  const handleSearch = () => {
    // 최소 2글자 이상일 때만 검색
    if (searchTerm.length >= 2) {
      setDebouncedSearch(searchTerm);
    } else {
      setDebouncedSearch("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const openMajorPanel = () => {
    setTempSelectedMajors(selectedMajors);
    setMajorSearchTerm("");
    setShowMajorPanel(true);
  };

  const closeMajorPanel = () => {
    setShowMajorPanel(false);
    setMajorSearchTerm("");
  };

  const openRegionPanel = () => {
    setTempSelectedRegions(selectedRegions);
    setShowRegionPanel(true);
  };

  const closeRegionPanel = () => {
    setShowRegionPanel(false);
    setRegionSearchTerm("");
  };

  const applyRegionSelection = () => {
    setSelectedRegions(tempSelectedRegions);
    setShowRegionPanel(false);
  };

  const resetRegionSelection = () => {
    setTempSelectedRegions([]);
  };

  const toggleRegion = (regionValue: string) => {
    setTempSelectedRegions((prev) =>
      prev.includes(regionValue)
        ? prev.filter((r) => r !== regionValue)
        : [...prev, regionValue]
    );
  };

  const applyMajorSelection = () => {
    setSelectedMajors(tempSelectedMajors);
    setShowMajorPanel(false);
  };

  const resetMajorSelection = () => {
    setTempSelectedMajors([]);
  };

  const toggleMajor = (majorId: string) => {
    setTempSelectedMajors((prev) =>
      prev.includes(majorId)
        ? prev.filter((m) => m !== majorId)
        : [...prev, majorId]
    );
  };

  const openConsultationTypePanel = () => {
    setTempSelectedConsultationTypes(selectedConsultationTypes);
    setShowConsultationTypePanel(true);
  };

  const closeConsultationTypePanel = () => {
    setShowConsultationTypePanel(false);
  };

  const applyConsultationTypeSelection = () => {
    setSelectedConsultationTypes(tempSelectedConsultationTypes);
    setShowConsultationTypePanel(false);
  };

  const resetConsultationTypeSelection = () => {
    setTempSelectedConsultationTypes([]);
  };

  const toggleConsultationType = (typeValue: string) => {
    setTempSelectedConsultationTypes((prev) =>
      prev.includes(typeValue)
        ? prev.filter((t) => t !== typeValue)
        : [...prev, typeValue]
    );
  };

  const filteredMajorsBySearch = useMemo(() => {
    return COLLEGES.flatMap((college) =>
      college.majors.filter((major) =>
        major.name.toLowerCase().includes(majorSearchTerm.toLowerCase())
      )
    );
  }, [majorSearchTerm]);

  const filteredRegionsBySearch = useMemo(() => {
    return REGIONS.filter((region) =>
      region.label.toLowerCase().includes(regionSearchTerm.toLowerCase())
    );
  }, [regionSearchTerm]);

  const { data: mentors = [], isLoading } = trpc.mentor.getTopMentors.useQuery({
    limit: 20,
  });

  // AI 매칭 검색 쿼리 (기존 검색창 디바운스용) - 임베딩 기반 AI 검색 사용
  const { data: aiSearchResults = [] } = trpc.aiSearch.embeddingSearch.useQuery(
    { query: debouncedSearch, limit: 20 },
    { enabled: !!debouncedSearch && debouncedSearch.length >= 2 }
  );

  // 디바운싱 효과: 300ms → 1000ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        setDebouncedSearch(searchTerm);
      } else {
        setDebouncedSearch("");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // AI 추천 검색 (버튼 클릭 시에만)
  const handleAiSearch = () => {
    if (!aiSearchTerm.trim() || aiSearchTerm.length < 2) {
      alert("최소 2글자 이상 입력해주세요");
      return;
    }
    setIsAiSearchLoading(true);
    setShowAiResults(true);
    setAiSearchQuery(aiSearchTerm);
  };
  const handleAiSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAiSearch();
    }
  };

  // 클라이언트 측 필터링 (기존 검색용)
  const filteredMentors = useMemo(() => {
    let result = mentors;

    // AI 버튼 검색 결과가 있으면 최우선 사용 (0건 포함)
    if (showAiResults) {
      result = aiSearchQueryData;
    } else if (debouncedSearch && aiSearchResults.length > 0) {
      result = aiSearchResults;
    } else if (debouncedSearch) {
      // AI 매칭 검색 결과가 없으면 기존 키워드 필터링 사용
      const term = debouncedSearch.toLowerCase();
      result = result.filter((m: any) =>
        m.name?.toLowerCase().includes(term) ||
        m.university?.toLowerCase().includes(term) ||
        m.major?.toLowerCase().includes(term)
      );
    }

    // 전공 필터링
    if (selectedMajors.length > 0) {
      result = result.filter((m: any) => selectedMajors.includes(m.major));
    }

    // 지역 필터링
    if (selectedRegions.length > 0) {
      result = result.filter((m: any) => selectedRegions.includes(m.region));
    }

    // 상담 유형 필터링
    if (selectedConsultationTypes.length > 0) {
      result = result.filter((m: any) => {
        if (!m.consultationTypes || m.consultationTypes.length === 0) return false;
        return selectedConsultationTypes.some((type: string) =>
          m.consultationTypes.includes(type)
        );
      });
    }

    // 정렬
    const sorted = [...result];
    if (sortBy === "rating") {
      sorted.sort((a: any, b: any) => (b.averageRating || 0) - (a.averageRating || 0));
    } else if (sortBy === "reviews") {
      sorted.sort((a: any, b: any) => (b.reviewCount || 0) - (a.reviewCount || 0));
    } else if (sortBy === "recent") {
      sorted.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return sorted;
  }, [mentors, debouncedSearch, selectedMajors, selectedRegions, selectedConsultationTypes, sortBy, showAiResults, aiSearchQueryData]);


  return (
    <PageLayout>
      <div className="min-h-screen bg-[var(--color-bg-card)]">
        {/* 헤더 섹션 */}
        <div className="bg-[var(--color-bg-card)] border-b border-[var(--color-border-default)] sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                멘토 찾기
              </h1>
              <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">
                당신의 목표를 함께 이루어줄 멘토를 찾아보세요
              </p>
            </div>

            {/* 검색 및 필터 바 */}
            <div className="flex flex-col gap-3">
              {/* 검색 바 */}
              <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 px-3 sm:px-4 py-2 flex items-center gap-2 w-full">
                <Search className="h-4 sm:h-5 w-4 sm:w-5 text-[var(--color-text-secondary)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="대학, 전공, 이름"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none py-2"
                />
              </div>

              {/* 필터 및 정렬 버튼 그룹 */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {/* 학과 필터 */}
                <button
                  onClick={openMajorPanel}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border-default)]"
                >
                  <span>학과</span>
                  {selectedMajors.length > 0 && (
                    <span className="bg-[var(--brand-secondary-50)] text-[var(--brand-secondary-700)] rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {selectedMajors.length}
                    </span>
                  )}
                </button>

                {/* 상담 유형 필터 */}
                <button
                  onClick={openConsultationTypePanel}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border-default)]"
                >
                  <span>상담 유형</span>
                  {selectedConsultationTypes.length > 0 && (
                    <span className="bg-[var(--brand-secondary-50)] text-[var(--brand-secondary-700)] rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {selectedConsultationTypes.length}
                    </span>
                  )}
                </button>

                {/* 지역 필터 */}
                <button
                  onClick={openRegionPanel}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-card)] transition-colors border border-[var(--color-border-default)]"
                >
                  <span>지역</span>
                  {selectedRegions.length > 0 && (
                    <span className="bg-[var(--brand-secondary-50)] text-[var(--brand-secondary-700)] rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {selectedRegions.length}
                    </span>
                  )}
                </button>

                {/* 정렬 셀렉트 */}
                <div className="ml-auto">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[120px] sm:w-[140px] h-9 sm:h-10 text-xs sm:text-sm border-[var(--color-border-default)] text-[var(--color-text-primary)]">
                      <SelectValue placeholder="정렬 기준" />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs sm:text-sm">
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* AI 검색 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-gradient-to-r from-[var(--brand-primary-50)] to-[var(--brand-secondary-50)] border border-[var(--brand-primary-200)] rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-[var(--brand-primary-500)]" />
              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)]">AI 자연어 검색</h3>
              <span className="text-xs bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)] px-2 py-0.5 rounded-full font-medium">Beta</span>
            </div>
            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-4">
              예: "서울대 컴퓨터공학과 진로 고민 상담해줄 멘토 찾아줘", "수시 생기부 컨설팅 잘하는 멘토"
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-white dark:bg-[var(--color-bg-card)] border border-[var(--brand-primary-300)] rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 shadow-sm">
                <Sparkles className="h-4 w-4 text-[var(--brand-primary-400)] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="원하는 멘토를 자연어로 설명해보세요..."
                  value={aiSearchTerm}
                  onChange={(e) => setAiSearchTerm(e.target.value)}
                  onKeyDown={handleAiSearchKeyDown}
                  className="flex-1 bg-transparent text-xs sm:text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none py-1"
                />
                {aiSearchTerm && (
                  <button onClick={() => { setAiSearchTerm(""); setAiSearchQuery(""); setShowAiResults(false); }} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <button
                onClick={handleAiSearch}
                disabled={isAiSearchLoading || !aiSearchTerm.trim()}
                className="px-4 sm:px-6 py-2 bg-[var(--brand-primary-500)] hover:bg-[var(--brand-primary-600)] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {isAiSearchLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                AI 검색
              </button>
            </div>
            {showAiResults && !isAiSearchLoading && (
              <p className="text-xs text-[var(--brand-primary-600)] mt-2 font-medium">
                {aiSearchQueryData.length > 0
                  ? `✨ AI가 ${aiSearchQueryData.length}명의 멘토를 추천했습니다`
                  : "😔 조건에 맞는 멘토를 찾지 못했습니다. 다른 키워드로 검색해보세요"}
              </p>
            )}
          </div>
        </div>

        {/* 학과 선택 사이드 패널 */}
        {showMajorPanel && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[var(--color-bg-card)] shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--color-border-default)]">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">학과 선택</h3>
                <button
                  onClick={closeMajorPanel}
                  className="p-1 hover:bg-[var(--color-bg-card)] rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--color-text-primary)]" />
                </button>
              </div>

              <div className="p-3 sm:p-4 border-b border-[var(--color-border-default)]">
                <input
                  type="text"
                  placeholder="학과 검색..."
                  value={majorSearchTerm}
                  onChange={(e) => setMajorSearchTerm(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-500)] text-[var(--color-text-primary)]"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                {filteredMajorsBySearch.map((major) => (
                  <label
                    key={major.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--color-bg-card)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedMajors.includes(major.id)}
                      onChange={() => toggleMajor(major.id)}
                      className="w-4 h-4 rounded border-[var(--color-border-default)]"
                    />
                    <span className="text-xs sm:text-sm text-[var(--color-text-primary)]">{major.name}</span>
                  </label>
                ))}
              </div>

              {tempSelectedMajors.length > 0 && (
                <div className="border-t border-[var(--color-border-default)] p-3 sm:p-4 bg-[var(--brand-primary-50)]">
                  <p className="text-xs font-medium text-[var(--brand-primary-700)] mb-2">선택된 학과 ({tempSelectedMajors.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedMajors.map((majorId) => {
                      const majorName = getMajorNames([majorId])[0];
                      return (
                        <div
                          key={majorId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] text-xs rounded-full border border-[var(--brand-primary-700)]"
                        >
                          <span>{majorName}</span>
                          <button
                            onClick={() => toggleMajor(majorId)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--color-border-default)] p-3 sm:p-4 flex gap-2">
                <Button
                  onClick={resetMajorSelection}
                  variant="outline"
                  className="h-8 text-xs border-[var(--color-border-default)] text-[var(--color-text-primary)]"
                >
                  초기화
                </Button>
                <Button
                  onClick={applyMajorSelection}
                  className="flex-1 h-8 text-xs bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] text-white"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 상담 유형 선택 사이드 패널 */}
        {showConsultationTypePanel && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[var(--color-bg-card)] shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--color-border-default)]">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">상담 유형 선택</h3>
                <button
                  onClick={closeConsultationTypePanel}
                  className="p-1 hover:bg-[var(--color-bg-card)] rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--color-text-primary)]" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                {CONSULTATION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--color-bg-card)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedConsultationTypes.includes(type.value)}
                      onChange={() => toggleConsultationType(type.value)}
                      className="w-4 h-4 rounded border-[var(--color-border-default)]"
                    />
                    <span className="text-xs sm:text-sm text-[var(--color-text-primary)]">{type.label}</span>
                  </label>
                ))}
              </div>

              {tempSelectedConsultationTypes.length > 0 && (
                <div className="border-t border-[var(--color-border-default)] p-3 sm:p-4 bg-[var(--brand-primary-50)]">
                  <p className="text-xs font-medium text-[var(--brand-primary-700)] mb-2">선택된 유형 ({tempSelectedConsultationTypes.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedConsultationTypes.map((typeValue) => {
                      const typeLabel = CONSULTATION_TYPES.find(t => t.value === typeValue)?.label || typeValue;
                      return (
                        <div
                          key={typeValue}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] text-xs rounded-full border border-[var(--brand-primary-700)]"
                        >
                          <span>{typeLabel}</span>
                          <button
                            onClick={() => toggleConsultationType(typeValue)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--color-border-default)] p-3 sm:p-4 flex gap-2">
                <Button
                  onClick={resetConsultationTypeSelection}
                  variant="outline"
                  className="h-8 text-xs border-[var(--color-border-default)] text-[var(--color-text-primary)]"
                >
                  초기화
                </Button>
                <Button
                  onClick={applyConsultationTypeSelection}
                  className="flex-1 h-8 text-xs bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] text-white"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 지역 선택 사이드 패널 */}
        {showRegionPanel && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-[var(--color-bg-card)] shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--color-border-default)]">
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">지역 선택</h3>
                <button
                  onClick={closeRegionPanel}
                  className="p-1 hover:bg-[var(--color-bg-card)] rounded-md transition-colors"
                >
                  <X className="h-5 w-5 text-[var(--color-text-primary)]" />
                </button>
              </div>

              <div className="p-3 sm:p-4 border-b border-[var(--color-border-default)]">
                <input
                  type="text"
                  placeholder="지역 검색..."
                  value={regionSearchTerm}
                  onChange={(e) => setRegionSearchTerm(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary-500)] text-[var(--color-text-primary)]"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                {filteredRegionsBySearch.map((region) => (
                  <label
                    key={region.value}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-[var(--color-bg-card)] cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedRegions.includes(region.value)}
                      onChange={() => toggleRegion(region.value)}
                      className="w-4 h-4 rounded border-[var(--color-border-default)]"
                    />
                    <span className="text-xs sm:text-sm text-[var(--color-text-primary)]">{region.label}</span>
                  </label>
                ))}
              </div>

              {tempSelectedRegions.length > 0 && (
                <div className="border-t border-[var(--color-border-default)] p-3 sm:p-4 bg-[var(--brand-primary-50)]">
                  <p className="text-xs font-medium text-[var(--brand-primary-700)] mb-2">선택된 지역 ({tempSelectedRegions.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedRegions.map((regionValue) => {
                      const regionName = REGIONS.find(r => r.value === regionValue)?.label || regionValue;
                      return (
                        <div
                          key={regionValue}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] text-xs rounded-full border border-[var(--brand-primary-700)]"
                        >
                          <span>{regionName}</span>
                          <button
                            onClick={() => toggleRegion(regionValue)}
                            className="ml-1 hover:opacity-70 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="border-t border-[var(--color-border-default)] p-3 sm:p-4 flex gap-2">
                <Button
                  onClick={resetRegionSelection}
                  variant="outline"
                  className="h-8 text-xs border-[var(--color-border-default)] text-[var(--color-text-primary)]"
                >
                  초기화
                </Button>
                <Button
                  onClick={applyRegionSelection}
                  className="flex-1 h-8 text-xs bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] text-white"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 추천 멘토 섹션 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-[var(--brand-primary-500)]" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-primary)]">
                {showAiResults
                  ? aiSearchQueryData.length > 0
                    ? `✨ AI 추천 결과 (${aiSearchQueryData.length}명)`
                    : isAiSearchLoading ? "AI가 멘토를 찾는 중..." : "검색 결과 없음"
                  : "지금 가장 인기있는 추천멘토들을 만나보세요"}
              </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] text-sm sm:text-base mb-6">
              {showAiResults
                ? aiSearchQueryData.length > 0
                  ? `"${aiSearchQuery}" 검색 결과입니다`
                  : isAiSearchLoading ? "잠시만 기다려주세요" : `"${aiSearchQuery}"에 맞는 멘토가 없습니다`
                : "높은 평점과 많은 상담 경험을 가진 멘토들을 추천해드립니다"}
            </p>
            <Link href="/recommended-mentors" className="inline-block">
              <Button className="bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] text-white">
                추천 멘토 더보기
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>

        {/* 멘토 목록 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {isLoading || (showAiResults && isAiSearchLoading) ? (
            <div className="flex flex-col justify-center items-center py-16 gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--brand-primary-500)]"></div>
              {showAiResults && <p className="text-sm text-[var(--color-text-secondary)]">✨ AI가 적합한 멘토를 찾고 있습니다...</p>}
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-16">
              {showAiResults ? (
                <>
                  <p className="text-4xl mb-4">😔</p>
                  <p className="text-[var(--color-text-primary)] font-semibold text-base mb-2">"{aiSearchQuery}"에 맞는 멘토를 찾지 못했습니다</p>
                  <p className="text-[var(--color-text-secondary)] text-sm">다른 키워드로 다시 검색해보세요</p>
                  <button
                    onClick={() => { setShowAiResults(false); setAiSearchTerm(""); setAiSearchQuery(""); }}
                    className="mt-4 px-4 py-2 text-sm text-[var(--brand-primary-600)] border border-[var(--brand-primary-300)] rounded-lg hover:bg-[var(--brand-primary-50)] transition-colors"
                  >
                    전체 멘토 보기
                  </button>
                </>
              ) : (
                <p className="text-[var(--color-text-secondary)] text-sm sm:text-base">검색 결과가 없습니다</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredMentors.map((mentor: any) => (
                <Link key={mentor.uuid || mentor.id} href={`/mentor/${mentor.uuid}`} className="group">
                  <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col cursor-pointer group-hover:-translate-y-1">
                      {/* 갤러리 이미지 - 대표 사진 또는 로고 */}
                      <div className="w-full h-24 sm:h-32 bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden">
                        <LazyImage
                          src={(mentor as any).profileImage || "/logonew.png"}
                          alt={(mentor as any).profileImage ? "프로필" : "유니브매치 로고"}
                          className={`${(mentor as any).profileImage ? 'w-full h-full object-cover' : 'w-12 h-12 sm:w-16 sm:h-16 object-contain'}`}
                          placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E"
                        />
                      </div>
                      
                      {/* 멘토 정보 헬더 */}
                      <div className="p-4 sm:p-6 border-b border-[var(--color-border-default)]">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] group-hover:text-[var(--brand-secondary-600)] transition-colors">
                                {mentor.name || mentor.user?.name}
                              </h3>
                              {mentor.verificationStatus === "approved" && (
                                <BadgeCheck className="h-4 w-4 text-[var(--brand-secondary-600)] flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-[var(--color-text-secondary)] mb-2">
                              {getUniversityLogo(mentor.university) && (
                                <LazyImage
                                  src={getUniversityLogo(mentor.university)}
                                  alt={mentor.university}
                                  className="h-4 w-4 rounded-full"
                                  placeholder="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3C/svg%3E"
                                />
                              )}
                              <span>{mentor.university}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">{mentor.major}</p>
                          </div>
                          {mentor.averageRating && mentor.averageRating > 0 && (
                            <div className="flex items-center gap-1 bg-[var(--brand-accent-50)] px-2 py-1 rounded-lg">
                              <Star className="h-4 w-4 text-[var(--brand-accent-700)] fill-[var(--brand-accent-700)]" />
                              <span className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-black">
                                {mentor.averageRating ? Number(mentor.averageRating).toFixed(1) : "0.0"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 상담 유형 */}
                      {mentor.consultationTypes && mentor.consultationTypes.length > 0 && (
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--color-border-default)]">
                          <div className="flex flex-wrap gap-2">
                            {mentor.consultationTypes.slice(0, 3).map((type: string) => {
                              const typeLabel = CONSULTATION_TYPES.find(t => t.value === type)?.label || type;
                              return (
                                <span
                                  key={type}
                                  className="inline-block bg-[var(--brand-primary-50)] text-[var(--brand-primary-700)] text-xs px-2 py-1 rounded-full"
                                >
                                  {typeLabel}
                                </span>
                              );
                            })}
                            {mentor.consultationTypes.length > 3 && (
                              <span className="inline-block text-[var(--color-text-secondary)] text-xs px-2 py-1">
                                +{mentor.consultationTypes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 리뷰 정보 */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-[var(--color-border-default)]">
                        {mentor.reviewCount > 0 && (
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            리뷰 {mentor.reviewCount}개
                          </div>
                        )}
                        {mentor.reviewCount === 0 && (
                          <div className="text-xs text-[var(--color-text-secondary)]">
                            리뷰 준비 중
                          </div>
                        )}
                      </div>

                      {/* CTA 버튼 */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                        <Button className="w-full bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] text-white text-xs sm:text-sm font-medium py-2 rounded-lg transition-colors">
                          상담 신청
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
