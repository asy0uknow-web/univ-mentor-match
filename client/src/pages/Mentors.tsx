import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { GraduationCap, Star, Search } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";

export default function Mentors() {
  const { isAuthenticated } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: mentors, isLoading } = trpc.mentor.listAll.useQuery();

  const filteredMentors = mentors?.filter((m) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      m.profile.university.toLowerCase().includes(searchLower) ||
      m.profile.major.toLowerCase().includes(searchLower) ||
      m.user.name?.toLowerCase().includes(searchLower)
    );
  });

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
              {isAuthenticated ? (
                <>
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
                </>
              ) : (
                <a href={getLoginUrl()}>
                  <Button>로그인</Button>
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">멘토 찾기</h1>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="대학, 전공, 멘토 이름으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Mentors Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">로딩 중...</p>
          </div>
        ) : filteredMentors && filteredMentors.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMentors.map((mentor) => (
              <Card key={mentor.profile.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{mentor.user.name || "멘토"}</CardTitle>
                      <CardDescription className="mt-1">
                        {mentor.profile.university} · {mentor.profile.major}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="font-semibold">
                        {parseFloat(mentor.profile.averageRating || "0").toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {mentor.profile.bio || "소개글이 없습니다."}
                  </p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">시간당</p>
                      <p className="text-lg font-bold text-primary">
                        ₩{Number(mentor.profile.hourlyRate).toLocaleString()}
                      </p>
                    </div>
                    <Link href={`/mentor/${mentor.user.id}`}>
                      <Button>프로필 보기</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">검색 결과가 없습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}
