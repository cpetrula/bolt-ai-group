-- Migration: Add Tenant model for multi-tenant architecture
-- Database: MySQL
-- Created: 2025-11-21

-- Create tenants table
CREATE TABLE IF NOT EXISTS `tenants` (
  `id` VARCHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `businessType` VARCHAR(100) NOT NULL DEFAULT 'salon',
  `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL') NOT NULL DEFAULT 'TRIAL',
  `settings` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
