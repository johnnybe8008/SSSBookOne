ALTER TABLE `clients` ADD `companyId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `divisionId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` ADD `companyTeamId` int;--> statement-breakpoint
ALTER TABLE `staff` ADD `companyId` int;--> statement-breakpoint
ALTER TABLE `staff` ADD `divisionId` int;--> statement-breakpoint
ALTER TABLE `staff` ADD `departmentId` int;--> statement-breakpoint
ALTER TABLE `staff` ADD `companyTeamId` int;