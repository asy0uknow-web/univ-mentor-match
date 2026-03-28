import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, X, ChevronRight, Star, MapPin, BadgeCheck, Sparkles } from "lucide-react";
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

  const { data: mentorsData, isLoading } = trpc.mentor.listAll.useQuery();

  const filteredMentors = useMemo(() => {
    if (!mentorsData) return [];

    return mentorsData.filter((mentor) => {
      if (debouncedSearch.trim()) {
        const searchLower = debouncedSearch.toLowerCase();
        const mentorName = mentor.user.name?.toLowerCase() || "";
        const university = mentor.profile.university?.toLowerCase() || "";
        const major = mentor.profile.major?.toLowerCase() || "";
        const bio = mentor.profile.bio?.toLowerCase() || "";

        if (
          !mentorName.includes(searchLower) &&
          !university.includes(searchLower) &&
          !major.includes(searchLower) &&
          !bio.includes(searchLower)
        ) {
          return false;
        }
      }

      if (selectedRegions.length > 0) {
        if (!mentor.profile.region || !selectedRegions.includes(mentor.profile.region)) {
          return false;
        }
      }

      if (selectedMajors.length > 0) {
        const selectedMajorNames = selectedMajors.map((majorId) => {
          const majorName = getMajorNames([majorId])[0];
          return majorName?.toLowerCase() || "";
        }).filter(name => name !== "");

        const mentorMajor = mentor.profile.major?.toLowerCase() || "";
        const mentorMajorMatch = selectedMajorNames.some((majorName) => 
          mentorMajor === majorName
        );

        if (!mentorMajorMatch) {
          return false;
        }
      }

      return true;
    });
  }, [mentorsData, debouncedSearch, selectedRegions, selectedMajors]);

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
      <div className="space-y-4 sm:space-y-6">
        {/* 헤더 */}
        <div className="pt-2 sm:pt-4 pl-2">
          <h1 className="text-xl sm:text-3xl font-bold">멘토 찾기</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            당신의 진로를 함께 고민해줄 멘토를 찾아보세요
          </p>
        </div>

        {/* 통합 검색 카드 - 모바일 최적화 */}
        <div className="mt-4 sm:mt-10">
          {/* 모바일: 스택 레이아웃, 데스크톱: 가로 레이아웃 */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0">
            {/* 검색 바 */}
            <div className="bg-white border border-gray-200 rounded-full shadow-md hover:shadow-lg transition-shadow duration-300 p-2 flex items-center gap-0 flex-1">
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

            {/* 필터 버튼 그룹 */}
            <div className="flex items-center gap-2 sm:gap-0">
              {/* 학과 필터 */}
              <button
                onClick={openMajorPanel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap border border-gray-200 sm:border-0 sm:border-l sm:border-gray-300 sm:rounded-none"
              >
                <span>학과</span>
                {selectedMajors.length > 0 && (
                  <span className="bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                    {selectedMajors.length}
                  </span>
                )}
              </button>

              {/* 지역 필터 */}
              <button
                onClick={openRegionPanel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200 whitespace-nowrap border border-gray-200 sm:border-0 sm:border-l sm:border-gray-300 sm:rounded-none"
              >
                <span>지역</span>
                {selectedRegions.length > 0 && (
                  <span className="bg-green-100 text-green-700 rounded-full px-1.5 py-0.5 text-xs font-semibold">
                    {selectedRegions.length}
                  </span>
                )}
              </button>

              {/* 검색 버튼 */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500 hover:bg-green-600 transition-colors duration-200 text-white flex-shrink-0 sm:rounded-l-none"
              >
                <Search className="h-4 sm:h-5 w-4 sm:w-5" />
              </button>
            </div>
          </div>

          {/* 초기화 버튼 */}
          {(selectedMajors.length > 0 || selectedRegions.length > 0 || debouncedSearch) && (
            <div className="flex justify-center mt-3 sm:mt-4">
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearch("");
                  setSelectedMajors([]);
                  setSelectedRegions([]);
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
                  선택
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Mentors Grid - 모바일 최적화 */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-xs sm:text-sm text-muted-foreground">멘토 목록을 불러오는 중...</p>
          </div>
        ) : filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mt-6 sm:mt-8">
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
      hourlyRate: string | null;
      availableSlots: string | null;
      verificationStatus: string;
      isDeleted: boolean;
      averageRating: string | null;
      reviewCount: number;
      createdAt: Date;
      updatedAt: Date;
      consultationTypes?: string[] | null;
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

  const consultationTypeLabels: { [key: string]: { label: string; color: string } } = {
    "career_counseling": { label: "진로상담", color: "bg-blue-100 text-blue-700" },
    "university_tour": { label: "대학탐방", color: "bg-green-100 text-green-700" },
    "resume_consulting": { label: "생기부컨설팅", color: "bg-purple-100 text-purple-700" },
    "academic_management": { label: "학업관리", color: "bg-orange-100 text-orange-700" },
  };

  const consultationTypes = mentor.profile.consultationTypes || [];

  const ratingValue =
    mentor.profile.averageRating && mentor.profile.averageRating !== "0"
      ? Number(mentor.profile.averageRating).toFixed(1)
      : null;

  return (
    <Link
      href={`/mentor/${mentor.profile.uuid}`}
      className="block rounded-lg border border-border hover:border-primary hover:shadow-md transition-all cursor-pointer bg-card overflow-hidden"
    >
      <div className="flex gap-2 sm:gap-4 p-3 sm:p-4">
        {/* 좌측: 멘토 프로필 이미지 */}
        <div className="w-20 sm:w-28 h-20 sm:h-28 rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/mentor-default-avatar-XSMy7BuwnsbcDukFiGhL9q.webp"
            alt={mentor.user.name || "멘토 프로필"}
            className="w-full h-full object-cover"
          />
        </div>
        {/* 우측: 텍스트 영역 */}
        <div className="flex-1 min-w-0 flex flex-col gap-1 sm:gap-2">
          {/* 첫째 줄: 멘토 이름 */}
          <div className="flex items-center gap-1 sm:gap-2">
            <h3 className="text-sm sm:text-lg font-bold leading-tight line-clamp-1">
              {mentor.user.name || "멘토"}
            </h3>
            {mentor.profile.verificationStatus === "approved" && (
              <BadgeCheck className="h-3 sm:h-4 w-3 sm:w-4 text-green-600 flex-shrink-0" />
            )}
          </div>

          {/* 둘째 줄: 대학교 이름 · 학년 */}
          <p className="text-xs text-muted-foreground line-clamp-1">
            {mentor.profile.university} · {gradeLabel}
          </p>

          {/* 셋째 줄: 학과 배지 */}
          <div className="flex flex-wrap gap-1">
            <span className="inline-block bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium line-clamp-1">
              {mentor.profile.major}
            </span>
          </div>

          {/* 넷째 줄: 자기소개글 */}
          <p className="text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2 leading-4">
            {mentor.profile.bio || "소개가 아직 없어요."}
          </p>

          {/* 다섯째 줄: 상담 유형 배지 */}
          {consultationTypes.length > 0 && (
            <div className="flex flex-wrap gap-0.5 mt-1 sm:mt-2">
              {consultationTypes.slice(0, 2).map((type) => {
                const typeInfo = consultationTypeLabels[type];
                return (
                  <span
                    key={type}
                    className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${typeInfo?.color || "bg-gray-100 text-gray-700"}`}
                  >
                    {typeInfo?.label || type}
                  </span>
                );
              })}
            </div>
          )}

          {/* 하단 푸터: border-t로 분리 */}
          <div className="mt-auto pt-2 sm:pt-3 border-t border-border flex items-center gap-1 sm:gap-2 text-xs">
            {/* 좌측: MapPin 아이콘 + 지역명 */}
            {regionLabel && (
              <div className="flex items-center gap-0.5 text-muted-foreground min-w-0">
                <MapPin className="h-3 w-3 flex-shrink-0" />
                <span className="truncate">{regionLabel}</span>
              </div>
            )}

            {/* 우측: Star 아이콘 + 평점 또는 신규 배지 */}
            <div className="ml-auto flex items-center gap-1 text-muted-foreground flex-shrink-0">
              {ratingValue ? (
                <>
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{ratingValue}</span>
                  <span className="text-xs">({mentor.profile.reviewCount})</span>
                </>
              ) : (
                <span className="text-xs px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded-full font-semibold">
                  신규
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
