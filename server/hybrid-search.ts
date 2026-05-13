import { generateEmbedding, cosineSimilarity, vectorDB } from "./embedding-service";

/**
 * BM25 알고리즘을 사용한 키워드 검색 점수 계산
 * 전통적인 정보 검색 알고리즘으로 고유명사(대학명, 전공명 등) 매칭에 효과적
 */

const BM25_K1 = 1.5; // 용어 빈도 포화도
const BM25_B = 0.75; // 문서 길이 정규화
const BM25_K3 = 8; // 쿼리 용어 빈도 포화도

/**
 * 단어를 토큰화합니다
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, " ") // 특수문자 제거
    .split(/\s+/)
    .filter((token) => token.length > 0);
}

/**
 * BM25 점수를 계산합니다
 * @param query 검색 쿼리
 * @param document 검색 대상 문서
 * @param avgDocLength 평균 문서 길이
 * @param docFrequency 문서 빈도
 * @param totalDocs 전체 문서 수
 * @returns BM25 점수
 */
function calculateBM25Score(
  query: string,
  document: string,
  avgDocLength: number,
  docFrequency: Map<string, number>,
  totalDocs: number
): number {
  const queryTokens = tokenize(query);
  const docTokens = tokenize(document);
  const docLength = docTokens.length;

  let score = 0;

  for (const queryToken of queryTokens) {
    const termFrequency = docTokens.filter((token) => token === queryToken).length;
    const df = docFrequency.get(queryToken) || 1;
    const idf = Math.log((totalDocs - df + 0.5) / (df + 0.5) + 1);

    const numerator =
      termFrequency * (BM25_K1 + 1);
    const denominator =
      termFrequency +
      BM25_K1 *
        (1 - BM25_B + BM25_B * (docLength / avgDocLength));

    score += idf * (numerator / denominator);
  }

  return score;
}

/**
 * 하이브리드 검색 결과
 */
export interface HybridSearchResult {
  mentorId: number;
  semanticScore: number; // 의미론적 유사도 (0-1)
  keywordScore: number; // 키워드 매칭 점수 (0-1)
  finalScore: number; // 최종 점수 (0-1)
  rank: number;
}

/**
 * 하이브리드 검색을 수행합니다
 * 의미론적 검색(벡터) + 키워드 검색(BM25) 결합
 * @param query 검색 쿼리
 * @param mentorCorpuses 멘토 검색 코퍼스 배열
 * @param semanticWeight 의미론적 검색 가중치 (기본값 0.6)
 * @param keywordWeight 키워드 검색 가중치 (기본값 0.3)
 * @param profileWeight 프로필 점수 가중치 (기본값 0.1)
 * @returns 검색 결과 배열
 */
export async function hybridSearch(
  query: string,
  mentorCorpuses: Array<{ mentorId: number; corpus: string; profileScore: number }>,
  semanticWeight: number = 0.6,
  keywordWeight: number = 0.3,
  profileWeight: number = 0.1
): Promise<HybridSearchResult[]> {
  const results: HybridSearchResult[] = [];

  // 1. 의미론적 검색 (벡터 유사도)
  let queryEmbedding: number[] = [];
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch (error) {
    console.error("Error generating query embedding:", error);
    // 임베딩 실패 시 키워드 검색만 수행
  }

  // 2. 키워드 검색 (BM25)
  const docFrequency = new Map<string, number>();
  const avgDocLength =
    mentorCorpuses.reduce((sum, item) => sum + tokenize(item.corpus).length, 0) /
    mentorCorpuses.length;

  // 문서 빈도 계산
  for (const { corpus } of mentorCorpuses) {
    const tokens = new Set(tokenize(corpus));
    tokens.forEach((token) => {
      docFrequency.set(token, (docFrequency.get(token) || 0) + 1);
    });
  }

  // 각 멘토에 대해 점수 계산
  for (const { mentorId, corpus, profileScore } of mentorCorpuses) {
    let semanticScore = 0;
    let keywordScore = 0;

    // 의미론적 점수 계산
    if (queryEmbedding.length > 0) {
      try {
        const corpusEmbedding = await generateEmbedding(corpus);
        semanticScore = cosineSimilarity(queryEmbedding, corpusEmbedding);
      } catch (error) {
        console.error(`Error calculating semantic score for mentor ${mentorId}:`, error);
      }
    }

    // 키워드 점수 계산
    const bm25Score = calculateBM25Score(
      query,
      corpus,
      avgDocLength,
      docFrequency,
      mentorCorpuses.length
    );
    // BM25 점수를 0-1 범위로 정규화
    keywordScore = Math.min(bm25Score / 10, 1);

    // 최종 점수 계산
    const finalScore =
      semanticScore * semanticWeight +
      keywordScore * keywordWeight +
      profileScore * profileWeight;

    results.push({
      mentorId,
      semanticScore,
      keywordScore,
      finalScore,
      rank: 0, // 나중에 정렬 후 설정
    });
  }

  // 최종 점수 기준으로 정렬
  results.sort((a, b) => b.finalScore - a.finalScore);

  // 순위 설정
  results.forEach((result, index) => {
    result.rank = index + 1;
  });

  return results;
}

/**
 * 메타데이터 필터링을 적용합니다
 * @param results 검색 결과
 * @param filters 필터 조건
 * @returns 필터링된 결과
 */
export function applyMetadataFilters(
  results: HybridSearchResult[],
  filters: {
    university?: string;
    major?: string;
    field?: string;
    region?: string;
    minRating?: number;
  }
): HybridSearchResult[] {
  // 필터 적용 로직 (실제 구현에서는 데이터베이스 쿼리와 함께 사용)
  return results;
}

/**
 * 검색 결과를 페이지네이션합니다
 * @param results 검색 결과
 * @param page 페이지 번호 (1부터 시작)
 * @param pageSize 페이지 크기
 * @returns 페이지네이션된 결과
 */
export function paginateResults(
  results: HybridSearchResult[],
  page: number = 1,
  pageSize: number = 20
): {
  results: HybridSearchResult[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
} {
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    results: results.slice(startIndex, endIndex),
    total: results.length,
    page,
    pageSize,
    totalPages: Math.ceil(results.length / pageSize),
  };
}
