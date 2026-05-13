#!/usr/bin/env node

/**
 * Vectorize all mentor data using Upstage Solar Embeddings API
 * Usage: node scripts/vectorize-mentors.mjs
 */

import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Load .env.local first, then .env
dotenv.config({ path: path.join(projectRoot, ".env.local") });
dotenv.config({ path: path.join(projectRoot, ".env") });

const UPSTAGE_API_KEY = process.env.UPSTAGE_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

console.log("🔍 Environment check:");
console.log("  UPSTAGE_API_KEY:", UPSTAGE_API_KEY ? "✅ SET" : "❌ NOT SET");
console.log("  DATABASE_URL:", DATABASE_URL ? "✅ SET" : "❌ NOT SET");
console.log("");

if (!UPSTAGE_API_KEY) {
  console.error("❌ UPSTAGE_API_KEY is not set in environment variables");
  console.error("   Make sure .env.local exists with UPSTAGE_API_KEY=your_key");
  process.exit(1);
}

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
 * Generate embedding using Upstage Solar Embeddings API
 */
async function generateEmbedding(text) {
  try {
    const response = await globalThis.fetch("https://api.upstage.ai/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${UPSTAGE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "solar-embedding-1",
        input: [text],
      }),
    });

    if (!response.ok) {
      let errorMsg = response.statusText;
      let errorDetails = "";
      try {
        const error = await response.json();
        errorMsg = error.message || response.statusText;
        errorDetails = JSON.stringify(error);
      } catch (e) {
        // Ignore JSON parse error
      }
      console.error("Upstage error details:", errorDetails);
      throw new Error(`Upstage API error: ${errorMsg}`);
    }

    const data = await response.json();
    
    if (!data.data || !Array.isArray(data.data) || !data.data[0] || !data.data[0].embedding) {
      console.error("Upstage response:", JSON.stringify(data));
      throw new Error("No embedding returned from Upstage");
    }

    return data.data[0].embedding;
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
        const embedding = await generateEmbedding(corpus);

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
          VALUES (?, ?, 'solar-embedding-1', NOW(), NOW())
          ON DUPLICATE KEY UPDATE
            embedding = VALUES(embedding),
            updatedAt = NOW()
          `,
          [mentor.id, embeddingJson]
        );

        console.log(`✅ ${progress} Successfully vectorized ${mentor.name}`);
        successCount++;

        // Rate limiting: wait 500ms between API calls
        if (i < mentors.length - 1) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      } catch (error) {
        console.error(`❌ ${progress} Error processing mentor ${mentor.uuid}:`, error.message);
        if (error.message.includes("quota") || error.message.includes("rate")) {
          console.log("⏸️  Rate limit hit, waiting 30 seconds...");
          await new Promise((resolve) => setTimeout(resolve, 30000));
        }
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
