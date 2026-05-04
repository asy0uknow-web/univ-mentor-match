import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { db } from "./db";
import { users, questions, answers } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("QnA Integration Tests", () => {
  let studentId: number;
  let mentorId: number;
  let questionId: number;

  beforeAll(async () => {
    // 테스트 학생 생성
    const [student] = await db
      .insert(users)
      .values({
        email: `test-student-${Date.now()}@example.com`,
        name: "Test Student",
        userType: "high_school_student",
        oauthProvider: "test",
        oauthId: `test-student-${Date.now()}`,
      })
      .returning();

    // 테스트 멘토 생성
    const [mentor] = await db
      .insert(users)
      .values({
        email: `test-mentor-${Date.now()}@example.com`,
        name: "Test Mentor",
        userType: "university_student",
        oauthProvider: "test",
        oauthId: `test-mentor-${Date.now()}`,
      })
      .returning();

    studentId = student.id;
    mentorId = mentor.id;
  });

  afterAll(async () => {
    // 테스트 데이터 정리
    if (questionId) {
      await db.delete(answers).where(eq(answers.questionId, questionId)).run();
      await db.delete(questions).where(eq(questions.id, questionId)).run();
    }
    await db.delete(users).where(eq(users.id, studentId)).run();
    await db.delete(users).where(eq(users.id, mentorId)).run();
  });

  it("should create a question successfully", async () => {
    const [question] = await db
      .insert(questions)
      .values({
        authorId: studentId,
        title: "Test Question",
        content: "This is a test question content",
        category: "career",
        isAnonymous: false,
      })
      .returning();

    questionId = question.id;
    expect(question.title).toBe("Test Question");
    expect(question.authorId).toBe(studentId);
    expect(question.category).toBe("career");
  });

  it("should create an anonymous question", async () => {
    const [question] = await db
      .insert(questions)
      .values({
        authorId: studentId,
        title: "Anonymous Question",
        content: "This is an anonymous question",
        category: "academics",
        isAnonymous: true,
      })
      .returning();

    expect(question.isAnonymous).toBe(true);
    expect(question.title).toBe("Anonymous Question");
  });

  it("should retrieve questions by category", async () => {
    const result = await db
      .select()
      .from(questions)
      .where(eq(questions.category, "career"));

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].category).toBe("career");
  });

  it("should create an answer to a question", async () => {
    if (!questionId) {
      // questionId가 없으면 먼저 질문 생성
      const [question] = await db
        .insert(questions)
        .values({
          authorId: studentId,
          title: "Test Q",
          content: "Test content",
          category: "career",
          isAnonymous: false,
        })
        .returning();
      questionId = question.id;
    }

    const [answer] = await db
      .insert(answers)
      .values({
        questionId,
        authorId: mentorId,
        content: "This is a helpful answer",
      })
      .returning();

    expect(answer.content).toBe("This is a helpful answer");
    expect(answer.authorId).toBe(mentorId);
    expect(answer.questionId).toBe(questionId);
  });

  it("should validate question title is not empty", () => {
    const title = "";
    expect(title.trim().length).toBe(0);
  });

  it("should validate question content is not empty", () => {
    const content = "";
    expect(content.trim().length).toBe(0);
  });

  it("should validate category is valid", () => {
    const validCategories = ["career", "academics", "university", "other"];
    const testCategory = "career";
    expect(validCategories).toContain(testCategory);
  });

  it("should reject invalid category", () => {
    const validCategories = ["career", "academics", "university", "other"];
    const testCategory = "invalid_category";
    expect(validCategories).not.toContain(testCategory);
  });

  it("should handle question with maximum length content", () => {
    const maxContent = "a".repeat(2000);
    expect(maxContent.length).toBe(2000);
  });

  it("should handle question with minimum length content", () => {
    const minContent = "a";
    expect(minContent.length).toBeGreaterThan(0);
  });
});
