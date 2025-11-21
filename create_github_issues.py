#!/usr/bin/env python3
"""
Script to create GitHub issues for Bolt AI Group project based on README.md

This script creates a comprehensive set of epics and subtasks covering all
major components of the Bolt AI Salon Assistant application.

Usage:
    python3 create_github_issues.py

Requirements:
    - PyGithub library: pip install PyGithub
    - GitHub token with repo access (set as GH_TOKEN environment variable)
"""

import os
import sys
from github import Github, GithubException

# Issue data structure
LABELS_TO_CREATE = [
    ("backend", "0366d6", "Backend development tasks"),
    ("frontend", "fbca04", "Frontend development tasks"),
    ("ai", "a2eeef", "AI/ML related tasks"),
    ("telephony", "d73a4a", "Telephony/Twilio related tasks"),
    ("billing", "0e8a16", "Billing/payment related tasks"),
    ("auth", "c5def5", "Authentication related tasks"),
    ("database", "bfdadc", "Database related tasks"),
    ("docs", "d4c5f9", "Documentation tasks"),
    ("enhancement", "84b6eb", "New feature or request"),
]

# All issues to create
# Format: (title, body, labels_list)
ISSUES = [
    # ===== EPICS =====
    (
        "[EPIC] Backend Infrastructure Setup",
        """## Description

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

```
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
```

## Dependencies

None - this is a foundational epic

## Subtasks

Track progress with related subtask issues.""",
        ["backend", "enhancement", "database"]
    ),
    
    (
        "[EPIC] Authentication & 2FA System",
        """## Description

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

```
backend/src/modules/auth/
├─ auth.controller.ts
├─ auth.service.ts
├─ auth.routes.ts
├─ jwt.utils.ts
└─ 2fa.utils.ts
```

## Dependencies

- Backend Infrastructure Setup (database, ORM)
- User model in database

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/2fa/setup`
- `POST /api/auth/2fa/verify`""",
        ["backend", "auth", "enhancement"]
    ),
    
    (
        "[EPIC] Multi-Tenant Management",
        """## Description

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

```
backend/src/modules/tenants/
├─ tenant.model.ts
├─ tenant.controller.ts
├─ tenant.service.ts
└─ tenant.routes.ts
```

## Dependencies

- Backend Infrastructure Setup
- Authentication system

## API Endpoints

- `GET /api/me` (current user & tenant)
- `GET /api/tenant/settings`
- `PATCH /api/tenant/settings`""",
        ["backend", "enhancement", "database"]
    ),
    
    (
        "[EPIC] Employee & Service Management",
        """## Description

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

```
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
```

## Dependencies

- Backend Infrastructure Setup
- Multi-Tenant Management

## API Endpoints

### Employees
- `GET /api/employees`
- `POST /api/employees`
- `PATCH /api/employees/:id`
- `DELETE /api/employees/:id`
- `GET /api/employees/:id/schedule`
- `PUT /api/employees/:id/schedule`

### Services
- `GET /api/services`
- `POST /api/services`
- `PATCH /api/services/:id`
- `DELETE /api/services/:id`""",
        ["backend", "enhancement", "database"]
    ),
    
    (
        "[EPIC] Appointments & Availability System",
        """## Description

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

```
backend/src/modules/appointments/
├─ appointment.model.ts
├─ appointment.controller.ts
├─ appointment.service.ts
├─ availability.service.ts
└─ appointment.routes.ts
```

## Dependencies

- Employee & Service Management
- Multi-Tenant Management

## API Endpoints

- `GET /api/appointments`
- `POST /api/appointments`
- `PATCH /api/appointments/:id`
- `DELETE /api/appointments/:id`
- `GET /api/availability` (for AI and frontend)""",
        ["backend", "enhancement", "database"]
    ),
    
    (
        "[EPIC] Billing & Subscriptions (Stripe)",
        """## Description

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
- [ ] Monthly ($295) and yearly ($2,832) plans are configured
- [ ] Subscription status is synced via webhooks
- [ ] Customer portal allows plan management
- [ ] Cancellation flow updates both Stripe and database
- [ ] Subscription status affects tenant access

## Required Files/Directories

```
backend/src/modules/billing/
├─ subscription.model.ts
├─ billing.controller.ts
├─ billing.service.ts
├─ stripe.service.ts
├─ webhook.handler.ts
└─ billing.routes.ts
```

## Dependencies

- Backend Infrastructure Setup
- Multi-Tenant Management
- Authentication System

## API Endpoints

- `GET /api/billing/subscription`
- `POST /api/billing/create-checkout-session`
- `POST /api/billing/portal-session`
- `POST /api/webhooks/stripe`""",
        ["backend", "billing", "enhancement"]
    ),
    
    (
        "[EPIC] Telephony Integration (Twilio)",
        """## Description

Integrate Twilio for phone number provisioning, call handling, and SMS notifications.

## Objectives

- Set up Twilio account and API integration
- Implement phone number provisioning for new tenants
- Create webhook handlers for incoming calls
- Create webhook handlers for incoming SMS
- Implement SMS notification system
- Create call logging functionality

## Acceptance Criteria

- [ ] New tenants automatically get a Twilio phone number
- [ ] Incoming call webhooks identify tenant and forward to AI
- [ ] Incoming SMS webhooks are handled
- [ ] SMS notifications can be sent to customers
- [ ] SMS notifications can be sent to employees
- [ ] Call logs are created with duration and metadata
- [ ] Demo salon has a working phone number

## Required Files/Directories

```
backend/src/modules/telephony/
├─ twilio.service.ts
├─ telephony.controller.ts
├─ call.handler.ts
├─ sms.handler.ts
└─ telephony.routes.ts
```

## Dependencies

- Backend Infrastructure Setup
- Multi-Tenant Management
- Appointments System

## API Endpoints

- `POST /api/webhooks/twilio/voice` (incoming calls)
- `POST /api/webhooks/twilio/sms` (incoming SMS)""",
        ["backend", "telephony", "enhancement"]
    ),
    
    (
        "[EPIC] AI Assistant Integration",
        """## Description

Integrate AI capabilities for handling customer calls, understanding intent, and performing actions.

## Objectives

- Design pluggable AI provider interface
- Integrate with Vapi for call orchestration
- Integrate with OpenAI for LLM/NLU
- Configure TTS (ElevenLabs or OpenAI)
- Create AI-callable API endpoints
- Implement intent detection and handling
- Configure per-tenant AI settings

## Acceptance Criteria

- [ ] AI provider interface allows swapping implementations
- [ ] Vapi integration handles call orchestration
- [ ] OpenAI integration processes natural language
- [ ] TTS generates natural voice responses
- [ ] AI can query availability via API
- [ ] AI can create/modify/cancel appointments via API
- [ ] AI can retrieve service information
- [ ] AI can answer questions about hours
- [ ] Per-tenant configuration (greeting, tone, business hours)

## Required Files/Directories

```
backend/src/modules/ai-assistant/
├─ ai-provider.interface.ts
├─ vapi.service.ts
├─ openai.service.ts
├─ ai.controller.ts
├─ intent.handler.ts
└─ ai.routes.ts
```

## Dependencies

- Backend Infrastructure Setup
- Appointments & Availability System
- Telephony Integration
- Employee & Service Management

## API Endpoints

- `POST /api/ai/availability`
- `POST /api/ai/appointments`
- `POST /api/ai/services`""",
        ["backend", "ai", "enhancement"]
    ),
    
    (
        "[EPIC] Frontend Application (Vue 3)",
        """## Description

Set up the Vue 3 frontend application with Vite, Tailwind CSS, PrimeVue, and proper routing.

## Objectives

- Initialize Vite + Vue 3 project with TypeScript
- Set up Vue Router for SPA routing
- Configure Pinia for state management
- Integrate PrimeVue component library
- Set up Tailwind CSS
- Configure authentication state management
- Create layout components
- Set up API client for backend communication

## Acceptance Criteria

- [ ] Frontend project builds and runs successfully
- [ ] Vue Router is configured with public and authenticated routes
- [ ] Pinia stores are set up for user and tenant state
- [ ] PrimeVue components are available globally
- [ ] Tailwind CSS utilities work correctly
- [ ] Authentication guard protects /app routes
- [ ] API client handles JWT tokens automatically
- [ ] Responsive layout works on mobile and desktop

## Required Files/Directories

```
frontend/
├─ src/
│  ├─ main.ts
│  ├─ App.vue
│  ├─ router/
│  │  └─ index.ts
│  ├─ stores/
│  │  ├─ auth.ts
│  │  └─ tenant.ts
│  ├─ components/
│  ├─ layouts/
│  │  ├─ PublicLayout.vue
│  │  └─ DashboardLayout.vue
│  ├─ services/
│  │  └─ api.ts
│  └─ pages/
├─ public/
├─ package.json
├─ vite.config.ts
├─ tailwind.config.js
└─ README.md
```

## Dependencies

None - this is a foundational epic""",
        ["frontend", "enhancement"]
    ),
    
    (
        "[EPIC] Public Website Pages",
        """## Description

Create all public-facing pages for the marketing website.

## Objectives

- Create Home page with hero section and demo phone number
- Create Sign Up page with Stripe integration
- Create Login page with 2FA support
- Create Forgot Password page
- Create How It Works page
- Create FAQ page

## Acceptance Criteria

- [ ] Home page displays professional hero section
- [ ] Home page shows prominent demo phone number
- [ ] Home page includes value propositions
- [ ] Sign Up page collects business and owner information
- [ ] Sign Up page redirects to Stripe checkout
- [ ] Login page handles JWT authentication
- [ ] Login page supports 2FA verification
- [ ] Forgot Password page sends reset email
- [ ] How It Works page explains the service clearly
- [ ] FAQ page answers common questions
- [ ] All pages are responsive and accessible

## Required Files/Directories

```
frontend/src/pages/
├─ HomePage.vue
├─ SignUpPage.vue
├─ LoginPage.vue
├─ ForgotPasswordPage.vue
├─ HowItWorksPage.vue
└─ FAQPage.vue
```

## Dependencies

- Frontend Application (Vue 3)
- Backend Authentication API
- Backend Billing API""",
        ["frontend", "enhancement"]
    ),
    
    (
        "[EPIC] Admin Dashboard Pages",
        """## Description

Create all authenticated admin dashboard pages for salon management.

## Objectives

- Create Dashboard overview page
- Create Employees management page
- Create Services management page
- Create Appointments calendar/list page
- Create Billing & subscription page
- Create Reports page
- Create Settings page

## Acceptance Criteria

- [ ] Dashboard shows key metrics and next appointments
- [ ] Employees page has CRUD functionality with schedules
- [ ] Services page has CRUD functionality with pricing
- [ ] Appointments page shows calendar and list views
- [ ] Appointments page allows manual booking/editing
- [ ] Billing page shows current plan and payment method
- [ ] Billing page links to Stripe customer portal
- [ ] Reports page displays call logs and statistics
- [ ] Reports page shows appointment analytics
- [ ] Settings page manages business profile and preferences
- [ ] All pages respect multi-tenant isolation

## Required Files/Directories

```
frontend/src/pages/
├─ DashboardPage.vue
├─ EmployeesPage.vue
├─ ServicesPage.vue
├─ AppointmentsPage.vue
├─ BillingPage.vue
├─ ReportsPage.vue
└─ SettingsPage.vue
```

## Dependencies

- Frontend Application (Vue 3)
- All backend APIs""",
        ["frontend", "enhancement"]
    ),
    
    (
        "[EPIC] Reporting & Analytics",
        """## Description

Implement reporting and analytics features for call logs, appointments, and revenue.

## Objectives

- Create call logs data model
- Implement call logging on each call
- Create reports API endpoints
- Calculate appointment statistics
- Calculate revenue metrics
- Display reports in frontend

## Acceptance Criteria

- [ ] All calls are logged with metadata
- [ ] Call reports show total calls and breakdown by reason
- [ ] Appointment reports show upcoming and past appointments
- [ ] Cancellation reasons are tracked and reported
- [ ] Revenue reports show total and per-service breakdown
- [ ] Reports can be filtered by date range
- [ ] Reports display with charts/tables in frontend

## Required Files/Directories

```
backend/src/modules/reports/
├─ call-log.model.ts
├─ reports.controller.ts
├─ reports.service.ts
└─ reports.routes.ts
```

## Dependencies

- Telephony Integration
- Appointments System
- Frontend Dashboard Pages

## API Endpoints

- `GET /api/reports/calls`
- `GET /api/reports/appointments`
- `GET /api/reports/revenue`""",
        ["backend", "frontend", "enhancement"]
    ),
    
    (
        "[EPIC] Documentation",
        """## Description

Create comprehensive documentation for the project.

## Objectives

- Write architecture documentation
- Document all API endpoints
- Document database schema
- Document AI conversation flows
- Create developer setup guide
- Create deployment guide

## Acceptance Criteria

- [ ] ARCHITECTURE.md explains system design
- [ ] API.md documents all endpoints with examples
- [ ] DATA_MODEL.md shows complete database schema
- [ ] AI_FLOW.md explains AI conversation logic
- [ ] Setup guide allows new developers to run locally
- [ ] Deployment guide covers production setup

## Required Files/Directories

```
docs/
├─ ARCHITECTURE.md
├─ API.md
├─ DATA_MODEL.md
├─ AI_FLOW.md
├─ SETUP.md
└─ DEPLOYMENT.md
```

## Dependencies

- All other epics""",
        ["docs", "enhancement"]
    ),
    
    (
        "Create Branding Assets (Logo & Favicon)",
        """## Description

Create initial branding assets for Bolt AI Group.

## Tasks

- Design simple logo with "Bolt AI Group" text and bolt icon
- Create logo.svg file
- Create favicon.ico file
- Use consistent color scheme
- Ensure logo works on light and dark backgrounds

## Acceptance Criteria

- [ ] logo.svg file exists in frontend/public/
- [ ] favicon.ico file exists in frontend/public/
- [ ] Logo is clean and professional
- [ ] Logo includes company name and bolt icon
- [ ] Favicon is simplified bolt icon
- [ ] Assets are optimized for web

## Required Files

- `frontend/public/logo.svg`
- `frontend/public/favicon.ico`

## Dependencies

**Epic:** Frontend Application (Vue 3)""",
        ["frontend", "enhancement"]
    ),
    
    (
        "Set up Demo Salon Tenant",
        """## Description

Create and configure a demo salon tenant for the public demo phone number.

## Tasks

- Create demo tenant in database
- Provision Twilio number for demo
- Seed demo services with pricing
- Create demo employees with schedules
- Configure AI for demo tenant
- Add demo phone number to home page

## Acceptance Criteria

- [ ] Demo tenant exists with name "Demo Salon"
- [ ] Demo tenant has working Twilio phone number
- [ ] Demo services include common salon services
- [ ] Demo has 2-3 stylists with varied schedules
- [ ] AI is configured for demo tenant
- [ ] Demo phone number is prominently displayed on home page
- [ ] Calls to demo number work end-to-end

## Required Files

- Database seed script for demo tenant

## Dependencies

**Requires:** Tenant onboarding, Telephony integration, AI integration, Services seeding""",
        ["backend", "ai", "telephony", "enhancement"]
    ),
    
    (
        "Set up Docker Compose for Local Development",
        """## Description

Create docker-compose.yml for easy local development setup.

## Tasks

- Create docker-compose.yml file
- Add MySQL service
- Add backend service
- Add frontend service (optional)
- Configure environment variables
- Add volume mounts for data persistence
- Document usage in README

## Acceptance Criteria

- [ ] docker-compose.yml exists in root
- [ ] `docker-compose up` starts MySQL
- [ ] MySQL is accessible to backend
- [ ] Environment variables are configured
- [ ] Data persists between restarts
- [ ] README documents Docker setup

## Required Files

- `docker-compose.yml`
- `.env.example`

## Dependencies

**Epic:** Backend Infrastructure Setup""",
        ["backend", "database", "enhancement", "docs"]
    ),
]


