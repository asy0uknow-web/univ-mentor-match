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
import { eq, or } from "drizzle-orm";
import { mentorGallery, messages, notifications, bookings, reviews, mentorProfiles, mentorVerifications, users, bugReports } from "../drizzle/schema";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) return null;
      
      const db = await getDb();
      if (!db) return opts.ctx.user;
      
      // 데이터베이스에서 최신 사용자 정보 조회
      const result = await db.select().from(users).where(eq(users.id, opts.ctx.user.id)).limit(1);
      if (result.length === 0) return opts.ctx.user;
      
      const user = result[0];
      return {
        id: user.id,
        openId: user.openId,
        name: user.name,
        email: user.email,
        loginMethod: user.loginMethod,
        role: user.role,
        userType: user.userType,
        realName: user.realName,
        phoneNumber: user.phoneNumber,
      };
    }) as any,
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    deleteAccount: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // 사용자 삭제
      await db.delete(users).where(eq(users.id, ctx.user!.id));

      // 로그아웃
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });

      return { success: true };
    }),
  }),

  mentor: router({
    listAll: publicProcedure.query(async () => {
      return await getAllActiveMentors();
    }),

    getById: publicProcedure
      .input(z.number())
      .query(async (opts) => {
        return await getMentorById(opts.input);
      }),

    createProfile: protectedProcedure
      .input(
        z.object({
          university: z.string(),
          major: z.string(),
          field: z.string(),
          region: z.string(),
          grade: z.string(),
          bio: z.string(),
          hourlyRate: z.number().positive(),
          availableSlots: z.number().nonnegative(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const mentorProfile = await createMentorProfile({
          userId: ctx.user!.id,
          ...input,
        });
        return mentorProfile;
      }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          university: z.string().optional(),
          major: z.string().optional(),
          field: z.string().optional(),
          region: z.string().optional(),
          grade: z.string().optional(),
          bio: z.string().optional(),
          hourlyRate: z.number().positive().optional(),
          availableSlots: z.number().nonnegative().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const mentorProfile = await updateMentorProfile(ctx.user!.id, input);
        return mentorProfile;
      }),

    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return await getMentorProfileByUserId(ctx.user!.id);
    }),

    search: publicProcedure
      .input(
        z.object({
          fields: z.array(z.string()).optional(),
          region: z.string().optional(),
        })
      )
      .query(async ({ input }) => {
        if (input.fields && input.fields.length > 0 && input.region) {
          return await getMentorsByFieldAndRegion(input.fields, input.region);
        } else if (input.fields && input.fields.length > 0) {
          return await getMentorsByField(input.fields);
        } else if (input.region) {
          return await getMentorsByRegion(input.region);
        }
        return [];
      }),
  }),

  booking: router({
    create: protectedProcedure
      .input(
        z.object({
          mentorId: z.number(),
          startTime: z.date(),
          endTime: z.date(),
          topic: z.string(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const booking = await createBooking({
          studentId: ctx.user!.id,
          mentorId: input.mentorId,
          startTime: input.startTime,
          endTime: input.endTime,
          topic: input.topic,
          notes: input.notes,
        });
        return booking;
      }),

    getById: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getBookingById(input);
      }),

    updateStatus: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          status: z.enum(["pending", "confirmed", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ input }) => {
        return await updateBookingStatus(input.bookingId, input.status);
      }),

    getByStudent: protectedProcedure.query(async ({ ctx }) => {
      return await getBookingsByStudent(ctx.user!.id);
    }),

    getByMentor: protectedProcedure.query(async ({ ctx }) => {
      return await getBookingsByMentor(ctx.user!.id);
    }),
  }),

  review: router({
    create: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          mentorId: z.number(),
          rating: z.number().min(1).max(5),
          comment: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const review = await createReview({
          studentId: ctx.user!.id,
          bookingId: input.bookingId,
          mentorId: input.mentorId,
          rating: input.rating,
          comment: input.comment,
        });
        return review;
      }),

    getByMentor: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getReviewsByMentor(input);
      }),

    getByBooking: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        return await getReviewByBooking(input);
      }),
  }),

  notification: router({
    create: protectedProcedure
      .input(
        z.object({
          userId: z.number(),
          title: z.string(),
          message: z.string(),
          type: z.enum(["booking", "review", "message", "system"]),
        })
      )
      .mutation(async ({ input }) => {
        return await createNotification(input);
      }),

    getByUser: protectedProcedure.query(async ({ ctx }) => {
      return await getNotificationsByUser(ctx.user!.id);
    }),

    markAsRead: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return await markNotificationAsRead(input);
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadNotificationCount(ctx.user!.id);
    }),
  }),

  message: router({
    send: protectedProcedure
      .input(
        z.object({
          recipientId: z.number(),
          content: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createMessage({
          senderId: ctx.user!.id,
          recipientId: input.recipientId,
          content: input.content,
        });
      }),

    getConversation: protectedProcedure
      .input(z.number())
      .query(async ({ ctx, input }) => {
        return await getMessagesBetweenUsers(ctx.user!.id, input);
      }),

    getAll: protectedProcedure.query(async ({ ctx }) => {
      return await getMessagesForUser(ctx.user!.id);
    }),

    markAsRead: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        return await markMessageAsRead(input);
      }),

    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return await getUnreadMessagesCount(ctx.user!.id);
    }),
  }),

  verification: router({
    completeProfile: publicProcedure
      .input(z.object({
        realName: z.string().min(1),
        phoneNumber: z.string().regex(/^01[0-9]-?\d{3,4}-?\d{4}$/),
        email: z.string().email(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const userResult = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
        if (userResult.length === 0) throw new Error("User not found");
        const user = userResult[0];

        await db
          .update(users)
          .set({
            realName: input.realName,
            phoneNumber: input.phoneNumber,
            updatedAt: new Date(),
          })
          .where(eq(users.id, user.id));

        return {
          success: true,
          message: "Profile information saved successfully.",
        };
      }),

    getProfileVerificationStatus: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const user = await db
          .select({
            id: users.id,
            realName: users.realName,
            phoneNumber: users.phoneNumber,
            verificationStatus: users.verificationStatus,
            verificationMethod: users.verificationMethod,
            verifiedAt: users.verifiedAt,
          })
          .from(users)
          .where(eq(users.id, ctx.user!.id))
          .limit(1);

        if (!user.length) throw new Error("User not found");

        return user[0];
      }),

    createMentorVerification: protectedProcedure
      .input(
        z.object({
          universityEmail: z.string().email(),
          documents: z.array(z.string()),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await createMentorVerification({
          userId: ctx.user!.id,
          universityEmail: input.universityEmail,
          documents: input.documents,
        });
      }),

    getMentorVerification: protectedProcedure.query(async ({ ctx }) => {
      return await getMentorVerificationByUserId(ctx.user!.id);
    }),

    getPendingVerifications: adminProcedure.query(async () => {
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

  payment: router({
    createCheckoutSession: protectedProcedure
      .input(
        z.object({
          bookingId: z.number(),
          amount: z.number().positive(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const user = await db.select().from(users).where(eq(users.id, ctx.user!.id)).limit(1);
        if (!user.length) throw new Error("User not found");

        let stripeCustomerId = user[0].stripeCustomerId;

        if (!stripeCustomerId) {
          const customer = await stripe.customers.create({
            email: user[0].email,
            name: user[0].name,
            metadata: {
              userId: ctx.user!.id.toString(),
            },
          });
          stripeCustomerId = customer.id;

          await updateStripeCustomerId(ctx.user!.id, stripeCustomerId);
        }

        const session = await stripe.checkout.sessions.create({
          customer: stripeCustomerId,
          payment_method_types: ["card"],
          line_items: [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: CONSULTATION_PRODUCT.name,
                  description: CONSULTATION_PRODUCT.description,
                },
                unit_amount: Math.round(input.amount * 100),
              },
              quantity: 1,
            },
          ],
          mode: "payment",
          success_url: `${ctx.req.headers.origin}/bookings?status=success`,
          cancel_url: `${ctx.req.headers.origin}/bookings?status=cancelled`,
          client_reference_id: ctx.user!.id.toString(),
          metadata: {
            bookingId: input.bookingId.toString(),
            userId: ctx.user!.id.toString(),
          },
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      }),
  }),

  bugReport: router({
    create: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          description: z.string(),
          page: z.string(),
          screenshot: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(bugReports).values({
          userId: ctx.user!.id,
          title: input.title,
          description: input.description,
          page: input.page,
          screenshot: input.screenshot,
          status: "open",
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        return { success: true, id: result.insertId };
      }),
  }),
});

export type AppRouter = typeof appRouter;
