import { db } from './server/db';
import { users } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function createAdminAccount() {
  try {
    const email = 'univadmin@test.com';
    const password = 'everland';
    
    // 기존 계정 삭제
    await db.delete(users).where(eq(users.email, email));
    
    // 새 계정 생성
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await db.insert(users).values({
      openId: randomUUID(),
      email: email,
      name: 'Admin',
      loginMethod: 'email',
      passwordHash: hashedPassword,
      emailVerified: true,
      role: 'admin',
      verificationStatus: 'verified',
      verifiedAt: new Date(),
    }).returning();
    
    console.log('✅ Admin 계정 생성 완료:', newUser);
    process.exit(0);
  } catch (error) {
    console.error('❌ 에러:', error);
    process.exit(1);
  }
}

createAdminAccount();
