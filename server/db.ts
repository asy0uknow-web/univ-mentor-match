import { eq, and, or, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, 
  users, 
  mentorProfiles, 
  InsertMentorProfile, 
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
  InsertMentorGallery
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
  
  // 기존 프로필이 있는지 확인
  const existingProfile = await getMentorProfileByUserId(profile.userId);
  
  if (existingProfile) {
    // 기존 프로필이 있으면 업데이트
    await db.update(mentorProfiles).set(profile).where(eq(mentorProfiles.userId, profile.userId));
  } else {
    // 기존 프로필이 없으면 새로 생성
    await db.insert(mentorProfiles).values(profile);
  }
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
  
  await db.update(mentorProfiles).set(updates).where(eq(mentorProfiles.userId, userId));
}

export async function getAllActiveMentors() {
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
        eq(mentorProfiles.isActive, true),
        eq(mentorProfiles.verificationStatus, "approved"),
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .orderBy(desc(mentorProfiles.averageRating));
  
  return result;
}

export async function getMentorById(mentorId: number) {
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
        eq(mentorProfiles.userId, mentorId),
        eq(mentorProfiles.isDeleted, false)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
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

export async function getBookingsByMentor(mentorId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select({
      booking: bookings,
      student: users,
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.studentId, users.id))
    .where(eq(bookings.mentorId, mentorId))
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
  
  const result = await db
    .select()
    .from(messages)
    .where(
      or(
        and(eq(messages.senderId, userId1), eq(messages.recipientId, userId2)),
        and(eq(messages.senderId, userId2), eq(messages.recipientId, userId1))
      )
    )
    .orderBy(desc(messages.createdAt));
  
  return result;
}

export async function getMessagesForUser(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .select()
    .from(messages)
    .where(eq(messages.recipientId, userId))
    .orderBy(desc(messages.createdAt));
  
  return result;
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
    .leftJoin(mentorProfiles, eq(mentorVerifications.userId, mentorProfiles.userId))
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
  
  // Update mentor profile verification status
  await db.update(mentorProfiles).set({
    verificationStatus: "approved",
  }).where(eq(mentorProfiles.userId, verification[0].userId));
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
  
  // Update mentor profile verification status
  await db.update(mentorProfiles).set({
    verificationStatus: "rejected",
  }).where(eq(mentorProfiles.userId, verification[0].userId));
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
  }).where(eq(mentorProfiles.userId, userId));
}

// Mentor filtering queries
export async function getMentorsByFieldAndRegion(
  field?: "engineering" | "natural_science" | "business" | "humanities" | "education" | "liberal_arts" | "medicine",
  region?: "seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju"
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const conditions = [];
  if (field) conditions.push(eq(mentorProfiles.field, field));
  if (region) conditions.push(eq(mentorProfiles.region, region));
  conditions.push(eq(mentorProfiles.isActive, true));
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

export async function getMentorsByField(
  field: "engineering" | "natural_science" | "business" | "humanities" | "education" | "liberal_arts" | "medicine"
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
        eq(mentorProfiles.field, field),
        eq(mentorProfiles.isActive, true),
        eq(mentorProfiles.verificationStatus, "approved")
      )
    )
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
        eq(mentorProfiles.isActive, true),
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
