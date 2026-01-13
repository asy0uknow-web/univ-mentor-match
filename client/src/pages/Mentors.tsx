import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { GraduationCap, Star, Search } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

const FIELDS = [
  { value: "engineering", label: "이공계" },
  { value: "natural_science", label: "자연계" },
  { value: "business", label: "상경계" },
  { value: "humanities", label: "어문계" },
  { value: "education", label: "사범계" },
  { value: "liberal_arts", label: "문과계" },
  { value: "medicine", label: "의학계" },
];

const REGIONS = [
  { value: "seoul", label: "서울" },
  { value: "gyeonggi", label: "경기" },
  { value: "incheon", label: "인천" },
  { value: "gangwon", label: "강원" },
  { value: "chungcheong", label: "충청" },
  { value: "jeolla", label: "전라" },
  { value: "gyeongsang", label: "경상" },
  { value: "jeju", label: "제주" },
];

export default function Mentors() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<string | undefined>(undefined);
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);

  // 기본 멘토 목록
  const { data: allMentors, isLoading: isLoadingAll } = trpc.mentor.listAll.useQuery();

  // 분야별 검색
  const { data: fieldMentors, isLoading: isLoadingField } = trpc.mentorSearch.getByField.useQuery(
    { field: selectedField as any },
    { enabled: !!selectedField && !selectedRegion }
  );

  // 지역별 검색
  const { data: regionMentors, isLoading: isLoadingRegion } = trpc.mentorSearch.getByRegion.useQuery(
    { region: selectedRegion as any },
    { enabled: !!selectedRegion && !selectedField }
  );

  // 분야+지역 검색
  const { data: combinedMentors, isLoading: isLoadingCombined } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
    { field: selectedField as any, region: selectedRegion as any },
    { enabled: !!selectedField && !!selectedRegion }
  );

  // 현재 표시할 멘토 목록 결정
  let mentors = allMentors;
  let isLoading = isLoadingAll;

  if (selectedField && selectedRegion) {
    mentors = combinedMentors;
    isLoading = isLoadingCombined;
  } else if (selectedField) {
    mentors = fieldMentors;
    isLoading = isLoadingField;
  } else if (selectedRegion) {
    mentors = regionMentors;
    isLoading = isLoadingRegion;
  }

  const filteredMentors = mentors?.filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      m.profile.university.toLowerCase().includes(searchLower) ||
      m.profile.major.toLowerCase().includes(searchLower) ||
      m.user.name?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">대학 멘토 매칭</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors">
                    <Button variant="ghost">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings">
                    <Button variant="ghost">상담 문의</Button>
                  </Link>
                  <Link href="/my-profile">
                    <Button variant="ghost">내 프로필</Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost">알림</Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>로그인</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">멘토 찾기</h1>

        {/* Filters Section */}
        <div className="mb-8 p-6 bg-card rounded-lg border border-border">
          <h2 className="text-lg font-semibold mb-4">검색 필터</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 분야 선택 */}
            <div>
              <label className="text-sm font-medium mb-2 block">분야</label>
              <Select value={selectedField || ""} onValueChange={(value) => setSelectedField(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="분야 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 분야</SelectItem>
                  {FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      {field.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 지역 선택 */}
            <div>
              <label className="text-sm font-medium mb-2 block">지역</label>
              <Select value={selectedRegion || ""} onValueChange={(value) => setSelectedRegion(value || undefined)}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체 지역</SelectItem>
                  {REGIONS.map((region) => (
                    <SelectItem key={region.value} value={region.value}>
                      {region.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 검색 */}
            <div>
              <label className="text-sm font-medium mb-2 block">검색</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input
                  type="text"
                  placeholder="대학, 전공, 이름..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Reset Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedField(undefined);
              setSelectedRegion(undefined);
              setSearchTerm("");
            }}
          >
            필터 초기화
          </Button>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {isLoading ? "로딩 중..." : `${filteredMentors?.length || 0}명의 멘토를 찾았습니다`}
          </p>
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredMentors && filteredMentors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Link key={mentor.profile.id} href={`/mentor/${mentor.profile.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{mentor.user.name || "멘토"}</CardTitle>
                        <CardDescription className="mt-1">
                          {mentor.profile.university} · {mentor.profile.major}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-1 text-primary">
                        <Star className="h-4 w-4 fill-current" />
                        <span className="font-semibold text-sm">4.5</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {mentor.profile.bio || "소개 없음"}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <span className="text-lg font-bold text-primary">
                          ₩{mentor.profile.hourlyRate?.toLocaleString() || "0"}/시간
                        </span>
                        <Button size="sm">상담 신청</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다</p>
          </div>
        )}
      </div>
    </div>
  );
}
