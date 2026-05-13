import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Mentor data - 양주혁 (ID: 1)
const mentor1 = {
  id: 1,
  name: "양주혁",
  university: "부산대학교",
  major: "기계공학부",
  bio: "안녕하세요, 부산대학교 기계공학부 학생 양주혁입니다. 저는 입시 과정에서 얻은 경험을 바탕으로 고등학생들을 도와주고 싶습니다.",
};

// Mentor data - 최세영 (ID: 30001)
const mentor2 = {
  id: 30001,
  name: "최세영",
  university: "부산대학교",
  major: "컴퓨터공학부",
  bio: "안녕하세요! 부산대학교 컴퓨터공학부 최세영입니다. 수시 학종으로 입학했고, 대학 생활 중 다양한 프로젝트 경험이 있습니다.",
};

const mentors = [mentor1, mentor2];

// Mock feature extraction
function extractMentorFeatures(mentor) {
  const mockFeatures = {
    양주혁: {
      admissionTypes: ["학생부종합", "수시"],
      highSchoolTypes: ["일반고"],
      strengths: ["입시 전략", "대학 선택", "멘탈 관리"],
      targetStudents: ["수시 준비생", "성적 향상 필요"],
      experiences: ["개인 과외 경험", "학생부 작성 지도"],
      majorDescription:
        "기계공학부는 기계 설계, 제조, 자동화 등을 다루는 학과입니다. 4차 산업혁명 시대에 필수적인 인재를 양성합니다.",
      admissionAchievements: "부산대학교 기계공학부 수시 합격",
    },
    최세영: {
      admissionTypes: ["학생부종합"],
      highSchoolTypes: ["일반고"],
      strengths: ["프로그래밍", "대학 생활 적응", "진로 상담"],
      targetStudents: ["수시 준비생", "진로 미정"],
      experiences: ["프로젝트 경험", "학생부 작성 지도"],
      majorDescription:
        "컴퓨터공학부는 소프트웨어, 하드웨어, 인공지능 등 다양한 분야를 다룹니다. 미래 기술을 주도할 인재를 양성합니다.",
      admissionAchievements: "부산대학교 컴퓨터공학부 수시 합격",
    },
  };

  return mockFeatures[mentor.name] || mockFeatures.양주혁;
}

// Mock embedding generation
function generateEmbedding(text) {
  // Mock 768-dimensional vector
  const embedding = Array(768)
    .fill(0)
    .map(() => Math.random() * 2 - 1);
  return embedding;
}

async function processMentor(mentor) {
  console.log(`\n처리 중: ${mentor.name} (ID: ${mentor.id})`);

  // Step 1: Extract features
  console.log("  → 특성 추출 중...");
  const features = extractMentorFeatures(mentor);

  // Step 2: Create search corpus
  const corpus = `
${mentor.name}
${mentor.university} ${mentor.major}
${mentor.bio}
${features.strengths?.join(", ")}
${features.targetStudents?.join(", ")}
${features.admissionTypes?.join(", ")}
${features.experiences?.join(", ")}
  `.trim();

  // Step 3: Generate embedding
  console.log("  → 임베딩 생성 중...");
  const embedding = generateEmbedding(corpus);

  // Step 4: Save to database
  console.log("  → 데이터베이스 저장 중...");
  const connection = await pool.getConnection();

  try {
    // Insert mentor features
    await connection.execute(
      `INSERT INTO mentor_features (mentorId, admissionTypes, highSchoolTypes, strengths, targetStudents, experiences, majorDescription, admissionAchievements, confidenceScore)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        mentor.id,
        JSON.stringify(features.admissionTypes || []),
        JSON.stringify(features.highSchoolTypes || []),
        JSON.stringify(features.strengths || []),
        JSON.stringify(features.targetStudents || []),
        JSON.stringify(features.experiences || []),
        features.majorDescription || "",
        features.admissionAchievements || "",
        85, // Confidence score
      ]
    );

    // Insert search corpus
    await connection.execute(
      `INSERT INTO mentor_search_corpus (mentorId, corpus, tokens)
       VALUES (?, ?, ?)`,
      [
        mentor.id,
        corpus,
        JSON.stringify(corpus.split(/\s+/).filter((t) => t.length > 2)),
      ]
    );

    // Insert embedding
    await connection.execute(
      `INSERT INTO mentor_embeddings (mentorId, embedding, modelVersion)
       VALUES (?, ?, ?)`,
      [mentor.id, JSON.stringify(embedding), "text-embedding-3-small"]
    );

    console.log(`  ✅ ${mentor.name} 처리 완료`);
  } finally {
    connection.release();
  }
}

async function main() {
  try {
    console.log("🚀 두 멘토 데이터 처리 시작...\n");

    for (const mentor of mentors) {
      await processMentor(mentor);
    }

    console.log("\n✅ 모든 멘토 데이터 처리 완료!");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
