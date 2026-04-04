import { eq, and, or, desc, asc, sql, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  mentorProfiles, 
  InsertMentorProfile,
  studentProfiles,
  InsertStudentProfile,
  bookings, 
  InsertBooking,
  reviews,
  InsertReview,
  notifications,
  InsertNotification,
  messages,
  InsertMessage,
  mentorVerifications,
  InsertMentorVerification,
  mentorGallery,
  InsertMentorGallery,
  mentorConsultationTypes,
  messageReactions,
  InsertMessageReaction,
  userTypingStatus,
  userProfiles,
  InsertUserProfile
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.userType !== undefined) {
      values.userType = user.userType;
      updateSet.userType = user.userType;
    }
    if (user.stripeCustomerId !== undefined) {
      values.stripeCustomerId = user.stripeCustomerId;
      updateSet.stripeCustomerId = user.stripeCustomerId;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserOAuthInfo(userId: number, openId: string, loginMethod: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ openId, loginMethod }).where(eq(users.id, userId));
}

export async function updateUserType(userId: number, userType: "high_school_student" | "university_student") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ userType }).where(eq(users.id, userId));
}

export async function updateStripeCustomerId(userId: number, stripeCustomerId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set({ stripeCustomerId }).where(eq(users.id, userId));
}

// Mentor Profile queries
export async function createMentorProfile(profile: InsertMentorProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // UUID 생성 (제공되지 않은 경우)
  const uuid = profile.uuid || generateUUID();
  
  // 기존 활성 프로필이 있는지 확인 (isDeleted=false)
  const existingProfile = await getMentorProfileByUserId(profile.userId);
  
  if (existingProfile) {
    // 기존 활성 프로필이 있으면 업데이트
    await db.update(mentorProfiles).set({
      ...profile,
      uuid,
      verificationStatus: "pending",
      isDeleted: false,
    }).where(
      and(
        eq(mentorProfiles.userId, profile.userId),
        eq(mentorProfiles.isDeleted, false)
      )
    );
  } else {
    // 삭제된 프로필이 있는지 확인
    const deletedProfile = await db.select().from(mentorProfiles).where(
      and(
        eq(mentorProfiles.userId, profile.userId),
        eq(mentorProfiles.isDeleted, true)
      )
    ).limit(1);
    
    if (deletedProfile.length > 0) {
      // 삭제된 프로필이 있으면 복원 (재등록)
      await db.update(mentorProfiles).set({
        ...profile,
        uuid,
        verificationStatus: "pending",
        isDeleted: false,
      }).where(eq(mentorProfiles.id, deletedProfile[0].id));
    } else {
      // 완전히 새로운 프로필 생성
      await db.insert(mentorProfiles).values({
        ...profile,
        uuid,
        verificationStatus: "pending",
        isDeleted: false,
      });
    }
  }
}

export async function createStudentProfile(profile: InsertStudentProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // UUID 생성 (제공되지 않은 경우)
  const uuid = profile.uuid || generateUUID();
  
  // 기존 활성 프로필이 있는지 확인
  const existingProfile = await db.select().from(studentProfiles).where(
    eq(studentProfiles.userId, profile.userId)
  ).limit(1);
  
  if (existingProfile.length > 0) {
    // 기존 프로필이 있으면 업데이트
    await db.update(studentProfiles).set({
      ...profile,
      uuid,
    }).where(eq(studentProfiles.userId, profile.userId));
  } else {
    // 새로운 프로필 생성
    await db.insert(studentProfiles).values({
      ...profile,
      uuid,
    });
  }
}

// UUID 생성 함수
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export async function getMentorProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(mentorProfiles).where(
    and(
      eq(mentorProfiles.userId, userId),
      eq(mentorProfiles.isDeleted, false)
    )
  ).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateMentorProfile(userId: number, updates: Partial<InsertMentorProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mentorProfiles).set(updates).where(
    and(
      eq(mentorProfiles.userId, userId),
      eq(mentorProfiles.isDeleted, false)
    )
  );
}

