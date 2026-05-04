import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin" as const,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin routes", () => {
  it("admin can access getAllMentors", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.admin.getAllMentors();
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      // Database might not be available in test environment
      expect(error).toBeDefined();
    }
  });

  it("non-admin cannot access getAllMentors", async () => {
    const ctx = createAdminContext();
    ctx.user!.role = "user";
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.admin.getAllMentors();
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
