# Billing API Usage Examples

This document provides practical examples of how to use the billing and subscriptions API.

## Prerequisites

- User must be authenticated (have a valid JWT token)
- Tenant must be created
- Stripe account must be configured with products and prices

## API Base URL

```
http://localhost:3000/api
```

## 1. Get Current Subscription

Retrieve the subscription details for the authenticated tenant.

### Request

```http
GET /api/billing/subscription
Authorization: Bearer <your-jwt-token>
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": "sub_123456",
    "status": "ACTIVE",
    "plan": "MONTHLY",
    "currentPeriodStart": "2024-01-01T00:00:00.000Z",
    "currentPeriodEnd": "2024-02-01T00:00:00.000Z",
    "cancelAtPeriodEnd": false,
    "trialEnd": null
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "No subscription found"
}
```

## 2. Create Checkout Session

Create a Stripe checkout session to start a new subscription.

### Request

```http
POST /api/billing/create-checkout-session
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "plan": "MONTHLY",
  "successUrl": "https://yourdomain.com/billing/success",
  "cancelUrl": "https://yourdomain.com/billing/cancel"
}
```

**Parameters:**
- `plan`: Either "MONTHLY" or "YEARLY"
- `successUrl`: URL to redirect after successful payment
- `cancelUrl`: URL to redirect if user cancels

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "https://checkout.stripe.com/c/pay/cs_test_..."
  }
}
```

**Usage:**
Redirect the user to the returned `url` to complete checkout.

### Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Subscription already exists for this tenant"
}
```

## 3. Create Customer Portal Session

Create a session URL for the Stripe customer portal where users can manage their subscription.

### Request

```http
POST /api/billing/portal-session
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "returnUrl": "https://yourdomain.com/billing"
}
```

**Parameters:**
- `returnUrl`: URL to redirect when user exits the portal

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "url": "https://billing.stripe.com/p/session/..."
  }
}
```

**Usage:**
Redirect the user to the returned `url` to access the customer portal.

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "No subscription found for this tenant"
}
```

## 4. Webhook Events (Internal)

The webhook endpoint handles Stripe events automatically. You don't call this directly; Stripe sends events to it.

### Supported Events

- `checkout.session.completed` - Activates subscription after successful payment
- `customer.subscription.created` - Records new subscription
- `customer.subscription.updated` - Updates subscription status
- `customer.subscription.deleted` - Marks subscription as canceled
- `invoice.payment_succeeded` - Logs successful payment
- `invoice.payment_failed` - Logs failed payment

## Complete Flow Example

### New Subscription Flow

1. **User Signs Up**
   ```
   POST /api/auth/signup
   { "email": "user@example.com", "password": "SecurePass123" }
   ```

2. **Create Tenant**
   ```
   POST /api/tenants
   { "name": "My Salon", "businessType": "salon" }
   ```

3. **Get Auth Token**
   ```
   POST /api/auth/login
   { "email": "user@example.com", "password": "SecurePass123" }
   ```

4. **Create Checkout Session**
   ```
   POST /api/billing/create-checkout-session
   Authorization: Bearer <token>
   {
     "plan": "MONTHLY",
     "successUrl": "https://myapp.com/success",
     "cancelUrl": "https://myapp.com/cancel"
   }
   ```

5. **Redirect to Stripe Checkout**
   - User completes payment on Stripe
   - Stripe redirects to successUrl

6. **Webhook Activates Subscription**
   - Stripe sends `checkout.session.completed` event
   - Backend activates subscription
   - Tenant status becomes ACTIVE

7. **Check Subscription**
   ```
   GET /api/billing/subscription
   Authorization: Bearer <token>
   ```

### Manage Subscription Flow

1. **Access Customer Portal**
   ```
   POST /api/billing/portal-session
   Authorization: Bearer <token>
   { "returnUrl": "https://myapp.com/billing" }
   ```

2. **User Manages Subscription**
   - Update payment method
   - Change plan
   - Cancel subscription
   - View invoices

3. **Webhooks Update Backend**
   - Stripe sends update events
   - Backend syncs subscription status
   - Tenant access updated accordingly

## Error Handling

All endpoints follow the same error response format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message (only in development)"
}
```

### Common Error Codes

- `400` - Bad Request (invalid input)
- `401` - Unauthorized (missing or invalid token)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Testing with Stripe Test Mode

Use Stripe's test cards:

**Successful Payment:**
- Card: `4242 4242 4242 4242`
- Date: Any future date
- CVC: Any 3 digits
- ZIP: Any 5 digits

**Payment Requires Authentication:**
- Card: `4000 0025 0000 3155`

**Card Declined:**
- Card: `4000 0000 0000 9995`

## Webhook Testing

Test webhooks locally using Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Trigger test events:

```bash
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
```
