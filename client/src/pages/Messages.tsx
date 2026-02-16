import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap, Send, MessageSquare, Check, X, Clock, CheckCircle2, Trash2, ChevronDown } from "lucide-react";
import BugReportModal from "@/components/BugReportModal";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";

export default function Messages() {
  const [location] = useLocation();

  useEffect(() => {
    setPageMeta(PAGE_META.messages);
  }, []);
  const { user, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  // URL 쿼리 파라미터에서 멘토 ID 추출하여 자동 선택
  useEffect(() => {
    if (location.includes('?')) {
      const params = new URLSearchParams(location.split('?')[1]);
      const mentorId = params.get('mentorId');
      if (mentorId) {
        setSelectedConversation(parseInt(mentorId, 10));
      }
    }
  }, [location]);

  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 모든 메시지 조회
  const { data: allMessages } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 선택된 대화의 메시지 조회
  const { data: conversation } = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  // 대화 목록 생성 (모든 메시지에서 고유한 상대방 추출)
  const conversations = allMessages
    ? Array.from(
        new Map(
          allMessages.map((msg) => {
            const otherUserId =
              msg.senderId === user?.id ? msg.recipientId : msg.senderId;
            return [otherUserId, msg];
          })
        ).values()
      )
    : [];

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
  };

  const [showBugReport, setShowBugReport] = useState(false);

  // 상대방 정보 찾기
  const getOtherUserId = (msg: any) => {
    return msg.senderId === user?.id ? msg.recipientId : msg.senderId;
  };

  return (
    <PageLayout>
      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">메시지</h1>
        <p className="text-muted-foreground mb-6">멘토와의 상담 신청 및 메시지를 관리하세요</p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">대화 목록</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations && conversations.length > 0 ? (
                  conversations.map((message) => {
                    const otherUserId = getOtherUserId(message);
                    return (
                      <button
                        key={otherUserId}
                        onClick={() => setSelectedConversation(otherUserId)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedConversation === otherUserId
                            ? "border-primary bg-primary/10"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm truncate">
                              To: User {otherUserId}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {message.content || "메시지 없음"}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {format(new Date(message.createdAt), "MM.dd HH:mm", {
                                locale: ko,
                              })}
                            </p>
                          </div>
                          {!message.isRead && message.recipientId === user?.id && (
                            <div className="ml-2 flex-shrink-0 w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </button>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    아직 메시지가 없습니다
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Conversation Detail */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="flex flex-col h-full" style={{ minHeight: "600px" }}>
                <CardHeader>
                  <CardTitle className="text-lg">대화</CardTitle>
                  <CardDescription>User {selectedConversation}와의 대화</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {conversation && conversation.length > 0 ? (
                    conversation.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user?.id
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.senderId === user?.id
                              ? "bg-primary text-white"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              msg.senderId === user?.id
                                ? "text-primary-foreground/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(new Date(msg.createdAt), "HH:mm", {
                              locale: ko,
                            })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mr-2" />
                      <p>대화를 선택하여 메시지를 확인하세요.</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </CardContent>
                <div className="border-t border-border pt-4 px-6 pb-6">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="메시지를 입력하세요..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      onKeyDown={(e) => {
                        if (
                          e.key === "Enter" &&
                          (e.ctrlKey || e.metaKey)
                        ) {
                          handleSendMessage();
                        }
                      }}
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={
                        sendMessageMutation.isPending ||
                        !messageContent.trim()
                      }
                      size="sm"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Ctrl + Enter로 전송 중 입력합니다.
                  </p>
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center" style={{ minHeight: "600px" }}>
                <CardContent className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>대화를 선택하여 메시지를 확인하세요.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Bug Report Modal */}
      {showBugReport && (
        <BugReportModal
          isOpen={showBugReport}
          onClose={() => setShowBugReport(false)}
        />
      )}
    </PageLayout>
  );
}
