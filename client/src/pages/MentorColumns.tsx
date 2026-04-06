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
import { Heart, MessageCircle, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

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

export default function MentorColumns() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"latest" | "likes" | "comments">("latest");

  setPageMeta({
    title: "멘토 칼럼 | 유니브매치",
    description: "멘토들의 경험과 조언을 담은 칼럼을 읽어보세요",
  });

  const { data: columns, isLoading } = trpc.mentorColumns.getList.useQuery({
    limit: 20,
    offset: 0,
    sortBy,
    category: selectedCategory === "all" ? undefined : selectedCategory,
    searchQuery: searchQuery || undefined,
  });

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        {/* 헤더 */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">멘토 칼럼</h1>
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

        {/* 칼럼 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : !columns || columns.length === 0 ? (
          <Card>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {columns.map((column: any) => (
              <Card
                key={column.id}
                className="hover:shadow-lg transition-shadow cursor-pointer overflow-hidden"
                onClick={() => setLocation(`/columns/${column.id}`)}
              >
                {/* 커버 이미지 */}
                {column.coverImageUrl && (
                  <div className="h-40 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                    <img
                      src={column.coverImageUrl}
                      alt={column.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">
                      {column.category}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(column.createdAt), "MMM d", { locale: ko })}
                    </span>
                  </div>
                  <CardTitle className="line-clamp-2 text-base sm:text-lg">
                    {column.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs sm:text-sm">
                    {column.excerpt}
                  </CardDescription>
                </CardHeader>

                <CardContent className="pb-4">
                  {/* 멘토 정보 */}
                  <div className="flex items-center gap-3 mb-4 pb-4 border-b">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                      {column.author.name?.charAt(0) || "M"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">
                        {column.author.name}
                      </p>
                      {column.mentorProfile && (
                        <p className="text-xs text-muted-foreground truncate">
                          {column.mentorProfile.university} {column.mentorProfile.major}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 통계 */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{column.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" />
                      <span>{column.commentsCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
