import { getDb } from "./db";
import { bookings } from "../drizzle/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export interface ConsultationStats {
  totalCount: number;
  completedCount: number;
  completionRate: number;
  earlyEndCount: number;
  earlyEndRate: number;
  averageDuration: number;
  totalRevenue: number;
}

/**
 * 월별 상담 통계 조회
 */
export async function getMonthlyConsultationStats(year: number, month: number): Promise<ConsultationStats> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // 해당 월의 모든 상담 조회
  const monthlyBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.scheduledAt, startDate),
        lte(bookings.scheduledAt, endDate)
      )
    );

  const totalCount = monthlyBookings.length;
  const completedCount = monthlyBookings.filter(b => b.status === "completed").length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 조기 종료 (예정 시간 전에 종료)
  const earlyEndCount = monthlyBookings.filter(b => {
    if (b.status !== "completed" || !b.consultationCompletedAt) return false;
    const scheduledEnd = new Date(b.scheduledAt.getTime() + parseInt(b.duration.toString()) * 60 * 60 * 1000);
    return b.consultationCompletedAt < scheduledEnd;
  }).length;
  const earlyEndRate = completedCount > 0 ? (earlyEndCount / completedCount) * 100 : 0;

  // 평균 상담 시간 (완료된 상담만)
  const completedBookings = monthlyBookings.filter(b => b.status === "completed" && b.consultationStartedAt && b.consultationCompletedAt);
  let averageDuration = 0;
  if (completedBookings.length > 0) {
    const totalDuration = completedBookings.reduce((sum, b) => {
      const start = new Date(b.consultationStartedAt!).getTime();
      const end = new Date(b.consultationCompletedAt!).getTime();
      return sum + (end - start) / (1000 * 60); // 분 단위
    }, 0);
    averageDuration = totalDuration / completedBookings.length;
  }

  // 총 매출
  const totalRevenue = monthlyBookings.reduce((sum, b) => {
    return sum + (b.status === "completed" ? parseInt(b.totalAmount.toString()) : 0);
  }, 0);

  return {
    totalCount,
    completedCount,
    completionRate: Math.round(completionRate * 100) / 100,
    earlyEndCount,
    earlyEndRate: Math.round(earlyEndRate * 100) / 100,
    averageDuration: Math.round(averageDuration * 100) / 100,
    totalRevenue,
  };
}

/**
 * 전체 기간 상담 통계 조회
 */
export async function getOverallConsultationStats(): Promise<ConsultationStats> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allBookings = await db.select().from(bookings);

  const totalCount = allBookings.length;
  const completedCount = allBookings.filter(b => b.status === "completed").length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const earlyEndCount = allBookings.filter(b => {
    if (b.status !== "completed" || !b.consultationCompletedAt) return false;
    const scheduledEnd = new Date(b.scheduledAt.getTime() + parseInt(b.duration.toString()) * 60 * 60 * 1000);
    return b.consultationCompletedAt < scheduledEnd;
  }).length;
  const earlyEndRate = completedCount > 0 ? (earlyEndCount / completedCount) * 100 : 0;

  const completedBookings = allBookings.filter(b => b.status === "completed" && b.consultationStartedAt && b.consultationCompletedAt);
  let averageDuration = 0;
  if (completedBookings.length > 0) {
    const totalDuration = completedBookings.reduce((sum, b) => {
      const start = new Date(b.consultationStartedAt!).getTime();
      const end = new Date(b.consultationCompletedAt!).getTime();
      return sum + (end - start) / (1000 * 60);
    }, 0);
    averageDuration = totalDuration / completedBookings.length;
  }

  const totalRevenue = allBookings.reduce((sum, b) => {
    return sum + (b.status === "completed" ? parseInt(b.totalAmount.toString()) : 0);
  }, 0);

  return {
    totalCount,
    completedCount,
    completionRate: Math.round(completionRate * 100) / 100,
    earlyEndCount,
    earlyEndRate: Math.round(earlyEndRate * 100) / 100,
    averageDuration: Math.round(averageDuration * 100) / 100,
    totalRevenue,
  };
}

/**
 * 최근 12개월 월별 통계 조회
 */
export async function getLast12MonthsStats(): Promise<Array<{ month: string; stats: ConsultationStats }>> {
  const result = [];
  const now = new Date();

  for (let i = 11; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const stats = await getMonthlyConsultationStats(year, month);
    result.push({
      month: `${year}-${String(month).padStart(2, "0")}`,
      stats,
    });
  }

  return result;
}
