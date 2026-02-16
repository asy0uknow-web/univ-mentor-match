import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, X, ChevronRight } from "lucide-react";
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

  // 학과 검색 필터링
  const filteredMajorsBySearch = COLLEGES.map((college) => ({
    ...college,
    majors: college.majors.filter((major) =>
      major.name.toLowerCase().includes(majorSearchTerm.toLowerCase())
    ),
  })).filter((college) => college.majors.length > 0 || majorSearchTerm === "");

  // 지역 검색 필터링
  const filteredRegionsBySearch = REGIONS.filter((region) =>
    region.label.toLowerCase().includes(regionSearchTerm.toLowerCase())
  );

  // 계열 전체 선택
  const selectCollege = (collegeId: string) => {
    const college = COLLEGES.find((c) => c.id === collegeId);
    if (!college) return;

    const majorIds = college.majors.map((m) => m.id);
    const newSelected = Array.from(
      new Set([...tempSelectedMajors, ...majorIds])
    );
    setTempSelectedMajors(newSelected);
  };

  // 학과 개별 선택/제거
  const toggleMajor = (majorId: string) => {
    setTempSelectedMajors((prev) =>
      prev.includes(majorId)
        ? prev.filter((id) => id !== majorId)
        : [...prev, majorId]
    );
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

  // 필터 조건 확인
  const hasFilter = selectedRegions.length > 0 || selectedMajors.length > 0;

  const { data: allMentors, isLoading: isLoadingAll } = trpc.mentor.listAll.useQuery(
    undefined,
    { enabled: !hasFilter }
  );

  const { data: filteredByServer, isLoading: isLoadingFiltered } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
    {
      fields: selectedMajors.length > 0 ? selectedMajors : undefined,
      regions: selectedRegions.length > 0 ? selectedRegions : undefined,
    },
    { enabled: hasFilter }
  );

  const mentors = hasFilter ? filteredByServer : allMentors;
  const isLoading = hasFilter ? isLoadingFiltered : isLoadingAll;

  // useMemo로 클라이언트 필터링 메모이제이션
  const filteredMentors = useMemo(() => {
    if (!mentors) return [];
    if (!debouncedSearch) return mentors;

    const searchLower = debouncedSearch.toLowerCase();
    return mentors.filter((m) =>
      m.profile.university.toLowerCase().includes(searchLower) ||
      m.profile.major.toLowerCase().includes(searchLower) ||
      m.user.name?.toLowerCase().includes(searchLower)
    );
  }, [mentors, debouncedSearch]);

  return (
    <PageLayout>
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-4 sm:mb-8">멘토 찾기</h1>

        {/* Filters Section - 모바일 최적화 */}
        <div className="mb-4 sm:mb-8 p-2 sm:p-4 bg-card rounded-lg border border-border" role="search" aria-label="멘토 검색 필터">
          <h2 className="text-sm sm:text-lg font-semibold mb-2 sm:mb-3">검색 필터</h2>
          <div className="space-y-2 sm:space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <button
                  onClick={openMajorPanel}
                  className="w-fit h-8 px-[calc(0.75rem+5px)] text-xs font-medium text-left bg-background border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <span>학과</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
              <div>
                <button
                  onClick={openRegionPanel}
                  className="w-fit h-8 px-[calc(0.75rem+5px)] text-xs font-medium text-left bg-background border border-border rounded-md hover:bg-muted transition-colors flex items-center justify-between"
                >
                  <span>지역</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">검색</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="대학, 전공..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="pl-8 h-8 text-xs"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  variant="default"
                  className="h-8 px-3 text-xs"
                >
                  검색
                </Button>
              </div>
            </div>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedRegions([]);
                setSelectedMajors([]);
                setDebouncedSearch("");
              }}
              variant="outline"
              className="w-full h-8 text-xs"
            >
              초기화
            </Button>
          </div>
        </div>

        {/* 학과 선택 사이드 패널 */}
        {showMajorPanel && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-lg flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">학과 선택</h3>
                <button
                  onClick={closeMajorPanel}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 검색창 */}
              <div className="p-4 border-b border-border">
                <input
                  type="text"
                  placeholder="학과 검색..."
                  value={majorSearchTerm}
                  onChange={(e) => setMajorSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 계열 및 학과 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {filteredMajorsBySearch.map((college) => (
                  <div key={college.id}>
                    <button
                      onClick={() => selectCollege(college.id)}
                      className="w-full text-left p-2 rounded-md hover:bg-muted transition-colors mb-2"
                    >
                      <h4 className="font-semibold text-sm">{college.name}</h4>
                    </button>
                    <div className="space-y-1 ml-2">
                      {college.majors.map((major) => (
                        <label
                          key={major.id}
                          className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={tempSelectedMajors.includes(major.id)}
                            onChange={() => toggleMajor(major.id)}
                            className="rounded"
                          />
                          <span className="text-xs">{major.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* 선택된 학과 표시 (고정) */}
              {tempSelectedMajors.length > 0 && (
                <div className="border-t border-border p-4 bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">
                    선택된 학과 ({tempSelectedMajors.length})
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedMajors.map((majorId) => {
                      const majorName = getMajorNames([majorId])[0];
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

              {/* 버튼 (고정) */}
              <div className="border-t border-border p-4 flex gap-2">
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
                  선택
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* 지역 선택 사이드 패널 */}
        {showRegionPanel && (
          <div className="fixed inset-0 z-50 bg-black/50">
            <div className="fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-background shadow-lg flex flex-col">
              {/* 헤더 */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-semibold">지역 선택</h3>
                <button
                  onClick={closeRegionPanel}
                  className="p-1 hover:bg-muted rounded-md transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 검색창 */}
              <div className="p-4 border-b border-border">
                <input
                  type="text"
                  placeholder="지역 검색..."
                  value={regionSearchTerm}
                  onChange={(e) => setRegionSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* 지역 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredRegionsBySearch.map((region) => (
                  <label
                    key={region.value}
                    className="flex items-center gap-2 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={tempSelectedRegions.includes(region.value)}
                      onChange={() => toggleRegion(region.value)}
                      className="rounded"
                    />
                    <span className="text-xs">{region.label}</span>
                  </label>
                ))}
              </div>

              {/* 선택된 지역 표시 (고정) */}
              {tempSelectedRegions.length > 0 && (
                <div className="border-t border-border p-4 bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-2">선택된 지역 ({tempSelectedRegions.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {tempSelectedRegions.map((regionValue) => {
                      const regionName = REGIONS.find((r) => r.value === regionValue)?.label || regionValue;
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

              {/* 버튼 (고정) */}
              <div className="border-t border-border p-4 flex gap-2">
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
                  선택
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-xs sm:text-sm text-muted-foreground">멘토 목록을 불러오는 중...</p>
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {filteredMentors.map((mentor) => (
              <MentorCard key={mentor.profile.id} mentor={mentor} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-xs sm:text-sm text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

function MentorCard({
  mentor,
}: {
  mentor: {
    user: { id: number; name: string | null };
    profile: {
      id: number;
      userId: number;
      university: string;
      major: string;
      grade: string;
      region: string | null;
      bio: string | null;
      field: string | null;
      hourlyRate: string;
      availableSlots: string | null;
      isActive: boolean;
      verificationStatus: string;
      isDeleted: boolean;
      averageRating: string | null;
      reviewCount: number;
      specialtyServices: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  };
}) {
  const universityLogo = getUniversityLogo(mentor.profile.university);

  return (
    <Link href={`/mentor/${mentor.profile.id}`} className="block p-4 rounded-lg border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer bg-card">
        <div className="flex gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
            {universityLogo ? (
              <img
                src={universityLogo}
                alt={mentor.profile.university}
                className="w-8 h-8 object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/20 rounded-full" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm truncate">{mentor.user.name}</h3>
            <p className="text-xs text-muted-foreground truncate">
              {mentor.profile.university} · {mentor.profile.major}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-2">
          <span className="inline-block px-2 py-1 bg-muted text-xs rounded-full">
            {mentor.profile.grade}
          </span>
          <span className="inline-block px-2 py-1 bg-muted text-xs rounded-full">
            {mentor.profile.region}
          </span>
        </div>

        {mentor.profile.specialtyServices && (
          <div className="flex flex-wrap gap-1 mb-2">
            {JSON.parse(mentor.profile.specialtyServices).map(
              (service: string, idx: number) => (
                <span
                  key={idx}
                  className="inline-block px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                >
                  {service}
                </span>
              )
            )}
          </div>
        )}

        <p className="text-xs text-muted-foreground line-clamp-2">
          {mentor.profile.bio}
        </p>

        {mentor.profile.verificationStatus === 'approved' && (
          <div className="mt-2 text-xs text-green-600 font-medium">✓ 인증됨</div>
        )}
    </Link>
  );
}
