import { db } from '../server/db';
import { users } from '../drizzle/schema';
import { eq, sql } from 'drizzle-orm';
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto
    .pbkdf2Sync(password, process.env.PASSWORD_SALT || 'default-salt', 100000, 64, 'sha512')
    .toString('hex');
}

const result = await db.execute(sql`SELECT id, email, "passwordHash" FROM users WHERE email = 'kim@test.com' LIMIT 1`);
const user = result.rows[0] as any;
console.log('User:', { id: user.id, email: user.email, hashLength: user.passwordHash?.length, hashPreview: user.passwordHash?.substring(0, 20) });

const testHash = hashPassword('test123');
console.log('test123 hash preview:', testHash.substring(0, 20));
console.log('Match test123:', testHash === user.passwordHash);

process.exit(0);
