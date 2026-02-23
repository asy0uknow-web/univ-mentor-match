import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PageLayout } from "@/components/layout";
import { setPageMeta, PAGE_META } from "@/lib/seo";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { User, Lock, Edit2, Loader2 } from "lucide-react";

export default function MyProfile() {
  useEffect(() => {
    setPageMeta(PAGE_META.profile);
  }, []);

  const { user, isAuthenticated } = useAuth();
  const [nickname, setNickname] = useState("");
  const [realName, setRealName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);

  // 개인정보 조회
  const { data: profile, isLoading } = trpc.user.getProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // 프로필 업데이트 mutation
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다!");
      setIsEditingProfile(false);
      setRealName("");
      setPhoneNumber("");
    },
    onError: (error) => {
      toast.error(`프로필 업데이트 실패: ${error.message}`);
    },
  });

  // 닉네임 변경 mutation
  const changeNicknameMutation = trpc.user.changeNickname.useMutation({
    onSuccess: () => {
      toast.success("닉네임이 변경되었습니다!");
      setIsEditingNickname(false);
      setNickname("");
    },
    onError: (error) => {
      toast.error(`닉네임 변경 실패: ${error.message}`);
    },
  });

  // 비밀번호 변경 mutation
  const changePasswordMutation = trpc.user.changePassword.useMutation({
    onSuccess: () => {
      toast.success("비밀번호 변경 요청이 처리되었습니다!");
      setIsEditingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(`비밀번호 변경 실패: ${error.message}`);
    },
  });

  const handleUpdateProfile = () => {
    const updates: Record<string, string> = {};
    if (realName.trim()) updates.realName = realName.trim();
    if (phoneNumber.trim()) updates.phoneNumber = phoneNumber.trim();
    
    if (Object.keys(updates).length === 0) {
      toast.error("변경할 정보를 입력해주세요");
      return;
    }
    
    updateProfileMutation.mutate(updates as any);
  };

  const handleChangeNickname = () => {
    if (!nickname.trim()) {
      toast.error("닉네임을 입력해주세요");
      return;
    }
    changeNicknameMutation.mutate({ nickname });
  };

  const handleChangePassword = () => {
    if (!currentPassword.trim()) {
      toast.error("현재 비밀번호를 입력해주세요");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("새 비밀번호를 입력해주세요");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("새 비밀번호는 최소 8자 이상이어야 합니다");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("새 비밀번호가 일치하지 않습니다");
      return;
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
      confirmPassword,
    });
  };

  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className="container mx-auto px-4 py-12">
          <p className="text-center text-muted-foreground">로그인이 필요합니다</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">내 정보</h1>

          {isLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : (
            <>
              {/* 개인정보 표시 섹션 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    개인정보
                  </CardTitle>
                  <CardDescription>
                    계정 정보를 확인하고 관리하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 이름 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">이름</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{profile?.name || "설정되지 않음"}</p>
                    </div>
                  </div>

                  {/* 아이디 (openId) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">아이디</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm font-mono text-xs break-all">
                        {profile?.openId || "설정되지 않음"}
                      </p>
                    </div>
                  </div>

                  {/* 이메일 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">이메일</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{profile?.email || "설정되지 않음"}</p>
                    </div>
                  </div>

                  {/* 로그인 방식 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">로그인 방식</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        {profile?.loginMethod === "oauth" ? "OAuth (소셜 로그인)" : "기타"}
                      </p>
                    </div>
                  </div>

                  {/* 사용자 유형 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">사용자 유형</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">
                        {profile?.userType === "high_school_student"
                          ? "고등학생"
                          : profile?.userType === "university_student"
                          ? "대학생"
                          : "설정되지 않음"}
                      </p>
                    </div>
                  </div>

                  {/* 실명 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">실명</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{profile?.name || "설정되지 않음"}</p>
                    </div>
                  </div>

                  {/* 휴대폰 번호 */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">휴대폰 번호</Label>
                    <div className="p-3 bg-muted rounded-md">
                      <p className="text-sm">{profile?.phoneNumber || "설정되지 않음"}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 프로필 수정 섹션 */}
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="h-5 w-5" />
                    추가 정보 수정
                  </CardTitle>
                  <CardDescription>
                    실명과 휴대폰 번호를 수정하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingProfile ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="realName">실명</Label>
                        <Input
                          id="realName"
                          type="text"
                          placeholder="실명을 입력하세요"
                          value={realName}
                          onChange={(e) => setRealName(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">휴대폰 번호</Label>
                        <Input
                          id="phoneNumber"
                          type="tel"
                          placeholder="010-1234-5678"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleUpdateProfile}
                          disabled={updateProfileMutation.isPending}
                        >
                          {updateProfileMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              저장 중...
                            </>
                          ) : (
                            "저장하기"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingProfile(false);
                            setRealName("");
                            setPhoneNumber("");
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingProfile(true);
                        setRealName(profile?.name || "");
                        setPhoneNumber(profile?.phoneNumber || "");
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      정보 수정
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* 닉네임 변경 섹션 (숨김) */}
              {/*
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="h-5 w-5" />
                    닉네임 변경
                  </CardTitle>
                  <CardDescription>
                    프로필에 표시될 닉네임을 변경하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingNickname ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="nickname">새 닉네임</Label>
                        <Input
                          id="nickname"
                          type="text"
                          placeholder="새 닉네임을 입력하세요"
                          value={nickname}
                          onChange={(e) => setNickname(e.target.value)}
                          maxLength={50}
                        />
                        <p className="text-xs text-muted-foreground">
                          {nickname.length}/50
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={handleChangeNickname}
                          disabled={changeNicknameMutation.isPending}
                        >
                          {changeNicknameMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              변경 중...
                            </>
                          ) : (
                            "변경하기"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingNickname(false);
                            setNickname("");
                          }}
                        >
                          취소
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingNickname(true)}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      닉네임 변경
                    </Button>
                  )}
                </CardContent>
              </Card>
              */}

              {/* 비밀번호 변경 섹션 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    비밀번호 변경
                  </CardTitle>
                  <CardDescription>
                    계정 보안을 위해 비밀번호를 정기적으로 변경하세요
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingPassword ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="current-password">현재 비밀번호</Label>
                        <Input
                          id="current-password"
                          type="password"
                          placeholder="현재 비밀번호를 입력하세요"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="new-password">새 비밀번호</Label>
                        <Input
                          id="new-password"
                          type="password"
                          placeholder="새 비밀번호를 입력하세요 (최소 8자)"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">새 비밀번호 확인</Label>
                        <Input
                          id="confirm-password"
                          type="password"
                          placeholder="새 비밀번호를 다시 입력하세요"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={handleChangePassword}
                          disabled={changePasswordMutation.isPending}
                        >
                          {changePasswordMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              변경 중...
                            </>
                          ) : (
                            "비밀번호 변경"
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingPassword(false);
                            setCurrentPassword("");
                            setNewPassword("");
                            setConfirmPassword("");
                          }}
                        >
                          취소
                        </Button>
                      </div>

                      {profile?.loginMethod === "oauth" && (
                        <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                          <p className="text-sm text-blue-900">
                            💡 OAuth(소셜 로그인)로 가입하신 경우, 해당 서비스 제공자의 계정 설정에서 비밀번호를 관리하세요.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => setIsEditingPassword(true)}
                    >
                      <Lock className="mr-2 h-4 w-4" />
                      비밀번호 변경
                    </Button>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  );
}
