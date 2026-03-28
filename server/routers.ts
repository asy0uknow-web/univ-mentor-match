import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import Stripe from "stripe";
import {
  updateUserType,
  createMentorProfile,
  getMentorProfileByUserId,
  updateMentorProfile,
  getAllActiveMentors,
  getMentorById,
  createBooking,
  getBookingById,
  updateBookingStatus,
  getBookingsByStudent,
  getBookingsByMentor,
  createReview,
  getReviewsByMentor,
  getReviewByBooking,
  createNotification,
  getNotificationsByUser,
  markNotificationAsRead,
  getUnreadNotificationCount,
  updateStripeCustomerId,
  createMessage,
  getMessagesBetweenUsers,
  getMessagesForUser,
  markMessageAsRead,
  getUnreadMessagesCount,
  createMentorVerification,
  getMentorVerificationByUserId,
  getPendingMentorVerifications,
  approveMentorVerification,
  rejectMentorVerification,
  updateMentorVerification,

  getMentorsByRegion,
  getMentorsByFieldAndRegion,
  addGalleryImage,
  getGalleryByMentorId,
  deleteGalleryImage,
  updateGalleryImageOrder,
  getDb,
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
} from "./db";
import { CONSULTATION_PRODUCT, MIN_BOOKING_DURATION, MAX_BOOKING_DURATION } from "./products";
import { storagePut } from "./storage";
import { hashPassword, verifyPassword, validateEmail, validatePasswordStrength } from "./auth-utils";
import { signupProcedure, loginProcedure } from "./auth-procedures";
import { createVerificationToken, verifyEmailToken, getPendingVerificationToken } from "./email-verification";
import { emailVerificationTokens } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { mentorGallery, messages, notifications, bookings, reviews, mentorProfiles, mentorVerifications, users, bugReports, mentorConsultationTypes, consultationProposals } from "../drizzle/schema";
import { and, eq as drizzleEq, or as drizzleOr, desc as drizzleDesc } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});



