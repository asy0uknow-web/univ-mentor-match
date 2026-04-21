import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Bell, Check, Trash2, ChevronDown, ArrowRight } from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center px-3 sm:px-4">
        <div className="card-premium-lg max-w-md w-full p-6 sm:p-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">로그인이 필요합니다</h2>
          <p className="text-sm text-muted-foreground mb-6">알림을 보려면 로그인해주세요.</p>
          <a href={getLoginUrl()}>
            <Button className="w-full text-sm font-semibold py-3 rounded-md bg-primary hover:bg-primary/90 text-white shadow-premium-md hover:shadow-premium-lg transition-all duration-200 flex items-center justify-center gap-2">
              로그인
              <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
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
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 max-w-2xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">알림</h1>
        </div>
        <p className="text-muted-foreground mb-8">새로운 알림을 확인하세요</p>

        <div className="card-premium-lg p-4 sm:p-6 mb-6">
          <Input
            placeholder="알림 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm border border-border px-4 py-2.5 rounded-md focus:border-primary transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="card-premium-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`card-premium-lg p-4 sm:p-6 transition-all duration-200 ${
                  notification.isRead ? "bg-card" : "bg-primary/5 border-primary/20"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-semibold text-foreground break-words">
                        {notification.title}
                      </h3>
                      {!notification.isRead && (
                        <Badge className="text-xs bg-primary text-white flex-shrink-0">NEW</Badge>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                      {format(new Date(notification.createdAt), "PPP p", { locale: ko })}
                    </p>
                    <p className="text-sm text-muted-foreground break-words">
                      {notification.message}
                    </p>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleMarkAsRead(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="text-xs h-9 px-3 flex-shrink-0 rounded-md hover:bg-muted transition-colors"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-premium-lg p-12 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">알림이 없습니다.</p>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
