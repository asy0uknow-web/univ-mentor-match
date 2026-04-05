import { getDb } from "./db";
import { bookings, users, mentorProfiles, notifications } from "../drizzle/schema";
import { eq, and, lte, gte, isNull } from "drizzle-orm";

/**
 * 상담 시작 30분 전 알림 발송
 */
export async function sendConsultationReminders() {
  const db = await getDb();
  if (!db) return;

  const now = new Date();
  const in30Minutes = new Date(now.getTime() + 30 * 60 * 1000);
  const in31Minutes = new Date(now.getTime() + 31 * 60 * 1000);

  // 30분 전 알림을 아직 보내지 않은 상담 조회
  const bookingsIn30Min = await db
    .select({
      booking: bookings,
      student: users,
      mentorProfile: mentorProfiles,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.studentId, users.id))
    .leftJoin(mentorProfiles, eq(bookings.mentorId, mentorProfiles.id))
    .where(
      and(
        eq(bookings.status, "confirmed"),
        gte(bookings.scheduledAt, in30Minutes),
        lte(bookings.scheduledAt, in31Minutes),
        eq(bookings.notified30MinBefore, false)
      )
    );

  // 각 상담에 대해 멘티와 멘토에게 알림 발송
  for (const item of bookingsIn30Min) {
    const booking = item.booking;
    const student = item.student;
    const mentorProfile = item.mentorProfile;

    if (student && mentorProfile?.userId) {
      // 멘티에게 알림
      await db.insert(notifications).values({
        userId: booking.studentId,
        type: "consultation_reminder",
        title: "상담 시작 30분 전입니다",
        message: `예약하신 상담이 30분 후에 시작됩니다. 예약 내역 페이지에서 확인해주세요.`,
        relatedId: booking.id,
      });

      // 멘토에게 알림
      await db.insert(notifications).values({
        userId: mentorProfile.userId,
        type: "consultation_reminder",
        title: "상담 시작 30분 전입니다",
        message: `예약하신 상담이 30분 후에 시작됩니다. 예약 내역 페이지에서 확인해주세요.`,
        relatedId: booking.id,
      });

      // 30분 전 알림 발송 완료 표시
      await db
        .update(bookings)
        .set({ notified30MinBefore: true })
        .where(eq(bookings.id, booking.id));
    }
  }

  // 10분 전 알림 발송
  const in10Minutes = new Date(now.getTime() + 10 * 60 * 1000);
  const in11Minutes = new Date(now.getTime() + 11 * 60 * 1000);

  const bookingsIn10Min = await db
    .select({
      booking: bookings,
      student: users,
      mentorProfile: mentorProfiles,
    })
    .from(bookings)
    .leftJoin(users, eq(bookings.studentId, users.id))
    .leftJoin(mentorProfiles, eq(bookings.mentorId, mentorProfiles.id))
    .where(
      and(
        eq(bookings.status, "confirmed"),
        gte(bookings.scheduledAt, in10Minutes),
        lte(bookings.scheduledAt, in11Minutes),
        eq(bookings.notified10MinBefore, false)
      )
    );

  for (const item of bookingsIn10Min) {
    const booking = item.booking;
    const student = item.student;
    const mentorProfile = item.mentorProfile;

    if (student && mentorProfile?.userId) {
      // 멘티에게 알림
      await db.insert(notifications).values({
        userId: booking.studentId,
        type: "consultation_urgent_reminder",
        title: "상담 시작 10분 전입니다",
        message: `상담이 곧 시작됩니다. 예약 내역 페이지에서 시작 버튼을 눌러주세요.`,
        relatedId: booking.id,
      });

      // 멘토에게 알림
      await db.insert(notifications).values({
        userId: mentorProfile.userId,
        type: "consultation_urgent_reminder",
        title: "상담 시작 10분 전입니다",
        message: `상담이 곧 시작됩니다. 예약 내역 페이지에서 시작 버튼을 눌러주세요.`,
        relatedId: booking.id,
      });

      // 10분 전 알림 발송 완료 표시
      await db
        .update(bookings)
        .set({ notified10MinBefore: true })
        .where(eq(bookings.id, booking.id));
    }
  }
}
