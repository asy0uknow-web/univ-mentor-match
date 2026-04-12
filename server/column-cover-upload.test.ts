import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(userId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "email",
    role: "user",
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
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("Column Cover Image Upload", () => {
  it("should upload cover image and return URL", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Base64 encoded test image (1x1 pixel PNG)
    const testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.mentorColumns.uploadCoverImage({
      imageData: testImageBase64,
    });

    expect(result).toBeDefined();
    expect(result.imageUrl).toBeDefined();
    expect(typeof result.imageUrl).toBe("string");
    expect(result.imageUrl).toContain("column-covers");
  });

  it("should reject invalid image types", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const invalidImageBase64 = "data:text/plain;base64,SGVsbG8gV29ybGQ=";

    try {
      await caller.mentorColumns.uploadCoverImage({
        imageData: invalidImageBase64,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Unsupported image type");
    }
  });

  it("should handle JPEG image", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Base64 encoded test JPEG image
    const jpegBase64 = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8VAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=";

    const result = await caller.mentorColumns.uploadCoverImage({
      imageData: jpegBase64,
    });

    expect(result).toBeDefined();
    expect(result.imageUrl).toBeDefined();
    expect(result.imageUrl).toContain("column-covers");
  });

  it("should handle GIF image", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Base64 encoded test GIF image (1x1 pixel)
    const gifBase64 = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

    const result = await caller.mentorColumns.uploadCoverImage({
      imageData: gifBase64,
    });

    expect(result).toBeDefined();
    expect(result.imageUrl).toBeDefined();
    expect(result.imageUrl).toContain("column-covers");
  });

  it("should handle WebP image", async () => {
    const ctx = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Base64 encoded test WebP image (1x1 pixel)
    const webpBase64 = "data:image/webp;base64,UklGRiYAAABXEBP/////AAEBAAEAAAEA";

    const result = await caller.mentorColumns.uploadCoverImage({
      imageData: webpBase64,
    });

    expect(result).toBeDefined();
    expect(result.imageUrl).toBeDefined();
    expect(result.imageUrl).toContain("column-covers");
  });

  it("should include user ID in file path", async () => {
    const userId = 12345;
    const ctx = createAuthContext(userId);
    const caller = appRouter.createCaller(ctx);

    const testImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    const result = await caller.mentorColumns.uploadCoverImage({
      imageData: testImageBase64,
    });

    expect(result.imageUrl).toBeDefined();
    expect(result.imageUrl).toContain(`column-covers/${userId}`);
  });
});
