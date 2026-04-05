import { getDb } from "./db";
import { questions, answers, answerReplies, users, mentorProfiles, qnaReports } from "../drizzle/schema";
import { eq, isNull, desc, and, or } from "drizzle-orm";

/**
 * 질문 생성
 */
export async function createQuestion(
  authorId: number,
  title: string,
  content: string,
  category?: string,
  isAnonymous?: boolean,
  interestUniversity?: string,
  interestMajor?: string,
  gradeLevel?: string,
  contextInfo?: string
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(questions).values({
    authorId,
    title,
    content,
    category,
    isAnonymous: isAnonymous || false,
    status: "awaiting_answer",
    answerCount: 0,
    interestUniversity,
    interestMajor,
    gradeLevel,
    contextInfo,
  });

  return result;
}

/**
 * 질문 조회 (ID)
 */
export async function getQuestionById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(questions)
    .where(eq(questions.id, id))
    .limit(1);

  if (result.length === 0) return null;
  return result[0];
}

/**
 * 질문 목록 조회 (페이지네이션 + 정렬 + 상태 필터)
 */
export async function getQuestions(
  limit: number = 20,
  offset: number = 0,
  searchQuery?: string,
  category?: string,
  sortBy: string = "recent",
  status?: string
): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  let whereCondition: any = isNull(questions.deletedAt);

  if (searchQuery) {
    // 제목 또는 내용에서 검색
    whereCondition = and(
      isNull(questions.deletedAt),
      or(
        eq(questions.title, searchQuery),
        eq(questions.content, searchQuery)
      )
    );
  }

  // 카테고리 필터
  if (category) {
    whereCondition = and(whereCondition, eq(questions.category, category));
  }

  // 상태 필터
  if (status) {
    whereCondition = and(whereCondition, eq(questions.status, status as any));
  }

  // 정렬 로직
  let orderByClause: any = desc(questions.createdAt);
  switch (sortBy) {
    case "latest_answer":
      orderByClause = desc(questions.lastAnsweredAt);
      break;
    case "most_answers":
      orderByClause = desc(questions.answerCount);
      break;
    case "solved":
      orderByClause = desc(questions.status);
      break;
    default:
      orderByClause = desc(questions.createdAt);
  }

  const result = await db
    .select()
    .from(questions)
    .where(whereCondition)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  return result;
}

/**
 * 질문 업데이트
 */
export async function updateQuestion(
  id: number,
  title?: string,
  content?: string,
  status?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = {};
  if (title !== undefined) updates.title = title;
  if (content !== undefined) updates.content = content;
  if (status !== undefined) updates.status = status;

  if (Object.keys(updates).length === 0) return;

  await db.update(questions).set(updates).where(eq(questions.id, id));
}

/**
 * 질문 상태 업데이트 (해결됨 처리)
 */
export async function markQuestionAsSolved(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(questions)
    .set({ status: "solved" })
    .where(eq(questions.id, id));
}

/**
 * 질문 삭제 (소프트 삭제)
 */
export async function deleteQuestion(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(questions)
    .set({ deletedAt: new Date() })
    .where(eq(questions.id, id));
}

/**
 * 답변 생성
 */
export async function createAnswer(
  questionId: number,
  authorId: number,
  content: string
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(answers).values({
    questionId,
    authorId,
    content,
  });

  // 질문 상태 및 답변 수 업데이트
  const question = await getQuestionById(questionId);
  if (question) {
    const isFirstAnswer = question.answerCount === 0;
    await db
      .update(questions)
      .set({
        status: isFirstAnswer ? "answered" : question.status,
        answerCount: question.answerCount + 1,
        lastAnsweredAt: new Date(),
      })
      .where(eq(questions.id, questionId));
  }

  return result;
}

/**
 * 질문에 대한 답변 조회
 */
export async function getAnswersByQuestionId(questionId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(answers)
    .where(
      and(eq(answers.questionId, questionId), isNull(answers.deletedAt))
    )
    .orderBy(desc(answers.createdAt));

  return result;
}

/**
 * 답변 조회 (ID)
 */
export async function getAnswerById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(answers)
    .where(eq(answers.id, id))
    .limit(1);

  if (result.length === 0) return null;
  return result[0];
}

/**
 * 답변 업데이트
 */
export async function updateAnswer(id: number, content: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(answers).set({ content }).where(eq(answers.id, id));
}

/**
 * 답변 삭제 (소프트 삭제)
 */
export async function deleteAnswer(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(answers)
    .set({ deletedAt: new Date() })
    .where(eq(answers.id, id));
}

