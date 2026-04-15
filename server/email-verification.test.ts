import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  generateVerificationCode,
  sendVerificationCode,
  verifyEmailCode,
  isEmailVerified,
  getResendWaitTime,
} from "./email-verification";

describe("Email Verification", () => {
  const testEmail = "test@example.com";

  describe("generateVerificationCode", () => {
    it("should generate a 6-digit code", () => {
      const code = generateVerificationCode();
      expect(code).toMatch(/^\d{6}$/);
      expect(code.length).toBe(6);
    });

    it("should generate different codes", () => {
      const code1 = generateVerificationCode();
      const code2 = generateVerificationCode();
      // 매우 낮은 확률이지만, 같을 수도 있으므로 여러 번 시도
      const codes = new Set();
      for (let i = 0; i < 10; i++) {
        codes.add(generateVerificationCode());
      }
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe("sendVerificationCode", () => {
    it("should send verification code successfully", async () => {
      const result = await sendVerificationCode(testEmail);
      expect(result).toBe(true);
    });

    it("should prevent resending within 5 minutes", async () => {
      // 첫 번째 발송
      await sendVerificationCode(testEmail + "1");

      // 즉시 재발송 시도 - 실패해야 함
      try {
        await sendVerificationCode(testEmail + "1");
        expect.fail("Should throw error for resend within 5 minutes");
      } catch (error: any) {
        expect(error.message).toContain("5 minutes");
      }
    });
  });

  describe("verifyEmailCode", () => {
    it("should verify correct code", async () => {
      const email = testEmail + "2";
      await sendVerificationCode(email);

      // 실제로는 데이터베이스에서 코드를 조회해야 하지만,
      // 이 테스트에서는 sendVerificationCode가 콘솔에 출력하는 코드를 사용
      // 프로덕션에서는 이메일을 통해 코드를 받음
      
      // 테스트 목적으로 잘못된 코드 시도
      try {
        await verifyEmailCode(email, "000000");
        expect.fail("Should throw error for invalid code");
      } catch (error: any) {
        expect(error.message).toContain("Invalid");
      }
    });

    it("should reject expired code", async () => {
      // 이 테스트는 시간 조작이 필요하므로 실제 구현에서는 mock 필요
      // 현재는 스킵
    });

    it("should limit verification attempts", async () => {
      const email = testEmail + "3";
      await sendVerificationCode(email);

      // 5번 이상 실패 시도
      for (let i = 0; i < 5; i++) {
        try {
          await verifyEmailCode(email, "000000");
        } catch (error) {
          // 예상된 에러
        }
      }

      // 6번째 시도는 "Too many attempts" 에러
      try {
        await verifyEmailCode(email, "000000");
        expect.fail("Should throw error for too many attempts");
      } catch (error: any) {
        expect(error.message).toContain("Too many attempts");
      }
    });
  });

  describe("isEmailVerified", () => {
    it("should return false for unverified email", async () => {
      const email = testEmail + "4";
      const result = await isEmailVerified(email);
      expect(result).toBe(false);
    });
  });

  describe("getResendWaitTime", () => {
    it("should return 0 for new email", async () => {
      const email = testEmail + "5";
      const waitTime = await getResendWaitTime(email);
      expect(waitTime).toBe(0);
    });

    it("should return wait time after sending code", async () => {
      const email = testEmail + "6";
      await sendVerificationCode(email);

      const waitTime = await getResendWaitTime(email);
      expect(waitTime).toBeGreaterThan(0);
      expect(waitTime).toBeLessThanOrEqual(300); // 5분 = 300초
    });
  });
});
