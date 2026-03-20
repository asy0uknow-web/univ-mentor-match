'use client';
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { GraduationCap, Star, ArrowLeft, MessageCircle } from "lucide-react";
import BugReportModal from "@/components/BugReportModal";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

// When jumping to /messages from another page (e.g., mentor detail), we store
// the target user id in sessionStorage so Messages.tsx can auto-open the right
// conversation.
const OPEN_CONVERSATION_KEY = "univmatch:openConversationUserId";
const DRAFT_MESSAGE_KEY = "univmatch:draftMessage";

export default function MentorDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const mentorId = id ? parseInt(id, 10) : 0;
  const isValidMentorId = !isNaN(mentorId) && mentorId > 0;
  
  const { data: mentor, isLoading, isError, error } = trpc.mentor.getById.useQuery(
    { mentorId },
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
    { mentorId },
    { enabled: isValidMentorId }
  );
  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId },
    { enabled: isValidMentorId }
  );

  const [, setLocation] = useLocation();

  if (!isValidMentorId) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">유효하지 않은 멘토 ID입니다.</p>
        <Link href="/mentors">
          <Button variant="outline">멘토 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-24 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">멘토 정보를 불러오는 중...</p>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (isError) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-24 flex items-center justify-center flex-col gap-4">
          <p className="text-destructive font-medium">멘토 정보를 불러오는 데 실패했습니다.</p>
          <p className="text-muted-foreground text-sm">{error?.message || "네트워크 오류가 발생했습니다."}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>다시 시도</Button>
            <Link href="/mentors">
              <Button variant="outline">멘토 목록으로 돌아가기</Button>
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (!mentor) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-24 flex items-center justify-center flex-col gap-4">
          <p className="text-muted-foreground">멘토를 찾을 수 없습니다.</p>
          <Link href="/mentors">
            <Button variant="outline">멘토 목록으로 돌아가기</Button>
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <Link href="/mentors">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            멘토 목록으로
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mentor Profile */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    {/* 멘토 프로필 아바타 */}
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663280786037/Gy6RaYwMhnXP5TJQbTpkxJ/mentor-default-avatar-XSMy7BuwnsbcDukFiGhL9q.webp"
                        alt={mentor.user.name || "멘토 프로필"}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <CardTitle className="text-3xl">{mentor.user.name}</CardTitle>
                      <CardDescription className="text-lg mt-2">
                        {mentor.profile.university} · {mentor.profile.major} · {mentor.profile.grade}학년
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {mentor.profile.reviewCount === 0 ? (
                      <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 px-4 py-2 rounded-full border border-blue-200">
                        <span className="text-2xl">🆕</span>
                        <span className="font-semibold text-blue-700">신규 멘토</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-primary">
                        <Star className="h-6 w-6 fill-current" />
                        <span className="text-2xl font-bold">
                          {parseFloat(mentor.profile.averageRating || "0").toFixed(1)}
                        </span>
                        <span className="text-muted-foreground">
                          ({mentor.profile.reviewCount}개 리뷰)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-2">소개</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">
                      {mentor.profile.bio || "소개글이 없습니다."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Gallery */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>대학생활 갤러리</CardTitle>
                <CardDescription>멘토의 대학생활을 엿보세요</CardDescription>
              </CardHeader>
              <CardContent>
                {gallery && gallery.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {gallery.map((image) => (
                      <div key={image.id} className="group relative overflow-hidden rounded-lg">
                        <img
                          src={image.imageUrl}
                          alt={image.caption || "Gallery"}
                          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {image.caption && (
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                            <p className="text-white text-sm line-clamp-2">{image.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">아직 갤러리 사진이 없습니다</p>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>리뷰</CardTitle>
              </CardHeader>
              <CardContent>
                {reviews && reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.map((review) => (
                      <div key={review.review.id} className="border-b border-border pb-4 last:border-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex items-center text-primary">
                            {Array.from({ length: review.review.rating }).map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-current" />
                            ))}
                          </div>
                    <span className="text-sm text-muted-foreground">
                      {review.student.name || "익명"}
                    </span>
                        </div>
                        <p className="text-muted-foreground">
                          {review.review.comment || "리뷰 내용이 없습니다."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">아직 리뷰가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Consultation Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>상담 조율</CardTitle>
                <CardDescription>상담 유형을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {isAuthenticated ? (
                  user?.id === mentor?.user?.id ? (
                    <div className="text-center py-6 text-muted-foreground text-sm">
                      자신의 프로필에서는 상담을 신청할 수 없습니다.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const recipientId = mentor?.user?.id;
                          if (!recipientId) {
                            toast.error("멘토 정보를 확인할 수 없습니다.");
                            return;
                          }
                          try {
                            sessionStorage.setItem(OPEN_CONVERSATION_KEY, String(recipientId));
                            sessionStorage.setItem("univmatch:consultationType", "career_counseling");
                            sessionStorage.setItem(DRAFT_MESSAGE_KEY, "안녕하세요! 진로상담을 받고 싶습니다.");
                          } catch {}
                          setLocation("/messages");
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
                      >
                        진로상담 (시간당 40,000원)
                      </button>
                      <button
                        onClick={() => {
                          const recipientId = mentor?.user?.id;
                          if (!recipientId) {
                            toast.error("멘토 정보를 확인할 수 없습니다.");
                            return;
                          }
                          try {
                            sessionStorage.setItem(OPEN_CONVERSATION_KEY, String(recipientId));
                            sessionStorage.setItem("univmatch:consultationType", "university_tour");
                            sessionStorage.setItem(DRAFT_MESSAGE_KEY, "안녕하세요! 대학탐방을 받고 싶습니다.");
                          } catch {}
                          setLocation("/messages");
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
                      >
                        대학탐방 (시간당 50,000원)
                      </button>
                      <button
                        onClick={() => {
                          const recipientId = mentor?.user?.id;
                          if (!recipientId) {
                            toast.error("멘토 정보를 확인할 수 없습니다.");
                            return;
                          }
                          try {
                            sessionStorage.setItem(OPEN_CONVERSATION_KEY, String(recipientId));
                            sessionStorage.setItem("univmatch:consultationType", "resume_consulting");
                            sessionStorage.setItem(DRAFT_MESSAGE_KEY, "안녕하세요! 생기부컨설팅을 받고 싶습니다.");
                          } catch {}
                          setLocation("/messages");
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
                      >
                        생기부컨설팅 (시간당 50,000원)
                      </button>
                      <button
                        onClick={() => {
                          const recipientId = mentor?.user?.id;
                          if (!recipientId) {
                            toast.error("멘토 정보를 확인할 수 없습니다.");
                            return;
                          }
                          try {
                            sessionStorage.setItem(OPEN_CONVERSATION_KEY, String(recipientId));
                            sessionStorage.setItem("univmatch:consultationType", "academic_management");
                            sessionStorage.setItem(DRAFT_MESSAGE_KEY, "안녕하세요! 학업관리 상담을 받고 싶습니다.");
                          } catch {}
                          setLocation("/messages");
                        }}
                        className="w-full px-4 py-2 rounded-lg border border-border hover:bg-accent transition-colors text-sm font-medium"
                      >
                        학업관리 (시간당 40,000원)
                      </button>
                    </div>
                  )
                ) : (
                  <a href={getLoginUrl()}>
                    <Button className="w-full" size="lg">
                      로그인하고 상담 조율하기
                    </Button>
                  </a>
                )}
                <p className="text-xs text-muted-foreground text-center">
                  상담 유형을 선택하고 메시지에서 세부 일정을 조율하세요.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
