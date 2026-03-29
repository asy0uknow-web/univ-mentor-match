import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { GraduationCap, Star, ArrowLeft, MessageCircle } from "lucide-react";

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
  // id는 UUID 또는 숫자 ID
  const isValidMentorId = id && id.length > 0;
  
  const { data: mentor, isLoading, isError, error } = trpc.mentor.getById.useQuery(
    { mentorId: id || '' },
    { enabled: isValidMentorId, retry: 2 }
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

  const [, setLocation] = useLocation();

  if (!isValidMentorId) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 px-4">
        <p className="text-muted-foreground text-sm sm:text-base">유효하지 않은 멘토 ID입니다.</p>
        <Link href="/mentors">
          <Button variant="outline" className="text-xs sm:text-sm">멘토 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-24 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground text-sm sm:text-base">멘토 정보를 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-24 flex items-center justify-center flex-col gap-4">
          <p className="text-destructive font-medium text-sm sm:text-base">멘토 정보를 불러오는 데 실패했습니다.</p>
          <p className="text-muted-foreground text-xs sm:text-sm">{error?.message || "네트워크 오류가 발생했습니다."}</p>
          <div className="flex gap-2 sm:gap-3 flex-wrap justify-center">
            <Button variant="outline" onClick={() => window.location.reload()} className="text-xs sm:text-sm">다시 시도</Button>
            <Link href="/mentors">
              <Button variant="outline" className="text-xs sm:text-sm">멘토 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!mentor) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-12 sm:py-24 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground text-sm sm:text-base">멘토를 찾을 수 없습니다.</p>
          <Link href="/mentors">
            <Button variant="outline" className="text-xs sm:text-sm">멘토 목록으로 돌아가기</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  const handleMessageClick = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    // UUID를 사용하여 메시지 페이지로 이동
    const profileId = mentor?.profile?.uuid || id;
    setLocation(`/messages?mentorId=${profileId}`);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    // UUID를 사용하여 예약 페이지로 이동
    const profileId = mentor?.profile?.uuid || id;
    setLocation(`/bookings?mentorId=${profileId}`);
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <Link href="/mentors">
          <Button variant="ghost" className="mb-3 sm:mb-4 px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm">
            <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            돌아가기
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            <Card className="overflow-hidden">
              <CardContent className="p-3 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-6">
                  <div className="flex-shrink-0">
                    <img
                      src="https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/mentor-default-avatar-XSMy7BuwnsbcDukFiGhL9q.webp"
                      alt={mentor.user.name || "멘토 프로필"}
                      className="w-20 h-20 sm:w-32 sm:h-32 rounded-lg object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2 truncate">{mentor.user.name}</h1>
                    <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-muted-foreground">
                      <p className="flex items-center gap-1 sm:gap-2">
                        <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                        <span className="truncate">{mentor.profile?.university}</span>
                      </p>
                      <p className="truncate">{mentor.profile?.major}</p>
                      {mentor.profile?.grade && <p>{mentor.profile.grade}</p>}
                    </div>

                    {reviews && reviews.length > 0 && (
                      <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                        <div className="flex">
                          {Array.from({ length: 5 }).map((_, i) => {
                            const avgRating = Math.round(
                              reviews.reduce((sum, r) => sum + (r.review.rating || 0), 0) / reviews.length
                            );
                            return (
                              <Star
                                key={i}
                                className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                  i < avgRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            );
                          })}
                        </div>
                        <span className="text-xs sm:text-sm">({reviews.length})</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {mentor.profile?.bio && (
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg">소개</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                    {mentor.profile.bio}
                  </p>
                </CardContent>
              </Card>
            )}



            {gallery && gallery.length > 0 && (
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg">갤러리</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {gallery.map((image) => (
                      <img
                        key={image.id}
                        src={image.imageUrl}
                        alt="갤러리"
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {reviews && reviews.length > 0 && (
              <Card>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-base sm:text-lg">후기</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  {reviews.map((review) => (
                    <div key={review.review.id} className="pb-3 sm:pb-4 border-b last:border-b-0">
                      <div className="flex items-start justify-between gap-2 mb-1 sm:mb-2">
                        <p className="font-medium text-xs sm:text-sm">{review.student.name || "익명"}</p>
                        <div className="flex">
                          {Array.from({ length: review.review.rating }).map((_, i) => (
                            <Star
                              key={i}
                              className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400"
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed break-words">
                        {review.review.comment || "리뷰 내용이 없습니다."}
                      </p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-2 sm:space-y-3">
              <Button
                onClick={handleBookingClick}
                className="w-full h-9 sm:h-10 text-xs sm:text-sm"
              >
                상담 예약하기
              </Button>
              <Button
                onClick={handleMessageClick}
                variant="outline"
                className="w-full h-9 sm:h-10 text-xs sm:text-sm"
              >
                <MessageCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                메시지 보내기
              </Button>
            </div>
          </div>
        </div>
      </div>


    </PageLayout>
  );
}
