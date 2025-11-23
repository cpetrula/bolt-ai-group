# Demo Salon Quick Start Guide

This guide walks you through setting up and testing the demo salon tenant.

## Prerequisites

1. **Database Setup**
   - MySQL database running (local or remote)
   - Database credentials configured

2. **Environment Configuration**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your MySQL connection string
   - Other fields can use default values for demo purposes

## Setup Steps

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Generate Prisma Client

```bash
npm run prisma:generate
```

### 3. Run Database Migrations (if not done already)

```bash
npm run prisma:migrate
```

This will create all necessary tables in your database.

### 4. Seed Demo Tenant

```bash
npm run seed:demo
```

Or alternatively:

```bash
node prisma/seed-demo.js
```

You should see output similar to:

```
Starting demo salon seed...
Creating demo tenant...
Demo tenant created: [tenant-id]
Creating demo services...
  Created service: Women's Haircut
  Created service: Men's Haircut
  ...
Creating demo employees...
  Created employee: Sarah Johnson (Senior Stylist)
  Created employee: Michael Chen (Stylist)
  Created employee: Emily Rodriguez (Color Specialist)
Assigning services to employees...
  Assigned all services to Sarah Johnson
  Assigned 4 services to Michael Chen
  Assigned 5 services to Emily Rodriguez

✅ Demo salon seed completed successfully!

Demo Salon Details:
  Tenant ID: [uuid]
  Name: Demo Salon
  Phone Number: +15555551234
  Services: 8
  Employees: 3
  Status: ACTIVE
```

## What Was Created

### Tenant
- **Name**: Demo Salon
- **Phone**: +1-555-555-1234
- **Status**: ACTIVE
- **Type**: salon

### Services (8 total)

| Service | Price | Duration |
|---------|-------|----------|
| Women's Haircut | $75 | 60 min |
| Men's Haircut | $50 | 45 min |
| Kids' Haircut | $40 | 45 min |
| Blowout | $60 | 45 min |
| Full Color | $150 | 120 min |
| Root Touch-Up | $95 | 90 min |
| Partial Highlights | $160 | 120 min |
| Full Highlights | $220 | 150 min |

### Employees (3 stylists)

1. **Sarah Johnson** - Senior Stylist
   - Schedule: Mon-Fri, 9am-5pm
   - Services: All 8 services
   
2. **Michael Chen** - Stylist
   - Schedule: Tue-Sat, 10am-6pm (10am-4pm Sat)
   - Services: Haircuts and Blowouts (4 services)
   
3. **Emily Rodriguez** - Color Specialist
   - Schedule: Mon, Wed-Sat (varied hours)
   - Services: Color services and Women's Haircut (5 services)

### AI Configuration
- Custom greeting message
- Business hours (Mon-Sat)
- Professional tone
- Full appointment management capabilities

## Verification

### Using Prisma Studio

```bash
npm run prisma:studio
```

This opens a web UI where you can:
1. Browse the `tenants` table - find "Demo Salon"
2. Check `services` - should see 8 services
3. Check `employees` - should see 3 employees
4. Check `employee_schedules` - verify work hours
5. Check `employee_services` - verify service assignments

### Using Database Query

```sql
-- Find demo tenant
SELECT * FROM tenants WHERE name = 'Demo Salon';

-- Check services
SELECT name, basePrice, durationMinutes 
FROM services 
WHERE tenantId = '[tenant-id-from-above]';

-- Check employees
SELECT name, role 
FROM employees 
WHERE tenantId = '[tenant-id-from-above]';
```

## Testing the Demo

### Frontend Display

1. Start the frontend: `cd frontend && npm run dev`
2. Navigate to `http://localhost:5173` (or configured port)
3. The home page should display: **+1-555-555-1234**
4. Verify it appears in:
   - Hero section demo call box
   - Final CTA section

### API Testing

You can test the demo tenant via API calls:

```bash
# Get demo services
curl http://localhost:3000/api/services?tenantId=[tenant-id]

# Get demo employees
curl http://localhost:3000/api/employees?tenantId=[tenant-id]

# Check availability (requires proper request body)
curl -X POST http://localhost:3000/api/ai/availability \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "[tenant-id]",
    "employeeId": "[employee-id]",
    "serviceId": "[service-id]",
    "date": "2024-01-15"
  }'
```

### Twilio Integration (when configured)

1. Configure Twilio credentials in `.env`:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_PHONE_NUMBER` (set to +15555551234 for demo)

2. Set up webhook URLs in Twilio console:
   - Voice: `https://your-domain.com/api/webhooks/twilio/voice`
   - SMS: `https://your-domain.com/api/webhooks/twilio/sms`

3. Call the demo number to test end-to-end

## Re-running the Seed

The seed script is **idempotent** - it can be safely re-run:

```bash
npm run seed:demo
```

This will:
1. Detect existing demo tenant
2. Delete it (with all related data)
3. Create fresh demo tenant with all data

Useful for:
- Resetting demo data after testing
- Updating demo configuration
- Troubleshooting

## Troubleshooting

### "Demo tenant already exists" error
- Normal behavior - script will delete and recreate
- If error persists, manually check database

### Database connection errors
- Verify `DATABASE_URL` in `.env`
- Ensure MySQL is running
- Check database permissions

### Missing services or employees
- Check console output for errors
- Verify Prisma schema matches seed script
- Try re-running with `npm run seed:demo`

### Phone number not showing on frontend
- Clear browser cache
- Verify frontend is running latest code
- Check `frontend/src/pages/HomePage.vue`

## Next Steps

After successful demo setup:

1. **Configure Twilio** (for live calling)
2. **Set up AI providers** (OpenAI, Vapi, etc.)
3. **Test appointment booking** via API or phone
4. **Review call logs** in admin portal
5. **Customize demo settings** as needed

## Resources

- Full documentation: `backend/prisma/DEMO_SEED_README.md`
- Seed script: `backend/prisma/seed-demo.js`
- Main README: Project root `/README.md`
- Prisma schema: `backend/prisma/schema.prisma`
