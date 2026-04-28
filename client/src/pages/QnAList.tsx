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
      return "pending";
    case "answered":
    case "solved":
      return "accepted";
    default:
      return "new";
  }
};

export default function QnAList() {
  const { isAuthenticated, user } = useAuth({ redirectOnUnauthenticated: false });
  const isMentor = user?.role === 'mentor';
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [trendingPeriod, setTrendingPeriod] = useState<"week" | "month" | "all">("week");

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

  // 이번주 인기 질문 조회 (답변많은순, 최대 5개)
  const { data: trendingQuestions } = trpc.qna.getQuestions.useQuery({
    limit: 5,
    offset: 0,
    sortBy: "most_answers" as any,
  });

  return (
    <PageLayout>
      <div 
        className="relative min-h-screen py-6 sm:py-12 overflow-hidden"
        style={{
          backgroundImage: 'url(https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/qna-center-background-v2-JVpKhRfA6vNwToNjTnLJMJ.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          backgroundClip: 'border-box'
        }}
      >
        <div className="absolute inset-0 bg-white/75 dark:bg-black/80 backdrop-blur-sm"></div>
        <div className="relative container mx-auto px-3 sm:px-4">
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
                  className="text-xs sm:text-sm h-10 sm:h-10 flex-shrink-0 bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)]"
                >
                  <MessageCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">답변하기</span>
                  <span className="sm:hidden">답변</span>
                </Button>
              ) : (
                <Button
                  onClick={() => setLocation('/qna/new')}
                  className="text-xs sm:text-sm h-10 sm:h-10 flex-shrink-0 bg-[var(--color-cta-primary-bg)] hover:bg-[var(--color-cta-primary-bg-hover)]"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">질문하기</span>
                  <span className="sm:hidden">질문</span>
                </Button>
              )
            )}
          </div>

          {/* 안내 박스 */}
          <Card className="bg-[var(--brand-primary-50)] dark:bg-[var(--brand-primary-900)] border-[var(--color-border-default)] border-2 mb-8 shadow-lg">
            <CardContent className="pt-6 px-6 pb-6">
              <div className="flex gap-4">
                <AlertCircle className="h-7 w-7 text-[var(--brand-primary-700)] dark:text-[var(--brand-primary-300)] flex-shrink-0 mt-1" />
                <div className="text-sm sm:text-base text-[var(--brand-primary-700)] dark:text-[var(--brand-primary-300)] space-y-2">
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

        {/* 이번주 인기 질문 섹션 */}
        {trendingQuestions && trendingQuestions.length > 0 && (
          <div className="mb-12">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold mb-2 text-[var(--color-text-primary)]">🔥 인기 질문</h2>
                  <p className="text-sm text-[var(--color-text-secondary)]">가장 많은 답변을 받은 질문들을 만나보세요</p>
                </div>
                <div className="flex gap-2">
                  {[
                    { label: "이번주", value: "week" },
                    { label: "이번달", value: "month" },
                    { label: "전체", value: "all" },
                  ].map((period) => (
                    <button
                      key={period.value}
                      onClick={() => setTrendingPeriod(period.value as any)}
                      className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                        trendingPeriod === period.value
                          ? "bg-[var(--brand-primary-600)] text-white"
                          : "bg-[var(--color-background-card)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:border-[var(--brand-primary-600)]"
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
              {trendingQuestions.map((question: any) => (
                <Card
                  key={question.id}
                  className="card-premium overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group group-hover:-translate-y-1 bg-[var(--color-background-card)] border-[var(--color-border-default)]"
                  onClick={() => setLocation(`/qna/${question.id}`)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <StatusBadge status={mapStatusToStatusBadge(question.status)} />
                    </div>
                    <CardTitle className="line-clamp-2 text-sm group-hover:text-[var(--brand-primary-700)] transition-colors text-[var(--color-text-primary)]">
                      {question.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)]">
                      <div className="flex gap-2">
                        <div className="flex items-center gap-0.5">
                          <MessageCircle className="h-3 w-3" />
                          <span>{question.answerCount}개</span>
                        </div>
                      </div>
                      <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
      
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 필터 및 정렬 섹션 */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* 검색 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[var(--color-text-secondary)]" />
              <Input
                placeholder="질문 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--color-background-card)] border-[var(--color-border-default)] text-[var(--color-text-primary)]"
              />
            </div>

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
                {STATUS_TABS.map((status) => (
                  <Select.Item key={status.value} value={status.value} className="px-4 py-2 hover:bg-[var(--brand-primary-100)] dark:hover:bg-[var(--brand-primary-900)] cursor-pointer">
                    {status.label}
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
              const categoryData = getCategoryIcon(question.category);
              const IconComponent = categoryData.icon;
              return (
                <Card
                  key={question.id}
                  className="card-premium overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group hover:scale-[1.01] hover:-translate-y-0.5 bg-[var(--color-background-card)] border-[var(--color-border-default)] hover:border-[var(--brand-primary-400)] !flex !flex-row items-center gap-3 sm:gap-4 p-3 sm:p-4 !py-0 !px-0 !gap-0"
                  onClick={() => setLocation(`/qna/${question.id}`)}
                >
                  {/* 좌측 아이콘 - 작은 정사각형 */}
                  <div className={`flex-shrink-0 flex items-center justify-center ${categoryData.bgColor} w-12 h-12 sm:w-14 sm:h-14 rounded-lg p-3 sm:p-4 ml-3 sm:ml-4`}>
                    <IconComponent className={`h-6 w-6 sm:h-8 sm:w-8 ${categoryData.color}`} />
                  </div>

                  {/* 중앙 콘텐츠 영역 */}
                  <div className="flex-1 flex flex-col justify-start min-w-0 px-3 sm:px-4">
                    {/* 제목 */}
                    <h3 className="text-base sm:text-lg font-semibold group-hover:text-[var(--brand-primary-700)] transition-colors text-[var(--color-text-primary)] line-clamp-2 mb-1">
                      {question.title}
                    </h3>

                    {/* 내용 */}
                    <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] line-clamp-2 mb-2">
                      {question.content}
                    </p>

                    {/* 메타 정보 - 조회수 */}
                    <div className="flex items-center gap-1 text-xs text-[var(--color-text-secondary)]">
                      <Eye className="h-3 w-3" />
                      <span>{question.viewCount || 0}</span>
                    </div>
                  </div>

                  {/* 우측 상태 배지 */}
                  <div className="flex-shrink-0 flex items-start">
                    <StatusBadge status={mapStatusToStatusBadge(question.status)} />
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
      </div>
    </PageLayout>
  );
}
