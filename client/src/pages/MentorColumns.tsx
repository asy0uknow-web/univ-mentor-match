import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Plus, Search, Eye, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useRef, useState as useStateHook } from "react";

const COLUMN_CATEGORIES = [
  "전공 선택",
  "대학 생활",
  "학습 방법",
  "진로 준비",
  "시험 준비",
  "동아리 활동",
  "교환학생",
  "대학원 진학",
  "기타",
];

// 태그 색상 팔레트
const TAG_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200" },
  { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-200" },
  { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-200" },
  { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  { bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200" },
  { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-200" },
];

function getTagColor(index: number) {
  return TAG_COLORS[index % TAG_COLORS.length];
}

export default function MentorColumns() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth({ redirectOnUnauthenticated: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "comments">("latest");
  const [trendingPeriod, setTrendingPeriod] = useState<"week" | "month">("week");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  setPageMeta({
    title: "칼럼 스튜디오 | 유니브매치",
    description: "멘토들의 경험과 조언을 담은 칼럼을 읽어보세요",
  });

  const { data: columns, isLoading } = trpc.mentorColumns.getList.useQuery({
    limit: 20,
    offset: 0,
    sortBy,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined,
  });

  // 인기 급상승 칼럼 (좋아요순, 최대 10개)
  const { data: trendingColumns } = trpc.mentorColumns.getList.useQuery({
    limit: 10,
    offset: 0,
    sortBy: "likes",
  });

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  return (
    <PageLayout>
      <div className="relative min-h-screen py-6 sm:py-12">
        <div className="relative container mx-auto px-3 sm:px-4">
          {/* 헤더 */}
          <div className="mb-8 sm:mb-12">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">칼럼 스튜디오</h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  멘토들의 경험과 조언을 담은 칼럼을 읽어보세요
                </p>
              </div>
              {isAuthenticated && user?.role === "mentor" && (
                <Button
                  onClick={() => setLocation("/columns/new")}
                  className="w-full sm:w-auto gap-2"
                >
                  <Plus className="h-4 w-4" />
                  칼럼 작성
                </Button>
              )}
            </div>

            {/* 필터 및 검색 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {/* 검색 */}
              <div className="relative sm:col-span-2">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="칼럼 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* 카테고리 필터 */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="카테고리 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체 카테고리</SelectItem>
                  {COLUMN_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* 정렬 */}
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="latest">최신순</SelectItem>
                  <SelectItem value="likes">좋아요순</SelectItem>
                  <SelectItem value="comments">댓글순</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 7:3 레이아웃 */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 좌측 (7) */}
            <div className="lg:col-span-7 space-y-6">
              {/* 인기 급상승 칼럼 (가로 스크롤) */}
              {trendingColumns && trendingColumns.length > 0 && (
                <div>
                  <div className="mb-4">
                    <h2 className="text-xl sm:text-2xl font-bold mb-2">🔥 인기 급상승</h2>
                    <p className="text-sm text-muted-foreground">지금 가장 주목받는 칼럼들</p>
                  </div>

                  <div className="relative">
                    {/* 스크롤 컨테이너 */}
                    <div
                      ref={scrollContainerRef}
                      onScroll={updateScrollButtons}
                      className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide"
                    >
                      {trendingColumns.map((column: any, idx: number) => (
                        <div
                          key={column.id}
                          className="flex-shrink-0 w-full sm:w-96 snap-start"
                        >
                          <Card
                            className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group h-full bg-card border-border"
                            onClick={() => setLocation(`/columns/${column.id}`)}
                          >
                            <div className="flex flex-col sm:flex-row h-full">
                              {/* 왼쪽: 큰 이미지 */}
                              {column.coverImageUrl && (
                                <div className="w-full sm:w-48 h-48 sm:h-auto bg-primary/10 overflow-hidden flex-shrink-0">
                                  <img
                                    src={column.coverImageUrl}
                                    alt={column.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                  />
                                </div>
                              )}

                              {/* 오른쪽: 콘텐츠 */}
                              <div className="flex-1 p-4 sm:p-6 flex flex-col justify-between">
                                {/* 태그들 */}
                                {column.tags && column.tags.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {column.tags.map((tag: string, tagIdx: number) => {
                                      const color = getTagColor(tagIdx);
                                      return (
                                        <Badge
                                          key={`${column.id}-${tag}-${tagIdx}`}
                                          className={`text-xs ${color.bg} ${color.text} border ${color.border}`}
                                        >
                                          {tag}
                                        </Badge>
                                      );
                                    })}
                                  </div>
                                )}

                                <div>
                                  <h3 className="text-base sm:text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {column.title}
                                  </h3>
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mb-3">
                                    {column.excerpt}
                                  </p>
                                </div>

                                {/* 통계 */}
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <div className="flex gap-3">
                                    <div className="flex items-center gap-1">
                                      <Heart className="h-3 w-3" />
                                      <span>{column.likesCount}</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <MessageCircle className="h-3 w-3" />
                                      <span>{column.commentsCount}</span>
                                    </div>
                                  </div>
                                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>

                    {/* 스크롤 버튼 */}
                    {canScrollLeft && (
                      <button
                        onClick={() => handleScroll("left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-background border border-border rounded-full p-2 hover:bg-accent transition-all z-10"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                    )}
                    {canScrollRight && (
                      <button
                        onClick={() => handleScroll("right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-background border border-border rounded-full p-2 hover:bg-accent transition-all z-10"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* 칼럼 목록 (세로) */}
              <div>
                {isLoading ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">로딩 중...</p>
                  </div>
                ) : !columns || columns.length === 0 ? (
                  <Card className="bg-card border-border">
                    <CardContent className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">칼럼이 없습니다</p>
                      {isAuthenticated && user?.role === "mentor" && (
                        <Button onClick={() => setLocation("/columns/new")}>
                          첫 칼럼 작성하기
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {columns.map((column: any, idx: number) => (
                      <Card
                        key={column.id}
                        className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group bg-card border-border"
                        onClick={() => setLocation(`/columns/${column.id}`)}
                      >
                        <div className="flex gap-4 p-4">
                          {/* 왼쪽: 작은 이미지 */}
                          {column.coverImageUrl && (
                            <div className="w-24 h-24 bg-primary/10 overflow-hidden flex-shrink-0 rounded-lg">
                              <img
                                src={column.coverImageUrl}
                                alt={column.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}

                          {/* 오른쪽: 콘텐츠 */}
                          <div className="flex-1 flex flex-col justify-between min-w-0">
                            {/* 태그들 */}
                            {column.tags && column.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-2">
                                {column.tags.slice(0, 3).map((tag: string, tagIdx: number) => {
                                  const color = getTagColor(tagIdx);
                                  return (
                                    <Badge
                                      key={`${column.id}-${tag}-${tagIdx}`}
                                      className={`text-xs ${color.bg} ${color.text} border ${color.border}`}
                                    >
                                      {tag}
                                    </Badge>
                                  );
                                })}
                              </div>
                            )}

                            <div className="min-w-0">
                              <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors">
                                {column.title}
                              </h3>
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                {column.excerpt}
                              </p>
                            </div>

                            {/* 하단 정보 */}
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                              <div className="flex gap-3">
                                <div className="flex items-center gap-1">
                                  <Heart className="h-3 w-3" />
                                  <span>{column.likesCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3 w-3" />
                                  <span>{column.commentsCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Eye className="h-3 w-3" />
                                  <span>{column.viewCount || 0}</span>
                                </div>
                              </div>
                              <span>{format(new Date(column.createdAt), "MMM d", { locale: ko })}</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 우측 (3) - 인기 칼럼 사이드바 */}
            <div className="lg:col-span-5">
              <div className="sticky top-20">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-4">
                      {[
                        { label: "이번주", value: "week" },
                        { label: "이번달", value: "month" },
                      ].map((period) => (
                        <button
                          key={period.value}
                          onClick={() => setTrendingPeriod(period.value as any)}
                          className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                            trendingPeriod === period.value
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground border border-border hover:border-primary"
                          }`}
                        >
                          {period.label}
                        </button>
                      ))}
                    </div>
                    <CardTitle className="text-lg">⭐ 인기 칼럼</CardTitle>
                    <CardDescription>가장 사랑받는 칼럼들</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {trendingColumns && trendingColumns.length > 0 ? (
                      trendingColumns.slice(0, 5).map((column: any, idx: number) => (
                        <div
                          key={column.id}
                          className="pb-4 border-b border-border last:pb-0 last:border-b-0 cursor-pointer group"
                          onClick={() => setLocation(`/columns/${column.id}`)}
                        >
                          <div className="flex gap-2 mb-2">
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                              {idx + 1}
                            </span>
                            <h4 className="font-semibold text-sm line-clamp-2 group-hover:text-primary transition-colors flex-1">
                              {column.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground ml-8">
                            <Heart className="h-3 w-3" />
                            <span>{column.likesCount}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">인기 칼럼이 없습니다</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
