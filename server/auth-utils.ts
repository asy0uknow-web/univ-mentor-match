import crypto from 'crypto';

/**
 * 비밀번호를 해시합니다
 */
export async function hashPassword(password: string): Promise<string> {
  return crypto
    .pbkdf2Sync(password, process.env.PASSWORD_SALT || 'default-salt', 100000, 64, 'sha512')
    .toString('hex');
}

/**
 * 비밀번호를 검증합니다
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const newHash = await hashPassword(password);
  return newHash === hash;
}

/**
 * 이메일 형식을 검증합니다
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * 비밀번호 강도를 검증합니다 (최소 8자, 대문자, 소문자, 숫자 포함)
 */
export function validatePasswordStrength(password: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('비밀번호는 최소 8자 이상이어야 합니다');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('비밀번호는 대문자를 포함해야 합니다');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('비밀번호는 소문자를 포함해야 합니다');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('비밀번호는 숫자를 포함해야 합니다');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
