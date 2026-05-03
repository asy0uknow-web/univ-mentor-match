ALTER TABLE `bookings` ADD `studentStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `mentorStartedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `studentEndedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `mentorEndedAt` timestamp;--> statement-breakpoint
ALTER TABLE `bookings` ADD `endReason` varchar(255);--> statement-breakpoint
ALTER TABLE `bookings` ADD `endReasonDetails` text;