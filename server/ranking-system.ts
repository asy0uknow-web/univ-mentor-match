// Database imports removed - ranking system is database-agnostic

/**
 * 멘토 프로필 충실도 점수 계산
 * 프로필이 얼마나 완성되었는지를 0-1 범위로 계산
 */
export function calculateProfileCompleteness(mentorProfile: {
  bio?: string | null;
  availableSlots?: string | null;
  availableRegions?: string | null;
  field?: string | null;
}): number {
  let completenessScore = 0;
  let totalFields = 0;

  const fields = [
    { field: "bio", weight: 0.25 },
    { field: "availableSlots", weight: 0.25 },
    { field: "availableRegions", weight: 0.25 },
    { field: "field", weight: 0.25 },
  ];

  for (const { field: fieldName, weight } of fields) {
    totalFields += weight;
    const value = mentorProfile[fieldName as keyof typeof mentorProfile];
    if (value && (typeof value === "string" ? value.trim().length > 0 : true)) {
      completenessScore += weight;
    }
  }

  return totalFields > 0 ? completenessScore / totalFields : 0;
}

/**
 * 멘토 평점 정규화 (0-1 범위)
 * 5점 만점을 0-1 범위로 변환
 */
export function normalizeRating(rating: number | null | undefined): number {
  if (!rating) return 0;
  return Math.min(Math.max(rating / 5, 0), 1);
}

/**
 * 리뷰 수 기반 신뢰도 점수 계산
 * 리뷰가 많을수록 높은 점수 (로그 스케일)
 */
export function calculateReviewTrustScore(reviewCount: number): number {
  // 로그 스케일: log(reviewCount + 1) / log(100)
  // 0개: 0, 1개: 0.1, 10개: 0.33, 100개: 0.67, 1000개: 1.0
  const maxReviews = 100;
  const logScore = Math.log(reviewCount + 1) / Math.log(maxReviews + 1);
  return Math.min(logScore, 1);
}

/**
 * 응답 시간 기반 활동성 점수 계산
 * 최근에 활동한 멘토에게 더 높은 점수
 */
export function calculateActivityScore(lastUpdatedAt: Date): number {
  const now = new Date();
  const daysSinceUpdate = (now.getTime() - lastUpdatedAt.getTime()) / (1000 * 60 * 60 * 24);

  // 7일 이내: 1.0, 30일: 0.7, 90일: 0.3, 180일 이상: 0.0
  if (daysSinceUpdate <= 7) return 1.0;
  if (daysSinceUpdate <= 30) return 0.7;
  if (daysSinceUpdate <= 90) return 0.3;
  return 0;
}

/**
 * 멘토 프로필 점수 계산
 * 프로필 완성도, 평점, 리뷰 수, 활동성을 종합적으로 평가
 */
export interface MentorProfileScore {
  completenessScore: number; // 프로필 완성도 (0-1)
  ratingScore: number; // 평점 정규화 (0-1)
  reviewTrustScore: number; // 리뷰 신뢰도 (0-1)
  activityScore: number; // 활동성 (0-1)
  finalProfileScore: number; // 최종 프로필 점수 (0-1)
}

export function calculateMentorProfileScore(mentorProfile: {
  bio?: string | null;
  availableSlots?: string | null;
  availableRegions?: string | null;
  field?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
  updatedAt: Date;
}): MentorProfileScore {
  const completenessScore = calculateProfileCompleteness(mentorProfile);
  const ratingScore = normalizeRating(mentorProfile.averageRating);
  const reviewTrustScore = calculateReviewTrustScore(mentorProfile.reviewCount || 0);
  const activityScore = calculateActivityScore(mentorProfile.updatedAt);

  // 최종 프로필 점수 계산
  // 완성도 40%, 평점 30%, 리뷰 신뢰도 20%, 활동성 10%
  const finalProfileScore =
    completenessScore * 0.4 +
    ratingScore * 0.3 +
    reviewTrustScore * 0.2 +
    activityScore * 0.1;

  return {
    completenessScore,
    ratingScore,
    reviewTrustScore,
    activityScore,
    finalProfileScore,
  };
}

/**
 * 검색 결과 랭킹 점수 계산
 * 의미론적 유사도 + 키워드 매칭 + 프로필 점수
 */
export interface RankingScore {
  semanticScore: number; // 의미론적 유사도 (0-1)
  keywordScore: number; // 키워드 매칭 (0-1)
  profileScore: number; // 프로필 점수 (0-1)
  finalScore: number; // 최종 점수 (0-1)
}

export function calculateRankingScore(
  semanticScore: number,
  keywordScore: number,
  profileScore: number,
  semanticWeight: number = 0.6,
  keywordWeight: number = 0.3,
  profileWeight: number = 0.1
): RankingScore {
  // 가중치 정규화
  const totalWeight = semanticWeight + keywordWeight + profileWeight;
  const normalizedSemanticWeight = semanticWeight / totalWeight;
  const normalizedKeywordWeight = keywordWeight / totalWeight;
  const normalizedProfileWeight = profileWeight / totalWeight;

  const finalScore =
    semanticScore * normalizedSemanticWeight +
    keywordScore * normalizedKeywordWeight +
    profileScore * normalizedProfileWeight;

  return {
    semanticScore,
    keywordScore,
    profileScore,
    finalScore: Math.min(Math.max(finalScore, 0), 1),
  };
}

