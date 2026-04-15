import { getDb } from "./db.ts";
import { bookings } from "../drizzle/schema.ts";
import { eq } from "drizzle-orm";

async function checkBooking() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("❌ 데이터베이스 연결 실패");
      return;
    }
    
    const booking = await db.select().from(bookings).where(
      eq(bookings.id, 180001)
    );
    
    if (!booking.length) {
      console.error("❌ 예약 180001을 찾을 수 없습니다");
      return;
    }
    
    console.log("예약 180001 상세정보:");
    console.log(JSON.stringify(booking[0], null, 2));
    
  } catch (error) {
    console.error("❌ 에러:", error.message);
  }
  
  process.exit(0);
}

checkBooking();
