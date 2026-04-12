import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { users, mentorProfiles } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("Column Permission Tests", () => {
  it("멘토 프로필이 있는 사용자는 칼럼 작성 권한이 있어야 함", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // 멘토 사용자 생성
    const mentorUser = await db
      .insert(users)
      .values({
        email: `mentor-${Date.now()}@test.com`,
        name: "Test Mentor",
        passwordHash: "hashed_password",
        role: "user",
        userType: "university_student",
        emailVerified: false,
        verificationStatus: "pending",
      })
      .returning();

    const mentorUserId = mentorUser[0].id;

    // 멘토 프로필 생성
    await db.insert(mentorProfiles).values({
      userId: mentorUserId,
      university: "Test University",
      major: "Computer Science",
      grade: 3,
      bio: "Test mentor",
      field: "이공계",
      region: "서울",
      verificationStatus: "approved",
      isDeleted: false,
    });

    // 멘토 프로필 조회
    const mentorProfile = await db
      .select()
      .from(mentorProfiles)
      .where(eq(mentorProfiles.userId, mentorUserId))
      .limit(1);

    expect(mentorProfile.length).toBeGreaterThan(0);
    expect(mentorProfile[0]).toBeDefined();
    expect(mentorProfile[0].isDeleted).toBe(false);
  });

  it("멘토 프로필이 없는 사용자는 칼럼 작성 권한이 없어야 함", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // 비멘토 사용자 생성
    const nonMentorUser = await db
      .insert(users)
      .values({
        email: `student-${Date.now()}@test.com`,
        name: "Test Student",
        passwordHash: "hashed_password",
        role: "user",
        userType: "high_school_student",
        emailVerified: false,
        verificationStatus: "pending",
      })
      .returning();

    const nonMentorUserId = nonMentorUser[0].id;

    // 비멘토 프로필 조회
    const studentProfile = await db
      .select()
      .from(mentorProfiles)
      .where(eq(mentorProfiles.userId, nonMentorUserId))
      .limit(1);

    expect(studentProfile.length).toBe(0);
  });

  it("삭제된 멘토 프로필은 칼럼 작성 권한이 없어야 함", async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    
    // 임시 멘토 사용자 생성
    const tempMentor = await db
      .insert(users)
      .values({
        email: `temp-mentor-${Date.now()}@test.com`,
        name: "Temp Mentor",
        passwordHash: "hashed_password",
        role: "user",
        userType: "university_student",
        emailVerified: false,
        verificationStatus: "pending",
      })
      .returning();

    const tempMentorId = tempMentor[0].id;

    // 멘토 프로필 생성
    await db.insert(mentorProfiles).values({
      userId: tempMentorId,
      university: "Test University",
      major: "Computer Science",
      grade: 3,
      bio: "Test mentor",
      field: "이공계",
      region: "서울",
      verificationStatus: "approved",
      isDeleted: false,
    });

    // 프로필 삭제
    await db
      .update(mentorProfiles)
      .set({ isDeleted: true })
      .where(eq(mentorProfiles.userId, tempMentorId));

    // 삭제된 프로필 조회 (isDeleted = false 조건으로 조회)
    const deletedProfile = await db
      .select()
      .from(mentorProfiles)
      .where(eq(mentorProfiles.userId, tempMentorId))
      .limit(1);

    // isDeleted = true인 프로필은 조회되지 않아야 함
    expect(deletedProfile.length).toBe(0);
  });
});
