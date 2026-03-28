import PageLayout from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import {
  Send, MessageSquare, Clock, CheckCircle2, XCircle, AlertCircle,
  Menu, X as XIcon, Calendar, MapPin, Video, Users, ChevronRight,
  ThumbsUp, ThumbsDown, RefreshCw, Star, Pencil, Trash2, Search,
  Check, CheckCheck, MoreHorizontal, Smile
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { format, formatDistanceToNow, isToday, isYesterday, differenceInMinutes } from "date-fns";
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

// 이모지 반응 목록
const REACTION_EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🔥"];

// ===== 아바타 컴포넌트 =====
function Avatar({ name, profileImageUrl, size = "md" }: { name: string; profileImageUrl?: string | null; size?: "sm" | "md" | "lg" }) {
  const sizeClass = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  const initial = name ? name.charAt(0) : "?";
  const colors = ["bg-violet-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"];
  const colorIdx = name ? name.charCodeAt(0) % colors.length : 0;

  if (profileImageUrl) {
    return (
      <div className={`${sizeClass} rounded-full overflow-hidden shrink-0`}>
        <img src={profileImageUrl} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${sizeClass} rounded-full ${colors[colorIdx]} text-white flex items-center justify-center font-semibold shrink-0`}>
      {initial}
    </div>
  );
}

// ===== 읽음 표시 컴포넌트 =====
function ReadReceipt({ isRead, isMe }: { isRead: boolean; isMe: boolean }) {
  if (!isMe) return null;
  return (
    <span className="inline-flex items-center ml-1">
      {isRead ? (
        <CheckCheck className="h-3 w-3 text-blue-400" />
      ) : (
        <Check className="h-3 w-3 text-muted-foreground/60" />
      )}
    </span>
  );
}

// ===== 타이핑 표시기 =====
function TypingIndicator({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 px-4 py-2">
      <div className="flex gap-1 items-center bg-muted rounded-2xl px-3 py-2">
        <span className="text-xs text-muted-foreground mr-1">{name}님이 입력 중</span>
        <span className="flex gap-0.5">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 bg-muted-foreground/60 rounded-full animate-bounce"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </span>
      </div>
    </div>
  );
}

// ===== 날짜 구분선 =====
function DateDivider({ date }: { date: Date }) {
  let label = "";
  if (isToday(date)) label = "오늘";
  else if (isYesterday(date)) label = "어제";
  else label = format(date, "yyyy년 M월 d일 (E)", { locale: ko });

  return (
    <div className="flex items-center gap-3 my-4">
      <div className="flex-1 h-px bg-border" />
      <span className="text-xs text-muted-foreground bg-background px-2 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ===== 이모지 반응 표시 =====
function ReactionBubbles({ reactions, currentUserId, messageId, onToggle }: {
  reactions: any[];
  currentUserId: number;
  messageId: number;
  onToggle: (emoji: string) => void;
}) {
  if (!reactions || reactions.length === 0) return null;

  const grouped = reactions.reduce((acc: Record<string, { count: number; users: number[] }>, r: any) => {
    if (!acc[r.emoji]) acc[r.emoji] = { count: 0, users: [] };
    acc[r.emoji].count++;
    acc[r.emoji].users.push(r.userId);
    return acc;
  }, {});

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(grouped).map(([emoji, { count, users }]) => {
        const isMyReaction = users.includes(currentUserId);
        return (
          <button
            key={emoji}
            onClick={() => onToggle(emoji)}
            className={`flex items-center gap-0.5 px-2 py-0.5 rounded-full text-xs border transition-all ${
              isMyReaction
                ? "bg-primary/10 border-primary/30 text-primary"
                : "bg-muted/60 border-border hover:bg-muted"
            }`}
          >
            <span>{emoji}</span>
            <span className="font-medium">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

// ===== 이모지 피커 =====
function EmojiPicker({ onSelect, onClose }: { onSelect: (emoji: string) => void; onClose: () => void }) {
  return (
    <div className="absolute bottom-full mb-1 bg-background border rounded-xl shadow-lg p-2 flex gap-1 z-50">
      {REACTION_EMOJIS.map(emoji => (
        <button
          key={emoji}
          onClick={() => { onSelect(emoji); onClose(); }}
          className="text-lg hover:scale-125 transition-transform p-1 rounded"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ===== 메시지 액션 메뉴 =====
function MessageActions({ isMe, onEdit, onDelete, onReact, isDeleted }: {
  isMe: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onReact: () => void;
  isDeleted: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "flex-row-reverse" : "flex-row"}`}>
      <button
        onClick={onReact}
        className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
        title="반응 추가"
      >
        <Smile className="h-3.5 w-3.5" />
      </button>
      {isMe && !isDeleted && (
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          {open && (
            <div className={`absolute bottom-full mb-1 bg-background border rounded-xl shadow-lg py-1 z-50 min-w-[100px] ${isMe ? "right-0" : "left-0"}`}>
              {onEdit && (
                <button
                  onClick={() => { onEdit(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-muted transition-colors"
                >
                  <Pencil className="h-3.5 w-3.5" /> 수정
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(); setOpen(false); }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" /> 삭제
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ===== 상담 제안 폼 컴포넌트 =====
function ProposalFormDialog({
  open, onClose, onSubmit, receiverId, initialData, isCounter = false,
}: {
  open: boolean; onClose: () => void; onSubmit: (data: any) => void;
  receiverId: number; initialData?: any; isCounter?: boolean;
}) {
  const [scheduledDate, setScheduledDate] = useState(initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "yyyy-MM-dd") : "");
  const [scheduledTime, setScheduledTime] = useState(initialData?.scheduledAt ? format(new Date(initialData.scheduledAt), "HH:mm") : "");
  const [mode, setMode] = useState<"online" | "offline">(initialData?.consultationMode ?? "online");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [duration, setDuration] = useState(String(initialData?.duration ?? "1"));
  const [consultationType, setConsultationType] = useState(initialData?.consultationType ?? "career_counseling");
  const [note, setNote] = useState(initialData?.note ?? "");

  const handleSubmit = () => {
    if (!scheduledDate || !scheduledTime) { toast.error("날짜와 시간을 입력해주세요."); return; }
    const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}`).toISOString();
    onSubmit({ receiverId, scheduledAt, consultationMode: mode, location: mode === "offline" ? location : undefined, duration: parseFloat(duration), consultationType, note: note || undefined });
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
              <input 
                type="date" 
                min={format(new Date(), "yyyy-MM-dd")}
                value={scheduledDate} 
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label>시간</Label>
              <select 
                value={scheduledTime} 
                onChange={(e) => setScheduledTime(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="">시간 선택</option>
                {Array.from({ length: 144 }, (_, i) => {
                  const hour = Math.floor(i / 6);
                  const minute = (i % 6) * 10;
                  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
                }).map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <Label>상담 방식</Label>
            <div className="flex gap-2">
              <button type="button" onClick={() => setMode("online")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === "online" ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/40"}`}>
                <Video className="h-4 w-4" /> 온라인
              </button>
              <button type="button" onClick={() => setMode("offline")} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 text-sm font-medium transition-all ${mode === "offline" ? "border-primary bg-primary/10 text-primary" : "border-muted hover:border-primary/40"}`}>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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
                <SelectTrigger><SelectValue /></SelectTrigger>
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
            <Textarea placeholder="상담에서 다루고 싶은 내용을 간략히 적어주세요" value={note} onChange={e => setNote(e.target.value)} className="resize-none" rows={2} />
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
function ProposalCard({ proposalData, isMyMessage, currentUserId, onAccept, onReject, onCounter, onComplete }: {
  proposalData: any; isMyMessage: boolean; currentUserId: number;
  onAccept: (id: number) => void; onReject: (id: number) => void;
  onCounter: (proposal: any) => void; onComplete: (id: number) => void;
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
      <div className={`px-4 py-2 flex items-center gap-2 border-b ${statusInfo.bg}`}>
        <StatusIcon className={`h-4 w-4 ${statusInfo.color}`} />
        <span className={`text-sm font-semibold ${statusInfo.color}`}>{statusInfo.label}</span>
        {proposalData.isCounter && (
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">수정 제안</span>
        )}
      </div>
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
          <span>{proposalData.consultationMode === "online" ? "온라인" : `오프라인${proposalData.location ? ` · ${proposalData.location}` : ""}`}</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {durationLabel}</span>
          <span className="flex items-center gap-1"><ChevronRight className="h-3 w-3" /> {typeLabel}</span>
        </div>
        {proposalData.note && (
          <p className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-1">💬 {proposalData.note}</p>
        )}
      </div>
      {canAct && (
        <div className="px-4 py-3 flex gap-2 border-t bg-white/60">
          <Button size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => onAccept(proposalData.proposalId)}>
            <ThumbsUp className="h-3 w-3 mr-1" /> 수락
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50" onClick={() => onCounter(proposalData)}>
            <RefreshCw className="h-3 w-3 mr-1" /> 수정 제안
          </Button>
          <Button size="sm" variant="outline" className="flex-1 border-red-300 text-red-600 hover:bg-red-50" onClick={() => onReject(proposalData.proposalId)}>
            <ThumbsDown className="h-3 w-3 mr-1" /> 거절
          </Button>
        </div>
      )}
      {canComplete && (
        <div className="px-4 py-3 border-t bg-white/60">
          <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => onComplete(proposalData.proposalId)}>
            <Star className="h-3 w-3 mr-1" /> 상담 완료 처리
          </Button>
        </div>
      )}
    </div>
  );
}

// ===== 상태 메시지 배너 =====
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
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");
  const [emojiPickerMessageId, setEmojiPickerMessageId] = useState<number | null>(null);
  const [messageSearch, setMessageSearch] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
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

  // 타이핑 상태 조회 (3초마다)
  const { data: typingStatus } = trpc.message.getTyping.useQuery(
    { partnerId: selectedConversation || 0 },
    { enabled: isAuthenticated && selectedConversation !== null, refetchInterval: 3000 }
  );

  // 메시지 반응 조회
  const messageIds = useMemo(() => {
    if (!conversation) return [];
    return (conversation as any[]).map((m: any) => m.id).filter(Boolean);
  }, [conversation]);

  const { data: reactions } = trpc.message.getReactions.useQuery(
    { messageIds },
    { enabled: messageIds.length > 0, refetchInterval: 5000 }
  );

  // 자동 스크롤 기능 제거됨

  // 대화 열 때 읽음 처리
  useEffect(() => {
    if (selectedConversation && isAuthenticated) {
      markConversationAsReadMutation.mutate({ otherUserId: selectedConversation });
    }
  }, [selectedConversation]);

  // 타이핑 상태 전송 (디바운스)
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleTyping = useCallback(() => {
    if (!selectedConversation) return;
    setTypingMutation.mutate({ partnerId: selectedConversation, isTyping: true });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (selectedConversation) setTypingMutation.mutate({ partnerId: selectedConversation, isTyping: false });
    }, 3000);
  }, [selectedConversation]);

  // ===== Mutations =====
  const sendMessageMutation = trpc.message.send.useMutation({
    onSuccess: () => {
      setMessageContent("");
      if (textareaRef.current) textareaRef.current.style.height = "auto";
      if (selectedConversation) setTypingMutation.mutate({ partnerId: selectedConversation, isTyping: false });
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`전송 실패: ${e.message}`),
  });

  const editMessageMutation = trpc.message.editMessage.useMutation({
    onSuccess: () => {
      setEditingMessageId(null);
      setEditContent("");
      utils.message.getConversation.invalidate();
      toast.success("메시지가 수정되었습니다.");
    },
    onError: (e) => toast.error(`수정 실패: ${e.message}`),
  });

  const deleteMessageMutation = trpc.message.deleteMessage.useMutation({
    onSuccess: () => {
      utils.message.getConversation.invalidate();
      toast.success("메시지가 삭제되었습니다.");
    },
    onError: (e) => toast.error(`삭제 실패: ${e.message}`),
  });

  const toggleReactionMutation = trpc.message.toggleReaction.useMutation({
    onSuccess: () => {
      utils.message.getReactions.invalidate();
    },
    onError: (e) => toast.error(`반응 실패: ${e.message}`),
  });

  const setTypingMutation = trpc.message.setTyping.useMutation();

  const markConversationAsReadMutation = trpc.message.markConversationAsRead.useMutation({
    onSuccess: () => {
      utils.message.getInbox.invalidate();
      utils.message.getUnreadCount.invalidate();
    },
  });

  const createProposalMutation = trpc.proposal.create.useMutation({
    onSuccess: () => {
      toast.success("상담 일정을 제안했어요!");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
    },
    onError: (e) => toast.error(`제안 실패: ${e.message}`),
  });

  const [, navigate] = useLocation();
  const acceptProposalMutation = trpc.proposal.accept.useMutation({
    onSuccess: () => {
      toast.success("상담 일정이 확정되었어요! 🎉");
      utils.message.getConversation.invalidate();
      utils.message.getInbox.invalidate();
      setTimeout(() => navigate("/bookings"), 1500);
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
  };

  const handleEditSubmit = (messageId: number) => {
    if (!editContent.trim()) return;
    editMessageMutation.mutate({ messageId, content: editContent });
  };

  const handleDeleteMessage = (messageId: number) => {
    if (window.confirm("메시지를 삭제하시겠어요?")) {
      deleteMessageMutation.mutate({ messageId });
    }
  };

  const handleToggleReaction = (messageId: number, emoji: string) => {
    toggleReactionMutation.mutate({ messageId, emoji });
    setEmojiPickerMessageId(null);
  };

  const handleProposalSubmit = (data: any) => createProposalMutation.mutate(data);
  const handleCounterSubmit = (data: any) => {
    if (!counterProposalData) return;
    counterProposeMutation.mutate({ proposalId: counterProposalData.proposalId, ...data });
  };

  // ===== 대화 목록 처리 =====
  const conversations = inbox?.reduce((acc: any, msg: any) => {
    const otherId = msg.senderId === user?.id ? msg.recipientId : msg.senderId;
    if (!acc[otherId]) acc[otherId] = [];
    acc[otherId].push(msg);
    return acc;
  }, {}) || {};

  const getOtherUserName = (userId: number) => {
    // 1. 먼저 conversations[userId]에서 상대방 이름 찾기
    const msgs: any[] = conversations[userId] || [];
    if (msgs.length > 0) {
      const msg = msgs[0]; // 첫 번째 메시지 사용
      // 현재 사용자가 발신자면 recipientName 반환
      if (msg.senderId === user?.id && msg.recipientName) {
        return msg.recipientName;
      }
      // 현재 사용자가 수신자면 senderName 반환
      if (msg.recipientId === user?.id && msg.senderName) {
        return msg.senderName;
      }
    }
    
    // 2. 그 다음 selectedConversation의 메시지에서 찾기
    if (userId === selectedConversation && conversation) {
      const msgs = conversation as any[];
      if (msgs.length > 0) {
        const msg = msgs[0];
        if (msg.senderId === user?.id && msg.recipientName) {
          return msg.recipientName;
        }
        if (msg.recipientId === user?.id && msg.senderName) {
          return msg.senderName;
        }
      }
    }
    
    // 3. inbox에서 해당 userId와 관련된 메시지 찾기 (메시지 전송 전에도 이름 표시)
    if (inbox && inbox.length > 0) {
      const relevantMsg = inbox.find((msg: any) => 
        (msg.senderId === userId || msg.recipientId === userId)
      );
      if (relevantMsg) {
        if (relevantMsg.senderId === userId && relevantMsg.senderName) {
          return relevantMsg.senderName;
        }
        if (relevantMsg.recipientId === userId && relevantMsg.recipientName) {
          return relevantMsg.recipientName;
        }
      }
    }
    
    return `사용자 ${userId}`;
  };

  const getOtherUserDisplayName = (userId: number) => {
    const name = getOtherUserName(userId);
    return name.includes('멘토님') || name.includes('멘티님') ? name : `${name}님`;
  };

  const getUnreadCount = (userId: number) => {
    const msgs: any[] = conversations[userId] || [];
    return msgs.filter((m: any) => m.recipientId === user?.id && !m.isRead).length;
  };

  const filteredConversations = Object.entries(conversations).filter(([userId]: [string, any]) =>
    getOtherUserName(parseInt(userId)).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRelativeTime = (date: string | Date) => {
    try {
      const d = new Date(date);
      if (isToday(d)) return format(d, "HH:mm");
      if (isYesterday(d)) return "어제";
      return format(d, "M/d");
    } catch {
      return "";
    }
  };

  const getFullTime = (date: string | Date) => {
    try {
      return format(new Date(date), "yyyy년 M월 d일 HH:mm", { locale: ko });
    } catch { return ""; }
  };

  // 메시지 그룹화 (같은 발신자, 5분 이내)
  const groupedMessages = useMemo(() => {
    if (!conversation) return [];
    const msgs = conversation as any[];
    const filtered = messageSearch
      ? msgs.filter(m => m.content?.toLowerCase().includes(messageSearch.toLowerCase()))
      : msgs;

    const groups: { date: Date; messages: any[] }[] = [];
    let currentDate: Date | null = null;
    let currentGroup: any[] = [];

    filtered.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);
      const prevMsg = idx > 0 ? filtered[idx - 1] : null;

      // 날짜 변경 체크
      const needsDateDivider = !currentDate ||
        msgDate.toDateString() !== currentDate.toDateString();

      if (needsDateDivider) {
        if (currentGroup.length > 0) groups.push({ date: currentDate!, messages: currentGroup });
        currentDate = msgDate;
        currentGroup = [];
      }

      // 메시지 그룹화 정보 추가
      const isSameSender = prevMsg && prevMsg.senderId === msg.senderId;
      const isWithinTimeWindow = prevMsg && differenceInMinutes(msgDate, new Date(prevMsg.createdAt)) < 5;
      const isGrouped = isSameSender && isWithinTimeWindow && !needsDateDivider;

      currentGroup.push({ ...msg, isGrouped, isLast: true });
      // 이전 메시지의 isLast를 false로
      if (currentGroup.length > 1) currentGroup[currentGroup.length - 2].isLast = false;
    });

    if (currentGroup.length > 0) groups.push({ date: currentDate!, messages: currentGroup });
    return groups;
  }, [conversation, messageSearch]);

  const otherUserName = selectedConversation ? getOtherUserDisplayName(selectedConversation) : "";

  // ===== 메시지 렌더링 =====
  const renderMessage = (msg: any) => {
    const isMe = msg.senderId === user?.id;
    const msgReactions = reactions?.filter((r: any) => r.messageId === msg.id) || [];
    const isEditing = editingMessageId === msg.id;
    const showEmojiPicker = emojiPickerMessageId === msg.id;

    // proposal 타입 메시지 처리
    if (msg.messageType === "proposal") {
      let parsed: any = null;
      try { parsed = JSON.parse(msg.content); } catch {}

      if (parsed?.type === "proposal") {
        return (
          <div className={`flex ${isMe ? "justify-end" : "justify-start"} group`}>
            <div className="max-w-sm w-full">
              <p className={`text-xs mb-1 ${isMe ? "text-right" : "text-left"} text-muted-foreground`}>
                {isMe ? "상담 일정 제안을 보냈어요" : "상담 일정 제안이 도착했어요"}
              </p>
              <ProposalCard
                proposalData={{ ...parsed, receiverId: msg.recipientId }} isMyMessage={isMe} currentUserId={user?.id ?? 0}
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
          <div className="flex justify-center my-2">
            <StatusBanner statusData={{ ...parsed, receiverId: msg.recipientId }} />
          </div>
        );
      }
    }

    // 일반 텍스트 메시지
    return (
      <div className={`flex items-end gap-2 ${isMe ? "flex-row-reverse" : "flex-row"} group`}>
        {/* 아바타 (그룹화되지 않은 마지막 메시지에만 표시) */}
        {!isMe && (
          <div className={`${msg.isLast ? "opacity-100" : "opacity-0"} transition-opacity`}>
            <Avatar name={msg.senderName || ""} size="sm" />
          </div>
        )}

        <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[70%]`}>
          {/* 발신자 이름 (그룹화되지 않은 첫 메시지에만 표시) */}
          {!isMe && !msg.isGrouped && (
            <p className="text-xs text-muted-foreground mb-1 px-1">{msg.senderName}</p>
          )}

          <div className={`flex items-end gap-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
            {/* 메시지 액션 */}
            <div className="relative">
              <MessageActions
                isMe={isMe}
                onEdit={!msg.isDeleted ? () => { setEditingMessageId(msg.id); setEditContent(msg.content); } : undefined}
                onDelete={!msg.isDeleted ? () => handleDeleteMessage(msg.id) : undefined}
                onReact={() => setEmojiPickerMessageId(showEmojiPicker ? null : msg.id)}
                isDeleted={msg.isDeleted}
              />
              {showEmojiPicker && (
                <EmojiPicker
                  onSelect={(emoji) => handleToggleReaction(msg.id, emoji)}
                  onClose={() => setEmojiPickerMessageId(null)}
                />
              )}
            </div>

            <div className="flex flex-col">
              {/* 메시지 버블 */}
              {isEditing ? (
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Textarea
                    value={editContent}
                    onChange={e => setEditContent(e.target.value)}
                    className="resize-none text-sm"
                    rows={2}
                    autoFocus
                  />
                  <div className="flex gap-1 justify-end">
                    <Button size="sm" variant="outline" onClick={() => setEditingMessageId(null)}>취소</Button>
                    <Button size="sm" onClick={() => handleEditSubmit(msg.id)}>저장</Button>
                  </div>
                </div>
              ) : (
                <div
                  className={`px-3.5 py-2.5 ${
                    msg.isGrouped
                      ? isMe ? "rounded-2xl rounded-tr-md" : "rounded-2xl rounded-tl-md"
                      : isMe ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"
                  } ${
                    msg.isDeleted
                      ? "bg-muted/50 border border-dashed border-muted-foreground/30"
                      : isMe
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                  title={getFullTime(msg.createdAt)}
                >
                  <p className={`text-sm whitespace-pre-wrap break-words leading-relaxed ${msg.isDeleted ? "text-muted-foreground italic" : ""}`}>
                    {msg.content}
                  </p>
                  {msg.isEdited && !msg.isDeleted && (
                    <span className={`text-[10px] ${isMe ? "text-primary-foreground/60" : "text-muted-foreground/60"}`}> (수정됨)</span>
                  )}
                </div>
              )}

              {/* 반응 표시 */}
              {msgReactions.length > 0 && (
                <ReactionBubbles
                  reactions={msgReactions}
                  currentUserId={user?.id ?? 0}
                  messageId={msg.id}
                  onToggle={(emoji) => handleToggleReaction(msg.id, emoji)}
                />
              )}
            </div>

            {/* 시간 + 읽음 표시 (마지막 메시지에만) */}
            {msg.isLast && (
              <div className={`flex items-center gap-0.5 mb-1 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">{getRelativeTime(msg.createdAt)}</span>
                <ReadReceipt isRead={msg.isRead} isMe={isMe} />
              </div>
            )}
          </div>
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
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 flex flex-row h-[calc(100vh-100px)] md:h-[calc(100vh-120px)] gap-4 sm:gap-6">
        {/* 좌측 제목 영역 */}
        <div className="hidden sm:flex flex-col justify-start w-48 md:w-56 shrink-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">상담 신청</h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">메시지로 상담을 신청하고 상담을 확정하세요</p>
          </div>
        </div>

        {/* 우측 채팅 영역 */}
        <div className="flex-1 flex gap-2 sm:gap-4 overflow-hidden" style={{ minHeight: 0 }}>
          {/* 사이드바 */}
          <div className={`${sidebarOpen ? "w-full sm:w-80" : "w-0"} transition-all duration-300 overflow-hidden flex flex-col shrink-0`}>
            <Card className="h-full flex flex-col">
              <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-2 text-sm sm:text-base">
                  <MessageSquare className="h-4 w-4" /> 대화 목록
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-2 sm:pb-3 px-3 sm:px-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="대화 검색..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 text-xs sm:text-sm h-8 sm:h-9"
                  />
                </div>
              </CardContent>
              <CardContent className="flex-1 overflow-y-auto p-2 sm:p-3">
                {filteredConversations.length > 0 ? (
                  <div className="space-y-1">
                    {filteredConversations.map(([userId, msgs]: [string, any]) => {
                      const lastMsg = msgs[0];
                      const isSelected = parseInt(userId) === selectedConversation;
                      const unreadCount = getUnreadCount(parseInt(userId));
                      let preview = lastMsg.content;
                      if (lastMsg.isDeleted) preview = "삭제된 메시지";
                      else if (lastMsg.messageType === "proposal") {
                        try {
                          const p = JSON.parse(lastMsg.content);
                          if (p.type === "proposal") preview = "📅 상담 일정 제안";
                          else if (p.type === "proposal_status") preview = p.message;
                        } catch {}
                      }
                      const name = getOtherUserName(parseInt(userId));
                      return (
                        <button
                          key={userId}
                          onClick={() => {
                            setSelectedConversation(parseInt(userId));
                            if (window.innerWidth < 1024) setSidebarOpen(false);
                          }}
                          className={`w-full text-left p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm ${isSelected ? "bg-primary/10 border-2 border-primary" : "hover:bg-muted/60 border-2 border-transparent"}`}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <Avatar name={name} size="sm" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className={`font-semibold truncate ${unreadCount > 0 ? "text-foreground" : "text-foreground/80"}`}>{name}</p>
                                <span className="text-[10px] text-muted-foreground shrink-0">{getRelativeTime(lastMsg.createdAt)}</span>
                              </div>
                              <div className="flex items-center justify-between gap-1 mt-0.5">
                                <p className={`text-xs truncate ${unreadCount > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}>{preview}</p>
                                {unreadCount > 0 && (
                                  <span className="shrink-0 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                                    {unreadCount > 99 ? "99+" : unreadCount}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
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
            <div className="mb-2 sm:mb-3 flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className="sm:hidden h-8 w-8 p-0">
                {sidebarOpen ? <XIcon className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>

            {selectedConversation ? (
              <Card className="flex flex-col overflow-hidden flex-1" style={{ minHeight: 0 }}>
                {/* 채팅 헤더 */}
                <CardHeader className="border-b shrink-0 py-2 sm:py-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <Avatar name={getOtherUserName(selectedConversation || 0)} size="sm" />
                      <div>
                        <CardTitle className="text-sm sm:text-base">{otherUserName}</CardTitle>
                        {typingStatus?.isTyping && (
                          <p className="text-xs text-muted-foreground">입력 중...</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowMessageSearch(!showMessageSearch)}
                        className={`h-8 w-8 p-0 ${showMessageSearch ? "bg-muted" : ""}`}
                      >
                        <Search className="h-4 w-4" />
                      </Button>
                      <Link href="/mentors" className="hidden sm:block">
                        <Button variant="outline" size="sm" className="text-xs sm:text-sm h-8 sm:h-9">멘토 목록</Button>
                      </Link>
                    </div>
                  </div>
                  {/* 메시지 내 검색 */}
                  {showMessageSearch && (
                    <div className="mt-2 relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="대화 내 검색..."
                        value={messageSearch}
                        onChange={e => setMessageSearch(e.target.value)}
                        className="pl-9"
                        autoFocus
                      />
                    </div>
                  )}
                </CardHeader>

                {/* 메시지 목록 */}
                <div className="flex-1 overflow-y-auto p-2 sm:p-4" style={{ minHeight: 0 }}>
                  {groupedMessages.length > 0 ? (
                    <div className="space-y-1">
                      {groupedMessages.map((group, gIdx) => (
                        <div key={gIdx}>
                          <DateDivider date={group.date} />
                          <div className="space-y-1">
                            {group.messages.map((msg, mIdx) => (
                              <div key={msg.id || mIdx} className={`${msg.isGrouped ? "mt-0.5" : "mt-3"}`}>
                                {renderMessage(msg)}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {/* 타이핑 표시기 */}
                      {typingStatus?.isTyping && (
                        <TypingIndicator name={otherUserName} />
                      )}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageSquare className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
                        <p className="text-muted-foreground text-sm">
                          {messageSearch ? "검색 결과가 없습니다." : "아직 메시지가 없습니다.\n상담 일정을 제안해보세요!"}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 입력 영역 */}
                <CardContent className="border-t pt-2 sm:pt-3 pb-2 sm:pb-3 shrink-0 space-y-2 px-2 sm:px-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 text-primary border-primary/30 hover:bg-primary/5 text-xs sm:text-sm h-8 sm:h-9"
                    onClick={() => setShowProposalForm(true)}
                  >
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                    상담 일정 제안
                  </Button>
                  <div className="flex gap-1 sm:gap-2 items-end">
                    <textarea
                      ref={textareaRef}
                      placeholder="메시지 입력..."
                      value={messageContent}
                      onChange={e => {
                        setMessageContent(e.target.value);
                        adjustTextareaHeight();
                        handleTyping();
                      }}
                      onKeyDown={e => { if (e.key === "Enter" && e.ctrlKey) handleSendMessage(); }}
                      className="resize-none flex-1 px-2 sm:px-3 py-2 rounded-lg border text-xs sm:text-sm bg-background"
                      style={{ minHeight: "36px", maxHeight: "120px" }}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={messageContent.trim() === "" || sendMessageMutation.isPending}
                      size="sm"
                      className="h-9 w-9 sm:h-10 sm:w-10 p-0 flex-shrink-0"
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

      {showProposalForm && selectedConversation && (
        <ProposalFormDialog
          open={showProposalForm}
          onClose={() => setShowProposalForm(false)}
          onSubmit={handleProposalSubmit}
          receiverId={selectedConversation}
        />
      )}

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
