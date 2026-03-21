ALTER TABLE `staff`
  ADD COLUMN `mobileCountryIso` varchar(2) NULL AFTER `mobilePhone`,
  ADD COLUMN `mobilePhoneE164` varchar(20) NULL AFTER `mobileCountryIso`;

ALTER TABLE `clients`
  ADD COLUMN `mobileCountryIso` varchar(2) NULL AFTER `mobilePhone`,
  ADD COLUMN `mobilePhoneE164` varchar(20) NULL AFTER `mobileCountryIso`;

CREATE TABLE `messagingProviders` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(255) NOT NULL,
  `providerType` enum('twilio','clickatell') NOT NULL,
  `isActive` int NOT NULL DEFAULT 1,
  `isDefault` int NOT NULL DEFAULT 0,
  `credentials` json NOT NULL,
  `settings` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdBy` int NOT NULL,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updatedBy` int NOT NULL,
  CONSTRAINT `messagingProviders_id` PRIMARY KEY(`id`)
);
