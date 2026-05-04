import { db } from "./server/db.ts";
import { users } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

async function setupAdmin() {
  try {
    // 기존 계정 삭제
    const existing = await db.query.users.findFirst({
      where: eq(users.email, "univadmin@test.com"),
    });

    if (existing) {
      await db.delete(users).where(eq(users.id, existing.id));
      console.log("기존 계정 삭제됨");
    }

    // 새 계정 생성
    const hashedPassword = await bcrypt.hash("everland", 10);
    const result = await db.insert(users).values({
      openId: randomUUID(),
      name: "Admin",
      email: "univadmin@test.com",
      loginMethod: "email",
      passwordHash: hashedPassword,
      emailVerified: true,
      role: "admin",
      verificationStatus: "verified",
      verifiedAt: new Date(),
    }).returning();

    console.log("✅ Admin 계정 생성 완료!");
    console.log("📧 이메일: univadmin@test.com");
    console.log("🔐 비밀번호: everland");
  } catch (error) {
    console.error("❌ 오류:", error);
  }
}

setupAdmin();
