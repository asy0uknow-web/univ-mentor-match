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
  it("should allow authenticated users to submit verification", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should retrieve user's verification status", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const verification = await caller.verification.getMyVerification();

    expect(verification === null || typeof verification === "object").toBe(true);
  });

  it("should allow admins to view pending verifications", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const verifications = await caller.verification.getPendingVerifications();

    expect(Array.isArray(verifications)).toBe(true);
  });

  it("should prevent non-admins from viewing pending verifications", async () => {
    const { ctx } = createAuthContext(1, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.verification.getPendingVerifications();
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain("admin");
    }
  });

  it("should allow admins to approve verification", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.approveVerification({
      verificationId: 1,
    });

    expect(result).toEqual({ success: true });
  });

  it("should allow admins to reject verification", async () => {
    const { ctx } = createAuthContext(1, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.rejectVerification({
      verificationId: 1,
      adminNotes: "학생증이 명확하지 않습니다.",
    });

    expect(result).toEqual({ success: true });
  });
});
