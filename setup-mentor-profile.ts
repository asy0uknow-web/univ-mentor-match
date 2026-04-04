import { getDb } from './server/db';
import { users, mentorProfiles, mentorConsultationTypes } from './drizzle/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

async function setupMentorProfile() {
  try {
    console.log('📝 김멘토 프로필 설정 시작...\n');

    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    // 1. 김멘토 계정을 멘토로 변경
    await db.update(users)
      .set({
        role: 'mentor',
        userType: 'university_student'
      })
      .where(eq(users.email, 'kim@test.com'));

    const kimUser = await db.select().from(users).where(eq(users.email, 'kim@test.com')).limit(1);
    console.log('✅ 김멘토 계정을 멘토로 변경 완료');
    console.log('   역할: mentor\n');

    // 2. 기존 멘토 프로필 삭제
    const existingProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, kimUser[0].id)).limit(1);
    if (existingProfile.length > 0) {
      await db.delete(mentorProfiles).where(eq(mentorProfiles.userId, kimUser[0].id));
      console.log('✅ 기존 프로필 삭제 완료\n');
    }

    // 3. 상세한 멘토 프로필 생성
    const mentorProfile = await db.insert(mentorProfiles).values({
      uuid: uuidv4(),
      userId: kimUser[0].id,
      university: '서울대학교',
      major: '컴퓨터공학부',
      grade: '4학년',
      bio: '안녕하세요! 저는 서울대학교 컴퓨터공학부 4학년 김멘토입니다. 대학 입시 준비부터 대학생활까지 폭넓은 경험을 바탕으로 여러분을 도와드리겠습니다.',
      region: '서울',
      isActive: true,
      isDeleted: false,
      verificationStatus: 'approved',
      field: '입시컨설팅,대학생활,진로상담',
      hourlyRate: 25000,
      availableSlots: 10,
      averageRating: 4.8,
      reviewCount: 42,
      createdAt: new Date(),
    }).returning();

    console.log('✅ 멘토 프로필 생성 완료');
    console.log('   대학: 서울대학교');
    console.log('   학과: 컴퓨터공학부');
    console.log('   학년: 4학년');
    console.log('   지역: 서울');
    console.log('   시간당 요금: 25,000원');
    console.log('   평점: 4.8/5.0');
    console.log('   리뷰 수: 42개\n');

    // 4. 상담 유형 추가
    const consultationTypes = [
      { name: '입시 전략 상담', duration: 60, description: '대학 입시 전략 및 학과 선택 상담' },
      { name: '자기소개서 첨삭', duration: 45, description: '자기소개서 및 면접 준비 첨삭' },
      { name: '대학생활 상담', duration: 60, description: '대학 생활 적응 및 진로 상담' },
      { name: '전공 학습 멘토링', duration: 90, description: '컴퓨터공학 전공 학습 지원' },
    ];

    for (const type of consultationTypes) {
      await db.insert(mentorConsultationTypes).values({
        uuid: uuidv4(),
        mentorId: mentorProfile[0].id,
        name: type.name,
        duration: type.duration,
        description: type.description,
        createdAt: new Date(),
      });
    }

    console.log('✅ 상담 유형 추가 완료');
    consultationTypes.forEach((type, idx) => {
      console.log(`   ${idx + 1}. ${type.name} (${type.duration}분)`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('✅ 김멘토 멘토 프로필 설정 완료!\n');
    console.log('📧 김멘토 (멘토 계정)');
    console.log('   이메일: kim@test.com');
    console.log('   비밀번호: kim1234');
    console.log('   역할: 멘토');
    console.log('   대학: 서울대학교');
    console.log('   학과: 컴퓨터공학부');
    console.log('   평점: 4.8/5.0 (42개 리뷰)');
    console.log('='.repeat(60));

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    process.exit(1);
  }
}

setupMentorProfile();
