import { getDb } from './server/db';
import { users, mentorProfiles } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { randomUUID } from 'crypto';

async function fixKimMentor() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    console.log('🔧 김멘토 계정 수정 시작...\n');

    // 1. 김멘토 역할을 mentor로 변경
    await db.update(users)
      .set({ role: 'mentor' })
      .where(eq(users.email, 'kim@test.com'));

    console.log('✅ 역할을 "mentor"로 변경 완료');

    // 2. 김멘토 정보 조회
    const kimUser = await db.select().from(users).where(eq(users.email, 'kim@test.com')).limit(1);

    // 3. 멘토 프로필 생성
    await db.insert(mentorProfiles).values({
      uuid: randomUUID(),
      userId: kimUser[0].id,
      university: '서울대학교',
      major: '컴퓨터공학부',
      grade: '4',
      bio: '안녕하세요! 저는 서울대학교 컴퓨터공학부 4학년 김멘토입니다. 대학 입시 준비부터 대학생활까지 폭넓은 경험을 바탕으로 여러분을 도와드리겠습니다.',
      region: 'seoul',
      isActive: true,
      isDeleted: false,
      verificationStatus: 'approved',
      field: 'engineering',
      hourlyRate: 25000,
      availableSlots: 10,
      averageRating: 4.8,
      reviewCount: 42,
      createdAt: new Date(),
    });

    console.log('✅ 멘토 프로필 생성 완료\n');

    console.log('='.repeat(60));
    console.log('✅ 김멘토 수정 완료!\n');
    console.log('📧 김멘토 (멘토 계정)');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: kim1234');
    console.log('   역할: mentor');
    console.log('   대학: 서울대학교');
    console.log('   학과: 컴퓨터공학부');
    console.log('   평점: 4.8/5.0 (42개 리뷰)');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

fixKimMentor();
