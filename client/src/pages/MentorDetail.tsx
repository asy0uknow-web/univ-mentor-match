import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link, useParams } from "wouter";
import { GraduationCap, Star, Calendar, ArrowLeft, MessageCircle } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function MentorDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [duration, setDuration] = useState("1");
  const [studentMessage, setStudentMessage] = useState("");

  const mentorId = parseInt(id || "0");
  const { data: mentor, isLoading } = trpc.mentor.getById.useQuery({ mentorId });
  const { data: reviews } = trpc.review.getByMentor.useQuery({ mentorId });

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: async (data) => {
      toast.success("예약이 생성되었습니다. 결제 페이지로 이동합니다.");
      setIsBookingOpen(false);
      
      // Create checkout session
      const checkoutResult = await createCheckoutMutation.mutateAsync({
        bookingId: data.bookingId,
      });
      
      if (checkoutResult.checkoutUrl) {
        window.open(checkoutResult.checkoutUrl, "_blank");
        toast.info("결제 창이 새 탭에서 열렸습니다.");
      }
    },
    onError: (error) => {
      toast.error(`예약 실패: ${error.message}`);
    },
  });

  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      toast.success("메시지가 전송되었습니다.");
    },
    onError: (error) => {
      toast.error(`메시지 전송 실패: ${error.message}`);
    },
  });

  const createCheckoutMutation = trpc.booking.createCheckoutSession.useMutation({
    onError: (error) => {
      toast.error(`결제 세션 생성 실패: ${error.message}`);
    },
  });

  const handleBooking = () => {
    if (!scheduledAt || !duration) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    createBookingMutation.mutate({
      mentorId,
      scheduledAt,
      duration,
      studentMessage,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">멘토를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const totalAmount = parseFloat(mentor.profile.hourlyRate) * parseFloat(duration);

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">대학 멘토 매칭</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors">
                    <Button variant="ghost">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings">
                    <Button variant="ghost">내 예약</Button>
                  </Link>
                  <Link href="/my-profile">
                    <Button variant="ghost">내 프로필</Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost">알림</Button>
                  </Link>
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>로그인</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

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
                  <div>
                    <CardTitle className="text-3xl">{mentor.user.name}</CardTitle>
                    <CardDescription className="text-lg mt-2">
                      {mentor.profile.university} · {mentor.profile.major} · {mentor.profile.grade}학년
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2 text-primary">
                    <Star className="h-6 w-6 fill-current" />
                    <span className="text-2xl font-bold">
                      {parseFloat(mentor.profile.averageRating || "0").toFixed(1)}
                    </span>
                    <span className="text-muted-foreground">
                      ({mentor.profile.reviewCount}개 리뷰)
                    </span>
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

                  <div>
                    <h3 className="text-xl font-bold mb-2">상담료</h3>
                    <p className="text-2xl font-bold text-primary">
                      시간당 ₩{Number(mentor.profile.hourlyRate).toLocaleString()}
                    </p>
                  </div>
                </div>
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

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>상담 예약</CardTitle>
              </CardHeader>
              <CardContent>
                {isAuthenticated ? (
                  <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
                    <DialogTrigger asChild>
                      <Button className="w-full" size="lg">
                        <Calendar className="h-5 w-5 mr-2" />
                        예약하기
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>상담 예약</DialogTitle>
                        <DialogDescription>
                          원하는 날짜와 시간을 선택해주세요.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="scheduledAt">상담 일시</Label>
                          <Input
                            id="scheduledAt"
                            type="datetime-local"
                            value={scheduledAt}
                            onChange={(e) => setScheduledAt(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="duration">상담 시간 (시간)</Label>
                          <Input
                            id="duration"
                            type="number"
                            min="1"
                            max="3"
                            step="0.5"
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="message">멘토에게 전달할 메시지 (선택)</Label>
                          <Textarea
                            id="message"
                            placeholder="궁금한 점이나 상담 받고 싶은 내용을 적어주세요."
                            value={studentMessage}
                            onChange={(e) => setStudentMessage(e.target.value)}
                          />
                        </div>
                        <div className="border-t border-border pt-4">
                          <div className="flex justify-between mb-2">
                            <span>시간당 상담료</span>
                            <span>₩{Number(mentor.profile.hourlyRate).toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between mb-2">
                            <span>상담 시간</span>
                            <span>{duration}시간</span>
                          </div>
                          <div className="flex justify-between font-bold text-lg">
                            <span>총 금액</span>
                            <span className="text-primary">₩{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleBooking}
                          disabled={createBookingMutation.isPending || createCheckoutMutation.isPending}
                        >
                          {createBookingMutation.isPending || createCheckoutMutation.isPending
                            ? "처리 중..."
                            : "예약 및 결제하기"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <a href={getLoginUrl()}>
                    <Button className="w-full" size="lg">
                      로그인하고 예약하기
                    </Button>
                  </a>
                )}
                <Button
                  variant="outline"
                  className="w-full mt-3"
                  onClick={() => {
                    if (mentor?.user?.id) {
                      sendMessageMutation.mutate({
                        recipientId: mentor.user.id,
                        content: "안녕하세요! 상담을 받고 싶습니다.",
                      });
                    }
                  }}
                  disabled={sendMessageMutation.isPending}
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {sendMessageMutation.isPending ? "전송 중..." : "문의 메시지"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
