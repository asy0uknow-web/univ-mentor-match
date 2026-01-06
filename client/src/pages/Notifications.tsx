import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Bell, Check } from "lucide-react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

export default function Notifications() {
  const { isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  
  const { data: notifications, isLoading } = trpc.notification.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const markAsReadMutation = trpc.notification.markAsRead.useMutation({
    onSuccess: () => {
      utils.notification.getAll.invalidate();
      utils.notification.getUnreadCount.invalidate();
    },
    onError: (error) => {
      toast.error(`알림 읽음 처리 실패: ${error.message}`);
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>알림을 보려면 로그인해주세요.</CardDescription>
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

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
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
        <div className="flex items-center gap-3 mb-8">
          <Bell className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">알림</h1>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground">로딩 중...</p>
        ) : notifications && notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors ${
                  notification.isRead ? "bg-card" : "bg-primary/5 border-primary/20"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">{notification.title}</CardTitle>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs">NEW</Badge>
                        )}
                      </div>
                      <CardDescription className="text-sm">
                        {format(new Date(notification.createdAt), "PPP p", { locale: ko })}
                      </CardDescription>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        읽음
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{notification.message}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">알림이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
