CREATE TABLE `mentor_gallery` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`imageUrl` varchar(500) NOT NULL,
	`caption` text,
	`displayOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_gallery_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `mentor_profiles` ADD `field` enum('engineering','natural_science','business','humanities','education','liberal_arts','medicine');--> statement-breakpoint
ALTER TABLE `mentor_profiles` ADD `region` enum('seoul','gyeonggi','incheon','gangwon','chungcheong','jeolla','gyeongsang','jeju');