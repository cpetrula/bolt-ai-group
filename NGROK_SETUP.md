# Ngrok Setup Guide for Local Testing

This guide will help you set up Ngrok to test the Bolt AI Group application locally with external webhooks (Twilio, Stripe, Vapi).

## Table of Contents

- [What is Ngrok?](#what-is-ngrok)
- [Why Use Ngrok?](#why-use-ngrok)
- [Installation](#installation)
- [Quick Start](#quick-start)
- [Configuration](#configuration)
- [Webhook Setup](#webhook-setup)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## What is Ngrok?

Ngrok is a tool that creates secure tunnels to your localhost, allowing external services to reach your local development server. This is essential for testing webhooks from services like Twilio, Stripe, and Vapi during development.

## Why Use Ngrok?

In the Bolt AI Group application, you need Ngrok to:

- **Test Twilio webhooks**: Receive incoming call and SMS notifications
- **Test Stripe webhooks**: Handle subscription events (created, updated, canceled)
- **Test Vapi webhooks**: Process AI assistant callbacks
- **Demo the application**: Share your local development with stakeholders
- **Debug in real-time**: See webhook payloads as they arrive

Without Ngrok, these external services can't reach your `localhost:3000` backend.

## Installation

### Method 1: Download from Website (Recommended)

1. Visit [https://ngrok.com/download](https://ngrok.com/download)
2. Download the version for your operating system
3. Extract the downloaded file
4. Move to a location in your PATH

**macOS/Linux:**
```bash
# After downloading, move to /usr/local/bin
sudo mv ngrok /usr/local/bin/ngrok
sudo chmod +x /usr/local/bin/ngrok
```

**Windows:**
- Extract `ngrok.exe` to a folder (e.g., `C:\ngrok`)
- Add that folder to your system PATH

### Method 2: Package Managers

**macOS (Homebrew):**
```bash
brew install ngrok/ngrok/ngrok
```

**Linux (Snap):**
```bash
snap install ngrok
```

**Windows (Chocolatey):**
```bash
choco install ngrok
```

### Verify Installation

```bash
ngrok version
# Output: ngrok version 3.x.x
```

## Quick Start

### Step 1: Sign Up for Ngrok Account (Free)

1. Go to [https://dashboard.ngrok.com/signup](https://dashboard.ngrok.com/signup)
2. Create a free account
3. After signing up, you'll get an **authtoken**

### Step 2: Add Your Authtoken

```bash
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

This saves your token to `~/.ngrok2/ngrok.yml` (or `%USERPROFILE%\.ngrok2\ngrok.yml` on Windows).

### Step 3: Start Your Backend Server

```bash
cd backend
npm run dev
```

Your backend should be running on `http://localhost:3000`

### Step 4: Start Ngrok

**In a new terminal window:**
```bash
ngrok http 3000
```

You'll see output like this:

```
ngrok                                                                                                    

Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.5.0
Region                        United States (us)
Latency                       -
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123def456.ngrok-free.app -> http://localhost:3000

Connections                   ttl     opn     rt1     rt5     p50     p90
                              0       0       0.00    0.00    0.00    0.00
```

**Important URLs:**
- **Public URL**: `https://abc123def456.ngrok-free.app` (use this for webhooks)
- **Web Interface**: `http://127.0.0.1:4040` (view requests in real-time)

### Step 5: Test Your Setup

Open your browser and visit the ngrok URL:
```
https://abc123def456.ngrok-free.app/api/health
```

You should see your backend's health check response.

## Configuration

### Using a Custom Domain (Paid Plans)

If you have an ngrok paid plan with a custom domain:

```bash
ngrok http --domain=your-domain.ngrok.app 3000
```

### Using a Configuration File

Create `ngrok.yml` for persistent configuration:

**Location:**
- macOS/Linux: `~/.ngrok2/ngrok.yml`
- Windows: `%USERPROFILE%\.ngrok2\ngrok.yml`

**Example Configuration:**
```yaml
version: "2"
authtoken: YOUR_AUTHTOKEN_HERE

tunnels:
  backend:
    proto: http
    addr: 3000
    # Optional: subdomain (requires paid plan)
    # subdomain: myapp
    # Optional: custom domain (requires paid plan)
    # hostname: myapp.ngrok.app
    
  frontend:
    proto: http
    addr: 5173
```

**Start multiple tunnels:**
```bash
ngrok start --all
```

**Start specific tunnel:**
```bash
ngrok start backend
```

### Environment Variables

Add your ngrok URL to the backend `.env`:

```bash
# backend/.env

# Ngrok URL (update this when ngrok restarts)
NGROK_URL=https://abc123def456.ngrok-free.app

# OR use it to construct webhook URLs
TWILIO_WEBHOOK_BASE_URL=https://abc123def456.ngrok-free.app
STRIPE_WEBHOOK_BASE_URL=https://abc123def456.ngrok-free.app
```

**Pro Tip:** With a free ngrok account, the URL changes each time you restart ngrok. Consider:
- Using a paid plan for a persistent domain
- Creating a script to update your `.env` automatically
- Using ngrok's API to fetch the current URL

## Webhook Setup

### Twilio Webhooks

1. **Get your ngrok URL:**
   ```
   https://abc123def456.ngrok-free.app
   ```

2. **Log in to Twilio Console:** [https://console.twilio.com](https://console.twilio.com)

3. **Configure Phone Number:**
   - Go to **Phone Numbers** → **Manage** → **Active Numbers**
   - Click on your phone number
   - Under **Voice & Fax**, set:
     - **A Call Comes In**: Webhook
     - **URL**: `https://abc123def456.ngrok-free.app/api/webhooks/twilio/voice`
     - **HTTP**: POST
   - Under **Messaging**, set:
     - **A Message Comes In**: Webhook
     - **URL**: `https://abc123def456.ngrok-free.app/api/webhooks/twilio/sms`
     - **HTTP**: POST
   - Click **Save**

4. **Test it:**
   ```bash
   # Call or text your Twilio number
   # Watch the requests come in at http://127.0.0.1:4040
   ```

### Stripe Webhooks

1. **Get your ngrok URL:**
   ```
   https://abc123def456.ngrok-free.app
   ```

2. **Log in to Stripe Dashboard:** [https://dashboard.stripe.com](https://dashboard.stripe.com)

3. **Add Webhook Endpoint:**
   - Go to **Developers** → **Webhooks**
   - Click **Add endpoint**
   - **Endpoint URL**: `https://abc123def456.ngrok-free.app/api/webhooks/stripe`
   - **Events to send**: Select:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Click **Add endpoint**

4. **Get Webhook Signing Secret:**
   - Click on your new webhook endpoint
   - Copy the **Signing secret** (starts with `whsec_`)
   - Add it to `backend/.env`:
     ```
     STRIPE_WEBHOOK_SECRET=whsec_your_webhook_signing_secret
     ```

5. **Test it:**
   ```bash
   # Use Stripe CLI or Dashboard to trigger test events
   stripe trigger customer.subscription.created
   ```

### Vapi Webhooks

1. **Get your ngrok URL:**
   ```
   https://abc123def456.ngrok-free.app
   ```

2. **Log in to Vapi Dashboard:** [https://dashboard.vapi.ai](https://dashboard.vapi.ai)

3. **Configure Assistant:**
   - Go to your Assistant settings
   - Under **Server URL**, set:
     ```
     https://abc123def456.ngrok-free.app/api/ai/webhooks/vapi
     ```
   - Save changes

4. **Test it:**
   - Make a test call through Vapi
   - Monitor requests at `http://127.0.0.1:4040`

## Best Practices

### 1. Use Ngrok Web Interface

Always keep the web interface open while testing:
```
http://127.0.0.1:4040
```

**Features:**
- **Inspect**: View all HTTP requests/responses in real-time
- **Replay**: Resend requests to test your code changes
- **Filter**: Search for specific requests

### 2. Keep Terminal Windows Organized

Use three terminal windows/tabs:

**Terminal 1: Backend Server**
```bash
cd backend
npm run dev
```

**Terminal 2: Ngrok Tunnel**
```bash
ngrok http 3000
```

**Terminal 3: Frontend (optional)**
```bash
cd frontend
npm run dev
```

### 3. Save Your Ngrok URL

After starting ngrok, immediately copy the URL and update:
- Backend `.env` file
- Webhook configurations (Twilio, Stripe, Vapi)
- Any documentation or team chat

### 4. Use a Persistent Domain (Paid)

If you restart ngrok frequently, consider upgrading to a paid plan for:
- **Static domain**: `https://yourapp.ngrok.app` (never changes)
- **Multiple simultaneous tunnels**
- **No connection limits**

Free plan is fine for occasional testing!

### 5. Secure Your Endpoints

Even though ngrok URLs are hard to guess, always:
- Validate webhook signatures (Twilio, Stripe)
- Check request origins
- Use HTTPS only
- Don't expose sensitive data in logs

### 6. Monitor Ngrok Status

Check the ngrok dashboard periodically:
```
https://dashboard.ngrok.com
```

View:
- Active tunnels
- Connection history
- Data transferred
- Plan limits

## Troubleshooting

### Issue: "Command not found: ngrok"

**Solution:**
```bash
# Verify ngrok is in PATH
which ngrok

# If not found, add to PATH or use full path
/path/to/ngrok http 3000
```

### Issue: "authtoken required"

**Solution:**
```bash
# Sign up at https://dashboard.ngrok.com/signup
# Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
```

### Issue: "Port 3000 is not available"

**Solution:**
```bash
# 1. Check if backend is running
lsof -i :3000

# 2. Start backend if not running
cd backend
npm run dev

# 3. Or use a different port
ngrok http 3001
```

### Issue: "Too many connections" (Free Plan)

**Solution:**
- Free plan has connection limits
- Upgrade to paid plan, or
- Restart ngrok to reset connections

### Issue: Webhooks not reaching your app

**Checklist:**
1. ✅ Backend server is running (`http://localhost:3000/api/health`)
2. ✅ Ngrok is running (`ngrok http 3000`)
3. ✅ Ngrok URL is correct in webhook configuration
4. ✅ Webhook endpoint exists in your code
5. ✅ No firewall blocking ngrok
6. ✅ Check ngrok web interface for incoming requests

### Issue: "ERR_NGROK_3200" - Tunnel not found

**Solution:**
```bash
# Kill all ngrok processes
pkill ngrok
# Or on Windows:
taskkill /F /IM ngrok.exe

# Restart ngrok
ngrok http 3000
```

### Issue: SSL/TLS certificate errors

**Solution:**
- Ngrok automatically provides HTTPS with valid certificates
- Ensure you're using the `https://` URL (not `http://`)
- Check if your backend accepts HTTPS requests

### Issue: Ngrok URL changes every restart

**Solution:**
1. **Free Plan**: Accept that URLs change, or
2. **Paid Plan**: Get a static subdomain/domain
3. **Script it**: Create a script to auto-update webhooks

**Auto-update script example:**
```bash
#!/bin/bash
# update-ngrok-url.sh

# Get ngrok URL (works with jq if available, otherwise uses grep)
if command -v jq &> /dev/null; then
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url // empty')
else
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4 | head -1)
fi

echo "Current ngrok URL: $NGROK_URL"

# Update .env file (handles macOS and Linux)
if [[ -n "$NGROK_URL" ]]; then
    # Escape forward slashes for sed
    ESCAPED_URL=$(echo "$NGROK_URL" | sed 's/\//\\\//g')
    
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/^NGROK_URL=.*/NGROK_URL=$ESCAPED_URL/" backend/.env
    else
        # Linux
        sed -i "s/^NGROK_URL=.*/NGROK_URL=$ESCAPED_URL/" backend/.env
    fi
    
    echo "Updated backend/.env"
    echo "Don't forget to update Twilio, Stripe, and Vapi webhook URLs!"
else
    echo "Failed to get ngrok URL"
fi
```

**Or use the automated script included in the repo:**
```bash
./start-ngrok.sh
```

### Issue: Request timeout

**Solution:**
- Free ngrok tunnels may have slower performance
- Check your backend logs for errors
- Verify backend is responding (test `localhost:3000` directly)
- Consider upgrading to paid plan for better performance

## Testing Checklist

After setting up ngrok, verify everything works:

- [ ] Ngrok tunnel is running
- [ ] Can access backend health endpoint via ngrok URL
- [ ] Ngrok web interface shows requests at `http://127.0.0.1:4040`
- [ ] Twilio webhook configured and tested (call/SMS works)
- [ ] Stripe webhook configured and tested (subscription events work)
- [ ] Vapi webhook configured (if using AI assistant)
- [ ] Backend logs show incoming webhook requests
- [ ] No SSL/TLS errors

## Quick Reference Commands

```bash
# Install ngrok (macOS)
brew install ngrok/ngrok/ngrok

# Add authtoken (do this once)
ngrok config add-authtoken YOUR_AUTHTOKEN

# Start ngrok for backend (most common)
ngrok http 3000

# Start ngrok with custom subdomain (paid)
ngrok http --domain=myapp.ngrok.app 3000

# Start ngrok with basic auth (protect your tunnel)
ngrok http 3000 --basic-auth="user:password"

# Start multiple tunnels from config
ngrok start --all

# View active tunnels
curl http://localhost:4040/api/tunnels

# Kill ngrok
pkill ngrok  # macOS/Linux
taskkill /F /IM ngrok.exe  # Windows
```

## Additional Resources

- **Ngrok Documentation**: [https://ngrok.com/docs](https://ngrok.com/docs)
- **Ngrok Dashboard**: [https://dashboard.ngrok.com](https://dashboard.ngrok.com)
- **Twilio Webhooks**: [https://www.twilio.com/docs/usage/webhooks](https://www.twilio.com/docs/usage/webhooks)
- **Stripe Webhooks**: [https://stripe.com/docs/webhooks](https://stripe.com/docs/webhooks)
- **Vapi Documentation**: [https://docs.vapi.ai](https://docs.vapi.ai)

## Next Steps

After setting up ngrok:

1. **Test a Twilio call**: Call your Twilio number and watch the webhook arrive
2. **Test a Stripe event**: Trigger a test event from Stripe dashboard
3. **Monitor requests**: Keep the ngrok web interface open while developing
4. **Read the API docs**: See `docs/API.md` for endpoint details
5. **Set up your AI assistant**: Configure Vapi to use your ngrok URL

---

**Need help?** Check the [main setup guide](docs/SETUP.md) or open an issue on GitHub.

Happy testing! 🚀
