import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { PageLayout } from "@/components/layout";
import { setPageMeta } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Heart, MessageCircle, Trash2, Edit2, Share2, Eye } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

export default function MentorColumnDetail() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/columns/:id");
  const { user } = useAuth();
  const [replyContent, setReplyContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [viewCounted, setViewCounted] = useState(false);

  // match가 없을 때도 훈은 항상 실행되어야 함 (React 훈 규칙)
  const columnId = match ? parseInt(params!.id) : 0;

  const { data: column, isLoading } = trpc.mentorColumns.getById.useQuery(
    { columnId },
    { enabled: !!match && columnId > 0 }
  );

  const incrementViewMutation = trpc.mentorColumns.incrementViewCount.useMutation();

  if (column && !viewCounted) {
    setViewCounted(true);
    incrementViewMutation.mutate({ columnId });
  }

  const { data: comments } = trpc.mentorColumns.getComments.useQuery(
    { columnId },
    { enabled: !!match && columnId > 0 }
  );

  const toggleLikeMutation = trpc.mentorColumns.toggleLike.useMutation({
    onSuccess: () => {
      toast.success("좋아요가 업데이트되었습니다");
    },
  });

  const createCommentMutation = trpc.mentorColumns.createComment.useMutation({
    onSuccess: () => {
      setReplyContent("");
      toast.success("댓글이 작성되었습니다");
    },
  });

  const deleteColumnMutation = trpc.mentorColumns.delete.useMutation({
    onSuccess: () => {
      toast.success("칼럼이 삭제되었습니다");
      setLocation("/columns");
    },
  });

  const handleToggleLike = () => {
    toggleLikeMutation.mutate({ columnId });
  };

  const handleCreateComment = () => {
    if (!replyContent.trim()) {
      toast.error("댓글 내용을 입력해주세요");
      return;
    }

    createCommentMutation.mutate({
      columnId,
      content: replyContent,
    });
  };

  const handleDeleteColumn = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteColumnMutation.mutate({ columnId });
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <p className="text-center text-muted-foreground">로딩 중...</p>
        </div>
      </PageLayout>
    );
  }

  if (!column) {
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
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">칼럼을 찾을 수 없습니다</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const isAuthor = user?.id === column.author.id;

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

        <div className="max-w-3xl mx-auto space-y-6">
          {/* 칼럼 본문 */}
          <Card>
            {/* 커버 이미지 */}
            {column.coverImageUrl && (
              <div className="h-48 sm:h-64 bg-gradient-to-br from-blue-400 to-blue-600 overflow-hidden">
                <img
                  src={column.coverImageUrl}
                  alt={column.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <CardHeader className="pb-3 sm:pb-4">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1">
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {column.category}
                  </Badge>
                  <h1 className="text-xl sm:text-3xl font-bold mb-2">{column.title}</h1>
                </div>
                {isAuthor && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDeleteColumn}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* 멘토 정보 */}
              <div className="flex items-center gap-3 py-4 border-b">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-bold">
                  {column.author.name?.charAt(0) || "M"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm sm:text-base">{column.author.name}</p>
                  {column.mentorProfile && (
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {column.mentorProfile.university} {column.mentorProfile.major}
                    </p>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {format(new Date(column.createdAt), "yyyy년 M월 d일", { locale: ko })}
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6">
              {/* 칼럼 내용 */}
              <div className="prose prose-sm sm:prose max-w-none whitespace-pre-wrap text-sm sm:text-base">
                {column.content}
              </div>

              {/* 통계 및 액션 */}
              <div className="flex items-center gap-2 pt-4 border-t flex-wrap">
                <Button
                  variant={column.isLiked ? "default" : "outline"}
                  size="sm"
                  onClick={handleToggleLike}
                  className="gap-2"
                >
                  <Heart
                    className={`h-4 w-4 ${column.isLiked ? "fill-current" : ""}`}
                  />
                  <span className="text-xs sm:text-sm">{column.likesCount}</span>
                </Button>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground px-3 py-2 rounded-md bg-muted">
                  <MessageCircle className="h-4 w-4" />
                  <span>{column.commentsCount}</span>
                </div>
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground px-3 py-2 rounded-md bg-muted">
                  <Eye className="h-4 w-4" />
                  <span>{column.viewCount || 0}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const url = window.location.href;
                    navigator.clipboard.writeText(url);
                    toast.success('링크가 복사되었습니다');
                  }}
                  className="gap-2 ml-auto"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-xs sm:text-sm">공유</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 댓글 섹션 */}
          <Card>
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl">
                댓글 {comments?.length || 0}개
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6">
              {/* 댓글 작성 폼 */}
              <div className="space-y-3">
                <Textarea
                  placeholder="댓글을 입력해주세요..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="min-h-24 text-sm"
                />
                <Button
                  onClick={handleCreateComment}
                  disabled={!replyContent.trim()}
                  className="w-full sm:w-auto"
                >
                  댓글 작성
                </Button>
              </div>

              {/* 댓글 목록 */}
              {comments && comments.length > 0 ? (
                <div className="space-y-3 sm:space-y-4 pt-4 border-t">
                  {comments.map((comment: any) => (
                    <div
                      key={comment.id}
                      className={`p-3 sm:p-4 rounded-lg ${
                        comment.parentCommentId ? "bg-gray-50 ml-4 sm:ml-8" : "bg-gray-100"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-xs sm:text-sm">
                            {comment.author.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(comment.createdAt), "M월 d일 HH:mm", {
                              locale: ko,
                            })}
                          </p>
                        </div>
                        {user?.id === comment.author.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // 삭제 로직
                            }}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    첫 댓글을 작성해보세요
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
