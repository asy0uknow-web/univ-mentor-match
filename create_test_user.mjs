import { db } from "./server/db.ts";
import { users } from "./drizzle/schema.ts";
import bcrypt from "bcryptjs";

async function createTestUser() {
  const hashedPassword = await bcrypt.hash("Test1234!", 10);
  
  const result = await db.insert(users).values({
    openId: "test_flow_user_" + Date.now(),
    email: "test_flow_2026@naver.com",
    name: "테스트 사용자",
    userType: "high_school_student",
    passwordHash: hashedPassword,
    emailVerified: true,
    loginMethod: "email",
    role: "user",
  });
  
  console.log("Test user created:", result);
}

createTestUser().catch(console.error);
