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
CREATE TABLE `student_interests` (
	`id` int AUTO_INCREMENT NOT NULL,
	`studentId` int NOT NULL,
	`interestCategory` varchar(100) NOT NULL,
	`interestLevel` enum('beginner','intermediate','advanced'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_interests_id` PRIMARY KEY(`id`)
);
