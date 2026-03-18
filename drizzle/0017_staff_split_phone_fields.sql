ALTER TABLE `staff`
  ADD COLUMN `homePhone` varchar(50) NULL,
  ADD COLUMN `mobilePhone` varchar(50) NULL,
  ADD COLUMN `workPhone` varchar(50) NULL;

UPDATE `staff`
SET `mobilePhone` = `phone`
WHERE (`mobilePhone` IS NULL OR TRIM(`mobilePhone`) = '')
  AND `phone` IS NOT NULL
  AND TRIM(`phone`) <> '';
