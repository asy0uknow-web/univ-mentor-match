CREATE TABLE `mentor_embeddings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`embedding` text NOT NULL,
	`modelVersion` varchar(64) DEFAULT 'text-embedding-3-small',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_embeddings_id` PRIMARY KEY(`id`),
	CONSTRAINT `mentor_embeddings_mentorId_unique` UNIQUE(`mentorId`)
);
--> statement-breakpoint
CREATE TABLE `mentor_features` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`admissionTypes` text,
	`highSchoolTypes` text,
	`strengths` text,
	`targetStudents` text,
	`experiences` text,
	`majorDescription` text,
	`admissionAchievements` text,
	`confidenceScore` decimal(3,2) DEFAULT '0.00',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_features_id` PRIMARY KEY(`id`),
	CONSTRAINT `mentor_features_mentorId_unique` UNIQUE(`mentorId`)
);
--> statement-breakpoint
CREATE TABLE `mentor_search_corpus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`corpus` text NOT NULL,
	`tokens` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `mentor_search_corpus_id` PRIMARY KEY(`id`),
	CONSTRAINT `mentor_search_corpus_mentorId_unique` UNIQUE(`mentorId`)
);
--> statement-breakpoint
CREATE TABLE `search_queries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`query` text NOT NULL,
	`resultCount` int DEFAULT 0,
	`clickedMentorId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `search_queries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_results_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`queryHash` varchar(64) NOT NULL,
	`results` text NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `search_results_cache_id` PRIMARY KEY(`id`),
	CONSTRAINT `search_results_cache_queryHash_unique` UNIQUE(`queryHash`)
);
