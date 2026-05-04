import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function DeleteAccount() {
  const [location, navigate] = useLocation();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const deleteAccountMutation = trpc.auth.deleteAccount.useMutation();

  const handleDeleteAccount = async () => {
    if (!isConfirmed) {
      toast.error("계정 삭제를 확인해주세요");
      return;
    }

    setIsLoading(true);
    try {
      await deleteAccountMutation.mutateAsync();
      toast.success("계정이 삭제되었습니다");
      // 홈페이지로 리다이렉트
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (error) {
      toast.error("계정 삭제에 실패했습니다");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          돌아가기
        </button>

                {/* 단계별 안내 */}
        <div className="mb-8 space-y-4">
          <h2 className="text-lg font-semibold">계정 탈퇴 절차</h2>
          <div className="space-y-3">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">1</div>
              <div>
                <p className="font-medium">탈퇴 정보 확인</p>
                <p className="text-sm text-muted-foreground">아래에서 삭제될 데이터를 확인하세요</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">2</div>
              <div>
                <p className="font-medium">동의 체크박스</p>
                <p className="text-sm text-muted-foreground">탈퇴에 동의하는 체크박스를 체크하세요</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-semibold">3</div>
              <div>
                <p className="font-medium">계정 삭제 실행</p>
                <p className="text-sm text-muted-foreground">아래 단추를 눌러 계정을 완전히 삭제합니다</p>
              </div>
            </div>
          </div>
        </div>

<Card className="border-destructive/50">
          <CardHeader>
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-destructive mt-1 flex-shrink-0" />
              <div>
                <CardTitle className="text-destructive">계정 삭제</CardTitle>
                <CardDescription>이 작업은 되돌릴 수 없습니다</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 space-y-3">
              <p className="font-semibold text-sm">계정을 삭제하면 다음이 삭제됩니다:</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>모든 개인 정보 및 프로필</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>예약 및 상담 기록</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>메시지 및 알림</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>멘토 프로필 및 갤러리</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-destructive mt-1">•</span>
                  <span>모든 리뷰 및 평가</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isConfirmed}
                  onChange={(e) => setIsConfirmed(e.target.checked)}
                  className="mt-1"
                />
                <span className="text-sm">
                  위의 모든 내용을 이해했으며, 계정 삭제에 동의합니다.
                </span>
              </label>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => window.history.back()}
                disabled={isLoading}
              >
                취소
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={!isConfirmed || isLoading}
                className="flex-1"
              >
                {isLoading ? "삭제 중..." : "계정 삭제"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