export async function getAllActiveMentors() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 최적화: 한 번의 쿼리로 멘토와 상담 유형을 모두 조회 (N+1 쿼리 문제 해결)
  const mentorsWithTypes = await db
    .select({
      profile: {
        id: mentorProfiles.id,
        uuid: mentorProfiles.uuid,
        userId: mentorProfiles.userId,
        university: mentorProfiles.university,
        major: mentorProfiles.major,
        grade: mentorProfiles.grade,
        region: mentorProfiles.region,
        bio: mentorProfiles.bio,
        hourlyRate: mentorProfiles.hourlyRate,
        availableSlots: mentorProfiles.availableSlots,
        verificationStatus: mentorProfiles.verificationStatus,
        isDeleted: mentorProfiles.isDeleted,
        createdAt: mentorProfiles.createdAt,
        updatedAt: mentorProfiles.updatedAt,
        averageRating: mentorProfiles.averageRating,
        reviewCount: mentorProfiles.reviewCount,
        field: mentorProfiles.field,
      },
      user: users,
      consultationType: mentorConsultationTypes.consultationType,
    })
    .from(mentorProfiles)
    .innerJoin(users, eq(mentorProfiles.userId, users.id))
    .leftJoin(
      mentorConsultationTypes,
      eq(mentorProfiles.userId, mentorConsultationTypes.mentorId)
    )
    .where(
      and(
        eq(mentorProfiles.verificationStatus, "approved"),
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .orderBy(desc(mentorProfiles.averageRating));
  
  // 결과를 멘토별로 그룹화
  const mentorMap = new Map<number, any>();
  
  for (const row of mentorsWithTypes) {
    const mentorId = row.profile.userId;
    
    if (!mentorMap.has(mentorId)) {
      mentorMap.set(mentorId, {
        ...row,
        profile: {
          ...row.profile,
          consultationTypes: [],
        },
      });
    }
    
    if (row.consultationType) {
      const mentor = mentorMap.get(mentorId);
      if (!mentor.profile.consultationTypes.includes(row.consultationType)) {
        mentor.profile.consultationTypes.push(row.consultationType);
      }
    }
  }
  
  return Array.from(mentorMap.values());
}

export async function getStudentById(studentId: number | string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // UUID 정규식 패턴
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUUID = typeof studentId === 'string' && uuidRegex.test(studentId);
  
  if (isUUID) {
    // UUID로 조회
    const result = await db
      .select({
        profile: studentProfiles,
        user: users,
      })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(eq(studentProfiles.uuid, studentId as string))
      .limit(1);
    
    if (result.length > 0) return result[0];
  }
  
  // 숫자 ID로 조회 (fallback)
  const numericId = typeof studentId === 'string' ? parseInt(studentId, 10) : studentId;
  if (!isNaN(numericId)) {
    const result = await db
      .select({
        profile: studentProfiles,
        user: users,
      })
      .from(studentProfiles)
      .innerJoin(users, eq(studentProfiles.userId, users.id))
      .where(eq(studentProfiles.userId, numericId))
      .limit(1);
    
    if (result.length > 0) return result[0];
  }
  
  return null;
}

export async function getMentorById(mentorId: number | string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // UUID 정규식 패턴 - 더 유연한 패턴
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const isUUID = typeof mentorId === 'string' && uuidRegex.test(mentorId);
  
  if (isUUID) {
    // UUID로 조회
    const result = await db
      .select({
        profile: mentorProfiles,
        user: users,
      })
      .from(mentorProfiles)
      .innerJoin(users, eq(mentorProfiles.userId, users.id))
      .where(
        and(
          eq(mentorProfiles.uuid, mentorId as string),
          eq(mentorProfiles.isDeleted, false)
        )
      )
      .limit(1);
    

    if (result.length > 0) return result[0];
  }
  
  // 숫자 ID로 조회 (fallback)
  const numericId = typeof mentorId === 'string' ? parseInt(mentorId, 10) : mentorId;
  if (!isNaN(numericId)) {
    const result = await db
      .select({
        profile: mentorProfiles,
        user: users,
      })
      .from(mentorProfiles)
      .innerJoin(users, eq(mentorProfiles.userId, users.id))
      .where(
        and(
          eq(mentorProfiles.id, numericId),
          eq(mentorProfiles.isDeleted, false)
        )
      )
      .limit(1);
    

    if (result.length > 0) return result[0];
  }
  

  return null;
}

// Booking queries
export async function createBooking(booking: InsertBooking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(bookings).values(booking);
  return result;
}

export async function getBookingById(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(bookings).where(eq(bookings.id, bookingId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateBookingStatus(bookingId: number, status: "pending" | "confirmed" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bookings).set({ status }).where(eq(bookings.id, bookingId));
}

export async function updateBookingPaymentIntent(bookingId: number, stripePaymentIntentId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(bookings).set({ stripePaymentIntentId }).where(eq(bookings.id, bookingId));
}

export async function getBookingsByStudent(studentId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      booking: bookings,
      mentor: users,
      mentorProfile: mentorProfiles,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.mentorId, users.id))
    .leftJoin(mentorProfiles, eq(bookings.mentorId, mentorProfiles.userId))
    .where(eq(bookings.studentId, studentId))
    .orderBy(desc(bookings.createdAt));
  
  return result;
}

export async function getBookingsByMentor(mentorUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // bookings.mentorId는 users.id(멘토의 userId)를 저장하므로 직접 조회
  const result = await db
    .select({
      booking: bookings,
      student: users,
      studentProfile: studentProfiles,
      mentorProfile: mentorProfiles,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.studentId, users.id))
    .leftJoin(studentProfiles, eq(bookings.studentId, studentProfiles.userId))
    .leftJoin(mentorProfiles, eq(bookings.mentorId, mentorProfiles.userId))
    .where(eq(bookings.mentorId, mentorUserId))
    .orderBy(desc(bookings.createdAt));
  
  return result;
}

// Review queries
export async function createReview(review: InsertReview) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(reviews).values(review);
  
  // Update mentor's average rating and review count
  await updateMentorRating(review.mentorId);
  
  return result;
}

