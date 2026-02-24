'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Send, MessageSquare, Check, X, Clock, CheckCircle2, Trash2, ChevronDown, AlertCircle } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import BugReportModal from "@/components/BugReportModal";
import { useState, useEffect, useRef } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

// Shared keys with MentorDetail / Bookings etc.
// We use sessionStorage to pass "open this conversation" intent when navigating
// to /messages, without relying on query strings (router-safe).
const OPEN_CONVERSATION_KEY = "univmatch:openConversationUserId";
const DRAFT_MESSAGE_KEY = "univmatch:draftMessage";

export default function Messages() {

  useEffect(() => {
    setPageMeta(PAGE_META.messages);
  }, []);
  const { user, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If another page (e.g., MentorDetail) asked us to open a specific conversation,
  // read it once from sessionStorage.
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const rawUserId = sessionStorage.getItem(OPEN_CONVERSATION_KEY);
      if (rawUserId) {
        const otherUserId = Number(rawUserId);
        if (!Number.isNaN(otherUserId) && otherUserId > 0) {
          setSelectedConversation(otherUserId);
        }
        sessionStorage.removeItem(OPEN_CONVERSATION_KEY);
      }

      const draft = sessionStorage.getItem(DRAFT_MESSAGE_KEY);
      if (draft && draft.trim().length > 0) {
        // Only prefill if the input is still empty to avoid overwriting user typing.
        setMessageContent((prev) => (prev.trim().length === 0 ? draft : prev));
        sessionStorage.removeItem(DRAFT_MESSAGE_KEY);
      }
    } catch {
      // Ignore storage errors (private mode, restrictive browsers, etc.)
    }
  }, [isAuthenticated]);
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

  const insertTemplate = (template: string) => {
    setMessageContent((prev) => (prev ? prev + "\n\n" + template : template));
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

  // Extract user name from first message
  const getOtherUserName = (userId: number) => {
    const msgs: any[] = conversations[userId] || [];
    if (msgs.length === 0) return `User ${userId}`;
    const firstMsg = msgs[0];
    // Get other user's name from message metadata
    if (firstMsg.senderName && firstMsg.senderId === userId) {
      return firstMsg.senderName;
    }
    if (firstMsg.recipientName && firstMsg.recipientId === userId) {
      return firstMsg.recipientName;
    }
    return `User ${userId}`;
  };

  return (
    <PageLayout>
      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">상담 조율</h1>
          <p className="text-muted-foreground mt-1">상담 일정, 시간, 장소를 조율하세요</p>        </div>

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
                      <CardDescription>{getOtherUserName(selectedConversation)}와의 대화</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {/* 상담 조율 카드 */}
                <div className="bg-amber-50 border-b border-amber-200 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-amber-900 mb-1">상담 조율 대화</h3>
                      <p className="text-sm text-amber-800 mb-3">
                        이 공간은 상담 일정, 시간, 장소, 결제 방식 등을 합의하기 위한 공간입니다.
                      </p>
                      <div className="bg-white border border-amber-200 rounded p-3 text-sm text-amber-900">
                        <p className="font-semibold mb-1">⚠️ 상담 진행 안내</p>
                        <p>상담은 대면으로 진행됩니다. 결제는 상담 당일 현장에서 진행해주세요. 정확한 장소와 시간을 이 대화에서 확정해주세요.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
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
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                      <p className="text-muted-foreground mb-4">
                        아직 조율 메시지가 없습니다.
                      </p>
                      <p className="text-sm text-muted-foreground mb-4">
상담 일정, 시간, 장소를 먼저 합의해보세요.                      </p>
                      <Link href="/mentors">
                        <Button variant="outline" size="sm">
                          멘토 찾기
                        </Button>
                      </Link>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>

                {/* 멘토 계정일 경우 예약 확정 버튼 */}
                {selectedConversationMessages.some((msg: any) => msg.content.includes("[상담 신청]")) && 
                 selectedConversationMessages.some((msg: any) => msg.senderId !== user?.id) && (
                  <div className="border-t border-border p-4 bg-green-50">
                    <p className="text-sm font-semibold text-green-900 mb-3">상담 예약 확정</p>
                    <p className="text-xs text-green-800 mb-3">
                      학생이 제안한 일정, 시간, 장소를 확인하고 아래 버튼으로 예약을 확정하세요.
                    </p>
                    <Button
                      onClick={() => {
                        if (!selectedConversation) return;
                        sendMessageMutation.mutate({
                          recipientId: selectedConversation,
                          content: "예약이 확정되었습니다. 상담 당일 현장 결제 부탁드립니다.",
                        });
                      }}
                      disabled={sendMessageMutation.isPending}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Check className="h-4 w-4 mr-2" />
                      {sendMessageMutation.isPending ? "처리 중..." : "예약 확정하기"}
                    </Button>
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
                  
                  {/* 템플릿 버튼 */}
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("상담 가능한 날짜와 시간을 아래와 같이 제안드립니다.\n- 날짜: \n- 시간: \n확인 부탁드립니다.")}
                      className="text-xs"
                    >
                      📅 일정 제안
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("상담 장소를 아래와 같이 제안드립니다.\n- 장소: \n- 위치 설명: \n가능 여부 확인 부탁드립니다.")}
                      className="text-xs"
                    >
                      📍 장소 제안
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => insertTemplate("결제는 상담 당일 현장에서 진행 부탁드립니다. 계좌이체/현금 중 편하신 방식으로 준비해주세요.")}
                      className="text-xs"
                    >
                      💳 결제 안내
                    </Button>
                  </div>
                  
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
                  <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground mb-4">
                    대화를 선택하여 메시지를 확인하세요.
                  </p>
                  {Object.keys(conversations).length === 0 && (
                    <>
                      <p className="text-sm text-muted-foreground mb-4">
                        아직 조율 메시지가 없습니다.
                      </p>
                      <Link href="/mentors">
                        <Button variant="outline" size="sm">
                          멘토 찾기
                        </Button>
                      </Link>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
