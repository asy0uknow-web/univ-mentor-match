import { useEffect, useState } from "react";
import { Bell, X, CheckCircle, AlertCircle, MessageCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface Notification {
  id: number;
  type: "booking_request" | "booking_confirmed" | "message" | "booking_cancelled" | "schedule_changed" | "review_received" | "consultation_reminder" | "consultation_urgent_reminder" | "qna_answer" | "other";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

export function NotificationToast() {
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [visibleNotifications, setVisibleNotifications] = useState<Set<number>>(new Set());

  // 알림 조회 쿼리 (인증된 사용자만 실행)
  const { data: allNotifications, refetch } = trpc.notification.getAll.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 미읽음 알림 개수 조회 (인증된 사용자만 실행)
  const { data: unreadCount } = trpc.notification.getUnreadCount.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // 알림 읽음 표시 뮤테이션
  const markAsReadMutation = trpc.notification.markAsRead.useMutation();

  // 비로그인 시 알림 state 초기화
  useEffect(() => {
    if (!isAuthenticated) {
      setNotifications([]);
      setVisibleNotifications(new Set());
    }
  }, [isAuthenticated]);

  // 새 알림 감지 및 토스트 표시
  useEffect(() => {
    if (allNotifications) {
      const newNotifications = allNotifications.filter(
        (notif: any) => !notifications.some((n) => n.id === notif.id)
      );

      if (newNotifications.length > 0) {
        newNotifications.forEach((notif: any) => {
          // 새 알림을 토스트로 표시
          const notifId = notif.id;
          setVisibleNotifications((prev) => new Set(prev).add(notifId));

          // 5초 후 자동 숨김
          setTimeout(() => {
            setVisibleNotifications((prev) => {
              const updated = new Set(prev);
              updated.delete(notifId);
              return updated;
            });
          }, 5000);

          // 알림 읽음 표시
          if (!notif.isRead) {
            markAsReadMutation.mutate({ notificationId: notifId });
          }
        });

        setNotifications(allNotifications);
      }
    }
  }, [allNotifications]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "booking_request":
        return <AlertCircle className="h-5 w-5 text-[var(--brand-accent-500)]" />;
      case "booking_confirmed":
        return <CheckCircle className="h-5 w-5 text-[var(--brand-secondary-600)]" />;
      case "message":
        return <MessageCircle className="h-5 w-5 text-[var(--brand-primary-600)]" />;
      default:
        return <Bell className="h-5 w-5 text-[var(--brand-primary-600)]" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "booking_request":
        return "bg-[var(--brand-accent-50)] dark:bg-[var(--brand-accent-900)] border-[var(--brand-accent-200)] dark:border-[var(--brand-accent-800)]";
      case "booking_confirmed":
        return "bg-[var(--brand-secondary-50)] dark:bg-[var(--brand-secondary-900)] border-[var(--brand-secondary-200)] dark:border-[var(--brand-secondary-800)]";
      case "message":
        return "bg-[var(--brand-primary-50)] dark:bg-[var(--brand-primary-900)] border-[var(--brand-primary-200)] dark:border-[var(--brand-primary-800)]";
      default:
        return "bg-[var(--brand-neutral-50)] dark:bg-[var(--brand-neutral-800)] border-[var(--brand-neutral-200)] dark:border-[var(--brand-neutral-700)]";
    }
  };

  return (
    <div className="fixed top-20 right-4 z-50 space-y-3 pointer-events-none">
      {Array.from(visibleNotifications).map((notifId) => {
        const notification = notifications.find((n) => n.id === notifId);
        if (!notification) return null;

        return (
          <div
            key={notifId}
            className={`${getNotificationColor(notification.type)} border rounded-lg p-4 shadow-lg animate-in slide-in-from-top-4 duration-300 pointer-events-auto max-w-md`}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-[var(--color-text-primary)]">
                  {notification.title}
                </h3>
                <p className="text-xs text-[var(--color-text-secondary)] mt-1 line-clamp-2">
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => {
                  setVisibleNotifications((prev) => {
                    const updated = new Set(prev);
                    updated.delete(notifId);
                    return updated;
                  });
                }}
                className="flex-shrink-0 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
