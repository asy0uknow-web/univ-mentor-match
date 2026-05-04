CREATE TABLE `answer_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
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
CREATE TABLE `email_verification_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`token` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`isUsed` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `email_verification_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `email_verification_tokens_token_unique` UNIQUE(`token`)
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
	`region` enum('seoul','gyeonggi','incheon','gangwon','chungcheong','jeolla','gyeongsang','jeju'),
	`grade` enum('1','2','3','4','graduate') NOT NULL,
	`bio` text,
	`field` enum('engineering','natural_science','business','humanities','education','liberal_arts','medicine'),
	`hourlyRate` decimal(10,2) DEFAULT '0',
	`availableSlots` text,
	`verificationStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`isDeleted` boolean NOT NULL DEFAULT false,
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `mentor_profiles_uuid_unique` UNIQUE(`uuid`),
	CONSTRAINT `mentor_profiles_userId_unique` UNIQUE(`userId`)
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
	`type` enum('booking_request','booking_confirmed','booking_cancelled','schedule_changed','review_received','message') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`relatedId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`category` varchar(100),
	`isAnonymous` boolean NOT NULL DEFAULT false,
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
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin','mentor') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `emailVerified` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('high_school_student','university_student');--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('not_verified','pending','verified','rejected') DEFAULT 'not_verified' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationMethod` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `verifiedAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);