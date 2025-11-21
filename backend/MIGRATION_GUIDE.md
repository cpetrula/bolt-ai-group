# Database Migration Guide for Billing Module

## Prerequisites

1. Ensure you have a MySQL database running
2. Ensure DATABASE_URL is configured in your `.env` file

## Migration Steps

### 1. Review the Prisma Schema Changes

The following changes were made to `prisma/schema.prisma`:

- Added `SubscriptionStatus` enum (ACTIVE, INACTIVE, PAST_DUE, CANCELED, UNPAID, TRIALING)
- Added `SubscriptionPlan` enum (MONTHLY, YEARLY)
- Added `Subscription` model with:
  - Tenant relationship (one-to-one)
  - Stripe customer and subscription IDs
  - Status and plan tracking
  - Billing period dates
  - Trial period support
  - Cancellation tracking

### 2. Generate and Apply Migration

Run the following command to create and apply the migration:

```bash
cd backend
npx prisma migrate dev --name add_subscriptions
```

This will:
1. Create a new migration file in `prisma/migrations/`
2. Apply the migration to your database
3. Regenerate the Prisma Client

### 3. Verify Migration

Check that the migration was successful:

```bash
npx prisma studio
```

You should see the new `subscriptions` table with all the fields.

### 4. Alternative: Create Migration Only

If you want to review the migration SQL before applying:

```bash
npx prisma migrate dev --name add_subscriptions --create-only
```

Then review the generated SQL file in `prisma/migrations/` and apply with:

```bash
npx prisma migrate deploy
```

## Production Migration

For production environments:

```bash
npx prisma migrate deploy
```

This applies pending migrations without prompting.

## Rollback

If you need to rollback the migration, you'll need to:

1. Delete the migration folder
2. Manually drop the subscriptions table from the database
3. Run `npx prisma generate` to update the client

## Troubleshooting

### Error: "DATABASE_URL environment variable not found"

Solution: Ensure your `.env` file contains:
```
DATABASE_URL="mysql://user:password@localhost:3306/bolt_ai_salon"
```

### Error: "Can't reach database server"

Solution: Ensure your MySQL server is running and accessible.

### Error: "Table already exists"

Solution: If the table already exists, you can either:
- Drop it manually: `DROP TABLE subscriptions;`
- Or mark the migration as applied: `npx prisma migrate resolve --applied <migration-name>`
