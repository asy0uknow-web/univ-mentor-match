import { getDb } from './server/db';
import { users, mentorProfiles } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function checkKimRole() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    // 김멘토 계정 확인
    const kimUser = await db.select().from(users).where(eq(users.email, 'kim@test.com')).limit(1);
    
    if (kimUser.length === 0) {
      console.error('❌ 김멘토 계정을 찾을 수 없습니다.');
      process.exit(1);
    }

    console.log('🔍 김멘토 계정 정보:');
    console.log('   이메일:', kimUser[0].email);
    console.log('   이름:', kimUser[0].name);
    console.log('   역할(role):', kimUser[0].role);
    console.log('   사용자타입(userType):', kimUser[0].userType);
    console.log('   loginMethod:', kimUser[0].loginMethod);
    console.log('   ID:', kimUser[0].id);

    // 멘토 프로필 확인
    const mentorProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, kimUser[0].id)).limit(1);
    
    if (mentorProfile.length > 0) {
      console.log('\n✅ 멘토 프로필 존재:');
      console.log('   대학:', mentorProfile[0].university);
      console.log('   학과:', mentorProfile[0].major);
      console.log('   인증상태:', mentorProfile[0].verificationStatus);
    } else {
      console.log('\n❌ 멘토 프로필이 없습니다.');
    }

    // 문제 진단
    if (kimUser[0].role !== 'mentor') {
      console.log('\n⚠️ 문제: role이 "mentor"가 아닙니다. 현재:', kimUser[0].role);
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

checkKimRole();
