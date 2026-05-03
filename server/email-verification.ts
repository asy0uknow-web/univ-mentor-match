import { eq, and } from "drizzle-orm";
import { emailVerificationTokens, users } from "../drizzle/schema";
import { getDb } from "./db";
import crypto from "crypto";

/**
 * Generate a random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Create an email verification token for a user
 */
export async function createVerificationToken(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const token = generateVerificationToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

  await db.insert(emailVerificationTokens).values({
    userId,
    token,
    expiresAt,
  });

  return token;
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string): Promise<{ userId: number } | null> {
  const db = await getDb();
  if (!db) return null;

  // Find the token
  const result = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.token, token),
        eq(emailVerificationTokens.isUsed, false)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null; // Token not found or already used
  }

  const tokenRecord = result[0];

  // Check if token has expired
  if (new Date() > tokenRecord.expiresAt) {
    return null; // Token has expired
  }

  // Mark token as used
  await db
    .update(emailVerificationTokens)
    .set({ isUsed: true })
    .where(eq(emailVerificationTokens.id, tokenRecord.id));

  // Update user's emailVerified status
  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, tokenRecord.userId));

  return { userId: tokenRecord.userId };
}

/**
 * Get pending verification token for a user
 */
export async function getPendingVerificationToken(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.userId, userId),
        eq(emailVerificationTokens.isUsed, false)
      )
    )
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  return result[0].token;
}
