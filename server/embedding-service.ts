import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// 임베딩 모델 설정
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 1536; // 768 / 1536 / 3072 중 선택 (기본 3072)
const MODEL_VERSION = "gemini-embedding-001-1536d";

/**
 * 텍스트를 벡터 임베딩으로 변환합니다.
 * gemini-embedding-001 모델, 1536차원 출력
 *
 * @param text 임베딩할 텍스트
 * @param taskType 태스크 유형 (기본: RETRIEVAL_DOCUMENT)
 * @returns 1536차원 벡터 배열
 */
export async function generateEmbedding(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" | "SEMANTIC_SIMILARITY" | "CLASSIFICATION" | "CLUSTERING" = "RETRIEVAL_DOCUMENT"
): Promise<number[]> {
  try {
    const response = await ai.models.embedContent({
      model: EMBEDDING_MODEL,
      contents: text,
      config: {
        taskType,
        outputDimensionality: EMBEDDING_DIMENSIONS,
      },
    });

    const embeddings = response.embeddings;
    if (!embeddings || embeddings.length === 0 || !embeddings[0].values) {
      throw new Error("No embedding returned from Gemini");
    }

    return embeddings[0].values;
  } catch (error) {
    console.error("[Embedding] Error generating embedding:", error);
    throw error;
  }
}

/**
 * 여러 텍스트를 순차적으로 임베딩합니다.
 * (gemini-embedding-001은 배치 요청 시 단일 집계 벡터를 반환하므로 개별 처리)
 *
 * @param texts 임베딩할 텍스트 배열
 * @returns 벡터 배열의 배열
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  for (const text of texts) {
    const vector = await generateEmbedding(text, "RETRIEVAL_DOCUMENT");
    results.push(vector);
  }
  return results;
}

/**
 * 두 벡터 간의 코사인 유사도를 계산합니다.
 * gemini-embedding-001의 비-3072 차원 벡터는 정규화가 필요하므로 내부에서 처리합니다.
 *
 * @param vectorA 첫 번째 벡터
 * @param vectorB 두 번째 벡터
 * @returns 유사도 점수 (0~1)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error(`Vector dimension mismatch: ${vectorA.length} vs ${vectorB.length}`);
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i];
    normA += vectorA[i] * vectorA[i];
    normB += vectorB[i] * vectorB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;

  return dotProduct / denominator;
}

/**
 * 벡터 DB 인터페이스 (Pinecone/ChromaDB 통합용)
 */
export interface VectorDBClient {
  upsert(id: string, vector: number[], metadata?: Record<string, unknown>): Promise<void>;
  query(vector: number[], topK: number, filter?: Record<string, unknown>): Promise<QueryResult[]>;
  delete(id: string): Promise<void>;
  update(id: string, vector: number[], metadata?: Record<string, unknown>): Promise<void>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, unknown>;
}

/**
 * 메모리 기반 벡터 DB (개발/테스트용)
 */
export class InMemoryVectorDB implements VectorDBClient {
  private vectors: Map<string, { vector: number[]; metadata?: Record<string, unknown> }> = new Map();

  async upsert(id: string, vector: number[], metadata?: Record<string, unknown>): Promise<void> {
    this.vectors.set(id, { vector, metadata });
  }

