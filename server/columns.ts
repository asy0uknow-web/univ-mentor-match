import { getDb } from "./db";
import { mentorColumns, mentorColumnLikes, mentorColumnComments, users, mentorProfiles } from "../drizzle/schema";
import { eq, and, desc, isNull, or, like, sql } from "drizzle-orm";

export async function getColumnsList(options: {
  limit?: number;
  offset?: number;
  sortBy?: "latest" | "likes" | "comments";
  category?: string;
  searchQuery?: string;
} = {}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { limit = 20, offset = 0, sortBy = "latest", category, searchQuery } = options;

  let baseQuery = db
    .select({
      id: mentorColumns.id,
      title: mentorColumns.title,
      excerpt: mentorColumns.excerpt,
      coverImageUrl: mentorColumns.coverImageUrl,
      category: mentorColumns.category,
      likesCount: mentorColumns.likesCount,
      commentsCount: mentorColumns.commentsCount,
      viewCount: mentorColumns.viewCount,
      createdAt: mentorColumns.createdAt,
      author: {
        id: users.id,
        name: users.name,
      },
      mentorProfile: {
        university: mentorProfiles.university,
        major: mentorProfiles.major,
        grade: mentorProfiles.grade,
        verificationStatus: mentorProfiles.verificationStatus,
      },
    })
    .from(mentorColumns)
    .innerJoin(users, eq(mentorColumns.authorId, users.id))
    .leftJoin(mentorProfiles, eq(users.id, mentorProfiles.userId))
    .where(
      and(
        eq(mentorColumns.status, "published"),
        isNull(mentorColumns.deletedAt),
        category ? eq(mentorColumns.category, category) : undefined,
        searchQuery
          ? or(
              like(mentorColumns.title, `%${searchQuery}%`),
              like(mentorColumns.content, `%${searchQuery}%`)
            )
          : undefined
      )
    );

  // 정렬
  let orderedQuery: any = baseQuery;
  switch (sortBy) {
    case "likes":
      orderedQuery = baseQuery.orderBy(desc(mentorColumns.likesCount));
      break;
    case "comments":
      orderedQuery = baseQuery.orderBy(desc(mentorColumns.commentsCount));
      break;
    case "latest":
    default:
      orderedQuery = baseQuery.orderBy(desc(mentorColumns.createdAt));
  }

  const columns = await orderedQuery.limit(limit).offset(offset);
  return columns;
}

export async function getColumnById(columnId: number, userId?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const column = await db
    .select({
      id: mentorColumns.id,
      title: mentorColumns.title,
      content: mentorColumns.content,
      category: mentorColumns.category,
      coverImageUrl: mentorColumns.coverImageUrl,
      likesCount: mentorColumns.likesCount,
      commentsCount: mentorColumns.commentsCount,
      viewCount: mentorColumns.viewCount,
      createdAt: mentorColumns.createdAt,
      updatedAt: mentorColumns.updatedAt,
      author: {
        id: users.id,
        name: users.name,
      },
      mentorProfile: {
        university: mentorProfiles.university,
        major: mentorProfiles.major,
        grade: mentorProfiles.grade,
        verificationStatus: mentorProfiles.verificationStatus,
      },
    })
    .from(mentorColumns)
    .innerJoin(users, eq(mentorColumns.authorId, users.id))
    .leftJoin(mentorProfiles, eq(users.id, mentorProfiles.userId))
    .where(
      and(
        eq(mentorColumns.id, columnId),
        eq(mentorColumns.status, "published"),
        isNull(mentorColumns.deletedAt)
      )
    )
    .then((rows) => rows[0]);

  if (!column) return null;

  // 사용자의 좋아요 여부 확인
  let isLiked = false;
  if (userId) {
    const like = await db
      .select()
      .from(mentorColumnLikes)
      .where(
        and(eq(mentorColumnLikes.columnId, columnId), eq(mentorColumnLikes.userId, userId))
      )
      .then((rows) => rows[0]);
    isLiked = !!like;
  }

  return { ...column, isLiked };
}

