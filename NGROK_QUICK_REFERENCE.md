# Ngrok Quick Reference Card

## Installation

```bash
# macOS
brew install ngrok/ngrok/ngrok

# Linux
snap install ngrok

# Windows
choco install ngrok
```

## First Time Setup

```bash
# 1. Sign up at https://dashboard.ngrok.com/signup
# 2. Get your authtoken from https://dashboard.ngrok.com/get-started/your-authtoken
# 3. Add authtoken
ngrok config add-authtoken YOUR_AUTHTOKEN
```

## Starting Ngrok

### Option 1: Automated Script (Recommended)
```bash
./start-ngrok.sh
```

**What it does:**
- ✓ Checks if ngrok is installed
- ✓ Verifies backend is running
- ✓ Starts ngrok on port 3000
- ✓ Auto-updates .env with NGROK_URL
- ✓ Displays all webhook URLs

### Option 2: Manual Start
```bash
ngrok http 3000
```

## Common Commands

```bash
# Start ngrok for backend
ngrok http 3000

# Start with custom domain (paid plan)
ngrok http --domain=myapp.ngrok.app 3000

# View web interface
open http://127.0.0.1:4040

# Get current tunnel URL
curl http://localhost:4040/api/tunnels | grep -o 'https://[^"]*ngrok[^"]*'

# Stop ngrok
pkill ngrok        # macOS/Linux
taskkill /IM ngrok.exe /F  # Windows
```

## Webhook URLs

After starting ngrok with URL `https://abc123.ngrok-free.app`:

| Service | Webhook URL |
|---------|-------------|
| **Twilio Voice** | `https://abc123.ngrok-free.app/api/webhooks/twilio/voice` |
| **Twilio SMS** | `https://abc123.ngrok-free.app/api/webhooks/twilio/sms` |
| **Stripe** | `https://abc123.ngrok-free.app/api/webhooks/stripe` |
| **Vapi** | `https://abc123.ngrok-free.app/api/ai/webhooks/vapi` |

## Configuration Locations

| Service | Configuration URL |
|---------|------------------|
| **Twilio** | https://console.twilio.com/ → Phone Numbers |
| **Stripe** | https://dashboard.stripe.com/ → Developers → Webhooks |
| **Vapi** | https://dashboard.vapi.ai/ → Assistant Settings |
| **Ngrok Dashboard** | https://dashboard.ngrok.com/ |

## Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| "Command not found: ngrok" | Install ngrok (see Installation above) |
| "authtoken required" | Run: `ngrok config add-authtoken YOUR_TOKEN` |
| "Port 3000 not available" | Start backend: `cd backend && npm run dev` |
| Backend not responding | Check `http://localhost:3000/api/health` |
| Webhooks not working | Verify URL in service dashboard |
| URL changes on restart | Use paid plan for static domain |
| Can't view requests | Open web interface: http://127.0.0.1:4040 |

## Development Workflow

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Ngrok:**
```bash
./start-ngrok.sh
# Or manually:
ngrok http 3000
```

**Terminal 3 - Frontend (optional):**
```bash
cd frontend
npm run dev
```

## Important Notes

- **Free Plan**: URL changes each time you restart ngrok
- **Paid Plan**: Get static domain (`yourapp.ngrok.app`)
- **Web Interface**: Always available at `http://127.0.0.1:4040`
- **Security**: Always validate webhook signatures
- **Environment**: Update NGROK_URL in `backend/.env` after restart

## Testing Webhooks

### Test Twilio
Call your Twilio number and watch requests at:
```
http://127.0.0.1:4040
```

### Test Stripe
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhook events
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Trigger test event
stripe trigger customer.subscription.created
```

### Test Manually
```bash
# Test webhook endpoint
curl -X POST https://your-ngrok-url.ngrok-free.app/api/webhooks/twilio/voice \
  -d "CallSid=TEST123" \
  -d "From=+15551234567" \
  -d "To=+15559876543"
```

## Resources

- **Full Guide**: [NGROK_SETUP.md](NGROK_SETUP.md)
- **Setup Guide**: [docs/SETUP.md](docs/SETUP.md)
- **Ngrok Docs**: https://ngrok.com/docs
- **Dashboard**: https://dashboard.ngrok.com

## Support

For detailed help, see:
1. [NGROK_SETUP.md](NGROK_SETUP.md) - Complete setup guide
2. [docs/SETUP.md](docs/SETUP.md) - Development setup
3. https://ngrok.com/docs - Official documentation

---

**Quick Start:**
```bash
# 1. Install ngrok (if needed)
brew install ngrok/ngrok/ngrok

# 2. Add authtoken (first time only)
ngrok config add-authtoken YOUR_TOKEN

# 3. Start backend
cd backend && npm run dev

# 4. Start ngrok (in new terminal)
./start-ngrok.sh

# 5. Copy webhook URLs and configure services
```
