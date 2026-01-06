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
} from "./db";
import { CONSULTATION_PRODUCT, MIN_BOOKING_DURATION, MAX_BOOKING_DURATION } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

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
        availableSlots: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserType(ctx.user.id, "university_student");
        await createMentorProfile({
          userId: ctx.user.id,
          ...input,
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
        studentMessage: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const mentor = await getMentorById(input.mentorId);
        if (!mentor) throw new Error("Mentor not found");

        const duration = parseFloat(input.duration);
        if (duration < MIN_BOOKING_DURATION || duration > MAX_BOOKING_DURATION) {
          throw new Error(`Duration must be between ${MIN_BOOKING_DURATION} and ${MAX_BOOKING_DURATION} hours`);
        }

        const hourlyRate = parseFloat(mentor.profile.hourlyRate);
        const totalAmount = (hourlyRate * duration).toFixed(2);

        const result = await createBooking({
          studentId: ctx.user.id,
          mentorId: input.mentorId,
          scheduledAt: new Date(input.scheduledAt),
          duration: input.duration,
          totalAmount,
          studentMessage: input.studentMessage,
        });

        const bookingId = Number((result as any).insertId);
        return { 
          success: true,
          bookingId,
          totalAmount,
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
});

export type AppRouter = typeof appRouter;
