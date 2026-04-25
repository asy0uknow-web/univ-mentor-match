import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BugReportModal({ isOpen, onClose }: BugReportModalProps) {
  const { isAuthenticated } = useAuth({ redirectOnUnauthenticated: false });
  const [, setLocation] = useLocation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [device, setDevice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const bugReportMutation = trpc.bugReport.create.useMutation();

  // 로그인하지 않은 사용자가 모달을 열려고 하면 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (isOpen && !isAuthenticated) {
      onClose();
      setLocation('/login');
    }
  }, [isOpen, isAuthenticated, onClose, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      alert("제목과 설명을 입력해주세요.");
      return;
    }

    if (description.length < 10) {
      alert("설명은 최소 10자 이상이어야 합니다.");
      return;
    }

    setIsLoading(true);

    try {
      await bugReportMutation.mutateAsync({
        title,
        description,
        device: device.trim() || undefined,
      });

      setSubmitted(true);

      setTimeout(() => {
        setTitle("");
        setDescription("");
        setDevice("");
        setSubmitted(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error("버그 신고 실패:", error);
      alert("버그 신고에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !isAuthenticated) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card  rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border 700 700">
          <h2 className="text-xl font-bold">버그 신고</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-green-600 dark:text-green-400 text-lg font-semibold mb-2">완료!</div>
              <p className="text-muted-foreground 300 300">버그 신고가 접수되었습니다.</p>
              <p className="text-sm text-muted-foreground mt-2">감사합니다!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">제목 *</label>
                <Input
                  type="text"
                  placeholder="버그의 제목을 입력해주세요"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">설명 *</label>
                <Textarea
                  placeholder="버그의 상세한 설명을 입력해주세요 (최소 10자)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isLoading}
                  required
                  minLength={10}
                  rows={4}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">{description.length}/10자 이상 필요</p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">사용 기기 *</label>
                <Input
                  type="text"
                  placeholder="ex) 맥북, 데스크탑, 아이패드, 갤럭시탭, ..."
                  value={device}
                  onChange={(e) => setDevice(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || !title.trim() || description.length < 10 || !device.trim()}
                  className="flex-1"
                >
                  {isLoading ? "신고 중..." : "신고하기"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1"
                >
                  취소
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
