import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { users } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

// kim@test.com 계정 확인
const result = await pool.query(
  'SELECT id, email, "passwordHash" FROM users WHERE email = $1',
  ['kim@test.com']
);
const user = result.rows[0];
console.log('User:', { id: user.id, email: user.email, hashLength: user.passwordHash?.length, hashPreview: user.passwordHash?.substring(0, 20) });

// 비밀번호 해시 테스트
function hashPassword(password) {
  return crypto
    .pbkdf2Sync(password, process.env.PASSWORD_SALT || 'default-salt', 100000, 64, 'sha512')
    .toString('hex');
}

const testHash = hashPassword('test123');
console.log('test123 hash preview:', testHash.substring(0, 20));
console.log('Match test123:', testHash === user.passwordHash);

const testHash2 = hashPassword('Test1234!');
console.log('Test1234! hash preview:', testHash2.substring(0, 20));
console.log('Match Test1234!:', testHash2 === user.passwordHash);

await pool.end();
