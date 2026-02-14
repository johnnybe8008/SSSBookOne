ALTER TABLE `clients` ADD `dateOfBirth` date;--> statement-breakpoint
ALTER TABLE `staff` ADD `role` enum('admin','counselor','viewer') DEFAULT 'counselor' NOT NULL;--> statement-breakpoint
ALTER TABLE `clients` DROP COLUMN `age`;