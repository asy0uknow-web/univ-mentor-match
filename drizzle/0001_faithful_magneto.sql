CREATE TABLE `bookings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`mentorId` int NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`duration` decimal(3,1) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`status` enum('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(255),
	`studentMessage` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mentor_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`university` varchar(255) NOT NULL,
	`major` varchar(255) NOT NULL,
	`grade` enum('1','2','3','4','graduate') NOT NULL,
	`bio` text,
	`hourlyRate` decimal(10,2) NOT NULL,
	`availableSlots` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`averageRating` decimal(3,2) DEFAULT '0.00',
	`reviewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('booking_confirmed','booking_cancelled','schedule_changed','review_received') NOT NULL,
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
ALTER TABLE `users` ADD `userType` enum('high_school_student','university_student');--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(255);