import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BugReportForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [page, setPage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const bugReportMutation = trpc.bugReport.create.useMutation();

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
        severity,
        page: page || undefined,
      });

      setSubmitted(true);
      setTitle("");
      setDescription("");
      setSeverity("medium");
      setPage("");

      setTimeout(() => setSubmitted(false), 3000);
    } catch (error) {
      console.error("버그 신고 실패:", error);
      alert("버그 신고에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">버그 신고</h2>
      </div>

      {submitted && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
          ✓ 버그 신고가 접수되었습니다. 감사합니다!
        </div>
      )}

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
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-1">
            {description.length}/10자 이상 필요
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">심각도</label>
            <Select value={severity} onValueChange={(v: any) => setSeverity(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">낮음</SelectItem>
                <SelectItem value="medium">중간</SelectItem>
                <SelectItem value="high">높음</SelectItem>
                <SelectItem value="critical">긴급</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">페이지 (선택)</label>
            <Input
              type="text"
              placeholder="예: /mentors, /my-profile"
              value={page}
              onChange={(e) => setPage(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading || !title.trim() || description.length < 10}
          className="w-full"
        >
          {isLoading ? "신고 중..." : "버그 신고"}
        </Button>
      </form>
    </div>
  );
}