/**
 * 답글 생성
 */
export async function createAnswerReply(
  answerId: number,
  authorId: number,
  content: string
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(answerReplies).values({
    answerId,
    authorId,
    content,
  });

  return result;
}

/**
 * 답변에 대한 답글 조회
 */
export async function getRepliesByAnswerId(answerId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(answerReplies)
    .where(
      and(eq(answerReplies.answerId, answerId), isNull(answerReplies.deletedAt))
    )
    .orderBy(desc(answerReplies.createdAt));

  return result;
}

/**
 * 답글 조회 (ID)
 */
export async function getReplyById(id: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(answerReplies)
    .where(eq(answerReplies.id, id))
    .limit(1);

  if (result.length === 0) return null;
  return result[0];
}

/**
 * 답글 업데이트
 */
export async function updateReply(id: number, content: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(answerReplies)
    .set({ content })
    .where(eq(answerReplies.id, id));
}

/**
 * 답글 삭제 (소프트 삭제)
 */
export async function deleteReply(id: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(answerReplies)
    .set({ deletedAt: new Date() })
    .where(eq(answerReplies.id, id));
}

/**
 * 신고 생성
 */
export async function createReport(
  reporterId: number,
  reportType: "question" | "answer" | "reply",
  contentId: number,
  reason: string,
  description?: string
): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(qnaReports).values({
    reporterId,
    reportType,
    contentId,
    reason,
    description,
    status: "pending",
  });

  // 신고 대상 콘텐츠의 신고 수 증가
  if (reportType === "answer") {
    const answer = await getAnswerById(contentId);
    if (answer) {
      await db
        .update(answers)
        .set({ reportCount: (answer.reportCount || 0) + 1 })
        .where(eq(answers.id, contentId));
    }
  } else if (reportType === "reply") {
    const reply = await getReplyById(contentId);
    if (reply) {
      await db
        .update(answerReplies)
        .set({ reportCount: (reply.reportCount || 0) + 1 })
        .where(eq(answerReplies.id, contentId));
    }
  }

  return result;
}

/**
 * 답변 작성자 정보 조회 (멘토 프로필 포함)
 */
export async function getAnswerWithAuthorInfo(answerId: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const answer = await getAnswerById(answerId);
  if (!answer) return null;

  // 작성자 정보 조회
  const author = await db
    .select()
    .from(users)
    .where(eq(users.id, answer.authorId))
    .limit(1);

  if (author.length === 0) return answer;

  // 멘토 프로필 조회
  const mentorProfile = await db
    .select()
    .from(mentorProfiles)
    .where(eq(mentorProfiles.userId, answer.authorId))
    .limit(1);

  return {
    ...answer,
    author: author[0],
    mentorProfile: mentorProfile.length > 0 ? mentorProfile[0] : null,
  };
}

/**
 * 질문 상세 조회 (답변 + 답글 포함)
 */
export async function getQuestionDetail(questionId: number): Promise<any> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const question = await getQuestionById(questionId);
  if (!question) return null;

  // 작성자 정보 조회
  const author = await db
    .select()
    .from(users)
    .where(eq(users.id, question.authorId))
    .limit(1);

  // 답변 조회
  const answerList = await getAnswersByQuestionId(questionId);

  // 각 답변에 대한 답글 조회
  const answersWithReplies = await Promise.all(
    answerList.map(async (answer) => {
      const replies = await getRepliesByAnswerId(answer.id);
      const answerAuthor = await db
        .select()
        .from(users)
        .where(eq(users.id, answer.authorId))
        .limit(1);

      const mentorProfile = await db
        .select()
        .from(mentorProfiles)
        .where(eq(mentorProfiles.userId, answer.authorId))
        .limit(1);

      // 각 답글의 작성자 정보 조회
      const repliesWithAuthor = await Promise.all(
        replies.map(async (reply) => {
          const replyAuthor = await db
            .select()
            .from(users)
            .where(eq(users.id, reply.authorId))
            .limit(1);

          return {
            ...reply,
            author: replyAuthor.length > 0 ? replyAuthor[0] : null,
          };
        })
      );

      return {
        ...answer,
        author: answerAuthor.length > 0 ? answerAuthor[0] : null,
        mentorProfile: mentorProfile.length > 0 ? mentorProfile[0] : null,
        replies: repliesWithAuthor,
      };
    })
  );

  return {
    ...question,
    author: author.length > 0 ? author[0] : null,
    answers: answersWithReplies,
  };
}
