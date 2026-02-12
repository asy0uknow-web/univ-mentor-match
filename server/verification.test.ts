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
  const uniqueUserId = Math.floor(Math.random() * 1000000) + 10000;
  
  it("should allow authenticated users to submit verification", async () => {
    const { ctx } = createAuthContext(uniqueUserId);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id.jpg",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should retrieve user's verification status", async () => {
    const { ctx } = createAuthContext(uniqueUserId);
    const caller = appRouter.createCaller(ctx);

    const verification = await caller.verification.getMyVerification();

    expect(verification === null || typeof verification === "object").toBe(true);
  });

  it("should allow admins to view pending verifications", async () => {
    const { ctx } = createAuthContext(uniqueUserId + 1, "admin");
    const caller = appRouter.createCaller(ctx);

    const verifications = await caller.verification.getPendingVerifications();

    expect(Array.isArray(verifications)).toBe(true);
  });

  it("should prevent non-admins from viewing pending verifications", async () => {
    const { ctx } = createAuthContext(uniqueUserId + 2, "user");
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.verification.getPendingVerifications();
      expect(true).toBe(false); // Should not reach here
    } catch (error: any) {
      expect(error.message).toContain("admin");
    }
  });

  it("should allow admins to approve verification", async () => {
    // First, get the verification created by the submit test above
    const { ctx: userCtx } = createAuthContext(uniqueUserId);
    const userCaller = appRouter.createCaller(userCtx);
    const myVerification = await userCaller.verification.getMyVerification();
    
    if (!myVerification) {
      // If no verification exists, submit one first
      await userCaller.verification.submitVerification({
        studentIdImageUrl: "https://example.com/student-id-approve.jpg",
      });
    }
    const verificationAfter = await userCaller.verification.getMyVerification();
    expect(verificationAfter).toBeDefined();

    const { ctx } = createAuthContext(uniqueUserId + 3, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.approveVerification({
      verificationId: verificationAfter!.id,
    });

    expect(result).toEqual({ success: true });
  });

  it("should allow admins to reject verification", async () => {
    // Create a new verification to reject
    const rejectUserId = uniqueUserId + 10;
    const { ctx: userCtx } = createAuthContext(rejectUserId);
    const userCaller = appRouter.createCaller(userCtx);
    await userCaller.verification.submitVerification({
      studentIdImageUrl: "https://example.com/student-id-reject.jpg",
    });
    const myVerification = await userCaller.verification.getMyVerification();
    expect(myVerification).toBeDefined();

    const { ctx } = createAuthContext(uniqueUserId + 4, "admin");
    const caller = appRouter.createCaller(ctx);

    const result = await caller.verification.rejectVerification({
      verificationId: myVerification!.id,
      adminNotes: "학생증이 명확하지 않습니다.",
    });

    expect(result).toEqual({ success: true });
  });
});
