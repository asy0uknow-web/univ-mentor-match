/**
 * AI-powered semantic search for mentors
 * Uses Hugging Face embeddings for multilingual support
 */

import { pipeline } from "@xenova/transformers";
import { getDb } from "./db";
import { mentorEmbeddings, mentorSearchCorpus, mentorProfiles, users } from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

let extractor: any = null;

/**
 * Initialize the embedding model (lazy loading)
 */
async function initializeModel() {
  if (extractor) return extractor;
  
  console.log("[AI Search] Loading Hugging Face model...");
  try {
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/multilingual-e5-small"
    );
    console.log("[AI Search] Model loaded successfully");
    return extractor;
  } catch (error) {
    console.error("[AI Search] Failed to load model:", error);
    throw error;
  }
}

/**
 * Generate embedding for a search query
 */
async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const model = await initializeModel();
    const result = await model(query, {
      pooling: "mean",
      normalize: true,
    });
    
    return Array.from(result.data);
  } catch (error) {
    console.error("[AI Search] Error generating query embedding:", error);
    throw error;
  }
}

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
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

export interface AISearchResult {
  id: number;
  uuid: string;
  name: string | null;
  university: string | null;
  major: string | null;
  field: string | null;
  bio: string | null;
  email: string | null;
  matchScore: number;
}

/**
 * Search mentors using AI semantic search
 * @param query - Search query in natural language
 * @param limit - Maximum number of results
 * @returns Array of mentors with match scores
 */
export async function aiSearchMentors(
  query: string,
  limit: number = 10
): Promise<AISearchResult[]> {
  try {
    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    // Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);

    // Fetch all mentor embeddings from database
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const mentorEmbeddingsData = await db
      .select({
        mentorId: mentorEmbeddings.mentorId,
        embedding: mentorEmbeddings.embedding,
      })
      .from(mentorEmbeddings);

    if (mentorEmbeddingsData.length === 0) {
      console.warn("[AI Search] No mentor embeddings found in database");
      return [];
    }

    // Calculate similarity scores
    const results: AISearchResult[] = [];

    for (const item of mentorEmbeddingsData) {
      try {
        const storedEmbedding = JSON.parse(item.embedding as string);
        const score = cosineSimilarity(queryEmbedding, storedEmbedding);

        // Only include results with reasonable similarity (> 0.3)
        if (score > 0.3) {
          results.push({
            id: item.mentorId,
            uuid: "", // Will be filled below
            name: null,
            university: null,
            major: null,
            field: null,
            bio: null,
            email: null,
            matchScore: score,
          });
        }
      } catch (error) {
        console.error(
          `[AI Search] Error processing embedding for mentor ${item.mentorId}:`,
          error
        );
      }
    }

    // Sort by match score (descending)
    results.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    const topResults = results.slice(0, limit);

    // Fetch mentor details for top results
    if (topResults.length > 0) {
      const mentorIds = topResults.map((r) => r.id);

      const mentorDetails = await db
        .select({
          id: mentorProfiles.id,
          uuid: mentorProfiles.uuid,
          university: mentorProfiles.university,
          major: mentorProfiles.major,
          field: mentorProfiles.field,
          bio: mentorProfiles.bio,
          name: users.name,
          email: users.email,
        })
        .from(mentorProfiles)
        .leftJoin(users, eq(mentorProfiles.userId, users.id))
        .where(sql`${mentorProfiles.id} IN (${sql.raw(mentorIds.join(","))})`);

      // Merge details with scores
      const detailMap = new Map((mentorDetails as any[]).map((d: any) => [d.id, d]));

      return topResults.map((result) => {
        const detail = detailMap.get(result.id);
        return {
          ...result,
          ...(detail || {}),
        };
      });
    }

    return topResults;
  } catch (error) {
    console.error("[AI Search] Error during search:", error);
    throw error;
  }
}

/**
 * Get search statistics
 */
export async function getSearchStats() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available");
    }

    const count = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(mentorEmbeddings);

    return {
      totalMentorsVectorized: count[0]?.count || 0,
      modelVersion: "multilingual-e5-small",
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error("[AI Search] Error getting stats:", error);
    throw error;
  }
}
