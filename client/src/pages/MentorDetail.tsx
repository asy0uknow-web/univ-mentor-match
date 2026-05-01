import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { GraduationCap, Star, ArrowLeft, MessageCircle, CheckCircle, Sparkles, Users, Clock, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { GalleryUpload } from "@/components/GalleryUpload";
import { BookingModal } from "@/components/BookingModal";

const OPEN_CONVERSATION_KEY = "univmatch:openConversationUserId";
const DRAFT_MESSAGE_KEY = "univmatch:draftMessage";

export default function MentorDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
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
  const galleryQuery = trpc.gallery.getByMentorId.useQuery(
    { mentorId: mentor?.profile?.id || 0 },
    { enabled: !!mentor?.profile?.id }
  );
  const { data: gallery } = galleryQuery;

  const { data: mentorColumns } = trpc.mentorColumns.getList.useQuery(
    { limit: 3, sortBy: "latest" },
    { enabled: !!mentor?.user?.id }
  );

  // 현재 멘토가 작성한 칼럼만 필터링
  const filteredMentorColumns = mentorColumns?.filter(
    (column: any) => column.authorId === mentor?.user?.id
  ) || [];

  const [, setLocation] = useLocation();
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

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
    const profileId = mentor?.profile?.uuid || id;
    setLocation(`/messages?mentorId=${profileId}`);
  };

  const handleBookingClick = () => {
    if (!isAuthenticated) {
      setLocation('/login');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + (r.review.rating || 0), 0) / reviews.length).toFixed(1)
    : null;

  return (
    <PageLayout>
      <div className="min-h-screen bg-background">
        {/* 헤더 */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
            <Link href="/mentors">
              <Button variant="ghost" className="mb-3 sm:mb-4 px-2 sm:px-4 h-8 sm:h-10 text-xs sm:text-sm">
                <ArrowLeft className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                돌아가기
              </Button>
            </Link>
          </div>
        </div>

        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* 메인 콘텐츠 */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* 멘토 프로필 카드 */}
              <div className="card-premium-lg overflow-hidden p-6 sm:p-8">
                <CardContent className="p-4 sm:p-8">
                  <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                    <div className="flex-shrink-0">
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/mentor-default-avatar-XSMy7BuwnsbcDukFiGhL9q.webp"
                        alt={mentor.user.name || "멘토 프로필"}
                        className="w-24 h-24 sm:w-40 sm:h-40 rounded-xl object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div>
                          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{mentor.user.name}</h1>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                            <GraduationCap className="w-4 h-4" />
                            <span>{mentor.profile?.university}</span>
                            <span className="text-muted-foreground">•</span>
                            <span>{mentor.profile?.major}</span>
                          </div>
                        </div>
                        {mentor.profile?.verificationStatus === "approved" && (
                          <div className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                            <CheckCircle className="w-4 h-4" />
                            검증완료
                          </div>
                        )}
                      </div>

                      {/* 신뢰도 지표 */}
                      <div className="grid grid-cols-3 gap-3 sm:gap-4">
                        {avgRating && (
                          <div className="bg-yellow-50 dark:bg-yellow-950/30 p-3 rounded-lg">
                            <div className="flex items-center gap-1 mb-1">
                              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-lg font-bold">{avgRating}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{reviews?.length || 0}개 리뷰</p>
                          </div>
                        )}
                        <div className="bg-primary/5 p-3 rounded-lg">
                          <div className="flex items-center gap-1 mb-1">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-lg font-bold">5+</span>
                          </div>
                          <p className="text-xs text-muted-foreground">상담 경험</p>
                        </div>
                        <div className={`p-3 rounded-lg ${
                          (mentor.profile?.answerCount || 0) >= 10
                            ? "bg-purple-50 dark:bg-purple-950/30"
                            : "bg-green-50 dark:bg-green-950/30"
                        }`}>
                          <div className="flex items-center gap-1 mb-1">
                            <MessageCircle className={`w-4 h-4 ${
                              (mentor.profile?.answerCount || 0) >= 10
                                ? "text-purple-600"
                                : "text-green-600 dark:text-green-400"
                            }`} />
                            <span className="text-lg font-bold">{mentor.profile?.answerCount || 0}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">답변 수</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </div>

              {/* 소개 */}
              {mentor.profile?.bio && (
                <div className="card-premium p-6 sm:p-8">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">소개</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm sm:text-base leading-relaxed text-foreground whitespace-pre-wrap break-words">
                      {mentor.profile.bio}
                    </p>
                  </CardContent>
                </div>
              )}

              {/* 갤러리 업로드 */}
              {mentor.profile?.id && user?.id === mentor.profile.userId && (
                <GalleryUpload
                  mentorId={mentor.profile.id}
                  initialImages={gallery || []}
                  onUploadSuccess={() => {
                    // 갤러리 데이터 새로고침
                    galleryQuery.refetch();
                  }}
                />
              )}

              {/* 갤러리 읽기 전용 */}
              {gallery && gallery.length > 0 && user?.id !== mentor.profile.userId && (
                <div className="card-premium p-6 sm:p-8">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">갤러리</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* PC: 3열 그리드 */}
                    <div className="hidden sm:grid grid-cols-3 gap-3">
                      {gallery.map((image) => (
                        <img
                          key={image.id}
                          src={image.imageUrl}
                          alt="갤러리"
                          className="w-full aspect-square object-cover rounded-lg"
                        />
                      ))}
                    </div>

                    {/* 모바일: 가로 스크롤 */}
                    <div className="sm:hidden overflow-x-auto pb-2">
                      <div className="flex gap-3 min-w-min">
                        {gallery.map((image) => (
                          <img
                            key={image.id}
                            src={image.imageUrl}
                            alt="갤러리"
                            className="flex-shrink-0 w-24 h-24 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </div>
              )}

              {/* 상담 분야 */}
              {mentor.profile?.field && (
                <div className="card-premium p-6 sm:p-8">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
                      상담 분야
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                        {mentor.profile.field}
                      </span>
                    </div>
                  </CardContent>
                </div>
              )}

              {/* 칼럼 */}
              <div className="card-premium p-6 sm:p-8">
                <CardHeader className="pb-3 sm:pb-4">
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    칼럼 스튜디오
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredMentorColumns && filteredMentorColumns.length > 0 ? (
                    <>
                      <div className="space-y-3">
                        {filteredMentorColumns.slice(0, 3).map((column: any) => (
                          <Link key={column.id} href={`/columns/${column.id}`}>
                            <a className="block p-3 bg-background hover:bg-muted rounded-lg transition-colors">
                              <h4 className="font-medium text-sm text-foreground line-clamp-1 mb-1">
                                {column.title}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                {column.excerpt || column.content.substring(0, 60)}
                              </p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span className="inline-block px-2 py-1 bg-primary/10 text-blue-700 rounded text-xs">
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
                    <p className="text-sm text-muted-foreground text-center py-4">
                      아직 작성한 칼럼이 없습니다.
                    </p>
                  )}
                </CardContent>
              </div>

              {/* 갤러리 */}
              {gallery && gallery.length > 0 && (
                <div className="card-premium p-6 sm:p-8">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">갤러리</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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
                </div>
              )}

              {/* 후기 */}
              {reviews && reviews.length > 0 && (
                <div className="card-premium p-6 sm:p-8">
                  <CardHeader className="pb-3 sm:pb-4">
                    <CardTitle className="text-lg sm:text-xl">상담 후기</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.review.id} className="pb-4 border-b last:border-b-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <p className="font-medium text-sm">{review.student.name || "익명"}</p>
                          <div className="flex">
                            {Array.from({ length: review.review.rating }).map((_, i) => (
                              <Star
                                key={i}
                                className="w-3 h-3 fill-yellow-400 text-yellow-400"
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-foreground leading-relaxed break-words">
                          {review.review.comment || "리뷰 내용이 없습니다."}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </div>
              )}
            </div>

            {/* 사이드바 - 상담 신청 */}
            <div className="lg:col-span-1">
              <div className="sticky top-20 space-y-3">
                <Button
                  onClick={handleBookingClick}
                  className="w-full h-12 text-base font-semibold bg-primary hover:bg-primary/90 text-white rounded-md shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  상담 신청하기
                  <ArrowRight className="w-4 h-4" />
                </Button>

                {/* 기본 정보 카드 */}
                <div className="card-premium-lg flex flex-col gap-6 p-6 mt-6">
                  <CardHeader className="pb-3 px-6">
                    <CardTitle className="text-base">멘토 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm px-6">
                    {/* 이름 */}
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">이름</p>
                      <p className="text-foreground font-medium">{mentor.user.name}</p>
                    </div>
                    
                    {/* 학교 */}
                    {mentor.profile?.university && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">학교</p>
                        <p className="text-foreground font-medium">{mentor.profile.university}</p>
                      </div>
                    )}
                    
                    {/* 전공 */}
                    {mentor.profile?.major && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">전공</p>
                        <p className="text-foreground font-medium">{mentor.profile.major}</p>
                      </div>
                    )}
                    
                    {/* 학년 */}
                    {mentor.profile?.grade && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">학년</p>
                        <p className="text-foreground font-medium">
                          {mentor.profile.grade === 'graduate' ? '대학원' : `${mentor.profile.grade}학년`}
                        </p>
                      </div>
                    )}
                    
                    {/* 상담 가능 지역 */}
                    {mentor.profile?.availableRegions && (
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1">상담 가능 지역</p>
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            try {
                              const regions = typeof mentor.profile.availableRegions === 'string' 
                                ? JSON.parse(mentor.profile.availableRegions) 
                                : mentor.profile.availableRegions;
                              const regionMap: Record<string, string> = {
                                'seoul': '서울',
                                'gyeonggi': '경기',
                                'incheon': '인천',
                                'gangwon': '강원',
                                'chungbuk': '충북',
                                'chungnam': '충남',
                                'jeonbuk': '전북',
                                'jeonnam': '전남',
                                'gwangju': '광주',
                                'daejeon': '대전',
                                'ulsan': '울산',
                                'busan': '부산',
                                'daegu': '대구',
                                'jeju': '제주',
                                'chungcheong': '충청'
                              };
                              return Array.isArray(regions) ? regions.map((region: string, idx: number) => (
                                <span key={idx} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs">
                                  {regionMap[region] || region}
                                </span>
                              )) : null;
                            } catch (e) {
                              return <span className="text-xs text-muted-foreground">지역 정보 없음</span>;
                            }
                          })()}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </div>

                {/* 상담 정보 카드 */}
                <div className="card-premium p-6 mt-6">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">상담 정보</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">회당 60분</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">1:1 대면 상담</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">응답률 높음</span>
                    </div>
                  </CardContent>
                </div>

                {/* 안내 메시지 */}
                <div className="card-premium p-4 bg-primary/5 border border-primary/20">
                  <p className="font-medium mb-1 text-sm">💡 팁</p>
                  <p className="text-xs text-foreground">메시지를 먼저 보내 멘토와 상담 시간을 조율한 후 예약하세요.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <BookingModal
        isOpen={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        mentorId={mentor?.profile?.uuid || id || ""}
        mentorName={mentor?.user?.name || ""}
      />
    </PageLayout>
  );
}
