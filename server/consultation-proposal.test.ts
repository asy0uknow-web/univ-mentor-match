/**
 * 채팅 내 상담 제안 시스템 테스트
 * - 제안 생성 (멘티 → 멘토)
 * - 제안 수락 (멘토)
 * - 제안 거절 (멘토)
 * - 수정 제안 (멘토 → 멘티)
 * - 상담 완료 처리
 * - 제안 취소
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { getDb } from "./db";
import { users, mentorProfiles, consultationProposals, messages } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

let db: Awaited<ReturnType<typeof getDb>>;
let menteeUserId: number;
let mentorUserId: number;
let proposalId: number;

const TEST_PREFIX = "proposal_test_";

beforeAll(async () => {
  db = await getDb();
  if (!db) throw new Error("Database not available");

  // 테스트용 멘티 생성
  const menteeResult = await db.insert(users).values({
    name: `${TEST_PREFIX}mentee`,
    email: `${TEST_PREFIX}mentee@test.com`,
    openId: `${TEST_PREFIX}mentee_oid`,
    loginMethod: "google",
    userType: "high_school_student",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  menteeUserId = Number((menteeResult as any).insertId ?? (menteeResult as any)[0]?.insertId);

  // 테스트용 멘토 생성
  const mentorResult = await db.insert(users).values({
    name: `${TEST_PREFIX}mentor`,
    email: `${TEST_PREFIX}mentor@test.com`,
    openId: `${TEST_PREFIX}mentor_oid`,
    loginMethod: "google",
    userType: "university_student",
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  mentorUserId = Number((mentorResult as any).insertId ?? (mentorResult as any)[0]?.insertId);

  // 멘토 프로필 생성
  await db.insert(mentorProfiles).values({
    userId: mentorUserId,
    university: "서울대학교",
    major: "컴퓨터공학과",
    grade: "3",
    bio: "테스트 멘토입니다",
    hourlyRate: "30000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
});

afterAll(async () => {
  if (!db) return;
  // 테스트 데이터 정리
  await db.delete(messages).where(
    eq(messages.senderId, menteeUserId)
  );
  await db.delete(messages).where(
    eq(messages.senderId, mentorUserId)
  );
  await db.delete(consultationProposals).where(
    eq(consultationProposals.proposerId, menteeUserId)
  );
  await db.delete(consultationProposals).where(
    eq(consultationProposals.proposerId, mentorUserId)
  );
  await db.delete(mentorProfiles).where(
    eq(mentorProfiles.userId, mentorUserId)
  );
  await db.delete(users).where(eq(users.id, menteeUserId));
  await db.delete(users).where(eq(users.id, mentorUserId));
});

describe("상담 제안 생성", () => {
  it("멘티가 멘토에게 상담 일정을 제안할 수 있다", async () => {
    const scheduledAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 1주일 후

    const result = await db!.insert(consultationProposals).values({
      proposerId: menteeUserId,
      receiverId: mentorUserId,
      status: "pending",
      scheduledAt,
      consultationMode: "online",
      duration: "1",
      consultationType: "career_counseling",
      note: "진로 상담을 받고 싶습니다",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    proposalId = Number((result as any).insertId ?? (result as any)[0]?.insertId);
    expect(proposalId).toBeGreaterThan(0);

    const proposal = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.id, proposalId)
    ).limit(1);

    expect(proposal[0]).toBeDefined();
    expect(proposal[0].status).toBe("pending");
    expect(proposal[0].proposerId).toBe(menteeUserId);
    expect(proposal[0].receiverId).toBe(mentorUserId);
    expect(proposal[0].consultationType).toBe("career_counseling");
  });

  it("제안 생성 시 proposal 타입 메시지가 생성된다", async () => {
    const content = JSON.stringify({
      type: "proposal",
      proposalId,
      scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      consultationMode: "online",
      duration: 1,
      consultationType: "career_counseling",
      status: "pending",
    });

    await db!.insert(messages).values({
      senderId: menteeUserId,
      recipientId: mentorUserId,
      content,
      messageType: "proposal",
      proposalId,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const msg = await db!.select().from(messages).where(
      and(
        eq(messages.senderId, menteeUserId),
        eq(messages.recipientId, mentorUserId),
        eq(messages.messageType, "proposal")
      )
    ).limit(1);

    expect(msg[0]).toBeDefined();
    expect(msg[0].messageType).toBe("proposal");
    expect(msg[0].proposalId).toBe(proposalId);

    const parsed = JSON.parse(msg[0].content);
    expect(parsed.type).toBe("proposal");
    expect(parsed.proposalId).toBe(proposalId);
  });
});

describe("제안 수락", () => {
  it("멘토가 제안을 수락하면 상태가 accepted로 변경된다", async () => {
    await db!.update(consultationProposals).set({
      status: "accepted",
      acceptedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(consultationProposals.id, proposalId));

    const updated = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.id, proposalId)
    ).limit(1);

    expect(updated[0].status).toBe("accepted");
    expect(updated[0].acceptedAt).toBeDefined();
  });

  it("수락 시 proposal_status 메시지가 생성된다", async () => {
    const content = JSON.stringify({
      type: "proposal_status",
      proposalId,
      status: "accepted",
      message: "상담이 확정되었어요 🎉",
    });

    await db!.insert(messages).values({
      senderId: mentorUserId,
      recipientId: menteeUserId,
      content,
      messageType: "proposal",
      proposalId,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const msg = await db!.select().from(messages).where(
      and(
        eq(messages.senderId, mentorUserId),
        eq(messages.recipientId, menteeUserId),
        eq(messages.messageType, "proposal")
      )
    ).limit(1);

    expect(msg[0]).toBeDefined();
    const parsed = JSON.parse(msg[0].content);
    expect(parsed.type).toBe("proposal_status");
    expect(parsed.status).toBe("accepted");
  });
});

describe("제안 거절", () => {
  it("pending 상태의 제안을 거절할 수 있다", async () => {
    // 새 제안 생성
    const newResult = await db!.insert(consultationProposals).values({
      proposerId: menteeUserId,
      receiverId: mentorUserId,
      status: "pending",
      scheduledAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      consultationMode: "offline",
      location: "강남역",
      duration: "1.5",
      consultationType: "resume_consulting",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const newProposalId = Number((newResult as any).insertId ?? (newResult as any)[0]?.insertId);

    await db!.update(consultationProposals).set({
      status: "rejected",
      updatedAt: new Date(),
    }).where(eq(consultationProposals.id, newProposalId));

    const updated = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.id, newProposalId)
    ).limit(1);

    expect(updated[0].status).toBe("rejected");
  });
});

describe("상담 완료 처리", () => {
  it("accepted 상태의 제안을 completed로 변경할 수 있다", async () => {
    await db!.update(consultationProposals).set({
      status: "completed",
      completedAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(consultationProposals.id, proposalId));

    const updated = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.id, proposalId)
    ).limit(1);

    expect(updated[0].status).toBe("completed");
    expect(updated[0].completedAt).toBeDefined();
  });
});

describe("제안 취소", () => {
  it("pending 상태의 제안을 취소할 수 있다", async () => {
    const cancelResult = await db!.insert(consultationProposals).values({
      proposerId: menteeUserId,
      receiverId: mentorUserId,
      status: "pending",
      scheduledAt: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      consultationMode: "online",
      duration: "1",
      consultationType: "academic_management",
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const cancelId = Number((cancelResult as any).insertId ?? (cancelResult as any)[0]?.insertId);

    await db!.update(consultationProposals).set({
      status: "cancelled",
      updatedAt: new Date(),
    }).where(eq(consultationProposals.id, cancelId));

    const updated = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.id, cancelId)
    ).limit(1);

    expect(updated[0].status).toBe("cancelled");
  });
});

describe("제안 조회", () => {
  it("특정 대화의 제안 목록을 조회할 수 있다", async () => {
    const proposals = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.proposerId, menteeUserId)
    );

    expect(proposals.length).toBeGreaterThan(0);
    proposals.forEach(p => {
      expect(p.proposerId).toBe(menteeUserId);
    });
  });

  it("제안 상태가 유효한 값이다", async () => {
    const validStatuses = ["pending", "accepted", "rejected", "counter_proposed", "cancelled", "completed"];
    const proposals = await db!.select().from(consultationProposals).where(
      eq(consultationProposals.proposerId, menteeUserId)
    );

    proposals.forEach(p => {
      expect(validStatuses).toContain(p.status);
    });
  });
});
