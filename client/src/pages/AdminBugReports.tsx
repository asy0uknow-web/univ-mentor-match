import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import { trpc } from "@/lib/trpc";

const severityColors = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const severityLabels = {
  low: "낮음",
  medium: "중간",
  high: "높음",
  critical: "긴급",
};

const statusLabels = {
  new: "신규",
  acknowledged: "확인됨",
  in_progress: "진행중",
  resolved: "해결됨",
  wont_fix: "해결 안함",
};

export default function AdminBugReports() {
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const { data: bugReports, isLoading, refetch } = trpc.bugReport.getAll.useQuery({
    status: statusFilter as any,
  });

  const updateStatusMutation = trpc.bugReport.updateStatus.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleStatusChange = (reportId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: reportId,
      status: newStatus as any,
    });
  };

  if (isLoading) {
    return <div className="p-8 text-center">로딩 중...</div>;
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">버그 신고 관리</h1>
          <p className="text-muted-foreground">사용자가 신고한 버그를 관리하세요</p>
        </div>

        <div className="flex gap-4">
          <Select value={statusFilter || ""} onValueChange={(v) => setStatusFilter(v || undefined)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="상태 필터링" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">모든 상태</SelectItem>
              <SelectItem value="new">신규</SelectItem>
              <SelectItem value="acknowledged">확인됨</SelectItem>
              <SelectItem value="in_progress">진행중</SelectItem>
              <SelectItem value="resolved">해결됨</SelectItem>
              <SelectItem value="wont_fix">해결 안함</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {bugReports && bugReports.length > 0 ? (
            bugReports.map((report: any) => (
              <Card key={report.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <Badge className={severityColors[report.severity as keyof typeof severityColors]}>
                          {severityLabels[report.severity as keyof typeof severityLabels]}
                        </Badge>
                      </div>
                      <CardDescription>
                        신고자: {report.userId} | 신고일: {new Date(report.createdAt).toLocaleString("ko-KR")}
                      </CardDescription>
                    </div>
                    <Select value={report.status} onValueChange={(v) => handleStatusChange(report.id, v)}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">신규</SelectItem>
                        <SelectItem value="acknowledged">확인됨</SelectItem>
                        <SelectItem value="in_progress">진행중</SelectItem>
                        <SelectItem value="resolved">해결됨</SelectItem>
                        <SelectItem value="wont_fix">해결 안함</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">설명</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.description}</p>
                  </div>
                  {report.page && (
                    <div>
                      <p className="text-sm font-medium mb-1">페이지</p>
                      <p className="text-sm text-muted-foreground">{report.page}</p>
                    </div>
                  )}
                  {report.adminNotes && (
                    <div>
                      <p className="text-sm font-medium mb-1">관리자 메모</p>
                      <p className="text-sm text-muted-foreground">{report.adminNotes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                신고된 버그가 없습니다.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
