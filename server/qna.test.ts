import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import {
  createQuestion,
  getQuestionById,
  getQuestions,
  updateQuestion,
  markQuestionAsSolved,
  deleteQuestion,
  createAnswer,
  getAnswersByQuestionId,
  createAnswerReply,
  getRepliesByAnswerId,
  createReport,
} from "./qna";

describe("QnA Functions", () => {
  let db: any;
  let testQuestionId: number = 0;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");
  });

  describe("Question Management", () => {
    it("should create a question", async () => {
      const result = await createQuestion(
        1,
        "Test Question",
        "This is a test question",
        "입시 전략"
      );

      expect(result).toBeDefined();
      // Drizzle ORM returns insertId in result
      if (result.insertId) {
        testQuestionId = result.insertId;
      }
    });

    it("should list questions", async () => {
      const questionList = await getQuestions(10, 0);
      expect(Array.isArray(questionList)).toBe(true);
    });

    it("should list questions by status", async () => {
      const awaitingQuestions = await getQuestions(10, 0, undefined, undefined, "recent", "awaiting_answer");
      expect(Array.isArray(awaitingQuestions)).toBe(true);
    });

    it("should list questions by category", async () => {
      const categoryQuestions = await getQuestions(10, 0, undefined, "입시 전략");
      expect(Array.isArray(categoryQuestions)).toBe(true);
    });
  });

  describe("Answer Management", () => {
    it("should create an answer", async () => {
      // Create a new question for answer testing
      const qResult = await createQuestion(
        1,
        "Question for Answer",
        "Test question content",
        "대학 생활"
      );
      const qId = qResult.insertId || 1;

      // Create answer
      const result = await createAnswer(qId, 2, "This is a test answer");
      expect(result).toBeDefined();
    });
  });

  describe("Report Management", () => {
    it("should create a report", async () => {
      const qResult = await createQuestion(1, "Q for Report", "Content", "기타");
      const qId = qResult.insertId || 1;

      const result = await createReport(
        2,
        "question",
        qId,
        "부적절한_내용",
        "This is inappropriate"
      );
      expect(result).toBeDefined();
    });
  });

  describe("Sorting and Filtering", () => {
    it("should sort questions by recent", async () => {
      const sorted = await getQuestions(10, 0, undefined, undefined, "recent");
      expect(Array.isArray(sorted)).toBe(true);
    });

    it("should sort questions by most answers", async () => {
      const sorted = await getQuestions(10, 0, undefined, undefined, "most_answers");
      expect(Array.isArray(sorted)).toBe(true);
    });
  });

  afterAll(async () => {
    // Cleanup is optional for test data
    if (db && testQuestionId > 0) {
      try {
        await deleteQuestion(testQuestionId);
      } catch (e) {
        console.log("Cleanup error:", e);
      }
    }
  });
});
