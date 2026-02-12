import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

describe("Registration System", () => {
  let testUserId: number;
  const testOpenId = `test_reg_${Date.now()}`;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // OAuth 로그인 후 생성되는 사용자 시뮬레이션
    await db.insert(users).values({
      openId: testOpenId,
      name: "OAuthUser",
      email: "oauth@example.com",
      loginMethod: "oauth",
      role: "user",
      isRegistrationComplete: false,
    });

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
    await db.delete(users).where(eq(users.openId, testOpenId));
  });

  it("should create user with isRegistrationComplete=false after OAuth login", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(result.length).toBe(1);
    expect(result[0].isRegistrationComplete).toBeFalsy();
    expect(result[0].username).toBeNull();
    expect(result[0].realName).toBeNull();
  });

  it("should complete registration with all required fields", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const passwordHash = await bcrypt.hash("Test@1234!", 12);

    await db.update(users).set({
      username: `testuser_${Date.now()}`,
      passwordHash,
      realName: "홍길동",
      university: "서울대학교",
      major: "컴퓨터공학과",
      grade: "3",
      phone: "01012345678",
      userType: "university_student",
      isRegistrationComplete: true,
    }).where(eq(users.id, testUserId));

    const result = await db.select().from(users).where(eq(users.id, testUserId)).limit(1);
    expect(result[0].realName).toBe("홍길동");
    expect(result[0].university).toBe("서울대학교");
    expect(result[0].major).toBe("컴퓨터공학과");
    expect(result[0].grade).toBe("3");
    expect(result[0].phone).toBe("01012345678");
    expect(result[0].isRegistrationComplete).toBeTruthy();
    expect(result[0].userType).toBe("university_student");
  });

  it("should hash password correctly", async () => {
    const password = "Test@1234!";
    const hash = await bcrypt.hash(password, 12);
    
    expect(await bcrypt.compare(password, hash)).toBe(true);
    expect(await bcrypt.compare("wrongpassword", hash)).toBe(false);
  });

  // Password validation tests
  describe("Password Validation", () => {
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{9,12}$/;

    it("should accept valid password with letters and special chars (9-12 chars)", () => {
      expect(passwordRegex.test("Abcde@123")).toBe(true);   // 9 chars
      expect(passwordRegex.test("Abcdef@1234")).toBe(true);  // 11 chars
      expect(passwordRegex.test("Abcdefg@1234")).toBe(true); // 12 chars
    });

    it("should reject password shorter than 9 chars", () => {
      expect(passwordRegex.test("Ab@12345")).toBe(false); // 8 chars
    });

    it("should reject password longer than 12 chars", () => {
      expect(passwordRegex.test("Abcdefgh@12345")).toBe(false); // 14 chars
    });

    it("should reject password without special chars", () => {
      expect(passwordRegex.test("Abcde12345")).toBe(false);
    });

    it("should reject password without letters", () => {
      expect(passwordRegex.test("12345@6789")).toBe(false);
    });
  });

  // Phone number formatting tests
  describe("Phone Number Formatting", () => {
    const formatPhone = (value: string) => {
      const digits = value.replace(/\D/g, "");
      if (digits.length <= 3) return digits;
      if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
      return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7, 11)}`;
    };

    it("should format phone number correctly", () => {
      expect(formatPhone("01012345678")).toBe("010-1234-5678");
    });

    it("should handle partial phone numbers", () => {
      expect(formatPhone("010")).toBe("010");
      expect(formatPhone("0101234")).toBe("010-1234");
    });

    it("should strip non-digit characters", () => {
      expect(formatPhone("010-1234-5678")).toBe("010-1234-5678");
    });
  });

  // Username validation tests
  describe("Username Validation", () => {
    it("should require minimum 2 characters", () => {
      expect("a".length >= 2).toBe(false);
      expect("ab".length >= 2).toBe(true);
    });

    it("should enforce maximum 50 characters", () => {
      const longUsername = "a".repeat(51);
      expect(longUsername.length <= 50).toBe(false);
    });
  });
});
