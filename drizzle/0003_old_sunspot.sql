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
ALTER TABLE `mentor_profiles` ADD `verificationStatus` enum('pending','approved','rejected') DEFAULT 'pending' NOT NULL;