-- Migration: Update User model to include tenant relationship
-- Database: MySQL
-- Created: 2025-11-21

-- Add tenantId column to users table
ALTER TABLE `users` 
  ADD COLUMN `tenantId` VARCHAR(36) NULL AFTER `resetTokenExpiry`,
  ADD INDEX `users_tenantId_idx` (`tenantId`),
  ADD CONSTRAINT `users_tenantId_fkey` 
    FOREIGN KEY (`tenantId`) 
    REFERENCES `tenants`(`id`) 
    ON DELETE CASCADE 
    ON UPDATE CASCADE;
