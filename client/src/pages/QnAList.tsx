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

import { StatusBadge } from "@/components/StatusBadge";
import { ConsultationCTAButton } from "@/components/ConsultationCTAButton";
import { getCategoryIcon, getCategoryBgColor } from "@/lib/categoryIcons";
import { Eye, ThumbsUp } from "lucide-react";


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
      return "awaiting_answer";
    case "answered_or_solved":
      return "answered";
    default:
      return "awaiting_answer";
  }
};

export default function QnAListPage() {
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const isMentor = user?.role === "mentor";
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  useEffect(() => {
    setPageMeta({
      title: "Q&A - 유니브매치",
      description: "대학 선배 멘토들과 함께 입시, 대학생활, 진로에 대해 나누는 Q&A 커뮤니티",
    });
  }, []);

  // 검색어 디바운싱
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data: questionsData } = trpc.qna.getQuestions.useQuery(
    {
      limit: 20,
      offset: 0,
      searchQuery: debouncedSearchQuery || undefined,
      category: selectedCategory !== "all" ? selectedCategory : undefined,
      sortBy,
      status: selectedStatus !== "all" ? selectedStatus : undefined,
    },
    {
      retry: false
    }
  );

  const filteredQuestions = questionsData || [];

  return (
    <PageLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--color-text-primary)] mb-2">
                Q&A
              </h1>
              <p className="text-sm sm:text-base text-[var(--color-text-secondary)]">
                대학 선배 멘토들과 함께 고민을 나누세요
              </p>
            </div>
            {isAuthenticated && !isMentor && (
              <Button
                onClick={() => setLocation("/qna/new")}
                className="bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)] flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">질문하기</span>
              </Button>
            )}
          </div>
        </div>

        {/* 필터 및 검색 */}
        <div className="mb-6 sm:mb-8">
          {/* 검색 */}
          <div className="relative mb-4 sm:mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
            <Input
              type="text"
              placeholder="질문 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--color-background-card)] border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
            />
          </div>

          {/* 필터 및 정렬 */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* 카테고리 필터 */}
            <Select.Root value={selectedCategory} onValueChange={setSelectedCategory}>
              <Select.Trigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-background-card)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--brand-primary-400)] transition-colors w-full sm:w-auto">
                <Select.Value />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Select.Trigger>
              <Select.Content className="bg-[var(--color-background-card)] border border-[var(--color-border-default)] rounded-lg shadow-lg">
                {CATEGORIES.map((category) => (
                  <Select.Item key={category.value} value={category.value} className="px-4 py-2 hover:bg-[var(--brand-primary-100)] dark:hover:bg-[var(--brand-primary-900)] cursor-pointer">
                    {category.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* 상태 필터 */}
            <Select.Root value={selectedStatus} onValueChange={setSelectedStatus}>
              <Select.Trigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-background-card)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--brand-primary-400)] transition-colors w-full sm:w-auto">
                <Select.Value />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Select.Trigger>
              <Select.Content className="bg-[var(--color-background-card)] border border-[var(--color-border-default)] rounded-lg shadow-lg">
                {STATUS_TABS.map((tab) => (
                  <Select.Item key={tab.value} value={tab.value} className="px-4 py-2 hover:bg-[var(--brand-primary-100)] dark:hover:bg-[var(--brand-primary-900)] cursor-pointer">
                    {tab.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* 정렬 */}
            <Select.Root value={sortBy} onValueChange={setSortBy}>
              <Select.Trigger className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-background-card)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] hover:border-[var(--brand-primary-400)] transition-colors w-full sm:w-auto">
                <Select.Value />
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Select.Trigger>
              <Select.Content className="bg-[var(--color-background-card)] border border-[var(--color-border-default)] rounded-lg shadow-lg">
                {SORT_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value} className="px-4 py-2 hover:bg-[var(--brand-primary-100)] dark:hover:bg-[var(--brand-primary-900)] cursor-pointer">
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </div>
        </div>

        {/* 질문 목록 */}
        {filteredQuestions && filteredQuestions.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {filteredQuestions.map((question: any) => {
              return (
                <Card
                  key={question.id}
                  className="card-premium overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.01] hover:-translate-y-0.5 bg-[var(--color-background-card)] border-[var(--color-border-default)] hover:border-[var(--brand-primary-400)] !flex !flex-col p-4 sm:p-6"
                  onClick={() => setLocation(`/qna/${question.id}`)}
                >
                  {/* 상단: 질문자 정보 + 우측 멘토 프로필 */}
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge className="bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)] dark:bg-[var(--brand-primary-900)] dark:text-[var(--brand-primary-200)] text-xs flex-shrink-0">
                        {question.category || "기타"}
                      </Badge>
                      <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">익명의 멘티</span>
                    </div>
                    {/* 우측 멘토 프로필 이미지 */}
                    {(question as any).firstAnswerMentor && (
                      <div className="flex-shrink-0 ml-2">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center overflow-hidden border-2 border-[var(--color-border-default)]">
                          <img
                            src={(question as any).firstAnswerMentor.profileImage || "/logonew.png"}
                            alt="멘토"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 제목 */}
                  <h3 className="text-base sm:text-lg font-semibold group-hover:text-[var(--brand-primary-700)] transition-colors text-[var(--color-text-primary)] line-clamp-2 mb-2 sm:mb-3">
                    {question.title}
                  </h3>

                  {/* 답변 미리보기 */}
                  {(question as any).answerPreview && (
                    <div className="bg-[var(--color-bg-secondary)] rounded-lg p-2 sm:p-3 mb-3 sm:mb-4 border-l-2 border-[var(--brand-primary-400)]">
                      <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2">
                        {(question as any).answerPreview}...
                      </p>
                    </div>
                  )}

                  {/* 하단: 조회수 + 사회적 증거 */}
                  <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{question.viewCount || 0}</span>
                    </div>
                    {(question as any).firstAnswerMentor && (
                      <span className="text-xs text-[var(--brand-primary-600)] dark:text-[var(--brand-primary-400)]">
                        멘토가 고민 중
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="bg-[var(--color-background-card)] border-[var(--color-border-default)]">
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-sm text-[var(--color-text-secondary)] mb-4">질문이 없습니다</p>
              {isAuthenticated && !isMentor && (
                <Button
                  onClick={() => setLocation('/qna/new')}
                  className="bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)]"
                >
                  첫 번째 질문 하기
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
