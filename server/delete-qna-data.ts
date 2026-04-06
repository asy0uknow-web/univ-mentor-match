import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "../drizzle/schema";

async function main() {
  // DATABASE_URL 파싱
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL 환경변수가 없습니다.");
    process.exit(1);
  }

  // mysql://user:password@host:port/database?ssl=...
  const url = new URL(databaseUrl);
  const host = url.hostname;
  const port = parseInt(url.port || "3306");
  const user = url.username;
  const password = url.password;
  const database = url.pathname.split("/")[1];

  // 데이터베이스 연결
  const connection = await mysql.createConnection({
    host,
    port,
    user,
    password,
    database,
    ssl: { rejectUnauthorized: false },
  });

  const db = drizzle(connection, { schema, mode: "default" });

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

main();
