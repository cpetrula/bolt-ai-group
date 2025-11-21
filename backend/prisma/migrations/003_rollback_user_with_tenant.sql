-- Rollback: Remove tenant relationship from User model
-- Database: MySQL
-- Created: 2025-11-21

-- Remove foreign key constraint, index, and tenantId column from users table
ALTER TABLE `users` 
  DROP FOREIGN KEY `users_tenantId_fkey`,
  DROP INDEX `users_tenantId_idx`,
  DROP COLUMN `tenantId`;
