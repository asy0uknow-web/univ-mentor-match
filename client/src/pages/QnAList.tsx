import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Search, Plus, MessageCircle, ChevronDown, AlertCircle, ArrowRight } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Select from "@radix-ui/react-select";
import * as Tabs from "@radix-ui/react-tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { ConsultationCTAButton } from "@/components/ConsultationCTAButton";


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
  { value: "answered_or_solved", label: "답변완료" },
];

const mapStatusToStatusBadge = (status: string) => {
  switch (status) {
    case "awaiting_answer":
      return "pending";
    case "answered":
    case "solved":
      return "accepted";
    default:
      return "new";
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
      title: "QnA 센터 - 대학 생활 Q&A", 
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
    status: selectedStatus === "all" ? undefined : selectedStatus === "answered_or_solved" ? undefined : selectedStatus,
  });

  // 답변완료 내에서 answered와 solved 모두 필터링
  const filteredQuestions = selectedStatus === "answered_or_solved" && questions
    ? questions.filter((q: any) => q.status === "answered" || q.status === "solved")
    : questions;

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* 헤더 섹션 */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between gap-2 mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-4xl font-bold mb-2 text-[var(--color-text-primary)]">🎓 QnA 센터</h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
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
                  className="text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0 bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)]"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">답변하기</span>
                  <span className="sm:hidden">답변</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setLocation('/qna/new')}
                  className="text-xs sm:text-sm h-8 sm:h-10 flex-shrink-0 bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)]"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">질문하기</span>
                  <span className="sm:hidden">질문</span>
                </Button>
              )
            )}
          </div>

          {/* 안내 박스 */}
          <Card className="bg-[var(--brand-primary-50)] border-[var(--color-border-default)] border-2 mb-8 shadow-lg">
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex gap-4">
                <AlertCircle className="h-7 w-7 text-[var(--brand-primary-700)] flex-shrink-0 mt-1" />
                <div className="text-sm sm:text-base text-[var(--brand-primary-700)] space-y-2">
                  <p className="font-bold text-lg">좋은 질문 팁</p>
                  <ul className="text-sm sm:text-base space-y-1.5 opacity-95">
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
              className="text-xs sm:text-sm bg-[var(--color-cta-secondary-bg)] hover:bg-[var(--color-cta-secondary-bg-hover)]"
              onClick={() => setLocation('/mentors')}
            >
              멘토 찾기
            </Button>
            {isAuthenticated && (
              <Button 
                variant="outline" 
                size="sm"
                className="text-xs sm:text-sm bg-[var(--color-cta-secondary-bg)] hover:bg-[var(--color-cta-secondary-bg-hover)]"
                onClick={() => setLocation('/qna/dashboard')}
              >
                {isMentor ? '내 답변 관리' : '내 질문 관리'}
              </Button>
            )}
          </div>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="mb-6 sm:mb-8 space-y-3 sm:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              placeholder="질문을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs sm:text-sm h-9 sm:h-10 border-[var(--color-border-default)]"
            />
          </div>

          {/* 필터 및 정렬 */}
          <div className="flex gap-2 flex-wrap">
            {/* 카테고리 필터 */}
            <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 text-xs sm:text-sm border border-[var(--color-border-default)] rounded-md bg-white hover:bg-accent h-9 sm:h-10 min-w-[110px]">
                <Select.Value />
                <Select.Icon className="ml-2">
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content className="bg-white border border-[var(--color-border-default)] rounded-md shadow-md  z-50">
                <Select.Viewport className="p-1">
                  {CATEGORIES.map((cat) => (
                    <Select.Item key={cat.value} value={cat.value} className="px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-accent rounded">
                      <Select.ItemText>{cat.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>

            {/* 정렬 옵션 */}
            <Select.Root value={sortBy} onValueChange={setSortBy}>
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 text-xs sm:text-sm border border-[var(--color-border-default)] rounded-md bg-white hover:bg-accent h-9 sm:h-10 min-w-[110px]">
                <Select.Value />
                <Select.Icon className="ml-2">
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content className="bg-white border border-[var(--color-border-default)] rounded-md shadow-md  z-50">
                <Select.Viewport className="p-1">
                  {SORT_OPTIONS.map((opt) => (
                    <Select.Item key={opt.value} value={opt.value} className="px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-accent rounded">
                      <Select.ItemText>{opt.label}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* 상태 탭 */}
        <Tabs.Root value={selectedStatus} onValueChange={setSelectedStatus} className="mb-6">
          <Tabs.List className="flex gap-1 border-b border-[var(--color-border-default)] overflow-x-auto pb-0">
            {STATUS_TABS.map((tab) => (
              <Tabs.Trigger
                key={tab.value}
                value={tab.value}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] data-[state=active]:text-[var(--color-text-primary)] data-[state=active]:border-b-2 data-[state=active]:border-[var(--color-text-primary)] whitespace-nowrap"
              >
                {tab.label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {/* 질문 목록 */}
        {isLoading ? (
          <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">로드 중...</p>
        ) : filteredQuestions && filteredQuestions.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredQuestions.map((question: any) => {
              return (
                <Card
                  key={question.id}
                  className="card-premium overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group group-hover:-translate-y-1 bg-white border-[var(--color-border-default)]"
                  onClick={() => setLocation(`/qna/${question.id}`)}
                >
                  <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <CardTitle className="text-base sm:text-lg truncate group-hover:text-[var(--brand-primary-700)] transition-colors break-words text-[var(--color-text-primary)]">
                            {question.title}
                          </CardTitle>
                          <StatusBadge status={mapStatusToStatusBadge(question.status)} />
                        </div>
                        <CardDescription className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                          {question.isAnonymous ? "익명" : question.author?.name || "사용자"} • {format(new Date(question.createdAt), "MMM dd", { locale: ko })}
                          {question.interestUniversity && ` • ${question.interestUniversity}`}
                          {question.interestMajor && ` • ${question.interestMajor}`}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-3">
                      {question.content}
                    </p>
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
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
                      <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-white border-[var(--color-border-default)]">
            <CardContent className="py-8 sm:py-12 text-center px-4">
              <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-4">
                {searchQuery ? "검색 결과가 없습니다" : "질문이 없습니다"}
              </p>
              {!searchQuery && isAuthenticated && (
                isMentor ? (
                  <p className="text-xs text-[var(--color-text-secondary)]">아직 답변을 기다리는 질문이 없습니다.</p>
                ) : (
                  <Button
                    onClick={() => setLocation('/qna/new')}
                    className="text-xs sm:text-sm h-8 sm:h-10 bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)]"
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
