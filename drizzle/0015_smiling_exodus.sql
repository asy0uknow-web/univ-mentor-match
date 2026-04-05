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
	`status` enum('draft','published') NOT NULL DEFAULT 'draft',
	`deletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_columns_id` PRIMARY KEY(`id`)
);
