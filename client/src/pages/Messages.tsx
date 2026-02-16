export default function Messages() {
  const [location] = useLocation();

  useEffect(() => {
    setPageMeta(PAGE_META.messages);
  }, []);

  const { user, isAuthenticated } = useAuth();

  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [messageContent, setMessageContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔥 URL의 ?to=값이 있으면 자동으로 대화 선택
  useEffect(() => {
    if (!location.includes("?")) return;

    const params = new URLSearchParams(location.split("?")[1]);
    const to = params.get("to");

    if (!to) return;

    const toUserId = Number(to);
    if (!isNaN(toUserId)) {
      setSelectedConversation(toUserId);
    }

    // 주소창에서 ?to 제거 (UX 정리)
    window.history.replaceState({}, "", "/messages");
  }, [location]);

  // 모든 메시지 조회
  const { data: allMessages } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 선택된 대화 조회
  const { data: conversation } = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation as number },
    {
      enabled: isAuthenticated && !!selectedConversation,
    }
  );

  // 대화 목록 생성
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

  // 자동 스크롤
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (conversation && conversation.length > 0) {
      setTimeout(() => {
        scrollToBottom();
      }, 50);
    }
  }, [conversation]);

  const utils = trpc.useUtils();

  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      toast.success("메시지가 전송되었습니다.");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
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

  const getOtherUserId = (msg: any) => {
    return msg.senderId === user?.id ? msg.recipientId : msg.senderId;
  };

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-2xl sm:text-4xl font-bold mb-2">메시지</h1>
        <p className="text-muted-foreground mb-6">
          멘토와의 상담 신청 및 메시지를 관리하세요
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* 대화 목록 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">대화 목록</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {conversations.length > 0 ? (
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
                        <p className="font-semibold text-sm truncate">
                          User {otherUserId}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.content || "메시지 없음"}
                        </p>
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

          {/* 대화 상세 */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="flex flex-col h-full" style={{ minHeight: "600px" }}>
                <CardHeader>
                  <CardTitle>User {selectedConversation}와의 대화</CardTitle>
                </CardHeader>

                <CardContent className="flex-1 overflow-y-auto space-y-4 mb-4">
                  {conversation?.map((msg) => (
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
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </CardContent>

                <div className="border-t pt-4 px-6 pb-6">
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="메시지를 입력하세요..."
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
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
                </div>
              </Card>
            ) : (
              <Card
                className="flex items-center justify-center"
                style={{ minHeight: "600px" }}
              >
                <CardContent className="text-center text-muted-foreground">
                  대화를 선택하여 메시지를 확인하세요.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
