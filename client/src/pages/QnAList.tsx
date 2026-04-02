import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { Search, Plus, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function QnAList() {
  const { user, isAuthenticated } = useAuth();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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

        {/* 검색 바 */}
        <div className="mb-6 sm:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="질문을 검색해보세요..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 text-xs sm:text-sm h-9 sm:h-10"
            />
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
                        {question.isAnonymous ? "익명" : question.author?.name || "사용자"}
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
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {format(new Date(question.createdAt), "MMM dd", { locale: ko })}
                    </span>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>0개 답변</span>
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
