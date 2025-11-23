Bolt AI Group – Salon AI Assistant (MVP Spec)

> **📋 GitHub Issues Available!** This specification has been broken down into comprehensive GitHub Issues. 
> 
> **Easiest method**: Go to [Actions tab](../../actions) → Run "Create GitHub Issues from README" workflow (no command line needed!)
> 
> **Alternative**: See [ISSUES_SUMMARY.md](ISSUES_SUMMARY.md) for all methods including command line.

1. Project Overview

Goal:
Build a multi-tenant web application for hair salons where each salon gets a virtual AI assistant that:

Answers calls

Sets, modifies, and cancels appointments

Provides pricing and duration info

Checks availability

Checks when specific hairdressers are working

Answers basic FAQ about hours and services

The app is designed to later support other business types (plumbers, electricians, etc.), so the architecture should be multi-tenant and business-type agnostic.

2. Tech Stack

Backend:

Node.js (TypeScript preferred for type safety)

Framework: Express or Fastify

Database: MySQL (multi-tenant friendly schema)

ORM: Prisma or TypeORM (pick one and use migrations)

Auth: JWT-based session tokens + 2FA (TOTP via e.g. speakeasy / otplib)

Background jobs: BullMQ / custom job queue (for async tasks, webhooks, SMS/email sending)

Frontend:

Vue 3 (Composition API)

Vite (build tool)

Vue Router (SPA routing)

Pinia (state management)

PrimeVue (UI components)

Tailwind CSS (styling utility classes)

Telephony & AI:

Phone numbers & call/SMS: Twilio

Unique phone number per customer (salon)

Webhooks for inbound calls and SMS

Voice & conversational AI (options; wire for easy swapping):

Vapi (for call orchestration)

OpenAI (for LLM / NLU)

ElevenLabs or OpenAI TTS for voice

Design for pluggable AI provider (e.g., AiProvider interface).

Billing & Subscriptions:

Payment processor suggestion: Stripe

Recurring billing: monthly and yearly plans

Webhooks: subscription created/updated/canceled

Store subscription status in DB

3. Repository Structure
bolt-ai-salon-assistant/
├─ backend/
│  ├─ src/
│  │  ├─ app.ts (Express/Fastify bootstrap)
│  │  ├─ config/
│  │  │  ├─ env.ts
│  │  │  └─ db.ts
│  │  ├─ modules/
│  │  │  ├─ auth/
│  │  │  ├─ tenants/
│  │  │  ├─ employees/
│  │  │  ├─ services/
│  │  │  ├─ appointments/
│  │  │  ├─ billing/
│  │  │  ├─ telephony/
│  │  │  ├─ ai-assistant/
│  │  │  └─ reports/
│  │  ├─ middleware/
│  │  ├─ routes/
│  │  ├─ jobs/
│  │  └─ utils/
│  ├─ prisma/ or migrations/
│  ├─ package.json
│  └─ README.md
│
├─ frontend/
│  ├─ src/
│  │  ├─ main.ts
│  │  ├─ router/
│  │  │  └─ index.ts
│  │  ├─ stores/
│  │  ├─ components/
│  │  ├─ layouts/
│  │  ├─ pages/
│  │  │  ├─ HomePage.vue
│  │  │  ├─ SignUpPage.vue
│  │  │  ├─ LoginPage.vue
│  │  │  ├─ ForgotPasswordPage.vue
│  │  │  ├─ HowItWorksPage.vue
│  │  │  ├─ FAQPage.vue
│  │  │  ├─ DashboardLayout.vue
│  │  │  ├─ EmployeesPage.vue
│  │  │  ├─ ServicesPage.vue
│  │  │  ├─ AppointmentsPage.vue
│  │  │  ├─ BillingPage.vue
│  │  │  └─ ReportsPage.vue
│  ├─ public/
│  │  ├─ favicon.ico
│  │  └─ logo.svg
│  ├─ package.json
│  └─ README.md
│
├─ docs/
│  ├─ ARCHITECTURE.md
│  ├─ API.md
│  ├─ DATA_MODEL.md
│  └─ AI_FLOW.md
│
├─ .env.example
├─ docker-compose.yml (optional)
└─ README.md (high level)

