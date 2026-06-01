import { COOKIE_NAME } from "@shared/const";
import { randomUUID } from "crypto";
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
  getStudentById,
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
import { sendVerificationCode, verifyEmailCode, isEmailVerified, getResendWaitTime } from "./email-verification";
import { startConsultation, completeConsultation, requestReschedule, acceptReschedule, rejectReschedule, isWithinStartWindow, isWithinCompleteWindow, calculateConsultationDuration, recordUserStart, recordUserEnd } from "./booking-consultation";
import { sendConsultationReminders } from "./booking-notifications";
import { getMonthlyConsultationStats, getOverallConsultationStats, getLast12MonthsStats } from "./booking-statistics";
import { createQuestion, getQuestionById, getQuestions, updateQuestion, deleteQuestion, createAnswer, getAnswersByQuestionId, getAnswerById, updateAnswer, deleteAnswer, createAnswerReply, getRepliesByAnswerId, getReplyById, updateReply, deleteReply, getQuestionDetail, acceptAnswer, toggleAnswerLike, getUserAnswerLikes, notifyQuestionAuthorOnAnswer, getMyQuestions, getMyAnswers } from "./qna";
import { getColumnsList, getColumnById, createColumn, updateColumn, deleteColumn, toggleColumnLike, getColumnComments, createComment, updateComment, deleteComment, getMyColumns, incrementViewCount } from "./columns";
import { hybridSearch } from "./hybrid-search";
import { searchMentorsByEmbedding, upsertMentorEmbedding } from "./embedding-service";
import { mentorColumns, emailVerificationCodes, mentorGallery, messages, notifications, bookings, reviews, mentorProfiles, mentorVerifications, users, userProfiles, bugReports, mentorConsultationTypes, consultationProposals, studentProfiles, studentInterests, mentorRecommendations, mentorSearchCorpus } from "../drizzle/schema";

import { eq, and, desc, isNull, eq as drizzleEq, or as drizzleOr, desc as drizzleDesc, count } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

function adminProcedure(ctx: any) {
  if (ctx.user?.role !== "admin") {
    throw new Error("Only admins can access this");
  }
  return true;
}

