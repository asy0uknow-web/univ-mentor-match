import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Search, Plus, MessageCircle, ChevronDown, AlertCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";

const CATEGORIES = [
  { value: "all", label: "전체" },
  { value: "입시 전략", label: "입시 전략" },
  { value: "전공 선택", label: "전공 선택" },
  { value: "대학 생활", label: "대학 생활" },
  { value: "학교 분위기", label: "학교 분위기" },
  { value: "학업/생기부", label: "학업/생기부" },
  { value: "기숙사/통학", label: "기숙사/통학" },
  { value: "인간관계/적응", label: "인간관계/적응" },
  { value: "진로 고민", label: "진로 고민" },
  { value: "기타", label: "기타" },
];

const SORT_OPTIONS = [
  { value: "recent", label: "최신순" },
  { value: "latest_answer", label: "최근답변순" },
  { value: "most_answers", label: "답변많은순" },
  { value: "solved", label: "해결도 높은순" },
];

const STATUS_TABS = [
  { value: "all", label: "전체" },
  { value: "awaiting_answer", label: "답변대기" },
  { value: "answered", label: "답변완료" },
  { value: "solved", label: "해결됨" },
];

const getStatusBadge = (status: string) => {
  switch (status) {
    case "awaiting_answer":
      return { label: "답변 대기 중", className: "bg-yellow-100 text-yellow-800" };
    case "answered":
      return { label: "답변 완료", className: "bg-blue-100 text-blue-800" };
    case "solved":
      return { label: "해결됨", className: "bg-green-100 text-green-800" };
    default:
      return { label: status, className: "bg-gray-100 text-gray-800" };
  }
};

export default function QnAList() {
  const { isAuthenticated, user } = useAuth();
  const isMentor = user?.role === 'mentor';
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    setPageMeta({ 
      title: "Q&A - 재학생에게 직접 묻기", 
      description: "입시, 전공 선택, 학교 분위기까지 재학생 멘토에게 자유롭게 질문해보세요" 
    });
  }, []);

  // 검색 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // 질문 목록 조회
  const { data: questions, isLoading } = trpc.qna.getQuestions.useQuery({
    limit: 20,
    offset: 0,
    searchQuery: debouncedSearch,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    sortBy: sortBy as any,
    status: selectedStatus === "all" ? undefined : selectedStatus,
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* 헤더 섹션 */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2">재학생에게 직접 묻기</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                입시, 전공 선택, 학교 분위기, 대학생활까지<br className="sm:hidden" />
                재학생 멘토에게 자유롭게 질문해보세요.
              </p>
            </div>
            {isAuthenticated && (
              isMentor ? (
                <Button
                  onClick={() => {
                    // 멘토는 답변 대기 중인 첫 번째 질문으로 이동
                    setSelectedStatus('awaiting_answer');
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">답변하기</span>
                  <span className="sm:hidden">답변</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setLocation('/qna/new')}
                  className="text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">질문하기</span>
                  <span className="sm:hidden">질문</span>
                </Button>
              )
            )}
          </div>

          {/* 안내 박스 */}
          <Card className="bg-blue-50 border-blue-200 mb-6">
            <CardContent className="pt-4 px-4 pb-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm text-blue-900 space-y-1">
                  <p className="font-medium">좋은 질문 팁</p>
                  <ul className="text-xs space-y-0.5 opacity-90">
                    <li>• 한 질문에 한 가지 핵심 고민만 적기</li>
                    <li>• 학교/전공/학년/상황을 적으면 더 정확한 답변 가능</li>
                    <li>• 개인정보(전화번호, 카톡 ID, SNS)는 적지 않기</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA 버튼 */}
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm"
              className="text-xs sm:text-sm"
              onClick={() => setLocation('/mentors')}
            >
              멘토 찾기
            </Button>
          </div>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="질문을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs sm:text-sm h-9 sm:h-10"
            />
          </div>

          {/* 필터 및 정렬 */}
          <div className="flex gap-2 flex-wrap">
            {/* 카테고리 필터 */}
            <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background hover:bg-accent h-9 sm:h-10 min-w-[110px]">
                <Select.Value />
                <Select.Icon className="ml-2">
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content className="bg-background border border-input rounded-md shadow-md z-50">
                <Select.Viewport className="p-1">
                  {CATEGORIES.map((cat) => (
                    <Select.Item key={cat.value} value={cat.value} className="px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-accent rounded">
                      {cat.label}
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>

            {/* 정렬 옵션 */}
            <Select.Root value={sortBy} onValueChange={setSortBy}>
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background hover:bg-accent h-9 sm:h-10 min-w-[110px]">
                <Select.Value />
                <Select.Icon className="ml-2">
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content className="bg-background border border-input rounded-md shadow-md z-50">
                <Select.Viewport className="p-1">
                  {SORT_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value} className="px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-accent rounded">
                      {opt.label}
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* 상태 탭 */}
        <Tabs.Root value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
          <Tabs.List className="flex gap-1 border-b border-border overflow-x-auto pb-0">
            {STATUS_TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-muted-foreground hover:text-foreground data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-foreground whitespace-nowrap"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {/* 질문 목록 */}
        {isLoading ? (
          <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {questions.map((question: any) => {
              const statusBadge = getStatusBadge(question.status);
              return (
                <Card
                  key={question.id}
                  className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setLocation(`/qna/${question.id}`)}
                >
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base sm:text-lg truncate">
                            {question.title}
                          </CardTitle>
                          <Badge variant="secondary" className={`text-xs flex-shrink-0 ${statusBadge.className}`}>
                            {statusBadge.label}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs sm:text-sm">
                          {question.isAnonymous ? "익명" : question.author?.name || "사용자"} • {format(new Date(question.createdAt), "MMM dd", { locale: ko })}
                          {question.interestUniversity && ` • ${question.interestUniversity}`}
                          {question.interestMajor && ` • ${question.interestMajor}`}
                        </CardDescription>
                      </div>
                      {question.category && (
                        <Badge variant="outline" className="text-xs flex-shrink-0">
                          {question.category}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                      {question.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex gap-3">
                        {question.answerCount > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3 w-3" />
                            <span>{question.answerCount}개 답변</span>
                          </div>
                        )}
                        {question.lastAnsweredAt && (
                          <span>최근: {format(new Date(question.lastAnsweredAt), "MMM dd", { locale: ko })}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center px-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {searchQuery ? "검색 결과가 없습니다" : "질문이 없습니다"}
              </p>
              {!searchQuery && isAuthenticated && (
                isMentor ? (
                  <p className="text-xs text-muted-foreground">아직 답변을 기다리는 질문이 없습니다.</p>
                ) : (
                  <Button
                    onClick={() => setLocation('/qna/new')}
                    className="text-xs sm:text-sm h-8 sm:h-10"
                  >
                    <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    첫 번째 질문 작성하기
                  </Button>
                )
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
