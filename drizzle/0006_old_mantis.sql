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
ALTER TABLE `bookings` MODIFY COLUMN `status` enum('pending','confirmed','in_progress','completed','cancelled','reschedule_requested') NOT NULL DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `bookings` ADD `consultationStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `consultationCompletedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `rescheduleRequestedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `rescheduleRequestedBy` int;--> statement-breakpoint
ALTER TABLE `bookings` ADD `rescheduleNotice` text;