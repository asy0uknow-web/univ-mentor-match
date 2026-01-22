CREATE TABLE `bug_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL DEFAULT 'medium',
	`page` varchar(255),
	`userAgent` text,
	`status` enum('new','acknowledged','in_progress','resolved','wont_fix') NOT NULL DEFAULT 'new',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bug_reports_id` PRIMARY KEY(`id`)
);
