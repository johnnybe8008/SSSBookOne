RENAME TABLE `cases` TO `caseFolders`;

ALTER TABLE `caseFolders`
  RENAME COLUMN `caseNumber` TO `folderNumber`;

ALTER TABLE `sessions`
  RENAME COLUMN `caseId` TO `folderId`;

ALTER TABLE `caseFolders`
  MODIFY COLUMN `folderNumber` varchar(3) NOT NULL;

ALTER TABLE `caseFolders`
  DROP INDEX `cases_caseNumber_unique`;

ALTER TABLE `caseFolders`
  ADD UNIQUE INDEX `caseFolders_clientId_folderNumber_unique` (`clientId`, `folderNumber`);