export async function getReviewsByMentor(mentorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      review: reviews,
      student: users,
    })
    .from(reviews)
    .innerJoin(users, eq(reviews.studentId, users.id))
    .where(eq(reviews.mentorId, mentorId))
    .orderBy(desc(reviews.createdAt));
  
  return result;
}

export async function getReviewByBooking(bookingId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(reviews).where(eq(reviews.bookingId, bookingId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

async function updateMentorRating(mentorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      avgRating: sql<number>`AVG(${reviews.rating})`,
      count: sql<number>`COUNT(*)`,
    })
    .from(reviews)
    .where(eq(reviews.mentorId, mentorId));
  
  if (result.length > 0 && result[0]) {
    const avgRating = result[0].avgRating || 0;
    const count = result[0].count || 0;
    
    await db.update(mentorProfiles).set({
      averageRating: avgRating.toFixed(2),
      reviewCount: count,
    }).where(eq(mentorProfiles.userId, mentorId));
  }
}

// Notification queries
export async function createNotification(notification: InsertNotification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(notifications).values(notification);
  return result;
}

export async function getNotificationsByUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt));
  
  return result;
}

export async function markNotificationAsRead(notificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, notificationId));
}

export async function getUnreadNotificationCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  
  return result.length > 0 ? result[0]?.count || 0 : 0;
}

// Message queries
export async function createMessage(message: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(messages).values(message);
  return result;
}

export async function getMessagesBetweenUsers(userId1: number, userId2: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allMessages = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      )
    )
    .orderBy(asc(messages.createdAt));
  
  const [sender, recipient, senderMentorProfile, recipientMentorProfile] = await Promise.all([
    db.select({ name: users.name }).from(users).where(eq(users.id, userId1)).limit(1),
    db.select({ name: users.name }).from(users).where(eq(users.id, userId2)).limit(1),
    db.select({ id: mentorProfiles.id }).from(mentorProfiles).where(eq(mentorProfiles.userId, userId1)).limit(1),
    db.select({ id: mentorProfiles.id }).from(mentorProfiles).where(eq(mentorProfiles.userId, userId2)).limit(1),
  ]);
  
  const senderName = sender[0]?.name || `User ${userId1}`;
  const recipientName = recipient[0]?.name || `User ${userId2}`;
  const senderIsMentor = senderMentorProfile.length > 0;
  const recipientIsMentor = recipientMentorProfile.length > 0;
  
  const senderDisplayName = senderIsMentor ? `${senderName}멘토님` : `${senderName}멘티님`;
  const recipientDisplayName = recipientIsMentor ? `${recipientName}멘토님` : `${recipientName}멘티님`;
  
  return allMessages.map((msg: any) => ({
    ...msg,
    senderName: msg.senderId === userId1 ? senderDisplayName : recipientDisplayName,
    recipientName: msg.recipientId === userId1 ? senderDisplayName : recipientDisplayName,
  }));
}

