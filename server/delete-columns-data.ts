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
    console.log("칼럼 데이터 삭제 시작...");

    // 1. mentorColumnComments 삭제
    console.log("- mentorColumnComments 삭제 중...");
    await db.delete(schema.mentorColumnComments).execute();
    console.log("  ✓ mentorColumnComments 삭제 완료");

    // 2. mentorColumnLikes 삭제
    console.log("- mentorColumnLikes 삭제 중...");
    await db.delete(schema.mentorColumnLikes).execute();
    console.log("  ✓ mentorColumnLikes 삭제 완료");

    // 3. mentorColumns 삭제
    console.log("- mentorColumns 삭제 중...");
    await db.delete(schema.mentorColumns).execute();
    console.log("  ✓ mentorColumns 삭제 완료");

    console.log("\n✅ 모든 칼럼 데이터 삭제 완료!");
  } catch (error) {
    console.error("❌ 오류 발생:", error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

main();
