import { eq, and, gt } from "drizzle-orm";
import { emailVerificationCodes } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * 6자리 랜덤 인증 코드 생성
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 이메일로 인증 코드 발송
 * @param email 대상 이메일
 * @returns 발송 성공 여부
 */
export async function sendVerificationCode(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 기존 인증 코드 확인 (5분 이내 발송된 코드가 있는지)
    const existingCode = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.isVerified, false),
          gt(emailVerificationCodes.lastSentAt, new Date(Date.now() - 5 * 60 * 1000))
        )
      )
      .limit(1);

    if (existingCode.length > 0) {
      throw new Error("Please wait 5 minutes before requesting a new code");
    }

    // 새 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // 기존 미인증 코드 삭제 (같은 이메일의 이전 코드)
    await db
      .delete(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.isVerified, false)
        )
      );

    // 새 인증 코드 저장
    await db.insert(emailVerificationCodes).values({
      email,
      code,
      isVerified: false,
      attemptCount: 0,
      expiresAt,
    });

    // TODO: 실제 이메일 발송 로직 (SMTP 또는 이메일 서비스 사용)
    // 현재는 콘솔에 출력 (개발 환경)
    console.log(`[Email Verification] Code for ${email}: ${code}`);

    return true;
  } catch (error) {
    console.error("Failed to send verification code:", error);
    throw error;
  }
}

/**
 * 이메일 인증 코드 검증
 * @param email 대상 이메일
 * @param code 사용자가 입력한 인증 코드
 * @returns 검증 성공 여부
 */
export async function verifyEmailCode(email: string, code: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 인증 코드 조회
    const verificationRecord = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.code, code),
          eq(emailVerificationCodes.isVerified, false)
        )
      )
      .limit(1);

    if (verificationRecord.length === 0) {
      throw new Error("Invalid verification code");
    }

    const record = verificationRecord[0];

    // 만료 시간 확인
    if (new Date() > record.expiresAt) {
      throw new Error("Verification code expired");
    }

    // 시도 횟수 확인 (5회 이상 실패 시 차단)
    if (record.attemptCount >= 5) {
      throw new Error("Too many attempts. Please request a new code");
    }

    // 코드가 일치하면 검증 완료
    if (record.code === code) {
      await db
        .update(emailVerificationCodes)
        .set({ isVerified: true })
        .where(eq(emailVerificationCodes.id, record.id));

      return true;
    } else {
      // 시도 횟수 증가
      await db
        .update(emailVerificationCodes)
        .set({ attemptCount: record.attemptCount + 1 })
        .where(eq(emailVerificationCodes.id, record.id));

      throw new Error("Invalid verification code");
    }
  } catch (error) {
    console.error("Failed to verify email code:", error);
    throw error;
  }
}

/**
 * 이메일이 인증되었는지 확인
 * @param email 대상 이메일
 * @returns 인증 여부
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const verificationRecord = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.isVerified, true)
        )
      )
      .limit(1);

    return verificationRecord.length > 0;
  } catch (error) {
    console.error("Failed to check email verification:", error);
    return false;
  }
}

/**
 * 재발송 가능 시간 확인 (5분 대기)
 * @param email 대상 이메일
 * @returns 남은 대기 시간 (초 단위), 0이면 재발송 가능
 */
export async function getResendWaitTime(email: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const lastCode = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        and(
          eq(emailVerificationCodes.email, email),
          eq(emailVerificationCodes.isVerified, false)
        )
      )
      .orderBy(emailVerificationCodes.lastSentAt)
      .limit(1);

    if (lastCode.length === 0) {
      return 0; // 이전 코드가 없으면 재발송 가능
    }

    const lastSentTime = lastCode[0].lastSentAt.getTime();
    const currentTime = Date.now();
    const elapsedTime = currentTime - lastSentTime;
    const waitTime = 5 * 60 * 1000; // 5분

    if (elapsedTime >= waitTime) {
      return 0; // 재발송 가능
    }

    return Math.ceil((waitTime - elapsedTime) / 1000); // 남은 시간 (초)
  } catch (error) {
    console.error("Failed to get resend wait time:", error);
    return 0;
  }
}