export async function createColumn(
  authorId: number,
  data: {
    title: string;
    content: string;
    category: string;
    excerpt?: string;
    coverImageUrl?: string;
    status: "draft" | "published";
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 멘토 인증 확인
  const mentorProfile = await db
    .select()
    .from(mentorProfiles)
    .where(
      and(
        eq(mentorProfiles.userId, authorId),
        eq(mentorProfiles.verificationStatus, "approved")
      )
    )
    .then((rows) => rows[0]);

  if (!mentorProfile) {
    throw new Error("Only verified mentors can create columns");
  }

  await db
    .insert(mentorColumns)
    .values({
      authorId,
      title: data.title,
      content: data.content,
      category: data.category,
      excerpt: data.excerpt || data.content.substring(0, 200),
      coverImageUrl: data.coverImageUrl,
      status: data.status,
    });

  // 방금 생성한 칼럼 조회
  const column = await db
    .select()
    .from(mentorColumns)
    .where(
      and(
        eq(mentorColumns.authorId, authorId),
        eq(mentorColumns.title, data.title)
      )
    )
    .orderBy(desc(mentorColumns.createdAt))
    .limit(1)
    .then((rows) => rows[0]);

  return column;
}

export async function updateColumn(
  columnId: number,
  userId: number,
  data: Partial<{
    title: string;
    content: string;
    category: string;
    excerpt: string;
    coverImageUrl: string;
    status: "draft" | "published";
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 작성자 확인
  const column = await db
    .select()
    .from(mentorColumns)
    .where(eq(mentorColumns.id, columnId))
    .then((rows) => rows[0]);

  if (!column || column.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(mentorColumns)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(mentorColumns.id, columnId));

  const updated = await db
    .select()
    .from(mentorColumns)
    .where(eq(mentorColumns.id, columnId))
    .then((rows) => rows[0]);

  return updated;
}

export async function deleteColumn(columnId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 작성자 확인
  const column = await db
    .select()
    .from(mentorColumns)
    .where(eq(mentorColumns.id, columnId))
    .then((rows) => rows[0]);

  if (!column || column.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(mentorColumns)
    .set({ deletedAt: new Date() })
    .where(eq(mentorColumns.id, columnId));

  return { success: true };
}

export async function toggleColumnLike(columnId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 기존 좋아요 확인
  const existingLike = await db
    .select()
    .from(mentorColumnLikes)
    .where(
      and(eq(mentorColumnLikes.columnId, columnId), eq(mentorColumnLikes.userId, userId))
    )
    .then((rows) => rows[0]);

  if (existingLike) {
    // 좋아요 취소
    await db
      .delete(mentorColumnLikes)
      .where(
        and(
          eq(mentorColumnLikes.columnId, columnId),
          eq(mentorColumnLikes.userId, userId)
        )
      );

    // 좋아요 수 감소
    await db
      .update(mentorColumns)
      .set({ likesCount: sql`${mentorColumns.likesCount} - 1` })
      .where(eq(mentorColumns.id, columnId));

    return { liked: false, likeCount: 0 }; // 실제로는 DB에서 조회해야 함
  } else {
    // 좋아요 추가
    await db.insert(mentorColumnLikes).values({
      columnId,
      userId,
    });

    // 좋아요 수 증가
    await db
      .update(mentorColumns)
      .set({ likesCount: sql`${mentorColumns.likesCount} + 1` })
      .where(eq(mentorColumns.id, columnId));

    return { liked: true, likeCount: 0 }; // 실제로는 DB에서 조회해야 함
  }
}

export async function getColumnComments(columnId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const comments = await db
    .select({
      id: mentorColumnComments.id,
      content: mentorColumnComments.content,
      parentCommentId: mentorColumnComments.parentCommentId,
      createdAt: mentorColumnComments.createdAt,
      author: {
        id: users.id,
        name: users.name,
      },
    })
    .from(mentorColumnComments)
    .innerJoin(users, eq(mentorColumnComments.authorId, users.id))
    .where(
      and(
        eq(mentorColumnComments.columnId, columnId),
        isNull(mentorColumnComments.deletedAt)
      )
    )
    .orderBy(desc(mentorColumnComments.createdAt));

  return comments;
}

export async function createComment(
  columnId: number,
  userId: number,
  content: string,
  parentCommentId?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 1단계 대댓글만 허용
  if (parentCommentId) {
    const parentComment = await db
      .select()
      .from(mentorColumnComments)
      .where(eq(mentorColumnComments.id, parentCommentId))
      .then((rows) => rows[0]);

    if (!parentComment || parentComment.parentCommentId !== null) {
      throw new Error("Only 1-level replies are allowed");
    }
  }

  await db
    .insert(mentorColumnComments)
    .values({
      columnId,
      authorId: userId,
      content,
      parentCommentId: parentCommentId || null,
    });

  // 방금 생성한 댓글 조회
  const comment = await db
    .select()
    .from(mentorColumnComments)
    .where(
      and(
        eq(mentorColumnComments.columnId, columnId),
        eq(mentorColumnComments.authorId, userId),
        eq(mentorColumnComments.content, content)
      )
    )
    .orderBy(desc(mentorColumnComments.createdAt))
    .limit(1)
    .then((rows) => rows[0]);

  // 댓글 수 증가
  await db
    .update(mentorColumns)
    .set({ commentsCount: sql`${mentorColumns.commentsCount} + 1` })
    .where(eq(mentorColumns.id, columnId));

  return comment;
}

export async function updateComment(
  commentId: number,
  userId: number,
  content: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 작성자 확인
  const comment = await db
    .select()
    .from(mentorColumnComments)
    .where(eq(mentorColumnComments.id, commentId))
    .then((rows) => rows[0]);

  if (!comment || comment.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(mentorColumnComments)
    .set({ content, updatedAt: new Date() })
    .where(eq(mentorColumnComments.id, commentId));

  const updated = await db
    .select()
    .from(mentorColumnComments)
    .where(eq(mentorColumnComments.id, commentId))
    .then((rows) => rows[0]);

  return updated;
}

export async function deleteComment(commentId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // 작성자 확인
  const comment = await db
    .select()
    .from(mentorColumnComments)
    .where(eq(mentorColumnComments.id, commentId))
    .then((rows) => rows[0]);

  if (!comment || comment.authorId !== userId) {
    throw new Error("Unauthorized");
  }

  await db
    .update(mentorColumnComments)
    .set({ deletedAt: new Date() })
    .where(eq(mentorColumnComments.id, commentId));

  // 댓글 수 감소
  if (!comment.deletedAt) {
    await db
      .update(mentorColumns)
      .set({ commentsCount: sql`${mentorColumns.commentsCount} - 1` })
      .where(eq(mentorColumns.id, comment.columnId));
  }

  return { success: true };
}

export async function getMyColumns(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const columns = await db
    .select()
    .from(mentorColumns)
    .where(
      and(
        eq(mentorColumns.authorId, userId),
        isNull(mentorColumns.deletedAt)
      )
    )
    .orderBy(desc(mentorColumns.createdAt));

  return columns;
}


// 칼럼 조회수 증가
export async function incrementViewCount(columnId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(mentorColumns)
    .set({
      viewCount: sql`${mentorColumns.viewCount} + 1`,
    })
    .where(eq(mentorColumns.id, columnId));
}
