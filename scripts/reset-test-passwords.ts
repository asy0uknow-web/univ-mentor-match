/**
 * QA 테스트용 계정 비밀번호 재설정 스크립트
 * 실행: npx tsx scripts/reset-test-passwords.ts
 */
import crypto from 'crypto';

// 현재 서버와 동일한 방식으로 해시 생성 (PASSWORD_SALT 없음 → default-salt 사용)
function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, process.env.PASSWORD_SALT || 'default-salt', 100000, 64, 'sha512')
    .toString('hex');
}

const testPassword = 'Test1234!';
const hash = hashPassword(testPassword);
console.log('Generated hash for Test1234!:', hash.substring(0, 20) + '...');
console.log('Full hash length:', hash.length);

// DB 업데이트 SQL 출력
console.log('\n--- SQL to run ---');
console.log(`UPDATE users SET "passwordHash" = '${hash}' WHERE email IN ('kim@test.com', 'park@test.com', 'qa.mentee.test2026@gmail.com');`);
