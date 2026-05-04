CREATE TABLE `column_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reporterId` int NOT NULL,
	`columnId` int NOT NULL,
	`reason` varchar(100) NOT NULL,
	`description` text,
	`status` enum('pending','reviewed','approved','rejected') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `column_reports_id` PRIMARY KEY(`id`)
);
