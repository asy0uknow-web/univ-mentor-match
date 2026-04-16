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

  useEffect(() => {
    setPageMeta(PAGE_META.mentors);
  }, []);

  // URL 파라미터에서 상담 유형 필터 읽기
  useEffect(() => {
    const typesParam = searchParams.get('types');
    if (typesParam) {
      const types = typesParam.split(',').map(t => t.trim());
      const mappedTypes = types.map(type => {
        const consultationType = CONSULTATION_TYPES.find(ct => ct.label === type);
        return consultationType ? consultationType.value : null;
      }).filter(Boolean) as string[];
      setSelectedConsultationTypes(mappedTypes);
    }
  }, [searchParams]);

  const handleSearch = () => {
    setDebouncedSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
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

  // 클라이언트 측 필터링
  const filteredMentors = useMemo(() => {
    let result = mentors;

    // 검색어 필터링
    if (debouncedSearch) {
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
  }, [mentors, debouncedSearch, selectedMajors, selectedRegions, selectedConsultationTypes, sortBy]);


  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        {/* 헤더 섹션 */}
        <div className="bg-card dark:bg-card border-b border-gray-200 dark:border-slate-700 dark:border-slate-700 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                멘토 찾기
              </h1>
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 text-sm sm:text-base">
                당신의 목표를 함께 이루어줄 멘토를 찾아보세요
              </p>
            </div>

            {/* 검색 및 필터 바 */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              {/* 검색 바 */}
              <div className="bg-card dark:bg-card border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-full shadow-sm hover:shadow-md dark:shadow-lg transition-shadow duration-300 p-2 flex items-center gap-0 flex-1">
                <Search className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 flex-shrink-0 ml-3 sm:ml-6" />
                <input
                  type="text"
                  placeholder="대학, 전공, 이름"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent text-xs sm:text-sm placeholder-gray-400 focus:outline-none px-3 py-2 sm:px-6 sm:py-3"
                />
              </div>

              {/* 필터 및 정렬 버튼 그룹 */}
              <div className="flex items-center gap-2">
                {/* 학과 필터 */}
                <button
                  onClick={openMajorPanel}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-slate-50 dark:bg-slate-900 transition-colors border border-gray-200 dark:border-slate-700 dark:border-slate-700"
                >
                  <span>학과</span>
                  {selectedMajors.length > 0 && (
                    <span className="bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {selectedMajors.length}
                    </span>
                  )}
                </button>

                {/* 상담 유형 필터 */}
                <button
                  onClick={openConsultationTypePanel}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-slate-50 dark:bg-slate-900 transition-colors border border-gray-200 dark:border-slate-700 dark:border-slate-700"
                >
                  <span>상담 유형</span>
                  {selectedConsultationTypes.length > 0 && (
                    <span className="bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {selectedConsultationTypes.length}
                    </span>
                  )}
                </button>

                {/* 지역 필터 */}
                <button
                  onClick={openRegionPanel}
                  className="flex items-center justify-center gap-1 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-gray-700 hover:bg-slate-50 dark:bg-slate-900 transition-colors border border-gray-200 dark:border-slate-700 dark:border-slate-700"
                >
                  <span>지역</span>
                  {selectedRegions.length > 0 && (
                    <span className="bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                      {selectedRegions.length}
                    </span>
                  )}
                </button>

                {/* 정렬 옵션 */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-auto border-gray-200 dark:border-slate-700 dark:border-slate-700 text-xs sm:text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* 검색 버튼 */}
                <button
                  onClick={handleSearch}
                  className="flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors text-white text-xs sm:text-sm font-medium"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 초기화 버튼 */}
            {(selectedMajors.length > 0 || selectedRegions.length > 0 || selectedConsultationTypes.length > 0 || debouncedSearch) && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearch("");
                    setSelectedMajors([]);
                    setSelectedRegions([]);
                    setSelectedConsultationTypes([]);
                    setSortBy("rating");
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <X className="h-3 w-3 mr-1" />
                  필터 초기화
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* 학과 선택 사이드 패널 */}
        {showMajorPanel && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-semibold">학과 선택</h3>
                <button
                  onClick={closeMajorPanel}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 border-b border-border">
                <input
                  type="text"
                  placeholder="학과 검색..."
                  value={majorSearchTerm}
                  onChange={(e) => setMajorSearchTerm(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                {filteredMajorsBySearch.map((major: any) => (
                  <label
                    key={major.id}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedMajors.includes(major.id)}
                      onChange={() => toggleMajor(major.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-xs sm:text-sm">{major.name}</span>
                  </label>
                ))}
              </div>

              {tempSelectedMajors.length > 0 && (
                <div className="border-t border-border p-3 sm:p-4 bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">선택된 학과 ({tempSelectedMajors.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedMajors.map((majorId) => {
                      const majorName = COLLEGES.flatMap(c => c.majors).find(m => m.id === majorId)?.name || majorId;
                      return (
                        <div
                          key={majorId}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full"
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

              <div className="border-t border-border p-3 sm:p-4 flex gap-2">
                <Button
                  onClick={resetMajorSelection}
                  variant="outline"
                  className="h-8 text-xs"
                >
                  초기화
                </Button>
                <Button
                  onClick={applyMajorSelection}
                  variant="default"
                  className="flex-1 h-8 text-xs"
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
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-semibold">상담 유형 선택</h3>
                <button
                  onClick={closeConsultationTypePanel}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                {CONSULTATION_TYPES.map((type) => (
                  <label
                    key={type.value}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedConsultationTypes.includes(type.value)}
                      onChange={() => toggleConsultationType(type.value)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-xs sm:text-sm">{type.label}</span>
                  </label>
                ))}
              </div>

              {tempSelectedConsultationTypes.length > 0 && (
                <div className="border-t border-border p-3 sm:p-4 bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">선택된 상담 유형 ({tempSelectedConsultationTypes.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedConsultationTypes.map((typeValue) => {
                      const typeName = CONSULTATION_TYPES.find(t => t.value === typeValue)?.label || typeValue;
                      return (
                        <div
                          key={typeValue}
                          className="bg-green-100 text-green-700 rounded-full px-2 py-1 text-xs font-medium flex items-center gap-1"
                        >
                          <span>{typeName}</span>
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

              <div className="border-t border-border p-3 sm:p-4 flex gap-2">
                <Button
                  onClick={resetConsultationTypeSelection}
                  variant="outline"
                  className="h-8 text-xs"
                >
                  초기화
                </Button>
                <Button
                  onClick={applyConsultationTypeSelection}
                  variant="default"
                  className="flex-1 h-8 text-xs"
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
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-lg flex flex-col">
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-border">
                <h3 className="text-base sm:text-lg font-semibold">지역 선택</h3>
                <button
                  onClick={closeRegionPanel}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-3 sm:p-4 border-b border-border">
                <input
                  type="text"
                  placeholder="지역 검색..."
                  value={regionSearchTerm}
                  onChange={(e) => setRegionSearchTerm(e.target.value)}
                  className="w-full px-2 sm:px-3 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1 sm:space-y-2">
                {filteredRegionsBySearch.map((region) => (
                  <label
                    key={region.value}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedRegions.includes(region.value)}
                      onChange={() => toggleRegion(region.value)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="text-xs sm:text-sm">{region.label}</span>
                  </label>
                ))}
              </div>

              {tempSelectedRegions.length > 0 && (
                <div className="border-t border-border p-3 sm:p-4 bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">선택된 지역 ({tempSelectedRegions.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedRegions.map((regionValue) => {
                      const regionName = REGIONS.find(r => r.value === regionValue)?.label || regionValue;
                      return (
                        <div
                          key={regionValue}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-primary text-primary-foreground text-xs rounded-full"
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

              <div className="border-t border-border p-3 sm:p-4 flex gap-2">
                <Button
                  onClick={resetRegionSelection}
                  variant="outline"
                  className="h-8 text-xs"
                >
                  초기화
                </Button>
                <Button
                  onClick={applyRegionSelection}
                  variant="default"
                  className="flex-1 h-8 text-xs"
                >
                  적용
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 멘토 목록 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : filteredMentors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-300 dark:text-gray-300 text-sm sm:text-base">검색 결과가 없습니다</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMentors.map((mentor: any) => (
                <Link key={mentor.uuid || mentor.id} href={`/mentor/${mentor.uuid}`} className="group">
                  <div className="bg-card dark:bg-card border border-gray-200 dark:border-slate-700 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-300 h-full flex flex-col cursor-pointer">
                      {/* 멘토 정보 헤더 */}
                      <div className="p-4 sm:p-6 border-b border-gray-100 dark:border-slate-700 dark:border-slate-700">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                                {mentor.name || mentor.user?.name}
                              </h3>
                              {mentor.verificationStatus === "approved" && (
                                <BadgeCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:text-gray-300 mb-2">
                              {getUniversityLogo(mentor.university) && (
                                <img
                                  src={getUniversityLogo(mentor.university)}
                                  alt={mentor.university}
                                  className="h-4 w-4 rounded-full"
                                />
                              )}
                              <span>{mentor.university}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 dark:text-gray-300">{mentor.major}</p>
                          </div>
                          {mentor.averageRating && mentor.averageRating > 0 && (
                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                              <span className="text-sm font-semibold text-gray-900">
                                {mentor.averageRating ? Number(mentor.averageRating).toFixed(1) : "0.0"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* 상담 유형 */}
                      {mentor.consultationTypes && mentor.consultationTypes.length > 0 && (
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-700 dark:border-slate-700">
                          <div className="flex flex-wrap gap-2">
                            {mentor.consultationTypes.slice(0, 3).map((type: string) => {
                              const typeLabel = CONSULTATION_TYPES.find(t => t.value === type)?.label || type;
                              return (
                                <span
                                  key={type}
                                  className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full"
                                >
                                  {typeLabel}
                                </span>
                              );
                            })}
                            {mentor.consultationTypes.length > 3 && (
                              <span className="inline-block text-gray-500 text-xs px-2 py-1">
                                +{mentor.consultationTypes.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* 리뷰 정보 */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 dark:border-slate-700 dark:border-slate-700">
                        {mentor.reviewCount > 0 && (
                          <div className="text-xs text-gray-500">
                            리뷰 {mentor.reviewCount}개
                          </div>
                        )}
                        {mentor.reviewCount === 0 && (
                          <div className="text-xs text-gray-400">
                            리뷰 준비 중
                          </div>
                        )}
                      </div>

                      {/* CTA 버튼 */}
                      <div className="px-4 sm:px-6 py-3 sm:py-4 mt-auto">
                        <Button className="w-full bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium py-2 rounded-lg transition-colors">
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
