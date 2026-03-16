CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`mentorId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` decimal(3,1) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`consultationType` enum('resume_consulting','career_counseling','academic_management','university_tour') NOT NULL DEFAULT 'career_counseling',
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`studentMessage` text,
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
	`userId` int NOT NULL,
	`university` varchar(255) NOT NULL,
	`major` varchar(255) NOT NULL,
	`region` enum('seoul','gyeonggi','incheon','gangwon','chungcheong','jeolla','gyeongsang','jeju'),
	`grade` enum('1','2','3','4','graduate') NOT NULL,
	`bio` text,
	`hourlyRate` decimal(10,2) DEFAULT '0',
	`availableSlots` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`verificationStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`isDeleted` boolean NOT NULL DEFAULT false,
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_profiles_id` PRIMARY KEY(`id`),
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
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`senderId` int NOT NULL,
	`recipientId` int NOT NULL,
	`content` text NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`bookingId` int,
	`messageType` enum('text','proposal') NOT NULL DEFAULT 'text',
	`proposalId` int,
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
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`openId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`passwordHash` varchar(255),
	`emailVerified` boolean NOT NULL DEFAULT false,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`userType` enum('high_school_student','university_student'),
	`stripeCustomerId` varchar(255),
	`phoneNumber` varchar(20),
	`password` varchar(255),
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
