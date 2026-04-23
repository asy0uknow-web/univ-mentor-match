import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Clock, Trash2, Edit3, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function DraftColumns() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // draft 칼럼 목록 조회
  const { data: draftColumns, isLoading, refetch } = trpc.mentorColumns.getDraftColumns.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 칼럼 삭제
  const deleteMutation = trpc.mentorColumns.delete.useMutation({
    onSuccess: () => {
      toast.success("칼럼이 삭제되었습니다");
      setDeletingId(null);
      refetch();
    },
    onError: (error: any) => {
      toast.error(`삭제 실패: ${error.message}`);
    },
  });

  setPageMeta({
    title: "임시 저장 칼럼 | 유니브매치",
    description: "작성 중인 칼럼을 관리하세요",
  });

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => setLocation('/login')}
                className="w-full"
              >
                로그인하기
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <Button
          variant="ghost"
          onClick={() => setLocation("/columns")}
          className="mb-4 text-xs sm:text-sm"
        >
          <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          돌아가기
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/50 dark:to-orange-950/50 p-4 sm:p-6 rounded-lg border border-amber-100 dark:border-amber-800/50">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="h-6 w-6 text-amber-600" />
              <h1 className="text-2xl sm:text-3xl font-bold">임시 저장 칼럼</h1>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              작성 중인 칼럼을 이어서 작성하거나 삭제할 수 있습니다
            </p>
          </div>

          {/* 칼럼 목록 또는 빈 상태 */}
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            </div>
          ) : !draftColumns || draftColumns.length === 0 ? (
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-12 pb-12 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">임시 저장된 칼럼이 없습니다</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  새로운 칼럼을 작성하여 임시 저장해보세요
                </p>
                <Button onClick={() => setLocation("/columns/create")}>
                  새 칼럼 작성하기
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {draftColumns.map((column: any) => (
                <Card key={column.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      {/* 칼럼 정보 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-3 mb-3">
                          <FileText className="h-5 w-5 text-amber-600 flex-shrink-0 mt-1" />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold truncate">
                              {column.title || "제목 없음"}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-2">
                              {column.excerpt || column.content?.substring(0, 100) || "내용 없음"}
                            </p>
                          </div>
                        </div>

                        {/* 메타 정보 */}
                        <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>
                              {column.updatedAt 
                                ? new Date(column.updatedAt).toLocaleDateString('ko-KR')
                                : "날짜 없음"
                              }
                            </span>
                          </div>
                          {column.category && (
                            <Badge variant="secondary" className="text-xs">
                              {column.category}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex gap-2 flex-shrink-0 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setLocation(`/columns/edit/${column.id}`)}
                          className="flex-1 sm:flex-none gap-2"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span className="hidden sm:inline">이어서 작성</span>
                          <span className="sm:hidden">작성</span>
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            if (deletingId === column.id) {
                              deleteMutation.mutate({ columnId: column.id });
                            } else {
                              setDeletingId(column.id);
                            }
                          }}
                          className="flex-1 sm:flex-none gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="hidden sm:inline">
                            {deletingId === column.id ? "확인" : "삭제"}
                          </span>
                          <span className="sm:hidden">
                            {deletingId === column.id ? "확인" : "삭제"}
                          </span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* 새 칼럼 작성 버튼 */}
          {draftColumns && draftColumns.length > 0 && (
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setLocation("/columns/create")}
                className="flex-1 gap-2"
              >
                <FileText className="h-4 w-4" />
                새 칼럼 작성하기
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
