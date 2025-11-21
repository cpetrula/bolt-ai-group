-- Add Twilio phone number field to tenants table
ALTER TABLE `tenants` 
ADD COLUMN `twilioPhoneNumber` VARCHAR(20) NULL UNIQUE AFTER `settings`;

-- Create call_logs table
CREATE TABLE `call_logs` (
    `id` VARCHAR(36) NOT NULL,
    `tenantId` VARCHAR(36) NOT NULL,
    `callSid` VARCHAR(100) NOT NULL UNIQUE,
    `fromNumber` VARCHAR(20) NOT NULL,
    `toNumber` VARCHAR(20) NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NULL,
    `durationSeconds` INT NULL,
    `callReason` ENUM('SETUP_APPOINTMENT', 'CANCEL_APPOINTMENT', 'MODIFY_APPOINTMENT', 'GET_HOURS', 'GET_PRICING', 'OTHER') NOT NULL DEFAULT 'OTHER',
    `notes` TEXT NULL,
    `recordingUrl` VARCHAR(500) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`id`),
    INDEX `call_logs_tenantId_idx` (`tenantId`),
    INDEX `call_logs_callSid_idx` (`callSid`),
    INDEX `call_logs_startTime_idx` (`startTime`),
    
    CONSTRAINT `call_logs_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create notifications table
CREATE TABLE `notifications` (
    `id` VARCHAR(36) NOT NULL,
    `tenantId` VARCHAR(36) NOT NULL,
    `type` ENUM('SMS', 'EMAIL') NOT NULL,
    `recipient` VARCHAR(255) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('QUEUED', 'SENT', 'FAILED') NOT NULL DEFAULT 'QUEUED',
    `relatedAppointmentId` VARCHAR(36) NULL,
    `sentAt` DATETIME(3) NULL,
    `failureReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`id`),
    INDEX `notifications_tenantId_idx` (`tenantId`),
    INDEX `notifications_status_idx` (`status`),
    INDEX `notifications_type_idx` (`type`),
    
    CONSTRAINT `notifications_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
