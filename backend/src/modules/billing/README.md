# Billing & Subscriptions Module

This module implements Stripe integration for handling recurring subscriptions and payments.

## Features

- Stripe customer creation
- Subscription plans (Monthly: $295, Yearly: $2,832)
- Checkout session flow
- Webhook handlers for Stripe events
- Customer portal integration
- Subscription lifecycle management

## Setup

### 1. Install Dependencies

The Stripe SDK is already installed via `npm install`.

### 2. Configure Environment Variables

Add the following to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_YEARLY_PRICE_ID=price_yearly_id
```

### 3. Create Stripe Products and Prices

In your Stripe Dashboard:

1. Create a product (e.g., "Bolt AI Salon Subscription")
2. Create two prices:
   - Monthly: $295/month (recurring)
   - Yearly: $2,832/year (recurring)
3. Copy the price IDs and update your environment variables

### 4. Set Up Webhook

1. In Stripe Dashboard, go to Developers > Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy the webhook signing secret and update `STRIPE_WEBHOOK_SECRET`

### 5. Run Database Migration

```bash
npx prisma migrate dev --name add_subscriptions
```

## API Endpoints

### Get Subscription

```http
GET /api/billing/subscription
Authorization: Bearer <token>
```

Returns the current subscription for the authenticated tenant.

### Create Checkout Session

```http
POST /api/billing/create-checkout-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "plan": "MONTHLY",  // or "YEARLY"
  "successUrl": "https://yourdomain.com/success",
  "cancelUrl": "https://yourdomain.com/cancel"
}
```

Returns a Stripe checkout session URL to redirect the user to.

### Create Portal Session

```http
POST /api/billing/portal-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "returnUrl": "https://yourdomain.com/dashboard"
}
```

Returns a Stripe customer portal URL for managing subscriptions.

### Webhook Endpoint

```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: <signature>
```

Handles Stripe webhook events. This endpoint is automatically verified using the webhook secret.

## Database Schema

The `Subscription` model tracks:

- `stripeCustomerId`: Stripe customer ID
- `stripeSubscriptionId`: Stripe subscription ID
- `status`: Current subscription status (ACTIVE, INACTIVE, PAST_DUE, CANCELED, UNPAID, TRIALING)
- `plan`: Subscription plan (MONTHLY, YEARLY)
- `currentPeriodStart`: Start of current billing period
- `currentPeriodEnd`: End of current billing period
- `cancelAtPeriodEnd`: Whether subscription will cancel at period end
- `trialEnd`: Trial end date (14 days by default)

## Subscription Flow

1. User signs up and creates a tenant
2. User is redirected to create a checkout session
3. User completes payment on Stripe Checkout
4. Webhook receives `checkout.session.completed` event
5. Subscription is activated in the database
6. Tenant status is updated to ACTIVE

## Subscription Status Mapping

Stripe status → Database status → Tenant status:

- `active` → ACTIVE → ACTIVE
- `trialing` → TRIALING → ACTIVE
- `past_due` → PAST_DUE → SUSPENDED
- `canceled` → CANCELED → INACTIVE
- `unpaid` → UNPAID → INACTIVE

## Security

- Webhook events are verified using Stripe signature
- All billing endpoints require authentication
- Raw body parsing is used only for webhook endpoint
- Multi-tenant isolation is maintained

## Testing

Use Stripe test mode for development:
- Test cards: https://stripe.com/docs/testing
- Webhook testing: Use Stripe CLI (`stripe listen --forward-to localhost:3000/api/webhooks/stripe`)

## Troubleshooting

### Webhook signature verification fails
- Ensure `STRIPE_WEBHOOK_SECRET` matches the webhook signing secret in Stripe Dashboard
- Verify the webhook endpoint receives raw body (not JSON parsed)

### Subscription not activating
- Check webhook events are being received
- Check application logs for errors
- Verify Stripe webhook is configured with correct events

### Customer portal not working
- Ensure customer portal is activated in Stripe Dashboard
- Verify the customer has an active subscription
