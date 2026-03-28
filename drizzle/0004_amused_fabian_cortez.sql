UPDATE `mentor_profiles` SET `uuid` = UUID() WHERE `uuid` IS NULL;--> statement-breakpoint
ALTER TABLE `mentor_profiles` MODIFY `uuid` varchar(36) NOT NULL;