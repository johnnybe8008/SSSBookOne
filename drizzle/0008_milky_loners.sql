CREATE TABLE `staffDepartments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`organizationId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int NOT NULL,
	CONSTRAINT `staffDepartments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `teams` ADD `staffDepartmentId` int;