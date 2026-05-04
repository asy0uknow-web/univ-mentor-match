import { getDb } from "./db";
import { sql } from "drizzle-orm";
import nodemailer from "nodemailer";

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
            letter-spacing: 1px;
            margin-bottom: 10px;
          }
          .code {
            font-size: 36px;
            font-weight: 700;
            color: #3b82f6;
            letter-spacing: 4px;
            text-align: center;
            font-family: 'Courier New', monospace;
          }
          .warning {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
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
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">이메일 인증</p>
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
export async function sendVerificationCode(email: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // 기존 인증 코드 확인 (5분 이내 발송된 코드가 있는지)
    // TiDB lower_case_table_names 설정으로 인해 컬럼명이 소문자로 변환됨
    const existingCode = await db.execute(
      sql`SELECT * FROM email_verification_codes 
          WHERE email = ${email} 
          AND isverified = false 
          AND lastsentat > DATE_SUB(NOW(), INTERVAL 5 MINUTE)
          LIMIT 1`
    );

    if (existingCode[0] && Array.isArray(existingCode[0]) && existingCode[0].length > 0) {
      throw new Error("Please wait 5 minutes before requesting a new code");
    }

    // 새 인증 코드 생성
    const code = generateVerificationCode();
    const expiresat = new Date(Date.now() + 10 * 60 * 1000); // 10분 후 만료

    // 기존 미인증 코드 삭제 (같은 이메일의 이전 코드)
    await db.execute(
      sql`DELETE FROM email_verification_codes 
          WHERE email = ${email} AND isverified = false`
    );

    // 새 인증 코드 저장
    await db.execute(
      sql`INSERT INTO email_verification_codes (email, code, isverified, attemptcount, lastsentat, expiresat, createdat, updatedat)
          VALUES (${email}, ${code}, false, 0, NOW(), ${expiresat}, NOW(), NOW())`
    );

    // Gmail SMTP를 통해 실제 이메일 발송
    try {
      const transporter = getTransporter();
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: email,
        subject: "🎓 유니브매치 이메일 인증 코드",
        html: getEmailTemplate(code),
      });
      console.log(`[Email Verification] Code sent to ${email} via Gmail SMTP`);
    } catch (emailError) {
      console.error("[Email Verification] Gmail SMTP error:", emailError);
      // 데이터베이스에는 저장되었으므로, 콘솔에도 코드 출력 (개발 환경용)
      console.log(`[Email Verification] Fallback - Code for ${email}: ${code}`);
    }

    return true;
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

    // 인증 코드 조회
    const result = await db.execute(
      sql`SELECT * FROM email_verification_codes 
          WHERE email = ${email} AND code = ${code} AND isverified = false
          LIMIT 1`
    );

    const record = result[0] && Array.isArray(result[0]) && result[0][0];
    if (!record) {
      throw new Error("Invalid verification code");
    }

    // 코드 만료 확인
    if (new Date() > new Date(record.expiresat)) {
      throw new Error("Verification code has expired");
    }

    // 시도 횟수 확인 (최대 5회)
    if (record.attemptcount >= 5) {
      throw new Error("Too many attempts. Please request a new code");
    }

    // 인증 완료 처리
    await db.execute(
      sql`UPDATE email_verification_codes 
          SET isverified = true, updatedat = NOW()
          WHERE email = ${email} AND code = ${code}`
    );

    console.log(`[Email Verification] Code verified for ${email}`);
    return true;
  } catch (error) {
    const db = await getDb();
    if (db) {
      // 시도 횟수 증가
      await db.execute(
        sql`UPDATE email_verification_codes 
            SET attemptcount = attemptcount + 1, updatedat = NOW()
            WHERE email = ${email} AND code = ${code} AND isverified = false`
      );
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
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      sql`SELECT * FROM email_verification_codes 
          WHERE email = ${email} AND isverified = true
          LIMIT 1`
    );

    return result[0] && Array.isArray(result[0]) && result[0].length > 0;
  } catch (error) {
    console.error("[Email Verification] Error checking verification status:", error);
    return false;
  }
}

/**
 * 재발송 대기 시간 조회 (초 단위)
 * @param email 대상 이메일
 * @returns 대기 시간 (초), 0이면 재발송 가능
 */
export async function getResendWaitTime(email: string): Promise<number> {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const result = await db.execute(
      sql`SELECT lastsentat FROM email_verification_codes 
          WHERE email = ${email} AND isverified = false
          ORDER BY lastsentat DESC
          LIMIT 1`
    );

    if (!result[0] || !Array.isArray(result[0]) || result[0].length === 0) {
      return 0; // 이전 코드 없음, 바로 발송 가능
    }

    const lastSentAt = new Date((result[0] as any)[0].lastsentat);
    const now = new Date();
    const elapsedSeconds = Math.floor((now.getTime() - lastSentAt.getTime()) / 1000);
    const waitSeconds = Math.max(0, 5 * 60 - elapsedSeconds); // 5분 = 300초

    return waitSeconds;
  } catch (error) {
    console.error("[Email Verification] Error getting resend wait time:", error);
    return 0;
  }
}
