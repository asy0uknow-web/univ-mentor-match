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
ALTER TABLE `answer_replies` ADD `isReported` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `answer_replies` ADD `reportReason` varchar(255);--> statement-breakpoint
ALTER TABLE `answer_replies` ADD `reportCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `answers` ADD `isReported` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `answers` ADD `reportReason` varchar(255);--> statement-breakpoint
ALTER TABLE `answers` ADD `reportCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `status` enum('awaiting_answer','answered','solved') DEFAULT 'awaiting_answer' NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `answerCount` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `questions` ADD `lastAnsweredAt` timestamp;--> statement-breakpoint
ALTER TABLE `questions` ADD `interestUniversity` varchar(255);--> statement-breakpoint
ALTER TABLE `questions` ADD `interestMajor` varchar(255);--> statement-breakpoint
ALTER TABLE `questions` ADD `gradeLevel` varchar(50);--> statement-breakpoint
ALTER TABLE `questions` ADD `contextInfo` text;