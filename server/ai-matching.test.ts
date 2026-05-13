import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { generateSearchCorpus, normalizeSearchQuery, hashSearchQuery } from "./llm-pipeline";
import { cosineSimilarity, InMemoryVectorDB } from "./embedding-service";
import { hybridSearch, paginateResults } from "./hybrid-search";

describe("AI Matching System", () => {
  describe("LLM Pipeline", () => {
    it("should normalize search queries correctly", () => {
      const query = "  노베이스   전문   선생님  ";
      const normalized = normalizeSearchQuery(query);
      expect(normalized).toBe("노베이스 전문 선생님");
    });

    it("should generate consistent hash for same query", () => {
      const query = "수시 학종으로 고대 컴공 간 선배";
      const hash1 = hashSearchQuery(query);
      const hash2 = hashSearchQuery(query);
      expect(hash1).toBe(hash2);
    });

    it("should generate different hash for different queries", () => {
      const query1 = "수시 학종으로 고대 컴공";
      const query2 = "정시 일반전형 서울대 경제";
      const hash1 = hashSearchQuery(query1);
      const hash2 = hashSearchQuery(query2);
      expect(hash1).not.toBe(hash2);
    });

    it("should generate search corpus from mentor info", () => {
      const corpus = generateSearchCorpus(
        "저는 학생부 종합 전형으로 고대 컴공에 합격했습니다",
        "고려대학교",
        "컴퓨터공학부",
        {
          admissionTypes: ["학생부종합", "일반전형"],
          highSchoolTypes: ["일반고"],
          strengths: ["생기부 컨설팅", "수학 성적 향상"],
          targetStudents: ["수시 준비생"],
          experiences: ["개인 과외 경험"],
          majorDescription: "컴퓨터공학은 미래 기술의 중심입니다",
          admissionAchievements: "고대 컴공 수시 합격",
          confidenceScore: 85,
        }
      );

      expect(corpus).toContain("고려대학교");
      expect(corpus).toContain("컴퓨터공학부");
      expect(corpus).toContain("학생부종합");
      expect(corpus).toContain("생기부 컨설팅");
    });
  });

  describe("Embedding Service", () => {
    it("should calculate cosine similarity correctly", () => {
      const vector1 = [1, 0, 0];
      const vector2 = [1, 0, 0];
      const similarity = cosineSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(1.0, 5);
    });

    it("should calculate orthogonal vectors as zero similarity", () => {
      const vector1 = [1, 0, 0];
      const vector2 = [0, 1, 0];
      const similarity = cosineSimilarity(vector1, vector2);
      expect(similarity).toBeCloseTo(0, 5);
    });

    it("should throw error for different dimension vectors", () => {
      const vector1 = [1, 0];
      const vector2 = [1, 0, 0];
      expect(() => cosineSimilarity(vector1, vector2)).toThrow();
    });

    it("should store and retrieve vectors from in-memory DB", async () => {
      const db = new InMemoryVectorDB();
      const vector = [0.1, 0.2, 0.3];
      const metadata = { mentorId: 1, name: "Test Mentor" };

      await db.upsert("mentor-1", vector, metadata);

      const results = await db.query(vector, 1);
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("mentor-1");
      expect(results[0].score).toBeCloseTo(1.0, 5);
    });

    it("should filter results by metadata", async () => {
      const db = new InMemoryVectorDB();
      const vector = [0.1, 0.2, 0.3];

      await db.upsert("mentor-1", vector, { field: "engineering" });
      await db.upsert("mentor-2", vector, { field: "business" });

      const results = await db.query(vector, 10, { field: "engineering" });
      expect(results).toHaveLength(1);
      expect(results[0].id).toBe("mentor-1");
    });

    it("should delete vectors from DB", async () => {
      const db = new InMemoryVectorDB();
      const vector = [0.1, 0.2, 0.3];

      await db.upsert("mentor-1", vector);
      await db.delete("mentor-1");

      const results = await db.query(vector, 1);
      expect(results).toHaveLength(0);
    });

    it("should update vectors in DB", async () => {
      const db = new InMemoryVectorDB();
      const vector1 = [0.1, 0.2, 0.3];
      const vector2 = [0.4, 0.5, 0.6];

      await db.upsert("mentor-1", vector1);
      await db.update("mentor-1", vector2);

      const results = await db.query(vector2, 1);
      expect(results).toHaveLength(1);
      expect(results[0].score).toBeCloseTo(1.0, 5);
    });
  });

  describe("Hybrid Search", () => {
    it("should rank results based on profile score when no embeddings", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "고려대학교 컴퓨터공학부 학생부종합 전형 수시 합격",
          profileScore: 0.9,
        },
        {
          mentorId: 2,
          corpus: "서울대학교 경제학부 정시 일반전형 합격",
          profileScore: 0.8,
        },
        {
          mentorId: 3,
          corpus: "고려대학교 컴퓨터공학부 학생부종합 전형 멘토",
          profileScore: 0.85,
        },
      ];

      const results = await hybridSearch(
        "고대 컴공 학종 멘토",
        mentorCorpuses,
        0.6,
        0.3,
        0.1
      );

      expect(results).toHaveLength(3);
      expect(results[0].rank).toBe(1);
      expect(results[1].rank).toBe(2);
      expect(results[2].rank).toBe(3);

      // 모든 결과가 유효한 점수를 가져야 함
      results.forEach((result) => {
        expect(result.finalScore).toBeGreaterThanOrEqual(0);
        expect(result.finalScore).toBeLessThanOrEqual(1);
      });
    });

    it("should paginate search results correctly", () => {
      const results = Array.from({ length: 50 }, (_, i) => ({
        mentorId: i + 1,
        semanticScore: 0.8,
        keywordScore: 0.7,
        finalScore: 0.75,
        rank: i + 1,
      }));

      const page1 = paginateResults(results, 1, 20);
      expect(page1.results).toHaveLength(20);
      expect(page1.total).toBe(50);
      expect(page1.totalPages).toBe(3);
      expect(page1.page).toBe(1);

      const page2 = paginateResults(results, 2, 20);
      expect(page2.results).toHaveLength(20);
      expect(page2.results[0].mentorId).toBe(21);

      const page3 = paginateResults(results, 3, 20);
      expect(page3.results).toHaveLength(10);
      expect(page3.results[0].mentorId).toBe(41);
    });

    it("should handle empty search results", async () => {
      const results = await hybridSearch("비관련 검색어", [], 0.6, 0.3, 0.1);
      expect(results).toHaveLength(0);
    });

    it("should handle single result correctly", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "고려대학교 컴퓨터공학부",
          profileScore: 0.9,
        },
      ];

      const results = await hybridSearch(
        "고대 컴공",
        mentorCorpuses,
        0.6,
        0.3,
        0.1
      );

      expect(results).toHaveLength(1);
      expect(results[0].rank).toBe(1);
    });

    it("should handle pagination with single page", () => {
      const results = Array.from({ length: 10 }, (_, i) => ({
        mentorId: i + 1,
        semanticScore: 0.8,
        keywordScore: 0.7,
        finalScore: 0.75,
        rank: i + 1,
      }));

      const page1 = paginateResults(results, 1, 20);
      expect(page1.results).toHaveLength(10);
      expect(page1.totalPages).toBe(1);
    });

    it("should handle pagination beyond available pages", () => {
      const results = Array.from({ length: 10 }, (_, i) => ({
        mentorId: i + 1,
        semanticScore: 0.8,
        keywordScore: 0.7,
        finalScore: 0.75,
        rank: i + 1,
      }));

      const page5 = paginateResults(results, 5, 20);
      expect(page5.results).toHaveLength(0);
      expect(page5.totalPages).toBe(1);
    });
  });

  describe("Search Corpus Generation", () => {
    it("should handle empty feature arrays", () => {
      const corpus = generateSearchCorpus(
        "멘토 소개",
        "고려대학교",
        "컴퓨터공학부",
        {
          admissionTypes: [],
          highSchoolTypes: [],
          strengths: [],
          targetStudents: [],
          experiences: [],
          majorDescription: "",
          admissionAchievements: "",
          confidenceScore: 0,
        }
      );

      expect(corpus).toContain("고려대학교");
      expect(corpus).toContain("컴퓨터공학부");
      expect(corpus).toContain("멘토 소개");
    });

    it("should combine all feature information into corpus", () => {
      const corpus = generateSearchCorpus(
        "저는 멘토입니다",
        "서울대학교",
        "경제학부",
        {
          admissionTypes: ["수시", "정시"],
          highSchoolTypes: ["일반고", "자사고"],
          strengths: ["경제학 기초", "논문 작성"],
          targetStudents: ["경제 관심 학생"],
          experiences: ["학원 강사"],
          majorDescription: "경제학 전공",
          admissionAchievements: "서울대 경제 합격",
          confidenceScore: 90,
        }
      );

      expect(corpus).toContain("서울대학교");
      expect(corpus).toContain("경제학부");
      expect(corpus).toContain("수시");
      expect(corpus).toContain("정시");
      expect(corpus).toContain("경제학 기초");
    });
  });

  describe("Query Normalization", () => {
    it("should handle multiple spaces", () => {
      expect(normalizeSearchQuery("고대    컴공")).toBe("고대 컴공");
    });

    it("should convert to lowercase", () => {
      expect(normalizeSearchQuery("고대 COMP")).toBe("고대 comp");
    });

    it("should trim whitespace", () => {
      expect(normalizeSearchQuery("  고대 컴공  ")).toBe("고대 컴공");
    });

    it("should handle mixed case and spaces", () => {
      expect(normalizeSearchQuery("  고대   COMP   ")).toBe("고대 comp");
    });
  });

  describe("Query Hashing", () => {
    it("should generate valid hash strings", () => {
      const hash = hashSearchQuery("고대 컴공");
      expect(typeof hash).toBe("string");
      expect(hash.length).toBeGreaterThan(0);
      // 16진수 문자열인지 확인
      expect(/^[0-9a-f]+$/.test(hash)).toBe(true);
    });

    it("should normalize before hashing", () => {
      const hash1 = hashSearchQuery("고대 컴공");
      const hash2 = hashSearchQuery("  고대   컴공  ");
      expect(hash1).toBe(hash2);
    });
  });
});
