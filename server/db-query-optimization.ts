import { getDb } from "./db";
import { messages, users, mentorProfiles } from "../drizzle/schema";
import { eq, and, or, desc, asc } from "drizzle-orm";

/**
 * Optimized query for fetching messages between two users with JOIN
 * Reduces N+1 queries by using a single JOIN query instead of multiple separate queries
 */
export async function getMessagesBetweenUsersOptimized(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch all messages with user and mentor profile info in a single query
  const allMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      content: messages.content,
      messageType: messages.messageType,
      isRead: messages.isRead,
      isDeleted: messages.isDeleted,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
      senderName: users.name,
      senderIsMentor: mentorProfiles.id,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .leftJoin(
      mentorProfiles,
      and(
        eq(mentorProfiles.userId, messages.senderId),
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      )
    )
    .orderBy(asc(messages.createdAt));

  // Fetch recipient info in a single query
  const recipientInfo = await db
    .select({
      id: users.id,
      name: users.name,
      isMentor: mentorProfiles.id,
    })
    .from(users)
    .leftJoin(
      mentorProfiles,
      and(
        eq(mentorProfiles.userId, users.id),
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .where(or(eq(users.id, userId1), eq(users.id, userId2)));

  const recipientMap = new Map(recipientInfo.map((r) => [r.id, r]));

  return allMessages.map((msg: any) => {
    const senderName = msg.senderName || `User ${msg.senderId}`;
    const senderIsMentor = msg.senderIsMentor !== null;
    const senderDisplayName = senderIsMentor ? `${senderName}멘토님` : `${senderName}멘티님`;

    const recipient = recipientMap.get(msg.recipientId);
    const recipientName = recipient?.name || `User ${msg.recipientId}`;
    const recipientIsMentor = recipient?.isMentor !== null;
    const recipientDisplayName = recipientIsMentor ? `${recipientName}멘토님` : `${recipientName}멘티님`;

    return {
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      messageType: msg.messageType,
      isRead: msg.isRead,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      senderName: senderDisplayName,
      recipientName: recipientDisplayName,
    };
  });
}

/**
 * Optimized query for fetching inbox messages with JOIN
 * Reduces N+1 queries by using a single JOIN query instead of looping through messages
 */
export async function getMessagesForUserOptimized(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Fetch all messages with user info in a single query
  const allMessages = await db
    .select({
      id: messages.id,
      senderId: messages.senderId,
      recipientId: messages.recipientId,
      content: messages.content,
      messageType: messages.messageType,
      isRead: messages.isRead,
      isDeleted: messages.isDeleted,
      createdAt: messages.createdAt,
      updatedAt: messages.updatedAt,
      senderName: users.name,
      senderIsMentor: mentorProfiles.id,
    })
    .from(messages)
    .leftJoin(users, eq(messages.senderId, users.id))
    .leftJoin(
      mentorProfiles,
      and(
        eq(mentorProfiles.userId, messages.senderId),
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .where(or(eq(messages.recipientId, userId), eq(messages.senderId, userId)))
    .orderBy(desc(messages.createdAt));

  // Fetch all recipient info in a single query
  const recipientIds = new Set<number>();
  allMessages.forEach((msg: any) => {
    recipientIds.add(msg.recipientId);
  });

  const recipientIdArray = Array.from(recipientIds);
  const recipientInfo = recipientIdArray.length > 0
    ? await db
        .select({
          id: users.id,
          name: users.name,
          isMentor: mentorProfiles.id,
        })
        .from(users)
        .leftJoin(
          mentorProfiles,
          and(
            eq(mentorProfiles.userId, users.id),
            eq(mentorProfiles.isDeleted, false)
          )
        )
        .where(
          or(...recipientIdArray.map((id) => eq(users.id, id)))
        )
    : []

  const recipientMap = new Map(recipientInfo.map((r) => [r.id, r]));

  return allMessages.map((msg: any) => {
    const senderName = msg.senderName || `User ${msg.senderId}`;
    const senderIsMentor = msg.senderIsMentor !== null;
    const senderDisplayName = senderIsMentor ? `${senderName}멘토님` : `${senderName}멘티님`;

    const recipient = recipientMap.get(msg.recipientId);
    const recipientName = recipient?.name || `User ${msg.recipientId}`;
    const recipientIsMentor = recipient?.isMentor !== null;
    const recipientDisplayName = recipientIsMentor ? `${recipientName}멘토님` : `${recipientName}멘티님`;

    return {
      id: msg.id,
      senderId: msg.senderId,
      recipientId: msg.recipientId,
      content: msg.content,
      messageType: msg.messageType,
      isRead: msg.isRead,
      isDeleted: msg.isDeleted,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
      senderName: senderDisplayName,
      recipientName: recipientDisplayName,
    };
  });
}
