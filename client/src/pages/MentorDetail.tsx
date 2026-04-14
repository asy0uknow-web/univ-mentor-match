import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { GraduationCap, Star, ArrowLeft, MessageCircle, CheckCircle, Sparkles, Users, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";

const OPEN_CONVERSATION_KEY = "univmatch:openConversationUserId";
const DRAFT_MESSAGE_KEY = "univmatch:draftMessage";

export default function MentorDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isValidMentorId = !!(id && id.length > 0);
  
  const { data: mentor, isLoading, isError, error } = trpc.mentor.getById.useQuery(
    { mentorId: id || '' },
    { enabled: isValidMentorId === true, retry: 2 }
  );

  useEffect(() => {
    if (mentor?.profile) {
      const major = mentor.profile.major;
      const meta = PAGE_META.mentorDetail(mentor.user.name, major);
      setPageMeta(meta);
    }
  }, [mentor]);

  const { data: reviews } = trpc.review.getByMentor.useQuery(
    { mentorId: mentor?.profile?.id || 0 },
    { enabled: !!mentor?.profile?.id }
  );
  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId: mentor?.profile?.id || 0 },
    { enabled: !!mentor?.profile?.id }
  );

  const { data: mentorColumns } = trpc.mentorColumns.getList.useQuery(
    { limit: 10, sortBy: "latest" },
    { enabled: !!mentor?.user?.id }
  );

  // 현재 멘토가 작성한 칼럼만 필터링
  const filteredMentorColumns = mentorColumns?.filter(
    (column: any) => column.authorId === mentor?.user?.id
  ) || [];

  const [, setLocation] = useLocation();

  if (!isValidMentorId) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">유효하지 않은 멘토입니다.</p>
        </div>
      </PageLayout>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </PageLayout>
    );
  }

  if (isError || !mentor) {
    return (
      <PageLayout>
        <div className="text-center py-12">
          <p className="text-red-500">멘토를 찾을 수 없습니다.</p>
          <p className="text-sm text-muted-foreground mt-2">{error?.message}</p>
        </div>
      </PageLayout>
    );
  }

  const handleConsultationRequest = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl();
      return;
    }

    if (user?.id === mentor.user.id) {
      toast.error("자신에게는 상담을 신청할 수 없습니다.");
      return;
    }

    sessionStorage.setItem(OPEN_CONVERSATION_KEY, mentor.user.id.toString());
    setLocation("/messages");
  };

  const averageRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.review?.rating || 0), 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <Link href="/mentors">
            <a className="inline-flex items-center gap-2 text-sm text-primary hover:underline mb-4">
              <ArrowLeft className="w-4 h-4" />
              멘토 찾기로 돌아가기
            </a>
          </Link>
        </div>

        {/* 프로필 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* 프로필 이미지 */}
            <div className="flex-shrink-0">
                      <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-4xl font-bold">
                {mentor.user.name?.charAt(0) || 'M'}
              </div>
            </div>

            {/* 프로필 정보 */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
                    {mentor.user.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>{mentor.profile.university}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{mentor.profile.major}</span>
                  </div>
                </div>

                {/* 평점 */}
                {reviews && reviews.length > 0 && (
                  <div className="flex items-center gap-2 bg-yellow-50 px-3 py-2 rounded-lg">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-semibold text-lg">{averageRating}</span>
                    <span className="text-xs text-muted-foreground">({reviews.length})</span>
                  </div>
                )}
              </div>



              {/* CTA 버튼 */}
              <Button 
                onClick={handleConsultationRequest}
                className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                상담 신청
              </Button>
            </div>
          </div>
        </div>

        {/* 소개 */}
        {mentor.profile.bio && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3">소개</h2>
            <p className="text-muted-foreground whitespace-pre-wrap">{mentor.profile.bio}</p>
          </div>
        )}





        {/* 필드 */}
        {mentor.profile.field && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-green-600" />
              전문 분야
            </h2>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                {mentor.profile.field}
              </span>
            </div>
          </div>
        )}

        {/* 칼럼 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              멘토 칼럼
            </h2>
          </div>
          <div className="px-6 py-4">
            {filteredMentorColumns && filteredMentorColumns.length > 0 ? (
              <>
                <div className="space-y-3">
                  {filteredMentorColumns.slice(0, 3).map((column: any) => (
                    <Link key={column.id} href={`/columns/${column.id}`}>
                      <a className="block p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                        <h4 className="font-medium text-sm text-foreground line-clamp-1 mb-1">
                          {column.title}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                          {column.excerpt || column.content.substring(0, 60)}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="inline-block px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                            {column.category}
                          </span>
                          <span>좋아요 {column.likesCount || 0}</span>
                          <span>댓글 {column.commentsCount || 0}</span>
                        </div>
                      </a>
                    </Link>
                  ))}
                </div>
                {filteredMentorColumns.length > 3 && (
                  <Link href="/columns">
                    <a className="mt-4 inline-block text-sm text-primary hover:underline">
                      모든 칼럼 보기 →
                    </a>
                  </Link>
                )}
              </>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>칼럼이 없습니다</p>
              </div>
            )}
          </div>
        </div>

        {/* 갤러리 */}
        {gallery && gallery.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">갤러리</h2>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {gallery.slice(0, 6).map((item: any) => (
                  <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 리뷰 */}
        {reviews && reviews.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">리뷰 ({reviews.length})</h2>
            </div>
            <div className="px-6 py-4">
              <div className="space-y-4">
                {reviews.slice(0, 5).map((review: any) => (
                  <div key={review.id} className="pb-4 border-b border-gray-100 last:border-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                          {review.reviewer?.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{review.reviewer?.name || '익명'}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString('ko-KR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i}
                            className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-foreground">{review.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
