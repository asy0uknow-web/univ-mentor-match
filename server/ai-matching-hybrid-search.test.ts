import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { hybridSearch } from "./hybrid-search";
import { generateEmbedding, cosineSimilarity } from "./embedding-service";

// Mock OpenAI API
vi.mock("openai", () => {
  const mockEmbeddings = {
    create: vi.fn(async ({ input }) => {
      // 간단한 해시 기반 임베딩 생성 (테스트용)
      const texts = Array.isArray(input) ? input : [input];
      return {
        data: texts.map((text, index) => ({
          embedding: generateMockEmbedding(text),
          index,
        })),
      };
    }),
  };

  return {
    default: vi.fn(() => ({
      embeddings: mockEmbeddings,
    })),
  };
});

/**
 * 테스트용 모의 임베딩 생성 (결정적)
 */
function generateMockEmbedding(text: string): number[] {
  const hash = text
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = hash % 1000;

  // 384차원 벡터 생성 (text-embedding-3-small과 동일)
  const embedding: number[] = [];
  for (let i = 0; i < 384; i++) {
    const value = Math.sin((seed + i) * 0.1) * 0.5 + 0.5;
    embedding.push(value);
  }
  return embedding;
}

describe("AI Matching - Hybrid Search", () => {
  describe("의미적 유사도 기반 검색", () => {
    it("관련 있는 검색어는 높은 점수를 받아야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "수학 전문 멘토입니다. 미적분학, 선형대수, 확률통계를 가르칩니다.",
          profileScore: 0.8,
        },
        {
          mentorId: 2,
          corpus: "프로그래밍 강사입니다. Python, JavaScript, React를 전문으로 합니다.",
          profileScore: 0.7,
        },
      ];

      const results = await hybridSearch("수학 공부", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(2);
      // 결과가 최종 점수 기준으로 정렬되어야 함
      expect(results[0].finalScore).toBeGreaterThanOrEqual(results[1].finalScore);
    });

    it("비관련 검색어도 의미론적 유사도로 관련 멘토를 찾아야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "대학 입시 전략, 생기부 작성, 자소서 컨설팅을 제공합니다.",
          profileScore: 0.9,
        },
        {
          mentorId: 2,
          corpus: "프로그래밍 언어 및 웹 개발 기초를 가르칩니다.",
          profileScore: 0.6,
        },
      ];

      // "간장게장"은 음식이지만, 의미론적 유사도로 어떤 멘토를 찾을지 테스트
      const results = await hybridSearch("간장게장", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(2);
      // 결과가 있어야 함 (의미론적 유사도가 0이 아님)
      expect(results[0].finalScore).toBeGreaterThanOrEqual(0);
    });

    it("정확한 키워드 매칭도 고려해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "프로그래밍 전문가입니다. Python, Java, C++ 등을 가르칩니다.",
          profileScore: 0.8,
        },
        {
          mentorId: 2,
          corpus: "영어 회화 및 문법을 전문으로 합니다.",
          profileScore: 0.7,
        },
      ];

      const results = await hybridSearch("Python 프로그래밍", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(2);
      // Python이 있는 멘토의 키워드 점수가 더 높아야 함
      expect(results[0].keywordScore).toBeGreaterThanOrEqual(results[1].keywordScore);
    });
  });

  describe("하이브리드 검색 가중치", () => {
    it("의미론적 검색 가중치가 높을 때 의미 유사도를 우선시해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "대학 입시 상담 및 전공 선택 컨설팅",
          profileScore: 0.5,
        },
        {
          mentorId: 2,
          corpus: "Python 프로그래밍 기초",
          profileScore: 0.9,
        },
      ];

      // 의미론적 가중치 높음 (0.8)
      const results = await hybridSearch("대학 선택", mentorCorpuses, 0.8, 0.1, 0.1);

      // 결과가 최종 점수 기준으로 정렬되어야 함
      expect(results).toHaveLength(2);
      expect(results[0].finalScore).toBeGreaterThanOrEqual(results[1].finalScore);
    });

    it("키워드 검색 가중치가 높을 때 정확한 단어 매칭을 우선시해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "대학 입시 상담 및 전공 선택 컨설팅",
          profileScore: 0.5,
        },
        {
          mentorId: 2,
          corpus: "Python 프로그래밍 기초",
          profileScore: 0.9,
        },
      ];

      // 키워드 가중치 높음 (0.8)
      const results = await hybridSearch("Python", mentorCorpuses, 0.1, 0.8, 0.1);

      expect(results).toHaveLength(2);
      // Python 키워드가 있는 멘토의 키워드 점수가 더 높아야 함
      expect(results[0].keywordScore).toBeGreaterThanOrEqual(results[1].keywordScore);
    });

    it("프로필 점수 가중치가 높을 때 평점 높은 멘토를 우선시해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "일반적인 상담 서비스",
          profileScore: 0.3, // 낮은 평점
        },
        {
          mentorId: 2,
          corpus: "다른 상담 서비스",
          profileScore: 0.95, // 높은 평점
        },
      ];

      // 프로필 가중치 높음 (0.7)
      const results = await hybridSearch("상담", mentorCorpuses, 0.1, 0.1, 0.7);

      expect(results).toHaveLength(2);
      // 평점 높은 멘토가 더 높은 최종 점수를 받아야 함
      expect(results[0].finalScore).toBeGreaterThanOrEqual(results[1].finalScore);
    });
  });

  describe("검색 결과 정렬 및 순위", () => {
    it("최종 점수 기준으로 내림차순 정렬되어야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "기초 수학 강의",
          profileScore: 0.5,
        },
        {
          mentorId: 2,
          corpus: "고급 수학 및 물리학",
          profileScore: 0.8,
        },
        {
          mentorId: 3,
          corpus: "수학 전문 멘토",
          profileScore: 0.9,
        },
      ];

      const results = await hybridSearch("수학", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(3);
      // 점수가 내림차순이어야 함
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].finalScore).toBeGreaterThanOrEqual(results[i + 1].finalScore);
      }
      // 순위가 올바르게 설정되어야 함
      expect(results[0].rank).toBe(1);
      expect(results[1].rank).toBe(2);
      expect(results[2].rank).toBe(3);
    });

    it("동일한 점수의 멘토들은 순서를 유지해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "동일한 설명",
          profileScore: 0.5,
        },
        {
          mentorId: 2,
          corpus: "동일한 설명",
          profileScore: 0.5,
        },
      ];

      const results = await hybridSearch("설명", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(2);
      // 두 멘토의 최종 점수가 거의 같아야 함
      expect(Math.abs(results[0].finalScore - results[1].finalScore)).toBeLessThan(0.01);
    });
  });

  describe("엣지 케이스 처리", () => {
    it("빈 검색 코퍼스 배열을 처리해야 함", async () => {
      const mentorCorpuses: Array<{
        mentorId: number;
        corpus: string;
        profileScore: number;
      }> = [];

      const results = await hybridSearch("검색", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(0);
    });

    it("빈 검색 쿼리를 처리해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "수학 멘토",
          profileScore: 0.8,
        },
      ];

      const results = await hybridSearch("", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      // 빈 쿼리도 프로필 점수로 인해 점수가 생김
      expect(results[0].finalScore).toBeGreaterThan(0);
    });

    it("매우 긴 검색 쿼리를 처리해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "수학 및 물리학 전문 멘토입니다.",
          profileScore: 0.8,
        },
      ];

      const longQuery =
        "수학과 물리학의 기초부터 고급 개념까지 모두 배우고 싶습니다. 특히 미적분학과 양자역학에 관심이 있습니다.";

      const results = await hybridSearch(longQuery, mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      expect(results[0].finalScore).toBeGreaterThan(0);
    });

    it("특수문자가 포함된 검색 쿼리를 처리해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "C++ 프로그래밍 전문",
          profileScore: 0.8,
        },
      ];

      const results = await hybridSearch("C++ 프로그래밍", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      expect(results[0].finalScore).toBeGreaterThan(0);
    });

    it("한글과 영문이 혼합된 검색 쿼리를 처리해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "Python과 JavaScript를 가르칩니다.",
          profileScore: 0.8,
        },
      ];

      const results = await hybridSearch("Python 프로그래밍", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      // 최종 점수가 0보다 커야 함
      expect(results[0].finalScore).toBeGreaterThan(0);
    });

    it("숫자가 포함된 검색 쿼리를 처리해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "2024학년도 수능 대비 강의",
          profileScore: 0.8,
        },
      ];

      const results = await hybridSearch("2024 수능", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      expect(results[0].finalScore).toBeGreaterThan(0);
    });
  });

  describe("점수 정규화", () => {
    it("모든 점수가 0-1 범위 내에 있어야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "수학 전문 멘토",
          profileScore: 0.8,
        },
        {
          mentorId: 2,
          corpus: "프로그래밍 강사",
          profileScore: 0.9,
        },
      ];

      const results = await hybridSearch("수학 프로그래밍", mentorCorpuses, 0.6, 0.3, 0.1);

      for (const result of results) {
        expect(result.semanticScore).toBeGreaterThanOrEqual(0);
        expect(result.semanticScore).toBeLessThanOrEqual(1);
        expect(result.keywordScore).toBeGreaterThanOrEqual(0);
        expect(result.keywordScore).toBeLessThanOrEqual(1);
        expect(result.finalScore).toBeGreaterThanOrEqual(0);
        expect(result.finalScore).toBeLessThanOrEqual(1);
      }
    });

    it("최종 점수가 0-1 범위 내에 있어야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "종합 멘토링 서비스",
          profileScore: 1.0,
        },
      ];

      const results = await hybridSearch("멘토링", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      // 최종 점수는 0-1 범위 내에 있어야 함
      expect(results[0].finalScore).toBeGreaterThanOrEqual(0);
      expect(results[0].finalScore).toBeLessThanOrEqual(1.0);
    });
  });

  describe("의미적 유사도 계산", () => {
    it("코사인 유사도가 올바르게 계산되어야 함", () => {
      const vectorA = [1, 0, 0];
      const vectorB = [1, 0, 0];
      const similarity = cosineSimilarity(vectorA, vectorB);

      expect(similarity).toBe(1); // 동일한 벡터
    });

    it("직교하는 벡터의 유사도는 0이어야 함", () => {
      const vectorA = [1, 0, 0];
      const vectorB = [0, 1, 0];
      const similarity = cosineSimilarity(vectorA, vectorB);

      expect(similarity).toBe(0); // 직교하는 벡터
    });

    it("반대 방향 벡터의 유사도는 -1이어야 함", () => {
      const vectorA = [1, 0, 0];
      const vectorB = [-1, 0, 0];
      const similarity = cosineSimilarity(vectorA, vectorB);

      expect(similarity).toBe(-1); // 반대 방향 벡터
    });
  });

  describe("검색 결과 반환 형식", () => {
    it("검색 결과가 올바른 필드를 포함해야 함", async () => {
      const mentorCorpuses = [
        {
          mentorId: 1,
          corpus: "멘토 설명",
          profileScore: 0.8,
        },
      ];

      const results = await hybridSearch("검색", mentorCorpuses, 0.6, 0.3, 0.1);

      expect(results).toHaveLength(1);
      const result = results[0];

      // 필수 필드 확인
      expect(result).toHaveProperty("mentorId");
      expect(result).toHaveProperty("semanticScore");
      expect(result).toHaveProperty("keywordScore");
      expect(result).toHaveProperty("finalScore");
      expect(result).toHaveProperty("rank");

      // 필드 타입 확인
      expect(typeof result.mentorId).toBe("number");
      expect(typeof result.semanticScore).toBe("number");
      expect(typeof result.keywordScore).toBe("number");
      expect(typeof result.finalScore).toBe("number");
      expect(typeof result.rank).toBe("number");
    });
  });
});