  async query(vector: number[], topK: number, filter?: Record<string, unknown>): Promise<QueryResult[]> {
    const results: QueryResult[] = [];

    this.vectors.forEach(({ vector: storedVector, metadata }, id) => {
      if (filter && metadata) {
        for (const [key, value] of Object.entries(filter)) {
          if (metadata[key] !== value) return;
        }
      }
      const score = cosineSimilarity(vector, storedVector);
      results.push({ id, score, metadata });
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  async delete(id: string): Promise<void> {
    this.vectors.delete(id);
  }

  async update(id: string, vector: number[], metadata?: Record<string, unknown>): Promise<void> {
    if (this.vectors.has(id)) {
      this.vectors.set(id, { vector, metadata });
    }
  }
}

export const vectorDB: VectorDBClient = new InMemoryVectorDB();

// ─────────────────────────────────────────────────────────────
// 구조화 문서 생성 및 DB 기반 임베딩 저장/검색 (AI 자연어 검색)
// 기존 키워드 검색(aiSearch.search)과 독립적으로 동작
// ─────────────────────────────────────────────────────────────

/**
 * 멘토 프로필 데이터를 AI 임베딩 모델이 최적의 의미(Semantic)를 파악할 수 있도록
 * 구조화된 텍스트 문서로 변환합니다.
 */
export function generateMentorDocument(params: {
  university: string;
  major: string;
  field: string;
  selfIntroduction: string;
  consultationTypes: string[];
}): string {
  const consultationTypeKorean: Record<string, string> = {
    career_counseling: "진로 상담",
    university_tour: "대학 탐방",
    resume_consulting: "자기소개서 첨삭",
    academic_management: "학업 관리",
  };
  const consultationTypesStr = params.consultationTypes
    .map((t) => consultationTypeKorean[t] ?? t)
    .join(", ");

  return `[멘토 정보 카테고리별 요약]
- 소속 대학: ${params.university.trim()}
- 전공 학과: ${params.major.trim()}
- 전문 분야: ${params.field.trim()}
- 상담 유형: ${consultationTypesStr}

[멘토 상세 자기소개 및 핵심 키워드]
${params.selfIntroduction.trim()}`.trim();
}

/**
 * 멘토 프로필 임베딩을 생성하여 mentor_embeddings 테이블에 저장(upsert)합니다.
 * 기존 임베딩이 있으면 덮어씁니다.
 */
export async function upsertMentorEmbedding(params: {
  mentorProfileId: number;
  university: string;
  major: string;
  field: string;
  selfIntroduction: string;
  consultationTypes: string[];
}): Promise<void> {
  const { getDb } = await import("./db.js");
  const { mentorEmbeddings } = await import("../drizzle/schema.js");
  const { eq } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 멘토 문서 생성 후 RETRIEVAL_DOCUMENT 타입으로 임베딩
  const document = generateMentorDocument(params);
  const vector = await generateEmbedding(document, "RETRIEVAL_DOCUMENT");
  const embeddingJson = JSON.stringify(vector);

  // upsert: 이미 있으면 업데이트, 없으면 삽입
  const existing = await db
    .select({ id: mentorEmbeddings.id })
    .from(mentorEmbeddings)
    .where(eq(mentorEmbeddings.mentorId, params.mentorProfileId))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(mentorEmbeddings)
      .set({ embedding: embeddingJson, modelVersion: MODEL_VERSION })
      .where(eq(mentorEmbeddings.mentorId, params.mentorProfileId));
  } else {
    await db.insert(mentorEmbeddings).values({
      mentorId: params.mentorProfileId,
      embedding: embeddingJson,
      modelVersion: MODEL_VERSION,
    });
  }

  console.log(`[Embedding] Upserted embedding for mentorProfileId=${params.mentorProfileId} (${EMBEDDING_DIMENSIONS}d)`);
}

/**
 * 자연어 검색어로 유사 멘토를 검색합니다.
 * DB에 저장된 임베딩과 코사인 유사도를 계산하여 임계값 이상인 멘토를 반환합니다.
 *
 * @param query 사용자 검색어
 * @param limit 최대 반환 수 (기본 10)
 * @param threshold 유사도 임계값 (기본 0.25)
 */
export async function searchMentorsByEmbedding(params: {
  query: string;
  limit?: number;
  threshold?: number;
}): Promise<Array<{ mentorProfileId: number; similarity: number }>> {
  const limit = Math.min(params.limit ?? 10, 50);
  const threshold = params.threshold ?? 0.25;

  const { getDb } = await import("./db.js");
  const { mentorEmbeddings, mentorProfiles } = await import("../drizzle/schema.js");
  const { eq, and } = await import("drizzle-orm");

  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 검색어는 RETRIEVAL_QUERY 타입으로 임베딩 (문서와 비대칭 최적화)
  const queryVector = await generateEmbedding(params.query.trim(), "RETRIEVAL_QUERY");

  // 승인된 멘토의 임베딩만 조회
  const rows = await db
    .select({
      mentorId: mentorEmbeddings.mentorId,
      embedding: mentorEmbeddings.embedding,
    })
    .from(mentorEmbeddings)
    .innerJoin(mentorProfiles, eq(mentorProfiles.id, mentorEmbeddings.mentorId))
    .where(
      and(
        eq(mentorProfiles.verificationStatus, "approved"),
        eq(mentorProfiles.isDeleted, false)
      )
    );

  // 코사인 유사도 계산 및 임계값 필터링
  const results: Array<{ mentorProfileId: number; similarity: number }> = [];
  for (const row of rows) {
    try {
      const storedVector: number[] = JSON.parse(row.embedding);
      const similarity = cosineSimilarity(queryVector, storedVector);
      if (similarity >= threshold) {
        results.push({ mentorProfileId: row.mentorId, similarity });
      }
    } catch {
      // 파싱 오류 시 해당 멘토 스킵
    }
  }

  // 유사도 내림차순 정렬 후 상위 limit개 반환
  results.sort((a, b) => b.similarity - a.similarity);
  return results.slice(0, limit);
}
