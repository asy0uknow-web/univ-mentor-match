import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Upload, CheckCircle, AlertCircle, Clock, X } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function VerifyMentor() {
  const { user, isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: verification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const uploadStudentIdMutation = trpc.verification.uploadStudentId.useMutation({
    onSuccess: (data) => {
      toast.success("학생증 이미지가 S3에 업로드되었습니다.");
      submitVerificationMutation.mutate({
        studentIdImageUrl: data.imageUrl,
      });
    },
    onError: (error) => {
      toast.error(`업로드 실패: ${error.message}`);
    },
  });

  const submitVerificationMutation = trpc.verification.submitVerification.useMutation({
    onSuccess: () => {
      toast.success("인증 요청이 제출되었습니다. 관리자 검토를 기다려주세요.");
      setSelectedFile(null);
      setPreviewUrl(null);
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
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("학생증 이미지를 선택해주세요.");
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Data = (e.target?.result as string).split(",")[1];
        if (base64Data) {
          await uploadStudentIdMutation.mutateAsync({
            fileData: base64Data,
            fileName: selectedFile.name,
            mimeType: selectedFile.type,
          });
        }
      };
      reader.readAsDataURL(selectedFile);
    } catch (error) {
      toast.error("파일 읽기에 실패했습니다.");
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
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
              <Link href="/my-profile">
                <Button variant="ghost">내 프로필</Button>
              </Link>
              <Link href="/bookings">
                <Button variant="ghost">상담 문의</Button>
              </Link>
              <Link href="/notifications">
                <Button variant="ghost">알림</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">멘토 인증</h1>

          {verification && (
            <Card className="mb-6 border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-base">
                  <span>현재 인증 상태</span>
                  <div className="flex items-center gap-2">
                    {verification.status === "approved" && (
                      <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span className="text-sm font-normal text-green-700">인증됨</span>
                      </>
                    )}
                    {verification.status === "pending" && (
                      <>
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <span className="text-sm font-normal text-yellow-700">검토 중</span>
                      </>
                    )}
                    {verification.status === "rejected" && (
                      <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-sm font-normal text-red-700">거부됨</span>
                      </>
                    )}
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm text-blue-900">
                  {verification.status === "approved" && "당신의 멘토 프로필이 인증되었습니다."}
                  {verification.status === "pending" && "당신의 인증 요청이 검토 중입니다."}
                  {verification.status === "rejected" && `인증이 거부되었습니다. 사유: ${verification.adminNotes || "명시되지 않음"}`}
                </p>
              </CardContent>
            </Card>
          )}

          {!verification || verification.status === "rejected" ? (
            <Card>
              <CardHeader>
                <CardTitle>학생증 인증</CardTitle>
                <CardDescription>
                  멘토로 활동하기 위해 현재 재학 중인 학과의 학생증을 업로드해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="student-id">학생증 이미지</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                    <input
                      id="student-id"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="student-id" className="cursor-pointer">
                      <Upload className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">클릭하여 파일을 선택하거나 드래그하여 업로드</p>
                      <p className="text-xs text-muted-foreground mt-1">JPG, PNG, GIF, WebP (최대 5MB)</p>
                    </label>
                  </div>
                </div>

                {previewUrl && (
                  <div className="space-y-3">
                    <Label>미리보기</Label>
                    <div className="relative border border-border rounded-lg overflow-hidden">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-64 object-cover" />
                      <button
                        onClick={handleClearFile}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      파일명: {selectedFile?.name}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleSubmit}
                  disabled={!selectedFile || uploadStudentIdMutation.isPending || submitVerificationMutation.isPending}
                  className="w-full"
                >
                  {uploadStudentIdMutation.isPending || submitVerificationMutation.isPending
                    ? "업로드 중..."
                    : "학생증 인증 신청"}
                </Button>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-900">
                    <strong>주의:</strong> 학생증 이미지는 S3 클라우드 저장소에 안전하게 저장되며, 관리자만 접근할 수 있습니다.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>인증 완료</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 text-green-700">
                  <CheckCircle className="h-6 w-6" />
                  <p>당신의 멘토 프로필이 인증되었습니다!</p>
                </div>
                <Link href="/my-profile">
                  <Button variant="outline" className="w-full">
                    프로필 보기
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
