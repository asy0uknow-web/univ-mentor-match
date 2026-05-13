import OpenAI from "openai";

// TODO: OpenAI API 키 설정 후 활성화
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });
const openai = null as any; // 임시 처리

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
      .sort((a: any, b: any) => a.index - b.index)
      .map((item: any) => item.embedding);
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