function adminProcedure(ctx: any) {
  if (ctx.user?.role !== "admin") {
    throw new Error("Only admins can access this");
  }
  return true;
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    deleteAccount: protectedProcedure
      .mutation(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const userId = ctx.user.id;

        // 사용자의 모든 데이터 삭제
        await db.delete(messages).where(eq(messages.senderId, userId));
        await db.delete(messages).where(eq(messages.recipientId, userId));
        await db.delete(notifications).where(eq(notifications.userId, userId));
        await db.delete(bookings).where(eq(bookings.studentId, userId));
        await db.delete(bookings).where(eq(bookings.mentorId, userId));
        await db.delete(reviews).where(eq(reviews.studentId, userId));
        await db.delete(reviews).where(eq(reviews.mentorId, userId));
        await db.delete(mentorGallery).where(eq(mentorGallery.mentorId, userId));
        await db.delete(mentorProfiles).where(eq(mentorProfiles.userId, userId));
        await db.delete(mentorVerifications).where(eq(mentorVerifications.userId, userId));
        await db.delete(users).where(eq(users.id, userId));

        // 쿠키 삭제
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

        return { success: true };
      }),
    setUserType: protectedProcedure
      .input(z.object({
        userType: z.enum(["high_school_student", "university_student"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserType(ctx.user.id, input.userType);
        return { success: true };
      }),
    signup: signupProcedure,
    login: loginProcedure,
    requestEmailVerification: protectedProcedure
      .mutation(async ({ ctx }) => {
        // 이미 검증된 이메일이면 에러
        if (ctx.user.emailVerified) {
          throw new Error("Email already verified");
        }

        // 기존 토큰이 있는지 확인
        const existingToken = await getPendingVerificationToken(ctx.user.id);
        if (existingToken) {
          return { token: existingToken }; // 기존 토큰 반환
        }

        // 새 토큰 생성
        const token = await createVerificationToken(ctx.user.id);
        return { token };
      }),
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const result = await verifyEmailToken(input.token);
        if (!result) {
          throw new Error("Invalid or expired token");
        }
        return { success: true, userId: result.userId };
      }),
  }),

  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const result = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
      if (result.length === 0) throw new Error("User not found");
      
      const user = result[0];
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        openId: user.openId,
        loginMethod: user.loginMethod,
        userType: user.userType,
        phoneNumber: user.phoneNumber,
      };
    }),
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(255).optional(),
        phoneNumber: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const updateData: Record<string, any> = {
          updatedAt: new Date(),
        };
        
        if (input.name !== undefined) updateData.name = input.name;
        if (input.phoneNumber !== undefined) updateData.phoneNumber = input.phoneNumber;
        
        await db.update(users).set(updateData).where(eq(users.id, ctx.user.id));
        
        return { success: true, message: "Profile updated successfully" };
      }),
    changeNickname: protectedProcedure
      .input(z.object({
        nickname: z.string().min(1).max(50),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.update(users).set({ name: input.nickname }).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
    changePassword: protectedProcedure
      .input(z.object({
        currentPassword: z.string().min(1),
        newPassword: z.string().min(8),
        confirmPassword: z.string().min(8),
      }))
      .mutation(async ({ ctx, input }) => {
        if (input.newPassword !== input.confirmPassword) {
          throw new Error("새 비밀번호가 일치하지 않습니다");
        }
        
        return { success: true, message: "비밀번호 변경 기능은 OAuth 제공자를 통해 관리됩니다" };
      }),
    getById: publicProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db.select().from(users).where(eq(users.id, input.userId)).limit(1);
        if (result.length === 0) throw new Error("User not found");
        
        const user = result[0];
        return {
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            phoneNumber: user.phoneNumber,
          },
        };
      }),
  }),

  mentor: router({
    createProfile: protectedProcedure
      .input(z.object({
        university: z.string().min(1),
        major: z.string().min(1),
        grade: z.enum(["1", "2", "3", "4", "graduate"]),
        bio: z.string().optional(),
        hourlyRate: z.string().min(1),
        field: z.enum(["engineering", "natural_science", "business", "humanities", "education", "liberal_arts", "medicine"]).optional(),
        region: z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]).optional(),
        availableSlots: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserType(ctx.user.id, "university_student");
        await createMentorProfile({
          userId: ctx.user.id,
          ...input,
        });
        // Always create a new verification request for (re-)registration
        await createMentorVerification({
          userId: ctx.user.id,
          studentIdImageUrl: "",
          status: "pending",
        });
        return { success: true };
      }),

    getMyProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getMentorProfileByUserId(ctx.user.id);
    }),

    updateProfile: protectedProcedure
      .input(z.object({
        university: z.string().min(1).optional(),
        major: z.string().min(1).optional(),
        grade: z.enum(["1", "2", "3", "4", "graduate"]).optional(),
        bio: z.string().optional(),
        hourlyRate: z.string().optional(),
        field: z.enum(["engineering", "natural_science", "business", "humanities", "education", "liberal_arts", "medicine"]).optional(),
        region: z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]).optional(),
        availableSlots: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateMentorProfile(ctx.user.id, input);
        return { success: true };
      }),

    listAll: publicProcedure.query(async () => {
      return await getAllActiveMentors();
    }),

    getById: publicProcedure
      .input(z.object({
        mentorId: z.string().or(z.number()),
      }))
      .query(async ({ input }) => {
        // getMentorById 함수가 UUID와 숫자 ID 모두 지원
        return await getMentorById(input.mentorId);
      }),

    getTopMentors: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(20).default(6),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const topMentors = await db
          .select({
            id: mentorProfiles.id,
            uuid: mentorProfiles.uuid,
            userId: mentorProfiles.userId,
            name: users.name,
            university: mentorProfiles.university,
            major: mentorProfiles.major,
            bio: mentorProfiles.bio,
            field: mentorProfiles.field,
            averageRating: mentorProfiles.averageRating,
            reviewCount: mentorProfiles.reviewCount,
          })
          .from(mentorProfiles)
          .innerJoin(users, drizzleEq(mentorProfiles.userId, users.id))
          .where(
            and(
              drizzleEq(mentorProfiles.verificationStatus, "approved"),
              drizzleEq(mentorProfiles.isDeleted, false)
            )
          )
          .orderBy(drizzleDesc(mentorProfiles.averageRating))
          .limit(input.limit);

        return topMentors;
      }),

    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      return await getBookingsByMentor(ctx.user.id);
    }),



    getMyConsultationTypes: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      
      const types = await db.select().from(mentorConsultationTypes).where(eq(mentorConsultationTypes.mentorId, ctx.user.id));
      return types;
    }),

    updateConsultationTypes: protectedProcedure
      .input(z.object({
        consultationTypes: z.array(z.enum(["career_counseling", "university_tour", "resume_consulting", "academic_management"])),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getMentorProfileByUserId(ctx.user.id);
        if (!profile) {
          throw new Error("등록된 멘토 프로필이 없습니다");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // 기존 상담 유형 삭제
        await db.delete(mentorConsultationTypes).where(eq(mentorConsultationTypes.mentorId, ctx.user.id));

        // 새로운 상담 유형 추가
        const consultationPrices: Record<string, number> = {
          "career_counseling": 40000,
          "university_tour": 50000,
          "resume_consulting": 50000,
          "academic_management": 40000,
        };

        for (const type of input.consultationTypes) {
          await db.insert(mentorConsultationTypes).values({
            mentorId: ctx.user.id,
            consultationType: type,
            pricePerHour: consultationPrices[type].toString(),
          });
        }

        return { success: true };
      }),
  }),

  booking: router({
    create: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
        scheduledAt: z.string(),
        duration: z.string(),
        consultationType: z.enum(["resume_consulting", "career_counseling", "academic_management", "university_tour"]).default("career_counseling"),
        studentMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const mentor = await getMentorById(input.mentorId);
        if (!mentor) throw new Error("Mentor not found");

        const duration = parseFloat(input.duration);
        if (duration < MIN_BOOKING_DURATION || duration > MAX_BOOKING_DURATION) {
          throw new Error(`Duration must be between ${MIN_BOOKING_DURATION} and ${MAX_BOOKING_DURATION} hours`);
        }

        // 상담 종류별 기본 1시간 비용 및 추가 시간 비용
        const consultationPrices: Record<string, { base: number; additional: number }> = {
          "resume_consulting": { base: 50000, additional: 30000 },
          "career_counseling": { base: 30000, additional: 20000 },
          "academic_management": { base: 40000, additional: 25000 },
          "university_tour": { base: 50000, additional: 30000 },
        };

        const pricing = consultationPrices[input.consultationType] || { base: 30000, additional: 20000 };
        // 총 금액 = 기본 1시간 비용 + (입력된 시간 - 1) * 추가 시간 비용
        const totalAmount = (pricing.base + (duration - 1) * pricing.additional).toFixed(2);

        const result = await createBooking({
          studentId: ctx.user.id,
          mentorId: input.mentorId,
          scheduledAt: new Date(input.scheduledAt),
          duration: input.duration,
          totalAmount,
          consultationType: input.consultationType,
          studentMessage: input.studentMessage,
        });

        const bookingId = Number((result as any).insertId);

        // 학생 실명 조회
        const db = await getDb();
        let studentName = "학생";
        if (db) {
          const studentUser = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
          if (studentUser.length > 0 && studentUser[0].name) {
            studentName = studentUser[0].name;
          }
        }
        // 멘토에게 알림 생성
        const consultationTypeLabels: Record<string, string> = {
          "resume_consulting": "생기부 컨설팅",
          "career_counseling": "진로상담",
          "academic_management": "학업관리",
          "university_tour": "대학탐방",
        };
        const consultationLabel = consultationTypeLabels[input.consultationType] || "상담";
        const scheduledDate = new Date(input.scheduledAt);
        const formattedDate = scheduledDate.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' });
        const formattedTime = scheduledDate.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });

        // 알림 메시지에 학생 실명 포함
        const studentNameForNotif = studentName || "학생";
        await createNotification({
          userId: input.mentorId,
          type: "booking_request",
          title: "새로운 상담 예약 신청",
          message: `${studentNameForNotif} 학생이 ${consultationLabel} 예약을 신청했습니다. (${formattedDate} ${formattedTime}, ${duration}시간)`,
          relatedId: bookingId,
          isRead: false,
        });

        // 멘토에게 메시지 생성 (상담 신청 정보 포함)
        const messageContent = `${studentNameForNotif} 학생이 ${consultationLabel} 상담을 신청했습니다.\n\n📅 예정 날짜: ${formattedDate} ${formattedTime}\n⏱️ 상담 시간: ${duration}시간\n💰 상담료: ${totalAmount}원\n\n메시지를 통해 상담을 수락하거나 거절할 수 있습니다.`;
        await createMessage({
          senderId: ctx.user.id,
          recipientId: input.mentorId,
          content: messageContent,
          bookingId: bookingId,
        });

        return { 
          success: true,
          bookingId,
          totalAmount,
          pricing: {
            base: pricing.base,
            additional: pricing.additional,
            duration: duration,
          },
        };
      }),

    getById: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .query(async ({ input }) => {
        return await getBookingById(input.bookingId);
      }),

    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      return await getBookingsByStudent(ctx.user.id);
    }),

    updateStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        await updateBookingStatus(input.bookingId, input.status);
        return { success: true };
      }),

    confirm: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 멘토만 예약 확정 가능
        const mentorProfile = await getMentorProfileByUserId(ctx.user.id);
        if (!mentorProfile || mentorProfile.id !== booking.mentorId) {
          throw new Error("Unauthorized: Only the mentor can confirm this booking");
        }

        // 예약 상태를 confirmed로 변경
        await updateBookingStatus(input.bookingId, "confirmed");

        // 학생에게 알림 생성
        const db = await getDb();
        if (db) {
          const student = await db.select().from(users).where(eq(users.id, booking.studentId)).limit(1);
          const mentor = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
          
          if (student.length > 0 && mentor.length > 0) {
            const studentName = student[0].name || "학생";
            const mentorName = mentor[0].name || "멘토";
            
            await createNotification({
              userId: booking.studentId,
              type: "booking_confirmed",
              title: "상담 예약이 확정되었습니다",
              message: `${mentorName} 멘토가 상담 예약을 확정했습니다. 상담 당일 현장 결제 부탁드립니다.`,
              relatedId: input.bookingId,
              isRead: false,
            });
          }
        }

        return { success: true };
      }),

    acceptBooking: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        const mentor = await getMentorById(booking.mentorId);
        if (!mentor || mentor.profile.userId !== ctx.user.id) {
          throw new Error("Unauthorized: Only the mentor can accept this booking");
        }

        await updateBookingStatus(input.bookingId, "confirmed");
        return { success: true };
      }),

    rejectBooking: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        const mentor = await getMentorById(booking.mentorId);
        if (!mentor || mentor.profile.userId !== ctx.user.id) {
          throw new Error("Unauthorized: Only the mentor can reject this booking");
        }

        await updateBookingStatus(input.bookingId, "cancelled");
        return { success: true };
      }),

    createCheckoutSession: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        if (booking.studentId !== ctx.user.id) throw new Error("Unauthorized");

        const mentor = await getMentorById(booking.mentorId);
        if (!mentor) throw new Error("Mentor not found");

        let customerId = ctx.user.stripeCustomerId;
        if (!customerId) {
          const customer = await stripe.customers.create({
            email: ctx.user.email || undefined,
            name: ctx.user.name || undefined,
            metadata: { userId: ctx.user.id.toString() },
          });
          customerId = customer.id;
          await updateStripeCustomerId(ctx.user.id, customerId);
        }

        const origin = ctx.req.headers.origin || "http://localhost:3000";
        const session = await stripe.checkout.sessions.create({
          customer: customerId,
          line_items: [{
            price_data: {
              currency: "krw",
              product_data: {
                name: CONSULTATION_PRODUCT.name,
                description: `${mentor.user.name} 멘토와의 상담 (${booking.duration}시간)`,
              },
              unit_amount: Math.round(parseFloat(booking.totalAmount) * 100),
            },
            quantity: 1,
          }],
          mode: "payment",
          success_url: `${origin}/bookings?success=true&booking_id=${input.bookingId}`,
          cancel_url: `${origin}/bookings?cancelled=true`,
          metadata: {
            bookingId: input.bookingId.toString(),
            studentId: ctx.user.id.toString(),
            mentorId: booking.mentorId.toString(),
          },
          allow_promotion_codes: true,
        });

        return { checkoutUrl: session.url };
      }),
  }),

  review: router({
    create: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        rating: z.number().min(1).max(5),
        comment: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        if (booking.studentId !== ctx.user.id) throw new Error("Unauthorized");
        if (booking.status !== "completed") throw new Error("Can only review completed bookings");

        const existingReview = await getReviewByBooking(input.bookingId);
        if (existingReview) throw new Error("Review already exists for this booking");

        await createReview({
          bookingId: input.bookingId,
          studentId: ctx.user.id,
          mentorId: booking.mentorId,
          rating: input.rating,
          comment: input.comment,
        });

        return { success: true };
      }),

    getByMentor: publicProcedure
      .input(z.object({ mentorId: z.number() }))
      .query(async ({ input }) => {
        return await getReviewsByMentor(input.mentorId);
      }),
  }),

  notification: router({
    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await getNotificationsByUser(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ input }) => {
        await markNotificationAsRead(input.notificationId);
        return { success: true };
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationCount(ctx.user.id);
    }),
  }),

  message: router({
    send: protectedProcedure
      .input(z.object({
        recipientId: z.number(),
        content: z.string().min(1),
        bookingId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const message = await createMessage({
          senderId: ctx.user.id,
          recipientId: input.recipientId,
          content: input.content,
          bookingId: input.bookingId,
          isRead: false,
        });
        
        // Create notification for recipient
        const db = await getDb();
        if (db) {
          try {
            const senderResult = await db.select({ name: users.name }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
            const senderName = senderResult[0]?.name || `User ${ctx.user.id}`;
            
            await createNotification({
              userId: input.recipientId,
              type: "message",
              title: `${senderName}님으로부터 새 메시지`,
              message: input.content.substring(0, 100),
              relatedId: ctx.user.id,
              isRead: false,
            });
          } catch (error) {
            console.error("[Notification] Failed to create message notification:", error);
          }
        }
        
        return { success: true, messageId: (message as any).insertId };
      }),

    getConversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getMessagesBetweenUsers(ctx.user.id, input.otherUserId);
      }),

    getInbox: protectedProcedure.query(async ({ ctx }) => {
      return await getMessagesForUser(ctx.user.id);
    }),

    markAsRead: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ input }) => {
        await markMessageAsRead(input.messageId);
        return { success: true };
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadMessagesCount(ctx.user.id);
    }),

    // 메시지 수정
    editMessage: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        content: z.string().min(1).max(2000),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateMessage(input.messageId, ctx.user.id, input.content);
      }),

    // 메시지 삭제 (소프트 삭제)
    deleteMessage: protectedProcedure
      .input(z.object({ messageId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteMessage(input.messageId, ctx.user.id);
      }),

    // 메시지 반응 토글
    toggleReaction: protectedProcedure
      .input(z.object({
        messageId: z.number(),
        emoji: z.string().min(1).max(10),
      }))
      .mutation(async ({ ctx, input }) => {
        return await addMessageReaction(input.messageId, ctx.user.id, input.emoji);
      }),

    // 메시지 반응 조회
    getReactions: protectedProcedure
      .input(z.object({ messageIds: z.array(z.number()) }))
      .query(async ({ input }) => {
        return await getMessageReactions(input.messageIds);
      }),

    // 타이핑 상태 업데이트
    setTyping: protectedProcedure
      .input(z.object({
        partnerId: z.number(),
        isTyping: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateTypingStatus(ctx.user.id, input.partnerId, input.isTyping);
      }),

    // 타이핑 상태 조회
    getTyping: protectedProcedure
      .input(z.object({ partnerId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getTypingStatus(ctx.user.id, input.partnerId);
      }),

    // 대화 전체 읽음 처리
    markConversationAsRead: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await markAllMessagesAsRead(ctx.user.id, input.otherUserId);
      }),

    // 프로필 이미지 업데이트
    updateProfileImage: protectedProcedure
      .input(z.object({
        fileData: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedMimeTypes.includes(input.mimeType)) {
          throw new Error("Unsupported file format");
        }
        const buffer = Buffer.from(input.fileData, "base64");
        const maxSize = 5 * 1024 * 1024;
        if (buffer.length > maxSize) throw new Error("File size must be less than 5MB");
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileExtension = input.fileName.split(".").pop() || "jpg";
        const secureFileName = `profile/${ctx.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;
        const { url } = await storagePut(secureFileName, buffer, input.mimeType);
        await upsertUserProfile(ctx.user.id, { profileImageUrl: url });
        return { success: true, imageUrl: url };
      }),

    // 프로필 정보 조회
    getProfile: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ input }) => {
        return await getUserProfile(input.userId);
      }),
  }),

  verification: router({
    uploadStudentId: protectedProcedure
      .input(z.object({
        fileData: z.string(),
        fileName: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        if (!allowedMimeTypes.includes(input.mimeType)) {
          throw new Error("Unsupported file format");
        }

        const buffer = Buffer.from(input.fileData, "base64");
        const maxSize = 5 * 1024 * 1024;
        if (buffer.length > maxSize) {
          throw new Error("File size must be less than 5MB");
        }

        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 15);
        const fileExtension = input.fileName.split(".").pop() || "jpg";
        const secureFileName = `student-id/${ctx.user.id}/${timestamp}-${randomSuffix}.${fileExtension}`;

        const { url } = await storagePut(secureFileName, buffer, input.mimeType);

        return { success: true, imageUrl: url };
      }),

    submitVerification: protectedProcedure
      .input(z.object({
        studentIdImageUrl: z.string().url(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existingVerification = await getMentorVerificationByUserId(ctx.user.id);
        
        if (existingVerification && existingVerification.status === "pending") {
          throw new Error("이미 인증 요청이 진행 중입니다.");
        }
        
        // 거부된 상태인 경우 기존 인증 요청 업데이트
        if (existingVerification && existingVerification.status === "rejected") {
          return await updateMentorVerification(existingVerification.id, {
            studentIdImageUrl: input.studentIdImageUrl,
            status: "pending",
            adminNotes: null,
          });
        }
        
        const result = await createMentorVerification({
          userId: ctx.user.id,
          studentIdImageUrl: input.studentIdImageUrl,
          status: "pending",
        });
        
        return { success: true, verificationId: (result as any).insertId };
      }),

    getMyVerification: protectedProcedure.query(async ({ ctx }) => {
      return await getMentorVerificationByUserId(ctx.user.id);
    }),

    completeProfile: publicProcedure
      .input(z.object({
        name: z.string().min(1),
        phoneNumber: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/),
        email: z.string().email(),
        userRole: z.enum(["mentor", "mentee"]),
        university: z.string().optional(),
        major: z.string().optional(),
        grade: z.enum(["1", "2", "3", "4", "graduate"]).optional(),
        consultationTypes: z.array(z.enum(["career_counseling", "university_tour", "resume_consulting", "academic_management"])).optional(),
        mentorRegion: z.string().optional(),
        school: z.string().optional(),
        careerGoal: z.string().optional(),
        menteeRegion: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // email 기반으로 사용자 조회
        const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (userResult.length === 0) throw new Error("User not found");
        
        const user = userResult[0];

        const updateData: Record<string, any> = {
          name: input.name,
          phoneNumber: input.phoneNumber,
          userType: input.userRole === "mentor" ? "university_student" : "high_school_student",
          verificationStatus: "pending",
          updatedAt: new Date(),
        };

        await db
          .update(users)
          .set(updateData)
          .where(eq(users.id, user.id));

        // 멘토인 경우 멘토프로필도 자동으로 생성
        if (input.userRole === "mentor" && input.university && input.major && input.mentorRegion) {
          // mentorRegion은 쉼표로 구분된 문자열이므로 첫 번째 지역만 추출
          const regions = input.mentorRegion.split(",").map(r => r.trim()).filter(r => r);
          const firstRegion = regions[0] || "seoul";
          const regionValue = firstRegion as "seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju";
          const gradeValue = (input.grade || "1") as "1" | "2" | "3" | "4" | "graduate";
          const existingProfile = await db
            .select()
            .from(mentorProfiles)
            .where(eq(mentorProfiles.userId, user.id))
            .limit(1);
          
          if (existingProfile.length === 0) {
            // 멘토프로필 생성
            await db.insert(mentorProfiles).values({
              userId: user.id,
              university: input.university,
              major: input.major,
              grade: gradeValue,
              region: regionValue,
              isDeleted: false,
              verificationStatus: "pending",
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            // 기존 프로필 업데이트
            await db
              .update(mentorProfiles)
              .set({
                university: input.university,
                major: input.major,
                grade: gradeValue,
                region: regionValue,
                isDeleted: false,
                updatedAt: new Date(),
              })
              .where(eq(mentorProfiles.userId, user.id));
          }
          
          // 상담 유형 저장
          if (input.consultationTypes && input.consultationTypes.length > 0) {
            // 기존 상담 유형 삭제
            await db.delete(mentorConsultationTypes).where(eq(mentorConsultationTypes.mentorId, user.id));
            
            // 새 상담 유형 추가
            for (const type of input.consultationTypes) {
              await db.insert(mentorConsultationTypes).values({
                mentorId: user.id,
                consultationType: type as "career_counseling" | "university_tour" | "resume_consulting" | "academic_management",
                pricePerHour: "40000.00",
              });
            }
          }
        }

        return {
          success: true,
          message: "Profile information saved. Please proceed with real name verification.",
        };
      }),

    getProfileVerificationStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const userResult = await db
          .select({
            id: users.id,
            name: users.name,
            phoneNumber: users.phoneNumber,
            verificationStatus: users.verificationStatus,
            verificationMethod: users.verificationMethod,
            verifiedAt: users.verifiedAt,
          })
          .from(users)
          .where(eq(users.id, ctx.user.id))
          .limit(1);

        if (userResult.length === 0) throw new Error("User not found");

        return userResult[0];
      }),
  }),

  admin: router({
    getAllMentors: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can access this");
      }
      return await getAllActiveMentors();
    }),

    getMentorDetails: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can access this");
        }
        return await getMentorById(input.mentorId);
      }),

    updateMentorProfile: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
        university: z.string().optional(),
        major: z.string().optional(),
        grade: z.enum(["1", "2", "3", "4", "graduate"]).optional(),
        bio: z.string().optional(),
        hourlyRate: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can update mentor profiles");
        }
        const { mentorId, ...updateData } = input;
        await updateMentorProfile(mentorId, updateData);
        return { success: true };
      }),

    deleteMentorProfile: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete mentor profiles");
        }
        // Mark profile as deleted instead of deactivating
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        await db.update(mentorProfiles).set({
          isDeleted: true,
          updatedAt: new Date(),
        }).where(eq(mentorProfiles.userId, input.mentorId));
        return { success: true };
      }),

    getPendingVerifications: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can access this");
      }
      return await getPendingMentorVerifications();
    }),

    approveVerification: protectedProcedure
      .input(z.object({
        verificationId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can approve verifications");
        }
        await approveMentorVerification(input.verificationId);
        return { success: true };
      }),

    rejectVerification: protectedProcedure
      .input(z.object({
        verificationId: z.number(),
        adminNotes: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can reject verifications");
        }
        await rejectMentorVerification(input.verificationId, input.adminNotes);
        return { success: true };
      }),
  }),
  mentorSearch: router({
    getByRegion: publicProcedure
      .input(z.object({
        region: z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]),
      }))
      .query(async ({ input }) => {
        return await getMentorsByRegion(input.region);
      }),

    getByFieldAndRegion: publicProcedure
      .input(z.object({
        fields: z.array(z.string()).optional(),
        regions: z.array(z.string()).optional(),
      }))
      .query(async ({ input }) => {
        return await getMentorsByFieldAndRegion(input.fields, input.regions);
      }),
  }),

  gallery: router({
    uploadImage: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
        imageData: z.string(),
        caption: z.string().optional(),
        displayOrder: z.number().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        // 멘토 ID가 0 이하인 경우 처리
        if (input.mentorId <= 0) {
          throw new Error("Unauthorized: 먼저 멘토 프로필을 등록해주세요.");
        }
        
        const mentor = await getMentorById(input.mentorId);
        if (!mentor) {
          throw new Error("Unauthorized: 멘토 프로필을 찾을 수 없습니다.");
        }
        
        if (mentor.profile.userId !== ctx.user?.id) {
          throw new Error("Unauthorized: 자신의 갤러리에만 업로드할 수 있습니다.");
        }
        
        const base64Data = input.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        const fileName = `mentor-gallery/${input.mentorId}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { url } = await storagePut(fileName, buffer, 'image/jpeg');
        
        return await addGalleryImage({
          mentorId: input.mentorId,
          imageUrl: url,
          caption: input.caption,
          displayOrder: input.displayOrder,
        });
      }),

    getByMentorId: publicProcedure
      .input(z.object({
        mentorId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getGalleryByMentorId(input.mentorId);
      }),

    deleteImage: protectedProcedure
      .input(z.object({
        imageId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const gallery = await database.select().from(mentorGallery).where(eq(mentorGallery.id, input.imageId)).limit(1);
        if (gallery.length === 0) throw new Error("Image not found");
        
        const mentor = await getMentorById(gallery[0].mentorId);
        if (!mentor || mentor.profile.userId !== ctx.user?.id) {
          throw new Error("Unauthorized");
        }
        
        await deleteGalleryImage(input.imageId);
        return { success: true };
      }),

    updateOrder: protectedProcedure
      .input(z.object({
        imageId: z.number(),
        displayOrder: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        const gallery = await database.select().from(mentorGallery).where(eq(mentorGallery.id, input.imageId)).limit(1);
        if (gallery.length === 0) throw new Error("Image not found");
        
        const mentor = await getMentorById(gallery[0].mentorId);
        if (!mentor || mentor.profile.userId !== ctx.user?.id) {
          throw new Error("Unauthorized");
        }
        
        await updateGalleryImageOrder(input.imageId, input.displayOrder);
        return { success: true };
      }),
   }),
  bugReport: router({
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "제목을 입력해주세요"),
        description: z.string().min(10, "설명은 최소 10자 이상이어야 합니다"),
        device: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const userAgent = ctx.req?.headers["user-agent"] || "";
        
        const result = await database.insert(bugReports).values({
          userId: ctx.user!.id,
          title: input.title,
          description: input.description,
          device: input.device ?? null,
          userAgent,
          status: "new",
        });

        return { success: true, id: result[0] };
      }),
    getAll: publicProcedure
      .input(z.object({
        status: z.enum(["new", "acknowledged", "in_progress", "resolved", "wont_fix"]).optional(),
      }).optional())
      .query(async () => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const reports = await database.select().from(bugReports).orderBy(bugReports.createdAt);
        return reports;
      }),
    updateStatus: protectedProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["new", "acknowledged", "in_progress", "resolved", "wont_fix"]),
        adminNotes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const database = await getDb();
        if (!database) throw new Error("Database not available");
        
        const user = await database.select().from(users).where(eq(users.id, ctx.user!.id)).limit(1);
        if (!user || user[0]?.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }
        
        await database.update(bugReports)
          .set({
            status: input.status,
            adminNotes: input.adminNotes,
            updatedAt: new Date(),
          })
          .where(eq(bugReports.id, input.id));

        return { success: true };
      }),
  }),

  // ===== 상담 제안 (Consultation Proposals) =====
  proposal: router({
    // 상담 일정 제안 생성
    create: protectedProcedure
      .input(z.object({
        receiverId: z.number(),
        scheduledAt: z.string(),
        consultationMode: z.enum(["online", "offline"]),
        location: z.string().optional(),
        duration: z.number().min(0.5).max(4),
        consultationType: z.enum(["resume_consulting", "career_counseling", "academic_management", "university_tour"]),
        note: z.string().optional(),
        bookingId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        // 제안 생성
        const result = await db.insert(consultationProposals).values({
          proposerId: userId,
          receiverId: input.receiverId,
          bookingId: input.bookingId ?? null,
          status: "pending",
          scheduledAt: new Date(input.scheduledAt),
          consultationMode: input.consultationMode,
          location: input.location ?? null,
          duration: String(input.duration),
          consultationType: input.consultationType,
          note: input.note ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const insertId = (result as any).insertId ?? (result as any)[0]?.insertId;
        const proposalId = Number(insertId);

        // 제안 카드 메시지 생성
        const proposerUser = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
        const proposerName = proposerUser[0]?.name ?? "상담자";
        const modeText = input.consultationMode === "online" ? "온라인" : "오프라인";
        const dateText = new Date(input.scheduledAt).toLocaleString("ko-KR", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" });
        const content = JSON.stringify({
          type: "proposal",
          proposalId,
          receiverId: input.receiverId,
          scheduledAt: input.scheduledAt,
          consultationMode: input.consultationMode,
          location: input.location,
          duration: input.duration,
          consultationType: input.consultationType,
          note: input.note,
          proposerName,
          status: "pending",
        });

        const msgResult = await db.insert(messages).values({
          senderId: userId,
          recipientId: input.receiverId,
          content,
          messageType: "proposal",
          proposalId,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // 알림 생성
        await db.insert(notifications).values({
          userId: input.receiverId,
          type: "booking_request",
          title: "상담 일정 제안이 도착했어요",
          message: `${proposerName}님이 ${dateText} ${modeText} 상담을 제안했어요.`,
          isRead: false,
          relatedId: proposalId,
          createdAt: new Date(),
        });

        return { success: true, proposalId };
      }),

    // 제안 수락
    accept: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const proposal = await db.select().from(consultationProposals).where(eq(consultationProposals.id, input.proposalId)).limit(1);
        if (!proposal[0]) throw new Error("제안을 찾을 수 없습니다");
        if (proposal[0].receiverId !== userId) throw new Error("수락 권한이 없습니다");
        if (proposal[0].status !== "pending" && proposal[0].status !== "counter_proposed") throw new Error("수락할 수 없는 상태입니다");

        await db.update(consultationProposals).set({
          status: "accepted",
          acceptedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(consultationProposals.id, input.proposalId));

        // booking 생성
        // proposerId와 receiverId 중 누가 학생이고 누가 멘토인지 확인
        const proposerUser = await db.select({ userType: users.userType }).from(users).where(eq(users.id, proposal[0].proposerId)).limit(1);
        
        let studentId: number;
        let mentorId: number;
        
        if (proposerUser[0]?.userType === "university_student") {
          // 멘토가 제안자인 경우
          mentorId = proposal[0].proposerId;
          studentId = proposal[0].receiverId;
        } else {
          // 학생이 제안자인 경우
          studentId = proposal[0].proposerId;
          mentorId = proposal[0].receiverId;
        }
        
        const pricePerHour = 40000; // 기본 상담료
        const duration = typeof proposal[0].duration === 'string' ? parseFloat(proposal[0].duration) : proposal[0].duration;
        const totalAmount = pricePerHour * duration;
        
        console.log('[Accept] Creating booking with:', {
          studentId,
          mentorId,
          duration,
          totalAmount,
        });
        
        try {
          await db.insert(bookings).values({
            studentId,
            mentorId,
            scheduledAt: proposal[0].scheduledAt,
            duration: duration.toString() as any,
            totalAmount: totalAmount.toString() as any,
            consultationType: proposal[0].consultationType as any,
            status: "confirmed",
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          console.log('[Accept] Booking created successfully');
        } catch (bookingError) {
          console.error('[Accept] Booking creation error:', bookingError);
          throw bookingError;
        }

        // 제안자에게 알림
        const receiverUser = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
        const receiverName = receiverUser[0]?.name ?? "상대방";
        await db.insert(notifications).values({
          userId: proposal[0].proposerId,
          type: "booking_confirmed",
          title: "상담 일정이 확정되었어요!",
          message: `${receiverName}님이 상담 일정을 수락했어요. 상담이 확정되었습니다.`,
          isRead: false,
          relatedId: input.proposalId,
          createdAt: new Date(),
        });

        // 확정 메시지 생성
        const content = JSON.stringify({
          type: "proposal_status",
          proposalId: input.proposalId,
          status: "accepted",
          message: "상담이 확정되었어요 🎉",
        });
        await db.insert(messages).values({
          senderId: userId,
          recipientId: proposal[0].proposerId,
          content,
          messageType: "proposal",
          proposalId: input.proposalId,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true };
      }),

    // 제안 거절
    reject: protectedProcedure
      .input(z.object({ proposalId: z.number(), reason: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const proposal = await db.select().from(consultationProposals).where(eq(consultationProposals.id, input.proposalId)).limit(1);
        if (!proposal[0]) throw new Error("제안을 찾을 수 없습니다");
        if (proposal[0].receiverId !== userId) throw new Error("거절 권한이 없습니다");
        if (proposal[0].status !== "pending" && proposal[0].status !== "counter_proposed") throw new Error("거절할 수 없는 상태입니다");

        await db.update(consultationProposals).set({
          status: "rejected",
          updatedAt: new Date(),
        }).where(eq(consultationProposals.id, input.proposalId));

        // 제안자에게 알림
        const receiverUser = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
        const receiverName = receiverUser[0]?.name ?? "상대방";
        await db.insert(notifications).values({
          userId: proposal[0].proposerId,
          type: "booking_cancelled",
          title: "상담 일정 제안이 거절되었어요",
          message: `${receiverName}님이 상담 일정 제안을 거절했어요.`,
          isRead: false,
          relatedId: input.proposalId,
          createdAt: new Date(),
        });

        // 거절 메시지 생성
        const content = JSON.stringify({
          type: "proposal_status",
          proposalId: input.proposalId,
          status: "rejected",
          message: input.reason ? `일정 제안이 거절되었어요. (${input.reason})` : "일정 제안이 거절되었어요.",
        });
        await db.insert(messages).values({
          senderId: userId,
          recipientId: proposal[0].proposerId,
          content,
          messageType: "proposal",
          proposalId: input.proposalId,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true };
      }),

    // 수정 제안 (카운터 제안)
    counterPropose: protectedProcedure
      .input(z.object({
        proposalId: z.number(),
        scheduledAt: z.string(),
        consultationMode: z.enum(["online", "offline"]),
        location: z.string().optional(),
        duration: z.number().min(0.5).max(4),
        consultationType: z.enum(["resume_consulting", "career_counseling", "academic_management", "university_tour"]),
        note: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const original = await db.select().from(consultationProposals).where(eq(consultationProposals.id, input.proposalId)).limit(1);
        if (!original[0]) throw new Error("제안을 찾을 수 없습니다");
        if (original[0].receiverId !== userId) throw new Error("수정 제안 권한이 없습니다");

        // 기존 제안 상태 변경
        await db.update(consultationProposals).set({
          status: "counter_proposed",
          updatedAt: new Date(),
        }).where(eq(consultationProposals.id, input.proposalId));

        // 새 제안 생성 (역할 바꿔서)
        const newResult = await db.insert(consultationProposals).values({
          proposerId: userId,
          receiverId: original[0].proposerId,
          bookingId: original[0].bookingId,
          status: "pending",
          scheduledAt: new Date(input.scheduledAt),
          consultationMode: input.consultationMode,
          location: input.location ?? null,
          duration: String(input.duration),
          consultationType: input.consultationType,
          note: input.note ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const newInsertId = (newResult as any).insertId ?? (newResult as any)[0]?.insertId;
        const newProposalId = Number(newInsertId);

        // 수정 제안 메시지 생성
        const proposerUser = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
        const proposerName = proposerUser[0]?.name ?? "상담자";
        const content = JSON.stringify({
          type: "proposal",
          proposalId: newProposalId,
          receiverId: original[0].proposerId,
          scheduledAt: input.scheduledAt,
          consultationMode: input.consultationMode,
          location: input.location,
          duration: input.duration,
          consultationType: input.consultationType,
          note: input.note,
          proposerName,
          status: "pending",
          isCounter: true,
        });
        await db.insert(messages).values({
          senderId: userId,
          recipientId: original[0].proposerId,
          content,
          messageType: "proposal",
          proposalId: newProposalId,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // 알림
        await db.insert(notifications).values({
          userId: original[0].proposerId,
          type: "schedule_changed",
          title: "상담 일정 수정 제안이 도착했어요",
          message: `${proposerName}님이 상담 일정 수정을 제안했어요.`,
          isRead: false,
          relatedId: newProposalId,
          createdAt: new Date(),
        });

        return { success: true, newProposalId };
      }),

    // 상담 완료 처리
    complete: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const proposal = await db.select().from(consultationProposals).where(eq(consultationProposals.id, input.proposalId)).limit(1);
        if (!proposal[0]) throw new Error("제안을 찾을 수 없습니다");
        if (proposal[0].proposerId !== userId && proposal[0].receiverId !== userId) throw new Error("권한이 없습니다");
        if (proposal[0].status !== "accepted") throw new Error("확정된 상담만 완료 처리할 수 있습니다");

        await db.update(consultationProposals).set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(consultationProposals.id, input.proposalId));

        // 완료 메시지
        const content = JSON.stringify({
          type: "proposal_status",
          proposalId: input.proposalId,
          status: "completed",
          message: "상담이 완료되었어요! 후기를 남겨보세요 ⭐",
        });
        const otherUserId = proposal[0].proposerId === userId ? proposal[0].receiverId : proposal[0].proposerId;
        await db.insert(messages).values({
          senderId: userId,
          recipientId: otherUserId,
          content,
          messageType: "proposal",
          proposalId: input.proposalId,
          isRead: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // 양쪽 알림
        await db.insert(notifications).values({
          userId: otherUserId,
          type: "booking_confirmed",
          title: "상담이 완료되었어요!",
          message: "상담이 완료되었습니다. 후기를 남겨보세요.",
          isRead: false,
          relatedId: input.proposalId,
          createdAt: new Date(),
        });

        return { success: true };
      }),

    // 제안 취소
    cancel: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const proposal = await db.select().from(consultationProposals).where(eq(consultationProposals.id, input.proposalId)).limit(1);
        if (!proposal[0]) throw new Error("제안을 찾을 수 없습니다");
        if (proposal[0].proposerId !== userId) throw new Error("취소 권한이 없습니다");
        if (proposal[0].status !== "pending") throw new Error("대기 중인 제안만 취소할 수 있습니다");

        await db.update(consultationProposals).set({
          status: "cancelled",
          updatedAt: new Date(),
        }).where(eq(consultationProposals.id, input.proposalId));

        return { success: true };
      }),

    // 제안 상세 조회
    getById: protectedProcedure
      .input(z.object({ proposalId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const proposal = await db.select().from(consultationProposals).where(eq(consultationProposals.id, input.proposalId)).limit(1);
        if (!proposal[0]) throw new Error("제안을 찾을 수 없습니다");
        if (proposal[0].proposerId !== userId && proposal[0].receiverId !== userId) throw new Error("조회 권한이 없습니다");

        return proposal[0];
      }),

    // 나의 제안 목록 조회 (채팅방 내 활성 제안)
    getActiveForConversation: protectedProcedure
      .input(z.object({ otherUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const userId = ctx.user!.id;

        const proposals = await db.select().from(consultationProposals)
          .where(
            drizzleOr(
              drizzleEq(consultationProposals.proposerId, userId),
              drizzleEq(consultationProposals.receiverId, userId)
            )
          )
          .orderBy(drizzleDesc(consultationProposals.createdAt));

        // 해당 대화 상대와의 제안만 필터링
        return proposals.filter(p =>
          (p.proposerId === userId && p.receiverId === input.otherUserId) ||
          (p.receiverId === userId && p.proposerId === input.otherUserId)
        );
      }),
  }),
});
export type AppRouter = typeof appRouter;
