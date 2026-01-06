import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role: "user",
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

describe("mentor profile", () => {
  it("should allow authenticated users to set user type", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.setUserType({
      userType: "university_student",
    });

    expect(result).toEqual({ success: true });
  });

  it("should retrieve empty profile for new users", async () => {
    const { ctx } = createAuthContext(999);
    const caller = appRouter.createCaller(ctx);

    const profile = await caller.mentor.getMyProfile();

    expect(profile).toBeNull();
  });
});

describe("mentor listing", () => {
  it("should return list of active mentors", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const mentors = await caller.mentor.listAll();

    expect(Array.isArray(mentors)).toBe(true);
  });
});

describe("notifications", () => {
  it("should return unread notification count", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const count = await caller.notification.getUnreadCount();

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