4. Business & Subscription Logic
4.1 Subscription Plans

Monthly plan

Price: $295 / month

Yearly plan

20% less than 12 months:

12 × 295 = 3540 → 20% off = 2832

Price: $2,832 / year

Each customer (tenant) has:

Current subscription plan

Billing period (monthly/yearly)

Subscription status: trialing | active | past_due | canceled

Stripe (or other) subscription/customer IDs

4.2 Billing Flows

On signup:

Create customer record in DB

Redirect to Stripe Checkout / billing portal

On successful payment (Stripe webhook):

Mark tenant as active

Trigger onboarding flow:

Create Twilio phone number

Seed default services (haircut, color, etc.)

Seed default hours (optional)

Create demo “admin” user

Cancellation:

From portal, owner can cancel subscription → call billing API → cancel in Stripe → update DB.

Recurring billing:

Handled by Stripe; webhooks keep DB in sync.

5. Core Features & User Stories
5.1 Public Website

Home Page

Professional modern design.

Above-the-fold hero section:

Clear statement of value (simple language).

Prominent demo phone number to call (Twilio number pointing to demo salon).

Example copy (can be refined in code):

Your AI assistant:

Never calls out sick

Is never in a bad mood

Can answer multiple calls at the same time

Is available 24 hours a day

Modernize your company and leverage the latest in technology to help your business thrive!

Sign-Up Page

Collect:

Business name, business type (default: Salon)

Owner name, email, phone

Password

2FA setup (TOTP or SMS).

Redirect to billing checkout.

Login & Auth

Email + password login.

2FA verification code.

“Forgot password” flow:

Request reset → email link with token → reset password page.

How It Works Page

Explain:

They receive a unique phone number to forward their existing line to.

Calls to that number are handled by the AI assistant.

They get access to an admin portal:

Manage employees

Manage services

View appointments and reports

FAQ Page

Common questions:

“How does the AI answer calls?”

“Can I customize my services and prices?”

“How do I cancel?”

“Is it safe and secure?”

5.2 Admin Portal (Per Tenant)

Once logged in, each customer sees only their own data (multi-tenant isolation).

Capabilities:

Employees / Contractors

Add, modify, remove employees.

For each employee:

Name

Role (stylist, receptionist, owner, etc.)

Work days and hours (weekly schedule)

Which services they can perform

Contact info (phone, email) for notifications.

Services

Add, modify, remove services.

Each service:

Name (e.g., “Women’s Haircut”)

Description

Add-ons (e.g., “Deep conditioning treatment”)

Price

Approximate duration (minutes)

Pre-populate with common salon services, prices, and durations (seed data).

Appointments

View upcoming appointments (filter by employee, date range).

View past appointments.

Ability to manually create/modify/cancel appointments via the UI.

View money coming in (simple revenue at first: sum of service prices).

Billing & Subscription

View current plan (monthly / yearly).

Next billing date.

Manage payment method via Stripe customer portal.

Cancel subscription.

Reports

Calls summary:

Total calls

Call reasons:

Set up appointment

Cancel appointment

Modify appointment

Get hours of operation

Get pricing

Other

Appointment summary:

Upcoming appointments

Past appointments

Cancellation reasons

Revenue summary

6. Data Model (MySQL – High Level)

Multi-tenant: Every business (tenant) has its own data, keyed by tenant_id.

6.1 Core Tables

tenants

id

name

business_type (e.g. "salon", future: "plumber")

primary_contact_name

primary_contact_email

primary_contact_phone

twilio_phone_number

status (trialing | active | suspended | canceled)

created_at, updated_at

users

id

tenant_id

email

password_hash

role (owner | manager | staff)

is_2fa_enabled

twofa_secret (for TOTP if used)

created_at, updated_at

subscriptions

id

tenant_id

plan ("monthly" | "yearly")

stripe_customer_id (or other gateway customer ID)

stripe_subscription_id

status (active | past_due | canceled)

current_period_start

