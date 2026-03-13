import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Send, MessageSquare, Check, X, Clock, CheckCircle2, Trash2, ChevronDown, AlertCircle, Menu, X as XIcon } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

const COOKIE_NAME = "session_id";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [consultationType, setConsultationType] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 텍스트 영역 높이 자동 조정
  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 100);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  // 메시지 입력 시 높이 조정
  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageContent(e.target.value);
    adjustTextareaHeight();
  };

  // If another page (e.g., MentorDetail) asked us to open a specific conversation,
  // read it once from sessionStorage.
  useEffect(() => {
    const storedConversationId = sessionStorage.getItem("openConversationId");
    if (storedConversationId) {
      setSelectedConversation(parseInt(storedConversationId));
      sessionStorage.removeItem("openConversationId");
    }
  }, []);

  // Fetch conversations
  const conversationsQuery = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Fetch conversation with selected user
  const conversationQuery = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation! },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  // Send message mutation
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
      conversationQuery.refetch();
      conversationsQuery.refetch();
    },
    onError: (error) => {
      toast.error(error.message || "메시지 전송에 실패했습니다.");
    },
  });

  // Insert template text
  const insertTemplate = (text: string) => {
    setMessageContent((prev) => (prev ? prev + "\n" + text : text));
    setTimeout(() => adjustTextareaHeight(), 0);
  };

  // Handle send message
  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation) return;

    await sendMessageMutation.mutateAsync({
      recipientId: selectedConversation,
      content: messageContent,
    });
  };

  // Get other user name
  const getOtherUserName = (userId: number) => {
    if (!conversationQuery.data || conversationQuery.data.length === 0) {
      return `User ${userId}`;
    }

    const firstMsg = conversationQuery.data[0];
    if (firstMsg.senderId === user?.id) {
      return firstMsg.recipientName || `User ${userId}`;
    } else {
      return firstMsg.senderName || `User ${userId}`;
    }
  };

  // Get relative time
  const getRelativeTime = (date: string | Date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: ko,
    });
  };

  // Filter conversations
  const filteredConversations = conversationsQuery.data
    ? Object.entries(
        conversationsQuery.data.reduce(
          (acc: Record<string, any[]>, msg: any) => {
            const userId =
              msg.senderId === user?.id ? msg.recipientId : msg.senderId;
            const userName =
              msg.senderId === user?.id ? msg.recipientName : msg.senderName;
            if (!acc[userId]) acc[userId] = [];
            acc[userId].push({ ...msg, displayName: userName });
            return acc;
          },
          {}
        )
      ).filter(([_, msgs]) => {
        const displayName = msgs[0]?.displayName || "";
        return displayName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      })
    : [];

  const conversation = conversationQuery.data || [];

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">로그인이 필요합니다.</p>
          <Link href={getLoginUrl()}>
            <Button>로그인</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Content */}
      <div ref={containerRef} className="container mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">상담 조율</h1>
          <p className="text-muted-foreground mt-1">상담 일정, 시간, 장소를 조율하세요</p>        
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden" style={{ minHeight: 0 }}>
          {/* Sidebar - Conversations List */}
          <div className={`${sidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden flex flex-col`}>
            <Card className="h-full flex flex-col border-r">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  대화 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <Input
                  placeholder="대화 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </CardContent>
              <CardContent className="flex-1 overflow-y-auto">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredConversations.map(([userId, msgs]: [string, any]) => {
                      const lastMsg = msgs[0];
                      const isSelected = selectedConversation === parseInt(userId);
                      return (
                        <button
                          key={userId}
                          onClick={() => setSelectedConversation(parseInt(userId))}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "hover:bg-muted"
                          }`}
                        >
                          <p className="font-medium text-sm">
                            {lastMsg.displayName || `User ${userId}`}
                          </p>
                          <p className="text-xs opacity-70 truncate mt-1">
                            {lastMsg.content}
                          </p>
                          <p className="text-xs opacity-50 mt-1">
                            {getRelativeTime(lastMsg.createdAt)}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground text-sm">
                      대화가 없습니다.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Conversation Area */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
            {/* Toggle Sidebar Button */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? '대화목록 닫기' : '대화목록 열기'}
              </Button>
            </div>

            {selectedConversation ? (
              <Card className="flex flex-col h-[calc(100vh-200px)] overflow-hidden" style={{ minHeight: 0 }}>
                <CardHeader className="border-b shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getOtherUserName(selectedConversation)}와의 대화
                    </CardTitle>
                    <Link href="/mentors">
                      <Button variant="outline" size="sm">
                        멘토 목록으로
                      </Button>
                    </Link>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse min-h-0" style={{ minHeight: 0 }}>
                  {conversation && conversation.length > 0 ? (
                    <>
                      <div ref={messagesEndRef} />
                      {[...conversation].reverse().map((msg: any, idx: number) => (
                        <div
                          key={idx}
                          className={`flex ${
                            msg.senderId === user?.id ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              msg.senderId === user?.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {msg.content}
                            </p>
                            <p className="text-xs opacity-70 mt-1">
                              {getRelativeTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        아직 조율 메시지가 없습니다.
                      </p>
                    </div>
                  )}
                </CardContent>

                <CardContent className="border-t pt-2 pb-2 px-3 shrink-0 space-y-2">
                  {/* 도구 모음 - 반응형 */}
                  <div className="flex gap-1 overflow-x-auto pb-1 -mx-3 px-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        insertTemplate(
                          "📅 일정 제안\n\n편한 날짜와 시간을 알려주세요."
                        )
                      }
                      className="flex-shrink-0 text-xs h-8 px-2"
                      title="일정 제안"
                    >
                      <span className="hidden sm:inline">📅 일정</span>
                      <span className="sm:hidden">📅</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        insertTemplate(
                          "📍 장소 제안\n\n어디서 만날까요? (온/오프라인)"
                        )
                      }
                      className="flex-shrink-0 text-xs h-8 px-2"
                      title="장소 제안"
                    >
                      <span className="hidden sm:inline">📍 장소</span>
                      <span className="sm:hidden">📍</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        insertTemplate(
                          "💳 결제 안내\n\n결제 방법과 일정을 확인해주세요."
                        )
                      }
                      className="flex-shrink-0 text-xs h-8 px-2"
                      title="결제 안내"
                    >
                      <span className="hidden sm:inline">💳 결제</span>
                      <span className="sm:hidden">💳</span>
                    </Button>
                  </div>

                  {/* 메시지 입력 영역 */}
                  <div className="flex gap-2 items-end">
                    <Textarea
                      ref={textareaRef}
                      placeholder="메시지를 입력하세요..."
                      value={messageContent}
                      onChange={handleMessageChange}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) {
                          handleSendMessage();
                        }
                      }}
                      className="resize-none overflow-hidden flex-1"
                      style={{
                        minHeight: '40px',
                        maxHeight: '100px',
                        height: 'auto'
                      }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      size="sm"
                      className="flex-shrink-0 h-10 w-10 p-0"
                      title="메시지 전송 (Ctrl+Enter)"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    대화를 선택해주세요.
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
