import { getDb } from "./db.ts";
import { users } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function checkUser() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    const parkUser = await db.select().from(users).where(
      eq(users.email, 'park@test.com')
    );
    
    if (!parkUser.length) {
      console.error("❌ park@test.com을 찾을 수 없습니다");
      return;
    }
    
    console.log("park@test.com 사용자 정보:");
    console.log(JSON.stringify(parkUser[0], null, 2));
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
  
  process.exit(0);
}

checkUser();
