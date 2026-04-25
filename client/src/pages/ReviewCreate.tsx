import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Star, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useAuth } from "@/_core/hooks/useAuth";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

export default function ReviewCreate() {
  const { user, isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  const [location, setLocation] = useLocation();
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // URL에서 bookingId 추출
  const params = new URLSearchParams(window.location.search);
  const bookingId = parseInt(params.get('bookingId') || '0');

  useEffect(() => {
    setPageMeta(PAGE_META.bookings);
  }, []);

  // 예약 정보 조회
  const { data: bookings } = trpc.booking.getMyBookings.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  
  const booking = bookings?.find(b => b.booking.id === bookingId);

  // 후기 작성 뮤테이션
  const createReviewMutation = trpc.review.create.useMutation({
    onSuccess: () => {
      toast.success("후기 작성 완료", { description: "소중한 후기 감사합니다!" });
      setLocation('/bookings');
    },
    onError: (error: any) => {
      toast.error("오류", { description: error.message });
    },
  });

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("후기 내용을 입력해주세요");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("별점을 선택해주세요");
      return;
    }

    setIsSubmitting(true);
    try {
      await createReviewMutation.mutateAsync({
        bookingId,
        rating,
        comment: content,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => setLocation('/login')}
              className="w-full text-xs sm:text-sm h-9 sm:h-10"
            >
              로그인
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!bookingId || !booking) {
    return (
      <PageLayout>
        <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="flex items-center gap-2 mb-6">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/bookings')}
              className="text-xs sm:text-sm"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              돌아가기
            </Button>
          </div>
          <Card>
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-xs sm:text-sm text-muted-foreground">예약 정보를 찾을 수 없습니다</p>
            </CardContent>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="flex items-center gap-2 mb-6">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setLocation('/bookings')}
            className="text-xs sm:text-sm"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            돌아가기
          </Button>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">후기 작성</CardTitle>
            <CardDescription className="text-xs sm:text-sm">상담을 받으신 멘토에 대한 솔직한 후기를 남겨주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* 멘토 정보 */}
            <div className="p-3 sm:p-4 bg-muted rounded-lg">
              <p className="text-xs font-semibold text-muted-foreground mb-2">상담 멘토</p>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-semibold">{booking.mentor?.name}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {booking.mentorProfile?.university} · {booking.mentorProfile?.major}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  상담일: {format(new Date(booking.booking.scheduledAt), "MMM dd HH:mm", { locale: ko })}
                </p>
              </div>
            </div>

            {/* 별점 선택 */}
            <div>
              <label className="text-sm font-semibold mb-3 block">별점</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`h-8 w-8 sm:h-10 sm:w-10 ${
                        star <= rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                {rating === 5 && "매우 만족합니다"}
                {rating === 4 && "만족합니다"}
                {rating === 3 && "보통입니다"}
                {rating === 2 && "아쉽습니다"}
                {rating === 1 && "불만족합니다"}
              </p>
            </div>

            {/* 후기 내용 */}
            <div>
              <label htmlFor="content" className="text-sm font-semibold mb-2 block">
                후기 내용
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="상담을 통해 도움이 된 점, 멘토의 강점 등을 자유롭게 작성해주세요"
                className="w-full px-3 py-2 text-xs sm:text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary min-h-32 sm:min-h-40 resize-none"
              />
              <p className="text-xs text-muted-foreground mt-2">
                {content.length} / 500자
              </p>
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={() => setLocation('/bookings')}
                variant="outline"
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                취소
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting || createReviewMutation.isPending}
                className="flex-1 text-xs sm:text-sm h-9 sm:h-10"
              >
                {isSubmitting || createReviewMutation.isPending ? "작성 중..." : "후기 작성"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
