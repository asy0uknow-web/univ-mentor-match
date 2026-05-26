/**
 * 기존 mentor_embeddings 테이블의 모든 임베딩을 Gemini embedding-001 (1536차원)으로 재생성합니다.
 * 실행: node scripts/regenerate-embeddings.mjs
 */
import { createConnection } from "mysql2/promise";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const EMBEDDING_MODEL = "gemini-embedding-001";
const EMBEDDING_DIMENSIONS = 1536;
const MODEL_VERSION = "gemini-embedding-001-1536d";

function generateMentorDocument({ university, major, field, bio }) {
  const fieldKorean = {
    engineering: "공학",
    natural_science: "자연과학",
    business: "경영/경제",
    humanities: "인문학",
    education: "교육",
    liberal_arts: "사회과학",
    medicine: "의학/보건",
  };
  const fieldStr = fieldKorean[field] ?? field ?? "미지정";

  return `[멘토 정보 카테고리별 요약]
- 소속 대학: ${(university || "").trim()}
- 전공 학과: ${(major || "").trim()}
- 전문 분야: ${fieldStr}

[멘토 상세 자기소개 및 핵심 키워드]
${(bio || "").trim()}`.trim();
}

async function generateEmbedding(text, taskType = "RETRIEVAL_DOCUMENT") {
  const response = await ai.models.embedContent({
    model: EMBEDDING_MODEL,
    contents: text,
    config: { taskType, outputDimensionality: EMBEDDING_DIMENSIONS },
  });
  return response.embeddings[0].values;
}

async function main() {
  const conn = await createConnection(process.env.DATABASE_URL);

  // 임베딩이 있는 멘토 프로필 전체 조회
  const [mentors] = await conn.query(`
    SELECT mp.id, mp.university, mp.major, mp.field, mp.bio, me.modelVersion
    FROM mentor_profiles mp
    INNER JOIN mentor_embeddings me ON me.mentorId = mp.id
    ORDER BY mp.id
  `);

  console.log(`\n총 ${mentors.length}개 임베딩 재생성 시작...\n`);

  let success = 0;
  let failed = 0;

  for (const mentor of mentors) {
    try {
      const document = generateMentorDocument(mentor);
      console.log(`[${mentor.id}] 문서 생성 완료 (${document.length}자)`);

      const vector = await generateEmbedding(document, "RETRIEVAL_DOCUMENT");
      const embeddingJson = JSON.stringify(vector);

      await conn.query(
        `UPDATE mentor_embeddings SET embedding = ?, modelVersion = ?, updatedAt = NOW() WHERE mentorId = ?`,
        [embeddingJson, MODEL_VERSION, mentor.id]
      );

      console.log(`[${mentor.id}] ✅ ${mentor.university} ${mentor.major} → ${vector.length}차원 저장 완료`);
      success++;

      // Rate limit 방지: 요청 간 500ms 대기
      await new Promise((r) => setTimeout(r, 500));
    } catch (err) {
      console.error(`[${mentor.id}] ❌ 실패:`, err.message);
      failed++;
    }
  }

  console.log(`\n=== 완료 ===`);
  console.log(`성공: ${success}개 / 실패: ${failed}개`);

  // 결과 검증
  const [result] = await conn.query(
    `SELECT modelVersion, COUNT(*) AS count FROM mentor_embeddings GROUP BY modelVersion`
  );
  console.log("\n현재 DB 임베딩 현황:", result);

  await conn.end();
}

main().catch((err) => {
  console.error("스크립트 오류:", err);
  process.exit(1);
});
