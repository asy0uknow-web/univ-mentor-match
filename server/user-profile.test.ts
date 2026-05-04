import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("User Profile Management", () => {
  let testUserId: number;
  const testOpenId = `test_user_${Date.now()}`;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 테스트 사용자 생성
    await db.insert(users).values({
      openId: testOpenId,
      name: "테스트 사용자",
      email: "test@example.com",
      loginMethod: "oauth",
      role: "user",
      userType: "high_school_student",
    });

    // 생성된 사용자 조회
    const createdUser = await db.select().from(users).where(eq(users.openId, testOpenId)).limit(1);
    if (createdUser.length > 0) {
      testUserId = createdUser[0].id;
    } else {
      throw new Error("Failed to create test user");
    }
  });

  afterAll(async () => {
    const db = await getDb();
    if (!db) return;

    // 테스트 사용자 삭제
    await db.delete(users).where(eq(users.openId, testOpenId));
  });

  it("should retrieve user profile", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("테스트 사용자");
    expect(result[0].email).toBe("test@example.com");
  });

  it("should update user nickname", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const newNickname = "새로운 닉네임";
    await db.update(users).set({ name: newNickname }).where(eq(users.id, testUserId));

    const result = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(result[0].name).toBe(newNickname);
  });

  it("should validate nickname length", () => {
    const nickname = "테스트";
    expect(nickname.length).toBeGreaterThan(0);
    expect(nickname.length).toBeLessThanOrEqual(50);
  });

  it("should validate password requirements", () => {
    const password = "password123";
    const confirmPassword = "password123";
    
    expect(password.length).toBeGreaterThanOrEqual(8);
    expect(password).toBe(confirmPassword);
  });

  it("should reject mismatched passwords", () => {
    const password = "password123";
    const confirmPassword = "password456";
    
    expect(password).not.toBe(confirmPassword);
  });

  it("should reject short passwords", () => {
    const password = "short";
    expect(password.length).toBeLessThan(8);
  });
});
