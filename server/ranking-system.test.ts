import { describe, it, expect, beforeEach } from "vitest";
import {
  calculateProfileCompleteness,
  normalizeRating,
  calculateReviewTrustScore,
  calculateActivityScore,
  calculateMentorProfileScore,
  calculateRankingScore,
  calculateBoostScore,
  calculateFinalRankingScore,
  sortAndRankResults,
  calculateDiversityScore,
  cacheSearchResult,
  getCachedSearchResult,
  clearSearchCache,
} from "./ranking-system";

describe("Ranking System", () => {
  describe("Profile Completeness", () => {
    it("should calculate 0 for empty profile", () => {
      const score = calculateProfileCompleteness({
        bio: null,
        availableSlots: null,
        availableRegions: null,
        field: null,
      });
      expect(score).toBe(0);
    });

    it("should calculate 0.25 for one field filled", () => {
      const score = calculateProfileCompleteness({
        bio: "멘토 소개",
        availableSlots: null,
        availableRegions: null,
        field: null,
      });
      expect(score).toBeCloseTo(0.25, 2);
    });

    it("should calculate 1 for complete profile", () => {
      const score = calculateProfileCompleteness({
        bio: "멘토 소개",
        availableSlots: "월-금 오후",
        availableRegions: "서울",
        field: "입시 컨설팅",
      });
      expect(score).toBe(1);
    });

    it("should ignore empty strings", () => {
      const score = calculateProfileCompleteness({
        bio: "",
        availableSlots: "월-금 오후",
        availableRegions: "서울",
        field: "입시 컨설팅",
      });
      expect(score).toBeCloseTo(0.75, 2);
    });
  });

  describe("Rating Normalization", () => {
    it("should normalize 5.0 to 1.0", () => {
      expect(normalizeRating(5.0)).toBeCloseTo(1.0, 5);
    });

    it("should normalize 2.5 to 0.5", () => {
      expect(normalizeRating(2.5)).toBeCloseTo(0.5, 5);
    });

    it("should normalize 0 to 0", () => {
      expect(normalizeRating(0)).toBe(0);
    });

    it("should handle null as 0", () => {
      expect(normalizeRating(null)).toBe(0);
    });

    it("should handle undefined as 0", () => {
      expect(normalizeRating(undefined)).toBe(0);
    });

    it("should cap at 1.0 for values over 5", () => {
      expect(normalizeRating(6)).toBe(1);
    });
  });

  describe("Review Trust Score", () => {
    it("should return 0 for no reviews", () => {
      expect(calculateReviewTrustScore(0)).toBeCloseTo(0, 5);
    });

    it("should return higher score for more reviews", () => {
      const score1 = calculateReviewTrustScore(1);
      const score10 = calculateReviewTrustScore(10);
      const score100 = calculateReviewTrustScore(100);

      expect(score1).toBeLessThan(score10);
      expect(score10).toBeLessThan(score100);
    });

    it("should cap at 1.0", () => {
      expect(calculateReviewTrustScore(1000)).toBeLessThanOrEqual(1);
    });

    it("should use logarithmic scale", () => {
      const score1 = calculateReviewTrustScore(1);
      const score10 = calculateReviewTrustScore(10);
      const score100 = calculateReviewTrustScore(100);
      // 로그 스케일이므로 증가함
      expect(score1).toBeGreaterThan(0);
      expect(score10).toBeGreaterThan(score1);
      expect(score100).toBeGreaterThan(score10);
      expect(score100).toBeLessThanOrEqual(1);
    });
  });

  describe("Activity Score", () => {
    it("should return 1.0 for recent update (within 7 days)", () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000); // 3일 전
      expect(calculateActivityScore(recentDate)).toBe(1.0);
    });

    it("should return 0.7 for 30 day old update", () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      expect(calculateActivityScore(oldDate)).toBeCloseTo(0.7, 5);
    });

    it("should return 0.3 for 90 day old update", () => {
      const now = new Date();
      const oldDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      expect(calculateActivityScore(oldDate)).toBeCloseTo(0.3, 5);
    });

    it("should return 0 for very old update (180+ days)", () => {
      const now = new Date();
      const veryOldDate = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);
      expect(calculateActivityScore(veryOldDate)).toBe(0);
    });
  });

  describe("Mentor Profile Score", () => {
    it("should calculate comprehensive profile score", () => {
      const profile = {
        bio: "멘토 소개",
        availableSlots: "월-금",
        availableRegions: "서울",
        field: "입시",
        averageRating: 4.8,
        reviewCount: 50,
        updatedAt: new Date(),
      };

      const score = calculateMentorProfileScore(profile);

      expect(score.completenessScore).toBe(1);
      expect(score.ratingScore).toBeCloseTo(0.96, 2);
      expect(score.reviewTrustScore).toBeGreaterThan(0);
      expect(score.activityScore).toBe(1);
      expect(score.finalProfileScore).toBeGreaterThan(0.8);
    });

    it("should handle incomplete profile", () => {
      const profile = {
        bio: null,
        availableSlots: null,
        availableRegions: null,
        field: null,
        averageRating: null,
        reviewCount: 0,
        updatedAt: new Date(Date.now() - 200 * 24 * 60 * 60 * 1000),
      };

      const score = calculateMentorProfileScore(profile);

      expect(score.completenessScore).toBe(0);
      expect(score.ratingScore).toBe(0);
      expect(score.reviewTrustScore).toBeCloseTo(0, 5);
      expect(score.activityScore).toBe(0);
      expect(score.finalProfileScore).toBe(0);
    });
  });

  describe("Ranking Score", () => {
    it("should calculate ranking score with default weights", () => {
      const score = calculateRankingScore(0.8, 0.7, 0.9);

      expect(score.semanticScore).toBe(0.8);
      expect(score.keywordScore).toBe(0.7);
      expect(score.profileScore).toBe(0.9);
      expect(score.finalScore).toBeGreaterThan(0.7);
      expect(score.finalScore).toBeLessThan(0.9);
    });

    it("should respect custom weights", () => {
      const score1 = calculateRankingScore(0.8, 0.7, 0.9, 0.8, 0.1, 0.1);
      const score2 = calculateRankingScore(0.8, 0.7, 0.9, 0.1, 0.8, 0.1);

      // 의미론적 점수가 높으면 score1이 높아야 함
      expect(score1.finalScore).toBeGreaterThan(score2.finalScore);
    });

    it("should clamp final score to 0-1 range", () => {
      const score = calculateRankingScore(1.5, 1.5, 1.5);
      expect(score.finalScore).toBeLessThanOrEqual(1);
      expect(score.finalScore).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Boost Score", () => {
    it("should return 0 for no boost factors", () => {
      expect(calculateBoostScore({})).toBe(0);
    });

    it("should add points for each factor", () => {
      const score1 = calculateBoostScore({ isVerified: true });
      const score2 = calculateBoostScore({
        isVerified: true,
        hasRecentReview: true,
      });

      expect(score2).toBeGreaterThan(score1);
    });

    it("should cap boost at 0.15", () => {
      const score = calculateBoostScore({
        isVerified: true,
        hasRecentReview: true,
        hasHighRating: true,
        hasCompleteProfile: true,
      });

      expect(score).toBeLessThanOrEqual(0.15);
    });
  });

  describe("Final Ranking Score", () => {
    it("should include boost score in final calculation", () => {
      const scoreWithoutBoost = calculateRankingScore(0.8, 0.7, 0.9);
      const finalScore = calculateFinalRankingScore(0.8, 0.7, 0.9, {
        isVerified: true,
      });

      expect(finalScore.finalScoreWithBoost).toBeGreaterThan(
        scoreWithoutBoost.finalScore
      );
    });

    it("should not exceed 1.0 even with boost", () => {
      const score = calculateFinalRankingScore(1, 1, 1, {
        isVerified: true,
        hasRecentReview: true,
        hasHighRating: true,
        hasCompleteProfile: true,
      });

      expect(score.finalScoreWithBoost).toBeLessThanOrEqual(1);
    });
  });

  describe("Sort and Rank Results", () => {
    it("should sort results by final score", () => {
      const results = [
        {
          mentorId: 1,
          score: {
            semanticScore: 0.5,
            keywordScore: 0.5,
            profileScore: 0.5,
            finalScore: 0.5,
            boostScore: 0,
            finalScoreWithBoost: 0.5,
          },
        },
        {
          mentorId: 2,
          score: {
            semanticScore: 0.9,
            keywordScore: 0.9,
            profileScore: 0.9,
            finalScore: 0.9,
            boostScore: 0,
            finalScoreWithBoost: 0.9,
          },
        },
        {
          mentorId: 3,
          score: {
            semanticScore: 0.7,
            keywordScore: 0.7,
            profileScore: 0.7,
            finalScore: 0.7,
            boostScore: 0,
            finalScoreWithBoost: 0.7,
          },
        },
      ];

      const sorted = sortAndRankResults(results);

      expect(sorted[0].mentorId).toBe(2);
      expect(sorted[0].rank).toBe(1);
      expect(sorted[1].mentorId).toBe(3);
      expect(sorted[1].rank).toBe(2);
      expect(sorted[2].mentorId).toBe(1);
      expect(sorted[2].rank).toBe(3);
    });
  });

  describe("Diversity Score", () => {
    it("should return 1 for single mentor", () => {
      const score = calculateDiversityScore(
        1,
        [1],
        new Map([[1, "고려대"]]),
        new Map([[1, "컴공"]])
      );

      expect(score).toBe(1);
    });

    it("should reduce score for same university", () => {
      const mentorUniversities = new Map([
        [1, "고려대"],
        [2, "고려대"],
      ]);
      const mentorMajors = new Map([
        [1, "컴공"],
        [2, "경제"],
      ]);

      const score = calculateDiversityScore(1, [1, 2], mentorUniversities, mentorMajors);

      expect(score).toBeLessThan(1);
    });

    it("should reduce score more for same major", () => {
      const mentorUniversities = new Map([
        [1, "고려대"],
        [2, "서울대"],
      ]);
      const mentorMajors = new Map([
        [1, "컴공"],
        [2, "컴공"],
      ]);

      const score = calculateDiversityScore(1, [1, 2], mentorUniversities, mentorMajors);

      expect(score).toBeLessThan(1);
    });

    it("should not go below 0", () => {
      const mentorUniversities = new Map([
        [1, "고려대"],
        [2, "고려대"],
        [3, "고려대"],
        [4, "고려대"],
      ]);
      const mentorMajors = new Map([
        [1, "컴공"],
        [2, "컴공"],
        [3, "컴공"],
        [4, "컴공"],
      ]);

      const score = calculateDiversityScore(1, [1, 2, 3, 4], mentorUniversities, mentorMajors);

      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe("Search Cache", () => {
    beforeEach(() => {
      clearSearchCache();
    });

    it("should cache search results", () => {
      const queryHash = "test-hash-123";
      const mentorIds = [1, 2, 3];
      const scores = [
        {
          semanticScore: 0.8,
          keywordScore: 0.7,
          profileScore: 0.9,
          finalScore: 0.8,
          boostScore: 0,
          finalScoreWithBoost: 0.8,
        },
      ];

      cacheSearchResult(queryHash, mentorIds, scores);

      const cached = getCachedSearchResult(queryHash);
      expect(cached).not.toBeNull();
      expect(cached?.mentorIds).toEqual(mentorIds);
    });

    it("should return null for non-existent cache", () => {
      const cached = getCachedSearchResult("non-existent");
      expect(cached).toBeNull();
    });

    it("should respect TTL", async () => {
      const queryHash = "test-hash-456";
      const mentorIds = [1, 2, 3];
      const scores = [
        {
          semanticScore: 0.8,
          keywordScore: 0.7,
          profileScore: 0.9,
          finalScore: 0.8,
          boostScore: 0,
          finalScoreWithBoost: 0.8,
        },
      ];

      cacheSearchResult(queryHash, mentorIds, scores, 1); // 1초 TTL

      expect(getCachedSearchResult(queryHash)).not.toBeNull();

      // 1.1초 후 캐시 만료
      await new Promise((resolve) => setTimeout(resolve, 1100));

      expect(getCachedSearchResult(queryHash)).toBeNull();
    }, 5000);
  });
});
