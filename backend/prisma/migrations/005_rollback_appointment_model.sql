-- Rollback appointment_addons table
DROP TABLE IF EXISTS `appointment_addons`;

-- Rollback appointments table
DROP TABLE IF EXISTS `appointments`;

-- Rollback AppointmentStatus enum
DROP TABLE IF EXISTS `_appointment_status_enum`;
