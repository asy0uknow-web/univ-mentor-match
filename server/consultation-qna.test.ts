import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "./db";
import { users, bookings, questions, answers, answerReplies } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Consultation and QnA Features", () => {
  let testUserId: number;
  let testMentorId: number;
  let testBookingId: number;
  let testQuestionId: number;

  beforeAll(async () => {
    // 테스트용 사용자 생성
    const [student] = await db
      .insert(users)
      .values({
        email: "test-student@example.com",
        name: "Test Student",
        userType: "high_school_student",
        oauthProvider: "test",
        oauthId: "test-student-1",
      })
      .returning();

    const [mentor] = await db
      .insert(users)
      .values({
        email: "test-mentor@example.com",
        name: "Test Mentor",
        userType: "university_student",
        oauthProvider: "test",
        oauthId: "test-mentor-1",
      })
      .returning();

    testUserId = student.id;
    testMentorId = mentor.id;

    // 테스트용 예약 생성
    const [booking] = await db
      .insert(bookings)
      .values({
        studentId: testUserId,
        mentorId: testMentorId,
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration: "60",
        consultationType: "career_counseling",
        status: "confirmed",
      })
      .returning();

    testBookingId = booking.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    await db.delete(answerReplies).where(eq(answerReplies.id, 0)).run();
    await db.delete(answers).where(eq(answers.id, 0)).run();
    await db.delete(questions).where(eq(questions.id, 0)).run();
    await db.delete(bookings).where(eq(bookings.id, testBookingId)).run();
    await db.delete(users).where(eq(users.id, testUserId)).run();
    await db.delete(users).where(eq(users.id, testMentorId)).run();
  });

  // 상담 시작 테스트
  it("should start consultation", async () => {
    const now = new Date();
    
    const [updated] = await db
      .update(bookings)
      .set({
        consultationStartedAt: now.toISOString(),
      })
      .where(eq(bookings.id, testBookingId))
      .returning();

    expect(updated.consultationStartedAt).toBeDefined();
    expect(new Date(updated.consultationStartedAt!).getTime()).toBeGreaterThan(0);
  });

  // 상담 완료 테스트
  it("should complete consultation", async () => {
    const now = new Date();
    
    const [updated] = await db
      .update(bookings)
      .set({
        consultationCompletedAt: now.toISOString(),
      })
      .where(eq(bookings.id, testBookingId))
      .returning();

    expect(updated.consultationCompletedAt).toBeDefined();
    expect(new Date(updated.consultationCompletedAt!).getTime()).toBeGreaterThan(0);
  });

  // 질문 작성 테스트
  it("should create a question", async () => {
    const [question] = await db
      .insert(questions)
      .values({
        authorId: testUserId,
        title: "Test Question",
        content: "This is a test question",
        category: "career",
        isAnonymous: false,
      })
      .returning();

    testQuestionId = question.id;
    expect(question.title).toBe("Test Question");
    expect(question.content).toBe("This is a test question");
    expect(question.authorId).toBe(testUserId);
  });

  // 답변 작성 테스트
  it("should create an answer to a question", async () => {
    const [answer] = await db
      .insert(answers)
      .values({
        questionId: testQuestionId,
        authorId: testMentorId,
        content: "This is a test answer",
      })
      .returning();

    expect(answer.content).toBe("This is a test answer");
    expect(answer.authorId).toBe(testMentorId);
    expect(answer.questionId).toBe(testQuestionId);
  });

  // 질문 조회 테스트
  it("should retrieve questions", async () => {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.authorId, testUserId));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].title).toBe("Test Question");
  });

  // 익명 질문 테스트
  it("should create an anonymous question", async () => {
    const [question] = await db
      .insert(questions)
      .values({
        authorId: testUserId,
        title: "Anonymous Question",
        content: "This is an anonymous question",
        category: "academics",
        isAnonymous: true,
      })
      .returning();

    expect(question.isAnonymous).toBe(true);
  });

  // 상담 시간 검증 테스트
  it("should validate consultation timing", async () => {
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, testBookingId))
      .then(r => r[0]);

    // 상담 완료 시간이 시작 시간보다 뒤에 있는지 확인
    if (booking.consultationStartedAt && booking.consultationCompletedAt) {
      const startTime = new Date(booking.consultationStartedAt).getTime();
      const endTime = new Date(booking.consultationCompletedAt).getTime();
      expect(endTime).toBeGreaterThanOrEqual(startTime);
    }
  });
});
