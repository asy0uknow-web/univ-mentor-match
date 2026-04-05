import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ShieldCheck, ShieldAlert, Clock, Upload, X, Loader2, ArrowLeft, Shield, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { PageLayout } from "@/components/layout";

export default function VerifyMentor() {
  const { isAuthenticated } = useAuth();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const utils = trpc.useUtils();

  const { data: verification, refetch: refetchVerification } = trpc.verification.getMyVerification.useQuery(undefined, {
    enabled: isAuthenticated,
    refetchInterval: (data: any) => data?.status === "pending" ? 30000 : false,
  });

  const uploadStudentIdMutation = trpc.verification.uploadStudentId.useMutation({
    onSuccess: (data) => {
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
      utils.verification.getMyVerification.invalidate();
    },
    onError: (error) => {
      toast.error(`인증 제출 실패: ${error.message}`);
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = (file: File) => {
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
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
    if (!selectedFile) {
      toast.error("학적내역 캡처 이미지를 선택해주세요.");
      return;
    }
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
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <Card className="max-w-md shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center mb-3">
              <Shield className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle className="text-xl">로그인이 필요합니다</CardTitle>
            <CardDescription>인증을 하려면 로그인해주세요.</CardDescription>
          </CardHeader>
          <CardContent>
            <a href={getLoginUrl()}>
              <Button className="w-full bg-green-600 hover:bg-green-700">로그인</Button>
            </a>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isLoading = uploadStudentIdMutation.isPending || submitVerificationMutation.isPending;

  return (
    <PageLayout>
      <div className="min-h-screen bg-gradient-to-tr from-green-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">

            {/* 헤더 */}
            <div className="mb-8">
              <Link href="/my-profile">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                  <ArrowLeft className="h-4 w-4" />
                  프로필로 돌아가기
                </button>
              </Link>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
                  <Shield className="h-5 w-5 text-green-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900">멘토 인증</h1>
              </div>
              <p className="text-gray-500 text-sm">
                대학 포털 사이트의 학적내역을 캡처하여 업로드해주세요.
              </p>
            </div>

            {/* [오류4 수정] 인증 상태별 정확한 카드 표시 */}
            {/* 승인 완료 상태 */}
            {verification?.status === "approved" && (
              <Card className="mb-5 border-green-200 bg-green-50 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-green-800">인증 완료</span>
                        <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">승인됨</Badge>
                      </div>
                      <p className="text-sm text-green-700 mb-3">
                        학적내역 인증이 완료되었습니다. 이제 멘토로 활동할 수 있습니다.
                      </p>
                      <p className="text-xs text-green-600">
                        승인일: {new Date(verification.updatedAt || verification.createdAt).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 검토 중 상태 */}
            {verification?.status === "pending" && (
              <Card className="mb-5 border-amber-200 bg-amber-50 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-amber-800">검토 중</span>
                        <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100">대기 중</Badge>
                      </div>
                      <p className="text-sm text-amber-700 mb-2">
                        인증 서류가 제출되었습니다. 관리자 검토 후 승인됩니다.
                      </p>
                      <p className="text-xs text-amber-600 mb-3">
                        제출일: {new Date(verification.createdAt).toLocaleDateString("ko-KR")} · 보통 1~2 영업일 소요
                      </p>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-100"
                        onClick={() => refetchVerification()}
                      >
                        상태 새로고침
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 거부 상태 */}
            {verification?.status === "rejected" && (
              <Card className="mb-5 border-red-200 bg-red-50 shadow-sm">
                <CardContent className="pt-5">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                      <ShieldAlert className="h-5 w-5 text-red-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-red-800">인증 거부</span>
                        <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100">거부됨</Badge>
                      </div>
                      <p className="text-sm text-red-700 mb-2">
                        인증이 거부되었습니다. 아래 사유를 확인하고 다시 신청해주세요.
                      </p>
                      {verification.adminNotes && (
                        <div className="bg-red-100 border border-red-200 rounded-lg px-3 py-2">
                          <p className="text-xs font-medium text-red-700 mb-0.5">거부 사유</p>
                          <p className="text-sm text-red-800">{verification.adminNotes}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* [오류4 수정] pending 상태에서는 업로드 폼 숨김, approved 상태에서도 숨김 */}
            {/* 업로드 폼: 미인증 또는 거부 상태에서만 표시 */}
            {(!verification || verification.status === "rejected") && (
              <Card className="shadow-sm border-0 bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">학적내역 캡처 업로드</CardTitle>
                  <CardDescription>
                    대학 포털 사이트에서 학적내역을 캡처하여 업로드해주세요. (개인정보는 가려주세요)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {/* 개인정보 보호 안내 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <div className="flex gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-blue-900 mb-1">개인정보 보호 안내</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• <strong>가려야 할 정보</strong>: 주민등록번호, 계좌번호, 주소</li>
                          <li>• <strong>보이는 정보</strong>: 이름, 학번, 학적상태, 학년, 전공</li>
                          <li>• 인증 후 제출된 이미지는 안전하게 보관되며, 인증 목적으로만 사용됩니다</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* 업로드 영역 */}
                  <div>
                    <Label className="text-sm font-medium mb-2 block">
                      학적내역 캡처 이미지 <span className="text-red-500">*</span>
                    </Label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                        dragActive
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <input
                        id="student-id"
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="student-id" className="cursor-pointer block">
                        <Upload className={`h-10 w-10 mx-auto mb-3 ${dragActive ? "text-green-500" : "text-gray-400"}`} />
                        <p className="text-sm font-medium text-gray-700">
                          클릭하거나 드래그하여 업로드
                        </p>
                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF, WebP · 최대 5MB</p>
                        <p className="text-xs text-gray-500 mt-2 font-medium">💡 팁: 대학 포털에서 학적내역 페이지를 스크린샷하면 됩니다</p>
                      </label>
                    </div>
                  </div>

                  {/* 미리보기 */}
                  {previewUrl && (
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">미리보기</Label>
                      <div className="relative rounded-xl overflow-hidden border border-gray-200">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full h-auto max-h-64 object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                          className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-lg shadow-sm hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500">파일명: {selectedFile?.name}</p>
                    </div>
                  )}

                  {/* 제출 버튼 */}
                  <Button
                    onClick={handleSubmit}
                    disabled={!selectedFile || isLoading}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-2" />업로드 중...</>
                    ) : (
                      verification?.status === "rejected" ? "재신청하기" : "학생증 인증 신청"
                    )}
                  </Button>

                  {/* 안내 메시지 */}
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">개인정보 안내</p>
                        <p className="text-xs text-amber-700">
                          학적내역 이미지는 암호화된 클라우드 저장소에 안전하게 보관되며, 인증 목적으로만 사용됩니다. 관리자 외에는 접근할 수 없습니다.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 승인 완료 상태: 프로필 이동 버튼 */}
            {verification?.status === "approved" && (
              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="h-8 w-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">인증이 완료되었습니다!</h3>
                    <p className="text-sm text-gray-500 mb-5">
                      이제 멘토로서 학생들을 도울 수 있습니다.
                    </p>
                    <Link href="/my-profile">
                      <Button className="bg-green-600 hover:bg-green-700">
                        멘토 프로필 보기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 검토 중 상태: 대기 안내 */}
            {verification?.status === "pending" && (
              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="pt-6 pb-6">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-100 flex items-center justify-center mx-auto mb-4">
                      <Clock className="h-8 w-8 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">검토를 기다리고 있습니다</h3>
                    <p className="text-sm text-gray-500 mb-5">
                      관리자가 제출된 학생증을 검토하고 있습니다. 승인되면 알림을 받게 됩니다.
                    </p>
                    <Link href="/my-profile">
                      <Button variant="outline">
                        프로필로 돌아가기
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </PageLayout>
  );
}