current_period_end

cancel_at_period_end (bool)

created_at, updated_at

employees

id

tenant_id

name

role (stylist, assistant, etc.)

phone

email

is_active

created_at, updated_at

employee_schedules

id

tenant_id

employee_id

day_of_week (0–6)

start_time (e.g., "09:00")

end_time (e.g., "17:00")

services

id

tenant_id

name

description

base_price (decimal)

duration_minutes (int)

service_addons

id

tenant_id

service_id

name

price (decimal)

duration_minutes (int)

employee_services

id

tenant_id

employee_id

service_id

appointments

id

tenant_id

customer_name

customer_phone

customer_email (optional)

employee_id

service_id

addon_ids (JSON or join table)

start_time (datetime)

end_time (datetime)

status (booked | modified | canceled | completed)

cancel_reason (nullable text)

source (ai_call | manual | online_form)

created_at, updated_at

call_logs

id

tenant_id

call_sid (from Twilio)

from_number

to_number

start_time

end_time

duration_seconds

call_reason (enum: setup_appointment, cancel_appointment, modify_appointment, get_hours, get_pricing, other)

notes (optional transcript/summary)

created_at

notifications

id

tenant_id

type (sms | email)

recipient

message

status (queued | sent | failed)

related_appointment_id (nullable)

created_at

7. AI & Telephony Workflow
7.1 Call Flow (High Level)

Customer calls salon’s Twilio number.

Twilio hits backend webhook:

Identify tenant by to_number.

Forward call into AI pipeline (e.g., Vapi + OpenAI + TTS).

AI answers with a pleasant greeting, e.g.:

“Hi, thanks for calling [Salon Name]. I’m your virtual assistant. How can I help you today?”

AI understands intent:

Book appointment

Modify appointment

Cancel appointment

Ask about hours

Ask about services/pricing

AI interacts with backend via HTTP APIs:

GET /api/availability?tenant_id=...

POST /api/appointments

PATCH /api/appointments/:id

DELETE /api/appointments/:id

GET /api/services

GET /api/hours

When an appointment is created/modified/canceled:

Store/update record in appointments.

Send confirmation SMS to customer (Twilio).

Send SMS and email notifications to designated employees (owner/manager by default).

Log call in call_logs with call_reason.

If canceled, store cancel_reason (AI asks in friendly way and sends to API).

7.2 AI Training & Configuration

For each tenant:

Store configuration/profile:

Business name

Default greeting

Business hours

Services (names, prices, durations)

Preferred tone (friendly, professional, etc.)

This configuration is passed to the AI provider as context on each call.

AI provider integration (example design):

Backend exposes endpoints the AI can call:

/api/ai/availability

/api/ai/appointments

/api/ai/services

AI is configured with a tool/skills schema that maps user intent → HTTP calls.

8. Frontend Pages (Vue + PrimeVue + Tailwind)

Public:

/ – HomePage

/signup – SignUpPage

/login – LoginPage

/forgot-password – ForgotPasswordPage

/how-it-works – HowItWorksPage

/faq – FAQPage

Authenticated (under /app):

/app – Dashboard (overview stats, next appointments, quick links)

/app/employees – EmployeesPage

/app/services – ServicesPage

/app/appointments – AppointmentsPage (calendar + list)

/app/billing – BillingPage

/app/reports – ReportsPage

/app/settings – SettingsPage (business profile, greeting, notification preferences)

Use PrimeVue for forms, tables, dialogs, date/time pickers, and Tailwind utilities for spacing, layout, and branding.

9. Logo & Branding

Company Name: Bolt AI Group

Initial simple approach (for Copilot/placeholder):

logo.svg:

Clean logotype “Bolt AI Group” with a simple bolt icon.

favicon.ico:

Simplified bolt icon, flat design.

Later, you can refine via a designer or AI image tool.

10. Demo Salon Setup

Create a seeded demo tenant for the public “try it now” phone number on the home page:

Tenant: Demo Salon

Twilio number: +1-555-555-1234 (displayed on home page)

Status: ACTIVE

