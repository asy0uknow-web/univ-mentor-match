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
  getMentorsByField,
  getMentorsByRegion,
  getMentorsByFieldAndRegion,
  addGalleryImage,
  getGalleryByMentorId,
  deleteGalleryImage,
  updateGalleryImageOrder,
  getDb,
} from "./db";
import { CONSULTATION_PRODUCT, MIN_BOOKING_DURATION, MAX_BOOKING_DURATION } from "./products";
import { storagePut } from "./storage";
import { eq } from "drizzle-orm";
import { mentorGallery } from "../drizzle/schema";

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
    setUserType: protectedProcedure
      .input(z.object({
        userType: z.enum(["high_school_student", "university_student"]),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserType(ctx.user.id, input.userType);
        return { success: true };
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
        try {
          await createMentorVerification({
            userId: ctx.user.id,
            studentIdImageUrl: "",
            status: "pending",
          });
        } catch (error) {
          console.warn("Verification record already exists", ctx.user.id);
        }
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
        isActive: z.boolean().optional(),
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
        mentorId: z.number(),
      }))
      .query(async ({ input }) => {
        return await getMentorById(input.mentorId);
      }),

    getMyBookings: protectedProcedure.query(async ({ ctx }) => {
      return await getBookingsByMentor(ctx.user.id);
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

    getPendingVerifications: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new Error("Only admins can access this");
      }
      return await getPendingMentorVerifications();
    }),

    approveVerification: protectedProcedure
      .input(z.object({ verificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can approve verifications");
        }
        await approveMentorVerification(input.verificationId);
        return { success: true };
      }),

    rejectVerification: protectedProcedure
      .input(z.object({ verificationId: z.number(), adminNotes: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can reject verifications");
        }
        await rejectMentorVerification(input.verificationId, input.adminNotes);
        return { success: true };
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
        await updateMentorProfile(input.mentorId, { isActive: false });
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
    getByField: publicProcedure
      .input(z.object({
        field: z.enum(["engineering", "natural_science", "business", "humanities", "education", "liberal_arts", "medicine"]),
      }))
      .query(async ({ input }) => {
        return await getMentorsByField(input.field);
      }),

    getByRegion: publicProcedure
      .input(z.object({
        region: z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]),
      }))
      .query(async ({ input }) => {
        return await getMentorsByRegion(input.region);
      }),

    getByFieldAndRegion: publicProcedure
      .input(z.object({
        field: z.enum(["engineering", "natural_science", "business", "humanities", "education", "liberal_arts", "medicine"]).optional(),
        region: z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"]).optional(),
      }))
      .query(async ({ input }) => {
        return await getMentorsByFieldAndRegion(input.field, input.region);
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
});

export type AppRouter = typeof appRouter;
