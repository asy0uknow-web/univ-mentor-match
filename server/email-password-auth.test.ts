import { describe, it, expect, beforeEach } from "vitest";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "./auth-utils";

describe("Email/Password Authentication", () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123";
  const testName = "Test User";
  const testOpenId = `openid-${Date.now()}`;

  beforeEach(async () => {
    // 테스트 데이터 정리
    const db = await getDb();
    if (db) {
      await db.delete(users).where(eq(users.email, testEmail));
    }
  });

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const hash = await hashPassword(testPassword);
      expect(hash).toBeDefined();
      expect(hash).not.toBe(testPassword);
      expect(hash.length).toBeGreaterThan(0);
    });

    it("should verify correct password", async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword(testPassword, hash);
      expect(isValid).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const hash = await hashPassword(testPassword);
      const isValid = await verifyPassword("WrongPassword123", hash);
      expect(isValid).toBe(false);
    });

    it("should verify both hashes for same password", async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);
      // Both hashes should verify correctly
      const isValid1 = await verifyPassword(testPassword, hash1);
      const isValid2 = await verifyPassword(testPassword, hash2);
      expect(isValid1).toBe(true);
      expect(isValid2).toBe(true);
    });
  });

  describe("User Registration", () => {
    it("should create user with hashed password", async () => {
      const db = await getDb();
      if (!db) {
        expect.fail("Database not available");
        return;
      }

      const passwordHash = await hashPassword(testPassword);

      const result = await db.insert(users).values({
        openId: testOpenId,
        email: testEmail,
        name: testName,
        passwordHash,
        userType: "high_school_student",
        emailVerified: false,
      });

      expect(result).toBeDefined();

      // 사용자 조회
      const user = await db.select().from(users).where(eq(users.email, testEmail)).limit(1).then(rows => rows[0]);

      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
      expect(user?.name).toBe(testName);
      expect(user?.passwordHash).toBe(passwordHash);
      expect(user?.userType).toBe("high_school_student");
      expect(user?.emailVerified).toBe(false);
    });

    it("should store and retrieve user with email", async () => {
      const db = await getDb();
      if (!db) {
        expect.fail("Database not available");
        return;
      }

      const passwordHash = await hashPassword(testPassword);

      // 사용자 생성
      const result = await db.insert(users).values({
        openId: testOpenId,
        email: testEmail,
        name: testName,
        passwordHash,
        userType: "high_school_student",
        emailVerified: false,
      });

      expect(result).toBeDefined();

      // 사용자 조회
      const user = await db.select().from(users).where(eq(users.email, testEmail)).limit(1).then(rows => rows[0]);
      expect(user?.email).toBe(testEmail);
    });
  });

  describe("User Login", () => {
    beforeEach(async () => {
      // 로그인 테스트용 사용자 생성
      const db = await getDb();
      if (db) {
        const passwordHash = await hashPassword(testPassword);
        await db.insert(users).values({
          openId: testOpenId,
          email: testEmail,
          name: testName,
          passwordHash,
          userType: "university_student",
          emailVerified: false,
        });
      }
    });

    it("should find user by email", async () => {
      const db = await getDb();
      if (!db) {
        expect.fail("Database not available");
        return;
      }

      const user = await db.select().from(users).where(eq(users.email, testEmail)).limit(1).then(rows => rows[0]);

      expect(user).toBeDefined();
      expect(user?.email).toBe(testEmail);
    });

    it("should verify password on login", async () => {
      const db = await getDb();
      if (!db) {
        expect.fail("Database not available");
        return;
      }

      const user = await db.select().from(users).where(eq(users.email, testEmail)).limit(1).then(rows => rows[0]);

      expect(user).toBeDefined();

      if (user?.passwordHash) {
        const isValid = await verifyPassword(testPassword, user.passwordHash);
        expect(isValid).toBe(true);
      }
    });

    it("should reject login with wrong password", async () => {
      const db = await getDb();
      if (!db) {
        expect.fail("Database not available");
        return;
      }

      const user = await db.select().from(users).where(eq(users.email, testEmail)).limit(1).then(rows => rows[0]);

      expect(user).toBeDefined();

      if (user?.passwordHash) {
        const isValid = await verifyPassword("WrongPassword", user.passwordHash);
        expect(isValid).toBe(false);
      }
    });

    it("should reject login for non-existent user", async () => {
      const db = await getDb();
      if (!db) {
        expect.fail("Database not available");
        return;
      }

      const user = await db.select().from(users).where(eq(users.email, "nonexistent@example.com")).limit(1).then(rows => rows[0]);

      expect(user).toBeUndefined();
    });
  });

  describe("Password Requirements", () => {
    it("should accept password with uppercase, lowercase, and number", async () => {
      const validPassword = "ValidPass123";
      const hash = await hashPassword(validPassword);
      expect(hash).toBeDefined();
    });

    it("should work with long password", async () => {
      const longPassword = "VeryLongPassword123WithManyCharactersHere";
      const hash = await hashPassword(longPassword);
      const isValid = await verifyPassword(longPassword, hash);
      expect(isValid).toBe(true);
    });

    it("should work with special characters in password", async () => {
      const specialPassword = "Pass@word123!";
      const hash = await hashPassword(specialPassword);
      const isValid = await verifyPassword(specialPassword, hash);
      expect(isValid).toBe(true);
    });
  });
});
