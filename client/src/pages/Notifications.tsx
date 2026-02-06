import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Bell, Check, LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import BugReportModal from "@/components/BugReportModal";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { toast } from "sonner";

export default function Notifications() {
  const { user, isAuthenticated } = useAuth();
  const [showBugReport, setShowBugReport] = useState(false);
  const utils = trpc.useUtils();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });
  
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
                <a href={getLoginUrl()}>
                  <Button size="sm">로그인</Button>
                </a>
              )}
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
      {showBugReport && <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />}
    </div>
  );
}
