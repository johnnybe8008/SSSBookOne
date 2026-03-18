ALTER TABLE `staff`
  MODIFY COLUMN `notificationPreference` enum('sms','whatsapp') NULL DEFAULT NULL;

ALTER TABLE `clients`
  MODIFY COLUMN `notificationPreference` enum('sms','whatsapp') NULL DEFAULT NULL;
