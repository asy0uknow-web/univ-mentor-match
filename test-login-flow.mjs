import { getDb } from "./server/db.js";
import { hashPassword } from "./server/auth-utils.js";
import { users } from "./drizzle/schema.js";

async function testLoginFlow() {
  const db = await getDb();
  if (!db) {
    console.error("Database not available");
    process.exit(1);
  }

  // 테스트 계정 생성
  const testEmail = `testlogin-${Date.now()}@test.com`;
  const testPassword = "TestPassword123!";
  const passwordHash = await hashPassword(testPassword);
  const openId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  console.log("Creating test user...");
  console.log("Email:", testEmail);
  console.log("Password:", testPassword);

  try {
    const result = await db.insert(users).values({
      openId,
      email: testEmail,
      name: "", // 이름 없음 - 프로필 완성 필요
      passwordHash,
      emailVerified: false,
      loginMethod: "email",
      userType: null, // userType 없음 - 프로필 완성 필요
      role: "user",
    });

    console.log("\n✅ Test user created successfully");
    console.log("Use this account to test login:");
    console.log("  Email:", testEmail);
    console.log("  Password:", testPassword);
    console.log("\nExpected behavior:");
    console.log("  1. Login page -> enter credentials");
    console.log("  2. 'Login completed' toast appears");
    console.log("  3. Should redirect to /complete-profile (not home)");
  } catch (error) {
    console.error("Error creating test user:", error);
    process.exit(1);
  }
}

testLoginFlow();