**What's Included:**
- 8 common salon services with pricing ($40-$220)
- 3 demo stylists with varied schedules
- AI configuration with custom greeting and business hours
- Service add-ons (Deep Conditioning, Olaplex, Beard Trim)

**Setup Instructions:**
1. Ensure database is running and configured in `.env`
2. Run: `cd backend && npm run prisma:generate`
3. Run: `node prisma/seed-demo.js`
4. Verify creation in console output

The seed script is idempotent and will recreate the demo tenant if run multiple times.

See `backend/prisma/seed-demo.js` and `backend/prisma/DEMO_SEED_README.md` for details.

Calls to the demo number go through the same AI pipeline, but are always mapped to the demo tenant.

11. Common Salon Service Seed Data (Example)

Seed into services and service_addons for new tenants (customizable later):

Women’s Haircut – $75 – 60 min

Men’s Haircut – $50 – 45 min

Kids’ Haircut – $40 – 45 min

Blowout – $60 – 45 min

Full Color – $150 – 120 min

Root Touch-Up – $95 – 90 min

Partial Highlights – $160 – 120 min

Full Highlights – $220 – 150 min

Deep Conditioning Treatment (addon) – $30 – 20 min

Olaplex Treatment (addon) – $40 – 20 min

12. Example API Endpoints (for Copilot)

Backend REST skeleton (to help Copilot generate controllers/services):

POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/2fa/setup
POST   /api/auth/2fa/verify

GET    /api/me                       (current user & tenant)
GET    /api/tenant/settings
PATCH  /api/tenant/settings

# Employees
GET    /api/employees
POST   /api/employees
PATCH  /api/employees/:id
DELETE /api/employees/:id

# Employee Schedules
GET    /api/employees/:id/schedule
PUT    /api/employees/:id/schedule

# Services
GET    /api/services
POST   /api/services
PATCH  /api/services/:id
DELETE /api/services/:id

# Appointments
GET    /api/appointments
POST   /api/appointments
PATCH  /api/appointments/:id
DELETE /api/appointments/:id

# Billing
GET    /api/billing/subscription
POST   /api/billing/create-checkout-session
POST   /api/billing/portal-session
POST   /api/webhooks/stripe            (Stripe webhooks)

# Telephony & AI
POST   /api/webhooks/twilio/voice      (incoming calls)
POST   /api/webhooks/twilio/sms        (incoming SMS)
POST   /api/ai/availability
POST   /api/ai/appointments
POST   /api/ai/services

# Reports
GET    /api/reports/calls
GET    /api/reports/appointments
GET    /api/reports/revenue

13. Copilot-Friendly Task Breakdown

You can create GitHub issues from these:

Backend Setup

Initialize Node.js + TypeScript + Express/Fastify.

Configure MySQL + ORM.

Implement multi-tenant middleware (derive tenant_id from authenticated user or Twilio number).

Auth & 2FA

Sign up, login, JWT, password reset.

TOTP or SMS 2FA.

Tenant & Subscription

Models for tenants and subscriptions.

Stripe integration: checkout + webhooks.

Employees & Services

CRUD endpoints.

Schedules and mapping employees ↔ services.

Appointments & Availability

Availability computation.

Appointment CRUD + conflict checks.

Telephony Integration

Twilio webhooks.

Number provisioning for new tenants.

SMS notifications.

AI Integration

Design AiProvider interface.

Initial integration with Vapi/OpenAI (or other).

Implement API endpoints used by AI for bookings.

Frontend SPA

Vite + Vue + Tailwind + PrimeVue scaffold.

Public pages (Home, Signup, Login, How It Works, FAQ).

Authenticated dashboard & admin pages.

Reporting

Call logs and appointment stats.

Basic charts/tables on frontend.

Branding

Basic logo/favicon placeholders.

Apply consistent Bolt AI Group styling.

14. Assumptions (You Can Adjust Later)

Single time zone per tenant (no multi-location/time-zone handling in MVP).

No double-booking of employees (simple conflict detection).

AI calls backend via HTTPS (no direct DB access).

Stripe is the main billing provider (others can be added later).
