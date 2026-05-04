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

describe("message system", () => {
  it("should allow authenticated users to send messages", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.message.send({
      recipientId: 2,
      content: "안녕하세요! 상담을 받고 싶습니다.",
    });

    expect(result).toHaveProperty("success");
    expect(result.success).toBe(true);
  });

  it("should retrieve inbox messages for user", async () => {
    const { ctx } = createAuthContext(2);
    const caller = appRouter.createCaller(ctx);

    const messages = await caller.message.getInbox();

    expect(Array.isArray(messages)).toBe(true);
  });

  it("should retrieve conversation between two users", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const conversation = await caller.message.getConversation({
      otherUserId: 2,
    });

    expect(Array.isArray(conversation)).toBe(true);
  });

  it("should mark message as read", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const result = await caller.message.markAsRead({
      messageId: 1,
    });

    expect(result).toEqual({ success: true });
  });

  it("should get unread message count", async () => {
    const { ctx } = createAuthContext(1);
    const caller = appRouter.createCaller(ctx);

    const count = await caller.message.getUnreadCount();

    expect(typeof count).toBe("number");
    expect(count).toBeGreaterThanOrEqual(0);
  });
});
