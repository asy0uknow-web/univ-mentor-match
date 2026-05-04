import { getDb } from "./db.ts";
import { reviews } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function checkReview() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    // 예약 180001의 리뷰 조회
    const review = await db.select().from(reviews).where(
      eq(reviews.bookingId, 180001)
    );
    
    if (!review.length) {
      console.error("❌ 리뷰를 찾을 수 없습니다");
      return;
    }
    
    console.log("✓ 리뷰 정보:");
    console.log(JSON.stringify(review[0], null, 2));
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
  
  process.exit(0);
}

checkReview();
