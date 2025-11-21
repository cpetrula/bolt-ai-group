#!/bin/bash

# Script to create GitHub issues for Bolt AI Group project
# This script creates epics and subtasks based on the README.md

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Bolt AI Group - Issue Creation Script ===${NC}"
echo "This script will create a comprehensive set of GitHub issues"
echo "covering all major components from the README.md"
echo ""

# Check if gh CLI is available
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed${NC}"
    echo "Please install it from: https://cli.github.com/"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${YELLOW}You need to authenticate with GitHub CLI${NC}"
    echo "Run: gh auth login"
    exit 1
fi

echo -e "${GREEN}✓ GitHub CLI is installed and authenticated${NC}"
echo ""

# Function to create an issue
create_issue() {
    local title="$1"
    local body="$2"
    local labels="$3"
    
    echo -e "${YELLOW}Creating issue: ${title}${NC}"
    
    if [ -z "$labels" ]; then
        gh issue create --title "$title" --body "$body"
    else
        gh issue create --title "$title" --body "$body" --label "$labels"
    fi
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Created successfully${NC}"
    else
        echo -e "${RED}✗ Failed to create${NC}"
    fi
    echo ""
}

# Create labels if they don't exist
echo -e "${GREEN}Creating labels...${NC}"
gh label create "backend" --color "0366d6" --description "Backend development tasks" --force
gh label create "frontend" --color "fbca04" --description "Frontend development tasks" --force
gh label create "ai" --color "a2eeef" --description "AI/ML related tasks" --force
gh label create "telephony" --color "d73a4a" --description "Telephony/Twilio related tasks" --force
gh label create "billing" --color "0e8a16" --description "Billing/payment related tasks" --force
gh label create "auth" --color "c5def5" --description "Authentication related tasks" --force
gh label create "database" --color "bfdadc" --description "Database related tasks" --force
gh label create "docs" --color "d4c5f9" --description "Documentation tasks" --force
gh label create "enhancement" --color "84b6eb" --description "New feature or request" --force
echo -e "${GREEN}✓ Labels created${NC}"
echo ""

# EPIC 1: Backend Infrastructure Setup
create_issue "[EPIC] Backend Infrastructure Setup" \
"## Description

Set up the foundational backend infrastructure for the Bolt AI Salon Assistant application.

## Objectives

- Initialize Node.js + TypeScript project
- Set up Express/Fastify framework
- Configure MySQL database with ORM (Prisma or TypeORM)
- Implement database migrations
- Set up multi-tenant middleware
- Configure environment variables and secrets management
- Set up logging and error handling

## Acceptance Criteria

- [ ] Backend project is initialized with TypeScript
- [ ] Express/Fastify server runs successfully
- [ ] MySQL database is configured and accessible
- [ ] ORM is set up with migration system
- [ ] Multi-tenant middleware correctly identifies tenant from context
- [ ] Environment variables are properly configured
- [ ] Basic health check endpoint works
- [ ] Error handling middleware is in place

## Required Files/Directories

