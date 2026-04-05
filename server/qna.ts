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

  // 멘토의 답변 수 증가
  const { mentorProfiles } = await import("../drizzle/schema");
  const mentor = await db
    .select()
    .from(mentorProfiles)
    .where(eq(mentorProfiles.userId, authorId))
    .limit(1);
  
  if (mentor && mentor.length > 0) {
    await db
      .update(mentorProfiles)
      .set({
        answerCount: (mentor[0].answerCount || 0) + 1,
      })
      .where(eq(mentorProfiles.userId, authorId));
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

/**
 * 답변 채택 (질문 작성자만 가능, 1개만 채택)
 */
export async function acceptAnswer(
  answerId: number,
  requesterId: number
): Promise<{ success: boolean; message: string }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 답변 조회
  const answer = await getAnswerById(answerId);
  if (!answer) return { success: false, message: "답변을 찾을 수 없습니다" };

  // 질문 조회
  const question = await getQuestionById(answer.questionId);
  if (!question) return { success: false, message: "질문을 찾을 수 없습니다" };

  // 질문 작성자 확인
  if (question.authorId !== requesterId) {
    return { success: false, message: "질문 작성자만 답변을 채택할 수 있습니다" };
  }

  // 이미 채택된 답변이 있는지 확인
  const existingAccepted = await db
    .select()
    .from(answers)
    .where(
      and(
        eq(answers.questionId, answer.questionId),
        eq(answers.isAccepted, true),
        isNull(answers.deletedAt)
      )
    )
    .limit(1);

  if (existingAccepted.length > 0 && existingAccepted[0].id !== answerId) {
    return { success: false, message: "이미 채택된 답변이 있습니다. 채택은 1개만 가능합니다" };
  }

  // 채택 토글 (이미 채택된 경우 취소)
  const newAcceptedStatus = !answer.isAccepted;
  await db
    .update(answers)
    .set({ isAccepted: newAcceptedStatus })
    .where(eq(answers.id, answerId));

  // 질문 상태 업데이트
  if (newAcceptedStatus) {
    await db
      .update(questions)
      .set({ status: "solved" })
      .where(eq(questions.id, answer.questionId));
  } else {
    // 채택 취소 시 answered 상태로 되돌리기
    await db
      .update(questions)
      .set({ status: "answered" })
      .where(eq(questions.id, answer.questionId));
  }

  return {
    success: true,
    message: newAcceptedStatus ? "답변이 채택되었습니다" : "채택이 취소되었습니다",
  };
}

/**
 * 답변 좋아요 토글 (계정당 1회)
 */
export async function toggleAnswerLike(
  answerId: number,
  userId: number
): Promise<{ liked: boolean; likeCount: number }> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { answerLikes } = await import("../drizzle/schema");

  // 기존 좋아요 확인
  const existingLike = await db
    .select()
    .from(answerLikes)
    .where(
      and(eq(answerLikes.answerId, answerId), eq(answerLikes.userId, userId))
    )
    .limit(1);

  const answer = await getAnswerById(answerId);
  if (!answer) throw new Error("답변을 찾을 수 없습니다");

  if (existingLike.length > 0) {
    // 좋아요 취소
    await db
      .delete(answerLikes)
      .where(
        and(eq(answerLikes.answerId, answerId), eq(answerLikes.userId, userId))
      );
    const newLikeCount = Math.max(0, (answer.likeCount || 0) - 1);
    await db
      .update(answers)
      .set({ likeCount: newLikeCount })
      .where(eq(answers.id, answerId));
    return { liked: false, likeCount: newLikeCount };
  } else {
    // 좋아요 추가
    await db.insert(answerLikes).values({ answerId, userId });
    const newLikeCount = (answer.likeCount || 0) + 1;
    await db
      .update(answers)
      .set({ likeCount: newLikeCount })
      .where(eq(answers.id, answerId));
    return { liked: true, likeCount: newLikeCount };
  }
}

/**
 * 사용자가 특정 답변에 좋아요를 눌렀는지 확인
 */
export async function getUserAnswerLikes(
  userId: number,
  answerIds: number[]
): Promise<number[]> {
  if (answerIds.length === 0) return [];
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { answerLikes } = await import("../drizzle/schema");
  const { inArray } = await import("drizzle-orm");

  const likes = await db
    .select()
    .from(answerLikes)
    .where(
      and(
        eq(answerLikes.userId, userId),
        inArray(answerLikes.answerId, answerIds)
      )
    );

  return likes.map((l) => l.answerId);
}

/**
 * 새 답변 등록 시 질문 작성자에게 알림 발송
 */
export async function notifyQuestionAuthorOnAnswer(
  questionId: number,
  answerAuthorId: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const { notifications } = await import("../drizzle/schema");

  const question = await getQuestionById(questionId);
  if (!question) return;

  // 자신의 질문에 자신이 답변한 경우 알림 없음
  if (question.authorId === answerAuthorId) return;

  // 답변 작성자 정보 조회
  const answerAuthor = await db
    .select()
    .from(users)
    .where(eq(users.id, answerAuthorId))
    .limit(1);

  const authorName = answerAuthor.length > 0 ? (answerAuthor[0].name || "멘토") : "멘토";

  await db.insert(notifications).values({
    userId: question.authorId,
    type: "qna_answer",
    title: "새 답변이 달렸습니다",
    message: `"${question.title.substring(0, 30)}${question.title.length > 30 ? "..." : ""}" 질문에 ${authorName}님이 답변을 작성했습니다.`,
    relatedId: questionId,
    isRead: false,
  });
}

/**
 * 멘티 전용: 내가 작성한 질문 목록 조회
 */
export async function getMyQuestions(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(questions)
    .where(and(eq(questions.authorId, userId), isNull(questions.deletedAt)))
    .orderBy(desc(questions.createdAt));

  return result;
}

/**
 * 멘토 전용: 내가 작성한 답변 목록 조회 (질문 정보 포함)
 */
export async function getMyAnswers(userId: number): Promise<any[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const myAnswers = await db
    .select()
    .from(answers)
    .where(and(eq(answers.authorId, userId), isNull(answers.deletedAt)))
    .orderBy(desc(answers.createdAt));

  // 각 답변에 질문 정보 추가
  const answersWithQuestions = await Promise.all(
    myAnswers.map(async (answer) => {
      const question = await getQuestionById(answer.questionId);
      return {
        ...answer,
        question,
      };
    })
  );

  return answersWithQuestions;
}
