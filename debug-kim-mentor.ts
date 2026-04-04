import { getDb } from './server/db';
import { users, mentorProfiles } from './drizzle/schema';
import { eq } from 'drizzle-orm';

async function debugKimMentor() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('❌ 데이터베이스 연결 실패');
      process.exit(1);
    }

    console.log('🔍 김멘토 데이터 확인\n');

    // 1. 사용자 정보 확인
    const kimUser = await db.select().from(users).where(eq(users.email, 'kim@test.com')).limit(1);
    
    if (kimUser.length === 0) {
      console.error('❌ 김멘토 사용자를 찾을 수 없습니다.');
      process.exit(1);
    }

    console.log('📧 사용자 정보:');
    console.log('   ID:', kimUser[0].id);
    console.log('   이메일:', kimUser[0].email);
    console.log('   이름:', kimUser[0].name);
    console.log('   역할(role):', kimUser[0].role);
    console.log('   사용자타입(userType):', kimUser[0].userType);
    console.log('   검증상태(verificationStatus):', kimUser[0].verificationStatus);

    // 2. 멘토 프로필 확인
    const mentorProfile = await db.select().from(mentorProfiles).where(eq(mentorProfiles.userId, kimUser[0].id)).limit(1);
    
    if (mentorProfile.length === 0) {
      console.log('\n❌ 멘토 프로필이 없습니다!');
    } else {
      console.log('\n👨‍🎓 멘토 프로필:');
      console.log('   ID:', mentorProfile[0].id);
      console.log('   UUID:', mentorProfile[0].uuid);
      console.log('   대학:', mentorProfile[0].university);
      console.log('   학과:', mentorProfile[0].major);
      console.log('   학년:', mentorProfile[0].grade);
      console.log('   지역:', mentorProfile[0].region);
      console.log('   활성화(isActive):', mentorProfile[0].isActive);
      console.log('   삭제됨(isDeleted):', mentorProfile[0].isDeleted);
      console.log('   검증상태(verificationStatus):', mentorProfile[0].verificationStatus);
      console.log('   평점:', mentorProfile[0].averageRating);
      console.log('   리뷰 수:', mentorProfile[0].reviewCount);
    }

    // 3. 모든 멘토 프로필 조회
    const allMentors = await db.select().from(mentorProfiles).limit(10);
    console.log('\n📋 전체 멘토 프로필 수:', allMentors.length);
    allMentors.forEach((mentor, idx) => {
      console.log(`   ${idx + 1}. ${mentor.university} - ${mentor.major} (isDeleted: ${mentor.isDeleted})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ 오류:', error);
    process.exit(1);
  }
}

debugKimMentor();
