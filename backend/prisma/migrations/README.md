# Database Migrations

This directory contains SQL migration scripts for the authentication system.

## Migration Files

### 001_add_user_model.sql
Creates the `users` table with all required fields for authentication and 2FA.

**Fields:**
- `id` (VARCHAR(36), PRIMARY KEY) - UUID for user identification
- `email` (VARCHAR(191), UNIQUE) - User email address
- `password` (VARCHAR(255)) - Bcrypt hashed password
- `isEmailVerified` (BOOLEAN, default: false) - Email verification status
- `twoFactorEnabled` (BOOLEAN, default: false) - 2FA enabled flag
- `twoFactorSecret` (VARCHAR(255), nullable) - TOTP secret for 2FA
- `resetToken` (VARCHAR(255), nullable) - Password reset token
- `resetTokenExpiry` (DATETIME(3), nullable) - Password reset token expiration
- `createdAt` (DATETIME(3)) - Record creation timestamp
- `updatedAt` (DATETIME(3)) - Record update timestamp

**Indexes:**
- `users_email_key` - Unique index on email field

### 001_rollback_user_model.sql
Rollback script to drop the `users` table.

### 002_add_tenant_model.sql
Creates the `tenants` table for multi-tenant architecture.

**Fields:**
- `id` (VARCHAR(36), PRIMARY KEY) - UUID for tenant identification
- `name` (VARCHAR(255)) - Tenant/business name
- `businessType` (VARCHAR(100), default: 'salon') - Type of business
- `status` (ENUM: 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'TRIAL', default: 'TRIAL') - Tenant status
- `settings` (JSON, nullable) - Tenant-specific settings
- `createdAt` (DATETIME(3)) - Record creation timestamp
- `updatedAt` (DATETIME(3)) - Record update timestamp

### 002_rollback_tenant_model.sql
Rollback script to drop the `tenants` table.

### 003_update_user_with_tenant.sql
Updates the `users` table to add tenant relationship.

**Changes:**
- Adds `tenantId` (VARCHAR(36), nullable) - Foreign key to tenants table
- Adds index on `tenantId`
- Adds foreign key constraint with CASCADE on delete

### 003_rollback_user_with_tenant.sql
Rollback script to remove tenant relationship from users table.

### 004_add_employee_and_service_models.sql
Creates tables for employee and service management.

**Tables:**
- `employees` - Stores employee/contractor information
- `employee_schedules` - Stores employee work schedules (day of week, start/end times)
- `services` - Stores services offered by the salon
- `service_addons` - Stores optional add-ons for services
- `employee_services` - Junction table linking employees to services they can perform

### 004_rollback_employee_and_service_models.sql
Rollback script to drop employee and service tables.

## Running Migrations

### Using MySQL CLI

```bash
# Forward migration (create users table)
mysql -u your_username -p your_database < backend/prisma/migrations/001_add_user_model.sql

# Rollback (drop users table)
mysql -u your_username -p your_database < backend/prisma/migrations/001_rollback_user_model.sql
```

### Using MySQL Workbench or phpMyAdmin
1. Connect to your database
2. Open the SQL file
3. Execute the script

### Using Prisma (Recommended)

If you have a running database configured in `.env`:

```bash
cd backend
npm run prisma:migrate
```

This will:
1. Read the Prisma schema
2. Generate migration files automatically
3. Apply migrations to the database
4. Update the Prisma Client

## Database Configuration

Ensure your `DATABASE_URL` is set in `backend/.env`:

```env
DATABASE_URL="mysql://username:password@localhost:3306/bolt_ai_salon"
```

## Notes

- **Character Set**: Tables use `utf8mb4` with `utf8mb4_unicode_ci` collation for full Unicode support
- **Engine**: Uses InnoDB for transaction support and foreign key constraints
- **Timestamps**: Use MySQL DATETIME(3) for millisecond precision
- **UUIDs**: User IDs are stored as VARCHAR(36) to accommodate UUID format
- **Email Length**: Email field is VARCHAR(191) to support unique indexes in MySQL with utf8mb4

## Migration History

| Version | Description | Date |
|---------|-------------|------|
| 001 | Add User model for authentication | 2025-11-21 |
| 002 | Add Tenant model for multi-tenant architecture | 2025-11-21 |
| 003 | Update User model with tenant relationship | 2025-11-21 |
| 004 | Add Employee and Service models | 2025-11-21 |

## Troubleshooting

### Error: Table already exists
If you get an error that the table already exists, either:
1. Drop the table manually and re-run the migration
2. The migration has already been applied - no action needed

### Error: Database connection failed
- Verify DATABASE_URL in your `.env` file
- Ensure MySQL server is running
- Check username/password credentials
- Verify database exists

### Error: Character set issues
If you encounter character set errors, ensure your MySQL server supports utf8mb4:
```sql
SHOW VARIABLES LIKE 'character_set%';
```

## Best Practices

1. **Always backup** your database before running migrations in production
2. **Test migrations** in a development environment first
3. **Version control** all migration files
4. **Document** any manual data transformations needed
5. **Use transactions** when possible (InnoDB supports this)

## Future Migrations

When adding new migrations:
1. Increment the version number (002, 003, etc.)
2. Create both forward and rollback scripts
3. Update this README with the migration details
4. Test thoroughly before production deployment
