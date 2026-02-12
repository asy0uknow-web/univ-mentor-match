ALTER TABLE `users` ADD `username` varchar(50);--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `realName` varchar(100);--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `university` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `major` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `userGrade` enum('1','2','3','4','graduate');--> statement-breakpoint
ALTER TABLE `users` ADD `isRegistrationComplete` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);