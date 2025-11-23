# Database Schema Documentation

## Overview

The Bolt AI Group application uses MySQL as its primary database with Prisma as the ORM. The database follows a multi-tenant architecture where all data is partitioned by `tenantId` to ensure complete data isolation between different businesses.

## Database Technology

- **Database**: MySQL 8.0+
- **ORM**: Prisma
- **Migration Tool**: Prisma Migrate
- **Connection Pooling**: Managed by Prisma Client

## Multi-Tenant Architecture

### Tenant Isolation Strategy
- Every business-related table includes a `tenantId` field
- All queries are automatically scoped to the authenticated user's tenant
- Foreign key relationships maintain referential integrity within tenant boundaries
- Cascade deletes ensure complete data cleanup when a tenant is removed

### Indexing Strategy
- All `tenantId` columns are indexed for performance
- Composite indexes on frequently queried combinations (e.g., `tenantId + appointmentDate`)
- Foreign key columns are indexed

## Entity Relationship Diagram

```
┌─────────────┐
│   Tenant    │
└──────┬──────┘
       │
       ├─────────────┬─────────────┬─────────────┬─────────────┐
       │             │             │             │             │
       ▼             ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│   User   │  │ Employee │  │ Service  │  │   Call   │  │Notifica- │
│          │  │          │  │          │  │   Log    │  │  tion    │
└──────────┘  └────┬─────┘  └────┬─────┘  └──────────┘  └──────────┘
                   │             │
                   │             │
              ┌────┴─────┬───────┴─────┬──────────┐
              │          │             │          │
              ▼          ▼             ▼          ▼
      ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
      │Employee  │ │Employee  │ │ Service  │ │Appoint-  │
      │Schedule  │ │ Service  │ │  Addon   │ │  ment    │
      └──────────┘ └──────────┘ └──────────┘ └────┬─────┘
                                                   │
                                                   ▼
                                            ┌──────────┐
                                            │Appoint-  │
                                            │mentAddon │
                                            └──────────┘
              ┌────────────────┐
              │ Subscription   │
              └────────────────┘
```

## Core Tables

### Tenants

Represents each business (salon, spa, etc.) in the system.

**Table**: `tenants`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique tenant identifier |
| `name` | VARCHAR(255) | NOT NULL | Business name |
| `businessType` | VARCHAR(50) | DEFAULT 'salon' | Type of business |
| `status` | ENUM | DEFAULT 'TRIAL' | Tenant status (ACTIVE, INACTIVE, SUSPENDED, TRIAL) |
| `settings` | JSON | NULLABLE | Tenant-specific configuration |
| `twilioPhoneNumber` | VARCHAR(20) | UNIQUE, NULLABLE | Assigned Twilio phone number |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Enums**:
- `TenantStatus`: ACTIVE, INACTIVE, SUSPENDED, TRIAL

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `twilioPhoneNumber`

**Settings JSON Structure**:
```json
{
  "aiAssistant": {
    "greeting": "Thank you for calling [Business Name]...",
    "tone": "professional",
    "businessHours": {
      "monday": "9:00 AM - 6:00 PM",
      "tuesday": "9:00 AM - 6:00 PM",
      "wednesday": "9:00 AM - 6:00 PM",
      "thursday": "9:00 AM - 6:00 PM",
      "friday": "9:00 AM - 6:00 PM",
      "saturday": "10:00 AM - 4:00 PM",
      "sunday": "Closed"
    }
  },
  "notifications": {
    "smsEnabled": true,
    "emailEnabled": true
  }
}
```

**Relationships**:
- ONE-TO-MANY with `users`
- ONE-TO-MANY with `employees`
- ONE-TO-MANY with `services`
- ONE-TO-MANY with `appointments`
- ONE-TO-ONE with `subscription`
- ONE-TO-MANY with `callLogs`
- ONE-TO-MANY with `notifications`

---

### Users

User accounts associated with tenants.

**Table**: `users`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique user identifier |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | User email (login credential) |
| `password` | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| `isEmailVerified` | BOOLEAN | DEFAULT false | Email verification status |
| `twoFactorEnabled` | BOOLEAN | DEFAULT false | 2FA enabled flag |
| `twoFactorSecret` | VARCHAR(255) | NULLABLE | TOTP secret for 2FA |
| `resetToken` | VARCHAR(255) | NULLABLE | Password reset token |
| `resetTokenExpiry` | DATETIME | NULLABLE | Reset token expiration |
| `tenantId` | VARCHAR(36) | FOREIGN KEY, NULLABLE | Associated tenant |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `email`
- INDEX on `tenantId`

