import { getDb } from './server/db';
import { users } from './drizzle/schema';

async function checkAccounts() {
  try {
    console.log('🔍 데이터베이스에서 계정 확인 중...\n');

    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    // 모든 사용자 조회
    const allUsers = await db.select().from(users);
    console.log(`총 ${allUsers.length}개의 사용자 계정이 있습니다.\n`);

    // 김멘토와 박멘티 계정 찾기
    const kimAccount = allUsers.find(u => u.email === 'kim@test.com');
    const parkAccount = allUsers.find(u => u.email === 'park@test.com');

    if (kimAccount) {
      console.log('✅ 김멘토 계정 발견:');
      console.log('   ID:', kimAccount.id);
      console.log('   이메일:', kimAccount.email);
      console.log('   이름:', kimAccount.name);
      console.log('   역할:', kimAccount.role);
      console.log('   이메일검증:', kimAccount.emailVerified);
      console.log('   비밀번호해시:', kimAccount.passwordHash?.substring(0, 20) + '...');
    } else {
      console.log('❌ 김멘토 계정을 찾을 수 없습니다.');
    }

    console.log();

    if (parkAccount) {
      console.log('✅ 박멘티 계정 발견:');
      console.log('   ID:', parkAccount.id);
      console.log('   이메일:', parkAccount.email);
      console.log('   이름:', parkAccount.name);
      console.log('   역할:', parkAccount.role);
      console.log('   이메일검증:', parkAccount.emailVerified);
      console.log('   비밀번호해시:', parkAccount.passwordHash?.substring(0, 20) + '...');
    } else {
      console.log('❌ 박멘티 계정을 찾을 수 없습니다.');
    }

    // 최근 생성된 계정들 표시
    console.log('\n📋 최근 생성된 계정들:');
    allUsers.slice(-5).forEach((user, idx) => {
      console.log(`${idx + 1}. ${user.email} (${user.name}) - ${user.role}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

checkAccounts();
