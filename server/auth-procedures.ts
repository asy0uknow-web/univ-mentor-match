import { publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { hashPassword, verifyPassword, validateEmail, validatePasswordStrength } from "./auth-utils";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./_core/cookies";
import { COOKIE_NAME } from "@shared/const";
import { users } from "../drizzle/schema";

export const signupProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(8),
    name: z.string().min(1).max(255),
    userType: z.enum(["high_school_student", "university_student"]),
  }))
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 이메일 검증
    if (!validateEmail(input.email)) {
      throw new Error("Invalid email format");
    }

    // 비밀번호 강도 검증
    const passwordValidation = validatePasswordStrength(input.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(", "));
    }

    // 이메일 중복 확인
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error("Email already registered");
    }

    // 비밀번호 해싱
    const passwordHash = await hashPassword(input.password);

    // 임시 openId 생성 (이메일/비밀번호 사용자)
    const openId = `email_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 사용자 생성
    await db.insert(users).values({
      openId,
      email: input.email,
      name: input.name,
      passwordHash,
      emailVerified: false,
      loginMethod: "email",
      userType: input.userType,
      role: "user",
    });

    // 생성된 사용자 조회
    const newUserResult = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (newUserResult.length === 0) {
      throw new Error("Failed to create user");
    }

    const user = newUserResult[0];

    // 세션 생성
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role,
    };

    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${JSON.stringify(sessionData)}; Path=/; HttpOnly; SameSite=Lax${cookieOptions.secure ? "; Secure" : ""}; Max-Age=${60 * 60 * 24 * 7}`
    );

    return {
      success: true,
      user: sessionData,
    };
  });

export const loginProcedure = publicProcedure
  .input(z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }))
  .mutation(async ({ ctx, input }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 사용자 조회
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.email, input.email))
      .limit(1);

    if (userResult.length === 0) {
      throw new Error("Invalid email or password");
    }

    const user = userResult[0];

    // 비밀번호 검증
    if (!user.passwordHash) {
      throw new Error("This account was not created with email/password");
    }

    const isPasswordValid = await verifyPassword(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // 세션 생성
    const sessionData = {
      id: user.id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      role: user.role,
    };

    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.setHeader(
      "Set-Cookie",
      `${COOKIE_NAME}=${JSON.stringify(sessionData)}; Path=/; HttpOnly; SameSite=Lax${cookieOptions.secure ? "; Secure" : ""}; Max-Age=${60 * 60 * 24 * 7}`
    );

    return {
      success: true,
      user: sessionData,
    };
  });
