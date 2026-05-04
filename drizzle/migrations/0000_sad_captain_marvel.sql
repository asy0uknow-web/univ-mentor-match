CREATE TABLE `answer_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `answer_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `answer_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`isReported` boolean NOT NULL DEFAULT false,
	`reportReason` varchar(255),
	`reportCount` int NOT NULL DEFAULT 0,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `answer_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `answers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`questionId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`isAccepted` boolean NOT NULL DEFAULT false,
	`likeCount` int NOT NULL DEFAULT 0,
	`isReported` boolean NOT NULL DEFAULT false,
	`reportReason` varchar(255),
	`reportCount` int NOT NULL DEFAULT 0,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `answers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`mentorId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` decimal(3,1) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`consultationType` enum('resume_consulting','career_counseling','academic_management','university_tour') NOT NULL DEFAULT 'career_counseling',
	`status` enum('pending','confirmed','in_progress','completed','cancelled','reschedule_requested') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`studentMessage` text,
	`consultationStartedAt` timestamp,
	`consultationCompletedAt` timestamp,
	`rescheduleRequestedAt` timestamp,
	`rescheduleRequestedBy` int,
	`rescheduleNotice` text,
	`studentStartedAt` timestamp,
	`mentorStartedAt` timestamp,
	`studentEndedAt` timestamp,
	`mentorEndedAt` timestamp,
	`endReason` varchar(255),
	`endReasonDetails` text,
	`notified30MinBefore` boolean DEFAULT false,
	`notified10MinBefore` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bug_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`device` varchar(255),
	`userAgent` text,
	`status` enum('new','acknowledged','in_progress','resolved','wont_fix') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bug_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `column_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`columnId` int NOT NULL,
	`reason` varchar(100) NOT NULL,
	`description` text,
	`status` enum('pending','reviewed','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `column_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `consultation_proposals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`proposerId` int NOT NULL,
	`receiverId` int NOT NULL,
	`bookingId` int,
	`status` enum('pending','accepted','rejected','counter_proposed','cancelled','completed') NOT NULL DEFAULT 'pending',
	`scheduledAt` timestamp NOT NULL,
	`consultationMode` enum('online','offline') NOT NULL,
	`location` varchar(500),
	`duration` decimal(3,1) NOT NULL,
	`consultationType` enum('resume_consulting','career_counseling','academic_management','university_tour') NOT NULL DEFAULT 'career_counseling',
	`note` text,
	`acceptedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `consultation_proposals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `email_verification_codes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`code` varchar(10) NOT NULL,
	`isVerified` boolean NOT NULL DEFAULT false,
	`attemptCount` int NOT NULL DEFAULT 0,
	`lastSentAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `email_verification_codes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_column_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`columnId` int NOT NULL,
	`authorId` int NOT NULL,
	`parentCommentId` int,
	`content` text NOT NULL,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_column_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_column_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`columnId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mentor_column_likes_id` PRIMARY KEY(`id`),
	CONSTRAINT `unique_column_like` UNIQUE(`columnId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `mentor_columns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100) NOT NULL,
	`excerpt` text,
	`coverImageUrl` varchar(500),
	`likesCount` int NOT NULL DEFAULT 0,
	`commentsCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_columns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_consultation_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`consultationType` enum('career_counseling','university_tour','resume_consulting','academic_management') NOT NULL,
	`pricePerHour` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_consultation_types_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`imageUrl` varchar(2000) NOT NULL,
	`caption` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`isPrimary` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`university` varchar(255) NOT NULL,
	`major` varchar(255) NOT NULL,
	`availableRegions` text,
	`grade` enum('1','2','3','4','graduate') NOT NULL,
	`bio` text,
	`field` enum('engineering','natural_science','business','humanities','education','liberal_arts','medicine'),
	`hourlyRate` decimal(10,2) DEFAULT '0',
	`availableSlots` text,
	`verificationStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`isDeleted` boolean NOT NULL DEFAULT false,
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`answerCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `mentor_profiles_uuid_unique` UNIQUE(`uuid`),
	CONSTRAINT `mentor_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `mentor_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`mentorId` int NOT NULL,
	`recommendationScore` decimal(5,2) NOT NULL,
	`recommendationReason` varchar(255),
	`isClicked` boolean NOT NULL DEFAULT false,
	`isConverted` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_verifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`studentIdImageUrl` varchar(500) NOT NULL,
	`status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `message_reactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`emoji` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `message_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`bookingId` int,
	`messageType` enum('text','proposal') NOT NULL DEFAULT 'text',
	`proposalId` int,
	`isEdited` boolean NOT NULL DEFAULT false,
	`originalContent` text,
	`isDeleted` boolean NOT NULL DEFAULT false,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('booking_request','booking_confirmed','booking_cancelled','schedule_changed','review_received','message','consultation_reminder','consultation_urgent_reminder','qna_answer') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `qna_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`reportType` enum('question','answer','reply') NOT NULL,
	`contentId` int NOT NULL,
	`reason` varchar(255) NOT NULL,
	`description` text,
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `qna_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100),
	`isAnonymous` boolean NOT NULL DEFAULT false,
	`status` enum('awaiting_answer','answered','solved') NOT NULL DEFAULT 'awaiting_answer',
	`answerCount` int NOT NULL DEFAULT 0,
	`viewCount` int NOT NULL DEFAULT 0,
	`likeCount` int NOT NULL DEFAULT 0,
	`lastAnsweredAt` timestamp,
	`interestUniversity` varchar(255),
	`interestMajor` varchar(255),
	`gradeLevel` varchar(50),
	`contextInfo` text,
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookingId` int NOT NULL,
	`studentId` int NOT NULL,
	`mentorId` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`interestCategory` varchar(100) NOT NULL,
	`interestLevel` enum('beginner','intermediate','advanced'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_interests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`school` varchar(255) NOT NULL,
	`grade` enum('1','2','3') NOT NULL,
	`region` enum('seoul','gyeonggi','incheon','gangwon','chungcheong','jeolla','gyeongsang','jeju'),
	`bio` text,
	`profileImageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_uuid_unique` UNIQUE(`uuid`),
	CONSTRAINT `student_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`profileImageUrl` varchar(500),
	`isOnline` boolean NOT NULL DEFAULT false,
	`lastActiveAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_typing_status` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversationPartnerId` int NOT NULL,
	`isTyping` boolean NOT NULL DEFAULT false,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_typing_status_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`passwordHash` varchar(255),
	`emailVerified` boolean NOT NULL DEFAULT false,
	`role` enum('user','admin','mentor') NOT NULL DEFAULT 'user',
	`userType` enum('high_school_student','university_student'),
	`stripeCustomerId` varchar(255),
	`phoneNumber` varchar(20),
	`verificationStatus` enum('not_verified','pending','verified','rejected') NOT NULL DEFAULT 'not_verified',
	`verificationMethod` varchar(64),
	`verifiedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_openId_unique` UNIQUE(`openId`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
