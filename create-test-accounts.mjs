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
    const { users, mentorProfiles, menteeProfiles, mentorVerifications } = await import('./drizzle/schema.ts');

    // 비밀번호 해싱
    const kimPasswordHash = hashPassword('Kim12345');
    const parkPasswordHash = hashPassword('Park12345');

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
      userType: 'university_student',
      createdAt: new Date(),
    }).returning();

    console.log('✅ 김멘토 계정 생성:', kimResult[0]?.email);

    // 박멘티 계정 생성
    const parkResult = await db.insert(users).values({
      email: 'park@test.com',
      name: '박멘티',
      passwordHash: parkPasswordHash,
      emailVerified: true,
      role: 'student',
      userType: 'high_school_student',
      createdAt: new Date(),
    }).returning();

    console.log('✅ 박멘티 계정 생성:', parkResult[0]?.email);

    // 김멘토 프로필 생성
    if (kimResult[0]) {
      const mentorProfile = await db.insert(mentorProfiles).values({
        userId: kimResult[0].id,
        university: '고려대학교',
        major: '컴퓨터과학과',
        admissionYear: 2022,
        gender: 'male',
        bio: '안녕하세요! 고려대 컴퓨터과학과 22학번 김멘토입니다. 프로그래밍, 대학 생활, 전공 공부 등 다양한 주제로 멘토링을 제공합니다.',
        field: 'CS/IT',
        consultationTypes: JSON.stringify(['career_guidance', 'major_exploration', 'exam_preparation']),
        regions: JSON.stringify(['Seoul', 'Incheon']),
        availableHours: JSON.stringify(['weekday_evening', 'weekend']),
        hourlyRate: 25000,
        verificationStatus: 'approved',
        isActive: true,
        isDeleted: false,
        createdAt: new Date(),
      }).returning();

      console.log('✅ 김멘토 프로필 생성 완료');

      // 김멘토 학적 인증 생성 (자동 승인)
      const verification = await db.insert(mentorVerifications).values({
        userId: kimResult[0].id,
        status: 'approved',
        studentIdUrl: 'https://example.com/kim_student_id.jpg',
        approvedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();

      console.log('✅ 김멘토 학적 인증 승인 완료');
    }

    // 박멘티 프로필 생성
    if (parkResult[0]) {
      const menteeProfile = await db.insert(menteeProfiles).values({
        userId: parkResult[0].id,
        school: '서울과학고등학교',
        grade: 3,
        interests: JSON.stringify(['Computer Science', 'AI', 'Web Development']),
        bio: '안녕하세요! 서울과학고 3학년 박멘티입니다. 대학 진학과 전공 선택에 대해 고민 중이며, 다양한 멘토님들의 조언을 듣고 싶습니다.',
        createdAt: new Date(),
      }).returning();

      console.log('✅ 박멘티 프로필 생성 완료');
    }

    console.log('\n✅ 모든 테스트 계정 생성 완료!\n');
    console.log('📧 김멘토 (멘토):');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: Kim12345');
    console.log('   학교: 고려대학교 컴퓨터과학과 22학번');
    console.log('   학적 인증: 승인됨\n');
    console.log('📧 박멘티 (멘티):');
    console.log('   이메일: park@test.com');
    console.log('   비밀번호: Park12345');
    console.log('   학교: 서울과학고등학교 3학년');

  } catch (error) {
    console.error('❌ 계정 생성 실패:', error.message);
    console.error(error);
  }
}

createTestAccounts();
