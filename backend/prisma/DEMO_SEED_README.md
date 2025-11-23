# Demo Salon Seed Script

This directory contains the seed script for creating a demo salon tenant for the public demo phone number.

## What Gets Created

The `seed-demo.js` script creates:

1. **Demo Tenant**
   - Name: "Demo Salon"
   - Status: ACTIVE
   - Phone Number: +1-555-555-1234
   - Business Type: salon

2. **Services** (8 total)
   - Women's Haircut ($75, 60 min)
   - Men's Haircut ($50, 45 min)
   - Kids' Haircut ($40, 45 min)
   - Blowout ($60, 45 min)
   - Full Color ($150, 120 min)
   - Root Touch-Up ($95, 90 min)
   - Partial Highlights ($160, 120 min)
   - Full Highlights ($220, 150 min)

3. **Service Add-ons**
   - Deep Conditioning Treatment ($30, 20 min)
   - Olaplex Treatment ($40, 20 min)
   - Beard Trim ($15, 15 min)

4. **Demo Employees** (3 stylists)
   - **Sarah Johnson** (Senior Stylist)
     - Works Mon-Fri, 9am-5pm
     - Can perform all services
   
   - **Michael Chen** (Stylist)
     - Works Tue-Sat, 10am-6pm (10am-4pm on Sat)
     - Can perform haircuts and blowouts
   
   - **Emily Rodriguez** (Color Specialist)
     - Works Mon, Wed-Sat (varied hours)
     - Can perform color services and women's haircuts

5. **AI Configuration**
   - Custom greeting message
   - Business hours (Mon-Sat)
   - Professional tone settings
   - Configured capabilities

## Prerequisites

- MySQL database running and accessible
- Database connection string configured in `.env` file
- Prisma client generated (`npm run prisma:generate`)

## Usage

### Run the seed script

From the backend directory:

```bash
cd /home/runner/work/bolt-ai-group/bolt-ai-group/backend
node prisma/seed-demo.js
```

### Verify the demo tenant

After running the script, you should see output confirming:
- Tenant created
- Services created
- Employees created
- Service assignments completed

### Re-run the script

The script is **idempotent** - it will:
1. Check if a demo tenant already exists
2. Delete the existing demo tenant if found
3. Create a fresh demo tenant with all data

This allows you to safely re-run the script to reset the demo data.

## Integration with Application

### Backend
The demo tenant can be accessed by:
- Phone number: `+1-555-555-1234`
- Tenant name: "Demo Salon"

### Frontend
The demo phone number should be displayed on the home page at:
- `/home/runner/work/bolt-ai-group/bolt-ai-group/frontend/src/pages/HomePage.vue`

Update the phone number in the following locations:
- Hero section demo call box (line ~50)
- Final CTA section (line ~306)

### Telephony Integration
When calls come in to the demo number:
1. Twilio webhook identifies the tenant by phone number
2. AI assistant is configured with demo tenant settings
3. Demo services and employees are available for booking

## Testing

To test the demo tenant:

1. **Via API**: Use the tenant ID from the seed output to make API calls
2. **Via Twilio**: Call the demo number if Twilio is configured
3. **Via Admin Portal**: Login to view demo tenant data

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` in `.env` file
- Ensure MySQL is running
- Check database permissions

### Duplicate Tenant Error
- The script automatically handles existing demo tenants
- If you see errors, check database constraints

### Service Creation Fails
- Verify Prisma schema matches the seed data structure
- Check that all required fields are provided

## Future Enhancements

Potential improvements to the demo seed:
- Add sample appointments for testing
- Include demo call logs
- Create demo user account for admin portal access
- Add more varied employee schedules
- Include seasonal service offerings