**Relationships**:
- MANY-TO-ONE with `tenants` (CASCADE on delete)

**Security Notes**:
- Passwords hashed with bcrypt (12 salt rounds)
- Reset tokens expire after 1 hour
- 2FA uses TOTP with 30-second codes

---

### Employees

Staff members who provide services.

**Table**: `employees`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique employee identifier |
| `tenantId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Associated tenant |
| `name` | VARCHAR(255) | NOT NULL | Employee full name |
| `role` | VARCHAR(100) | NULLABLE | Job title (e.g., "Senior Stylist") |
| `phone` | VARCHAR(20) | NULLABLE | Contact phone number |
| `email` | VARCHAR(255) | NULLABLE | Contact email |
| `isActive` | BOOLEAN | DEFAULT true | Active/inactive status |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`

**Relationships**:
- MANY-TO-ONE with `tenants` (CASCADE on delete)
- ONE-TO-MANY with `employeeSchedules`
- ONE-TO-MANY with `employeeServices`
- ONE-TO-MANY with `appointments`

---

### Employee Schedules

Weekly work schedules for employees.

**Table**: `employee_schedules`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique schedule identifier |
| `tenantId` | VARCHAR(36) | NOT NULL | Associated tenant |
| `employeeId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Associated employee |
| `dayOfWeek` | INT | NOT NULL | Day (0=Sunday, 1=Monday, ..., 6=Saturday) |
| `startTime` | VARCHAR(5) | NOT NULL | Shift start time (HH:MM format, e.g., "09:00") |
| `endTime` | VARCHAR(5) | NOT NULL | Shift end time (HH:MM format, e.g., "17:00") |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`
- INDEX on `employeeId`

**Relationships**:
- MANY-TO-ONE with `employees` (CASCADE on delete)

**Notes**:
- Multiple schedules per employee per day are supported (split shifts)
- Times stored in 24-hour format (HH:MM)

---

### Services

Service catalog (haircuts, coloring, etc.).

**Table**: `services`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique service identifier |
| `tenantId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Associated tenant |
| `name` | VARCHAR(255) | NOT NULL | Service name |
| `description` | TEXT | NULLABLE | Service description |
| `basePrice` | DECIMAL(10,2) | NOT NULL | Service price in dollars |
| `durationMinutes` | INT | NOT NULL | Service duration in minutes |
| `isActive` | BOOLEAN | DEFAULT true | Active/inactive status |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`

**Relationships**:
- MANY-TO-ONE with `tenants` (CASCADE on delete)
- ONE-TO-MANY with `serviceAddons`
- ONE-TO-MANY with `employeeServices`
- ONE-TO-MANY with `appointments`

**Common Service Examples** (Salon):
- Women's Haircut - $75 - 60 min
- Men's Haircut - $50 - 45 min
- Full Color - $150 - 120 min
- Highlights - $220 - 150 min

---

### Service Addons

Optional add-ons for services.

**Table**: `service_addons`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique addon identifier |
| `tenantId` | VARCHAR(36) | NOT NULL | Associated tenant |
| `serviceId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Parent service |
| `name` | VARCHAR(255) | NOT NULL | Addon name |
| `price` | DECIMAL(10,2) | NOT NULL | Addon price in dollars |
| `durationMinutes` | INT | NOT NULL | Additional time required |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`
- INDEX on `serviceId`

**Relationships**:
- MANY-TO-ONE with `services` (CASCADE on delete)

**Common Addon Examples**:
- Deep Conditioning Treatment - $30 - 20 min
- Olaplex Treatment - $40 - 20 min
- Beard Trim - $15 - 15 min

---

### Employee Services

Junction table mapping employees to services they can perform.

**Table**: `employee_services`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique mapping identifier |
| `tenantId` | VARCHAR(36) | NOT NULL | Associated tenant |
| `employeeId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Employee |
| `serviceId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Service |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on (`employeeId`, `serviceId`)
- INDEX on `tenantId`
- INDEX on `employeeId`
- INDEX on `serviceId`

**Relationships**:
- MANY-TO-ONE with `employees` (CASCADE on delete)
- MANY-TO-ONE with `services` (CASCADE on delete)

---

### Appointments

Scheduled appointments for customers.

