ALTER TABLE `staff` MODIFY COLUMN `teamId` int;--> statement-breakpoint
ALTER TABLE `staff` ADD `groupId` int;--> statement-breakpoint
ALTER TABLE `staff` ADD `staffDepartmentId` int;--> statement-breakpoint
ALTER TABLE `staff` DROP COLUMN `companyId`;--> statement-breakpoint
ALTER TABLE `staff` DROP COLUMN `divisionId`;--> statement-breakpoint
ALTER TABLE `staff` DROP COLUMN `departmentId`;--> statement-breakpoint
ALTER TABLE `staff` DROP COLUMN `companyTeamId`;