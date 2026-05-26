import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * 텍스트를 벡터 임베딩으로 변환합니다
 * text-embedding-3-small 모델 사용
 * @param text 임베딩할 텍스트
 * @returns 벡터 배열
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
      encoding_format: "float",
    });

    if (!response.data || response.data.length === 0) {
      throw new Error("No embedding returned from OpenAI");
    }

    return response.data[0].embedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    throw error;
  }
}

/**
 * 여러 텍스트를 배치로 임베딩합니다
 * @param texts 임베딩할 텍스트 배열
 * @returns 벡터 배열의 배열
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
      encoding_format: "float",
    });

    if (!response.data) {
      throw new Error("No embeddings returned from OpenAI");
    }

    // 응답 데이터를 인덱스 순서대로 정렬
    return response.data
      .sort((a, b) => a.index - b.index)
      .map((item) => item.embedding);
  } catch (error) {
    console.error("Error generating embeddings batch:", error);
    throw error;
  }
}

/**
 * 두 벡터 간의 코사인 유사도를 계산합니다
 * @param vectorA 첫 번째 벡터
 * @param vectorB 두 번째 벡터
 * @returns 유사도 점수 (0-1)
 */
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) {
    throw new Error("Vectors must have the same dimension");
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
  if (denominator === 0) {
    return 0;
  }

  return dotProduct / denominator;
}

/**
 * 벡터 DB 인터페이스 (Pinecone/ChromaDB 통합용)
 */
export interface VectorDBClient {
  // 벡터 저장
  upsert(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
  
  // 벡터 검색
  query(vector: number[], topK: number, filter?: Record<string, any>): Promise<QueryResult[]>;
  
  // 벡터 삭제
  delete(id: string): Promise<void>;
  
  // 벡터 업데이트
  update(id: string, vector: number[], metadata?: Record<string, any>): Promise<void>;
}

export interface QueryResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
}

/**
 * 메모리 기반 벡터 DB (개발/테스트용)
 * 실제 프로덕션에서는 Pinecone/ChromaDB 사용
 */
export class InMemoryVectorDB implements VectorDBClient {
  private vectors: Map<string, { vector: number[]; metadata?: Record<string, any> }> = new Map();

  async upsert(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    this.vectors.set(id, { vector, metadata });
  }

  async query(vector: number[], topK: number, filter?: Record<string, any>): Promise<QueryResult[]> {
    const results: QueryResult[] = [];

    this.vectors.forEach(({ vector: storedVector, metadata }, id) => {
      // 필터 적용
      if (filter && metadata) {
        let passFilter = true;
        for (const [key, value] of Object.entries(filter)) {
          if (metadata[key] !== value) {
            passFilter = false;
            break;
          }
        }
        if (!passFilter) return;
      }

      const score = cosineSimilarity(vector, storedVector);
      results.push({ id, score, metadata });
    });

    // 점수 기준으로 정렬 (내림차순)
    results.sort((a, b) => b.score - a.score);

    return results.slice(0, topK);
  }

  async delete(id: string): Promise<void> {
    this.vectors.delete(id);
  }

  async update(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    if (this.vectors.has(id)) {
      this.vectors.set(id, { vector, metadata });
    }
  }
}

/**
 * Pinecone 벡터 DB 클라이언트 (실제 구현은 pinecone-client 라이브러리 사용)
 * 현재는 인터페이스만 정의
 */
export class PineconeVectorDB implements VectorDBClient {
  private apiKey: string;
  private environment: string;
  private indexName: string;

  constructor(apiKey: string, environment: string, indexName: string) {
    this.apiKey = apiKey;
    this.environment = environment;
    this.indexName = indexName;
    // Pinecone 클라이언트 초기화 (실제 구현 필요)
  }

  async upsert(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    // Pinecone upsert 구현
    console.log(`Upserting vector ${id} to Pinecone`);
  }

  async query(vector: number[], topK: number, filter?: Record<string, any>): Promise<QueryResult[]> {
    // Pinecone query 구현
    console.log(`Querying Pinecone with topK=${topK}`);
    return [];
  }

  async delete(id: string): Promise<void> {
    // Pinecone delete 구현
    console.log(`Deleting vector ${id} from Pinecone`);
  }

  async update(id: string, vector: number[], metadata?: Record<string, any>): Promise<void> {
    // Pinecone update 구현
    console.log(`Updating vector ${id} in Pinecone`);
  }
}

// 기본 벡터 DB 클라이언트 (개발용)
export const vectorDB: VectorDBClient = new InMemoryVectorDB();

// ─────────────────────────────────────────────────────────────
// 구조화 문서 생성 및 DB 기반 임베딩 저장/검색 (Phase 2 AI 검색)
// 기존 키워드 검색(performNaturalLanguageSearch)과 독립적으로 동작
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

  const document = generateMentorDocument(params);
  const vector = await generateEmbedding(document);
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
      .set({ embedding: embeddingJson, modelVersion: "text-embedding-3-small" })
      .where(eq(mentorEmbeddings.mentorId, params.mentorProfileId));
  } else {
    await db.insert(mentorEmbeddings).values({
      mentorId: params.mentorProfileId,
      embedding: embeddingJson,
      modelVersion: "text-embedding-3-small",
    });
  }
  console.log(`[Embedding] Upserted embedding for mentorProfileId=${params.mentorProfileId}`);
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

  // 검색어 임베딩 생성 (쿼리도 동일한 구조화 형식으로 감싸기)
  const queryDocument = `[검색 요청]\n${params.query.trim()}`;
  const queryVector = await generateEmbedding(queryDocument);

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
