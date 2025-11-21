-- Drop notifications table
DROP TABLE IF EXISTS `notifications`;

-- Drop call_logs table
DROP TABLE IF EXISTS `call_logs`;

-- Remove Twilio phone number field from tenants table
ALTER TABLE `tenants` 
DROP COLUMN `twilioPhoneNumber`;
