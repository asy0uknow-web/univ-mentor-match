import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal, boolean, uniqueIndex } from "drizzle-orm/mysql-core";

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
  email: varchar("email", { length: 320 }).unique(),
  loginMethod: varchar("loginMethod", { length: 64 }),
  // Password hash for email/password authentication
  passwordHash: varchar("passwordHash", { length: 255 }),
  // Email verification status
  emailVerified: boolean("emailVerified").default(false).notNull(),
  role: mysqlEnum("role", ["user", "admin", "mentor"]).default("user").notNull(),
  // User type: high_school_student or university_student
  userType: mysqlEnum("userType", ["high_school_student", "university_student"]),
  // Stripe customer ID for payment processing
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  // Phone number for contact
  phoneNumber: varchar("phoneNumber", { length: 20 }),
  // Verification status: not_verified, pending, verified, rejected
  verificationStatus: mysqlEnum("verificationStatus", ["not_verified", "pending", "verified", "rejected"]).default("not_verified").notNull(),
  // Verification method: none, kakao_pay, nice, manual
  verificationMethod: varchar("verificationMethod", { length: 64 }),
  // Verified at timestamp
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * User profiles - 사용자 프로필 정보 (프로필 사진, 온라인 상태 등)
 */
export const userProfiles = mysqlTable("user_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // 프로필 사진 URL
  profileImageUrl: varchar("profileImageUrl", { length: 500 }),
  // 온라인 상태
  isOnline: boolean("isOnline").default(false).notNull(),
  // 마지막 활동 시간
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = typeof userProfiles.$inferInsert;

/**
 * University student mentor profiles
 */
// Hybrid approach: UNIQUE userId + isDeleted flag for soft delete
// - Only one active profile per userId (enforced by UNIQUE constraint)
// - Deleted profiles kept for history (isDeleted = true)
export const mentorProfiles = mysqlTable("mentor_profiles", {
  id: int("id").autoincrement().primaryKey(),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(), // UUID for public URL exposure
  userId: int("userId").notNull().unique(), // References users.id - UNIQUE constraint to ensure one active profile per user
  university: varchar("university", { length: 255 }).notNull(),
  major: varchar("major", { length: 255 }).notNull(),

  // Region: 서울, 경기, 인천, 강원, 충청, 전라, 경상, 제주
  region: mysqlEnum("region", ["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]),
  grade: mysqlEnum("grade", ["1", "2", "3", "4", "graduate"]).notNull(),

  bio: text("bio"),
  // Professional field: engineering, natural_science, business, humanities, education, liberal_arts, medicine
  field: mysqlEnum("field", ["engineering", "natural_science", "business", "humanities", "education", "liberal_arts", "medicine"]),
  // Hourly consultation fee in KRW (deprecated - use consultation type pricing instead)
  hourlyRate: decimal("hourlyRate", { precision: 10, scale: 2 }).default("0"),
  // Available time slots (stored as JSON string)
  availableSlots: text("availableSlots"),
  // Verification status: pending, approved, rejected
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "approved", "rejected"]).default("pending").notNull(),
  // Soft delete flag: true = deleted/archived, false = active
  isDeleted: boolean("isDeleted").default(false).notNull(),
  // Average rating (calculated from reviews)
  averageRating: decimal("averageRating", { precision: 3, scale: 2 }).default("0.00"),
  // Total number of reviews
  reviewCount: int("reviewCount").default(0).notNull(),
  // Total number of Q&A answers
  answerCount: int("answerCount").default(0).notNull(),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorProfile = typeof mentorProfiles.$inferSelect;
export type InsertMentorProfile = typeof mentorProfiles.$inferInsert;

/**
 * High school student profiles
 */
export const studentProfiles = mysqlTable("student_profiles", {
  id: int("id").autoincrement().primaryKey(),
  uuid: varchar("uuid", { length: 36 }).notNull().unique(), // UUID for public URL exposure
  userId: int("userId").notNull().unique(), // References users.id - UNIQUE constraint to ensure one active profile per user
  school: varchar("school", { length: 255 }).notNull(), // High school name
  grade: mysqlEnum("grade", ["1", "2", "3"]).notNull(), // High school grade (1-3)
  region: mysqlEnum("region", ["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]),
  bio: text("bio"), // Student bio/introduction
  // Profile image URL
  profileImageUrl: varchar("profileImageUrl", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type StudentProfile = typeof studentProfiles.$inferSelect;
export type InsertStudentProfile = typeof studentProfiles.$inferInsert;

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
  // Consultation type: resume_consulting, career_counseling, academic_management, university_tour
  consultationType: mysqlEnum("consultationType", ["resume_consulting", "career_counseling", "academic_management", "university_tour"]).default("career_counseling").notNull(),
  // Booking status: pending, confirmed, in_progress, completed, cancelled, reschedule_requested
  status: mysqlEnum("status", ["pending", "confirmed", "in_progress", "completed", "cancelled", "reschedule_requested"]).default("pending").notNull(),
  // Stripe Payment Intent ID
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }),
  // Student's message or questions
  studentMessage: text("studentMessage"),
  // Actual consultation started time
  consultationStartedAt: timestamp("consultationStartedAt"),
  // Actual consultation completed time
  consultationCompletedAt: timestamp("consultationCompletedAt"),
  // Reschedule request time
  rescheduleRequestedAt: timestamp("rescheduleRequestedAt"),
  // User ID who requested reschedule
  rescheduleRequestedBy: int("rescheduleRequestedBy"),
  // Reschedule reason/notice
  rescheduleNotice: text("rescheduleNotice"),
  // Student clicked start button
  studentStartedAt: timestamp("studentStartedAt"),
  // Mentor clicked start button
  mentorStartedAt: timestamp("mentorStartedAt"),
  // Student clicked end button
  studentEndedAt: timestamp("studentEndedAt"),
  // Mentor clicked end button
  mentorEndedAt: timestamp("mentorEndedAt"),
  // End reason (early_end, additional_time, etc.)
  endReason: varchar("endReason", { length: 255 }),
  // End reason details
  endReasonDetails: text("endReasonDetails"),
  // Notification sent flags
  notified30MinBefore: boolean("notified30MinBefore").default(false),
  notified10MinBefore: boolean("notified10MinBefore").default(false),
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
  type: mysqlEnum("type", ["booking_request", "booking_confirmed", "booking_cancelled", "schedule_changed", "review_received", "message", "consultation_reminder", "consultation_urgent_reminder", "qna_answer"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  // Related entity ID (booking ID, review ID, etc.)
  relatedId: int("relatedId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

/**
 * Messages between students and mentors
 */
export const messages = mysqlTable("messages", {
  id: int("id").autoincrement().primaryKey(),
  senderId: int("senderId").notNull(),
  recipientId: int("recipientId").notNull(),
  content: text("content").notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  bookingId: int("bookingId"),
  // Message type: text = 일반 메시지, proposal = 상담 일정 제안 카드
  messageType: mysqlEnum("messageType", ["text", "proposal"]).default("text").notNull(),
  // Proposal ID if this message is a proposal card
  proposalId: int("proposalId"),
  // 메시지 수정 여부
  isEdited: boolean("isEdited").default(false).notNull(),
  // 원본 메시지 내용 (수정된 경우)
  originalContent: text("originalContent"),
  // 메시지 삭제 여부 (소프트 삭제)
  isDeleted: boolean("isDeleted").default(false).notNull(),
  // 삭제된 시간
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Message = typeof messages.$inferSelect;
export type InsertMessage = typeof messages.$inferInsert;

/**
 * Message reactions - 메시지에 대한 이모지 반응
 */
export const messageReactions = mysqlTable("message_reactions", {
  id: int("id").autoincrement().primaryKey(),
  messageId: int("messageId").notNull(),
  userId: int("userId").notNull(),
  // 이모지 (👍, ❤️, 😂, 😮, 😢, 🔥 등)
  emoji: varchar("emoji", { length: 10 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageReaction = typeof messageReactions.$inferSelect;
export type InsertMessageReaction = typeof messageReactions.$inferInsert;

/**
 * User typing status - 사용자 타이핑 상태 (실시간)
 */
export const userTypingStatus = mysqlTable("user_typing_status", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  conversationPartnerId: int("conversationPartnerId").notNull(),
  isTyping: boolean("isTyping").default(false).notNull(),
  lastUpdatedAt: timestamp("lastUpdatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserTypingStatus = typeof userTypingStatus.$inferSelect;
export type InsertUserTypingStatus = typeof userTypingStatus.$inferInsert;

/**
 * Consultation proposals - 채팅 내 상담 일정 제안 카드
 * 멘토 또는 멘티가 채팅에서 상담 일정을 제안하고 상대방이 수락/거절/수정 제안할 수 있음
 */
export const consultationProposals = mysqlTable("consultation_proposals", {
  id: int("id").autoincrement().primaryKey(),
  // 제안한 사람
  proposerId: int("proposerId").notNull(),
  // 제안 받은 사람
  receiverId: int("receiverId").notNull(),
  // 연결된 booking ID (있는 경우)
  bookingId: int("bookingId"),
  // 제안 상태: pending(대기), accepted(수락), rejected(거절), counter_proposed(수정 제안), cancelled(취소), completed(완료)
  status: mysqlEnum("status", ["pending", "accepted", "rejected", "counter_proposed", "cancelled", "completed"]).default("pending").notNull(),
  // 상담 예정 날짜/시간
  scheduledAt: timestamp("scheduledAt").notNull(),
  // 상담 방식: online(온라인), offline(오프라인)
  consultationMode: mysqlEnum("consultationMode", ["online", "offline"]).notNull(),
  // 상담 장소 (오프라인인 경우)
  location: varchar("location", { length: 500 }),
  // 상담 시간 (시간 단위)
  duration: decimal("duration", { precision: 3, scale: 1 }).notNull(),
  // 상담 유형
  consultationType: mysqlEnum("consultationType", ["resume_consulting", "career_counseling", "academic_management", "university_tour"]).default("career_counseling").notNull(),
  // 제안 메모
  note: text("note"),
  // 수락된 시각
  acceptedAt: timestamp("acceptedAt"),
  // 완료된 시각
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ConsultationProposal = typeof consultationProposals.$inferSelect;
export type InsertConsultationProposal = typeof consultationProposals.$inferInsert;

/**
 * Mentor verification requests with student ID image
 */
export const mentorVerifications = mysqlTable("mentor_verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  // Student ID image URL (stored in S3)
  studentIdImageUrl: varchar("studentIdImageUrl", { length: 500 }).notNull(),
  // Verification status: pending, approved, rejected
  status: mysqlEnum("status", ["pending", "approved", "rejected"]).default("pending").notNull(),
  // Admin notes for rejection
  adminNotes: text("adminNotes"),
  // Verified at timestamp
  verifiedAt: timestamp("verifiedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorVerification = typeof mentorVerifications.$inferSelect;
export type InsertMentorVerification = typeof mentorVerifications.$inferInsert;

/**
 * Mentor gallery images
 */
export const mentorGallery = mysqlTable("mentor_gallery", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull(), // References mentor_profiles.id
  // Image URL stored in S3
  imageUrl: varchar("imageUrl", { length: 2000 }).notNull(),
  // Image caption or description
  caption: text("caption"),
  // Display order
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorGallery = typeof mentorGallery.$inferSelect;
export type InsertMentorGallery = typeof mentorGallery.$inferInsert;


/**
 * Bug reports from users
 */
export const bugReports = mysqlTable("bug_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  // User-provided device label (optional)
  device: varchar("device", { length: 255 }),
  // User agent for browser/device info
  userAgent: text("userAgent"),
  // Status: new, acknowledged, in_progress, resolved, wont_fix
  status: mysqlEnum("status", ["new", "acknowledged", "in_progress", "resolved", "wont_fix"]).default("new").notNull(),
  // Admin notes
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type BugReport = typeof bugReports.$inferSelect;
export type InsertBugReport = typeof bugReports.$inferInsert;

/**
 * Mentor consultation types - tracks which consultation types each mentor offers
 */
export const mentorConsultationTypes = mysqlTable("mentor_consultation_types", {
  id: int("id").autoincrement().primaryKey(),
  mentorId: int("mentorId").notNull(), // References users.id (mentor)
  // Consultation type: career_counseling, university_tour, resume_consulting, academic_management
  consultationType: mysqlEnum("consultationType", ["career_counseling", "university_tour", "resume_consulting", "academic_management"]).notNull(),
  // Price in KRW per hour
  pricePerHour: decimal("pricePerHour", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MentorConsultationType = typeof mentorConsultationTypes.$inferSelect;
export type InsertMentorConsultationType = typeof mentorConsultationTypes.$inferInsert;

/**
 * Email verification tokens for simple email verification flow
 */
export const emailVerificationTokens = mysqlTable("email_verification_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // References users.id
  token: varchar("token", { length: 255 }).notNull().unique(), // Unique verification token
  expiresAt: timestamp("expiresAt").notNull(), // Token expiration time (24 hours)
  isUsed: boolean("isUsed").default(false).notNull(), // Whether token has been used
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailVerificationToken = typeof emailVerificationTokens.$inferSelect;
export type InsertEmailVerificationToken = typeof emailVerificationTokens.$inferInsert;

/**
 * QnA Questions - 멘티가 올리는 질문
 */
export const questions = mysqlTable("questions", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(), // References users.id (멘티)
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  // Category (optional)
  category: varchar("category", { length: 100 }),
  // Whether the question is anonymous
  isAnonymous: boolean("isAnonymous").default(false).notNull(),
  // Question status: awaiting_answer, answered, solved
  status: mysqlEnum("status", ["awaiting_answer", "answered", "solved"]).default("awaiting_answer").notNull(),
  // Answer count (denormalized for performance)
  answerCount: int("answerCount").default(0).notNull(),
  // Last answered timestamp
  lastAnsweredAt: timestamp("lastAnsweredAt"),
  // Context fields for better answers
  interestUniversity: varchar("interestUniversity", { length: 255 }),
  interestMajor: varchar("interestMajor", { length: 255 }),
  gradeLevel: varchar("gradeLevel", { length: 50 }),
  contextInfo: text("contextInfo"),
  // Soft delete
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = typeof questions.$inferInsert;

/**
 * QnA Answers - 멘토가 질문에 다는 답변
 */
export const answers = mysqlTable("answers", {
  id: int("id").autoincrement().primaryKey(),
  questionId: int("questionId").notNull(), // References questions.id
  authorId: int("authorId").notNull(), // References users.id (멘토)
  content: text("content").notNull(),
  // Acceptance status (질문 작성자가 채택)
  isAccepted: boolean("isAccepted").default(false).notNull(),
  // Like count
  likeCount: int("likeCount").default(0).notNull(),
  // Report status
  isReported: boolean("isReported").default(false).notNull(),
  reportReason: varchar("reportReason", { length: 255 }),
  reportCount: int("reportCount").default(0).notNull(),
  // Soft delete
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = typeof answers.$inferInsert;

/**
 * Answer Likes - 답변 좋아요 (계정당 1회, 토글 가능)
 */
export const answerLikes = mysqlTable("answer_likes", {
  id: int("id").autoincrement().primaryKey(),
  answerId: int("answerId").notNull(), // References answers.id
  userId: int("userId").notNull(), // References users.id
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnswerLike = typeof answerLikes.$inferSelect;
export type InsertAnswerLike = typeof answerLikes.$inferInsert;

/**
 * QnA Answer Replies - 답변에 다는 댓글 (멘토/멘티 모두 가능)
 */
export const answerReplies = mysqlTable("answer_replies", {
  id: int("id").autoincrement().primaryKey(),
  answerId: int("answerId").notNull(), // References answers.id
  authorId: int("authorId").notNull(), // References users.id
  content: text("content").notNull(),
  // Report status
  isReported: boolean("isReported").default(false).notNull(),
  reportReason: varchar("reportReason", { length: 255 }),
  reportCount: int("reportCount").default(0).notNull(),
  // Soft delete
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AnswerReply = typeof answerReplies.$inferSelect;
export type InsertAnswerReply = typeof answerReplies.$inferInsert;

/**
 * QnA Reports - 질문/답변/댓글 신고
 */
export const qnaReports = mysqlTable("qna_reports", {
  id: int("id").autoincrement().primaryKey(),
  reporterId: int("reporterId").notNull(), // References users.id
  // Type: question, answer, reply
  reportType: mysqlEnum("reportType", ["question", "answer", "reply"]).notNull(),
  // ID of reported content
  contentId: int("contentId").notNull(),
  // Reason for report
  reason: varchar("reason", { length: 255 }).notNull(),
  // Report description
  description: text("description"),
  // Status: pending, reviewed, resolved, dismissed
  status: mysqlEnum("status", ["pending", "reviewed", "resolved", "dismissed"]).default("pending").notNull(),
  // Admin notes
  adminNotes: text("adminNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type QnaReport = typeof qnaReports.$inferSelect;
export type InsertQnaReport = typeof qnaReports.$inferInsert;


/**
 * Mentor Columns - 멘토 칼럼 게시판
 */
export const mentorColumns = mysqlTable("mentor_columns", {
  id: int("id").autoincrement().primaryKey(),
  authorId: int("authorId").notNull(), // References users.id (must be verified mentor)
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 100 }).notNull(), // e.g., "전공 선택", "대학 생활", etc.
  excerpt: text("excerpt"), // Optional preview text, can be auto-generated from content
  coverImageUrl: varchar("coverImageUrl", { length: 500 }), // Optional cover image
  likesCount: int("likesCount").default(0).notNull(),
  commentsCount: int("commentsCount").default(0).notNull(),
  viewCount: int("viewCount").default(0).notNull(), // 칼럼 조회수
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  // Soft delete
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MentorColumn = typeof mentorColumns.$inferSelect;
export type InsertMentorColumn = typeof mentorColumns.$inferInsert;

/**
 * Mentor Column Likes - 칼럼 좋아요 (1인 1회)
 */
export const mentorColumnLikes = mysqlTable(
  "mentor_column_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    columnId: int("columnId").notNull(), // References mentor_columns.id
    userId: int("userId").notNull(), // References users.id
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => ({
    unique: uniqueIndex("unique_column_like").on(table.columnId, table.userId),
  })
);
export type MentorColumnLike = typeof mentorColumnLikes.$inferSelect;
export type InsertMentorColumnLike = typeof mentorColumnLikes.$inferInsert;

/**
 * Mentor Column Comments - 칼럼 댓글 (1단계 대댓글까지만)
 */
export const mentorColumnComments = mysqlTable("mentor_column_comments", {
  id: int("id").autoincrement().primaryKey(),
  columnId: int("columnId").notNull(), // References mentor_columns.id
  authorId: int("authorId").notNull(), // References users.id
  parentCommentId: int("parentCommentId"), // References mentor_column_comments.id for replies (null = top-level comment)
  content: text("content").notNull(),
  // Soft delete
  deletedAt: timestamp("deletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type MentorColumnComment = typeof mentorColumnComments.$inferSelect;
export type InsertMentorColumnComment = typeof mentorColumnComments.$inferInsert;


/**
 * Email Verification Codes - 이메일 인증 코드
 * 회원가입 전 이메일 인증을 위한 임시 코드 저장
 */
export const emailVerificationCodes = mysqlTable("email_verification_codes", {
  id: int("id").autoincrement().primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  code: varchar("code", { length: 10 }).notNull(), // 6자리 인증 코드
  isVerified: boolean("isVerified").default(false).notNull(), // 인증 완료 여부
  attemptCount: int("attemptCount").default(0).notNull(), // 인증 시도 횟수
  lastSentAt: timestamp("lastSentAt").defaultNow().notNull(), // 마지막 발송 시간
  expiresAt: timestamp("expiresAt").notNull(), // 코드 만료 시간 (10분)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EmailVerificationCode = typeof emailVerificationCodes.$inferSelect;
export type InsertEmailVerificationCode = typeof emailVerificationCodes.$inferInsert;