/**
 * 검색 결과 캐싱 및 성능 최적화
 */
export interface CachedSearchResult {
  queryHash: string;
  mentorIds: number[];
  scores: RankingScore[];
  timestamp: Date;
  ttl: number; // 캐시 유효 시간 (초)
}

// 메모리 기반 캐시 (프로덕션에서는 Redis 사용 권장)
const searchCache = new Map<string, CachedSearchResult>();

export function cacheSearchResult(
  queryHash: string,
  mentorIds: number[],
  scores: RankingScore[],
  ttl: number = 3600
): void {
  searchCache.set(queryHash, {
    queryHash,
    mentorIds,
    scores,
    timestamp: new Date(),
    ttl,
  });

  // TTL 후 자동 삭제
  setTimeout(() => {
    searchCache.delete(queryHash);
  }, ttl * 1000);
}

export function getCachedSearchResult(queryHash: string): CachedSearchResult | null {
  const cached = searchCache.get(queryHash);
  if (!cached) return null;

  const now = new Date();
  const age = (now.getTime() - cached.timestamp.getTime()) / 1000;

  if (age > cached.ttl) {
    searchCache.delete(queryHash);
    return null;
  }

  return cached;
}

export function clearSearchCache(): void {
  searchCache.clear();
}

/**
 * 부스트 점수 계산
 * 특정 조건을 만족하는 멘토에게 추가 점수 부여
 */
export interface BoostFactors {
  isVerified?: boolean; // 인증된 멘토
  hasRecentReview?: boolean; // 최근 리뷰 있음
  hasHighRating?: boolean; // 높은 평점 (4.5점 이상)
  hasCompleteProfile?: boolean; // 완성된 프로필
}

export function calculateBoostScore(factors: BoostFactors): number {
  let boostScore = 0;

  if (factors.isVerified) boostScore += 0.05;
  if (factors.hasRecentReview) boostScore += 0.03;
  if (factors.hasHighRating) boostScore += 0.04;
  if (factors.hasCompleteProfile) boostScore += 0.03;

  return Math.min(boostScore, 0.15); // 최대 15% 부스트
}

/**
 * 최종 랭킹 점수 계산 (모든 요소 포함)
 */
export interface FinalRankingScore extends RankingScore {
  boostScore: number;
  finalScoreWithBoost: number;
}

export function calculateFinalRankingScore(
  semanticScore: number,
  keywordScore: number,
  profileScore: number,
  boostFactors: BoostFactors,
  semanticWeight: number = 0.6,
  keywordWeight: number = 0.3,
  profileWeight: number = 0.1
): FinalRankingScore {
  const rankingScore = calculateRankingScore(
    semanticScore,
    keywordScore,
    profileScore,
    semanticWeight,
    keywordWeight,
    profileWeight
  );

  const boostScore = calculateBoostScore(boostFactors);
  const finalScoreWithBoost = Math.min(rankingScore.finalScore + boostScore, 1);

  return {
    ...rankingScore,
    boostScore,
    finalScoreWithBoost,
  };
}

/**
 * 멘토 검색 결과 정렬 및 페이지네이션
 */
export interface SortedMentorResult {
  mentorId: number;
  score: FinalRankingScore;
  rank: number;
}

export function sortAndRankResults(
  results: Array<{
    mentorId: number;
    score: FinalRankingScore;
  }>
): SortedMentorResult[] {
  return results
    .sort((a, b) => b.score.finalScoreWithBoost - a.score.finalScoreWithBoost)
    .map((result, index) => ({
      ...result,
      rank: index + 1,
    }));
}

/**
 * 다양성 점수 계산
 * 검색 결과에 다양한 대학/전공의 멘토가 포함되도록
 */
export function calculateDiversityScore(
  mentorId: number,
  allMentorIds: number[],
  mentorUniversities: Map<number, string>,
  mentorMajors: Map<number, string>
): number {
  const currentUniversity = mentorUniversities.get(mentorId);
  const currentMajor = mentorMajors.get(mentorId);

  if (!currentUniversity || !currentMajor) return 0;

  let diversityScore = 1;
  let sameUniversityCount = 0;
  let sameMajorCount = 0;

  for (const id of allMentorIds) {
    if (id === mentorId) continue;
    if (mentorUniversities.get(id) === currentUniversity) sameUniversityCount++;
    if (mentorMajors.get(id) === currentMajor) sameMajorCount++;
  }

  // 같은 대학/전공의 멘토가 많을수록 점수 감소
  diversityScore -= sameUniversityCount * 0.05;
  diversityScore -= sameMajorCount * 0.03;

  return Math.max(diversityScore, 0);
}
