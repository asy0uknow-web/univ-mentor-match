-- Add email/password authentication fields to users table
ALTER TABLE `users` ADD COLUMN `passwordHash` varchar(255) AFTER `loginMethod`;
ALTER TABLE `users` ADD COLUMN `emailVerified` boolean NOT NULL DEFAULT false AFTER `passwordHash`;
ALTER TABLE `users` ADD UNIQUE INDEX `idx_email_unique` (`email`);
