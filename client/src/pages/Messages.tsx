import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  Send, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle,
  Menu, X as XIcon, Calendar, MapPin, Video, Users, ChevronRight,
  ThumbsUp, ThumbsDown, RefreshCw, Star
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef, useCallback } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";

// ===== 상담 유형 상수 =====
const CONSULTATION_TYPES = {
  career_counseling: "진로 상담",
  academic_management: "학업 관리",
  resume_consulting: "자기소개서 첨삭",
  university_tour: "대학 투어",
} as const;

// ===== 제안 상태 정보 =====
const PROPOSAL_STATUS = {
  pending: { label: "수락 대기 중", color: "text-amber-600", bg: "bg-amber-50 border-amber-200", icon: Clock },
  accepted: { label: "상담 확정됨", color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2 },
  rejected: { label: "거절됨", color: "text-red-500", bg: "bg-red-50 border-red-200", icon: XCircle },
  counter_proposed: { label: "수정 제안됨", color: "text-blue-600", bg: "bg-blue-50 border-blue-200", icon: RefreshCw },
  cancelled: { label: "취소됨", color: "text-gray-500", bg: "bg-gray-50 border-gray-200", icon: XCircle },
  completed: { label: "상담 완료", color: "text-purple-600", bg: "bg-purple-50 border-purple-200", icon: Star },
} as const;

