import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { GraduationCap, Star, Search, LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import BugReportModal from "@/components/BugReportModal";

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
  const { user, isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedField, setSelectedField] = useState<string>("all");
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [showBugReport, setShowBugReport] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  // 기본 멘토 목록
  const { data: allMentors, isLoading: isLoadingAll } = trpc.mentor.listAll.useQuery();

  // 분야+지역 검색 (둘 다 선택되었을 때)
  const { data: combinedMentors, isLoading: isLoadingCombined } = trpc.mentorSearch.getByFieldAndRegion.useQuery(
    { field: (selectedField !== "all" ? selectedField : undefined) as any, region: (selectedRegion !== "all" ? selectedRegion : undefined) as any },
    { enabled: selectedField !== "all" && selectedRegion !== "all" }
  );

  // 분야별 검색 (분야만 선택되었을 때)
  const { data: fieldMentors, isLoading: isLoadingField } = trpc.mentorSearch.getByField.useQuery(
    { field: (selectedField !== "all" ? selectedField : undefined) as any },
    { enabled: selectedField !== "all" && selectedRegion === "all" }
  );

  // 지역별 검색 (지역만 선택되었을 때)
  const { data: regionMentors, isLoading: isLoadingRegion } = trpc.mentorSearch.getByRegion.useQuery(
    { region: (selectedRegion !== "all" ? selectedRegion : undefined) as any },
    { enabled: selectedRegion !== "all" && selectedField === "all" }
  );

  // 현재 표시할 멘토 목록 결정
  let mentors = allMentors;
  let isLoading = isLoadingAll;

  if (selectedField !== "all" && selectedRegion !== "all") {
    mentors = combinedMentors;
    isLoading = isLoadingCombined;
  } else if (selectedField !== "all") {
    mentors = fieldMentors;
    isLoading = isLoadingField;
  } else if (selectedRegion !== "all") {
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
      <nav className="border-b border-border bg-[#fdfcfd] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png" alt="Univ Match" className="h-10 sm:h-14 md:h-16 lg:h-20 w-auto" />
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">상담 문의</Button>
                  </Link>
                  <Link href="/my-profile" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">내 프로필</Button>
                  </Link>
                  <Link href="/notifications" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">알림</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <span className="hidden sm:inline">메뉴</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuItem onClick={() => setShowBugReport(true)} className="hover:bg-blue-100 hover:text-primary">
                        <Bug className="h-4 w-4 mr-2" />
                        버그 신고
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/mentors">멘토 찾기</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/bookings">상담 문의</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/my-profile">내 프로필</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/notifications">알림</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="md:hidden" />
                      <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/delete-account">
                          <Trash2 className="h-4 w-4 mr-2" />
                          계정 탈퇴
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button size="sm">로그인</Button>
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
              <Select value={selectedField} onValueChange={(value) => setSelectedField(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="분야 선택" />
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

            {/* 지역 선택 */}
            <div>
              <label className="text-sm font-medium mb-2 block">지역</label>
              <Select value={selectedRegion} onValueChange={(value) => setSelectedRegion(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="지역 선택" />
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
              setSelectedField("all");
              setSelectedRegion("all");
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
                      <div className="flex items-center justify-end pt-2 border-t border-border">
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
      {showBugReport && <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />}
    </div>
  );
}
