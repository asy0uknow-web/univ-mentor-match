import { getDb } from "./db";
import { bookings, messages } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * 상담 시작 가능 시간 검증
 * 예정 시작 시각 ±5분
 */
export function isWithinStartWindow(scheduledAt: Date): boolean {
  const now = new Date();
  const fiveMinutesMs = 5 * 60 * 1000;
  const windowStart = new Date(scheduledAt.getTime() - fiveMinutesMs);
  const windowEnd = new Date(scheduledAt.getTime() + fiveMinutesMs);

  return now >= windowStart && now <= windowEnd;
}

/**
 * 상담 완료 가능 시간 검증
 * 예정 종료 시각 ±5분
 */
export function isWithinCompleteWindow(
  scheduledAt: Date,
  durationHours: number
): boolean {
  const now = new Date();
  const fiveMinutesMs = 5 * 60 * 1000;
  const scheduledEnd = new Date(
    scheduledAt.getTime() + durationHours * 60 * 60 * 1000
  );
  const windowStart = new Date(scheduledEnd.getTime() - fiveMinutesMs);
  const windowEnd = new Date(scheduledEnd.getTime() + fiveMinutesMs);

  return now >= windowStart && now <= windowEnd;
}

/**
 * 상담 시작
 */
export async function startConsultation(bookingId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const b = booking[0];

  // 상태 검증
  if (b.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be started");
  }

  // 시간 검증
  if (!isWithinStartWindow(b.scheduledAt)) {
    throw new Error(
      "Consultation can only be started 5 minutes before/after scheduled time"
    );
  }

  // 상담 시작
  await db
    .update(bookings)
    .set({
      status: "in_progress",
      consultationStartedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));
}

/**
 * 상담 완료
 */
export async function completeConsultation(bookingId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const b = booking[0];

  // 상태 검증
  if (b.status !== "in_progress") {
    throw new Error("Only in-progress bookings can be completed");
  }

  // 시간 검증
  const durationHours = parseFloat(b.duration.toString());
  if (!isWithinCompleteWindow(b.scheduledAt, durationHours)) {
    throw new Error(
      "Consultation can only be completed 5 minutes before/after scheduled end time"
    );
  }

  // 상담 완료
  await db
    .update(bookings)
    .set({
      status: "completed",
      consultationCompletedAt: new Date(),
    })
    .where(eq(bookings.id, bookingId));
}

/**
 * 일정 변경 요청
 */
export async function requestReschedule(
  bookingId: number,
  requestedBy: number,
  newScheduledAt: Date,
  reason: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const b = booking[0];

  // 권한 검증 (학생 또는 멘토만)
  if (requestedBy !== b.studentId && requestedBy !== b.mentorId) {
    throw new Error("Only student or mentor can request reschedule");
  }

  // 상태 업데이트
  await db
    .update(bookings)
    .set({
      status: "reschedule_requested",
      rescheduleRequestedAt: new Date(),
      rescheduleRequestedBy: requestedBy,
      rescheduleNotice: reason,
    })
    .where(eq(bookings.id, bookingId));
}

/**
 * 일정 변경 수락
 */
export async function acceptReschedule(
  bookingId: number,
  acceptedBy: number,
  newScheduledAt: Date
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const b = booking[0];

  // 상태 검증
  if (b.status !== "reschedule_requested") {
    throw new Error("Only reschedule_requested bookings can be accepted");
  }

  // 권한 검증 (요청자가 아닌 상대방만 수락 가능)
  if (acceptedBy === b.rescheduleRequestedBy) {
    throw new Error("Cannot accept your own reschedule request");
  }

  if (acceptedBy !== b.studentId && acceptedBy !== b.mentorId) {
    throw new Error("Only student or mentor can accept reschedule");
  }

  // 일정 변경 수락
  await db
    .update(bookings)
    .set({
      status: "confirmed",
      scheduledAt: newScheduledAt,
      rescheduleRequestedAt: null,
      rescheduleRequestedBy: null,
      rescheduleNotice: null,
    })
    .where(eq(bookings.id, bookingId));
}

/**
 * 일정 변경 거절
 */
export async function rejectReschedule(
  bookingId: number,
  rejectedBy: number
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const booking = await db
    .select()
    .from(bookings)
    .where(eq(bookings.id, bookingId))
    .limit(1);

  if (booking.length === 0) {
    throw new Error("Booking not found");
  }

  const b = booking[0];

  // 상태 검증
  if (b.status !== "reschedule_requested") {
    throw new Error("Only reschedule_requested bookings can be rejected");
  }

  // 권한 검증
  if (rejectedBy !== b.studentId && rejectedBy !== b.mentorId) {
    throw new Error("Only student or mentor can reject reschedule");
  }

  // 기존 상태로 복귀 (confirmed 또는 in_progress)
  const previousStatus = b.consultationStartedAt ? "in_progress" : "confirmed";

  await db
    .update(bookings)
    .set({
      status: previousStatus,
      rescheduleRequestedAt: null,
      rescheduleRequestedBy: null,
      rescheduleNotice: null,
    })
    .where(eq(bookings.id, bookingId));
}

/**
 * 상담 시간 계산 (분 단위)
 */
export function calculateConsultationDuration(
  startedAt: Date,
  completedAt: Date
): number {
  const durationMs = completedAt.getTime() - startedAt.getTime();
  return Math.round(durationMs / (60 * 1000)); // Convert to minutes
}
