import { describe, it, expect, beforeAll } from "vitest";
import { getDb } from "./db";
import { mentorProfiles, mentorVerifications, users } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

describe("mentor re-registration full flow", () => {
  let db: Awaited<ReturnType<typeof getDb>>;
  let testUserId: number;

  beforeAll(async () => {
    db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create test user
    const userResult = await db.insert(users).values({
      name: "ReReg Test Mentor",
      openId: `test-rereg-${Date.now()}`,
      userType: "university_student",
    });
    testUserId = Number((userResult as any)[0].insertId);
  });

  it("should create a new mentor profile with pending status", async () => {
    // Step 1: Create initial mentor profile
    await db!.insert(mentorProfiles).values({
      userId: testUserId,
      university: "서울대학교",
      major: "컴퓨터공학",
      grade: "2",
      bio: "테스트 멘토입니다",
      hourlyRate: "30000",
      field: "engineering",
      region: "seoul",
      verificationStatus: "pending",
      isActive: true,
      isDeleted: false,
    });

    const profile = await db!.select().from(mentorProfiles).where(
      and(eq(mentorProfiles.userId, testUserId), eq(mentorProfiles.isDeleted, false))
    ).limit(1);

    expect(profile.length).toBe(1);
    expect(profile[0].verificationStatus).toBe("pending");
    expect(profile[0].isActive).toBe(true);
    expect(profile[0].isDeleted).toBe(false);
  });

  it("should approve mentor and make them visible in active list", async () => {
    // Step 2: Create verification and approve
    await db!.insert(mentorVerifications).values({
      userId: testUserId,
      studentIdImageUrl: "",
      status: "pending",
    });

    const verification = await db!.select().from(mentorVerifications).where(
      and(eq(mentorVerifications.userId, testUserId), eq(mentorVerifications.status, "pending"))
    ).orderBy(desc(mentorVerifications.createdAt)).limit(1);

    expect(verification.length).toBe(1);

    // Approve verification
    await db!.update(mentorVerifications).set({
      status: "approved",
      verifiedAt: new Date(),
    }).where(eq(mentorVerifications.id, verification[0].id));

    // Update profile - only active (non-deleted) profile
    await db!.update(mentorProfiles).set({
      verificationStatus: "approved",
      isActive: true,
    }).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, false)
      )
    );

    const approvedProfile = await db!.select().from(mentorProfiles).where(
      and(eq(mentorProfiles.userId, testUserId), eq(mentorProfiles.isDeleted, false))
    ).limit(1);

    expect(approvedProfile[0].verificationStatus).toBe("approved");
    expect(approvedProfile[0].isActive).toBe(true);
  });

  it("should soft-delete mentor profile (admin delete or deactivation)", async () => {
    // Step 3: Admin deletes the mentor (soft delete)
    await db!.update(mentorProfiles).set({
      isDeleted: true,
      isActive: false,
    }).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, false)
      )
    );

    // Verify the profile is now deleted
    const deletedProfile = await db!.select().from(mentorProfiles).where(
      and(eq(mentorProfiles.userId, testUserId), eq(mentorProfiles.isDeleted, false))
    ).limit(1);

    expect(deletedProfile.length).toBe(0);

    // Verify the deleted profile exists
    const softDeleted = await db!.select().from(mentorProfiles).where(
      and(eq(mentorProfiles.userId, testUserId), eq(mentorProfiles.isDeleted, true))
    ).limit(1);

    expect(softDeleted.length).toBe(1);
    expect(softDeleted[0].isActive).toBe(false);
  });

  it("should re-register mentor with pending status and create new verification", async () => {
    // Step 4: Re-register - restore deleted profile with pending status
    await db!.update(mentorProfiles).set({
      university: "고려대학교",
      major: "데이터과학",
      grade: "3",
      bio: "재등록 멘토입니다",
      hourlyRate: "35000",
      verificationStatus: "pending",
      isActive: true,
      isDeleted: false,
    }).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, true)
      )
    );

    // Create new verification request
    await db!.insert(mentorVerifications).values({
      userId: testUserId,
      studentIdImageUrl: "",
      status: "pending",
    });

    const reregisteredProfile = await db!.select().from(mentorProfiles).where(
      and(eq(mentorProfiles.userId, testUserId), eq(mentorProfiles.isDeleted, false))
    ).limit(1);

    expect(reregisteredProfile.length).toBe(1);
    expect(reregisteredProfile[0].verificationStatus).toBe("pending");
    expect(reregisteredProfile[0].isActive).toBe(true);
    expect(reregisteredProfile[0].isDeleted).toBe(false);
    expect(reregisteredProfile[0].university).toBe("고려대학교");
  });

  it("should approve re-registered mentor and make them visible again", async () => {
    // Step 5: Approve the re-registered mentor
    const pendingVerification = await db!.select().from(mentorVerifications).where(
      and(eq(mentorVerifications.userId, testUserId), eq(mentorVerifications.status, "pending"))
    ).orderBy(desc(mentorVerifications.createdAt)).limit(1);

    expect(pendingVerification.length).toBe(1);

    // Approve
    await db!.update(mentorVerifications).set({
      status: "approved",
      verifiedAt: new Date(),
    }).where(eq(mentorVerifications.id, pendingVerification[0].id));

    await db!.update(mentorProfiles).set({
      verificationStatus: "approved",
      isActive: true,
    }).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, false)
      )
    );

    // Verify the mentor is now visible
    const approvedProfile = await db!.select().from(mentorProfiles).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, false),
        eq(mentorProfiles.verificationStatus, "approved"),
        eq(mentorProfiles.isActive, true)
      )
    ).limit(1);

    expect(approvedProfile.length).toBe(1);
    expect(approvedProfile[0].verificationStatus).toBe("approved");
    expect(approvedProfile[0].isActive).toBe(true);
    expect(approvedProfile[0].isDeleted).toBe(false);
  });

  it("should not update deleted profiles when approving active profile", async () => {
    // Create a second profile (simulating duplicate scenario)
    await db!.insert(mentorProfiles).values({
      userId: testUserId,
      university: "연세대학교",
      major: "경영학",
      grade: "1",
      bio: "삭제된 프로필",
      hourlyRate: "20000",
      field: "business",
      region: "seoul",
      verificationStatus: "rejected",
      isActive: false,
      isDeleted: true,
    });

    // Update only active profile
    await db!.update(mentorProfiles).set({
      verificationStatus: "approved",
    }).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, false)
      )
    );

    // Verify deleted profile was NOT updated
    const deletedProfiles = await db!.select().from(mentorProfiles).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, true)
      )
    );

    for (const p of deletedProfiles) {
      expect(p.verificationStatus).not.toBe("approved");
    }

    // Verify active profile WAS updated
    const activeProfile = await db!.select().from(mentorProfiles).where(
      and(
        eq(mentorProfiles.userId, testUserId),
        eq(mentorProfiles.isDeleted, false)
      )
    ).limit(1);

    expect(activeProfile[0].verificationStatus).toBe("approved");
  });
});