def main():
    """Main function to create GitHub issues."""
    # Get GitHub token
    token = os.getenv("GH_TOKEN") or os.getenv("GITHUB_TOKEN")
    if not token:
        print("Error: GitHub token not found!")
        print("Please set GH_TOKEN or GITHUB_TOKEN environment variable")
        print("Example: export GH_TOKEN=your_token_here")
        sys.exit(1)
    
    # Get repository name (configurable via environment variable)
    repo_name = os.getenv("GITHUB_REPOSITORY", "cpetrula/bolt-ai-group")
    
    # Initialize GitHub client
    try:
        g = Github(token)
        # Get the repository (owner/repo format)
        repo = g.get_repo(repo_name)
        print(f"✓ Connected to repository: {repo.full_name}")
    except GithubException as e:
        print(f"Error connecting to GitHub: {e}")
        sys.exit(1)
    
    # Create labels
    print("\n=== Creating labels ===")
    existing_labels = {label.name: label for label in repo.get_labels()}
    
    for label_name, color, description in LABELS_TO_CREATE:
        try:
            if label_name in existing_labels:
                # Update existing label
                label = existing_labels[label_name]
                label.edit(label_name, color, description)
                print(f"✓ Updated label: {label_name}")
            else:
                # Create new label
                repo.create_label(label_name, color, description)
                print(f"✓ Created label: {label_name}")
        except GithubException as e:
            print(f"✗ Error with label '{label_name}': {e}")
    
    # Create issues
    print("\n=== Creating issues ===")
    created_count = 0
    failed_count = 0
    
    for title, body, labels in ISSUES:
        try:
            issue = repo.create_issue(
                title=title,
                body=body,
                labels=labels
            )
            created_count += 1
            print(f"✓ Created #{issue.number}: {title}")
        except GithubException as e:
            failed_count += 1
            print(f"✗ Failed to create '{title}': {e}")
    
    # Summary
    print("\n=== Summary ===")
    print(f"Successfully created: {created_count} issues")
    if failed_count > 0:
        print(f"Failed to create: {failed_count} issues")
    print("\nAll issues have been created in the repository!")
    print(f"View them at: https://github.com/{repo.full_name}/issues")


if __name__ == "__main__":
    main()
