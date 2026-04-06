import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema.js";
import { eq } from "drizzle-orm";

// 데이터베이스 연결
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "univmatch",
});

const db = drizzle(connection, { schema });

async function deleteAllQnAData() {
  try {
    console.log("QnA 데이터 삭제 시작...");

    // 1. answerLikes 삭제
    console.log("- answerLikes 삭제 중...");
    await db.delete(schema.answerLikes).execute();
    console.log("  ✓ answerLikes 삭제 완료");

    // 2. answers 삭제
    console.log("- answers 삭제 중...");
    await db.delete(schema.answers).execute();
    console.log("  ✓ answers 삭제 완료");

    // 3. questions 삭제
    console.log("- questions 삭제 중...");
    await db.delete(schema.questions).execute();
    console.log("  ✓ questions 삭제 완료");

    console.log("\n✅ 모든 QnA 데이터 삭제 완료!");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

deleteAllQnAData();
