import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Calendar, Clock } from "lucide-react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function Bookings() {
  const { user, isAuthenticated } = useAuth();
  const { data: bookings, isLoading } = trpc.booking.getMyBookings.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>예약 내역을 보려면 로그인해주세요.</CardDescription>
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
                <Button variant="ghost">내 예약</Button>
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
        <h1 className="text-4xl font-bold mb-8">내 예약</h1>

        {isLoading ? (
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
                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-semibold">총 금액</span>
                      <span className="text-2xl font-bold text-primary">
                        ₩{Number(item.booking.totalAmount).toLocaleString()}
                      </span>
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
