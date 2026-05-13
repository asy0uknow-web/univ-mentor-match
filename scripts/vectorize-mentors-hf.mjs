#!/usr/bin/env node

/**
 * Vectorize all mentor data using Hugging Face Transformers
 * No API key required - runs locally
 * Usage: node scripts/vectorize-mentors-hf.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { pipeline } from "@xenova/transformers";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env.local first, then .env
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

const DATABASE_URL = process.env.DATABASE_URL;

console.log("🔍 Environment check:");
console.log("  DATABASE_URL:", DATABASE_URL ? "✅ SET" : "❌ NOT SET");
console.log("  Hugging Face: ✅ LOCAL (No API key needed)");
console.log("");

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in environment variables");
  console.error("   This should be set in your Manus project secrets");
  process.exit(1);
}

/**
 * Parse DATABASE_URL to get connection config
 */
function parseDatabaseUrl(url) {
  try {
    const dbUrl = new URL(url);
    const hostname = dbUrl.hostname || "";
    const needsSsl = hostname.includes("tidbcloud") || hostname.includes("amazonaws");
    return {
      host: hostname,
      port: dbUrl.port ? parseInt(dbUrl.port) : 3306,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      ssl: needsSsl ? { rejectUnauthorized: false } : false,
    };
  } catch (error) {
    console.error("❌ Failed to parse DATABASE_URL:", error.message);
    process.exit(1);
  }
}

/**
 * Generate search corpus for a mentor
 */
function generateSearchCorpus(mentor, user) {
  const parts = [];

  // 기본 정보
  if (user?.name) parts.push(user.name);
  if (mentor.university) parts.push(mentor.university);
  if (mentor.major) parts.push(mentor.major);
  if (mentor.field) parts.push(mentor.field);

  // 자기소개
  if (mentor.bio) parts.push(mentor.bio);

  // 상담 유형
  if (mentor.consultationTypes && mentor.consultationTypes.length > 0) {
    parts.push(mentor.consultationTypes.join(" "));
  }

  // 지역
  if (mentor.availableRegions) {
    try {
      const regions = JSON.parse(mentor.availableRegions);
      if (Array.isArray(regions)) {
        parts.push(regions.join(" "));
      }
    } catch (e) {
      // Ignore parsing errors
    }
  }

  return parts.filter(Boolean).join(" ");
}

/**
 * Initialize the embedding model (runs once)
 */
let extractor = null;

async function initializeModel() {
  if (extractor) return extractor;
  
  console.log("📥 Loading Hugging Face model (first time only)...");
  console.log("   This may take 1-2 minutes and download ~500MB");
  
  try {
    // Using multilingual model for Korean support
    extractor = await pipeline(
      "feature-extraction",
      "Xenova/multilingual-e5-small"
    );
    console.log("✅ Model loaded successfully\n");
    return extractor;
  } catch (error) {
    console.error("❌ Failed to load model:", error.message);
    throw error;
  }
}

/**
 * Generate embedding using Hugging Face
 */
async function generateEmbedding(text, extractor) {
  try {
    const result = await extractor(text, {
      pooling: "mean",
      normalize: true,
    });
    
    // Convert to array
    const embedding = Array.from(result.data);
    
    if (!embedding || embedding.length === 0) {
      throw new Error("No embedding returned from Hugging Face");
    }
    
    return embedding;
  } catch (error) {
    console.error("❌ Error generating embedding:", error.message);
    throw error;
  }
}

/**
 * Main vectorization process
 */
async function vectorizeMentors() {
  let connection;
  try {
    // Initialize model first
    const extractor = await initializeModel();

    console.log("🔗 Connecting to database...");
    const dbConfig = parseDatabaseUrl(DATABASE_URL);
    
    // Connect to database
    connection = await mysql.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password,
      database: dbConfig.database,
      ssl: dbConfig.ssl,
    });

    console.log("✅ Connected to database at", dbConfig.host);

    // Fetch all active mentors with their user info
    console.log("📋 Fetching mentors...");
    const [mentors] = await connection.query(`
      SELECT 
        mp.id,
        mp.uuid,
        mp.userId,
        mp.university,
        mp.major,
        mp.field,
        mp.bio,
        mp.availableRegions,
        u.name,
        u.email,
        GROUP_CONCAT(DISTINCT ct.consultationType) as consultationTypes
      FROM mentor_profiles mp
      LEFT JOIN users u ON mp.userId = u.id
      LEFT JOIN mentor_consultation_types ct ON mp.id = ct.mentorId
      WHERE mp.isDeleted = false
      GROUP BY mp.id, mp.uuid, mp.userId, mp.university, mp.major, mp.field, mp.bio, mp.availableRegions, u.name, u.email
      ORDER BY mp.createdAt DESC
    `);

    console.log(`📊 Found ${mentors.length} mentors to vectorize\n`);

    let successCount = 0;
    let skipCount = 0;
    let errorCount = 0;

    if (mentors.length === 0) {
      console.log("⚠️  No mentors found to vectorize");
      return;
    }

    for (let i = 0; i < mentors.length; i++) {
      const mentor = mentors[i];
      const progress = `[${i + 1}/${mentors.length}]`;

      try {
        // Generate search corpus
        const corpus = generateSearchCorpus(mentor, { name: mentor.name });

        if (!corpus || corpus.trim().length === 0) {
          console.log(`⏭️  ${progress} Skipping mentor ${mentor.uuid} - empty corpus`);
          skipCount++;
          continue;
        }

        console.log(`🔄 ${progress} Vectorizing mentor ${mentor.name} (${mentor.uuid})...`);

        // Generate embedding
        const embedding = await generateEmbedding(corpus, extractor);

        if (!embedding || embedding.length === 0) {
          console.error(`❌ ${progress} Failed to generate embedding for ${mentor.uuid}`);
          errorCount++;
          continue;
        }

        // Save to database
        const embeddingJson = JSON.stringify(embedding);

        // Insert or update mentor_search_corpus
        await connection.query(
          `
          INSERT INTO mentor_search_corpus (mentorId, corpus, tokens, createdAt, updatedAt)
          VALUES (?, ?, ?, NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            corpus = VALUES(corpus),
            tokens = VALUES(tokens),
            updatedAt = NOW()
          `,
          [mentor.id, corpus, null]
        );

        // Insert or update mentor_embeddings
        await connection.query(
          `
          INSERT INTO mentor_embeddings (mentorId, embedding, modelVersion, createdAt, updatedAt)
          VALUES (?, ?, 'multilingual-e5-small', NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            embedding = VALUES(embedding),
            updatedAt = NOW()
          `,
          [mentor.id, embeddingJson]
        );

        console.log(`✅ ${progress} Successfully vectorized ${mentor.name}`);
        successCount++;
      } catch (error) {
        console.error(`❌ ${progress} Error processing mentor ${mentor.uuid}:`, error.message);
        errorCount++;
      }
    }

    console.log("\n📈 Vectorization Summary:");
    console.log(`✅ Success: ${successCount}`);
    console.log(`⏭️  Skipped: ${skipCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total: ${mentors.length}`);

    if (successCount > 0) {
      console.log("\n✨ Vectorization completed successfully!");
      console.log("🎉 All mentors are now searchable with AI!");
    }
  } catch (error) {
    console.error("❌ Fatal error:", error.message);
    console.error("Stack:", error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log("🔌 Database connection closed");
    }
  }
}

// Run vectorization
vectorizeMentors();
