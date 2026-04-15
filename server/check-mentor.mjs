import { getDb } from "./db.ts";
import { mentorProfiles } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function checkMentor() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    const mentor = await db.select().from(mentorProfiles).where(
      eq(mentorProfiles.id, 1260001)
    );
    
    if (!mentor.length) {
      console.error("❌ 멘토 프로필 1260001을 찾을 수 없습니다");
      return;
    }
    
    console.log("멘토 프로필 1260001 정보:");
    console.log(JSON.stringify(mentor[0], null, 2));
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
  
  process.exit(0);
}

checkMentor();
