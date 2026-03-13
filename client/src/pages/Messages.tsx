'use client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
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

      const type = sessionStorage.getItem("univmatch:consultationType");
      if (type) {
        setConsultationType(type);
        sessionStorage.removeItem("univmatch:consultationType");
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
    
    // 메시지 전송 후 입력창 초기화 및 높이 조정
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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

  // Extract user name from messages - MUST be defined before use
  const getOtherUserName = (userId: number) => {
    const msgs: any[] = conversations[userId] || [];
    
    // 메시지 배열에서 해당 사용자의 실명을 찾기
    for (const msg of msgs) {
      if (msg.senderId === userId && msg.senderName) {
        return msg.senderName;
      }
      if (msg.recipientId === userId && msg.recipientName) {
        return msg.recipientName;
      }
    }
    
    // 선택된 대화의 상대방이면 conversation 데이터에서 이름 찾기
    if (userId === selectedConversation && conversation && conversation.length > 0) {
      for (const msg of conversation) {
        if (msg.senderId === userId && msg.senderName) {
          return msg.senderName;
        }
        if (msg.recipientId === userId && msg.recipientName) {
          return msg.recipientName;
        }
      }
    }
    
    return `User ${userId}`;
  };

  // Filter conversations based on search query
  const filteredConversations = Object.entries(conversations).filter(([userId, msgs]: [string, any]) => {
    const otherUserName = getOtherUserName(parseInt(userId));
    return otherUserName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Find related booking from conversation
  const selectedConversationMessages = selectedConversation
    ? conversations[selectedConversation] || []
    : [];


  const getConsultationTypeLabel = (type: string | null) => {
    if (!type) return "";
    const typeLabels: Record<string, string> = {
      "career_counseling": "진로상담",
      "university_tour": "대학탐방",
      "resume_consulting": "생기부컨설팅",
      "academic_management": "학업관리"
    };
    return typeLabels[type] || "";
  };

  // 상대적 시간 표시 함수
  const getRelativeTime = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: ko 
      });
    } catch {
      return format(new Date(date), "PPp", { locale: ko });
    }
  };

  return (
    <PageLayout>
      {/* Content */}
      <div ref={containerRef} className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">상담 조율</h1>
          <p className="text-muted-foreground mt-1">상담 일정, 시간, 장소를 조율하세요</p>        
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden min-h-0">
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
                      const isSelected = parseInt(userId) === selectedConversation;
                      const isConsultationRequest = lastMsg.content.includes("[상담 신청]");
                      
                      return (
                        <button
                          key={userId}
                          onClick={() => {
                            setSelectedConversation(parseInt(userId));
                            // 모바일에서는 자동으로 사이드바 닫기
                            if (window.innerWidth < 1024) {
                              setSidebarOpen(false);
                            }
                          }}
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
                            {getRelativeTime(lastMsg.createdAt)}
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

          {/* Main Conversation Area */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {/* Toggle Sidebar Button */}
            <div className="mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="gap-2"
              >
                {sidebarOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                {sidebarOpen ? '대화목록 닫기' : '대화목록 열기'}
              </Button>
            </div>

            {selectedConversation ? (
              <Card className="flex flex-col h-full overflow-hidden min-h-0">
                <CardHeader className="border-b">
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

                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse min-h-0">
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

                <CardContent className="border-t pt-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        insertTemplate(
                          "📅 일정 제안\n\n편한 날짜와 시간을 알려주세요."
                        )
                      }
                    >
                      📅 일정 제안
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        insertTemplate(
                          "📍 장소 제안\n\n어디서 만날까요? (온/오프라인)"
                        )
                      }
                    >
                      📍 장소 제안
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        insertTemplate(
                          "💳 결제 안내\n\n결제 방법과 일정을 확인해주세요."
                        )
                      }
                    >
                      💳 결제 안내
                    </Button>
                  </div>

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
                    className="resize-none overflow-hidden"
                    style={{
                      minHeight: '48px',
                      maxHeight: '120px',
                      height: 'auto'
                    }}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!messageContent.trim() || sendMessageMutation.isPending}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    메시지 전송
                  </Button>
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
    </PageLayout>
  );
}
