import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Search, Plus, MessageCircle, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import * as Select from "@radix-ui/react-select";

const CATEGORIES = ["전체", "대학생활", "진로", "학습", "기타"];
const SORT_OPTIONS = [
  { value: "recent", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "answers", label: "답변 많은순" },
];

export default function QnAList() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [sortBy, setSortBy] = useState("recent");

  useEffect(() => {
    setPageMeta({ title: "Q&A", description: "멘토와 학생의 질문과 답변 공간" });
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
    category: selectedCategory === "전체" ? undefined : selectedCategory,
    sortBy: sortBy as any,
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="flex items-center justify-between gap-2 mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">Q&A</h1>
          {isAuthenticated && (
            <Button
              onClick={() => setLocation('/qna/new')}
              className="text-xs sm:text-sm h-8 sm:h-10"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              질문 작성
            </Button>
          )}
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
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background hover:bg-accent h-9 sm:h-10 min-w-[100px]">
                <Select.Value />
                <Select.Icon className="ml-2">
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Content className="bg-background border border-input rounded-md shadow-md z-50">
                <Select.Viewport className="p-1">
                  {CATEGORIES.map((cat) => (
                    <Select.Item key={cat} value={cat} className="px-3 py-2 text-xs sm:text-sm cursor-pointer hover:bg-accent rounded">
                      {cat}
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Root>

            {/* 정렬 옵션 */}
            <Select.Root value={sortBy} onValueChange={setSortBy}>
              <Select.Trigger className="inline-flex items-center justify-between px-3 py-2 text-xs sm:text-sm border border-input rounded-md bg-background hover:bg-accent h-9 sm:h-10 min-w-[100px]">
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

        {/* 질문 목록 */}
        {isLoading ? (
          <p className="text-xs sm:text-sm text-muted-foreground">로딩 중...</p>
        ) : questions && questions.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {questions.map((question) => (
              <Card
                key={question.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setLocation(`/qna/${question.id}`)}
              >
                <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg truncate">
                        {question.title}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm truncate mt-1">
                        {question.isAnonymous ? "익명" : question.author?.name || "사용자"} • {format(new Date(question.createdAt), "MMM dd", { locale: ko })}
                      </CardDescription>
                    </div>
                    {question.category && (
                      <Badge variant="secondary" className="text-xs flex-shrink-0">
                        {question.category}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                    {question.content}
                  </p>
                  <div className="flex items-center justify-end text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{(question as any).answerCount || 0}개 답변</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 sm:py-12 text-center px-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-4">
                {searchQuery ? "검색 결과가 없습니다" : "질문이 없습니다"}
              </p>
              {!searchQuery && isAuthenticated && (
                <Button
                  onClick={() => setLocation('/qna/new')}
                  className="text-xs sm:text-sm h-8 sm:h-10"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                  첫 번째 질문 작성하기
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
