ALTER TABLE `bug_reports` ADD `device` varchar(255);--> statement-breakpoint
ALTER TABLE `bug_reports` DROP COLUMN `severity`;--> statement-breakpoint
ALTER TABLE `bug_reports` DROP COLUMN `page`;