export async function getMessagesForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const allMessages = await db
    .select()
    .from(messages)
    // NOTE: We intentionally include both received AND sent messages.
    // If we only fetch recipientId = userId, a user who just sent the first
    // message to someone will see an empty inbox until the other person replies.
    // That breaks the "문의하기" flow from mentor detail.
    .where(or(eq(messages.recipientId, userId), eq(messages.senderId, userId)))
    .orderBy(desc(messages.createdAt));
  
  const userIds = new Set<number>();
  allMessages.forEach((msg: any) => {
    userIds.add(msg.senderId);
    userIds.add(msg.recipientId);
  });
  
  const userNames: Record<number, string> = {};
  const userRoles: Record<number, boolean> = {};
  
  for (const id of Array.from(userIds)) {
    const result = await db.select({ name: users.name }).from(users).where(eq(users.id, id)).limit(1);
    userNames[id] = result[0]?.name || `User ${id}`;
    
    const mentorProfile = await db.select({ id: mentorProfiles.id }).from(mentorProfiles).where(eq(mentorProfiles.userId, id)).limit(1);
    userRoles[id] = mentorProfile.length > 0;
  }
  
  return allMessages.map((msg: any) => {
    const senderName = userNames[msg.senderId];
    const recipientName = userNames[msg.recipientId];
    const senderIsMentor = userRoles[msg.senderId];
    const recipientIsMentor = userRoles[msg.recipientId];
    
    return {
      ...msg,
      senderName: senderIsMentor ? `${senderName}멘토님` : `${senderName}멘티님`,
      recipientName: recipientIsMentor ? `${recipientName}멘토님` : `${recipientName}멘티님`,
    };
  });
}

export async function markMessageAsRead(messageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(messages).set({ isRead: true }).where(eq(messages.id, messageId));
}

export async function getUnreadMessagesCount(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(messages)
    .where(and(eq(messages.recipientId, userId), eq(messages.isRead, false)));
  
  return result.length > 0 ? result[0]?.count || 0 : 0;
}

// Mentor Verification queries
export async function createMentorVerification(verification: InsertMentorVerification) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mentorVerifications).values(verification);
  return result;
}

export async function getMentorVerificationByUserId(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(mentorVerifications)
    .where(eq(mentorVerifications.userId, userId))
    .orderBy(desc(mentorVerifications.createdAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function getPendingMentorVerifications() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      verification: mentorVerifications,
      user: users,
      profile: mentorProfiles,
    })
    .from(mentorVerifications)
    .innerJoin(users, eq(mentorVerifications.userId, users.id))
    .leftJoin(mentorProfiles, and(
      eq(mentorVerifications.userId, mentorProfiles.userId),
      eq(mentorProfiles.isDeleted, false)
    ))
    .where(eq(mentorVerifications.status, "pending"))
    .orderBy(desc(mentorVerifications.createdAt));
  
  return result;
}

export async function approveMentorVerification(verificationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const verification = await db
    .select()
    .from(mentorVerifications)
    .where(eq(mentorVerifications.id, verificationId))
    .limit(1);
  
  if (verification.length === 0) throw new Error("Verification not found");
  
  // Update verification status
  await db.update(mentorVerifications).set({
    status: "approved",
    verifiedAt: new Date(),
  }).where(eq(mentorVerifications.id, verificationId));
  
  // Update mentor profile verification status (only active profiles)
  await db.update(mentorProfiles).set({
    verificationStatus: "approved",
  }).where(
    and(
      eq(mentorProfiles.userId, verification[0].userId),
      eq(mentorProfiles.isDeleted, false)
    )
  );
}

export async function rejectMentorVerification(verificationId: number, adminNotes: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const verification = await db
    .select()
    .from(mentorVerifications)
    .where(eq(mentorVerifications.id, verificationId))
    .limit(1);
  
  if (verification.length === 0) throw new Error("Verification not found");
  
  // Update verification status
  await db.update(mentorVerifications).set({
    status: "rejected",
    adminNotes,
  }).where(eq(mentorVerifications.id, verificationId));
  
  // Update mentor profile verification status (only active profiles)
  await db.update(mentorProfiles).set({
    verificationStatus: "rejected",
  }).where(
    and(
      eq(mentorProfiles.userId, verification[0].userId),
      eq(mentorProfiles.isDeleted, false)
    )
  );
}

export async function updateMentorVerification(verificationId: number, updates: Partial<InsertMentorVerification>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(mentorVerifications)
    .set(updates)
    .where(eq(mentorVerifications.id, verificationId));
  
  return result;
}

export async function updateMentorVerificationStatus(userId: number, status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mentorProfiles).set({
    verificationStatus: status,
  }).where(
    and(
      eq(mentorProfiles.userId, userId),
      eq(mentorProfiles.isDeleted, false)
    )
  );
}

