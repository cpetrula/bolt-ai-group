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
