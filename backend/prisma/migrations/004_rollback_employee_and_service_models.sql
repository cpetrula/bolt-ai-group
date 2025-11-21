-- Rollback: 004_rollback_employee_and_service_models
-- Description: Drops employees, employee_schedules, services, service_addons, and employee_services tables

-- Drop tables in reverse order (to handle foreign key constraints)
DROP TABLE IF EXISTS `employee_services`;
DROP TABLE IF EXISTS `service_addons`;
DROP TABLE IF EXISTS `employee_schedules`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `employees`;
