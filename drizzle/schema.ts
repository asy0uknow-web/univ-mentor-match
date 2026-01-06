import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  // User type: high_school_student or university_student
  userType: mysqlEnum("userType", ["high_school_student", "university_student"]),
  // Stripe customer ID for payment processing
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * University student mentor profiles
 */
export const mentorProfiles = mysqlTable("mentor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id
  university: varchar("university", { length: 255 }).notNull(),
  major: varchar("major", { length: 255 }).notNull(),
  grade: mysqlEnum("grade", ["1", "2", "3", "4", "graduate"]).notNull(),
  bio: text("bio"),
  // Hourly consultation fee in KRW
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }).notNull(),
  // Available time slots (stored as JSON string)
  availableSlots: text("availableSlots"),
  // Profile visibility
  isActive: boolean("isActive").default(true).notNull(),
  // Average rating (calculated from reviews)
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  // Total number of reviews
  reviewCount: int("reviewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorProfile = typeof mentorProfiles.$inferSelect;
export type InsertMentorProfile = typeof mentorProfiles.$inferInsert;

/**
 * Consultation booking requests
 */
export const bookings = mysqlTable("bookings", {
  id: int("id").autoincrement().primaryKey(),
  // High school student who made the booking
  studentId: int("studentId").notNull(),
  // University student mentor
  mentorId: int("mentorId").notNull(),
  // Consultation date and time
  scheduledAt: timestamp("scheduledAt").notNull(),
  // Duration in hours
  duration: decimal("duration", { precision: 3, scale: 1 }).notNull(),
  // Total amount to be paid
  totalAmount: decimal("totalAmount", { precision: 10, scale: 2 }).notNull(),
  // Booking status
  status: mysqlEnum("status", ["pending", "confirmed", "completed", "cancelled"]).default("pending").notNull(),
  // Stripe Payment Intent ID
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  // Student's message or questions
  studentMessage: text("studentMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = typeof bookings.$inferInsert;

/**
 * Reviews and ratings for mentors
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  bookingId: int("bookingId").notNull(), // References bookings.id
  studentId: int("studentId").notNull(), // References users.id
  mentorId: int("mentorId").notNull(), // References users.id
  rating: int("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Notifications for users
 */
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id
  type: mysqlEnum("type", ["booking_confirmed", "booking_cancelled", "schedule_changed", "review_received"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  // Related entity ID (booking ID, review ID, etc.)
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;