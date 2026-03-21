ALTER TABLE `messagingProviders`
  MODIFY COLUMN `providerType` enum('twilio','clickatell','cm') NOT NULL;

UPDATE `messagingProviders`
SET `providerType` = 'cm'
WHERE `providerType` = 'clickatell';

ALTER TABLE `messagingProviders`
  MODIFY COLUMN `providerType` enum('twilio','cm') NOT NULL;