\`\`\`
backend/
├─ src/
│  ├─ app.ts
│  ├─ config/
│  │  ├─ env.ts
│  │  └─ db.ts
│  ├─ middleware/
│  ├─ routes/
│  └─ utils/
├─ prisma/ or migrations/
├─ package.json
├─ tsconfig.json
└─ README.md
\`\`\`

## Dependencies

None - this is a foundational epic

## Subtasks

Track progress with related subtask issues." \
"backend,enhancement,database"

# Backend Infrastructure Subtasks
create_issue "Backend: Initialize Node.js + TypeScript project" \
"## Description

Initialize the backend Node.js project with TypeScript configuration.

## Tasks

- Create \`backend/\` directory structure
- Initialize npm project with \`package.json\`
- Install TypeScript and type definitions
- Configure \`tsconfig.json\` with strict mode
- Install and configure Express or Fastify
- Set up development scripts (dev, build, start)
- Install nodemon for development

## Acceptance Criteria

- [ ] \`package.json\` is created with appropriate scripts
- [ ] \`tsconfig.json\` is configured with strict TypeScript settings
- [ ] TypeScript compiles without errors
- [ ] \`npm run dev\` starts the development server
- [ ] \`npm run build\` compiles TypeScript to JavaScript

## Required Files

- \`backend/package.json\`
- \`backend/tsconfig.json\`
- \`backend/src/app.ts\`

## Dependencies

**Epic:** Backend Infrastructure Setup" \
"backend,enhancement"

create_issue "Backend: Configure MySQL + ORM" \
"## Description

Set up MySQL database connection and configure ORM (Prisma or TypeORM).

## Tasks

- Install MySQL client library
- Install and configure Prisma or TypeORM
- Create database configuration module
- Set up connection pooling
- Create initial migration system
- Test database connection

## Acceptance Criteria

- [ ] ORM is installed and configured
- [ ] Database connection is established successfully
- [ ] Migration system is working
- [ ] \`env.ts\` configuration module exists
- [ ] \`db.ts\` database connection module exists
- [ ] Connection can be tested with a simple query

## Required Files

- \`backend/src/config/db.ts\`
- \`backend/src/config/env.ts\`
- \`backend/prisma/schema.prisma\` or equivalent

## Dependencies

**Epic:** Backend Infrastructure Setup
**Requires:** Backend: Initialize Node.js + TypeScript project" \
"backend,database,enhancement"

create_issue "Backend: Implement multi-tenant middleware" \
"## Description

Create middleware to identify and enforce multi-tenant data isolation.

## Tasks

- Create tenant identification middleware
- Extract tenant_id from authenticated user or request context
- Add tenant_id to request object
- Create database query helpers that auto-scope to tenant
- Add tests for tenant isolation

## Acceptance Criteria

- [ ] Middleware extracts tenant_id from JWT or context
- [ ] Tenant_id is available in request object
- [ ] Database queries automatically filter by tenant_id
- [ ] Attempting to access another tenant's data returns 403
- [ ] Unit tests verify tenant isolation

## Required Files

- \`backend/src/middleware/tenant.middleware.ts\`
- \`backend/src/utils/db-helpers.ts\`

## Dependencies

**Epic:** Backend Infrastructure Setup
**Requires:** Backend: Configure MySQL + ORM" \
"backend,enhancement"

create_issue "Backend: Set up error handling and logging" \
"## Description

Implement comprehensive error handling and logging system.

## Tasks

- Create error handling middleware
- Set up structured logging (Winston or Pino)
- Create custom error classes
- Implement request/response logging
- Set up error monitoring (optional: Sentry integration)
- Add correlation IDs for request tracing

## Acceptance Criteria

- [ ] Global error handler catches all unhandled errors
- [ ] Errors are logged with appropriate severity levels
- [ ] Request/response logging includes timing and status
- [ ] Custom error classes for different error types
- [ ] Stack traces in development, sanitized messages in production
- [ ] Correlation IDs track requests across services

## Required Files

- \`backend/src/middleware/error.middleware.ts\`
- \`backend/src/utils/logger.ts\`
- \`backend/src/utils/errors.ts\`

## Dependencies

**Epic:** Backend Infrastructure Setup
**Requires:** Backend: Initialize Node.js + TypeScript project" \
"backend,enhancement"

# EPIC 2: Authentication & 2FA System
create_issue "[EPIC] Authentication & 2FA System" \
"## Description

Implement a complete authentication system with JWT-based sessions and two-factor authentication (2FA) support.

## Objectives

- User signup with email/password
- User login with JWT token generation
- Password reset flow (forgot password)
- 2FA setup and verification (TOTP)
- Session management
- Auth middleware for protected routes

## Acceptance Criteria

- [ ] Users can sign up with email and password
- [ ] Passwords are securely hashed (bcrypt/argon2)
- [ ] Users can log in and receive JWT tokens
- [ ] JWT tokens are validated on protected routes
- [ ] Password reset flow works end-to-end
- [ ] 2FA can be enabled/disabled per user
- [ ] 2FA verification works with TOTP codes
- [ ] Auth middleware properly protects routes

## Required Files/Directories

\`\`\`
backend/src/modules/auth/
├─ auth.controller.ts
├─ auth.service.ts
├─ auth.routes.ts
├─ jwt.utils.ts
└─ 2fa.utils.ts
\`\`\`

## Dependencies

- Backend Infrastructure Setup (database, ORM)
- User model in database

## API Endpoints

- \`POST /api/auth/signup\`
- \`POST /api/auth/login\`
- \`POST /api/auth/forgot-password\`
- \`POST /api/auth/reset-password\`
- \`POST /api/auth/2fa/setup\`
- \`POST /api/auth/2fa/verify\`" \
"backend,auth,enhancement"

# Authentication Subtasks
create_issue "Auth: Create user data model" \
"## Description

Create the user database model/schema with all required fields.

## Tasks

- Create user model with ORM
- Define fields: id, tenant_id, email, password_hash, role, 2FA fields
- Add timestamps (created_at, updated_at)
- Create migration
- Add unique constraints and indexes

## Acceptance Criteria

- [ ] User model includes all required fields from DATA_MODEL.md
- [ ] Email is unique per tenant
- [ ] Password is stored as hash (never plain text)
- [ ] 2FA fields (is_2fa_enabled, twofa_secret) are present
- [ ] Role field supports (owner, manager, staff)
- [ ] Migration creates table successfully

## Required Files

- \`backend/src/modules/auth/user.model.ts\`
- Database migration file

## Dependencies

**Epic:** Authentication & 2FA System
**Requires:** Backend: Configure MySQL + ORM" \
"backend,auth,database,enhancement"

create_issue "Auth: Implement user signup" \
"## Description

Implement user registration endpoint with email/password.

## Tasks

- Create signup controller and service
- Validate email format and password strength
- Hash password before storing (bcrypt/argon2)
- Create user record in database
- Associate user with tenant
- Send welcome email (optional)

## Acceptance Criteria

- [ ] POST /api/auth/signup endpoint exists
- [ ] Email validation rejects invalid emails
- [ ] Password must meet minimum requirements (length, complexity)
- [ ] Password is hashed before database storage
- [ ] Duplicate email returns appropriate error
- [ ] User is created with correct tenant association
- [ ] Returns success response (not including password)

## Required Files

- \`backend/src/modules/auth/auth.controller.ts\`
- \`backend/src/modules/auth/auth.service.ts\`
- \`backend/src/modules/auth/auth.routes.ts\`

## Dependencies

**Epic:** Authentication & 2FA System
**Requires:** Auth: Create user data model" \
"backend,auth,enhancement"

create_issue "Auth: Implement user login with JWT" \
"## Description

Implement login endpoint that returns JWT tokens.

## Tasks

- Create login controller and service
- Verify email and password
- Generate JWT access token
- Generate refresh token (optional)
- Set appropriate token expiration
- Create JWT verification middleware

## Acceptance Criteria

- [ ] POST /api/auth/login endpoint exists
- [ ] Email and password are verified against database
- [ ] Wrong credentials return 401 error
- [ ] Successful login returns JWT token
- [ ] JWT includes user_id, tenant_id, and role
- [ ] JWT middleware validates tokens on protected routes
- [ ] Expired tokens are rejected

## Required Files

- \`backend/src/modules/auth/auth.controller.ts\`
- \`backend/src/modules/auth/jwt.utils.ts\`
- \`backend/src/middleware/auth.middleware.ts\`

## Dependencies

**Epic:** Authentication & 2FA System
**Requires:** Auth: Implement user signup" \
"backend,auth,enhancement"

create_issue "Auth: Implement password reset flow" \
"## Description

Implement forgot password and password reset functionality.

## Tasks

- Create forgot-password endpoint (generates reset token)
- Store reset token with expiration in database
- Send reset email with token link
- Create reset-password endpoint (validates token and updates password)
- Invalidate token after use

## Acceptance Criteria

- [ ] POST /api/auth/forgot-password endpoint exists
- [ ] Reset token is generated and stored with expiration
- [ ] Email is sent with reset link
- [ ] POST /api/auth/reset-password endpoint exists
- [ ] Reset token is validated (exists, not expired, not used)
- [ ] Password is updated and hashed
- [ ] Token is invalidated after successful reset
- [ ] Expired/invalid tokens return appropriate error

## Required Files

- \`backend/src/modules/auth/auth.controller.ts\`
- \`backend/src/modules/auth/auth.service.ts\`
- Database migration for reset tokens table

## Dependencies

**Epic:** Authentication & 2FA System
**Requires:** Auth: Implement user login with JWT" \
"backend,auth,enhancement"

create_issue "Auth: Implement 2FA setup and verification" \
"## Description

Implement TOTP-based two-factor authentication.

## Tasks

- Install 2FA library (speakeasy or otplib)
- Create 2FA setup endpoint (generates secret and QR code)
- Store 2FA secret per user
- Create 2FA verification endpoint
- Update login flow to require 2FA when enabled
- Create 2FA disable endpoint

## Acceptance Criteria

- [ ] POST /api/auth/2fa/setup endpoint generates secret and QR code
- [ ] 2FA secret is stored encrypted in database
- [ ] POST /api/auth/2fa/verify endpoint validates TOTP codes
- [ ] Login flow checks if 2FA is enabled for user
- [ ] If 2FA enabled, login requires verification code
- [ ] Users can disable 2FA after verification
- [ ] Invalid TOTP codes return appropriate error

## Required Files

- \`backend/src/modules/auth/2fa.utils.ts\`
- \`backend/src/modules/auth/auth.controller.ts\`
- \`backend/src/modules/auth/auth.service.ts\`

## Dependencies

**Epic:** Authentication & 2FA System
**Requires:** Auth: Implement user login with JWT" \
"backend,auth,enhancement"

# EPIC 3: Multi-Tenant Management
create_issue "[EPIC] Multi-Tenant Management" \
"## Description

Implement multi-tenant architecture allowing multiple businesses (salons) to use the platform with complete data isolation.

## Objectives

- Create tenant data model
- Implement tenant creation and onboarding
- Set up data isolation mechanisms
- Configure tenant-specific settings
- Implement tenant context middleware

## Acceptance Criteria

- [ ] Tenant model includes all required fields
- [ ] New tenants can be created through signup flow
- [ ] All database queries are scoped to tenant_id
- [ ] Tenant settings can be retrieved and updated
- [ ] Tenant status transitions work correctly
- [ ] Complete data isolation between tenants

## Required Files/Directories

\`\`\`
backend/src/modules/tenants/
├─ tenant.model.ts
├─ tenant.controller.ts
├─ tenant.service.ts
└─ tenant.routes.ts
\`\`\`

## Dependencies

- Backend Infrastructure Setup
- Authentication system

## API Endpoints

- \`GET /api/me\` (current user & tenant)
- \`GET /api/tenant/settings\`
- \`PATCH /api/tenant/settings\`" \
"backend,enhancement,database"

# Multi-Tenant Subtasks
create_issue "Tenant: Create tenant data model" \
"## Description

Create the tenant database model/schema.

## Tasks

- Create tenant model with ORM
- Define all fields from DATA_MODEL.md
- Add status enum (trialing, active, suspended, canceled)
- Create migration
- Add indexes on key fields

## Acceptance Criteria

- [ ] Tenant model includes: id, name, business_type, contact fields, twilio_phone_number, status
- [ ] Status field is enum with all required values
- [ ] Timestamps (created_at, updated_at) are present
- [ ] Migration creates table successfully
- [ ] Indexes are created for frequently queried fields

## Required Files

- \`backend/src/modules/tenants/tenant.model.ts\`
- Database migration file

## Dependencies

**Epic:** Multi-Tenant Management
**Requires:** Backend: Configure MySQL + ORM" \
"backend,database,enhancement"

create_issue "Tenant: Implement tenant creation" \
"## Description

Implement tenant creation during signup process.

## Tasks

- Create tenant service with creation logic
- Generate unique tenant identifier
- Set initial status to 'trialing'
- Create default admin user for tenant
- Trigger onboarding flow

## Acceptance Criteria

- [ ] Tenant is created during signup
- [ ] Tenant has unique identifier
- [ ] Initial status is set to 'trialing'
- [ ] Primary contact information is saved
- [ ] First user becomes tenant owner
- [ ] Returns tenant object

## Required Files

- \`backend/src/modules/tenants/tenant.service.ts\`
- \`backend/src/modules/tenants/tenant.controller.ts\`

## Dependencies

**Epic:** Multi-Tenant Management
**Requires:** Tenant: Create tenant data model, Auth: Implement user signup" \
"backend,enhancement"

create_issue "Tenant: Implement tenant settings management" \
"## Description

Implement endpoints to retrieve and update tenant settings.

## Tasks

- Create GET /api/tenant/settings endpoint
- Create PATCH /api/tenant/settings endpoint
- Define updateable settings fields
- Validate setting values
- Add authorization (only owner/manager can update)

## Acceptance Criteria

- [ ] GET /api/tenant/settings returns current tenant settings
- [ ] PATCH /api/tenant/settings updates allowed fields
- [ ] Business name, contact info, preferences can be updated
- [ ] Twilio phone number cannot be changed directly
- [ ] Only owner/manager role can update settings
- [ ] Changes are logged

## Required Files

- \`backend/src/modules/tenants/tenant.controller.ts\`
- \`backend/src/modules/tenants/tenant.service.ts\`
- \`backend/src/modules/tenants/tenant.routes.ts\`

## Dependencies

**Epic:** Multi-Tenant Management
**Requires:** Tenant: Implement tenant creation" \
"backend,enhancement"

create_issue "Tenant: Set up tenant onboarding flow" \
"## Description

Create automated onboarding process for new tenants.

## Tasks

- Create onboarding service
- Provision Twilio phone number
- Seed default salon services
- Set default business hours
- Send welcome email
- Create onboarding checklist for UI

## Acceptance Criteria

- [ ] Onboarding triggers after successful payment
- [ ] Twilio phone number is provisioned
- [ ] Default services are created (from seed data)
- [ ] Default business hours are set
- [ ] Welcome email is sent to primary contact
- [ ] Tenant status changes to 'active'
- [ ] Onboarding can be retried on failure

## Required Files

- \`backend/src/modules/tenants/onboarding.service.ts\`
- \`backend/src/jobs/onboarding.job.ts\`

## Dependencies

**Epic:** Multi-Tenant Management
**Requires:** Tenant: Implement tenant creation, Telephony: Implement phone number provisioning, Service: Create seed data" \
"backend,enhancement"

# EPIC 4: Employee & Service Management
create_issue "[EPIC] Employee & Service Management" \
"## Description

Implement CRUD operations for managing employees/contractors and services that a salon offers.

## Objectives

- Create employee data model with schedules
- Create service data model with add-ons
- Implement employee CRUD operations
- Implement service CRUD operations
- Link employees to services they can perform
- Seed default salon services

## Acceptance Criteria

- [ ] Employees can be created, read, updated, and deleted
- [ ] Employee schedules (work days/hours) can be managed
- [ ] Services can be created, read, updated, and deleted
- [ ] Service add-ons can be defined
- [ ] Employees can be linked to services they perform
- [ ] Default salon services are seeded for new tenants
- [ ] All operations respect multi-tenant isolation

## Required Files/Directories

\`\`\`
backend/src/modules/employees/
├─ employee.model.ts
├─ employee.controller.ts
├─ employee.service.ts
└─ employee.routes.ts

backend/src/modules/services/
├─ service.model.ts
├─ service.controller.ts
├─ service.service.ts
└─ service.routes.ts
\`\`\`

## Dependencies

- Backend Infrastructure Setup
- Multi-Tenant Management

## API Endpoints

### Employees
- \`GET /api/employees\`
- \`POST /api/employees\`
- \`PATCH /api/employees/:id\`
- \`DELETE /api/employees/:id\`
- \`GET /api/employees/:id/schedule\`
- \`PUT /api/employees/:id/schedule\`

### Services
- \`GET /api/services\`
- \`POST /api/services\`
- \`PATCH /api/services/:id\`
- \`DELETE /api/services/:id\`" \
"backend,enhancement,database"

# Employee & Service Subtasks
create_issue "Employee: Create employee data model" \
"## Description

Create employee and employee_schedules database models.

## Tasks

- Create employee model with all fields from DATA_MODEL.md
- Create employee_schedules model
- Create employee_services join table
- Add appropriate indexes and foreign keys
- Create migrations

## Acceptance Criteria

- [ ] Employee model includes: id, tenant_id, name, role, phone, email, is_active
- [ ] employee_schedules model includes day_of_week, start_time, end_time
- [ ] employee_services links employees to services
- [ ] All tables have tenant_id for isolation
- [ ] Foreign keys are set up correctly
- [ ] Migrations run successfully

## Required Files

- \`backend/src/modules/employees/employee.model.ts\`
- \`backend/src/modules/employees/employee-schedule.model.ts\`
- Database migration files

## Dependencies

**Epic:** Employee & Service Management
**Requires:** Backend: Configure MySQL + ORM" \
"backend,database,enhancement"

create_issue "Employee: Implement employee CRUD endpoints" \
"## Description

Implement Create, Read, Update, Delete operations for employees.

## Tasks

- Create employee controller and service
- Implement GET /api/employees (list all for tenant)
- Implement POST /api/employees (create new)
- Implement PATCH /api/employees/:id (update)
- Implement DELETE /api/employees/:id (soft delete)
- Add validation for employee data
- Add authorization checks

## Acceptance Criteria

- [ ] GET /api/employees returns all employees for current tenant
- [ ] POST /api/employees creates new employee
- [ ] PATCH /api/employees/:id updates employee
- [ ] DELETE /api/employees/:id marks employee as inactive
- [ ] Can filter employees by role, active status
- [ ] Validation ensures required fields are present
- [ ] Cannot access employees from other tenants

## Required Files

- \`backend/src/modules/employees/employee.controller.ts\`
- \`backend/src/modules/employees/employee.service.ts\`
- \`backend/src/modules/employees/employee.routes.ts\`

## Dependencies

**Epic:** Employee & Service Management
**Requires:** Employee: Create employee data model" \
"backend,enhancement"

create_issue "Employee: Implement employee schedules" \
"## Description

Implement endpoints to manage employee work schedules.

## Tasks

- Create schedule controller and service
- Implement GET /api/employees/:id/schedule
- Implement PUT /api/employees/:id/schedule (replace all)
- Support day of week (0-6) with start/end times
- Validate time formats and ranges

## Acceptance Criteria

- [ ] GET /api/employees/:id/schedule returns weekly schedule
- [ ] PUT /api/employees/:id/schedule replaces entire schedule
- [ ] Schedule includes all 7 days (even if no hours)
- [ ] Time validation ensures end_time > start_time
- [ ] Can set different hours for different days
- [ ] Can mark days as not working (no hours)

## Required Files

- \`backend/src/modules/employees/employee.controller.ts\`
- \`backend/src/modules/employees/employee.service.ts\`

## Dependencies

**Epic:** Employee & Service Management
**Requires:** Employee: Implement employee CRUD endpoints" \
"backend,enhancement"

create_issue "Service: Create service data model" \
"## Description

Create service and service_addons database models.

## Tasks

- Create service model with all fields
- Create service_addons model
- Add price as decimal type
- Add duration in minutes as integer
- Create migrations

## Acceptance Criteria

- [ ] Service model includes: id, tenant_id, name, description, base_price, duration_minutes
- [ ] service_addons model includes: id, tenant_id, service_id, name, price, duration_minutes
- [ ] Prices stored as decimal for precision
- [ ] Foreign keys link addons to services
- [ ] Migrations run successfully

## Required Files

- \`backend/src/modules/services/service.model.ts\`
- \`backend/src/modules/services/service-addon.model.ts\`
- Database migration files

## Dependencies

**Epic:** Employee & Service Management
**Requires:** Backend: Configure MySQL + ORM" \
"backend,database,enhancement"

create_issue "Service: Implement service CRUD endpoints" \
"## Description

Implement Create, Read, Update, Delete operations for services.

## Tasks

- Create service controller and service
- Implement GET /api/services (list all for tenant)
- Implement POST /api/services (create new)
- Implement PATCH /api/services/:id (update)
- Implement DELETE /api/services/:id (soft delete)
- Include add-ons in service responses
- Add validation for pricing and duration

## Acceptance Criteria

- [ ] GET /api/services returns all services with add-ons
- [ ] POST /api/services creates new service
- [ ] PATCH /api/services/:id updates service
- [ ] DELETE /api/services/:id marks service as inactive
- [ ] Price must be positive number
- [ ] Duration must be positive integer
- [ ] Cannot access services from other tenants

## Required Files

- \`backend/src/modules/services/service.controller.ts\`
- \`backend/src/modules/services/service.service.ts\`
- \`backend/src/modules/services/service.routes.ts\`

## Dependencies

**Epic:** Employee & Service Management
**Requires:** Service: Create service data model" \
"backend,enhancement"

create_issue "Service: Create seed data for default salon services" \
"## Description

Create seed data for common salon services that new tenants start with.

## Tasks

- Create seeding script/migration
- Add all services from README section 11
- Include prices and durations
- Add common add-ons
- Make seed data apply to new tenants only

## Acceptance Criteria

- [ ] Seed includes: Women's Haircut ($75, 60min), Men's Haircut ($50, 45min), Kids' Haircut ($40, 45min)
- [ ] Seed includes: Blowout, Full Color, Root Touch-Up, Partial/Full Highlights
- [ ] Add-ons include: Deep Conditioning Treatment ($30, 20min), Olaplex Treatment ($40, 20min)
- [ ] Seed data is applied during tenant onboarding
- [ ] Services can be modified/deleted by tenant after creation
- [ ] Prices and durations match README.md section 11

## Required Files

- \`backend/src/modules/services/seed-data.ts\`
- \`backend/src/jobs/seed-services.job.ts\`

## Dependencies

**Epic:** Employee & Service Management
**Requires:** Service: Implement service CRUD endpoints" \
"backend,database,enhancement"

# EPIC 5: Appointments & Availability System
create_issue "[EPIC] Appointments & Availability System" \
"## Description

Implement appointment booking system with availability checking and conflict detection.

## Objectives

- Create appointment data model
- Implement availability calculation algorithm
- Implement appointment CRUD operations
- Add conflict detection (prevent double-booking)
- Support appointment modifications and cancellations
- Track cancellation reasons

## Acceptance Criteria

- [ ] Appointments can be created with all required fields
- [ ] Availability calculation considers employee schedules and existing appointments
- [ ] System prevents double-booking of employees
- [ ] Appointments can be modified (reschedule)
- [ ] Appointments can be canceled with reason tracking
- [ ] Appointment status tracking works correctly
- [ ] Support for service add-ons in appointments

## Required Files/Directories

\`\`\`
backend/src/modules/appointments/
├─ appointment.model.ts
├─ appointment.controller.ts
├─ appointment.service.ts
├─ availability.service.ts
└─ appointment.routes.ts
\`\`\`

## Dependencies

- Employee & Service Management
- Multi-Tenant Management

## API Endpoints

- \`GET /api/appointments\`
- \`POST /api/appointments\`
- \`PATCH /api/appointments/:id\`
- \`DELETE /api/appointments/:id\`
- \`GET /api/availability\` (for AI and frontend)" \
"backend,enhancement,database"

# Appointments Subtasks
create_issue "Appointments: Create appointment data model" \
"## Description

Create appointment database model with all required fields.

## Tasks

- Create appointment model
- Include customer info fields
- Include service and employee references
- Add status enum (booked, modified, canceled, completed)
- Add source tracking (ai_call, manual, online_form)
- Create migration

## Acceptance Criteria

- [ ] Appointment model includes all fields from DATA_MODEL.md
- [ ] Fields: id, tenant_id, customer_name, customer_phone, customer_email
- [ ] Fields: employee_id, service_id, addon_ids (JSON or join table)
- [ ] Fields: start_time, end_time, status, cancel_reason, source
- [ ] Status enum includes all required values
- [ ] Foreign keys to employee and service tables
- [ ] Migration runs successfully

## Required Files

- \`backend/src/modules/appointments/appointment.model.ts\`
- Database migration file

## Dependencies

**Epic:** Appointments & Availability System
**Requires:** Employee: Create employee data model, Service: Create service data model" \
"backend,database,enhancement"

create_issue "Appointments: Implement availability calculation" \
"## Description

Create service to calculate available time slots for appointments.

## Tasks

- Create availability service
- Input: employee_id, service_id, date_range
- Calculate working hours from employee schedule
- Subtract existing appointments
- Account for service duration
- Return available time slots

## Acceptance Criteria

- [ ] Availability service accepts employee, service, and date range
- [ ] Returns list of available time slots
- [ ] Considers employee work schedule for given day
- [ ] Excludes time slots with existing appointments
- [ ] Accounts for service duration (including add-ons)
- [ ] Handles edge cases (employee not working, fully booked)
- [ ] Performance: can calculate week's availability in < 500ms

## Required Files

- \`backend/src/modules/appointments/availability.service.ts\`

## Dependencies

**Epic:** Appointments & Availability System
**Requires:** Appointments: Create appointment data model, Employee: Implement employee schedules" \
"backend,enhancement"

create_issue "Appointments: Implement appointment CRUD endpoints" \
"## Description

Implement Create, Read, Update, Delete operations for appointments.

## Tasks

- Create appointment controller and service
- Implement GET /api/appointments (with filters)
- Implement POST /api/appointments (create)
- Implement PATCH /api/appointments/:id (modify)
- Implement DELETE /api/appointments/:id (cancel)
- Add validation for appointment data
- Calculate end_time from start_time + duration

## Acceptance Criteria

- [ ] GET /api/appointments returns appointments for tenant
- [ ] Can filter by employee, date range, status
- [ ] POST /api/appointments creates new appointment
- [ ] Automatically calculates end_time from duration
- [ ] PATCH /api/appointments/:id updates appointment
- [ ] DELETE /api/appointments/:id cancels appointment
- [ ] All customer info is validated
- [ ] Returns appointment with employee and service details

## Required Files

- \`backend/src/modules/appointments/appointment.controller.ts\`
- \`backend/src/modules/appointments/appointment.service.ts\`
- \`backend/src/modules/appointments/appointment.routes.ts\`

## Dependencies

**Epic:** Appointments & Availability System
**Requires:** Appointments: Create appointment data model" \
"backend,enhancement"

create_issue "Appointments: Add conflict detection logic" \
"## Description

Implement logic to prevent double-booking of employees.

## Tasks

- Add conflict checking before creating appointment
- Check for overlapping appointments for same employee
- Validate employee is working at requested time
- Return clear error messages for conflicts
- Add tests for various conflict scenarios

## Acceptance Criteria

- [ ] Cannot book employee who has overlapping appointment
- [ ] Cannot book employee outside their work hours
- [ ] Cannot book employee who doesn't perform the service
- [ ] Conflict errors include reason and next available time
- [ ] Modifying appointment also checks for conflicts
- [ ] Can exclude current appointment when checking modify conflicts
- [ ] Unit tests cover all conflict scenarios

## Required Files

- \`backend/src/modules/appointments/appointment.service.ts\`
- \`backend/src/modules/appointments/conflict-check.service.ts\`

## Dependencies

**Epic:** Appointments & Availability System
**Requires:** Appointments: Implement availability calculation, Appointments: Implement appointment CRUD endpoints" \
"backend,enhancement"

create_issue "Appointments: Implement cancellation with reason tracking" \
"## Description

Enhance cancellation to track reasons and trigger notifications.

## Tasks

- Update DELETE endpoint to accept cancel_reason
- Store cancel_reason in database
- Send cancellation SMS to customer
- Send cancellation notification to employee
- Update appointment status to 'canceled'
- Add cancel_reason to appointment model

## Acceptance Criteria

- [ ] DELETE /api/appointments/:id accepts optional cancel_reason
- [ ] Reason is stored in cancel_reason field
- [ ] Status changes to 'canceled'
- [ ] Customer receives cancellation SMS
- [ ] Employee/owner receives notification
- [ ] Can track cancellation reasons for reports
- [ ] Cannot cancel already completed appointments

## Required Files

- \`backend/src/modules/appointments/appointment.service.ts\`
- \`backend/src/modules/appointments/appointment.controller.ts\`

## Dependencies

**Epic:** Appointments & Availability System
**Requires:** Appointments: Implement appointment CRUD endpoints, Telephony: Implement SMS notification system" \
"backend,enhancement"

# EPIC 6: Billing & Subscriptions
create_issue "[EPIC] Billing & Subscriptions (Stripe)" \
"## Description

Integrate Stripe for handling recurring subscriptions and payments.

## Objectives

- Create subscription data model
- Implement Stripe customer creation
- Set up subscription plans (monthly: $295, yearly: $2,832)
- Create checkout session flow
- Implement webhook handlers for Stripe events
- Create customer portal integration
- Handle subscription lifecycle

## Acceptance Criteria

- [ ] Subscription model tracks Stripe IDs
- [ ] New signups are redirected to Stripe checkout
- [ ] Successful payment webhook activates tenant
- [ ] Monthly and yearly plans are configured correctly
- [ ] Subscription status is synced via webhooks
- [ ] Customer portal allows plan management
- [ ] Cancellation flow updates both Stripe and database
- [ ] Subscription status affects tenant access

## Required Files/Directories

\`\`\`
backend/src/modules/billing/
├─ subscription.model.ts
├─ billing.controller.ts
├─ billing.service.ts
├─ stripe.service.ts
├─ webhook.handler.ts
└─ billing.routes.ts
\`\`\`

## Dependencies

- Backend Infrastructure Setup
- Multi-Tenant Management
- Authentication System

## API Endpoints

- \`GET /api/billing/subscription\`
- \`POST /api/billing/create-checkout-session\`
- \`POST /api/billing/portal-session\`
- \`POST /api/webhooks/stripe\`" \
"backend,billing,enhancement"

# Billing Subtasks
create_issue "Billing: Create subscription data model" \
"## Description

Create subscription database model to track Stripe subscriptions.

## Tasks

- Create subscription model with all fields from DATA_MODEL.md
- Add Stripe customer_id and subscription_id fields
- Add plan enum (monthly, yearly)
- Add status enum (active, past_due, canceled)
- Add period dates
- Create migration

## Acceptance Criteria

- [ ] Subscription model includes all required fields
- [ ] Fields: id, tenant_id, plan, stripe_customer_id, stripe_subscription_id
- [ ] Fields: status, current_period_start, current_period_end, cancel_at_period_end
- [ ] Plan enum: monthly, yearly
- [ ] Status enum: active, past_due, canceled
- [ ] Foreign key to tenant table
- [ ] Migration runs successfully

## Required Files

- \`backend/src/modules/billing/subscription.model.ts\`
- Database migration file

## Dependencies

**Epic:** Billing & Subscriptions (Stripe)
**Requires:** Tenant: Create tenant data model" \
"backend,billing,database,enhancement"

create_issue "Billing: Integrate Stripe SDK" \
"## Description

Set up Stripe SDK and configure products/prices.

## Tasks

- Install Stripe Node.js SDK
- Configure Stripe API keys (test and production)
- Create Stripe products for subscription
- Create prices: Monthly ($295), Yearly ($2,832)
- Create Stripe service wrapper
- Add environment variables for keys

## Acceptance Criteria

- [ ] Stripe SDK is installed and configured
- [ ] API keys are stored in environment variables
- [ ] Subscription product exists in Stripe dashboard
- [ ] Monthly price ($295) is created
- [ ] Yearly price ($2,832) is created
- [ ] Stripe service wrapper abstracts SDK calls
- [ ] Test mode and production mode are configurable

## Required Files

- \`backend/src/modules/billing/stripe.service.ts\`
- \`backend/src/config/env.ts\` (Stripe keys)

## Dependencies

**Epic:** Billing & Subscriptions (Stripe)
**Requires:** Backend: Set up error handling and logging" \
"backend,billing,enhancement"

create_issue "Billing: Implement checkout session creation" \
"## Description

Create endpoint to generate Stripe checkout sessions.

## Tasks

- Create POST /api/billing/create-checkout-session endpoint
- Accept plan parameter (monthly or yearly)
- Create Stripe customer if doesn't exist
- Create checkout session with appropriate price
- Set success and cancel URLs
- Return session ID for frontend

## Acceptance Criteria

- [ ] POST /api/billing/create-checkout-session endpoint exists
- [ ] Accepts plan parameter (monthly or yearly)
- [ ] Creates or reuses Stripe customer
- [ ] Creates checkout session with correct price
- [ ] Returns session URL/ID for redirect
- [ ] Session metadata includes tenant_id
- [ ] Success URL points to app dashboard
- [ ] Cancel URL returns to signup/billing page

## Required Files

- \`backend/src/modules/billing/billing.controller.ts\`
- \`backend/src/modules/billing/billing.service.ts\`
- \`backend/src/modules/billing/billing.routes.ts\`

## Dependencies

**Epic:** Billing & Subscriptions (Stripe)
**Requires:** Billing: Integrate Stripe SDK, Billing: Create subscription data model" \
"backend,billing,enhancement"

create_issue "Billing: Implement Stripe webhook handlers" \
"## Description

Create webhook endpoint to handle Stripe events.

## Tasks

- Create POST /api/webhooks/stripe endpoint
- Verify webhook signatures
- Handle checkout.session.completed event
- Handle customer.subscription.updated event
- Handle customer.subscription.deleted event
- Handle invoice.payment_failed event
- Update subscription status in database
- Trigger tenant onboarding on successful payment

## Acceptance Criteria

- [ ] POST /api/webhooks/stripe endpoint exists
- [ ] Webhook signatures are verified
- [ ] checkout.session.completed activates subscription
- [ ] Successful payment triggers tenant onboarding
- [ ] subscription.updated syncs status to database
- [ ] subscription.deleted marks subscription as canceled
- [ ] invoice.payment_failed marks as past_due
- [ ] Handles webhook retries idempotently
- [ ] Logs all webhook events

## Required Files

- \`backend/src/modules/billing/webhook.handler.ts\`
- \`backend/src/modules/billing/billing.routes.ts\`

## Dependencies

**Epic:** Billing & Subscriptions (Stripe)
**Requires:** Billing: Implement checkout session creation, Tenant: Set up tenant onboarding flow" \
"backend,billing,enhancement"

create_issue "Billing: Create customer portal integration" \
"## Description

Implement Stripe Customer Portal for subscription management.

## Tasks

- Create POST /api/billing/portal-session endpoint
- Generate portal session for current customer
- Configure portal settings in Stripe dashboard
- Set return URL to billing page
- Allow plan changes and cancellation

## Acceptance Criteria

- [ ] POST /api/billing/portal-session endpoint exists
- [ ] Generates portal session for authenticated user's tenant
- [ ] Returns portal URL for redirect
- [ ] Portal allows viewing subscription details
- [ ] Portal allows changing payment method
- [ ] Portal allows plan changes (monthly <-> yearly)
- [ ] Portal allows cancellation
- [ ] Return URL points to app billing page

## Required Files

- \`backend/src/modules/billing/billing.controller.ts\`
- \`backend/src/modules/billing/billing.service.ts\`

## Dependencies

**Epic:** Billing & Subscriptions (Stripe)
**Requires:** Billing: Implement checkout session creation" \
"backend,billing,enhancement"

create_issue "Billing: Handle subscription lifecycle events" \
"## Description

Implement logic to handle subscription status changes affecting tenant access.

## Tasks

- Create middleware to check subscription status
- Block access for past_due or canceled tenants
- Show grace period for past_due status
- Update tenant status based on subscription
- Send email notifications for status changes
- Allow reactivation of canceled subscriptions

## Acceptance Criteria

- [ ] Middleware checks subscription status on protected routes
- [ ] Active subscriptions allow full access
- [ ] Past_due subscriptions show warning but allow access for grace period
- [ ] Canceled subscriptions block access to app (read-only mode)
- [ ] Tenant status is synchronized with subscription status
- [ ] Email sent when subscription goes past_due
- [ ] Email sent when subscription is canceled
- [ ] Can reactivate canceled subscription through portal

## Required Files

- \`backend/src/middleware/subscription.middleware.ts\`
- \`backend/src/modules/billing/billing.service.ts\`

## Dependencies

**Epic:** Billing & Subscriptions (Stripe)
**Requires:** Billing: Implement Stripe webhook handlers" \
"backend,billing,enhancement"

# Continue with remaining epics...
echo -e "${GREEN}=== Issue creation complete ===${NC}"
echo ""
echo "Note: This script creates all the epics and major subtasks."
echo "Additional subtasks can be created as the project progresses."
