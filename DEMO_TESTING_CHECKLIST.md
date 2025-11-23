# Demo Salon Testing Checklist

Use this checklist to verify the demo salon setup is working correctly.

## Pre-Testing Setup

- [ ] Database is running and accessible
- [ ] Environment variables configured in `backend/.env`
- [ ] Dependencies installed: `cd backend && npm install`
- [ ] Prisma client generated: `npm run prisma:generate`
- [ ] Database migrations applied: `npm run prisma:migrate`

## Seed Script Testing

### Script Execution
- [ ] Run seed script: `npm run seed:demo`
- [ ] No errors in console output
- [ ] Success message displayed
- [ ] Tenant ID shown in output

### Expected Output
- [ ] "Demo tenant created" message
- [ ] 8 services created (Women's Haircut through Full Highlights)
- [ ] 3 employees created (Sarah, Michael, Emily)
- [ ] Service assignments completed
- [ ] Summary shows: 8 services, 3 employees, ACTIVE status

### Idempotency Test
- [ ] Run seed script again: `npm run seed:demo`
- [ ] "Demo tenant already exists. Deleting..." message shown
- [ ] Script completes successfully
- [ ] New tenant created with fresh data

## Database Verification

### Using Prisma Studio
- [ ] Open Prisma Studio: `npm run prisma:studio`
- [ ] Navigate to `tenants` table
- [ ] Find "Demo Salon" entry
- [ ] Verify fields:
  - [ ] name: "Demo Salon"
  - [ ] status: ACTIVE
  - [ ] businessType: "salon"
  - [ ] twilioPhoneNumber: "+15555551234"
  - [ ] settings (JSON): Contains greeting and businessHours

### Services Verification
- [ ] Open `services` table in Prisma Studio
- [ ] Filter by tenant ID (from Demo Salon)
- [ ] Verify 8 services exist:
  - [ ] Women's Haircut ($75, 60 min)
  - [ ] Men's Haircut ($50, 45 min)
  - [ ] Kids' Haircut ($40, 45 min)
  - [ ] Blowout ($60, 45 min)
  - [ ] Full Color ($150, 120 min)
  - [ ] Root Touch-Up ($95, 90 min)
  - [ ] Partial Highlights ($160, 120 min)
  - [ ] Full Highlights ($220, 150 min)

### Service Addons Verification
- [ ] Open `service_addons` table
- [ ] Verify addons exist:
  - [ ] Deep Conditioning Treatment ($30, 20 min)
  - [ ] Olaplex Treatment ($40, 20 min)
  - [ ] Beard Trim ($15, 15 min)

### Employees Verification
- [ ] Open `employees` table
- [ ] Verify 3 employees:
  - [ ] Sarah Johnson (Senior Stylist)
  - [ ] Michael Chen (Stylist)
  - [ ] Emily Rodriguez (Color Specialist)
- [ ] All have isActive: true

### Employee Schedules Verification
- [ ] Open `employee_schedules` table
- [ ] Sarah: 5 schedules (Mon-Fri, 9am-5pm)
- [ ] Michael: 5 schedules (Tue-Sat, varied hours)
- [ ] Emily: 5 schedules (Mon, Wed-Sat, varied hours)

### Employee Services Verification
- [ ] Open `employee_services` table
- [ ] Sarah: 8 service assignments (all services)
- [ ] Michael: 4 assignments (haircuts + blowout)
- [ ] Emily: 5 assignments (color services + women's haircut)

## Frontend Verification

### Development Server
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Server starts without errors
- [ ] Access http://localhost:5173 (or configured port)

### Home Page - Hero Section
- [ ] Hero section loads correctly
- [ ] Demo phone number visible: "+1-555-555-1234"
- [ ] Phone number is clickable (tel: link)
- [ ] "Try it now!" text displayed
- [ ] Call-to-action buttons present

### Home Page - Final CTA Section
- [ ] Scroll to bottom CTA section
- [ ] Demo phone number displayed: "+1-555-555-1234"
- [ ] "Try Demo" button with phone number
- [ ] Link is clickable

### FAQ Page
- [ ] Navigate to FAQ page
- [ ] Search for phone number reference
- [ ] Verify demo number is displayed (if present)

### Mobile Responsiveness
- [ ] Open browser dev tools
- [ ] Test mobile viewport (375px width)
- [ ] Phone number visible and readable
- [ ] Click-to-call works on mobile

## Backend API Testing

### Prerequisites
- [ ] Backend server running: `cd backend && npm run dev`
- [ ] Server listening on configured port (default 3000)
- [ ] No startup errors

### Get Tenant Info
```bash
# Replace [tenant-id] with actual ID from seed output
curl http://localhost:3000/api/tenants/[tenant-id]
```
- [ ] Returns 200 OK
- [ ] Response includes tenant name "Demo Salon"
- [ ] Phone number matches: "+15555551234"

### Get Services
```bash
curl http://localhost:3000/api/services?tenantId=[tenant-id]
```
- [ ] Returns 200 OK
- [ ] Response contains 8 services
- [ ] All prices match specification
- [ ] All durations correct

### Get Employees
```bash
curl http://localhost:3000/api/employees?tenantId=[tenant-id]
```
- [ ] Returns 200 OK
- [ ] Response contains 3 employees
- [ ] All employees are active
- [ ] Roles are correct

### Get Employee Schedules
```bash
curl http://localhost:3000/api/employees/[employee-id]/schedule?tenantId=[tenant-id]
```
- [ ] Returns 200 OK
- [ ] Schedules match seed data
- [ ] Time formats are correct (HH:MM)

## Integration Testing

### AI Availability Check (if AI configured)
```bash
curl -X POST http://localhost:3000/api/ai/availability \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "[tenant-id]",
    "employeeId": "[employee-id]",
    "serviceId": "[service-id]",
    "date": "2024-01-15"
  }'
```
- [ ] Returns 200 OK
- [ ] Response includes available time slots
- [ ] Slots respect employee schedules

### Appointment Booking (if endpoints configured)
```bash
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "tenantId": "[tenant-id]",
    "employeeId": "[employee-id]",
    "serviceId": "[service-id]",
    "customerName": "Test Customer",
    "customerPhone": "+15555550199",
    "appointmentDate": "2024-01-15",
    "startTime": "10:00"
  }'
```
- [ ] Returns 201 Created
- [ ] Appointment ID returned
- [ ] Can retrieve appointment via GET

## Twilio Integration (if configured)

### Phone Number Configuration
- [ ] Twilio account has phone number +15555551234 (or demo number)
- [ ] Voice webhook configured: `/api/webhooks/twilio/voice`
- [ ] SMS webhook configured: `/api/webhooks/twilio/sms`
- [ ] Webhooks point to correct domain/ngrok URL

### Call Testing
- [ ] Call demo number from external phone
- [ ] AI assistant answers
- [ ] Greeting mentions "Demo Salon"
- [ ] Can interact with assistant
- [ ] Can check availability
- [ ] Can book appointment

### Call Logging
- [ ] After call, check `call_logs` table
- [ ] Entry exists for the call
- [ ] Tenant ID matches Demo Salon
- [ ] Call details captured (duration, reason, etc.)

## Documentation Verification

### Files Exist
- [ ] `backend/prisma/seed-demo.js` exists
- [ ] `backend/prisma/DEMO_SEED_README.md` exists
- [ ] `DEMO_QUICK_START.md` exists
- [ ] Main `README.md` has demo section

### Documentation Quality
- [ ] Instructions are clear
- [ ] All prerequisites listed
- [ ] Example commands provided
- [ ] Troubleshooting section included

### README Updates
- [ ] Main README mentions demo setup
- [ ] Phone number documented
- [ ] Link to detailed docs provided

## Cleanup Testing

### Reset Demo Data
- [ ] Run: `npm run seed:demo`
- [ ] Confirms deletion of existing data
- [ ] Creates fresh demo tenant
- [ ] All counts correct (8, 3, etc.)

### Database State
- [ ] No orphaned records after reset
- [ ] All foreign keys intact
- [ ] No duplicate services or employees

## Performance & Edge Cases

### Large Dataset
- [ ] Seed completes in reasonable time (< 30 seconds)
- [ ] No timeout errors
- [ ] All transactions complete

### Error Handling
- [ ] Test with invalid database URL
- [ ] Script shows meaningful error
- [ ] Doesn't corrupt existing data

### Concurrent Execution
- [ ] Try running seed twice simultaneously
- [ ] Second instance waits or fails gracefully
- [ ] Database remains consistent

## Final Checklist

- [ ] All seed script validations pass
- [ ] All database records created correctly
- [ ] Frontend displays phone number correctly
- [ ] Backend API endpoints return expected data
- [ ] Documentation is complete and accurate
- [ ] No errors in any console logs
- [ ] Demo is ready for production use

## Notes
- Record any issues found: _______________
- Performance notes: _______________
- Suggestions for improvement: _______________

## Sign-off

Tested by: _______________
Date: _______________
All items checked: ☐ Yes ☐ No (specify items)
Ready for production: ☐ Yes ☐ No