**Table**: `appointments`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique appointment identifier |
| `tenantId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Associated tenant |
| `employeeId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Assigned employee |
| `serviceId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Requested service |
| `customerName` | VARCHAR(255) | NOT NULL | Customer full name |
| `customerEmail` | VARCHAR(255) | NULLABLE | Customer email |
| `customerPhone` | VARCHAR(20) | NULLABLE | Customer phone number |
| `appointmentDate` | DATE | NOT NULL | Appointment date |
| `startTime` | VARCHAR(5) | NOT NULL | Start time (HH:MM format) |
| `endTime` | VARCHAR(5) | NOT NULL | End time (HH:MM format) |
| `status` | ENUM | DEFAULT 'SCHEDULED' | Appointment status |
| `totalPrice` | DECIMAL(10,2) | NOT NULL | Total price (service + addons) |
| `totalDuration` | INT | NOT NULL | Total duration in minutes |
| `notes` | TEXT | NULLABLE | Additional notes |
| `cancellationReason` | TEXT | NULLABLE | Reason if cancelled |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Enums**:
- `AppointmentStatus`: SCHEDULED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`
- INDEX on `employeeId`
- INDEX on `serviceId`
- INDEX on `appointmentDate`
- INDEX on `status`

**Relationships**:
- MANY-TO-ONE with `tenants` (CASCADE on delete)
- MANY-TO-ONE with `employees` (CASCADE on delete)
- MANY-TO-ONE with `services` (CASCADE on delete)
- ONE-TO-MANY with `appointmentAddons`

**Business Rules**:
- `endTime` is calculated as `startTime + totalDuration`
- `totalPrice` = service basePrice + sum of addon prices
- `totalDuration` = service duration + sum of addon durations

---

### Appointment Addons

Selected addons for appointments.

**Table**: `appointment_addons`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique record identifier |
| `tenantId` | VARCHAR(36) | NOT NULL | Associated tenant |
| `appointmentId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Parent appointment |
| `addonId` | VARCHAR(36) | NOT NULL | Service addon reference |
| `name` | VARCHAR(255) | NOT NULL | Addon name (snapshot) |
| `price` | DECIMAL(10,2) | NOT NULL | Addon price (snapshot) |
| `durationMinutes` | INT | NOT NULL | Addon duration (snapshot) |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`
- INDEX on `appointmentId`

**Relationships**:
- MANY-TO-ONE with `appointments` (CASCADE on delete)

**Notes**:
- Addon details are snapshot at booking time (name, price, duration)
- This preserves historical accuracy if addon definitions change

---

### Subscriptions

Stripe subscription information for tenants.

**Table**: `subscriptions`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique subscription identifier |
| `tenantId` | VARCHAR(36) | UNIQUE, FOREIGN KEY, NOT NULL | Associated tenant |
| `stripeCustomerId` | VARCHAR(255) | UNIQUE, NOT NULL | Stripe customer ID |
| `stripeSubscriptionId` | VARCHAR(255) | UNIQUE, NULLABLE | Stripe subscription ID |
| `status` | ENUM | DEFAULT 'TRIALING' | Subscription status |
| `plan` | ENUM | DEFAULT 'MONTHLY' | Subscription plan |
| `currentPeriodStart` | DATETIME | NULLABLE | Current billing period start |
| `currentPeriodEnd` | DATETIME | NULLABLE | Current billing period end |
| `cancelAtPeriodEnd` | BOOLEAN | DEFAULT false | Scheduled cancellation flag |
| `trialEnd` | DATETIME | NULLABLE | Trial period end date |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Enums**:
- `SubscriptionStatus`: ACTIVE, INACTIVE, PAST_DUE, CANCELED, UNPAID, TRIALING
- `SubscriptionPlan`: MONTHLY, YEARLY

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `tenantId`
- UNIQUE on `stripeCustomerId`
- UNIQUE on `stripeSubscriptionId`
- INDEX on `status`

**Relationships**:
- ONE-TO-ONE with `tenants` (CASCADE on delete)

**Pricing**:
- MONTHLY: $295/month
- YEARLY: $2,832/year (20% discount)

**Trial Period**: 14 days default

---

### Call Logs

Telephony call records.