// ── 검색 쿼리 유효성 검사: 욕설/무관한 입력을 Gemini로 판단 ──
async function validateSearchQuery(query: string): Promise<boolean> {
  try {
    const trimmed = query.trim();
    if (trimmed.length < 2) return false;

    const { GoogleGenAI } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: `당신은 대학 멘토 매칭 서비스의 검색 필터입니다.
사용자가 입력한 텍스트가 "대학 멘토를 찾기 위한 의미 있는 검색어"인지 판단하세요.

[통과 기준] 다음 중 하나라도 해당하면 YES:
- 대학교 이름, 학과, 전공 관련
- 진로, 취업, 입시, 학업 관련
- 자기소개서, 면접, 스펙 관련
- 상담, 멘토링, 조언 요청
- 특정 분야(공학, 의학, 경영 등) 관련

[차단 기준] 다음 중 하나라도 해당하면 NO:
- 욕설, 비속어, 혁오 표현 (예: 씨발, 개새끼, 존나 등)
- 음식, 날씨, 게임 등 멘토링과 전혀 무관한 내용
- 의미 없는 반복 문자 (ㄱㄱㄱ, ㅅㅅㅅ 등)
- 스팸성 문자열

입력: "${trimmed}"

YES 또는 NO 중 하나만 답하세요.`,
    });
    const answer = response.text?.trim().toUpperCase() ?? "NO";
    return answer.startsWith("YES");
  } catch {
    return true; // 판단 실패 시 통과 (검색 기능 보존 우선)
  }
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
    sendVerificationCode: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");
          
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, input.email))
            .limit(1);
          
          if (existingUser.length > 0) {
            throw new Error("Email already registered");
          }
          
          await sendVerificationCode(input.email);
          return { success: true, message: "Verification code sent" };
        } catch (error: any) {
          throw new Error(error.message || "Failed to send verification code");
        }
      }),
    verifyCode: publicProcedure
      .input(z.object({ email: z.string().email(), code: z.string().min(6).max(6) }))
      .mutation(async ({ input }) => {
        try {
          const isValid = await verifyEmailCode(input.email, input.code);
          if (!isValid) {
            throw new Error("Invalid verification code");
          }
          return { success: true, message: "Email verified successfully" };
        } catch (error: any) {
          throw new Error(error.message || "Failed to verify code");
        }
      }),
    getResendWaitTime: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .query(async ({ input }) => {
        const waitTime = await getResendWaitTime(input.email);
        return { waitTime }; // 초 단위
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
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // 새 비밀번호가 일치하는지 확인
        if (input.newPassword !== input.confirmPassword) {
          throw new Error("새 비밀번호가 일치하지 않습니다");
        }
        
        // 새 비밀번호 강도 검증
        const passwordValidation = validatePasswordStrength(input.newPassword);
        if (!passwordValidation.valid) {
          throw new Error(passwordValidation.errors.join(", "));
        }
        
        // 현재 사용자 정보 조회
        const user = await db.select().from(users).where(eq(users.id, ctx.user.id)).limit(1);
        if (user.length === 0) {
          throw new Error("사용자를 찾을 수 없습니다");
        }
        
        // 현재 비밀번호 검증
        if (!user[0].passwordHash) {
          throw new Error("비밀번호가 설정되지 않은 계정입니다");
        }
        const isCurrentPasswordValid = await verifyPassword(input.currentPassword, user[0].passwordHash);
        if (!isCurrentPasswordValid) {
          throw new Error("현재 비밀번호가 올바르지 않습니다");
        }
        
        // 새 비밀번호로 업데이트
        const newPasswordHash = await hashPassword(input.newPassword);
        await db.update(users).set({ passwordHash: newPasswordHash }).where(eq(users.id, ctx.user.id));
        
        return { success: true, message: "비밀번호가 성공적으로 변경되었습니다" };
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
        availableRegions: z.array(z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"])).optional(),
        availableSlots: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await updateUserType(ctx.user.id, "university_student");
        const profileData: any = {
          userId: ctx.user.id,
          ...input,
          uuid: require('crypto').randomUUID(),
        };
        if (input.availableRegions) {
          profileData.availableRegions = JSON.stringify(input.availableRegions);
        }
        await createMentorProfile(profileData);
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
        availableRegions: z.array(z.enum(["seoul", "gyeonggi", "incheon", "gangwon", "chungcheong", "jeolla", "gyeongsang", "jeju"])).optional(),
        availableSlots: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const updateData: any = { ...input };
        if (input.availableRegions) {
          updateData.availableRegions = JSON.stringify(input.availableRegions);
        }
        await updateMentorProfile(ctx.user.id, updateData);
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
        const mentor = await getMentorById(input.mentorId);
        
        // 대표 사진 추가
        if (mentor) {
          const db = await getDb();
          if (db) {
            const primaryImage = await db
              .select({ imageUrl: mentorGallery.imageUrl })
              .from(mentorGallery)
              .where(and(eq(mentorGallery.mentorId, mentor.profile.id), eq(mentorGallery.isPrimary, true)))
              .limit(1);
            
            (mentor.profile as any).profileImage = primaryImage.length > 0 ? primaryImage[0].imageUrl : null;
          }
        }
        
        return mentor;
      }),

getTopMentors: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(20).default(6),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // 평탄한 구조로 반환
        const mentorsWithTypes = await db
          .select({
            id: mentorProfiles.id,
            uuid: mentorProfiles.uuid,
            userId: mentorProfiles.userId,
            name: users.name,
            university: mentorProfiles.university,
            major: mentorProfiles.major,
            grade: mentorProfiles.grade,
            availableRegions: mentorProfiles.availableRegions,
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
            consultationType: mentorConsultationTypes.consultationType,
          })
          .from(mentorProfiles)
          .innerJoin(users, drizzleEq(mentorProfiles.userId, users.id))
          .leftJoin(
            mentorConsultationTypes,
            drizzleEq(users.id, mentorConsultationTypes.mentorId)
          )
          .where(
            and(
              drizzleEq(mentorProfiles.verificationStatus, "approved"),
              drizzleEq(mentorProfiles.isDeleted, false)
            )
          )
          .orderBy(drizzleDesc(mentorProfiles.averageRating))
          .limit(input.limit);

        // 결과를 멘토별로 그룹화
        const mentorMap = new Map<number, any>();
        
        for (const row of mentorsWithTypes) {
          const mentorId = row.userId;
          
          if (!mentorMap.has(mentorId)) {
            mentorMap.set(mentorId, {
              ...row,
              consultationTypes: [],
              profileId: row.id,
            });
          }
          
          if (row.consultationType) {
            const mentor = mentorMap.get(mentorId);
            if (!mentor.consultationTypes.includes(row.consultationType)) {
              mentor.consultationTypes.push(row.consultationType);
            }
          }
        }
        
        // 각 멘토의 대표 사진 추가
        const mentors = Array.from(mentorMap.values());
        for (const mentor of mentors) {
          // 대표 사진 조회
          const primaryImage = await db
            .select({ imageUrl: mentorGallery.imageUrl })
            .from(mentorGallery)
            .where(and(drizzleEq(mentorGallery.mentorId, mentor.profileId), drizzleEq(mentorGallery.isPrimary, true)))
            .limit(1);
          
          mentor.profileImage = primaryImage.length > 0 ? primaryImage[0].imageUrl : null;
        }
        
        return mentors;
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

  student: router({
    getById: publicProcedure
      .input(z.object({
        studentId: z.string().or(z.number()),
      }))
      .query(async ({ input }) => {
        // getStudentById 함수가 UUID와 숫자 ID 모두 지원
        return await getStudentById(input.studentId);
      }),

    // 본인 멘티 프로필 조회 (고등학교, 학년, 지역 등)
    getMyProfile: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const result = await db
          .select()
          .from(studentProfiles)
          .where(eq(studentProfiles.userId, ctx.user.id))
          .limit(1);
        return result[0] ?? null;
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

    startConsultation: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증 (학생 또는 멘토)
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // 시간 검증
        if (!isWithinStartWindow(booking.scheduledAt)) {
          throw new Error("Consultation can only be started 5 minutes before/after scheduled time");
        }

        try {
          await startConsultation(input.bookingId);
          
          // 상담 시작 알림은 메시지로 생성하지 않음
          // 프론트엔드에서 상담 상태 변경을 감지하여 메시지 창에만 표시

          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to start consultation");
        }
      }),

    completeConsultation: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        // 시간 검증
        const durationHours = parseFloat(booking.duration.toString());
        if (!isWithinCompleteWindow(booking.scheduledAt, durationHours)) {
          throw new Error("Consultation can only be completed 5 minutes before/after scheduled end time");
        }

        try {
          await completeConsultation(input.bookingId);
          
          // 상담 완료 알림은 메시지로 생성하지 않음
          // 프론트엔드에서 상담 상태 변경을 감지하여 메시지 창에만 표시

          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to complete consultation");
        }
      }),

    recordUserStart: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        try {
          await recordUserStart(input.bookingId, ctx.user.id);
          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to record user start");
        }
      }),

    recordUserEnd: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        endReason: z.string().optional(),
        endReasonDetails: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        try {
          await recordUserEnd(input.bookingId, ctx.user.id, input.endReason, input.endReasonDetails);
          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to record user end");
        }
      }),

    sendReminders: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can send reminders");
        }
        
        try {
          await sendConsultationReminders();
          return { success: true, message: "Reminders sent successfully" };
        } catch (error: any) {
          throw new Error(error.message || "Failed to send reminders");
        }
      }),

    forceUpdateStatus: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        newStatus: z.enum(["pending", "confirmed", "in_progress", "completed", "cancelled"]),
        reason: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can force update booking status");
        }

        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");

        const now = new Date();
        if (input.newStatus === "in_progress") {
          await db
            .update(bookings)
            .set({
              status: "in_progress",
              consultationStartedAt: now,
              studentStartedAt: now,
              mentorStartedAt: now,
            })
            .where(eq(bookings.id, input.bookingId));
        } else if (input.newStatus === "completed") {
          await db
            .update(bookings)
            .set({
              status: "completed",
              consultationCompletedAt: now,
              studentEndedAt: now,
              mentorEndedAt: now,
              endReason: "admin_forced",
              endReasonDetails: input.reason || "관리자가 강제 완료 처리",
            })
            .where(eq(bookings.id, input.bookingId));
        } else {
          await db
            .update(bookings)
            .set({ status: input.newStatus })
            .where(eq(bookings.id, input.bookingId));
        }

        const statusLabels: Record<string, string> = {
          pending: "대기중",
          confirmed: "확정",
          in_progress: "진행중",
          completed: "완료",
          cancelled: "취소됨",
        };

        await db.insert(notifications).values({
          userId: booking.studentId,
          type: "booking_confirmed",
          title: "상담 상태가 변경되었습니다",
          message: `관리자가 상담 상태를 ${statusLabels[input.newStatus]}로 변경했습니다.${input.reason ? ` (사유: ${input.reason})` : ""}`,
          relatedId: input.bookingId,
        });

        await db.insert(notifications).values({
          userId: booking.mentorId,
          type: "booking_confirmed",
          title: "상담 상태가 변경되었습니다",
          message: `관리자가 상담 상태를 ${statusLabels[input.newStatus]}로 변경했습니다.${input.reason ? ` (사유: ${input.reason})` : ""}`,
          relatedId: input.bookingId,
        });

        return { success: true, message: "Booking status updated successfully" };
      }),

    requestReschedule: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        newScheduledAt: z.string(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        try {
          await requestReschedule(
            input.bookingId,
            ctx.user.id,
            new Date(input.newScheduledAt),
            input.reason
          );
          
          // 상대방에게 메시지 생성
          const recipientId = booking.studentId === ctx.user.id ? booking.mentorId : booking.studentId;
          await createMessage({
            senderId: ctx.user.id,
            recipientId: recipientId,
            content: `[상담 일정 변경 요청]\n기존 예정 시간을 벗어나 상담 시작 요청이 들어왔습니다.\n새로운 일정 확인이 필요합니다.\n\n사유: ${input.reason}`,
            bookingId: input.bookingId,
            messageType: "text",
          });

          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to request reschedule");
        }
      }),

    acceptReschedule: protectedProcedure
      .input(z.object({
        bookingId: z.number(),
        newScheduledAt: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        try {
          await acceptReschedule(
            input.bookingId,
            ctx.user.id,
            new Date(input.newScheduledAt)
          );
          
          // 상대방에게 메시지 생성
          const recipientId = booking.studentId === ctx.user.id ? booking.mentorId : booking.studentId;
          await createMessage({
            senderId: ctx.user.id,
            recipientId: recipientId,
            content: "[일정 변경 확정]\n새로운 상담 일정이 확정되었습니다.",
            bookingId: input.bookingId,
            messageType: "text",
          });

          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to accept reschedule");
        }
      }),

    rejectReschedule: protectedProcedure
      .input(z.object({ bookingId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const booking = await getBookingById(input.bookingId);
        if (!booking) throw new Error("Booking not found");
        
        // 권한 검증
        if (booking.studentId !== ctx.user.id && booking.mentorId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }

        try {
          await rejectReschedule(input.bookingId, ctx.user.id);
          
          // 상대방에게 메시지 생성
          const recipientId = booking.studentId === ctx.user.id ? booking.mentorId : booking.studentId;
          await createMessage({
            senderId: ctx.user.id,
            recipientId: recipientId,
            content: "[일정 변경 거절]\n기존 일정이 유지됩니다.",
            bookingId: input.bookingId,
            messageType: "text",
          });

          return { success: true };
        } catch (error: any) {
          throw new Error(error.message || "Failed to reject reschedule");
        }
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

    // 추천 멘토 조회
    getRecommendedMentors: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // 평점 높은 멘토 추천 (간단한 버전)
        const recommendedMentors = await db
          .select()
          .from(mentorProfiles)
          .where(and(
            eq(mentorProfiles.verificationStatus, "approved"),
            eq(mentorProfiles.isDeleted, false)
          ))
          .orderBy(desc(mentorProfiles.averageRating))
          .limit(input.limit);
        
        return recommendedMentors;
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
        // 멘티(고등학생)는 멘토 인증 신청 불가
        if (ctx.user.userType === "high_school_student") {
          throw new Error("멘티 계정은 멘토 인증 신청을 할 수 없습니다.");
        }

        const existingVerification = await getMentorVerificationByUserId(ctx.user.id);
        
        if (existingVerification && existingVerification.status === "pending") {
          throw new Error("이미 인증 요청이 진행 중입니다.");
        }
        
        // 거부된 상태 또는 비활성화(approved) 상태인 경우 기존 인증 요청 업데이트
        if (existingVerification && (existingVerification.status === "rejected" || existingVerification.status === "approved")) {
          // 멘토 프로필 verificationStatus를 pending으로 되돌려 재심사 대기 상태로 설정
          const db = await getDb();
          if (db) {
            await db.update(mentorProfiles).set({
              verificationStatus: "pending",
              updatedAt: new Date(),
            }).where(eq(mentorProfiles.userId, ctx.user.id));
          }
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

    completeProfile: protectedProcedure
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
        menteeGrade: z.enum(["1", "2", "3"]).optional(),
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
          // mentorRegion은 쉬멀표로 구분된 문자열을 배열로 변환
          const regions = input.mentorRegion.split(",").map(r => r.trim()).filter(r => r);
          const availableRegionsValue = regions.length > 0 ? regions : ["seoul"];
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
              availableRegions: JSON.stringify(availableRegionsValue),
              uuid: randomUUID(),
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
                availableRegions: JSON.stringify(availableRegionsValue),
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

        // 멘티인 경우 학생프로필도 자동으로 생성
        if (input.userRole === "mentee" && input.school && input.menteeGrade && input.menteeRegion) {
          const gradeValue = input.menteeGrade as "1" | "2" | "3";
          const regionValue = input.menteeRegion as "seoul" | "gyeonggi" | "incheon" | "gangwon" | "chungcheong" | "jeolla" | "gyeongsang" | "jeju";
          const existingProfile = await db
            .select()
            .from(studentProfiles)
            .where(eq(studentProfiles.userId, user.id))
            .limit(1);
          
          if (existingProfile.length === 0) {
            await db.insert(studentProfiles).values({
              userId: user.id,
              school: input.school,
              grade: gradeValue,
              region: regionValue,
              uuid: randomUUID(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          } else {
            await db
              .update(studentProfiles)
              .set({
                school: input.school,
                grade: gradeValue,
                region: regionValue,
                updatedAt: new Date(),
              })
              .where(eq(studentProfiles.userId, user.id));
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

  aiMatching: router({
    performNaturalLanguageSearch: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const query = input.query.toLowerCase();
          const limit = Math.min(input.limit, 50);

          // 승인된 멘토만 조회
          const mentors = await db
            .select()
            .from(mentorProfiles)
            .where(
              and(
                eq(mentorProfiles.verificationStatus, "approved"),
                eq(mentorProfiles.isDeleted, false)
              )
            )
            .limit(limit * 2);

          // 검색어와 매칭되는 멘토 필터링
          const results = [];
          for (const mentor of mentors) {
            let matchScore = 0;
            const searchText = `${mentor.university || ''} ${mentor.major || ''} ${mentor.field || ''} ${mentor.bio || ''}`.toLowerCase();
            
            // 키워드 매칭
            const keywords = query.split(/\s+/).filter(k => k.length > 0);
            for (const keyword of keywords) {
              if (searchText.includes(keyword)) {
                matchScore += 20;
              }
            }

            if (matchScore > 0) {
              const user = await db
                .select()
                .from(users)
                .where(eq(users.id, mentor.userId))
                .limit(1);

              results.push({
                id: mentor.id,
                uuid: mentor.uuid,
                name: user.length > 0 ? user[0].name : "멘토",
                email: user.length > 0 ? user[0].email : "",
                university: mentor.university || "",
                major: mentor.major || "",
                field: mentor.field || "",
                bio: mentor.bio || "",
                averageRating: mentor.averageRating || 0,
                reviewCount: mentor.reviewCount || 0,
                verificationStatus: mentor.verificationStatus,
                matchScore: Math.min(matchScore, 100),
              });
            }
          }

          // 매칭 점수로 정렬
          results.sort((a, b) => b.matchScore - a.matchScore);
          return results.slice(0, limit);
        } catch (error) {
          console.error("[AI Search] Error:", error);
          return [];
        }
      }),

  }),

  aiSearch: router({
    search: publicProcedure
      .input(z.object({
        query: z.string(),
        limit: z.number().default(20),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          const query = input.query.toLowerCase();
          const limit = Math.min(input.limit, 50);

          // 승인된 멘토만 조회
          const mentors = await db
            .select()
            .from(mentorProfiles)
            .where(
              and(
                eq(mentorProfiles.verificationStatus, "approved"),
                eq(mentorProfiles.isDeleted, false)
              )
            )
            .limit(limit * 2);

          // 검색어와 매칭되는 멘토 필터링
          const results = [];
          for (const mentor of mentors) {
            let matchScore = 0;
            const searchText = `${mentor.university || ''} ${mentor.major || ''} ${mentor.field || ''} ${mentor.bio || ''}`.toLowerCase();
            
            // 키워드 매칭
            const keywords = query.split(/\s+/).filter(k => k.length > 0);
            for (const keyword of keywords) {
              if (searchText.includes(keyword)) {
                matchScore += 20;
              }
            }

            if (matchScore > 0) {
              const user = await db
                .select()
                .from(users)
                .where(eq(users.id, mentor.userId))
                .limit(1);

              results.push({
                id: mentor.id,
                uuid: mentor.uuid,
                name: user.length > 0 ? user[0].name : "멘토",
                email: user.length > 0 ? user[0].email : "",
                university: mentor.university || "",
                major: mentor.major || "",
                field: mentor.field || "",
                bio: mentor.bio || "",
                averageRating: mentor.averageRating || 0,
                reviewCount: mentor.reviewCount || 0,
                verificationStatus: mentor.verificationStatus,
                matchScore: Math.min(matchScore, 100),
              });
            }
          }

          // 매칭 점수로 정렬
          results.sort((a, b) => b.matchScore - a.matchScore);
          return results.slice(0, limit);
        } catch (error) {
          console.error("[AI Search] Error:", error);
          throw new Error("Failed to perform AI search");
        }
      }),

    // ─────────────────────────────────────────────────────────────
    // 임베딩 기반 AI 자연어 검색 (Phase 2)
    // 기존 search(키워드 매칭)와 독립적으로 동작 - 문제 시 이 블록만 제거
    // ─────────────────────────────────────────────────────────────
    embeddingSearch: publicProcedure
      .input(z.object({
        query: z.string().min(1),
        limit: z.number().default(10),
        threshold: z.number().default(0.60),
      }))
      .query(async ({ input }) => {
        try {
          const db = await getDb();
          if (!db) throw new Error("Database not available");

          // ── 쿼리 유효성 검사: 욕설/무의미 입력 조기 차단 ──
          const isValidQuery = await validateSearchQuery(input.query);
          if (!isValidQuery) {
            console.log(`[EmbeddingSearch] 유효하지 않은 쿼리 차단: "${input.query}"`);
            return [];
          }

          // 임베딩 유사도 검색 (searchMentorsByEmbedding)
          const embeddingResults = await searchMentorsByEmbedding({
            query: input.query,
            limit: input.limit,
            threshold: input.threshold,
          });

          if (embeddingResults.length === 0) return [];

          // mentorProfileId 목록으로 멘토 상세 정보 조회 (userProfiles는 leftJoin)
          const mentorRows = await db
            .select({
              profile: mentorProfiles,
              user: {
                id: users.id,
                name: users.name,
                email: users.email,
              },
              userProfile: {
                profileImageUrl: userProfiles.profileImageUrl,
              },
            })
            .from(mentorProfiles)
            .innerJoin(users, eq(mentorProfiles.userId, users.id))
            .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
            .where(
              and(
                eq(mentorProfiles.verificationStatus, "approved"),
                eq(mentorProfiles.isDeleted, false)
              )
            );

          // 유사도 점수와 멘토 정보 병합 후 정렬
          const resultMap = new Map<number, number>(
            embeddingResults.map((r) => [r.mentorProfileId, r.similarity])
          );
          const merged = mentorRows
            .filter((row) => resultMap.has(row.profile.id))
            .map((row) => ({
              id: row.profile.id,
              uuid: row.profile.uuid,
              name: row.user.name,
              email: row.user.email,
              profileImageUrl: row.userProfile?.profileImageUrl ?? null,
              university: row.profile.university || "",
              major: row.profile.major || "",
              field: row.profile.field || "",
              bio: row.profile.bio || "",
              averageRating: row.profile.averageRating || 0,
              reviewCount: row.profile.reviewCount || 0,
              verificationStatus: row.profile.verificationStatus,
              similarity: resultMap.get(row.profile.id) as number,
            }))
            .sort((a, b) => b.similarity - a.similarity);

          console.log(`[EmbeddingSearch] query="${input.query}" → ${merged.length}명 반환`);
          return merged;
        } catch (error) {
          console.error("[EmbeddingSearch] Error:", error);
          return []; // 오류 시 빈 배열 반환 (기존 검색에 영향 없음)
        }
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
    deactivateMentorProfile: protectedProcedure
      .input(z.object({
        mentorProfileId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can deactivate mentor profiles");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        // verificationStatus를 pending으로 되돌려 멘토 검색 결과에서 제외시킴
        await db.update(mentorProfiles).set({
          verificationStatus: "pending",
          updatedAt: new Date(),
        }).where(eq(mentorProfiles.id, input.mentorProfileId));
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

    getAllBookings: protectedProcedure
      .input(z.object({
        status: z.string().optional(),
        page: z.number().default(1),
        limit: z.number().default(20),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can access this");
        }
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const page = input?.page ?? 1;
        const limit = input?.limit ?? 20;
        const offset = (page - 1) * limit;

        // studentId(멘티) 기준으로 users 조인
        const studentAlias = users;
        const results = await db
          .select({
            booking: bookings,
            student: {
              id: users.id,
              name: users.name,
              email: users.email,
            },
            mentorProfile: {
              id: mentorProfiles.id,
              university: mentorProfiles.university,
              major: mentorProfiles.major,
              userId: mentorProfiles.userId,
            },
          })
          .from(bookings)
          .leftJoin(users, eq(bookings.studentId, users.id))
          .leftJoin(mentorProfiles, eq(bookings.mentorId, mentorProfiles.id))
          .orderBy(drizzleDesc(bookings.createdAt))
          .limit(limit)
          .offset(offset);

        const countResult = await db.select({ count: count() }).from(bookings);
        const total = countResult[0]?.count ?? 0;
        return {
          bookings: results,
          total,
          page,
          limit,
        };
      }),

    getConsultationStats: protectedProcedure
      .input(z.object({
        year: z.number().optional(),
        month: z.number().optional(),
      }).optional())
      .query(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can access this");
        }

        if (input?.year && input?.month) {
          const stats = await getMonthlyConsultationStats(input.year, input.month);
          return { stats, type: "monthly" };
        } else {
          const stats = await getOverallConsultationStats();
          return { stats, type: "overall" };
        }
      }),

    getLast12MonthsStats: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can access this");
        }
        return await getLast12MonthsStats();
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

    setPrimary: protectedProcedure
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
        
        // 기존 대표 사진 해제
        await database.update(mentorGallery)
          .set({ isPrimary: false })
          .where(eq(mentorGallery.mentorId, gallery[0].mentorId));
        
        // 새로운 대표 사진 설정
        await database.update(mentorGallery)
          .set({ isPrimary: true })
          .where(eq(mentorGallery.id, input.imageId));
        
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

  qna: router({
    getQuestions: publicProcedure
      .input(z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        searchQuery: z.string().optional(),
        category: z.string().optional(),
        sortBy: z.string().default("recent"),
        status: z.string().optional(),
      }))
      .query(async ({ input }) => {
        return await getQuestions(input.limit, input.offset, input.searchQuery, input.category, input.sortBy, input.status);
      }),

    getQuestionById: publicProcedure
      .input(z.object({ questionId: z.number() }))
      .query(async ({ input }) => {
        return await getQuestionDetail(input.questionId);
      }),

    createQuestion: protectedProcedure
      .input(z.object({
        title: z.string().min(1, "제목을 입력해주세요"),
        content: z.string().min(1, "내용을 입력해주세요"),
        category: z.string().optional(),
        isAnonymous: z.boolean().default(false),
        interestUniversity: z.string().optional(),
        interestMajor: z.string().optional(),
        gradeLevel: z.string().optional(),
        contextInfo: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const result = await createQuestion(
          ctx.user.id,
          input.title,
          input.content,
          input.category,
          input.isAnonymous,
          input.interestUniversity,
          input.interestMajor,
          input.gradeLevel,
          input.contextInfo
        );
        return { success: true, questionId: (result as any).insertId };
      }),

    updateQuestion: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        title: z.string().optional(),
        content: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const question = await getQuestionById(input.questionId);
        if (!question) throw new Error("Question not found");
        if (question.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await updateQuestion(input.questionId, input.title, input.content);
        return { success: true };
      }),


    updateQuestionStatus: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        status: z.enum(["awaiting_answer", "answered", "solved"]),
      }))
      .mutation(async ({ ctx, input }) => {
        const question = await getQuestionById(input.questionId);
        if (!question) throw new Error("Question not found");
        if (question.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await updateQuestion(input.questionId, undefined, undefined, input.status);
        return { success: true };
      }),

    createReport: protectedProcedure
      .input(z.object({
        reportType: z.enum(["question", "answer", "reply"]),
        contentId: z.number(),
        reason: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { createReport } = await import("./qna");
        await createReport(
          ctx.user.id,
          input.reportType,
          input.contentId,
          input.reason,
          input.description
        );
        return { success: true };
      }),
    deleteQuestion: protectedProcedure
      .input(z.object({ questionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const question = await getQuestionById(input.questionId);
        if (!question) throw new Error("Question not found");
        if (question.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await deleteQuestion(input.questionId);
        return { success: true };
      }),

    getMyQuestions: protectedProcedure
      .query(async ({ ctx }) => {
        return await getMyQuestions(ctx.user.id);
      }),

    // 관리자 Q&A 삭제
    adminDeleteQuestion: protectedProcedure
      .input(z.object({ questionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete questions");
        }
        const question = await getQuestionById(input.questionId);
        if (!question) throw new Error("Question not found");

        await deleteQuestion(input.questionId);
        return { success: true };
      }),
  }),

  qnaAnswer: router({
    create: protectedProcedure
      .input(z.object({
        questionId: z.number(),
        content: z.string().min(1, "답변을 입력해주세요"),
      }))
      .mutation(async ({ ctx, input }) => {
        // 멘토 검증
        const mentorProfile = await getMentorProfileByUserId(ctx.user.id);
        if (!mentorProfile) throw new Error("Only mentors can write answers");

        const question = await getQuestionById(input.questionId);
        if (!question) throw new Error("Question not found");

        const result = await createAnswer(
          input.questionId,
          ctx.user.id,
          input.content
        );
        // 질문 작성자에게 알림 발송 (비동기, 실패해도 무시)
        notifyQuestionAuthorOnAnswer(input.questionId, ctx.user.id).catch(() => {});
        return { success: true, answerId: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(z.object({
        answerId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const answer = await getAnswerById(input.answerId);
        if (!answer) throw new Error("Answer not found");
        if (answer.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await updateAnswer(input.answerId, input.content);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ answerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const answer = await getAnswerById(input.answerId);
        if (!answer) throw new Error("Answer not found");
        if (answer.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await deleteAnswer(input.answerId);
        return { success: true };
      }),

    getByQuestionId: publicProcedure
      .input(z.object({ questionId: z.number() }))
      .query(async ({ input }) => {
        return await getAnswersByQuestionId(input.questionId);
      }),

    accept: protectedProcedure
      .input(z.object({ answerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const result = await acceptAnswer(input.answerId, ctx.user.id);
        if (!result.success) throw new Error(result.message);
        return { success: true, message: result.message };
      }),

    toggleLike: protectedProcedure
      .input(z.object({ answerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await toggleAnswerLike(input.answerId, ctx.user.id);
      }),

    // 관리자 답변 삭제
    adminDelete: protectedProcedure
      .input(z.object({ answerId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete answers");
        }
        const answer = await getAnswerById(input.answerId);
        if (!answer) throw new Error("Answer not found");

        await deleteAnswer(input.answerId);
        return { success: true };
      }),

    getUserLikes: protectedProcedure
      .input(z.object({ answerIds: z.array(z.number()) }))
      .query(async ({ ctx, input }) => {
        const likedIds = await getUserAnswerLikes(ctx.user.id, input.answerIds);
        return { likedAnswerIds: likedIds };
      }),

    getMyAnswers: protectedProcedure
      .query(async ({ ctx }) => {
        return await getMyAnswers(ctx.user.id);
      }),
  }),

  qnaReply: router({
    create: protectedProcedure
      .input(z.object({
        answerId: z.number(),
        content: z.string().min(1, "답글을 입력해주세요"),
      }))
      .mutation(async ({ ctx, input }) => {
        const answer = await getAnswerById(input.answerId);
        if (!answer) throw new Error("Answer not found");

        const result = await createAnswerReply(
          input.answerId,
          ctx.user.id,
          input.content
        );
        return { success: true, replyId: (result as any).insertId };
      }),

    update: protectedProcedure
      .input(z.object({
        replyId: z.number(),
        content: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        const reply = await getReplyById(input.replyId);
        if (!reply) throw new Error("Reply not found");
        if (reply.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await updateReply(input.replyId, input.content);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ replyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const reply = await getReplyById(input.replyId);
        if (!reply) throw new Error("Reply not found");
        if (reply.authorId !== ctx.user.id) throw new Error("Unauthorized");

        await deleteReply(input.replyId);
        return { success: true };
      }),

    getByAnswerId: publicProcedure
      .input(z.object({ answerId: z.number() }))
      .query(async ({ input }) => {
        return await getRepliesByAnswerId(input.answerId);
      }),

    // 관리자 답글 삭제
    adminDelete: protectedProcedure
      .input(z.object({ replyId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete replies");
        }
        const reply = await getReplyById(input.replyId);
        if (!reply) throw new Error("Reply not found");

        await deleteReply(input.replyId);
        return { success: true };
      }),
  }),

  mentorColumns: router({
    getList: publicProcedure
      .input(z.object({
        limit: z.number().optional(),
        offset: z.number().optional(),
        sortBy: z.enum(["latest", "likes", "comments"]).optional(),
        category: z.string().optional(),
        searchQuery: z.string().optional(),
        authorId: z.number().optional(),
      }))
      .query(async ({ input }) => {
        return await getColumnsList(input);
      }),

    getById: publicProcedure
      .input(z.object({ columnId: z.number() }))
      .query(async ({ ctx, input }) => {
        return await getColumnById(input.columnId, ctx.user?.id);
      }),

    uploadCoverImage: protectedProcedure
      .input(z.object({
        imageData: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
        const mimeMatch = input.imageData.match(/^data:(image\/[a-z]+);base64,/);
        const mimeType = mimeMatch?.[1];
        
        if (!mimeType || !allowedMimeTypes.includes(mimeType)) {
          throw new Error("Unsupported image type. Use JPEG, PNG, GIF, or WebP.");
        }
        
        const base64Data = input.imageData.replace(/^data:image\/[a-z]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        
        const fileName = `column-covers/${ctx.user.id}-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const { url } = await storagePut(fileName, buffer, 'image/jpeg');
        
        return { imageUrl: url };
      }),

    create: protectedProcedure
      .input(z.object({
        title: z.string().min(5).max(255),
        content: z.string().min(50),
        category: z.string().min(1).max(100),
        excerpt: z.string().optional(),
        coverImageUrl: z.string().optional(),
        status: z.enum(["draft", "published"]),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createColumn(ctx.user.id, input);
      }),

    update: protectedProcedure
      .input(z.object({
        columnId: z.number(),
        title: z.string().min(5).max(255).optional(),
        content: z.string().min(50).optional(),
        category: z.string().min(1).max(100).optional(),
        excerpt: z.string().optional(),
        coverImageUrl: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { columnId, ...data } = input;
        return await updateColumn(columnId, ctx.user.id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ columnId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteColumn(input.columnId, ctx.user.id);
      }),

    toggleLike: protectedProcedure
      .input(z.object({ columnId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await toggleColumnLike(input.columnId, ctx.user.id);
      }),

    getComments: publicProcedure
      .input(z.object({ columnId: z.number() }))
      .query(async ({ input }) => {
        return await getColumnComments(input.columnId);
      }),

    createComment: protectedProcedure
      .input(z.object({
        columnId: z.number(),
        content: z.string().min(1).max(1000),
        parentCommentId: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createComment(
          input.columnId,
          ctx.user.id,
          input.content,
          input.parentCommentId
        );
      }),

    updateComment: protectedProcedure
      .input(z.object({
        commentId: z.number(),
        content: z.string().min(1).max(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        return await updateComment(input.commentId, ctx.user.id, input.content);
      }),

    deleteComment: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await deleteComment(input.commentId, ctx.user.id);
      }),

    adminDeleteColumn: protectedProcedure
      .input(z.object({ columnId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("관리자만 칼럼을 삭제할 수 있습니다");
        }
        return await deleteColumn(input.columnId, ctx.user.id);
      }),

    adminDeleteComment: protectedProcedure
      .input(z.object({ commentId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        if (ctx.user.role !== "admin") {
          throw new Error("관리자만 댓글을 삭제할 수 있습니다");
        }
        return await deleteComment(input.commentId, ctx.user.id);
      }),

    getMyColumns: protectedProcedure
      .query(async ({ ctx }) => {
        return await getMyColumns(ctx.user.id);
      }),

    getDraftColumns: protectedProcedure
      .query(async ({ ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        return await db
          .select()
          .from(mentorColumns)
          .where(
            and(
              eq(mentorColumns.authorId, ctx.user.id),
              eq(mentorColumns.status, "draft"),
              isNull(mentorColumns.deletedAt)
            )
          )
          .orderBy(desc(mentorColumns.updatedAt));
      }),

    incrementViewCount: publicProcedure
      .input(z.object({ columnId: z.number() }))
      .mutation(async ({ input }) => {
        await incrementViewCount(input.columnId);
        return { success: true };
      }),
  }),

  // 추천 시스템 라우터
  recommendations: router({
    // 학생의 관심사 저장
    saveStudentInterests: protectedProcedure
      .input(z.object({
        interests: z.array(z.object({
          category: z.string(),
          level: z.enum(["beginner", "intermediate", "advanced"]),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // 기존 관심사 삭제
        await db.delete(studentInterests).where(eq(studentInterests.studentId, ctx.user.id));
        
        // 새 관심사 추가
        for (const interest of input.interests) {
          await db.insert(studentInterests).values({
            studentId: ctx.user.id,
            interestCategory: interest.category,
            interestLevel: interest.level,
          });
        }
        
        return { success: true };
      }),

    // 추천 멘토 조회
    getRecommendedMentors: protectedProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // 평점 높은 멘토 추천 (간단한 버전)
        const recommendedMentors = await db
          .select()
          .from(mentorProfiles)
          .where(and(
            eq(mentorProfiles.verificationStatus, "approved"),
            eq(mentorProfiles.isDeleted, false)
          ))
          .orderBy(desc(mentorProfiles.averageRating))
          .limit(input.limit);
        
        return recommendedMentors;
      }),

    // 추천 기록 저장
    recordRecommendation: protectedProcedure
      .input(z.object({
        mentorId: z.number(),
        score: z.number().min(0).max(100),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.insert(mentorRecommendations).values({
          studentId: ctx.user.id,
          mentorId: input.mentorId,
          recommendationScore: input.score.toString(),
          recommendationReason: input.reason,
        });
        
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
