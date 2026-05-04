import { getDb } from "./db.ts";
import { users, mentorProfiles, bookings } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function createTestData() {
  try {
    console.log("🔍 사용자 조회 중...");
    
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    // kim@test.com (멘토) 조회
    const kimUser = await db.select().from(users).where(
      eq(users.email, 'kim@test.com')
    );
    
    // park@test.com (멘티) 조회
    const parkUser = await db.select().from(users).where(
      eq(users.email, 'park@test.com')
    );
    
    if (!kimUser.length || !parkUser.length) {
      console.error("❌ 사용자를 찾을 수 없습니다");
      console.log("kim@test.com:", kimUser.length > 0 ? "✓ 찾음" : "✗ 없음");
      console.log("park@test.com:", parkUser.length > 0 ? "✓ 찾음" : "✗ 없음");
      return;
    }
    
    const kimId = kimUser[0].id;
    const parkId = parkUser[0].id;
    
    console.log(`✓ kim@test.com (멘토) ID: ${kimId}`);
    console.log(`✓ park@test.com (멘티) ID: ${parkId}`);
    
    // kim의 멘토 프로필 확인
    const mentorProfile = await db.select().from(mentorProfiles).where(
      eq(mentorProfiles.userId, kimId)
    );
    
    if (!mentorProfile.length) {
      console.error("❌ kim@test.com의 멘토 프로필을 찾을 수 없습니다");
      return;
    }
    
    const mentorId = mentorProfile[0].id;
    console.log(`✓ 멘토 프로필 ID: ${mentorId}`);
    
    // 완료된 예약 생성
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() - 1); // 어제
    
    const booking = await db.insert(bookings).values({
      studentId: parkId,
      mentorId: mentorId,
      scheduledAt,
      duration: 1,
      totalAmount: 30000,
      consultationType: 'career_counseling',
      status: 'completed',
      consultationStartedAt: scheduledAt,
      consultationCompletedAt: new Date(scheduledAt.getTime() + 3600000),
    });
    
    console.log(`✓ 예약 생성 완료: ID ${booking.insertId}`);
    console.log(`\n🎉 테스트 준비 완료!`);
    console.log(`리뷰 작성 페이지: /review/create?bookingId=${booking.insertId}`);
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
    console.error(error);
  }
  
  process.exit(0);
}

createTestData();
