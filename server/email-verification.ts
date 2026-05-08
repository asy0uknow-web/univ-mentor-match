import { getDb } from "./db";
import { sql, eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import { emailVerificationCodes } from "../drizzle/schema";

// Gmail SMTP 트랜스포터 초기화
let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter {
  if (!transporter) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword = process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      throw new Error("Gmail credentials not configured. Set GMAIL_USER and GMAIL_APP_PASSWORD environment variables.");
    }

    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });
  }
  return transporter;
}

/**
 * 이메일 템플릿 생성 (HTML 형식)
 */
function getEmailTemplate(code: string): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9fafb;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
            color: white;
            padding: 40px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
          }
          .content {
            padding: 40px 20px;
          }
          .greeting {
            font-size: 16px;
            margin-bottom: 20px;
            color: #1f2937;
          }
          .code-section {
            background-color: #f3f4f6;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 30px 0;
            border-radius: 4px;
          }
          .code-label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          .code {
            font-size: 36px;
            font-weight: 700;
            color: #1f2937;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
            font-size: 14px;
            color: #92400e;
          }
          .footer {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
          }
          .footer-link {
            color: #3b82f6;
            text-decoration: none;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎓 유니브매치</h1>
          </div>
          
          <div class="content">
            <div class="greeting">
              안녕하세요! 👋<br>
              유니브매치 가입을 완료하기 위해 아래 인증 코드를 입력해주세요.
            </div>
            
            <div class="code-section">
              <div class="code-label">인증 코드</div>
              <div class="code">${code}</div>
            </div>
            
            <div class="warning">
              ⏰ <strong>이 코드는 10분 동안 유효합니다.</strong><br>
              코드를 공유하지 마세요. 유니브매치는 절대 이메일로 코드를 요청하지 않습니다.
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 14px; color: #6b7280;">
              <p style="margin: 0;">이 요청을 하지 않으셨다면, 이 이메일을 무시하세요.</p>
              <p style="margin: 10px 0 0 0;">문제가 있으신가요? <a href="mailto:support@univmatch.com" class="footer-link">support@univmatch.com</a>으로 문의해주세요.</p>
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">© 2026 유니브매치. All rights reserved.</p>
            <p style="margin: 5px 0 0 0;">이 이메일은 자동으로 발송되었습니다.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * 6자리 랜덤 인증 코드 생성
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * 이메일로 인증 코드 발송 (5분 재발송 제한)
 * @param email 대상 이메일
 * @returns 발송 성공 여부
 */
export async function sendVerificationCode(email: string): Promise<void> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 테스트 모드: test@example.com 패턴의 이메일은 이메일 발송 스킵
    if (process.env.NODE_ENV !== "production" && email.includes("@example.com")) {
      console.log(`[Email Verification] Test mode - skipping email send for ${email}`);
      // 테스트용 고정 코드 생성
      const testCode = "000000";
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료
      
      // 기존 코드 삭제
      await db.delete(emailVerificationCodes).where(eq(emailVerificationCodes.email, email));
      
      // 테스트 코드 저장
      await db.insert(emailVerificationCodes).values({
        email,
        code: testCode,
        isVerified: false,
        attemptCount: 0,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      console.log(`[Email Verification] Test code created: ${testCode}`);
      return;
    }

    // 기존 인증 코드 확인 (5분 이내 발송된 코드가 있는지)
    const existingCode = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        sql`${emailVerificationCodes.email} = ${email} 
            AND ${emailVerificationCodes.isVerified} = false 
            AND ${emailVerificationCodes.lastSentAt} > DATE_SUB(NOW(), INTERVAL 5 MINUTE)`
      )
      .limit(1);

    if (existingCode.length > 0) {
      throw new Error("Please wait 5 minutes before requesting a new code");
    }

    // 새로운 인증 코드 생성
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10분 후

    // 데이터베이스에 저장
    await db.insert(emailVerificationCodes).values({
      email,
      code,
      isVerified: false,
      attemptCount: 0,
      lastSentAt: new Date(),
      expiresAt,
    });

    // 이메일 발송
    const transporter = getTransporter();
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "🎓 유니브매치 이메일 인증 코드",
      html: getEmailTemplate(code),
    });

    console.log(`[Email Verification] Code sent to ${email}`);
  } catch (error) {
    console.error("[Email Verification] Error sending code:", error);
    throw error;
  }
}

