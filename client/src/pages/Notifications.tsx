import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Bell, Check, Trash2, ChevronDown } from "lucide-react";
import BugReportModal from "@/components/BugReportModal";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function Notifications() {

  useEffect(() => {
    setPageMeta(PAGE_META.notifications);
  }, []);
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="min-h-screen flex items-center justify-center px-3 sm:px-4">
        <Card className="max-w-md w-full">
          <CardHeader className="px-3 sm:px-6 py-4 sm:py-6">
            <CardTitle className="text-lg sm:text-xl">로그인이 필요합니다</CardTitle>
            <CardDescription className="text-xs sm:text-sm">알림을 보려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent className="px-3 sm:px-6 pb-4 sm:pb-6">
            <a href={getLoginUrl()}>
              <Button className="w-full text-xs sm:text-sm h-8 sm:h-10">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleMarkAsRead = (notificationId: number) => {
    markAsReadMutation.mutate({ notificationId });
  };

  const filteredNotifications = notifications?.filter((notif: any) =>
    notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    notif.message.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <PageLayout>
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-12 max-w-2xl">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-8">
          <Bell className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
          <h1 className="text-2xl sm:text-4xl font-bold">알림</h1>
        </div>

        <Card className="mb-4 sm:mb-6 shadow-sm sm:shadow-md">
          <CardContent className="pt-3 sm:pt-6 px-3 sm:px-6 pb-3 sm:pb-6">
            <Input
              placeholder="알림 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm h-8 sm:h-10"
            />
          </CardContent>
        </Card>

        {isLoading ? (
          <p className="text-xs sm:text-sm text-muted-foreground text-center py-8">로딩 중...</p>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-2 sm:space-y-3">
            {filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-colors shadow-sm sm:shadow-md ${
                  notification.isRead ? "bg-card" : "bg-primary/5 border-primary/20"
                }`}
              >
                <CardHeader className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <CardTitle className="text-sm sm:text-lg break-words">
                          {notification.title}
                        </CardTitle>
                        {!notification.isRead && (
                          <Badge variant="default" className="text-xs flex-shrink-0">NEW</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs sm:text-sm">
                        {format(new Date(notification.createdAt), "PPP p", { locale: ko })}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                      {!notification.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={markAsReadMutation.isPending}
                          className="text-xs h-7 sm:h-9 px-2 sm:px-3"
                        >
                          <Check className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">읽음</span>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-3 sm:pb-4">
                  <p className="text-xs sm:text-sm text-muted-foreground break-words">
                    {notification.message}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm sm:shadow-md">
            <CardContent className="py-8 sm:py-12 px-3 sm:px-6 text-center">
              <Bell className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
              <p className="text-xs sm:text-sm text-muted-foreground">알림이 없습니다.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageLayout>
  );
}
