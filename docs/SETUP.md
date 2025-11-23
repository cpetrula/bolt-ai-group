# Developer Setup Guide

This guide will help you set up the Bolt AI Group project for local development.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **npm**: v9.x or higher (comes with Node.js)
- **MySQL**: v8.0 or higher ([Download](https://dev.mysql.com/downloads/mysql/))
- **Git**: Latest version ([Download](https://git-scm.com/downloads))

### Recommended Tools

- **VS Code**: Code editor with good Vue/JavaScript support
- **Postman** or **Insomnia**: API testing
- **MySQL Workbench**: Database management
- **ngrok**: For testing webhooks locally

## Project Structure

```
bolt-ai-group/
├── backend/              # Node.js/Express API
│   ├── src/             # Source code
│   ├── prisma/          # Database schema and migrations
│   ├── package.json     # Backend dependencies
│   └── .env            # Backend environment variables
├── frontend/            # Vue 3 SPA
│   ├── src/            # Vue components and pages
│   ├── public/         # Static assets
│   ├── package.json    # Frontend dependencies
│   └── .env            # Frontend environment variables
├── docs/               # Documentation
└── README.md           # Project overview
```

## Step 1: Clone the Repository

```bash
git clone https://github.com/cpetrula/bolt-ai-group.git
cd bolt-ai-group
```

## Step 2: Database Setup

### Install MySQL

If you don't have MySQL installed:

**macOS** (using Homebrew):
```bash
brew install mysql
brew services start mysql
```

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
```

**Windows**:
Download and install from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)

### Create Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE bolt_ai_salon;

# Create user (optional, for security)
CREATE USER 'bolt_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON bolt_ai_salon.* TO 'bolt_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

## Step 3: Backend Setup

### Navigate to Backend Directory

```bash
cd backend
```

### Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js
- Prisma ORM
- bcrypt for password hashing
- jsonwebtoken for authentication
- Twilio SDK
- Stripe SDK
- OpenAI SDK
- And more...

### Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Environment
NODE_ENV=development

# Server
PORT=3000

# Database
DATABASE_URL="mysql://root:password@localhost:3306/bolt_ai_salon"

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Application
APP_NAME="Bolt AI Salon"

# Twilio (for telephony)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_monthly_id
STRIPE_YEARLY_PRICE_ID=price_yearly_id

# OpenAI (for AI assistant)
OPENAI_API_KEY=sk-your_openai_api_key

# Vapi (optional - for call orchestration)
VAPI_API_KEY=your_vapi_api_key
VAPI_ASSISTANT_ID=your_vapi_assistant_id

# ElevenLabs (optional - for TTS)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Run Database Migrations

```bash
npx prisma migrate dev
```

This will:
1. Create all database tables
2. Set up indexes and constraints
3. Apply the schema to your database

### Seed Demo Data (Optional)

To populate the database with demo data:

```bash
node prisma/seed-demo.js
```

This creates:
- Demo tenant with active status
- 3 sample employees with schedules
- 8 common salon services
- Service addons

### Start Backend Server

**Development mode** (with auto-reload):
```bash
npm run dev
```

**Production mode**:
```bash
npm start
```

The backend server should now be running at `http://localhost:3000`

### Verify Backend

Check the health endpoint:
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "database": "connected"
}
```

## Step 4: Frontend Setup

Open a new terminal window/tab.

### Navigate to Frontend Directory

```bash
cd frontend
```

### Install Dependencies

```bash
npm install
```

This installs:
- Vue 3
- Vue Router
- Pinia (state management)
- PrimeVue (UI components)
- Tailwind CSS
- Axios (HTTP client)
- And more...

### Configure Environment Variables

Create a `.env` file in the `frontend/` directory:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Backend API URL
VITE_API_URL=http://localhost:3000/api
```

### Start Frontend Development Server

```bash
npm run dev
```

The frontend should now be running at `http://localhost:5173`

### Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api

## Step 5: Testing the Setup

### Test User Registration

1. Go to http://localhost:5173/signup
2. Create a new account with:
   - Email: `test@example.com`
   - Password: `SecurePass123`
3. You should be redirected to the dashboard

### Test API Directly

**Sign Up**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

**Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123"
  }'
```

Save the token from the response for authenticated requests.

**Get Employees** (authenticated):
```bash
curl http://localhost:3000/api/employees \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Optional: Third-Party Service Setup

### Twilio Setup

1. Sign up at [Twilio](https://www.twilio.com/)
2. Get a phone number
3. Configure webhooks:
   - Voice: `http://your-ngrok-url/api/webhooks/twilio/voice`
   - SMS: `http://your-ngrok-url/api/webhooks/twilio/sms`
4. Add credentials to `.env`

**For local development**, use ngrok to expose your local server:

```bash
ngrok http 3000
```

Use the ngrok URL in Twilio webhook configuration.

### Stripe Setup

1. Sign up at [Stripe](https://stripe.com/)
2. Get your test API keys
3. Create products and prices:
   - Monthly: $295/month
   - Yearly: $2,832/year
4. Configure webhook endpoint: `http://your-domain/api/webhooks/stripe`
5. Add credentials to `.env`

### OpenAI Setup

1. Sign up at [OpenAI](https://openai.com/)
2. Create an API key
3. Add to `.env` as `OPENAI_API_KEY`

### Vapi Setup (Optional)

1. Sign up at [Vapi](https://vapi.ai/)
2. Create an assistant
3. Add credentials to `.env`

## Development Workflow

### Running Both Servers

Use two terminal windows/tabs:

**Terminal 1** (Backend):
```bash
cd backend
npm run dev
```

**Terminal 2** (Frontend):
```bash
cd frontend
npm run dev
```

### Hot Reloading

Both frontend and backend support hot reloading:
- **Frontend**: Vite automatically reloads on file changes
- **Backend**: nodemon restarts server on file changes

### Database Management

**View database in Prisma Studio**:
```bash
cd backend
npx prisma studio
```

This opens a GUI at `http://localhost:5555` to browse and edit data.

**Create a new migration**:
```bash
cd backend
npx prisma migrate dev --name migration_name
```

**Reset database** (⚠️ Deletes all data):
```bash
cd backend
npx prisma migrate reset
```

### Useful npm Scripts

**Backend** (`backend/package.json`):
```bash
npm run dev          # Start with nodemon (auto-reload)
npm start           # Start production server
npm test            # Run tests
npm run lint        # Run linter
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

**Frontend** (`frontend/package.json`):
```bash
npm run dev         # Start Vite dev server
npm run build       # Build for production
npm run preview     # Preview production build
npm run lint        # Run linter
```

## Troubleshooting

### Backend won't start

**Error**: `Error: P1001: Can't reach database server`
- **Solution**: Ensure MySQL is running and DATABASE_URL is correct

**Error**: `Error: P3009: migrate found failed migrations`
- **Solution**: Run `npx prisma migrate resolve --rolled-back <migration_name>`

**Error**: Port 3000 already in use
- **Solution**: Change PORT in `.env` or kill the process using port 3000

### Frontend won't start

**Error**: `ECONNREFUSED` when calling API
- **Solution**: Ensure backend is running and VITE_API_URL is correct

**Error**: Dependencies missing
- **Solution**: Delete `node_modules/` and `package-lock.json`, run `npm install`

### Database issues

**Can't connect to MySQL**:
```bash
# Check if MySQL is running
# macOS:
brew services list | grep mysql

# Linux:
sudo systemctl status mysql

# Start MySQL if not running
brew services start mysql  # macOS
sudo systemctl start mysql # Linux
```

**Permission denied**:
- Check MySQL user has proper privileges
- Verify DATABASE_URL credentials

### API returns 401 Unauthorized

- Ensure you're sending the Authorization header
- Check if token is expired (7 days default)
- Verify JWT_SECRET matches between token generation and validation

### Webhooks not working locally

- Use ngrok to expose local server
- Ensure webhook URLs in third-party services point to ngrok URL
- Check webhook signature validation is disabled in development

## IDE Setup

### VS Code Recommended Extensions

- **Vue - Official** (Vue.js support)
- **Prisma** (Prisma schema support)
- **ESLint** (JavaScript linting)
- **Prettier** (Code formatting)
- **GitLens** (Git integration)
- **REST Client** (Test APIs from VS Code)

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "Vue.volar"
  },
  "prisma.fileWatcher": true
}
```

### VS Code Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "skipFiles": ["<node_internals>/**"],
      "program": "${workspaceFolder}/backend/src/app.js",
      "envFile": "${workspaceFolder}/backend/.env"
    }
  ]
}
```

## Testing

### Manual API Testing

Use Postman or Insomnia with this collection structure:

```
Bolt AI Group API
├── Auth
│   ├── Sign Up
│   ├── Login
│   ├── Forgot Password
│   └── Reset Password
├── Employees
│   ├── List Employees
│   ├── Create Employee
│   └── Update Employee
├── Services
│   ├── List Services
│   └── Create Service
└── Appointments
    ├── List Appointments
    ├── Create Appointment
    └── Check Availability
```

### Running Automated Tests

```bash
cd backend
npm test
```

### Testing Webhooks Locally

**Install ngrok**:
```bash
# macOS
brew install ngrok

# Linux
snap install ngrok

# Or download from https://ngrok.com/download
```

**Start ngrok**:
```bash
ngrok http 3000
```

Copy the ngrok URL (e.g., `https://abc123.ngrok.io`) and use it in:
- Twilio webhook configuration
- Stripe webhook configuration
- Vapi webhook configuration

**Test Twilio webhook**:
```bash
curl -X POST https://abc123.ngrok.io/api/webhooks/twilio/voice \
  -d "CallSid=CAtest123" \
  -d "From=+15551234567" \
  -d "To=+15559876543"
```

## Database Seeding

### Seed Demo Data

```bash
cd backend
node prisma/seed-demo.js
```

### Custom Seed Data

Create your own seed script in `backend/prisma/seed-custom.js`:

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Create tenant
  const tenant = await prisma.tenant.create({
    data: {
      name: 'My Test Salon',
      businessType: 'salon',
      status: 'ACTIVE',
    },
  });

  // Create employee
  await prisma.employee.create({
    data: {
      tenantId: tenant.id,
      name: 'John Smith',
      role: 'Stylist',
      isActive: true,
    },
  });

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

Run it:
```bash
node prisma/seed-custom.js
```

## Environment Variables Reference

### Required Variables

- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: Secret key for JWT signing (use a strong random string)
- `PORT`: Server port (default: 3000)

### Optional but Recommended

- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`: For telephony features
- `STRIPE_SECRET_KEY`: For billing features
- `OPENAI_API_KEY`: For AI assistant features

### Generating Secure Secrets

**Generate JWT_SECRET**:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Next Steps

After completing the setup:

1. **Explore the codebase**: Start with `backend/src/app.js` and `frontend/src/main.js`
2. **Read the documentation**: Check out `docs/ARCHITECTURE.md` and `docs/API.md`
3. **Create a feature**: Try adding a new API endpoint or frontend page
4. **Run tests**: Ensure everything works with `npm test`
5. **Join the team**: Follow the contribution guidelines in `CONTRIBUTING.md`

## Getting Help

If you encounter issues:

1. Check the **Troubleshooting** section above
2. Review **Issue Tracker** on GitHub
3. Ask in team chat or discussions
4. Consult the **API Documentation** (`docs/API.md`)
5. Check **Prisma docs** for database issues: https://www.prisma.io/docs

## Quick Reference

### Commonly Used Commands

```bash
# Backend
cd backend && npm run dev              # Start backend dev server
cd backend && npx prisma studio        # Open database GUI
cd backend && npx prisma migrate dev   # Run migrations

# Frontend
cd frontend && npm run dev             # Start frontend dev server
cd frontend && npm run build           # Build for production

# Database
mysql -u root -p                       # Connect to MySQL
npx prisma migrate reset               # Reset database (⚠️ deletes data)
node prisma/seed-demo.js               # Seed demo data

# Testing
npm test                               # Run tests
curl http://localhost:3000/api/health  # Test backend health
```

### Default Credentials

**Demo User** (after seeding):
- Email: `demo@example.com`
- Password: `DemoPass123`

**Demo Phone Number**: Check console output after seeding

---

You're now ready to start developing! Happy coding! 🚀
