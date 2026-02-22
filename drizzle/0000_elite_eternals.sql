CREATE TABLE `staff` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320),
	`passwordHash` varchar(255),
	`mustChangePassword` int DEFAULT 0 NOT NULL,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	`role` enum('admin','counselor','viewer') NOT NULL DEFAULT 'counselor',
	`isVipRated` int DEFAULT 0 NOT NULL,
	`isAdmin` int DEFAULT 0 NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`createdBy` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`updatedBy` int NOT NULL,
	CONSTRAINT `staff_id` PRIMARY KEY(`id`)
);
