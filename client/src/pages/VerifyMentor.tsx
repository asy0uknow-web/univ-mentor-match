import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Upload, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function VerifyMentor() {
  const { user, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const { data: verification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const submitVerificationMutation = trpc.verification.submitVerification.useMutation({
    onSuccess: () => {
      toast.success("인증 요청이 제출되었습니다. 관리자 검토를 기다려주세요.");
      setSelectedFile(null);
    },
    onError: (error) => {
      toast.error(`인증 제출 실패: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("파일 크기는 5MB 이하여야 합니다.");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("이미지 파일만 업로드 가능합니다.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("학생증 이미지를 선택해주세요.");
      return;
    }

    setIsUploading(true);
    try {
      // In a real app, you would upload to S3 here
      // For now, we'll use a placeholder URL
      const imageUrl = URL.createObjectURL(selectedFile);
      
      await submitVerificationMutation.mutateAsync({
        studentIdImageUrl: imageUrl,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>인증을 하려면 로그인해주세요.</CardDescription>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">멘토 인증</h1>

          {verification ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {verification.status === "approved" && (
                    <>
                      <CheckCircle className="h-6 w-6 text-green-500" />
                      인증 완료
                    </>
                  )}
                  {verification.status === "pending" && (
                    <>
                      <Clock className="h-6 w-6 text-yellow-500" />
                      인증 대기 중
                    </>
                  )}
                  {verification.status === "rejected" && (
                    <>
                      <AlertCircle className="h-6 w-6 text-red-500" />
                      인증 거부됨
                    </>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>상태</Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    {verification.status === "approved" && "당신의 멘토 프로필이 인증되었습니다."}
                    {verification.status === "pending" && "관리자가 당신의 인증 요청을 검토 중입니다."}
                    {verification.status === "rejected" && "인증이 거부되었습니다. 아래 사유를 확인하세요."}
                  </p>
                </div>

                {verification.status === "rejected" && verification.adminNotes && (
                  <div>
                    <Label>거부 사유</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {verification.adminNotes}
                    </p>
                  </div>
                )}

                <div className="text-xs text-muted-foreground">
                  신청일: {new Date(verification.createdAt).toLocaleDateString("ko-KR")}
                </div>

                {verification.status === "rejected" && (
                  <Button onClick={() => setSelectedFile(null)} className="w-full">
                    다시 인증하기
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>학과 재학 인증</CardTitle>
                <CardDescription>
                  멘토로 활동하기 위해 현재 학과에 재학 중임을 인증해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>인증 방법:</strong> 학생증 사진을 업로드해주세요. 학생증에는 다음 정보가 명확하게 보여야 합니다:
                  </p>
                  <ul className="text-sm text-blue-900 mt-2 ml-4 space-y-1 list-disc">
                    <li>대학교명</li>
                    <li>학과명</li>
                    <li>학년</li>
                    <li>본인 사진</li>
                  </ul>
                </div>

                <div>
                  <Label htmlFor="studentId">학생증 이미지</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          다른 파일 선택
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
                        <div>
                          <Label
                            htmlFor="fileInput"
                            className="text-sm font-medium cursor-pointer text-primary hover:underline"
                          >
                            파일을 선택하거나 여기에 드래그하세요
                          </Label>
                          <Input
                            id="fileInput"
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">
                          PNG, JPG, GIF (최대 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <strong>주의:</strong> 학생증에 개인정보가 노출되지 않도록 주의하세요.
                    필요한 정보만 명확하게 보이도록 촬영해주세요.
                  </p>
                </div>

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || isUploading || submitVerificationMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {isUploading || submitVerificationMutation.isPending
                    ? "업로드 중..."
                    : "인증 신청"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
