import { describe, it, expect, beforeEach } from "vitest";
import {
  updateMessage,
  deleteMessage,
  addMessageReaction,
  getMessageReactions,
  updateTypingStatus,
  getTypingStatus,
  getUserProfile,
  upsertUserProfile,
  updateUserOnlineStatus,
  markAllMessagesAsRead,
  getDb,
} from "./db";
import { users, messages, messageReactions, userTypingStatus, userProfiles } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

// 테스트용 유저 ID (실제 DB에 없는 고유 ID 사용)
const TEST_USER_A = 99901;
const TEST_USER_B = 99902;

async function cleanupTestData() {
  const db = await getDb();
  if (!db) return;
  await db.delete(messageReactions).where(eq(messageReactions.userId, TEST_USER_A));
  await db.delete(messageReactions).where(eq(messageReactions.userId, TEST_USER_B));
  await db.delete(userTypingStatus).where(eq(userTypingStatus.userId, TEST_USER_A));
  await db.delete(userTypingStatus).where(eq(userTypingStatus.userId, TEST_USER_B));
  await db.delete(userProfiles).where(eq(userProfiles.userId, TEST_USER_A));
  await db.delete(userProfiles).where(eq(userProfiles.userId, TEST_USER_B));
  await db.delete(messages).where(eq(messages.senderId, TEST_USER_A));
  await db.delete(messages).where(eq(messages.senderId, TEST_USER_B));
  await db.delete(users).where(eq(users.id, TEST_USER_A));
  await db.delete(users).where(eq(users.id, TEST_USER_B));
}

async function createTestUsers() {
  const db = await getDb();
  if (!db) return;
  const ts = Date.now();
  await db.insert(users).values([
    { id: TEST_USER_A, openId: `test-ux-a-${ts}`, name: "테스트유저A", email: `test-ux-a-${ts}@test.com` },
    { id: TEST_USER_B, openId: `test-ux-b-${ts}`, name: "테스트유저B", email: `test-ux-b-${ts}@test.com` },
  ]).onDuplicateKeyUpdate({ set: { name: "테스트유저" } });
}

// 메시지 생성 후 ID 반환 헬퍼
async function insertTestMessage(senderId: number, recipientId: number, content: string): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const [result] = await db.insert(messages).values({
    senderId,
    recipientId,
    content,
    isRead: false,
  });
  return (result as any).insertId;
}

describe("Message UX Improvements", () => {
  beforeEach(async () => {
    await cleanupTestData();
    await createTestUsers();
  });

  describe("메시지 수정", () => {
    it("메시지를 수정할 수 있어야 함", async () => {
      const msgId = await insertTestMessage(TEST_USER_A, TEST_USER_B, "원본 메시지");

      await updateMessage(msgId, TEST_USER_A, "수정된 메시지");

      const db = await getDb();
      if (!db) return;
      const updated = await db.select().from(messages).where(eq(messages.id, msgId)).limit(1);
      expect(updated[0].content).toBe("수정된 메시지");
      expect(updated[0].isEdited).toBe(true);
      expect(updated[0].originalContent).toBe("원본 메시지");
    });

    it("다른 사람의 메시지는 수정할 수 없어야 함", async () => {
      const msgId = await insertTestMessage(TEST_USER_A, TEST_USER_B, "원본 메시지");
      await expect(updateMessage(msgId, TEST_USER_B, "해킹 시도")).rejects.toThrow("Unauthorized");
    });
  });

  describe("메시지 삭제", () => {
    it("메시지를 소프트 삭제할 수 있어야 함", async () => {
      const msgId = await insertTestMessage(TEST_USER_A, TEST_USER_B, "삭제될 메시지");

      await deleteMessage(msgId, TEST_USER_A);

      const db = await getDb();
      if (!db) return;
      const deleted = await db.select().from(messages).where(eq(messages.id, msgId)).limit(1);
      expect(deleted[0].isDeleted).toBe(true);
      expect(deleted[0].deletedAt).not.toBeNull();
    });

    it("다른 사람의 메시지는 삭제할 수 없어야 함", async () => {
      const msgId = await insertTestMessage(TEST_USER_A, TEST_USER_B, "삭제될 메시지");
      await expect(deleteMessage(msgId, TEST_USER_B)).rejects.toThrow("Unauthorized");
    });
  });

  describe("메시지 반응", () => {
    it("메시지에 이모지 반응을 추가할 수 있어야 함", async () => {
      const msgId = await insertTestMessage(TEST_USER_A, TEST_USER_B, "반응 테스트");

      const addResult = await addMessageReaction(msgId, TEST_USER_B, "👍");
      expect(addResult.action).toBe("added");

      const reactions = await getMessageReactions([msgId]);
      expect(reactions.length).toBe(1);
      expect(reactions[0].emoji).toBe("👍");
    });

    it("같은 이모지를 다시 누르면 반응이 제거되어야 함 (토글)", async () => {
      const msgId = await insertTestMessage(TEST_USER_A, TEST_USER_B, "반응 토글 테스트");

      await addMessageReaction(msgId, TEST_USER_B, "❤️");
      const removeResult = await addMessageReaction(msgId, TEST_USER_B, "❤️");
      expect(removeResult.action).toBe("removed");

      const reactions = await getMessageReactions([msgId]);
      expect(reactions.length).toBe(0);
    });
  });

  describe("타이핑 상태", () => {
    it("타이핑 상태를 업데이트하고 조회할 수 있어야 함", async () => {
      await updateTypingStatus(TEST_USER_A, TEST_USER_B, true);
      const status = await getTypingStatus(TEST_USER_B, TEST_USER_A);
      expect(status.isTyping).toBe(true);
    });

    it("타이핑 중지 상태를 업데이트할 수 있어야 함", async () => {
      await updateTypingStatus(TEST_USER_A, TEST_USER_B, true);
      await updateTypingStatus(TEST_USER_A, TEST_USER_B, false);
      const status = await getTypingStatus(TEST_USER_B, TEST_USER_A);
      expect(status.isTyping).toBe(false);
    });
  });

  describe("사용자 프로필", () => {
    it("사용자 프로필을 생성하고 조회할 수 있어야 함", async () => {
      await upsertUserProfile(TEST_USER_A, { profileImageUrl: "https://example.com/avatar.jpg" });
      const profile = await getUserProfile(TEST_USER_A);
      expect(profile).not.toBeNull();
      expect(profile?.profileImageUrl).toBe("https://example.com/avatar.jpg");
    });

    it("온라인 상태를 업데이트할 수 있어야 함", async () => {
      await updateUserOnlineStatus(TEST_USER_A, true);
      const profile = await getUserProfile(TEST_USER_A);
      expect(profile?.isOnline).toBe(true);
    });
  });

  describe("대화 전체 읽음 처리", () => {
    it("대화의 모든 메시지를 읽음 처리할 수 있어야 함", async () => {
      await insertTestMessage(TEST_USER_A, TEST_USER_B, "메시지1");
      await insertTestMessage(TEST_USER_A, TEST_USER_B, "메시지2");

      await markAllMessagesAsRead(TEST_USER_B, TEST_USER_A);

      const db = await getDb();
      if (!db) return;
      const unread = await db.select().from(messages)
        .where(and(eq(messages.senderId, TEST_USER_A), eq(messages.recipientId, TEST_USER_B)));
      const allRead = unread.every(m => m.isRead);
      expect(allRead).toBe(true);
    });
  });
});
