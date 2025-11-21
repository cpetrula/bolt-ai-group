-- Migration: Add User model for authentication
-- Database: MySQL
-- Created: 2025-11-21

-- Create users table
CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(36) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
  `twoFactorEnabled` BOOLEAN NOT NULL DEFAULT false,
  `twoFactorSecret` VARCHAR(255) NULL,
  `resetToken` VARCHAR(255) NULL,
  `resetTokenExpiry` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
