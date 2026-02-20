ALTER TABLE `users` ADD `realName` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `phoneNumber` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `password` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `verificationStatus` enum('not_verified','pending','verified','rejected') DEFAULT 'not_verified' NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `verificationMethod` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `verifiedAt` timestamp;