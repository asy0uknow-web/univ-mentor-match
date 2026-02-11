import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { getUniversityLogo } from "@/const/universities";

const FIELDS = [
  { value: "engineering", label: "이공계" },
  { value: "natural_science", label: "자연계" },
  { value: "business", label: "상경계" },
  { value: "humanities", label: "어문계" },
  { value: "education", label: "사범계" },
  { value: "liberal_arts", label: "문과계" },
  { value: "medicine", label: "의학계" },
] as const;

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
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");

  useEffect(() => {
    setPageMeta(PAGE_META.mentors);
  }, []);

  // 검색어 디바운스 (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 단일 API 호출: getByFieldAndRegion은 optional 파라미터를 받으므로
  // field/region이 "all"이면 undefined를 전달하여 서버에서 전체 조회
  const hasFilter = selectedField !== "all" || selectedRegion !== "all";

  const { data: allMentors, isLoading: isLoadingAll } = trpc.mentor.listAll.useQuery(
    undefined,
    { enabled: !hasFilter }
  );

  const { data: filteredByServer, isLoading: isLoadingFiltered } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
    {
      field: selectedField !== "all" ? selectedField as any : undefined,
      region: selectedRegion !== "all" ? selectedRegion as any : undefined,
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
                <label className="text-xs font-medium text-muted-foreground">분야</label>
                <Select value={selectedField} onValueChange={setSelectedField}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="분야" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 분야</SelectItem>
                    {FIELDS.map((field) => (
                      <SelectItem key={field.value} value={field.value}>
                        {field.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">지역</label>
                <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="지역" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">전체 지역</SelectItem>
                    {REGIONS.map((region) => (
                      <SelectItem key={region.value} value={region.value}>
                        {region.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">검색</label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="대학, 전공..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 h-8 text-xs"
                />
              </div>
            </div>
            <Button 
              onClick={() => {
                setSearchTerm("");
                setSelectedField("all");
                setSelectedRegion("all");
              }}
              variant="outline"
              className="w-full h-8 text-xs"
            >
              초기화
            </Button>
          </div>
        </div>

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

// 멘토 카드 컴포넌트
function MentorCard({ mentor }: { mentor: any }) {
  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId: mentor.profile.id },
    { staleTime: 5 * 60 * 1000 } // 5분 캐시
  );

  const firstImage = gallery?.[0]?.imageUrl;
  const universityLogo = getUniversityLogo(mentor.profile.university);

  return (
    <Link href={`/mentor/${mentor.profile.id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full flex flex-col overflow-hidden">
        {/* 갤러리 이미지 또는 로고 영역 */}
        <div className="w-full h-40 sm:h-48 bg-gradient-to-br from-sage-100 to-sage-50 flex items-center justify-center overflow-hidden">
          {firstImage ? (
            <img
              src={firstImage}
              alt={`${mentor.user.name} 갤러리`}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-5xl sm:text-6xl">{universityLogo}</div>
          )}
        </div>

        {/* 카드 내용 */}
        <CardHeader className="pb-2 sm:pb-2">
          <div className="space-y-1">
            <CardTitle className="text-base sm:text-lg">{mentor.user.name || "멘토"}</CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              {mentor.profile.university} · {mentor.profile.major}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-1.5 sm:gap-2 text-xs sm:text-sm pt-0 sm:pt-1">
          {/* 태그 섹션 - 알약 모양 배지 */}
          <div className="flex flex-wrap gap-1">
            {/* 학년 배지 */}
            <span className="inline-block px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
              {GRADES.find(g => g.value === mentor.profile.grade)?.label || "학년 정보 없음"}
            </span>

            {/* 지역 배지 */}
            {mentor.profile.region && (
              <span className="inline-block px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {REGIONS.find(r => r.value === mentor.profile.region)?.label || "지역 정보 없음"}
              </span>
            )}

            {/* 분야 배지 */}
            {mentor.profile.field && (
              <span className="inline-block px-2 sm:px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                {FIELDS.find(f => f.value === mentor.profile.field)?.label || "분야 정보 없음"}
              </span>
            )}
          </div>

          {/* 자기소개 */}
          {mentor.profile.bio && (
            <p className="text-muted-foreground line-clamp-2 text-xs">
              {mentor.profile.bio}
            </p>
          )}

          {/* 상담 신청 버튼 - Outlined Button */}
          <div className="flex items-center justify-end pt-1 sm:pt-1.5 mt-auto">
            <Button 
              size="sm" 
              variant="outline"
              className="text-xs sm:text-sm h-7 sm:h-8 hover:bg-primary hover:text-white transition-colors"
            >
              상담 신청
            </Button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
