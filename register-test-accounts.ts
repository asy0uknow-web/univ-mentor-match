import { getDb } from './server/db';
import { users, mentorProfiles } from './drizzle/schema';
import { hashPassword } from './server/auth-utils';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function registerTestAccounts() {
  try {
    console.log('📝 테스트 계정 생성 시작...\n');

    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    // 기존 계정 삭제
    await db.delete(users).where(eq(users.email, 'kim@test.com'));
    await db.delete(users).where(eq(users.email, 'park@test.com'));
    console.log('✅ 기존 테스트 계정 삭제 완료\n');

    // 김멘토 계정 생성
    const kimHash = await hashPassword('kim1234');
    const kimOpenId = `email_${Date.now()}_kim`;
    
    await db.insert(users).values({
      openId: kimOpenId,
      email: 'kim@test.com',
      name: '김멘토',
      passwordHash: kimHash,
      emailVerified: true,
      loginMethod: 'email',
      role: 'user',
      userType: 'university_student',
      createdAt: new Date(),
    });

    const kimUser = await db.select().from(users).where(eq(users.email, 'kim@test.com')).limit(1);
    console.log('✅ 김멘토 계정 생성 완료');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: kim1234');
    console.log('   ID:', kimUser[0].id);

    // 박멘티 계정 생성
    const parkHash = await hashPassword('park1234');
    const parkOpenId = `email_${Date.now()}_park`;
    
    await db.insert(users).values({
      openId: parkOpenId,
      email: 'park@test.com',
      name: '박멘티',
      passwordHash: parkHash,
      emailVerified: true,
      loginMethod: 'email',
      role: 'user',
      userType: 'high_school_student',
      createdAt: new Date(),
    });

    const parkUser = await db.select().from(users).where(eq(users.email, 'park@test.com')).limit(1);
    console.log('\n✅ 박멘티 계정 생성 완료');
    console.log('   이메일: park@test.com');
    console.log('   비밀번호: park1234');
    console.log('   ID:', parkUser[0].id);

    // 김멘토 프로필 생성
    const existingProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, kimUser[0].id)).limit(1);
    if (existingProfile.length === 0) {
      await db.insert(mentorProfiles).values({
        uuid: uuidv4(),
        userId: kimUser[0].id,
        university: '서울대학교',
        major: '컴퓨터공학부',
        grade: '4학년',
        bio: '안녕하세요! 서울대 컴퓨터공학부 4학년 김멘토입니다. 입시 컨설팅과 대학생활 상담을 전문으로 합니다.',
        region: '서울',
        isActive: true,
        isDeleted: false,
        verificationStatus: 'approved',
        createdAt: new Date(),
      });
      console.log('\n✅ 김멘토 프로필 생성 완료');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ 모든 테스트 계정 생성 완료!\n');
    console.log('📧 김멘토 (멘토 계정)');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: kim1234');
    console.log('   대학: 서울대학교');
    console.log('   학과: 컴퓨터공학부\n');
    console.log('📧 박멘티 (멘티 계정)');
    console.log('   이메일: park@test.com');
    console.log('   비밀번호: park1234');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

registerTestAccounts();
