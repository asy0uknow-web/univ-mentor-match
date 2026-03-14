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
ALTER TABLE `messages` ADD `messageType` enum('text','proposal') DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE `messages` ADD `proposalId` int;