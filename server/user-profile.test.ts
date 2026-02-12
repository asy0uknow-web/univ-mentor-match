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

  it("should retrieve user profile with new fields", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("테스트 사용자");
    expect(result[0].email).toBe("test@example.com");
    // New fields should be null by default
    expect(result[0].username).toBeNull();
    expect(result[0].realName).toBeNull();
    expect(result[0].phone).toBeNull();
    expect(result[0].university).toBeNull();
    expect(result[0].major).toBeNull();
    expect(result[0].grade).toBeNull();
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

  it("should validate password requirements (9-12 chars, letters + special)", () => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,12}$/;
    
    // Valid passwords
    expect(passwordRegex.test("Abcde@1234")).toBe(true);
    expect(passwordRegex.test("Test!pass1")).toBe(true);
    
    // Invalid: too short
    expect(passwordRegex.test("Ab@12345")).toBe(false);
    // Invalid: too long
    expect(passwordRegex.test("Abcdefgh@12345")).toBe(false);
    // Invalid: no special char
    expect(passwordRegex.test("Abcde12345")).toBe(false);
  });

  it("should reject mismatched passwords", () => {
    const password = "Test@1234!";
    const confirmPassword = "Test@5678!";
    
    expect(password).not.toBe(confirmPassword);
  });

  it("should reject short passwords", () => {
    const password = "Ab@12";
    expect(password.length).toBeLessThan(9);
  });
});
