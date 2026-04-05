CREATE TABLE `answer_likes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`answerId` int NOT NULL,
	`userId` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `answer_likes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `answers` ADD `isAccepted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `answers` ADD `likeCount` int DEFAULT 0 NOT NULL;