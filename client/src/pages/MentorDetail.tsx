import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useParams, useLocation } from "wouter";
import { GraduationCap, Star, Calendar, ArrowLeft, MessageCircle, LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import BugReportModal from "@/components/BugReportModal";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function MentorDetail() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const [scheduledHour, setScheduledHour] = useState("09");
  const [scheduledMinute, setScheduledMinute] = useState("00");
  const [duration, setDuration] = useState("1");
  const [studentMessage, setStudentMessage] = useState("");
  const [consultationType, setConsultationType] = useState<"resume_consulting" | "career_counseling" | "academic_management" | "university_tour">("career_counseling");
  const [showBugReport, setShowBugReport] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  // 상담 종류별 기본 1시간 비용 및 추가 시간 비용
  const consultationPrices: Record<string, { base: number; additional: number }> = {
    "resume_consulting": { base: 50000, additional: 30000 },      // 생기부 컨설팅
    "career_counseling": { base: 30000, additional: 20000 },      // 진로상담
    "academic_management": { base: 40000, additional: 25000 },    // 학업관리
    "university_tour": { base: 50000, additional: 30000 },        // 대학탐방
  };

  const consultationLabels: Record<string, string> = {
    "resume_consulting": "생기부 컨설팅",
    "career_counseling": "진로상담",
    "academic_management": "학업관리",
    "university_tour": "대학탐방",
  };

  const mentorId = id ? parseInt(id, 10) : 0;
  const isValidMentorId = !isNaN(mentorId) && mentorId > 0;
  
  const { data: mentor, isLoading } = trpc.mentor.getById.useQuery(
    { mentorId },
    { enabled: isValidMentorId }
  );
  const { data: reviews } = trpc.review.getByMentor.useQuery(
    { mentorId },
    { enabled: isValidMentorId }
  );
  const { data: gallery } = trpc.gallery.getByMentorId.useQuery(
    { mentorId },
    { enabled: isValidMentorId }
  );

  const createBookingMutation = trpc.booking.create.useMutation({
    onSuccess: async (data) => {
      toast.success("상담 신청이 완료되었습니다. 멘토에게 알림이 전송되었습니다.");
      setIsBookingOpen(false);
      setScheduledAt("");
      setDuration("1");
      setStudentMessage("");
    },
    onError: (error) => {
      toast.error(`상담 신청 실패: ${error.message}`);
    },
  });

  const [, setLocation] = useLocation();
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      toast.success("메시지가 전송되었습니다.");
      setStudentMessage("");
      setTimeout(() => {
        setLocation("/messages");
      }, 500);
    },
    onError: (error) => {
      toast.error(`메시지 전송 실패: ${error.message}`);
    },
  });



  const handleBooking = () => {
    if (!scheduledAt || !duration || !scheduledHour || !scheduledMinute) {
      toast.error("모든 필드를 입력해주세요.");
      return;
    }

    // 상담 신청 정보를 메시지로 전송
    const durationNum = parseFloat(duration);
    const pricing = consultationPrices[consultationType] || { base: 30000, additional: 20000 };
    const totalPrice = pricing.base + (durationNum - 1) * pricing.additional;
    const [date] = scheduledAt.split('T');
    const scheduledDateTime = `${date}T${scheduledHour}:${scheduledMinute}`;
    const consultationMessage = `[상담 신청]
종류: ${consultationLabels[consultationType]}
날짜: ${new Date(scheduledDateTime).toLocaleString('ko-KR')}
시간: ${duration}시간
요금: ₩${totalPrice.toLocaleString()}

${studentMessage ? `메시지: ${studentMessage}` : '추가 메시지 없음'}`;

    // 먼저 예약을 생성
    createBookingMutation.mutate({
      mentorId,
      scheduledAt: scheduledDateTime,
      duration,
      studentMessage: consultationMessage,
      consultationType,
    });
  };

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
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">멘토를 찾을 수 없습니다.</p>
        <Link href="/mentors">
          <Button variant="outline">멘토 목록으로 돌아가기</Button>
        </Link>
      </div>
    );
  }

  const durationNum = parseFloat(duration);
  const pricing = consultationPrices[consultationType] || { base: 30000, additional: 20000 };
  const totalAmount = pricing.base + (durationNum - 1) * pricing.additional;

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-[#fdfcfd] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-5">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663280786037/SPxbaeRMjBqMqqlh.png" alt="Univ Match" className="h-14 sm:h-20 w-auto" />
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-4">
              {isAuthenticated ? (
                <>
                  <Link href="/mentors" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">멘토 찾기</Button>
                  </Link>
                  <Link href="/bookings" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">상담 문의</Button>
                  </Link>
                  <Link href="/my-profile" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">내 프로필</Button>
                  </Link>
                  <Link href="/notifications" className="hidden md:block">
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">알림</Button>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <span className="hidden sm:inline">메뉴</span>
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 bg-white">
                      <DropdownMenuItem onClick={() => setShowBugReport(true)} className="hover:bg-blue-100 hover:text-primary">
                        <Bug className="h-4 w-4 mr-2" />
                        버그 신고
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/mentors">멘토 찾기</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/bookings">상담 문의</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/my-profile">내 프로필</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="md:hidden">
                        <Link href="/notifications">알림</Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="md:hidden" />
                      <DropdownMenuItem onClick={() => logoutMutation.mutate()}>
                        <LogOut className="h-4 w-4 mr-2" />
                        로그아웃
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/delete-account">
                          <Trash2 className="h-4 w-4 mr-2" />
                          계정 탈퇴
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <a href={getLoginUrl()}>
                    <Button variant="ghost" size="sm" className="text-base font-medium hover:bg-blue-100 hover:text-primary">로그인</Button>
                  </a>
                  <a href={getLoginUrl()}>
                    <Button size="sm">회원가입</Button>
                  </a>
                </div>
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
                          <Label htmlFor="consultationType">상담 종류</Label>
                          <Select value={consultationType} onValueChange={(value) => setConsultationType(value as "resume_consulting" | "career_counseling" | "academic_management" | "university_tour")}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="resume_consulting">생기부 컨설팅 (기본 50,000원 + 추가 30,000원)</SelectItem>
                              <SelectItem value="career_counseling">진로상담 (기본 30,000원 + 추가 20,000원)</SelectItem>
                              <SelectItem value="academic_management">학업관리 (기본 40,000원 + 추가 25,000원)</SelectItem>
                              <SelectItem value="university_tour">대학탐방 (기본 50,000원 + 추가 30,000원)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {/* 가격 가이드라인 Info Box */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
                          <div>
                            <p className="text-sm text-amber-900">
                              💡 기본 1시간 비용 이후에는 시간당 추가 할인이 적용됩니다.
                            </p>
                          </div>
                          <details className="cursor-pointer">
                            <summary className="text-xs font-medium text-amber-800 hover:text-amber-900 transition-colors">
                              자세히 보기 ▼
                            </summary>
                            <div className="mt-3 pt-3 border-t border-amber-200 space-y-2 text-xs text-amber-800">
                              <div className="flex justify-between">
                                <span>생기부 컨설팅:</span>
                                <span>기본 50,000원 + 추가 30,000원/시간</span>
                              </div>
                              <div className="flex justify-between">
                                <span>진로상담:</span>
                                <span>기본 30,000원 + 추가 20,000원/시간</span>
                              </div>
                              <div className="flex justify-between">
                                <span>학업관리:</span>
                                <span>기본 40,000원 + 추가 25,000원/시간</span>
                              </div>
                              <div className="flex justify-between">
                                <span>대학탐방:</span>
                                <span>기본 50,000원 + 추가 30,000원/시간</span>
                              </div>
                            </div>
                          </details>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduledDate">상담 날짜</Label>
                          <Input
                            id="scheduledDate"
                            type="date"
                            value={scheduledAt.split('T')[0] || ''}
                            onChange={(e) => {
                              const time = scheduledAt.split('T')[1] || '09:00';
                              setScheduledAt(e.target.value ? `${e.target.value}T${time}` : '');
                            }}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="scheduledTime">상담 시간 (시:분)</Label>
                          <div className="flex gap-2">
                            <Select value={scheduledHour} onValueChange={setScheduledHour}>
                              <SelectTrigger style={{ flex: 1 }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="09">09시</SelectItem>
                                <SelectItem value="10">10시</SelectItem>
                                <SelectItem value="11">11시</SelectItem>
                                <SelectItem value="12">12시</SelectItem>
                                <SelectItem value="13">13시</SelectItem>
                                <SelectItem value="14">14시</SelectItem>
                                <SelectItem value="15">15시</SelectItem>
                                <SelectItem value="16">16시</SelectItem>
                                <SelectItem value="17">17시</SelectItem>
                                <SelectItem value="18">18시</SelectItem>
                                <SelectItem value="19">19시</SelectItem>
                                <SelectItem value="20">20시</SelectItem>
                                <SelectItem value="21">21시</SelectItem>
                                <SelectItem value="22">22시</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select value={scheduledMinute} onValueChange={setScheduledMinute}>
                              <SelectTrigger style={{ flex: 1 }}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="00">00분</SelectItem>
                                <SelectItem value="10">10분</SelectItem>
                                <SelectItem value="20">20분</SelectItem>
                                <SelectItem value="30">30분</SelectItem>
                                <SelectItem value="40">40분</SelectItem>
                                <SelectItem value="50">50분</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
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
                        <div className="border-t border-border pt-4 space-y-2">
                          <div className="flex justify-between">
                            <span>상담 종류</span>
                            <span>{consultationLabels[consultationType]}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>상담 시간</span>
                            <span>{duration}시간</span>
                          </div>
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <span>기본 요금</span>
                            <span>₩{pricing.base.toLocaleString()}</span>
                          </div>
                          {durationNum > 1 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>추가 요금</span>
                              <span>₩{((durationNum - 1) * pricing.additional).toLocaleString()}</span>
                            </div>
                          )}
                          <div className="flex justify-between font-bold text-lg border-t border-border pt-2">
                            <span>최종 금액</span>
                            <span className="text-primary">₩{totalAmount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={handleBooking}
                          disabled={createBookingMutation.isPending}
                        >
                          {createBookingMutation.isPending
                            ? "처리 중..."
                            : "상담 신청하기"}
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
      {showBugReport && <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />}
    </div>
  );
}
