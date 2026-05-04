CREATE TABLE `student_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`uuid` varchar(36) NOT NULL,
	`userId` int NOT NULL,
	`school` varchar(255) NOT NULL,
	`grade` enum('1','2','3') NOT NULL,
	`region` enum('seoul','gyeonggi','incheon','gangwon','chungcheong','jeolla','gyeongsang','jeju'),
	`bio` text,
	`profileImageUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `student_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `student_profiles_uuid_unique` UNIQUE(`uuid`),
	CONSTRAINT `student_profiles_userId_unique` UNIQUE(`userId`)
);
