DROP TABLE `answer_likes`;--> statement-breakpoint
DROP TABLE `answer_replies`;--> statement-breakpoint
DROP TABLE `answers`;--> statement-breakpoint
DROP TABLE `bookings`;--> statement-breakpoint
DROP TABLE `bug_reports`;--> statement-breakpoint
DROP TABLE `column_reports`;--> statement-breakpoint
DROP TABLE `consultation_proposals`;--> statement-breakpoint
DROP TABLE `email_verification_codes`;--> statement-breakpoint
DROP TABLE `mentor_column_comments`;--> statement-breakpoint
DROP TABLE `mentor_column_likes`;--> statement-breakpoint
DROP TABLE `mentor_columns`;--> statement-breakpoint
DROP TABLE `mentor_consultation_types`;--> statement-breakpoint
DROP TABLE `mentor_gallery`;--> statement-breakpoint
DROP TABLE `mentor_profiles`;--> statement-breakpoint
DROP TABLE `mentor_recommendations`;--> statement-breakpoint
DROP TABLE `mentor_verifications`;--> statement-breakpoint
DROP TABLE `message_reactions`;--> statement-breakpoint
DROP TABLE `messages`;--> statement-breakpoint
DROP TABLE `notifications`;--> statement-breakpoint
DROP TABLE `qna_reports`;--> statement-breakpoint
DROP TABLE `questions`;--> statement-breakpoint
DROP TABLE `reviews`;--> statement-breakpoint
DROP TABLE `student_interests`;--> statement-breakpoint
DROP TABLE `student_profiles`;--> statement-breakpoint
DROP TABLE `user_profiles`;--> statement-breakpoint
DROP TABLE `user_typing_status`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_email_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `passwordHash`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `emailVerified`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `userType`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `stripeCustomerId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `phoneNumber`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `verificationStatus`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `verificationMethod`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `verifiedAt`;