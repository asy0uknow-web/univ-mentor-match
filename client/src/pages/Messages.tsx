import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Send, MessageSquare } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format } from "date-fns";
import { ko } from "date-fns/locale";

export default function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");

  const { data: inbox } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: conversation } = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null }
  );

  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      toast.success("메시지가 전송되었습니다.");
      // Invalidate conversation to refresh
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (error) => {
      toast.error(`메시지 전송 실패: ${error.message}`);
    },
  });

  const utils = trpc.useUtils();

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

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer">
                <GraduationCap className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">대학 멘토 매칭</span>
              </div>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/mentors">
                <Button variant="ghost">멘토 찾기</Button>
              </Link>
              <Link href="/bookings">
                <Button variant="ghost">내 예약</Button>
              </Link>
              <Link href="/my-profile">
                <Button variant="ghost">내 프로필</Button>
              </Link>
              <Link href="/messages">
                <Button variant="ghost">메시지</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">메시지</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  대화 목록
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(conversations).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(conversations).map(([userId, msgs]: any) => {
                      const lastMsg = msgs[0];
                      const isSelected = parseInt(userId) === selectedConversation;
                      return (
                        <button
                          key={userId}
                          onClick={() => setSelectedConversation(parseInt(userId))}
                          className={`w-full text-left p-3 rounded-lg transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/80"
                          }`}
                        >
                          <p className="font-semibold text-sm truncate">
                            {lastMsg.senderId === user?.id
                              ? `To: User ${lastMsg.recipientId}`
                              : `From: User ${lastMsg.senderId}`}
                          </p>
                          <p className="text-xs opacity-75 truncate">
                            {lastMsg.content}
                          </p>
                          <p className="text-xs opacity-50 mt-1">
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
              <Card className="flex flex-col h-[600px]">
                <CardHeader>
                  <CardTitle>대화</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {conversation && conversation.length > 0 ? (
                    conversation.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${
                          msg.senderId === user?.id ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs px-4 py-2 rounded-lg ${
                            msg.senderId === user?.id
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-75 mt-1">
                            {format(new Date(msg.createdAt), "p", { locale: ko })}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      대화를 시작해보세요.
                    </p>
                  )}
                </CardContent>
                <div className="border-t border-border p-4 space-y-3">
                  <Textarea
                    placeholder="메시지를 입력하세요..."
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={sendMessageMutation.isPending || !messageContent.trim()}
                    className="w-full"
                  >
                    <Send className="h-4 w-4 mr-2" />
                    {sendMessageMutation.isPending ? "전송 중..." : "메시지 전송"}
                  </Button>
                </div>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
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
    </div>
  );
}
