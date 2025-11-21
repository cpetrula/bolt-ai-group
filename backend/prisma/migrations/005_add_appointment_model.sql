-- Add AppointmentStatus enum
CREATE TABLE IF NOT EXISTS `_appointment_status_enum` (
  `value` VARCHAR(20) PRIMARY KEY
);

INSERT IGNORE INTO `_appointment_status_enum` (`value`) VALUES
  ('SCHEDULED'),
  ('CONFIRMED'),
  ('IN_PROGRESS'),
  ('COMPLETED'),
  ('CANCELLED'),
  ('NO_SHOW');

-- Create appointments table
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `tenantId` VARCHAR(191) NOT NULL,
  `employeeId` VARCHAR(191) NOT NULL,
  `serviceId` VARCHAR(191) NOT NULL,
  `customerName` VARCHAR(191) NOT NULL,
  `customerEmail` VARCHAR(191) NULL,
  `customerPhone` VARCHAR(191) NULL,
  `appointmentDate` DATETIME(3) NOT NULL,
  `startTime` VARCHAR(191) NOT NULL,
  `endTime` VARCHAR(191) NOT NULL,
  `status` ENUM('SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW') NOT NULL DEFAULT 'SCHEDULED',
  `totalPrice` DECIMAL(10, 2) NOT NULL,
  `totalDuration` INT NOT NULL,
  `notes` TEXT NULL,
  `cancellationReason` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  
  INDEX `appointments_tenantId_idx` (`tenantId`),
  INDEX `appointments_employeeId_idx` (`employeeId`),
  INDEX `appointments_serviceId_idx` (`serviceId`),
  INDEX `appointments_appointmentDate_idx` (`appointmentDate`),
  INDEX `appointments_status_idx` (`status`),
  
  CONSTRAINT `appointments_tenantId_fkey` FOREIGN KEY (`tenantId`) REFERENCES `tenants`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `appointments_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `employees`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `appointments_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `services`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create appointment_addons table
CREATE TABLE IF NOT EXISTS `appointment_addons` (
  `id` VARCHAR(191) NOT NULL PRIMARY KEY,
  `tenantId` VARCHAR(191) NOT NULL,
  `appointmentId` VARCHAR(191) NOT NULL,
  `addonId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `price` DECIMAL(10, 2) NOT NULL,
  `durationMinutes` INT NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  
  INDEX `appointment_addons_tenantId_idx` (`tenantId`),
  INDEX `appointment_addons_appointmentId_idx` (`appointmentId`),
  
  CONSTRAINT `appointment_addons_appointmentId_fkey` FOREIGN KEY (`appointmentId`) REFERENCES `appointments`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
