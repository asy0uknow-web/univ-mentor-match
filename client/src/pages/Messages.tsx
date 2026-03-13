import PageLayout from "@/components/layout/PageLayout";
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

export function Messages() {
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
    const storedConversationId = sessionStorage.getItem("openConversationId");
    if (storedConversationId) {
      setSelectedConversation(parseInt(storedConversationId));
      sessionStorage.removeItem("openConversationId");
    }
  }, []);

  const { data: inbox } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: conversation } = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  // 멘토 프로필 정보 조회
  const { data: mentorProfile } = trpc.mentor.getById.useQuery(
    { mentorId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  // 자동 스크롤 - 새 메시지가 추가되면 하단으로 스크롤
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
    
    // 멘토 프로필에서 사용자 정보 조회
    if (userId === selectedConversation && mentorProfile) {
      // 멘토 프로필에는 name 필드가 없으므로, 메시지에서 이름을 찾지 못하면
      // 멘토 대학 이름과 전공으로 표시
      return mentorProfile.profile?.major || mentorProfile.profile?.university || `User ${userId}`;
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
    const labels: Record<string, string> = {
      career: "커리어 상담",
      academic: "학업 상담",
      major: "전공 상담",
      university_life: "대학생활 상담",
      other: "기타 상담",
    };
    return labels[type || ""] || type || "상담";
  };

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

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>로그인 필요</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              상담을 조율하려면 로그인이 필요합니다.
            </p>
            <a href={getLoginUrl()}>
              <Button className="w-full">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      {/* Content */}
      <div ref={containerRef} className="container mx-auto px-4 py-8 flex flex-col" style={{ height: 'calc(100vh - 160px)' }}>
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
              <CardContent className="flex-1 overflow-y-auto h-full">
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
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
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
              <Card className="flex flex-col overflow-hidden" style={{ minHeight: 0, height: 'calc(100vh - 280px)' }}>
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

                <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col min-h-0" style={{ minHeight: 0 }}>
                  {conversation && conversation.length > 0 ? (
                    <>
                      {conversation.map((msg: any, idx: number) => (
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
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">
                        아직 조율 메시지가 없습니다.
                      </p>
                    </div>
                  )}
                </div>

                <CardContent className="border-t pt-4 space-y-3 shrink-0">
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

export default Messages;
