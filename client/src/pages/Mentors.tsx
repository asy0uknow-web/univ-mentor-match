import { Card } from "@/components/ui/card";
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
    return mentorsData || [];
  }, [mentorsData]);

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
          <h1 className="text-2xl sm:text-3xl font-bold">멘토 찾기</h1>
          <p className="text-sm text-muted-foreground mt-1">
            당신의 진로를 함께 고민해줄 멘토를 찾아보세요
          </p>
        </div>

        {/* 검색 및 필터 */}
        <div className="space-y-3">
          {/* 검색 입력 */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="멘토 이름, 대학교, 학과로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button onClick={handleSearch} size="sm" className="px-4">
              검색
            </Button>
          </div>

          {/* 필터 버튼 */}
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={openMajorPanel2}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              학과
              {selectedMajors.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                  {selectedMajors.length}
                </span>
              )}
            </Button>

            <Button
              onClick={openRegionPanel}
              variant="outline"
              size="sm"
              className="text-xs"
            >
              지역
              {selectedRegions.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs font-semibold">
                  {selectedRegions.length}
                </span>
              )}
            </Button>

            {(selectedMajors.length > 0 || selectedRegions.length > 0) && (
              <Button
                onClick={() => {
                  setSelectedMajors([]);
                  setSelectedRegions([]);
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-muted-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                초기화
              </Button>
            )}
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
                  onClick={closeMajorPanel2}
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

              {/* 학과 목록 (스크롤 가능) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {filteredMajorsBySearch.map((major: any) => (
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
      createdAt: Date;
      updatedAt: Date;
    };
  };
}) {
  const universityLogo = getUniversityLogo(mentor.profile.university);

  const regionLabel =
    REGIONS.find((r) => r.value === mentor.profile.region)?.label ??
    mentor.profile.region ??
    "";

  const gradeLabel = (() => {
    const g = mentor.profile.grade;
    if (!g) return "";
    if (/^[1-4]$/.test(g)) return `${g}학년`;
    if (g === "graduate") return "대학원";
    return g;
  })();

  const ratingValue =
    mentor.profile.averageRating && mentor.profile.averageRating !== "0"
      ? Number(mentor.profile.averageRating).toFixed(1)
      : null;

  return (
    <Link
      href={`/mentor/${mentor.profile.id}`}
      className="block rounded-lg border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer bg-card overflow-hidden"
    >
      <div className="flex gap-4 p-4">
        {/* 좌츧0: 대표 이미지(사각형) */}
        <div className="w-24 h-24 rounded-md bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
          {universityLogo ? (
            <img
              src={universityLogo}
              alt={mentor.profile.university}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
        {/* 우츧0: 텍스트 영역 */}
        <div className="flex-1 min-w-0 flex flex-col gap-2 justify-between">
          {/* 첫째 줄: 멘토 이름 + BadgeCheck 아이콘 + '인증됨' 텍스트 */}
          <div className="flex items-center gap-1">
            <h3 className="font-semibold text-base leading-tight truncate">
              {mentor.user.name}
            </h3>
            {mentor.profile.verificationStatus === "approved" && (
              <>
                <BadgeCheck className="h-4 w-4 text-green-600 flex-shrink-0" />
                <span className="text-xs text-green-600 font-medium flex-shrink-0">인증됨</span>
              </>
            )}
          </div>

          {/* 둘째 줄: 대학교 이름 · 학년 */}
          <p className="text-xs text-muted-foreground truncate">
            {mentor.profile.university} · {gradeLabel}
          </p>

          {/* 셋째 줄: 학과 (글씨가 길어도 잘리지 않도록) */}
          <p className="text-xs text-muted-foreground break-words">
            {mentor.profile.major}
          </p>

          {/* 넷째 줄: 자기소개글 */}
          <p className="text-xs text-muted-foreground line-clamp-2 h-[32px] leading-4 overflow-hidden">
            {mentor.profile.bio || "소개가 아직 없어요."}
          </p>

          {/* 하단 푸터: border-t로 분리 */}
          <div className="mt-auto pt-3 border-t border-border flex items-center justify-between gap-2">
            {/* 좌측: MapPin 아이콘 + 지역명 */}
            {regionLabel && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{regionLabel}</span>
              </div>
            )}

            {/* 우측: Star 아이콘 + 평점 및 후기 개수 */}
            <div className="flex items-center gap-1 flex-shrink-0 text-xs text-muted-foreground">
              <Star className="h-3.5 w-3.5" />
              {ratingValue ? (
                <span className="font-medium text-foreground">
                  {ratingValue}
                  <span className="text-muted-foreground font-normal">
                    {" "}
                    ({mentor.profile.reviewCount})
                  </span>
                </span>
              ) : (
                <span>평점 없음</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
