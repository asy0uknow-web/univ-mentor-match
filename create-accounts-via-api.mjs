import crypto from 'crypto';

// 비밀번호 해싱 함수
function hashPassword(password) {
  return crypto
    .pbkdf2Sync(password, 'default-salt', 100000, 64, 'sha512')
    .toString('hex');
}

async function main() {
  try {
    const { db } = await import('./server/db.ts');
    const { users, mentorProfiles } = await import('./drizzle/schema.ts');

    console.log('📝 테스트 계정 생성 시작...\n');

    // 김멘토 계정 생성
    const kimHash = hashPassword('kim1234');
    const kimUser = await db.insert(users).values({
      email: 'kim@test.com',
      name: '김멘토',
      passwordHash: kimHash,
      emailVerified: true,
      role: 'mentor',
      createdAt: new Date(),
    }).returning();

    console.log('✅ 김멘토 계정 생성 완료');
    console.log('   ID:', kimUser[0].id);
    console.log('   이메일:', kimUser[0].email);

    // 박멘티 계정 생성
    const parkHash = hashPassword('park1234');
    const parkUser = await db.insert(users).values({
      email: 'park@test.com',
      name: '박멘티',
      passwordHash: parkHash,
      emailVerified: true,
      role: 'student',
      createdAt: new Date(),
    }).returning();

    console.log('\n✅ 박멘티 계정 생성 완료');
    console.log('   ID:', parkUser[0].id);
    console.log('   이메일:', parkUser[0].email);

    // 김멘토 프로필 생성
    const mentorProfile = await db.insert(mentorProfiles).values({
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
    }).returning();

    console.log('\n✅ 김멘토 프로필 생성 완료');
    console.log('   프로필 ID:', mentorProfile[0].id);

    console.log('\n' + '='.repeat(50));
    console.log('✅ 모든 테스트 계정 생성 완료!\n');
    console.log('📧 김멘토 (멘토)');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: kim1234');
    console.log('   대학: 서울대학교');
    console.log('   학과: 컴퓨터공학부\n');
    console.log('📧 박멘티 (멘티)');
    console.log('   이메일: park@test.com');
    console.log('   비밀번호: park1234');
    console.log('='.repeat(50));

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

main();