**Table**: `call_logs`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique log identifier |
| `tenantId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Associated tenant |
| `callSid` | VARCHAR(255) | UNIQUE, NOT NULL | Twilio call SID |
| `fromNumber` | VARCHAR(20) | NOT NULL | Caller's phone number |
| `toNumber` | VARCHAR(20) | NOT NULL | Called number (tenant's number) |
| `startTime` | DATETIME | NOT NULL | Call start timestamp |
| `endTime` | DATETIME | NULLABLE | Call end timestamp |
| `durationSeconds` | INT | NULLABLE | Call duration in seconds |
| `callReason` | ENUM | DEFAULT 'OTHER' | Call purpose/intent |
| `notes` | TEXT | NULLABLE | Call summary/transcript |
| `recordingUrl` | VARCHAR(500) | NULLABLE | URL to call recording |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Enums**:
- `CallReason`: SETUP_APPOINTMENT, CANCEL_APPOINTMENT, MODIFY_APPOINTMENT, GET_HOURS, GET_PRICING, OTHER

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE on `callSid`
- INDEX on `tenantId`
- INDEX on `startTime`

**Relationships**:
- MANY-TO-ONE with `tenants` (CASCADE on delete)

---

### Notifications

SMS and email notification tracking.

**Table**: `notifications`

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | VARCHAR(36) | PRIMARY KEY, UUID | Unique notification identifier |
| `tenantId` | VARCHAR(36) | FOREIGN KEY, NOT NULL | Associated tenant |
| `type` | ENUM | NOT NULL | Notification type |
| `recipient` | VARCHAR(255) | NOT NULL | Phone number or email |
| `message` | TEXT | NOT NULL | Message content |
| `status` | ENUM | DEFAULT 'QUEUED' | Delivery status |
| `relatedAppointmentId` | VARCHAR(36) | NULLABLE | Related appointment (if any) |
| `sentAt` | DATETIME | NULLABLE | Sent timestamp |
| `failureReason` | TEXT | NULLABLE | Error message if failed |
| `createdAt` | DATETIME | NOT NULL | Record creation timestamp |
| `updatedAt` | DATETIME | NOT NULL | Last update timestamp |

**Enums**:
- `NotificationType`: SMS, EMAIL
- `NotificationStatus`: QUEUED, SENT, FAILED

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `tenantId`
- INDEX on `status`
- INDEX on `type`

**Relationships**:
- MANY-TO-ONE with `tenants` (CASCADE on delete)

---

## Data Types

### UUID Format
All IDs use UUID v4 format: `550e8400-e29b-41d4-a716-446655440000`

### Date and Time
- **DATE**: YYYY-MM-DD (e.g., "2024-01-15")
- **DATETIME**: ISO 8601 format with timezone (e.g., "2024-01-15T14:30:00.000Z")
- **TIME**: HH:MM 24-hour format (e.g., "14:30")

### Phone Numbers
- E.164 format: +[country code][number] (e.g., "+15551234567")

### Prices
- DECIMAL(10,2): Up to $99,999,999.99
- Stored in dollars (not cents)

### Enums
All enums are defined in the Prisma schema and enforced at the database level.

---

## Indexes and Performance

### Primary Indexes
All tables have a UUID primary key.

### Foreign Key Indexes
All foreign key columns are indexed for join performance.

### Multi-Tenant Indexes
All `tenantId` columns are indexed to optimize tenant-scoped queries.

### Composite Indexes
- `(tenantId, appointmentDate)` on `appointments` - for date range queries
- `(tenantId, status)` on `appointments` - for status filtering
- `(employeeId, serviceId)` on `employee_services` - enforces uniqueness

### Full-Text Indexes
Not currently implemented. Future consideration for:
- Service descriptions
- Appointment notes
- Call log notes

---

## Query Patterns

### Tenant-Scoped Queries
All queries must include tenant filtering:

```sql
SELECT * FROM appointments 
WHERE tenantId = 'tenant-uuid' 
  AND appointmentDate BETWEEN '2024-01-01' AND '2024-01-31';
```

### Appointment Availability
Check for conflicts when booking:

```sql
SELECT * FROM appointments
WHERE tenantId = 'tenant-uuid'
  AND employeeId = 'employee-uuid'
  AND appointmentDate = '2024-01-20'
  AND status NOT IN ('CANCELLED', 'NO_SHOW')
  AND (
    (startTime <= '14:00' AND endTime > '14:00')
    OR (startTime < '15:00' AND endTime >= '15:00')
  );
```

### Employee Schedule Check
Verify employee is working:

```sql
SELECT * FROM employee_schedules
WHERE employeeId = 'employee-uuid'
  AND dayOfWeek = 1  -- Monday
  AND startTime <= '14:00'
  AND endTime >= '15:00';
```

---

## Migrations

### Migration Strategy
Prisma Migrate handles all schema changes:

```bash
# Create migration
npx prisma migrate dev --name add_new_field

