CREATE TABLE `companyTeams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`departmentId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int NOT NULL,
	CONSTRAINT `companyTeams_id` PRIMARY KEY(`id`),
	CONSTRAINT `companyTeams_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
ALTER TABLE `departments` MODIFY COLUMN `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `divisions` MODIFY COLUMN `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `departments` ADD `code` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `divisions` ADD `code` varchar(50) NOT NULL;--> statement-breakpoint
ALTER TABLE `departments` ADD CONSTRAINT `departments_code_unique` UNIQUE(`code`);--> statement-breakpoint
ALTER TABLE `divisions` ADD CONSTRAINT `divisions_code_unique` UNIQUE(`code`);