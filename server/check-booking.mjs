import { getDb } from "./db.ts";
import { bookings, users } from "../drizzle/schema.ts";
import { eq, and } from "drizzle-orm";

async function checkBooking() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    const parkUser = await db.select().from(users).where(
      eq(users.email, 'park@test.com')
    );
    
    if (!parkUser.length) {
      console.error("❌ park@test.com을 찾을 수 없습니다");
      return;
    }
    
    const parkId = parkUser[0].id;
    
    // park의 모든 예약 조회
    const allBookings = await db.select().from(bookings).where(
      eq(bookings.studentId, parkId)
    );
    
    console.log(`✓ park@test.com의 예약 목록:`);
    console.log(JSON.stringify(allBookings, null, 2));
    
    if (allBookings.length > 0) {
      const latestBooking = allBookings[allBookings.length - 1];
      console.log(`\n✓ 최신 예약 ID: ${latestBooking.id}`);
      console.log(`리뷰 작성 페이지: /review/create?bookingId=${latestBooking.id}`);
    }
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
  
  process.exit(0);
}

checkBooking();