// Mentor filtering queries
// 학과명 배열을 받아서 major 필드와 매칭
function getMajorNameFromId(majorId: string): string {
  const majorMap: Record<string, string> = {
    "korean_lang_lit": "국어국문학과",
    "philosophy": "철학과",
    "korean_history": "한국사학과",
    "history": "사학과",
    "sociology": "사회학과",
    "chinese_classics": "한문학과",
    "english_lit": "영어영문학과",
    "german_lit": "독어독문학과",
    "french_lit": "불어불문학과",
    "chinese_lit": "중어중문학과",
    "russian_lit": "노어노문학과",
    "japanese_lit": "일어일문학과",
    "spanish_lit": "서어서문학과",
    "linguistics": "언어학과",
    "political_science": "정치외교학과",
    "economics": "경제학과",
    "statistics": "통계학과",
    "public_admin": "행정학과",
    "business_admin": "경영학과",
    "mathematics": "수학과",
    "physics": "물리학과",
    "chemistry": "화학과",
    "earth_science": "지구환경과학과",
    "chemical_engineering": "화공생명공학과",
    "new_materials": "신소재공학부",
    "architecture_civil": "건축사회환경공학부",
    "architecture": "건축학과",
    "mechanical_engineering": "기계공학부",
    "industrial_management": "산업경영공학부",
    "electrical_engineering": "전기전자공학부",
    "convergence_energy": "융합에너지공학과",
    "semiconductor": "반도체공학과",
    "next_gen_communication": "차세대통신학과",
    "medicine": "의학과",
    "education": "교육학과",
    "korean_education": "국어교육과",
    "english_education": "영어교육과",
    "geography_education": "지리교육과",
    "history_education": "역사교육과",
    "home_economics_education": "가정교육과",
    "math_education": "수학교육과",
    "physical_education": "체육교육과",
    "nursing": "간호학과",
    "computer_science": "컴퓨터학과",
    "data_science": "데이터과학과",
    "artificial_intelligence": "인공지능학과",
    "design": "디자인조형학부",
    "international_studies": "국제학부",
    "global_korean_fusion": "글로벌한국융합학부",
    "media": "미디어학부",
    "biomedical_engineering": "바이오의공학부",
    "biosystems_medicine": "바이오시스템의과학부",
    "health_environment": "보건환경융합과학부",
    "health_policy_management": "보건정책관리학부",
    "liberal_arts_major": "자유전공학부",
    "smart_mobility": "스마트모빌리티학부",
    "smart_security": "스마트보안학부",
  };
  return majorMap[majorId] || majorId;
}

export async function getMentorsByFieldAndRegion(
  majorIds?: string[],
  regions?: string[]
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [];
  
  // 학과명 기반 필터링
  if (majorIds && majorIds.length > 0) {
    const majorNames = majorIds.map(id => getMajorNameFromId(id));
    const majorConditions = majorNames.map(majorName => 
      sql`${mentorProfiles.major} LIKE ${`%${majorName}%`}`
    );
    conditions.push(or(...majorConditions));
  }
  
  // 지역 기반 필터링
  if (regions && regions.length > 0) {
    const validRegions = ["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"];
    const filteredRegions = regions.filter(r => validRegions.includes(r)) as any[];
    if (filteredRegions.length > 0) {
      conditions.push(inArray(mentorProfiles.region, filteredRegions));
    }
  }
  conditions.push(eq(mentorProfiles.verificationStatus, "approved"));
  
  const result = await db
    .select({
      profile: mentorProfiles,
      user: users,
    })
    .from(mentorProfiles)
    .innerJoin(users, eq(mentorProfiles.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(mentorProfiles.averageRating));
  
  return result;
}


export async function getMentorsByRegion(
  region: "seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      profile: mentorProfiles,
      user: users,
    })
    .from(mentorProfiles)
    .innerJoin(users, eq(mentorProfiles.userId, users.id))
    .where(
      and(
        eq(mentorProfiles.region, region),
        eq(mentorProfiles.verificationStatus, "approved")
      )
    )
    .orderBy(desc(mentorProfiles.averageRating));
  
  return result;
}

// Mentor gallery queries
export async function addGalleryImage(galleryImage: InsertMentorGallery) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(mentorGallery).values(galleryImage);
  return result;
}

export async function getGalleryByMentorId(mentorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(mentorGallery)
    .where(eq(mentorGallery.mentorId, mentorId))
    .orderBy(mentorGallery.displayOrder);
  
  return result;
}

