import crypto from 'crypto';

// 비밀번호 해싱 함수 (auth-utils.ts와 동일)
function hashPassword(password) {
  return crypto
    .pbkdf2Sync(password, 'default-salt', 100000, 64, 'sha512')
    .toString('hex');
}

// 데이터베이스 연결 테스트
async function createTestAccounts() {
  try {
    // 동적 import로 db 모듈 로드
    const { db } = await import('./server/db.ts');
    const { users, mentorProfiles } = await import('./drizzle/schema.ts');

    // 비밀번호 해싱
    const kimPasswordHash = hashPassword('kim1234');
    const parkPasswordHash = hashPassword('park1234');

    console.log('🔐 비밀번호 해싱 완료');
    console.log('김멘토 해시:', kimPasswordHash.substring(0, 20) + '...');
    console.log('박멘티 해시:', parkPasswordHash.substring(0, 20) + '...\n');

    // 김멘토 계정 생성
    const kimResult = await db.insert(users).values({
      email: 'kim@test.com',
      name: '김멘토',
      passwordHash: kimPasswordHash,
      emailVerified: true,
      role: 'mentor',
      createdAt: new Date(),
    }).returning();

    console.log('✅ 김멘토 계정 생성:', kimResult[0]);

    // 박멘티 계정 생성
    const parkResult = await db.insert(users).values({
      email: 'park@test.com',
      name: '박멘티',
      passwordHash: parkPasswordHash,
      emailVerified: true,
      role: 'student',
      createdAt: new Date(),
    }).returning();

    console.log('✅ 박멘티 계정 생성:', parkResult[0]);

    // 김멘토 프로필 생성
    if (kimResult[0]) {
      const mentorProfile = await db.insert(mentorProfiles).values({
        userId: kimResult[0].id,
        university: '서울대학교',
        major: '컴퓨터공학부',
        grade: '4학년',
        bio: '안녕하세요! 서울대 컴퓨터공학부 4학년 김멘토입니다.',
        region: '서울',
        isActive: true,
        isDeleted: false,
        verificationStatus: 'approved',
        createdAt: new Date(),
      }).returning();

      console.log('✅ 김멘토 프로필 생성:', mentorProfile[0]);
    }

    console.log('\n✅ 모든 테스트 계정 생성 완료!\n');
    console.log('📧 김멘토 (멘토):');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: kim1234\n');
    console.log('📧 박멘티 (멘티):');
    console.log('   이메일: park@test.com');
    console.log('   비밀번호: park1234');

  } catch (error) {
    console.error('❌ 계정 생성 실패:', error.message);
    console.error(error);
  }
}

createTestAccounts();
