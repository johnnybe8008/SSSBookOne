ALTER TABLE `staff`
  ADD COLUMN `addressLine1` text NULL,
  ADD COLUMN `city` varchar(120) NULL,
  ADD COLUMN `stateProvince` varchar(120) NULL,
  ADD COLUMN `postalCode` varchar(30) NULL;

UPDATE `staff`
SET `addressLine1` = `address`
WHERE `addressLine1` IS NULL AND `address` IS NOT NULL AND TRIM(`address`) <> '';
