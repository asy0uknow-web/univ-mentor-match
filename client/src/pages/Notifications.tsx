import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Bell, Check, Trash2, ChevronDown, ArrowRight, AlertCircle, CheckCircle, MessageCircle } from "lucide-react";
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
  const [notificationFilter, setNotificationFilter] = useState<"all" | "unread" | "booking" | "message">("all");
  const [sortBy, setSortBy] = useState<"latest" | "oldest">("latest");
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
            <Button className="w-full text-sm font-semibold py-3 rounded-md bg-primary hover:bg-primary/90 text-white shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2">
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

  // 필터링 및 정렬
  const filteredNotifications = notifications?.filter((notif: any) => {
    // 검색 필터
    const matchesSearch = notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    // 상태 필터
    let matchesFilter = true;
    if (notificationFilter === "unread") {
      matchesFilter = !notif.isRead;
    } else if (notificationFilter === "booking") {
      matchesFilter = notif.type === "booking_request" || notif.type === "booking_confirmed" || notif.type === "booking_cancelled";
    } else if (notificationFilter === "message") {
      matchesFilter = notif.type === "message";
    }
    
    return matchesSearch && matchesFilter;
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortBy === "latest" ? dateB - dateA : dateA - dateB;
  }) || [];

  // 알림 타입별 아이콘 및 색상
  const getNotificationStyle = (type: string) => {
    switch (type) {
      case "booking_request":
        return {
          icon: AlertCircle,
          bgColor: "bg-[var(--brand-accent-50)] dark:bg-[var(--brand-accent-900)]",
          borderColor: "border-[var(--brand-accent-200)] dark:border-[var(--brand-accent-800)]",
          iconColor: "text-[var(--brand-accent-600)]",
          badgeColor: "bg-[var(--brand-accent-600)]",
          label: "상담 신청"
        };
      case "booking_confirmed":
        return {
          icon: CheckCircle,
          bgColor: "bg-[var(--brand-secondary-50)] dark:bg-[var(--brand-secondary-900)]",
          borderColor: "border-[var(--brand-secondary-200)] dark:border-[var(--brand-secondary-800)]",
          iconColor: "text-[var(--brand-secondary-600)]",
          badgeColor: "bg-[var(--brand-secondary-600)]",
          label: "예약 확정"
        };
      case "message":
        return {
          icon: MessageCircle,
          bgColor: "bg-[var(--brand-primary-50)] dark:bg-[var(--brand-primary-900)]",
          borderColor: "border-[var(--brand-primary-200)] dark:border-[var(--brand-primary-800)]",
          iconColor: "text-[var(--brand-primary-600)]",
          badgeColor: "bg-[var(--brand-primary-600)]",
          label: "메시지"
        };
      default:
        return {
          icon: Bell,
          bgColor: "bg-[var(--brand-neutral-50)] dark:bg-[var(--brand-neutral-800)]",
          borderColor: "border-[var(--brand-neutral-200)] dark:border-[var(--brand-neutral-700)]",
          iconColor: "text-[var(--brand-neutral-600)]",
          badgeColor: "bg-[var(--brand-neutral-600)]",
          label: "알림"
        };
    }
  };

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

        {/* 검색 및 필터 바 */}
        <div className="card-premium-lg p-4 sm:p-6 mb-6 space-y-4">
          <Input
            placeholder="알림 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm border border-[var(--color-border-default)] px-4 py-2.5 rounded-md focus:border-[var(--brand-primary-600)] transition-colors"
          />
          
          {/* 필터 및 정렬 */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2 flex-wrap">
              {[
                { label: "전체", value: "all" },
                { label: "미읽음", value: "unread" },
                { label: "상담", value: "booking" },
                { label: "메시지", value: "message" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setNotificationFilter(filter.value as any)}
                  className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
                    notificationFilter === filter.value
                      ? "bg-[var(--brand-primary-600)] text-white"
                      : "bg-[var(--color-background-card)] text-[var(--color-text-secondary)] border border-[var(--color-border-default)] hover:border-[var(--brand-primary-600)]"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            
            <div className="sm:ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1.5 rounded-md text-xs sm:text-sm border border-[var(--color-border-default)] bg-[var(--color-background-card)] text-[var(--color-text-primary)] focus:border-[var(--brand-primary-600)] transition-colors"
              >
                <option value="latest">최신순</option>
                <option value="oldest">오래된순</option>
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="card-premium-lg p-8 text-center">
            <p className="text-sm text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const style = getNotificationStyle(notification.type);
              const IconComponent = style.icon;
              return (
                <div
                  key={notification.id}
                  className={`card-premium-lg border-2 p-4 sm:p-6 transition-all duration-200 ${
                    notification.isRead
                      ? `${style.bgColor} ${style.borderColor} opacity-75`
                      : `${style.bgColor} ${style.borderColor}`
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-white/50 dark:bg-black/20 flex items-center justify-center ${style.iconColor}`}>
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge className={`text-xs flex-shrink-0 ${style.badgeColor} text-white`}>
                            {style.label}
                          </Badge>
                          <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] break-words">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <div className="w-2 h-2 rounded-full bg-[var(--brand-primary-600)] flex-shrink-0"></div>
                          )}
                        </div>
                        <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-2">
                          {format(new Date(notification.createdAt), "PPP p", { locale: ko })}
                        </p>
                        <p className="text-sm text-[var(--color-text-secondary)] break-words">
                          {notification.message}
                        </p>
                      </div>
                    </div>
                    {!notification.isRead && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleMarkAsRead(notification.id)}
                        disabled={markAsReadMutation.isPending}
                        className="text-xs h-9 px-3 flex-shrink-0 rounded-md hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
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
