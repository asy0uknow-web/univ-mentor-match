import { getDb } from './server/db';

async function checkUser() {
  try {
    const db = await getDb();
    if (!db) {
      console.log("Database not available");
      return;
    }
    
    // 사용자 정보 조회
    console.log("=== s8079349@naver.com 사용자 정보 ===");
    const result = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.email, 's8079349@naver.com'),
    });
    
    console.log(JSON.stringify(result, null, 2));
    
    if (result) {
      console.log(`\n사용자 ID: ${result.id}`);
      console.log(`이름: ${result.name}`);
      console.log(`역할(role): ${result.role}`);
      console.log(`사용자 타입(userType): ${result.userType}`);
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

checkUser();
