import { getDb } from './server/db.ts';
import { users, mentorProfiles, mentorVerifications } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const testMenteeEmail = 'test-mentee-' + Date.now() + '@test.com';
const testMentorEmail = 'test-mentor-' + Date.now() + '@test.com';
const testPassword = 'Test123456!';

async function createTestAccounts() {
  try {
    const db = await getDb();
    if (!db) {
      throw new Error('Database connection failed');
    }

    console.log('테스트 계정 생성 시작...\n');

    // 1. 멘티 계정 생성
    console.log('1. 멘티 계정 생성 중...');
    const menteeUser = await db.insert(users).values({
      email: testMenteeEmail,
      name: '테스트 멘티',
      role: 'student',
      password: testPassword,
    }).returning();
    
    console.log(`✓ 멘티 계정 생성 완료`);
    console.log(`  이메일: ${testMenteeEmail}`);
    console.log(`  비밀번호: ${testPassword}`);
    console.log(`  역할: 고등학생\n`);

    // 2. 멘토 계정 생성
    console.log('2. 멘토 계정 생성 중...');
    const mentorUser = await db.insert(users).values({
      email: testMentorEmail,
      name: '테스트 멘토',
      role: 'mentor',
      password: testPassword,
    }).returning();

    console.log(`✓ 멘토 계정 생성 완료`);
    console.log(`  이메일: ${testMentorEmail}`);
    console.log(`  비밀번호: ${testPassword}`);
    console.log(`  역할: 대학생\n`);

    // 3. 멘토 프로필 생성
    console.log('3. 멘토 프로필 생성 중...');
    const mentorProfile = await db.insert(mentorProfiles).values({
      userId: mentorUser[0].id,
      university: '서울대학교',
      major: '컴퓨터공학과',
      grade: '3',
      bio: '안녕하세요! 컴퓨터공학을 전공하고 있는 멘토입니다. 진로상담과 학업관리를 도와드립니다.',
      field: 'engineering',
      region: 'seoul',
    }).returning();

    console.log(`✓ 멘토 프로필 생성 완료`);
    console.log(`  대학: 서울대학교`);
    console.log(`  전공: 컴퓨터공학과`);
    console.log(`  학년: 3학년`);
    console.log(`  지역: 서울`);
    console.log(`  분야: 이공계\n`);

    // 4. 멘토 인증 요청 생성 (자동 승인)
    console.log('4. 멘토 인증 처리 중...');
    const verification = await db.insert(mentorVerifications).values({
      mentorId: mentorProfile[0].id,
      studentIdImageUrl: 'https://via.placeholder.com/300x400?text=Student+ID',
      verificationStatus: 'approved',
      rejectionReason: null,
    }).returning();

    console.log(`✓ 멘토 인증 완료 (승인됨)\n`);

    console.log('='.repeat(50));
    console.log('테스트 계정 생성 완료!');
    console.log('='.repeat(50));
    console.log('\n📝 테스트 계정 정보:\n');
    console.log('【멘티 계정】');
    console.log(`  이메일: ${testMenteeEmail}`);
    console.log(`  비밀번호: ${testPassword}\n`);
    console.log('【멘토 계정】');
    console.log(`  이메일: ${testMentorEmail}`);
    console.log(`  비밀번호: ${testPassword}`);
    console.log(`  대학: 서울대학교`);
    console.log(`  전공: 컴퓨터공학과`);
    console.log(`  학년: 3학년\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ 에러 발생:', error);
    process.exit(1);
  }
}

createTestAccounts();