# Apply to production
npx prisma migrate deploy
```

### Migration History
Migrations are stored in `backend/prisma/migrations/` directory.

### Rollback Strategy
Prisma does not support automatic rollbacks. For rollback:
1. Create a new migration that reverses changes
2. Apply the reversal migration

---

## Data Retention

### Active Data
All active tenant data is retained indefinitely.

### Deleted Tenants
When a tenant is deleted:
- All related data is cascade deleted
- Consider implementing soft deletes for compliance

### Call Logs
Retained for reporting and compliance:
- Minimum 1 year retention recommended
- Archival strategy for older records

### Notifications
Retained for audit trail:
- Success/failure tracking
- Delivery timestamps

---

## Backup and Recovery

### Backup Strategy
Recommended approach:
- Daily automated backups
- Point-in-time recovery capability
- Offsite backup storage

### Backup Targets
- Full database backup
- Transaction logs for point-in-time recovery

### Recovery Testing
- Monthly recovery drills
- Documented recovery procedures

---

## Security Considerations

### Data Encryption
- **At Rest**: Database encryption (MySQL enterprise or provider-specific)
- **In Transit**: SSL/TLS for database connections

### Access Control
- Database users with minimal required privileges
- Application-level access control via multi-tenant middleware
- No direct database access from frontend

### Sensitive Data
- Passwords: Bcrypt hashed (never stored plain text)
- 2FA secrets: Encrypted at rest
- Payment data: Never stored (handled by Stripe)

### Audit Logging
Current implementation tracks:
- Record creation (`createdAt`)
- Record updates (`updatedAt`)

Future enhancements:
- User action audit log
- Data change history

---

## Performance Optimization

### Query Optimization
- Use Prisma's `select` to fetch only needed fields
- Implement pagination on all list queries
- Use `include` judiciously (avoid N+1 queries)

### Connection Pooling
Prisma manages connection pooling automatically:
- Default pool size: 5 connections
- Configurable via `connection_limit` in DATABASE_URL

### Caching Strategy
Future consideration:
- Redis for tenant settings
- Query result caching for frequently accessed data

---

## Data Seeding

### Demo Data
Demo tenant seeding script: `backend/prisma/seed-demo.js`

Includes:
- Demo tenant with active status
- 3 sample employees with schedules
- 8 common salon services
- Service addons
- AI assistant configuration

### Production Data
New tenants get:
- Default service catalog (configurable)
- Empty employee roster
- Trial subscription status

---

## Schema Versioning

Current schema version: **v1.0**

Schema changes are tracked through Prisma migrations in:
`backend/prisma/migrations/`

---

## Troubleshooting

### Common Issues

**Issue**: Slow queries on appointments table
- **Solution**: Ensure `appointmentDate` and `tenantId` are indexed
- **Check**: Run `EXPLAIN` on slow queries

**Issue**: Duplicate employee services
- **Solution**: UNIQUE constraint on `(employeeId, serviceId)` prevents this
- **Check**: Verify constraint exists in schema

**Issue**: Orphaned records
- **Solution**: CASCADE deletes handle this automatically
- **Check**: Verify foreign key constraints with `ON DELETE CASCADE`

---

## Future Enhancements

### Planned Schema Changes
- [ ] Add `deleted_at` for soft deletes
- [ ] Add audit log table for data changes
- [ ] Add employee availability exceptions (vacations, time off)
- [ ] Add customer table (currently inline in appointments)
- [ ] Add waiting list table
- [ ] Add inventory tracking for product-based businesses

### Performance Enhancements
- [ ] Partitioning for large tables (call_logs, notifications)
- [ ] Archival strategy for historical data
- [ ] Read replicas for reporting queries

---

## Database Administration

### Maintenance Tasks
- **Daily**: Automated backups
- **Weekly**: Index optimization check
- **Monthly**: Growth analysis and capacity planning
- **Quarterly**: Archival of old data

### Monitoring Metrics
- Query performance
- Connection pool usage
- Table sizes and growth rates
- Index usage statistics

### Useful Queries

**Table sizes**:
```sql
SELECT 
  table_name,
  ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'database_name'
ORDER BY size_mb DESC;
```

**Index usage**:
```sql
SELECT 
  table_name,
  index_name,
  cardinality
FROM information_schema.statistics
WHERE table_schema = 'database_name'
ORDER BY table_name, cardinality DESC;
```

---

## Prisma Schema Reference

The complete Prisma schema is located at:
`backend/prisma/schema.prisma`

To regenerate Prisma Client after schema changes:
```bash
npx prisma generate
```

To view the database in Prisma Studio:
```bash
npx prisma studio
```
