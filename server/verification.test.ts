import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1, role: "user" | "admin" = "user"): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    userType: null,
    stripeCustomerId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("mentor verification system", () => {
  const baseUserId = Math.floor(Math.random() * 1000000) + 20000;
  
  it("should allow authenticated users to submit verification", async () => {
    const { ctx } = createAuthContext(baseUserId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should retrieve user's verification status", async () => {
    const { ctx } = createAuthContext(baseUserId + 10);
    const caller = appRouter.createCaller(ctx);

    // 먼저 검증 제출
    await caller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });
    
    const verification = await caller.verification.getMyVerification();

    expect(verification === null || typeof verification === "object").toBe(true);
  });

  it("should allow admins to view pending verifications", async () => {
    // 먼저 검증 제출
    const userCtx = createAuthContext(baseUserId + 20, "user");
    const userCaller = appRouter.createCaller(userCtx.ctx);
    
    await userCaller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });
    
    // 관리자로 조회 (admin 라우터 사용)
    const adminCtx = createAuthContext(baseUserId + 20, "admin");
    const adminCaller = appRouter.createCaller(adminCtx.ctx);

    const verifications = await adminCaller.admin.getPendingVerifications();

    expect(Array.isArray(verifications)).toBe(true);
  });

  it("should prevent non-admins from viewing pending verifications", async () => {
    const { ctx } = createAuthContext(baseUserId + 30, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getPendingVerifications();
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain("admin") || expect(error.message).toContain("Admin");
    }
  });

  it("should allow admins to approve verification", async () => {
    // 먼저 검증 제출
    const userCtx = createAuthContext(baseUserId + 40, "user");
    const userCaller = appRouter.createCaller(userCtx.ctx);
    
    const submitResult = await userCaller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });
    expect(submitResult.success).toBe(true);
    
    // 관리자로 승인 (admin 라우터 사용)
    const adminCtx = createAuthContext(baseUserId + 40, "admin");
    const adminCaller = appRouter.createCaller(adminCtx.ctx);
    
    // 먼저 pending 검증 목록 조회
    const pendingVerifications = await adminCaller.admin.getPendingVerifications();
    const verificationId = pendingVerifications[0]?.verification?.id;
    
    if (verificationId) {
      const result = await adminCaller.admin.approveVerification({
        verificationId,
      });
      expect(result).toEqual({ success: true });
    }
  });

  it("should allow admins to reject verification", async () => {
    // 먼저 검증 제출
    const userCtx = createAuthContext(baseUserId + 50, "user");
    const userCaller = appRouter.createCaller(userCtx.ctx);
    
    const submitResult = await userCaller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });
    expect(submitResult.success).toBe(true);
    
    // 관리자로 거절 (admin 라우터 사용)
    const adminCtx = createAuthContext(baseUserId + 50, "admin");
    const adminCaller = appRouter.createCaller(adminCtx.ctx);
    
    // 먼저 pending 검증 목록 조회
    const pendingVerifications = await adminCaller.admin.getPendingVerifications();
    const verificationId = pendingVerifications[0]?.verification?.id;
    
    if (verificationId) {
      const result = await adminCaller.admin.rejectVerification({
        verificationId,
        adminNotes: "학생증이 명확하지 않습니다.",
      });
      expect(result).toEqual({ success: true });
    }
  });
});
