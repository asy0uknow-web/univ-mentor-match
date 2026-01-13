import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, Calendar, Clock, MessageCircle } from "lucide-react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // 학생 역할: 예약 조회
  const { data: bookings, isLoading: bookingsLoading } = trpc.booking.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated && user?.userType === "high_school_student",
  });

  // 멘토 역할: 받은 메시지 조회 (상담 문의)
  const { data: inbox, isLoading: inboxLoading } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated && user?.userType === "university_student",
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>상담 문의를 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">대기 중</Badge>;
      case "confirmed":
        return <Badge className="bg-green-500">확정됨</Badge>;
      case "completed":
        return <Badge className="bg-blue-500">완료됨</Badge>;
      case "cancelled":
        return <Badge variant="destructive">취소됨</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // 메시지를 대화로 그룹화 (멘토 역할)
  const conversations = inbox?.reduce((acc: any, msg) => {
    if (msg.recipientId === user?.id) {
      const otherUserId = msg.senderId;
      
      if (!acc[otherUserId]) {
        acc[otherUserId] = {
          userId: otherUserId,
          messages: [],
          lastMessage: msg,
        };
      }
      acc[otherUserId].messages.push(msg);
      if (new Date(msg.createdAt) > new Date(acc[otherUserId].lastMessage.createdAt)) {
        acc[otherUserId].lastMessage = msg;
      }
    }
    return acc;
  }, {}) || {};

  const handleStartConversation = (otherUserId: number) => {
    setLocation("/messages");
  };

  // 학생 역할: 예약 내역 표시
  if (user?.userType === "high_school_student") {
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
                <Link href="/mentors">
                  <Button variant="ghost">멘토 찾기</Button>
                </Link>
                <Link href="/bookings">
                  <Button variant="ghost">상담 문의</Button>
                </Link>
                <Link href="/my-profile">
                  <Button variant="ghost">내 프로필</Button>
                </Link>
                <Link href="/notifications">
                  <Button variant="ghost">알림</Button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">상담 문의</h1>

          {bookingsLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : bookings && bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((item) => (
                <Card key={item.booking.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">
                          {item.mentor.name || "멘토"}
                        </CardTitle>
                        <CardDescription>
                          {item.mentorProfile?.university} · {item.mentorProfile?.major}
                        </CardDescription>
                      </div>
                      {getStatusBadge(item.booking.status)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {format(new Date(item.booking.scheduledAt), "PPP", { locale: ko })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{item.booking.duration}시간</span>
                      </div>
                    </div>

                    {item.booking.studentMessage && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground">전달 메시지</p>
                        <p className="mt-1">{item.booking.studentMessage}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-4">아직 예약 내역이 없습니다.</p>
                <Link href="/mentors">
                  <Button>멘토 찾아보기</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    );
  }

  // 멘토 역할: 상담 문의 목록 표시
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
              <Link href="/mentors">
                <Button variant="ghost">멘토 찾기</Button>
              </Link>
              <Link href="/bookings">
                <Button variant="ghost">상담 문의</Button>
              </Link>
              <Link href="/my-profile">
                <Button variant="ghost">내 프로필</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost">알림</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">상담 문의</h1>

        {inboxLoading ? (
          <p className="text-muted-foreground">로딩 중...</p>
        ) : Object.keys(conversations).length > 0 ? (
          <div className="space-y-4">
            {Object.values(conversations).map((conv: any) => (
              <Card key={conv.userId}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">
                        학생 ID: {conv.userId}
                      </CardTitle>
                      <CardDescription>
                        {conv.messages.length}개의 메시지
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="mb-4 p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">최근 메시지</p>
                    <p className="mt-1 text-sm line-clamp-2">
                      {conv.lastMessage.content}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {format(new Date(conv.lastMessage.createdAt), "PPP p", { locale: ko })}
                    </p>
                  </div>
                  <Button 
                    onClick={() => handleStartConversation(conv.userId)}
                    className="w-full"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    대화 열기
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">아직 상담 문의가 없습니다.</p>
              <Link href="/mentors">
                <Button variant="outline">멘토 프로필 확인</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
