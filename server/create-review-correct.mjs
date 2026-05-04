import { getDb } from "./db.ts";
import { reviews, bookings } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function createReview() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    // 예약 정보 조회
    const booking = await db.select().from(bookings).where(
      eq(bookings.id, 180001)
    );
    
    if (!booking.length) {
      console.error("❌ 예약 180001을 찾을 수 없습니다");
      return;
    }
    
    const { studentId, mentorId } = booking[0];
    
    console.log(`✓ 예약 정보: studentId=${studentId}, mentorId=${mentorId}`);
    
    // 리뷰 생성
    const result = await db.insert(reviews).values({
      bookingId: 180001,
      studentId,
      mentorId,
      rating: 5,
      comment: "멘토님의 상담이 정말 도움이 되었습니다. 진로 선택에 대해 명확한 방향을 제시해주셨고, 대학 생활에 대한 현실적인 조언도 많이 받았습니다. 감사합니다!",
    });
    
    console.log("✓ 리뷰 생성 완료");
    console.log(`리뷰 ID: ${result.insertId}`);
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
  
  process.exit(0);
}

createReview();
