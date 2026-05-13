import React, { useEffect, useState } from "react";
import { trpc } from "../lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Star, Sparkles, ArrowRight } from "lucide-react";
import PageLayout from "../components/layout/PageLayout";

const FIELD_LABELS: Record<string, string> = {
  engineering: "공학",
  natural_science: "자연과학",
  business: "경영/상경",
  humanities: "인문학",
  education: "교육",
  liberal_arts: "교양",
  medicine: "의학",
};

const CONSULTATION_TYPE_LABELS: Record<string, string> = {
  career_counseling: "진로상담",
  university_tour: "대학탐방",
  resume_consulting: "생기부컨설팅",
  academic_management: "학업관리",
};

export default function RecommendedMentors() {
  const [interests, setInterests] = useState<Array<{ category: string; level: string }>>([]);
  const [selectedInterests, setSelectedInterests] = useState<Set<string>>(new Set());

  // 추천 멘토 조회
  const { data: recommendedMentors, isLoading: isMentorsLoading } = trpc.recommendations.getRecommendedMentors.useQuery({
    limit: 10,
  });

  // 관심사 저장
  const saveInterestsMutation = trpc.recommendations.saveStudentInterests.useMutation();

  // 추천 기록 저장
  const recordRecommendationMutation = trpc.recommendations.recordRecommendation.useMutation();

  const interestCategories = [
    "engineering",
    "natural_science",
    "business",
    "humanities",
    "education",
    "liberal_arts",
    "medicine",
  ];

  const handleSaveInterests = async () => {
    if (selectedInterests.size === 0) {
      alert("최소 하나의 관심사를 선택해주세요");
      return;
    }

    const interestsToSave = Array.from(selectedInterests).map((category) => ({
      category,
      level: "intermediate" as const,
    }));

    await saveInterestsMutation.mutateAsync({ interests: interestsToSave });
    alert("관심사가 저장되었습니다");
  };

  const handleMentorClick = async (mentorId: number) => {
    // 추천 기록 저장
    await recordRecommendationMutation.mutateAsync({
      mentorId,
      score: 75,
      reason: "interest_match",
    });

    // 멘토 프로필로 이동
    window.location.href = `/mentor-profile/${mentorId}`;
  };

  const toggleInterest = (category: string) => {
    const newInterests = new Set(selectedInterests);
    if (newInterests.has(category)) {
      newInterests.delete(category);
    } else {
      newInterests.add(category);
    }
    setSelectedInterests(newInterests);
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[var(--color-background-page)] py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* 헤더 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-[var(--brand-primary-500)]" />
              <h1 className="text-3xl font-bold text-[var(--color-text-primary)]">추천 멘토</h1>
            </div>
            <p className="text-[var(--color-text-secondary)]">
              당신의 관심사와 목표에 맞는 최적의 멘토를 추천해드립니다
            </p>
          </div>

          {/* 관심사 선택 섹션 */}
          <Card className="mb-8 bg-[var(--color-background-card)] border-[var(--color-border-default)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-text-primary)]">관심사 선택</CardTitle>
              <CardDescription className="text-[var(--color-text-secondary)]">
                당신의 관심 분야를 선택하면 더 정확한 추천을 받을 수 있습니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {interestCategories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedInterests.has(category) ? "default" : "outline"}
                    onClick={() => toggleInterest(category)}
                    className={selectedInterests.has(category) ? "bg-[var(--brand-primary-500)]" : ""}
                  >
                    {category === "engineering"
                      ? "공학"
                      : category === "natural_science"
                        ? "자연과학"
                        : category === "business"
                          ? "경영/경제"
                          : category === "humanities"
                            ? "인문학"
                            : category === "education"
                              ? "교육"
                              : category === "liberal_arts"
                                ? "교양"
                                : "의학"}
                  </Button>
                ))}
              </div>
              <Button
                onClick={handleSaveInterests}
                disabled={saveInterestsMutation.isPending}
                className="w-full bg-[var(--brand-primary-500)] text-white hover:bg-[var(--brand-primary-600)]"
              >
                {saveInterestsMutation.isPending ? "저장 중..." : "관심사 저장"}
              </Button>
            </CardContent>
          </Card>

          {/* 추천 멘토 목록 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isMentorsLoading ? (
              <div className="col-span-full text-center py-8">
                <p className="text-[var(--color-text-secondary)]">멘토를 불러오는 중...</p>
              </div>
            ) : recommendedMentors && recommendedMentors.length > 0 ? (
              recommendedMentors.map((mentor) => (
                <Card
                  key={mentor.id}
                  className="bg-[var(--color-background-card)] border-[var(--color-border-default)] hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => handleMentorClick(mentor.userId)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-[var(--color-text-primary)]">{mentor.university}</CardTitle>
                        <CardDescription className="text-[var(--color-text-secondary)]">
                          {mentor.major}
                        </CardDescription>
                      </div>
                      {(mentor as any).consultationTypes && (mentor as any).consultationTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {(mentor as any).consultationTypes.slice(0, 2).map((type: string) => (
                            <Badge key={type} variant="secondary" className="bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)] text-xs">
                              {CONSULTATION_TYPE_LABELS[type] || type}
                            </Badge>
                          ))}
                          {(mentor as any).consultationTypes.length > 2 && (
                            <Badge variant="secondary" className="bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)] text-xs">
                              +{(mentor as any).consultationTypes.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Badge variant="secondary" className="bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)]">
                          상담 유형 미등록
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {/* 평점 */}
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-[var(--color-text-primary)]">
                          {mentor.averageRating || "0.00"}
                        </span>
                        <span className="text-sm text-[var(--color-text-secondary)]">
                          ({mentor.reviewCount || 0}개 평가)
                        </span>
                      </div>

                      {/* 소개 */}
                      {mentor.bio && (
                        <p className="text-sm text-[var(--color-text-secondary)] line-clamp-2">{mentor.bio}</p>
                      )}

                      {/* 버튼 */}
                      <a href={`/mentor-profile/${mentor.userId}`} className="w-full">
                        <Button
                          className="w-full bg-[var(--brand-primary-500)] text-white hover:bg-[var(--brand-primary-600)] flex items-center justify-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMentorClick(mentor.userId);
                          }}
                        >
                          프로필 보기
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-[var(--color-text-secondary)]">추천 멘토가 없습니다</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