/**
 * 인증 코드 검증
 * @param email 대상 이메일
 * @param code 입력된 인증 코드
 * @returns 검증 성공 여부
 */
export async function verifyEmailCode(
  email: string,
  code: string
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 테스트 모드: test@example.com 패턴의 이메일은 모든 코드 허용
    if (process.env.NODE_ENV !== "production" && email.includes("@example.com")) {
      console.log(`[Email Verification] Test mode - accepting code for ${email}`);
      return true;
    }

    // 인증 코드 조회
    const records = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        sql`${emailVerificationCodes.email} = ${email} 
            AND ${emailVerificationCodes.code} = ${code} 
            AND ${emailVerificationCodes.isVerified} = false`
      )
      .limit(1);

    const record = records[0];
    if (!record) {
      throw new Error("Invalid verification code");
    }

    // 코드 만료 확인
    if (new Date() > new Date(record.expiresAt)) {
      throw new Error("Verification code has expired");
    }

    // 시도 횟수 확인 (최대 5회)
    if (record.attemptCount >= 5) {
      throw new Error("Too many attempts. Please request a new code");
    }

    // 인증 완료 처리
    await db
      .update(emailVerificationCodes)
      .set({ isVerified: true, updatedAt: new Date() })
      .where(
        sql`${emailVerificationCodes.email} = ${email} AND ${emailVerificationCodes.code} = ${code}`
      );

    console.log(`[Email Verification] Code verified for ${email}`);
    return true;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    // Record가 없는 경우 (Invalid code)는 attemptCount 업데이트 시도 안 함
    if (errorMessage === "Invalid verification code") {
      console.error("[Email Verification] Invalid code provided for", email);
      throw error;
    }
    
    // 다른 에러의 경우 시도 횟수 증가 시도
    const db = await getDb();
    if (db) {
      try {
        // 먼저 해당 email+code 조합이 존재하는지 확인
        const existingRecords = await db
          .select()
          .from(emailVerificationCodes)
          .where(
            sql`${emailVerificationCodes.email} = ${email} 
                AND ${emailVerificationCodes.code} = ${code} 
                AND ${emailVerificationCodes.isVerified} = false`
          )
          .limit(1);
        
        // 존재할 때만 attemptCount 증가
        if (existingRecords.length > 0) {
          await db
            .update(emailVerificationCodes)
            .set({ 
              attemptCount: sql`${emailVerificationCodes.attemptCount} + 1`, 
              updatedAt: new Date() 
            })
            .where(
              sql`${emailVerificationCodes.email} = ${email} 
                  AND ${emailVerificationCodes.code} = ${code} 
                  AND ${emailVerificationCodes.isVerified} = false`
            );
        }
      } catch (updateError) {
        console.error("[Email Verification] Failed to update attempt count:", updateError);
      }
    }

    console.error("[Email Verification] Error verifying code:", error);
    throw error;
  }
}

/**
 * 이메일 인증 여부 확인
 * @param email 대상 이메일
 * @returns 인증 완료 여부
 */
export async function isEmailVerified(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    const records = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        sql`${emailVerificationCodes.email} = ${email} AND ${emailVerificationCodes.isVerified} = true`
      )
      .limit(1);

    return records.length > 0;
  } catch (error) {
    console.error("[Email Verification] Error checking verification status:", error);
    return false;
  }
}

/**
 * 재발송 대기 시간 조회 (초 단위)
 * @param email 대상 이메일
 * @returns 대기 시간 (초), 0이면 즉시 재발송 가능
 */
export async function getResendWaitTime(email: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    const records = await db
      .select()
      .from(emailVerificationCodes)
      .where(
        sql`${emailVerificationCodes.email} = ${email} 
            AND ${emailVerificationCodes.isVerified} = false`
      )
      .orderBy(sql`${emailVerificationCodes.lastSentAt} DESC`)
      .limit(1);

    if (records.length === 0) return 0;

    const lastSentAt = new Date(records[0].lastSentAt);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);
    const waitSeconds = Math.max(0, 300 - elapsedSeconds); // 5분 = 300초

    return waitSeconds;
  } catch (error) {
    console.error("[Email Verification] Error getting resend wait time:", error);
    return 0;
  }
}