// ===== 상담 제안 폼 컴포넌트 =====
function ProposalFormDialog({
  open,
  onClose,
  onSubmit,
  receiverId,
  initialData,
  isCounter = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  receiverId: number;
  initialData?: any;
  isCounter?: boolean;
}) {
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "yyyy-MM-dd") : "");
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "");
  const [mode, setMode] = useState<"online" | "offline">(initialData?.consultationMode ?? "online");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [duration, setDuration] = useState(String(initialData?.duration ?? "1"));
  const [consultationType, setConsultationType] = useState(initialData?.consultationType ?? "career_counseling");
  const [note, setNote] = useState(initialData?.note ?? "");

  const handleSubmit = () => {
    if (!scheduledDate || !scheduledTime) {
      toast.error("날짜와 시간을 입력해주세요.");
      return;
    }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    onSubmit({
      receiverId,
      scheduledAt,
      consultationMode: mode,
      location: mode === "offline" ? location : undefined,
      duration: parseFloat(duration),
      consultationType,
      note: note || undefined,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {isCounter ? "상담 일정 수정 제안" : "상담 일정 제안"}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>날짜</Label>
              <Input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>시간</Label>
              <Input type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} />
            </div>
          </div>

          <div className="space-y-1">
            <Label>상담 방식</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setMode("online")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === "online" ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/40"}`}
              >
                <Video className="h-4 w-4" /> 온라인
              </button>
              <button
                type="button"
                onClick={() => setMode("offline")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === "offline" ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/40"}`}
              >
                <Users className="h-4 w-4" /> 오프라인
              </button>
            </div>
          </div>

          {mode === "offline" && (
            <div className="space-y-1">
              <Label>장소</Label>
              <Input placeholder="예: 강남역 스타벅스 2층" value={location} onChange={e => setLocation(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>상담 시간</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.5">30분</SelectItem>
                  <SelectItem value="1">1시간</SelectItem>
                  <SelectItem value="1.5">1시간 30분</SelectItem>
                  <SelectItem value="2">2시간</SelectItem>
                  <SelectItem value="3">3시간</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>상담 유형</Label>
              <Select value={consultationType} onValueChange={setConsultationType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CONSULTATION_TYPES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label>메모 (선택)</Label>
            <Textarea
              placeholder="상담에서 다루고 싶은 내용을 간략히 적어주세요"
              value={note}
              onChange={e => setNote(e.target.value)}
              className="resize-none"
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>취소</Button>
          <Button onClick={handleSubmit}>
            <Calendar className="h-4 w-4 mr-2" />
            {isCounter ? "수정 제안 보내기" : "제안 보내기"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ===== 상담 제안 카드 컴포넌트 =====
function ProposalCard({
  proposalData,
  isMyMessage,
  currentUserId,
  onAccept,
  onReject,
  onCounter,
  onComplete,
}: {
  proposalData: any;
  isMyMessage: boolean;
  currentUserId: number;
  onAccept: (id: number) => void;
  onReject: (id: number) => void;
  onCounter: (proposal: any) => void;
  onComplete: (id: number) => void;
}) {
  const status = proposalData.status as keyof typeof PROPOSAL_STATUS;
  const statusInfo = PROPOSAL_STATUS[status] ?? PROPOSAL_STATUS.pending;
  const StatusIcon = statusInfo.icon;

  const scheduledDate = new Date(proposalData.scheduledAt);
  const formattedDate = format(scheduledDate, "M월 d일 (E) HH:mm", { locale: ko });
  const durationLabel = parseFloat(proposalData.duration) === 0.5 ? "30분" : `${proposalData.duration}시간`;
  const typeLabel = CONSULTATION_TYPES[proposalData.consultationType as keyof typeof CONSULTATION_TYPES] ?? proposalData.consultationType;
  const isReceiver = proposalData.receiverId === currentUserId;
  const canAct = isReceiver && (status === "pending" || status === "counter_proposed");
  const canComplete = status === "accepted";

  return (
    <div className={`rounded-xl border-2 overflow-hidden ${statusInfo.bg} max-w-sm w-full`}>
      {/* 헤더 */}
      <div className={`px-4 py-2 flex items-center gap-2 border-b ${statusInfo.bg}`}>
        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
        <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
        {proposalData.isCounter && (
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">수정 제안</span>
        )}
      </div>

      {/* 내용 */}
      <div className="px-4 py-3 space-y-2 bg-white/80">
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="font-medium">{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {proposalData.consultationMode === "online" ? (
            <Video className="h-4 w-4 text-blue-500 shrink-0" />
          ) : (
            <MapPin className="h-4 w-4 text-orange-500 shrink-0" />
          )}
          <span>
            {proposalData.consultationMode === "online" ? "온라인" : `오프라인${proposalData.location ? ` · ${proposalData.location}` : ""}`}
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" /> {durationLabel}
          </span>
          <span className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3" /> {typeLabel}
          </span>
        </div>
        {proposalData.note && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-1">
            💬 {proposalData.note}
          </p>
        )}
      </div>

      {/* 액션 버튼 */}
      {canAct && (
        <div className="px-4 py-3 flex gap-2 border-t bg-white/60">
          <Button
            size="sm"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => onAccept(proposalData.proposalId)}
          >
            <ThumbsUp className="h-3 w-3 mr-1" /> 수락
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
            onClick={() => onCounter(proposalData)}
          >
            <RefreshCw className="h-3 w-3 mr-1" /> 수정 제안
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => onReject(proposalData.proposalId)}
          >
            <ThumbsDown className="h-3 w-3 mr-1" /> 거절
          </Button>
        </div>
      )}
      {canComplete && (
        <div className="px-4 py-3 border-t bg-white/60">
          <Button
            size="sm"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => onComplete(proposalData.proposalId)}
          >
            <Star className="h-3 w-3 mr-1" /> 상담 완료 처리
          </Button>
        </div>
      )}
    </div>
  );
}

// ===== 상태 메시지 배너 컴포넌트 =====
function StatusBanner({ statusData }: { statusData: any }) {
  const status = statusData.status as keyof typeof PROPOSAL_STATUS;
  const statusInfo = PROPOSAL_STATUS[status] ?? PROPOSAL_STATUS.pending;
  const StatusIcon = statusInfo.icon;

  return (
    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${statusInfo.bg} text-sm`}>
      <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
      <span className={`font-medium ${statusInfo.color}`}>{statusData.message}</span>
    </div>
  );
}

// ===== 메인 Messages 컴포넌트 =====
export function Messages() {
  const { user, isAuthenticated } = useAuth();
  const [messageContent, setMessageContent] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [counterProposalData, setCounterProposalData] = useState<any>(null);
  const [showCounterForm, setShowCounterForm] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utils = trpc.useUtils();

  const adjustTextareaHeight = useCallback(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, []);

  useEffect(() => {
    const storedId = sessionStorage.getItem("openConversationId");
    if (storedId) {
      setSelectedConversation(parseInt(storedId));
      sessionStorage.removeItem("openConversationId");
    }
  }, []);

  const { data: inbox } = trpc.message.getInbox.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: 5000,
  });

  const { data: conversation, refetch: refetchConversation } = trpc.message.getConversation.useQuery(
    { otherUserId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null, refetchInterval: 3000 }
  );

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // ===== Mutations =====
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`전송 실패: ${e.message}`),
  });

  const createProposalMutation = trpc.proposal.create.useMutation({
    onSuccess: () => {
      toast.success("상담 일정을 제안했어요!");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`제안 실패: ${e.message}`),
  });

  const acceptProposalMutation = trpc.proposal.accept.useMutation({
    onSuccess: () => {
      toast.success("상담 일정이 확정되었어요! 🎉");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`수락 실패: ${e.message}`),
  });

  const rejectProposalMutation = trpc.proposal.reject.useMutation({
    onSuccess: () => {
      toast.info("일정 제안을 거절했어요.");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`거절 실패: ${e.message}`),
  });

  const counterProposeMutation = trpc.proposal.counterPropose.useMutation({
    onSuccess: () => {
      toast.success("수정 제안을 보냈어요!");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`수정 제안 실패: ${e.message}`),
  });

  const completeProposalMutation = trpc.proposal.complete.useMutation({
    onSuccess: () => {
      toast.success("상담이 완료되었어요! 후기를 남겨보세요 ⭐");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`완료 처리 실패: ${e.message}`),
  });

  const handleSendMessage = () => {
    if (!messageContent.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({ recipientId: selectedConversation, content: messageContent });
    scrollToBottom();
  };

  const handleProposalSubmit = (data: any) => {
    createProposalMutation.mutate(data);
  };

  const handleCounterSubmit = (data: any) => {
    if (!counterProposalData) return;
    counterProposeMutation.mutate({
      proposalId: counterProposalData.proposalId,
      ...data,
    });
  };

  // ===== 대화 목록 처리 =====
  const conversations = inbox?.reduce((acc: any, msg: any) => {
    const otherId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(msg);
    return acc;
  }, {}) || {};

  const getOtherUserName = (userId: number) => {
    const msgs: any[] = conversations[userId] || [];
    for (const msg of msgs) {
      if (msg.senderId === userId && msg.senderName) return msg.senderName;
      if (msg.recipientId === userId && msg.recipientName) return msg.recipientName;
    }
    if (userId === selectedConversation && conversation) {
      for (const msg of conversation) {
        if ((msg as any).senderId === userId && (msg as any).senderName) return (msg as any).senderName;
        if ((msg as any).recipientId === userId && (msg as any).recipientName) return (msg as any).recipientName;
      }
    }
    return `사용자 ${userId}`;
  };

  const filteredConversations = Object.entries(conversations).filter(([userId]: [string, any]) =>
    getOtherUserName(parseInt(userId)).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelativeTime = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ko });
    } catch {
      return format(new Date(date), "PPp", { locale: ko });
    }
  };

  // ===== 메시지 렌더링 =====
  const renderMessage = (msg: any, idx: number) => {
    const isMe = msg.senderId === user?.id;

    // proposal 타입 메시지 처리
    if (msg.messageType === "proposal") {
      let parsed: any = null;
      try { parsed = JSON.parse(msg.content); } catch {}

      if (parsed?.type === "proposal") {
        return (
          <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
            <div className="max-w-sm w-full">
              <p className={`text-xs mb-1 ${isMe ? "text-right" : "text-left"} text-muted-foreground`}>
                {isMe ? "상담 일정 제안을 보냈어요" : "상담 일정 제안이 도착했어요"}
              </p>
              <ProposalCard
                proposalData={parsed}
                isMyMessage={isMe}
                currentUserId={user?.id ?? 0}
                onAccept={(id) => acceptProposalMutation.mutate({ proposalId: id })}
                onReject={(id) => rejectProposalMutation.mutate({ proposalId: id })}
                onCounter={(data) => { setCounterProposalData(data); setShowCounterForm(true); }}
                onComplete={(id) => completeProposalMutation.mutate({ proposalId: id })}
              />
              <p className={`text-xs mt-1 ${isMe ? "text-right" : "text-left"} text-muted-foreground`}>
                {getRelativeTime(msg.createdAt)}
              </p>
            </div>
          </div>
        );
      }

      if (parsed?.type === "proposal_status") {
        return (
          <div key={idx} className="flex justify-center my-2">
            <StatusBanner statusData={parsed} />
          </div>
        );
      }
    }

    // 일반 텍스트 메시지
    return (
      <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"}`}>
          <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
          <p className={`text-xs mt-1 ${isMe ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
            {getRelativeTime(msg.createdAt)}
          </p>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader><CardTitle>로그인 필요</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">상담을 조율하려면 로그인이 필요합니다.</p>
            <a href={getLoginUrl()}><Button className="w-full">로그인</Button></a>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-8 flex flex-col" style={{ height: "calc(100vh - 160px)" }}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold">상담 조율</h1>
          <p className="text-muted-foreground mt-1">채팅으로 일정을 조율하고 상담을 확정하세요</p>
        </div>

        <div className="flex-1 flex gap-4 overflow-hidden" style={{ minHeight: 0 }}>
          {/* 사이드바 */}
          <div className={`${sidebarOpen ? "w-80" : "w-0"} transition-all duration-300 overflow-hidden flex flex-col shrink-0`}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <MessageSquare className="h-4 w-4" /> 대화 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <Input placeholder="대화 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </CardContent>
              <CardContent className="flex-1 overflow-y-auto p-3">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-2">
                    {filteredConversations.map(([userId, msgs]: [string, any]) => {
                      const lastMsg = msgs[0];
                      const isSelected = parseInt(userId) === selectedConversation;
                      let preview = lastMsg.content;
                      if (lastMsg.messageType === "proposal") {
                        try {
                          const p = JSON.parse(lastMsg.content);
                          if (p.type === "proposal") preview = "📅 상담 일정 제안";
                          else if (p.type === "proposal_status") preview = p.message;
                        } catch {}
                      }
                      return (
                        <button
                          key={userId}
                          onClick={() => {
                            setSelectedConversation(parseInt(userId));
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                          className={`w-full text-left p-3 rounded-xl transition-all border-2 ${isSelected ? "bg-primary/10 border-primary" : "bg-muted/40 border-transparent hover:bg-muted/70"}`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm truncate">{getOtherUserName(parseInt(userId))}</p>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">{preview}</p>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground/60 mt-1">{getRelativeTime(lastMsg.createdAt)}</p>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">아직 대화가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 메인 채팅 영역 */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ minHeight: 0 }}>
            <div className="mb-3">
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="gap-2">
                {sidebarOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                {sidebarOpen ? "목록 닫기" : "목록 열기"}
              </Button>
            </div>

            {selectedConversation ? (
              <Card className="flex flex-col overflow-hidden flex-1" style={{ minHeight: 0 }}>
                {/* 채팅 헤더 */}
                <CardHeader className="border-b shrink-0 py-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{getOtherUserName(selectedConversation)}님과의 대화</CardTitle>
                    <Link href="/mentors">
                      <Button variant="outline" size="sm">멘토 목록</Button>
                    </Link>
                  </div>
                </CardHeader>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
                  {conversation && conversation.length > 0 ? (
                    <>
                      {(conversation as any[]).map((msg, idx) => renderMessage(msg, idx))}
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground text-sm">아직 메시지가 없습니다.<br />상담 일정을 제안해보세요!</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 입력 영역 */}
                <CardContent className="border-t pt-3 pb-3 shrink-0 space-y-2">
                  {/* 상담 제안 버튼 */}
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-primary border-primary/30 hover:bg-primary/5"
                      onClick={() => setShowProposalForm(true)}
                    >
                      <Calendar className="h-4 w-4" />
                      상담 일정 제안
                    </Button>
                  </div>

                  {/* 메시지 입력 */}
                  <div className="flex gap-2 items-end">
                    <Textarea
                      ref={textareaRef}
                      placeholder="메시지를 입력하세요... (Ctrl+Enter로 전송)"
                      value={messageContent}
                      onChange={e => { setMessageContent(e.target.value); adjustTextareaHeight(); }}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSendMessage(); }}
                      className="resize-none flex-1"
                      style={{ minHeight: "48px", maxHeight: "120px" }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!messageContent.trim() || sendMessageMutation.isPending}
                      size="sm"
                      className="shrink-0 h-10"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                  <p className="text-muted-foreground">대화를 선택해주세요.</p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* 상담 제안 폼 다이얼로그 */}
      {showProposalForm && selectedConversation && (
        <ProposalFormDialog
          open={showProposalForm}
          onClose={() => setShowProposalForm(false)}
          onSubmit={handleProposalSubmit}
          receiverId={selectedConversation}
        />
      )}

      {/* 수정 제안 폼 다이얼로그 */}
      {showCounterForm && counterProposalData && selectedConversation && (
        <ProposalFormDialog
          open={showCounterForm}
          onClose={() => { setShowCounterForm(false); setCounterProposalData(null); }}
          onSubmit={handleCounterSubmit}
          receiverId={selectedConversation}
          initialData={counterProposalData}
          isCounter
        />
      )}
    </PageLayout>
  );
}

export default Messages;
