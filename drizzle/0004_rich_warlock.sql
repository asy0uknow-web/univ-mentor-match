CREATE TABLE `mentor_consultation_types` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`consultationType` enum('career_counseling','university_tour','resume_consulting','academic_management') NOT NULL,
	`pricePerHour` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_consultation_types_id` PRIMARY KEY(`id`)
);
