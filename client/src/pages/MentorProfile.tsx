import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { GraduationCap } from "lucide-react";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function MentorProfile() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [university, setUniversity] = useState("");
  const [major, setMajor] = useState("");
  const [grade, setGrade] = useState<"1" | "2" | "3" | "4" | "graduate">("1");
  const [bio, setBio] = useState("");
  const [hourlyRate, setHourlyRate] = useState("");

  const { data: profile, isLoading } = trpc.mentor.getMyProfile.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createProfileMutation = trpc.mentor.createProfile.useMutation({
    onSuccess: () => {
      toast.success("멘토 프로필이 생성되었습니다!");
      window.location.reload();
    },
    onError: (error) => {
      toast.error(`프로필 생성 실패: ${error.message}`);
    },
  });

  const updateProfileMutation = trpc.mentor.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("프로필이 업데이트되었습니다!");
    },
    onError: (error) => {
      toast.error(`프로필 업데이트 실패: ${error.message}`);
    },
  });

  useEffect(() => {
    if (profile) {
      setUniversity(profile.university);
      setMajor(profile.major);
      setGrade(profile.grade);
      setBio(profile.bio || "");
      setHourlyRate(profile.hourlyRate);
    }
  }, [profile]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>멘토 프로필을 관리하려면 로그인해주세요.</CardDescription>
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!university || !major || !hourlyRate) {
      toast.error("모든 필수 필드를 입력해주세요.");
      return;
    }

    if (profile) {
      updateProfileMutation.mutate({
        university,
        major,
        grade,
        bio,
        hourlyRate,
      });
    } else {
      createProfileMutation.mutate({
        university,
        major,
        grade,
        bio,
        hourlyRate,
      });
    }
  };

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
              <Link href="/notifications">
                <Button variant="ghost">알림</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">
            {profile ? "멘토 프로필 수정" : "멘토 프로필 등록"}
          </h1>

          {isLoading ? (
            <p className="text-muted-foreground">로딩 중...</p>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>프로필 정보</CardTitle>
                <CardDescription>
                  멘토로 활동하기 위한 정보를 입력해주세요.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="university">대학명 *</Label>
                    <Input
                      id="university"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="예: 서울대학교"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="major">전공 *</Label>
                    <Input
                      id="major"
                      value={major}
                      onChange={(e) => setMajor(e.target.value)}
                      placeholder="예: 컴퓨터공학과"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="grade">학년 *</Label>
                    <Select value={grade} onValueChange={(value: any) => setGrade(value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="학년 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1학년</SelectItem>
                        <SelectItem value="2">2학년</SelectItem>
                        <SelectItem value="3">3학년</SelectItem>
                        <SelectItem value="4">4학년</SelectItem>
                        <SelectItem value="graduate">대학원생</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="hourlyRate">시간당 상담료 (원) *</Label>
                    <Input
                      id="hourlyRate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="예: 30000"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="bio">자기소개</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="자신의 경험과 상담 가능한 내용을 소개해주세요."
                      rows={6}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={createProfileMutation.isPending || updateProfileMutation.isPending}
                  >
                    {createProfileMutation.isPending || updateProfileMutation.isPending
                      ? "저장 중..."
                      : profile
                      ? "프로필 업데이트"
                      : "멘토 등록하기"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
