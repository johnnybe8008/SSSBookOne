ALTER TABLE `organizations`
  ADD COLUMN IF NOT EXISTS `addressLine1` text NULL,
  ADD COLUMN IF NOT EXISTS `city` varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS `stateProvince` varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS `postalCode` varchar(30) NULL;

ALTER TABLE `companies`
  ADD COLUMN IF NOT EXISTS `addressLine1` text NULL,
  ADD COLUMN IF NOT EXISTS `city` varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS `stateProvince` varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS `postalCode` varchar(30) NULL;

ALTER TABLE `clients`
  ADD COLUMN IF NOT EXISTS `addressLine1` text NULL,
  ADD COLUMN IF NOT EXISTS `city` varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS `stateProvince` varchar(120) NULL,
  ADD COLUMN IF NOT EXISTS `postalCode` varchar(30) NULL;

UPDATE `organizations`
SET `addressLine1` = `address`
WHERE `addressLine1` IS NULL AND `address` IS NOT NULL AND TRIM(`address`) <> '';

UPDATE `companies`
SET `addressLine1` = `address`
WHERE `addressLine1` IS NULL AND `address` IS NOT NULL AND TRIM(`address`) <> '';

UPDATE `clients`
SET `addressLine1` = `address`
WHERE `addressLine1` IS NULL AND `address` IS NOT NULL AND TRIM(`address`) <> '';