export async function deleteGalleryImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(mentorGallery).where(eq(mentorGallery.id, imageId));
}

export async function updateGalleryImageOrder(imageId: number, displayOrder: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(mentorGallery).set({ displayOrder }).where(eq(mentorGallery.id, imageId));
}

// ===== 메시지 수정/삭제 =====
export async function updateMessage(messageId: number, userId: number, newContent: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 원본 메시지 확인
  const existing = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (existing.length === 0) throw new Error("Message not found");
  if (existing[0].senderId !== userId) throw new Error("Unauthorized");
  if (existing[0].isDeleted) throw new Error("Cannot edit deleted message");
  
  await db.update(messages).set({
    content: newContent,
    isEdited: true,
    originalContent: existing[0].isEdited ? existing[0].originalContent : existing[0].content,
  }).where(eq(messages.id, messageId));
  
  return { success: true };
}

export async function deleteMessage(messageId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(messages).where(eq(messages.id, messageId)).limit(1);
  if (existing.length === 0) throw new Error("Message not found");
  if (existing[0].senderId !== userId) throw new Error("Unauthorized");
  
  await db.update(messages).set({
    isDeleted: true,
    deletedAt: new Date(),
    content: "이 메시지는 삭제되었습니다.",
  }).where(eq(messages.id, messageId));
  
  return { success: true };
}

// ===== 메시지 반응 =====
export async function addMessageReaction(messageId: number, userId: number, emoji: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // 이미 같은 이모지로 반응했는지 확인
  const existing = await db.select().from(messageReactions)
    .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.userId, userId), eq(messageReactions.emoji, emoji)))
    .limit(1);
  
  if (existing.length > 0) {
    // 이미 반응했으면 제거 (토글)
    await db.delete(messageReactions)
      .where(and(eq(messageReactions.messageId, messageId), eq(messageReactions.userId, userId), eq(messageReactions.emoji, emoji)));
    return { action: "removed" };
  } else {
    await db.insert(messageReactions).values({ messageId, userId, emoji });
    return { action: "added" };
  }
}

export async function getMessageReactions(messageIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (messageIds.length === 0) return [];
  
  const reactions = await db.select().from(messageReactions)
    .where(inArray(messageReactions.messageId, messageIds));
  
  return reactions;
}

// ===== 타이핑 상태 =====
export async function updateTypingStatus(userId: number, partnerId: number, isTyping: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // upsert typing status
  const existing = await db.select().from(userTypingStatus)
    .where(and(eq(userTypingStatus.userId, userId), eq(userTypingStatus.conversationPartnerId, partnerId)))
    .limit(1);
  
  if (existing.length > 0) {
    await db.update(userTypingStatus).set({ isTyping })
      .where(and(eq(userTypingStatus.userId, userId), eq(userTypingStatus.conversationPartnerId, partnerId)));
  } else {
    await db.insert(userTypingStatus).values({ userId, conversationPartnerId: partnerId, isTyping });
  }
  
  return { success: true };
}

export async function getTypingStatus(userId: number, partnerId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(userTypingStatus)
    .where(and(eq(userTypingStatus.userId, partnerId), eq(userTypingStatus.conversationPartnerId, userId)))
    .limit(1);
  
  if (result.length === 0) return { isTyping: false };
  
  // 5초 이상 지났으면 타이핑 중 아님
  const lastUpdated = new Date(result[0].lastUpdatedAt).getTime();
  const now = Date.now();
  if (now - lastUpdated > 5000) return { isTyping: false };
  
  return { isTyping: result[0].isTyping };
}

// ===== 사용자 프로필 =====
export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserProfile(userId: number, data: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(userProfiles).set({ ...data, updatedAt: new Date() }).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, ...data });
  }
  
  return { success: true };
}

export async function updateUserOnlineStatus(userId: number, isOnline: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  
  if (existing.length > 0) {
    await db.update(userProfiles).set({ isOnline, lastActiveAt: new Date() }).where(eq(userProfiles.userId, userId));
  } else {
    await db.insert(userProfiles).values({ userId, isOnline, lastActiveAt: new Date() });
  }
}

export async function markAllMessagesAsRead(currentUserId: number, otherUserId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(messages).set({ isRead: true })
    .where(and(eq(messages.senderId, otherUserId), eq(messages.recipientId, currentUserId), eq(messages.isRead, false)));
  
  return { success: true };
}
