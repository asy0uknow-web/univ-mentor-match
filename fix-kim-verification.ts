import { getDb } from './server/db';
import { users } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function fixKimVerification() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    console.log('🔧 김멘토 검증상태 수정 시작...\n');

    // 김멘토 검증상태를 "verified"로 변경
    await db.update(users)
      .set({
        verificationStatus: 'verified',
        verifiedAt: new Date(),
      })
      .where(eq(users.email, 'kim@test.com'));

    console.log('✅ 검증상태를 "verified"로 변경 완료');

    // 변경 확인
    const kimUser = await db.select().from(users).where(eq(users.email, 'kim@test.com')).limit(1);
    
    console.log('\n📧 변경된 사용자 정보:');
    console.log('   이메일:', kimUser[0].email);
    console.log('   이름:', kimUser[0].name);
    console.log('   역할(role):', kimUser[0].role);
    console.log('   검증상태(verificationStatus):', kimUser[0].verificationStatus);
    console.log('   검증시간(verifiedAt):', kimUser[0].verifiedAt);

    console.log('\n' + '='.repeat(60));
    console.log('✅ 김멘토 검증상태 수정 완료!');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

fixKimVerification();
