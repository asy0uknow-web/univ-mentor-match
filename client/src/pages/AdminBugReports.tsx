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
import { AlertCircle, CheckCircle, Clock, Bug, CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { setPageMeta, PAGE_META } from "@/lib/seo";



const statusLabels = {
  new: "신규",
  acknowledged: "확인됨",
  in_progress: "진행중",
  resolved: "해결됨",
  wont_fix: "해결 안함",
};

const statusColors = {
  new: "bg-slate-50 text-slate-700 border border-slate-200",
  acknowledged: "bg-blue-50 text-blue-700 border border-blue-200",
  in_progress: "bg-purple-50 text-purple-700 border border-purple-200",
  resolved: "bg-green-50 text-green-700 border border-green-200",
  wont_fix: "bg-slate-50 900 text-gray-700 border border-gray-200 700 700",
};

const statusIcons: Record<string, React.ReactNode> = {
  new: <AlertCircle className="w-4 h-4" />,
  acknowledged: <Clock className="w-4 h-4" />,
  in_progress: <Clock className="w-4 h-4" />,
  resolved: <CheckCircle2 className="w-4 h-4" />,
  wont_fix: <XCircle className="w-4 h-4" />,
};

export default function AdminBugReports() {

  useEffect(() => {
    setPageMeta(PAGE_META.adminBugReports);
  }, []);
  const [statusFilter, setStatusFilter] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const { data: bugReports, isLoading, refetch } = trpc.bugReport.getAll.useQuery({
    status: statusFilter as any,
  });

  const sortedReports = bugReports ? [...bugReports].sort((a, b) => {
    if (sortBy === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    } else if (sortBy === "oldest") {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return 0;
  }) : [];

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

        <div className="flex gap-4 flex-wrap">
          <Select value={statusFilter || "all"} onValueChange={(v) => setStatusFilter(v === "all" ? undefined : v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="상태 필터링" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="new">신규</SelectItem>
              <SelectItem value="acknowledged">확인됨</SelectItem>
              <SelectItem value="in_progress">진행중</SelectItem>
              <SelectItem value="resolved">해결됨</SelectItem>
              <SelectItem value="wont_fix">해결 안함</SelectItem>
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="정렬" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">최신순</SelectItem>
              <SelectItem value="oldest">오래된순</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground flex items-center">
            총 {bugReports?.length || 0}건
          </div>
        </div>

        <div className="space-y-4">
          {sortedReports && sortedReports.length > 0 ? (
            sortedReports.map((report: any) => (
              <Card key={report.id} className="hover:shadow-md  transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <Bug className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                        <CardTitle className="text-lg break-words">{report.title}</CardTitle>
                      </div>
                      <CardDescription className="text-xs">
                        신고자: {report.userId} • {new Date(report.createdAt).toLocaleString("ko-KR")}
                      </CardDescription>
                    </div>
                    <div className="flex-shrink-0">
                      <Select value={report.status} onValueChange={(v) => handleStatusChange(report.id, v)}>
                        <SelectTrigger className="w-[140px]">
                          <div className="flex items-center gap-2">
                            {statusIcons[report.status]}
                            <span>{statusLabels[report.status as keyof typeof statusLabels]}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">
                            <div className="flex items-center gap-2">
                              {statusIcons.new}
                              <span>신규</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="acknowledged">
                            <div className="flex items-center gap-2">
                              {statusIcons.acknowledged}
                              <span>확인됨</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="in_progress">
                            <div className="flex items-center gap-2">
                              {statusIcons.in_progress}
                              <span>진행중</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="resolved">
                            <div className="flex items-center gap-2">
                              {statusIcons.resolved}
                              <span>해결됨</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="wont_fix">
                            <div className="flex items-center gap-2">
                              {statusIcons.wont_fix}
                              <span>해결 안함</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <div className="bg-muted/30 p-3 rounded-md">
                    <p className="text-xs font-medium text-muted-foreground mb-1">설명</p>
                    <p className="text-sm text-foreground whitespace-pre-wrap line-clamp-3">{report.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">상태</p>
                      <Badge className={statusColors[report.status as keyof typeof statusColors]}>
                        {statusLabels[report.status as keyof typeof statusLabels]}
                      </Badge>
                    </div>
                  </div>
                  {report.adminNotes && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
                      <p className="text-xs font-medium text-blue-900 mb-1">관리자 메모</p>
                      <p className="text-sm text-blue-800">{report.adminNotes}</p>
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
