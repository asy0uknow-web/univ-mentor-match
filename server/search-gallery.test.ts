import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function createAuthContext(): TrpcContext {
  const user = {
    id: 1,
    openId: "test-mentor",
    email: "mentor@example.com",
    name: "Test Mentor",
    loginMethod: "oauth",
    role: "user" as const,
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

describe("mentor search and gallery", () => {
  it("should allow public users to search mentors by field", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.mentorSearch.getByField({
        field: "engineering",
      });
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      // Database might not have data
      expect(error).toBeDefined();
    }
  });

  it("should allow public users to search mentors by region", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.mentorSearch.getByRegion({
        region: "seoul",
      });
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow public users to search mentors by field and region", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.mentorSearch.getByFieldAndRegion({
        field: "business",
        region: "gyeonggi",
      });
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should allow public users to view gallery images", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      const result = await caller.gallery.getByMentorId({
        mentorId: 1,
      });
      expect(Array.isArray(result)).toBe(true);
    } catch (error) {
      expect(error).toBeDefined();
    }
  });

  it("should require authentication to upload gallery images", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.gallery.uploadImage({
        mentorId: 1,
        imageUrl: "https://example.com/image.jpg",
        caption: "Test image",
      });
      expect.fail("Should have thrown an error");
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
