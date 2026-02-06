import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Send, MessageSquare, Check, X, Clock, CheckCircle2, LogOut, Trash2, ChevronDown, Bug } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import BugReportModal from "@/components/BugReportModal";
import { useState, useEffect, useRef } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const [showBugReport, setShowBugReport] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/";
    },
  });

  const { data: inbox } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: conversation } = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  // 자동 스크롤 - 새 메시지가 추가되면 하단으로 스크롤
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    // 대화 데이터가 변경될 때마다 스크롤
    if (conversation && conversation.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [conversation, conversation?.length]);

  const utils = trpc.useUtils();

  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      toast.success("메시지가 전송되었습니다.");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
      // 메시지 전송 후 약간의 지연 후 스크롤
      setTimeout(() => {
        scrollToBottom();
      }, 100);
    },
    onError: (error) => {
      toast.error(`메시지 전송 실패: ${error.message}`);
    },
  });

  const acceptBookingMutation = trpc.booking.acceptBooking.useMutation({
    onSuccess: () => {
      toast.success("상담 신청을 수락했습니다.");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (error) => {
      toast.error(`상담 신청 수락 실패: ${error.message}`);
    },
  });

  const rejectBookingMutation = trpc.booking.rejectBooking.useMutation({
    onSuccess: () => {
      toast.success("상담 신청을 거절했습니다.");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (error) => {
      toast.error(`상담 신청 거절 실패: ${error.message}`);
    },
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversation) {
      toast.error("메시지 내용을 입력해주세요.");
      return;
    }

    sendMessageMutation.mutate({
      recipientId: selectedConversation,
      content: messageContent,
    });
    
    // 메시지 전송 후 입력창 포커스 유지
    setTimeout(() => {
      scrollToBottom();
    }, 150);
  };

  const handleAcceptBooking = (bookingId: number) => {
    acceptBookingMutation.mutate({ bookingId });
  };

  const handleRejectBooking = (bookingId: number) => {
    rejectBookingMutation.mutate({ bookingId });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>메시지를 보려면 로그인해주세요.</CardDescription>
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

  // Group messages by conversation
  const conversations = inbox?.reduce((acc: any, msg) => {
    const otherUserId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
    if (!acc[otherUserId]) {
      acc[otherUserId] = [];
    }
    acc[otherUserId].push(msg);
    return acc;
  }, {}) || {};

  // Find related booking from conversation
  const selectedConversationMessages = selectedConversation
    ? conversations[selectedConversation] || []
    : [];
  
  const relatedBooking = selectedConversationMessages.find((msg: any) => msg.bookingId)?.bookingId;

  // Extract user name from first message
  const getOtherUserName = (userId: number) => {
    const msgs: any[] = conversations[userId] || [];
    if (msgs.length === 0) return `User ${userId}`;
    const firstMsg = msgs[0];
    // Try to extract name from message content if it's a consultation request
    if (firstMsg.content.includes("[상담 신청]")) {
      return "상담 신청";
    }
    return `User ${userId}`;
  };

  return (
    <div className="min-h-screen bg-background">
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">메시지</h1>
          <p className="text-muted-foreground mt-1">멘토와의 상담 신청 및 메시지를 관리하세요</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="h-[700px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  대화 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 overflow-y-auto">
                {Object.keys(conversations).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(conversations).map(([userId, msgs]: [string, any]) => {
                      const lastMsg = msgs[0];
                      const isSelected = parseInt(userId) === selectedConversation;
                      const isConsultationRequest = lastMsg.content.includes("[상담 신청]");
                      
                      return (
                        <button
                          key={userId}
                          onClick={() => setSelectedConversation(parseInt(userId))}
                          className={`w-full text-left p-3 rounded-lg transition-all border-2 ${
                            isSelected
                              ? "bg-primary/10 border-primary"
                              : "bg-muted/50 border-transparent hover:bg-muted/80"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm">
                                {lastMsg.senderId === user?.id
                                  ? `To: ${getOtherUserName(parseInt(userId))}`
                                  : `From: ${getOtherUserName(parseInt(userId))}`}
                              </p>
                              <p className="text-xs opacity-75 truncate line-clamp-2">
                                {isConsultationRequest
                                  ? "상담 신청 메시지"
                                  : lastMsg.content}
                              </p>
                            </div>
                            {isConsultationRequest && (
                              <Clock className="h-4 w-4 text-amber-500 flex-shrink-0 mt-1" />
                            )}
                          </div>
                          <p className="text-xs opacity-50 mt-2">
                            {format(new Date(lastMsg.createdAt), "PPp", { locale: ko })}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    아직 메시지가 없습니다.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversation View */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="flex flex-col h-[700px]">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>대화</CardTitle>
                      <CardDescription>User {selectedConversation}와의 대화</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Messages */}
                <CardContent className="flex-1 overflow-y-auto py-4 space-y-4 flex flex-col">
                  {conversation && conversation.length > 0 ? (
                    [...conversation].sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()).map((msg: any) => {
                      const isConsultationRequest = msg.content.includes("[상담 신청]");
                      const isSentByMe = msg.senderId === user?.id;
                      
                      return (
                        <div key={msg.id}>
                          {isConsultationRequest ? (
                            // Consultation Request Message
                            <div className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-md px-4 py-3 rounded-lg border-2 ${
                                isSentByMe
                                  ? "bg-primary/10 border-primary"
                                  : "bg-amber-50 border-amber-200"
                              }`}>
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="h-4 w-4 text-amber-600" />
                                  <p className="font-semibold text-sm text-amber-900">상담 신청</p>
                                </div>
                                <p className="text-sm whitespace-pre-wrap text-amber-900">
                                  {msg.content}
                                </p>
                                <p className="text-xs opacity-75 mt-2">
                                  {format(new Date(msg.createdAt), "p", { locale: ko })}
                                </p>
                              </div>
                            </div>
                          ) : (
                            // Regular Message
                            <div className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-md px-4 py-2 rounded-lg ${
                                isSentByMe
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted"
                              }`}>
                                <p className="text-sm">{msg.content}</p>
                                <p className="text-xs opacity-75 mt-1">
                                  {format(new Date(msg.createdAt), "p", { locale: ko })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      대화를 시작해보세요.
                    </p>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* Action Buttons for Consultation Request */}
                {selectedConversationMessages.some((msg: any) => msg.content.includes("[상담 신청]")) && 
                 selectedConversationMessages.some((msg: any) => msg.senderId !== user?.id) && (
                  <div className="border-t border-border p-4 bg-amber-50">
                    <p className="text-sm font-semibold text-amber-900 mb-3">상담 신청 응답</p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          // Find the booking ID from the consultation request message
                          const consultationMsg = selectedConversationMessages.find(
                            (msg: any) => msg.content.includes("[상담 신청]") && msg.senderId !== user?.id
                          );
                          if (consultationMsg?.bookingId) {
                            handleAcceptBooking(consultationMsg.bookingId);
                          }
                        }}
                        disabled={acceptBookingMutation.isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-2" />
                        {acceptBookingMutation.isPending ? "처리 중..." : "수락"}
                      </Button>
                      <Button
                        onClick={() => {
                          const consultationMsg = selectedConversationMessages.find(
                            (msg: any) => msg.content.includes("[상담 신청]") && msg.senderId !== user?.id
                          );
                          if (consultationMsg?.bookingId) {
                            handleRejectBooking(consultationMsg.bookingId);
                          }
                        }}
                        disabled={rejectBookingMutation.isPending}
                        variant="outline"
                        className="flex-1"
                      >
                        <X className="h-4 w-4 mr-2" />
                        {rejectBookingMutation.isPending ? "처리 중..." : "거절"}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <div className="border-t border-border p-4 space-y-3 bg-card">
                  <Textarea
                    placeholder="메시지를 입력하세요..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.ctrlKey) {
                        handleSendMessage();
                      }
                    }}
                    rows={3}
                    className="resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleSendMessage}
                      disabled={sendMessageMutation.isPending || !messageContent.trim()}
                      className="flex-1"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {sendMessageMutation.isPending ? "전송 중..." : "메시지 전송"}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ctrl + Enter로도 전송할 수 있습니다.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="h-[700px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    대화를 선택하여 메시지를 확인하세요.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      {showBugReport && <BugReportModal isOpen={showBugReport} onClose={() => setShowBugReport(false)} />}
    </div>
  );
}
