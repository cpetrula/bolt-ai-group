# Deployment Guide

This guide covers deploying the Bolt AI Group application to production environments.

## Table of Contents

- [Deployment Overview](#deployment-overview)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Setup](#environment-setup)
- [Database Setup](#database-setup)
- [Backend Deployment](#backend-deployment)
- [Frontend Deployment](#frontend-deployment)
- [Third-Party Services](#third-party-services)
- [Monitoring and Logging](#monitoring-and-logging)
- [Scaling](#scaling)
- [Backup and Disaster Recovery](#backup-and-disaster-recovery)
- [Security Hardening](#security-hardening)
- [Troubleshooting](#troubleshooting)

## Deployment Overview

### Recommended Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         CloudFlare                          │
│                      (CDN + DDoS Protection)                │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐            ┌──────────────────┐
│   Frontend       │            │   Backend        │
│   (Vercel/       │            │   (Railway/      │
│    Netlify)      │            │    Render)       │
│                  │            │                  │
│  - Static Files  │            │  - Express API   │
│  - Vue 3 SPA     │            │  - Node.js       │
└──────────────────┘            └────────┬─────────┘
                                         │
                                         ▼
                                ┌──────────────────┐
                                │   MySQL          │
                                │   (PlanetScale/  │
                                │    AWS RDS)      │
                                └──────────────────┘
```

### Platform Options

#### Backend Hosting
- **Railway**: Easy Node.js deployment, built-in database
- **Render**: Free tier available, auto-deploy from Git
- **DigitalOcean App Platform**: Managed platform
- **AWS Elastic Beanstalk**: Enterprise-grade, scalable
- **Heroku**: Simple deployment (paid)
- **Google Cloud Run**: Serverless containers

#### Frontend Hosting
- **Vercel**: Optimized for Vue/Vite, automatic HTTPS
- **Netlify**: Free tier, continuous deployment
- **Cloudflare Pages**: Fast CDN, free tier
- **AWS S3 + CloudFront**: Enterprise solution
- **GitHub Pages**: Simple static hosting (limited features)

#### Database Hosting
- **PlanetScale**: Managed MySQL, serverless
- **AWS RDS**: Enterprise MySQL, fully managed
- **DigitalOcean Managed Databases**: Cost-effective
- **Railway**: Bundled with platform
- **Google Cloud SQL**: Managed MySQL

## Pre-Deployment Checklist

### Code Readiness
- [ ] All tests passing
- [ ] No console.log() or debug code in production
- [ ] Error handling implemented
- [ ] Rate limiting configured
- [ ] CORS configured for production domain
- [ ] Environment variables documented

### Security
- [ ] All secrets in environment variables (not in code)
- [ ] Strong JWT_SECRET generated
- [ ] HTTPS enforced
- [ ] Database credentials secured
- [ ] API keys for third-party services obtained
- [ ] Webhook signature validation enabled

### Third-Party Services
- [ ] Twilio account set up and phone number provisioned
- [ ] Stripe account configured with production keys
- [ ] OpenAI API key obtained
- [ ] Email service configured (SendGrid, Mailgun, etc.)
- [ ] Monitoring service set up (optional)

### Database
- [ ] Migrations tested
- [ ] Backup strategy planned
- [ ] Connection pooling configured
- [ ] Indexes optimized

### Performance
- [ ] Frontend assets minified
- [ ] Images optimized
- [ ] Caching headers configured
- [ ] CDN configured (optional)

## Environment Setup

### Backend Environment Variables

Create a `.env` file for production with the following variables:

```env
# Environment
NODE_ENV=production

# Server
PORT=3000
API_URL=https://api.yourdomain.com

# Database
DATABASE_URL="mysql://user:password@host:3306/database_name?sslaccept=strict"

# JWT Authentication
JWT_SECRET=<generate-strong-secret-use-crypto.randomBytes>
JWT_EXPIRES_IN=7d

# Application
APP_NAME="Bolt AI Group"
FRONTEND_URL=https://yourdomain.com

# Twilio (Production)
TWILIO_ACCOUNT_SID=your_production_account_sid
TWILIO_AUTH_TOKEN=your_production_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_your_production_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_production_webhook_secret
STRIPE_MONTHLY_PRICE_ID=price_production_monthly_id
STRIPE_YEARLY_PRICE_ID=price_production_yearly_id
STRIPE_SUCCESS_URL=https://yourdomain.com/success
STRIPE_CANCEL_URL=https://yourdomain.com/cancel

# OpenAI (Production)
OPENAI_API_KEY=sk-your_production_openai_key

# Vapi (Optional)
VAPI_API_KEY=your_production_vapi_key
VAPI_ASSISTANT_ID=your_production_assistant_id

# Email (Optional - for password reset, notifications)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
SMTP_FROM=noreply@yourdomain.com

# Monitoring (Optional)
SENTRY_DSN=https://your_sentry_dsn
LOG_LEVEL=info
```

### Frontend Environment Variables

Create a `.env.production` file:

```env
VITE_API_URL=https://api.yourdomain.com/api
VITE_APP_NAME="Bolt AI Group"
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_your_publishable_key
```

### Generating Secrets

```bash
# Generate strong JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate another secret if needed
openssl rand -base64 64
```

## Database Setup

### Option 1: PlanetScale (Recommended for MySQL)

1. **Sign up** at [PlanetScale](https://planetscale.com/)
2. **Create database**:
   ```bash
   pscale database create bolt-ai-production
   ```
3. **Create password**:
   ```bash
   pscale password create bolt-ai-production main
   ```
4. **Update DATABASE_URL** in environment variables
5. **Push schema**:
   ```bash
   npx prisma db push
   ```

**Note**: PlanetScale doesn't support foreign key constraints. Prisma handles this at application level.

### Option 2: AWS RDS

1. **Create RDS MySQL instance** via AWS Console
2. **Configure security groups** to allow access from your application
3. **Enable SSL**:
   ```
   DATABASE_URL="mysql://user:pass@host:3306/db?ssl-ca=/path/to/certificate.pem"
   ```
4. **Run migrations**:
   ```bash
   npx prisma migrate deploy
   ```

### Option 3: Railway Database

1. Railway automatically provisions a MySQL database
2. Connection string provided in environment variables
3. **Run migrations** after deployment:
   ```bash
   npx prisma migrate deploy
   ```

### Database Migration Strategy

**Initial deployment**:
```bash
npx prisma migrate deploy
```

**For updates**:
```bash
# 1. Test migration locally
npx prisma migrate dev --name migration_name

# 2. Commit migration files
git add prisma/migrations/
git commit -m "Add migration: migration_name"

# 3. Deploy will run migrations automatically (if configured)
# Or run manually:
npx prisma migrate deploy
```

## Backend Deployment

### Option 1: Railway (Recommended)

**1. Install Railway CLI**:
```bash
npm i -g @railway/cli
```

**2. Login**:
```bash
railway login
```

**3. Initialize project**:
```bash
cd backend
railway init
```

**4. Add environment variables**:
```bash
railway variables set NODE_ENV=production
railway variables set DATABASE_URL="mysql://..."
railway variables set JWT_SECRET="..."
# ... add all other variables
```

**5. Deploy**:
```bash
railway up
```

**6. Set up custom domain** (optional):
- Go to Railway dashboard
- Click on your service
- Add custom domain

**7. Configure auto-deploy**:
- Connect GitHub repository
- Select branch (main/production)
- Railway will auto-deploy on push

**Railway Configuration** (`railway.toml`):
```toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "npm start"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10
```

### Option 2: Render

**1. Create Render account** at [Render](https://render.com/)

**2. Create new Web Service**:
- Connect GitHub repository
- Select `backend` directory
- Configure:
  - Name: bolt-ai-backend
  - Environment: Node
  - Build Command: `npm install && npx prisma generate`
  - Start Command: `npm start`

**3. Add environment variables** in Render dashboard

**4. Deploy**:
- Render auto-deploys on git push
- Or manually trigger from dashboard

**5. Set up custom domain** in Render settings

### Option 3: DigitalOcean App Platform

**1. Create DigitalOcean account**

**2. Create App**:
- Connect GitHub repository
- Select backend directory
- Choose Node.js

**3. Configure**:
```yaml
# .do/app.yaml
name: bolt-ai-backend
services:
- name: api
  github:
    repo: your-org/bolt-ai-group
    branch: main
    deploy_on_push: true
  source_dir: /backend
  build_command: npm install && npx prisma generate
  run_command: npm start
  envs:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_SECRET
    value: ${JWT_SECRET}
  http_port: 3000
  instance_count: 1
  instance_size_slug: basic-xxs

databases:
- name: db
  engine: MYSQL
  version: "8"
```

**4. Deploy**:
```bash
doctl apps create --spec .do/app.yaml
```

### Post-Deployment Backend Tasks

**1. Run migrations**:
```bash
# SSH into server or use platform CLI
npx prisma migrate deploy
```

**2. Seed demo data** (optional):
```bash
node prisma/seed-demo.js
```

**3. Test health endpoint**:
```bash
curl https://api.yourdomain.com/api/health
```

**4. Test authentication**:
```bash
curl -X POST https://api.yourdomain.com/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"TestPass123"}'
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

**1. Install Vercel CLI**:
```bash
npm i -g vercel
```

**2. Login**:
```bash
vercel login
```

**3. Deploy from frontend directory**:
```bash
cd frontend
vercel
```

**4. Configure environment variables** in Vercel dashboard or CLI:
```bash
vercel env add VITE_API_URL production
# Enter: https://api.yourdomain.com/api
```

**5. Deploy to production**:
```bash
vercel --prod
```

**6. Set up custom domain**:
- Go to Vercel dashboard
- Project Settings → Domains
- Add your domain

**Vercel Configuration** (`vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Option 2: Netlify

**1. Install Netlify CLI**:
```bash
npm i -g netlify-cli
```

**2. Login**:
```bash
netlify login
```

**3. Initialize**:
```bash
cd frontend
netlify init
```

**4. Configure** (`netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

**5. Deploy**:
```bash
netlify deploy --prod
```

### Option 3: Cloudflare Pages

**1. Build the frontend**:
```bash
cd frontend
npm run build
```

**2. Install Wrangler CLI**:
```bash
npm i -g wrangler
```

**3. Deploy**:
```bash
wrangler pages deploy dist
```

**4. Configure**:
- Go to Cloudflare Pages dashboard
- Add environment variables
- Set up custom domain

### Static File Optimization

**1. Enable compression**:
Most platforms enable gzip/brotli automatically.

**2. Set cache headers**:
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['primevue']
        }
      }
    }
  }
}
```

**3. Optimize images**:
- Use WebP format
- Compress with tools like ImageOptim
- Consider CDN for images

## Third-Party Services

### Twilio Configuration

**1. Production Phone Number**:
- Purchase number at [Twilio Console](https://console.twilio.com/)
- Configure webhooks:
  - Voice URL: `https://api.yourdomain.com/api/webhooks/twilio/voice`
  - SMS URL: `https://api.yourdomain.com/api/webhooks/twilio/sms`
  - Status Callback: `https://api.yourdomain.com/api/webhooks/twilio/voice/status`

**2. Security**:
- Enable webhook signature validation
- Use HTTPS only

**3. Test**:
- Call the Twilio number
- Check logs for webhook hits
- Verify call logging in database

### Stripe Configuration

**1. Activate Production Mode**:
- Complete Stripe verification
- Switch from test to live keys

**2. Create Products and Prices**:
```bash
# Using Stripe CLI or Dashboard
stripe products create --name "Bolt AI Subscription"
stripe prices create --product prod_xxx --unit-amount 29500 --currency usd --recurring monthly
stripe prices create --product prod_xxx --unit-amount 283200 --currency usd --recurring yearly
```

**3. Configure Webhook**:
- URL: `https://api.yourdomain.com/api/webhooks/stripe`
- Events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**4. Update Environment Variables**:
- `STRIPE_SECRET_KEY`: Live secret key
- `STRIPE_WEBHOOK_SECRET`: Production webhook secret
- `STRIPE_MONTHLY_PRICE_ID`: Live monthly price ID
- `STRIPE_YEARLY_PRICE_ID`: Live yearly price ID

**5. Test**:
```bash
# Test checkout flow
curl -X POST https://api.yourdomain.com/api/billing/create-checkout-session \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"plan":"MONTHLY","successUrl":"https://yourdomain.com/success","cancelUrl":"https://yourdomain.com/cancel"}'
```

### OpenAI Configuration

**1. Create Production API Key**:
- Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
- Create new key
- Set usage limits for cost control

**2. Monitor Usage**:
- Set up billing alerts
- Track token usage
- Optimize prompts for efficiency

**3. Rate Limiting**:
- Implement request queuing
- Cache common responses
- Use lower temperature for deterministic responses

### Vapi Configuration (Optional)

**1. Create Production Assistant**:
- Configure with production phone numbers
- Set webhook URL to production API
- Test call flow

**2. Configure Tools**:
```json
{
  "tools": [
    {
      "name": "check_availability",
      "url": "https://api.yourdomain.com/api/ai/availability"
    },
    {
      "name": "book_appointment",
      "url": "https://api.yourdomain.com/api/ai/appointments"
    }
  ]
}
```

## Monitoring and Logging

### Application Monitoring

**Option 1: Sentry (Error Tracking)**

**1. Install Sentry**:
```bash
npm install @sentry/node @sentry/tracing
```

**2. Initialize in backend** (`src/app.js`):
```javascript
const Sentry = require("@sentry/node");

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});
```

**3. Add error handler**:
```javascript
app.use(Sentry.Handlers.errorHandler());
```

**Option 2: LogRocket (Frontend + Backend)**

**1. Install**:
```bash
npm install logrocket
```

**2. Initialize**:
```javascript
import LogRocket from 'logrocket';
LogRocket.init('your-app-id');
```

### Performance Monitoring

**Option 1: New Relic**
- Add agent to Node.js app
- Monitor response times, throughput, errors

**Option 2: DataDog**
- Comprehensive APM solution
- Custom metrics and dashboards

### Log Aggregation

**Option 1: Papertrail**
- Centralized logging
- Real-time tail
- Alerts on errors

**Option 2: Loggly**
- Log aggregation and search
- Custom dashboards

### Uptime Monitoring

**Free Options**:
- **UptimeRobot**: Free tier for 50 monitors
- **Pingdom**: Basic uptime monitoring
- **Freshping**: Free unlimited checks

**Configuration**:
- Monitor: `https://api.yourdomain.com/api/health`
- Interval: 5 minutes
- Alerts: Email, SMS, Slack

### Metrics to Track

**Application Metrics**:
- Response time (p50, p95, p99)
- Request rate
- Error rate
- Active connections
- Database query performance

**Business Metrics**:
- New signups
- Active subscriptions
- API call volume
- Appointment booking rate
- Revenue

## Scaling

### Horizontal Scaling

**Backend**:
1. Use load balancer (provided by platform)
2. Run multiple instances
3. Stateless sessions (JWT)
4. Session affinity not required

**Database**:
1. Connection pooling (Prisma default)
2. Read replicas for read-heavy workloads
3. Database indexes optimized

### Vertical Scaling

**When to Scale Up**:
- CPU usage consistently >70%
- Memory usage >80%
- Response times degrading
- Database connections maxed out

**Platform-Specific**:

**Railway**:
```bash
# Upgrade to larger instance
railway service update --instance-size medium
```

**Render**:
- Dashboard → Service → Instance Type

### Caching Strategy

**Redis Cache** (for session data, rate limiting):

**1. Add Redis**:
```bash
# Railway
railway add redis

# Or use external Redis (Upstash, Redis Cloud)
```

**2. Configure**:
```javascript
const redis = require('redis');
const client = redis.createClient({
  url: process.env.REDIS_URL
});
```

**3. Cache tenant settings**:
```javascript
// Cache for 1 hour
await client.setEx(`tenant:${id}`, 3600, JSON.stringify(tenant));
```

### CDN for Static Assets

**Cloudflare**:
1. Point DNS to Cloudflare
2. Enable caching
3. Configure cache rules
4. Enable auto-minification

**AWS CloudFront**:
1. Create distribution
2. Point to S3 or origin server
3. Configure cache behaviors
4. Enable compression

## Backup and Disaster Recovery

### Database Backups

**Automated Backups**:

**PlanetScale**:
- Automatic daily backups
- 7-day retention (free tier)
- 30-day retention (paid)

**AWS RDS**:
```bash
# Enable automated backups
aws rds modify-db-instance \
  --db-instance-identifier bolt-ai-db \
  --backup-retention-period 7 \
  --preferred-backup-window "03:00-04:00"
```

**Manual Backups**:
```bash
# Export database
mysqldump -u user -p database_name > backup_$(date +%Y%m%d).sql

# Compress
gzip backup_$(date +%Y%m%d).sql
```

### Disaster Recovery Plan

**RTO (Recovery Time Objective)**: 4 hours
**RPO (Recovery Point Objective)**: 24 hours

**Recovery Steps**:
1. Restore database from latest backup
2. Deploy backend from last known good commit
3. Deploy frontend from last known good commit
4. Update DNS if needed
5. Verify application functionality
6. Notify users of any data loss

### Backup Testing

**Monthly**:
- Restore backup to staging environment
- Verify data integrity
- Test application functionality
- Document any issues

## Security Hardening

### SSL/TLS

**Backend**:
- Enforce HTTPS in production
- Use platform-provided certificates (auto-renewed)

**Frontend**:
- Vercel/Netlify automatically provision SSL
- Force HTTPS redirect

### Security Headers

**Backend** (`src/app.js`):
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### Rate Limiting

**Production Configuration**:
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// Stricter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true
});

app.use('/api/auth/login', authLimiter);
```

### Database Security

**1. Use environment variables** for credentials
**2. Enable SSL** for database connections
**3. Restrict IP access** to database
**4. Use least privilege** database user
**5. Regular security updates**

### API Key Management

**Never commit secrets to git**:
```bash
# .gitignore
.env
.env.*
!.env.example
```

**Use secret management**:
- Railway: Built-in secrets
- AWS: Secrets Manager
- HashiCorp Vault

### CORS Configuration

**Production CORS**:
```javascript
const cors = require('cors');

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
  optionsSuccessStatus: 200
}));
```

## Troubleshooting

### Common Production Issues

**Issue**: 502 Bad Gateway
- **Cause**: Backend server not responding
- **Solution**: Check logs, restart service, verify environment variables

**Issue**: Database connection timeout
- **Cause**: Too many connections, network issue
- **Solution**: Increase connection pool, check firewall rules

**Issue**: Webhook not receiving events
- **Cause**: Webhook URL misconfigured, signature validation failing
- **Solution**: Verify URL, check signature validation, inspect logs

**Issue**: High memory usage
- **Cause**: Memory leak, inefficient queries
- **Solution**: Profile application, optimize queries, add pagination

**Issue**: Slow API responses
- **Cause**: N+1 queries, missing indexes
- **Solution**: Add includes in Prisma queries, add database indexes

### Debug Production Issues

**1. Check logs**:
```bash
# Railway
railway logs

# Render
render logs -f

# Vercel
vercel logs
```

**2. Monitor metrics**:
- CPU and memory usage
- Request latency
- Error rates

**3. Reproduce locally**:
```bash
NODE_ENV=production npm start
```

**4. Use production database snapshot**:
```bash
# Download production backup
# Import to local database
mysql -u root -p bolt_ai_salon < production_backup.sql
```

### Health Checks

**Implement comprehensive health check**:
```javascript
app.get('/api/health', async (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: 'unknown',
      redis: 'unknown',
      twilio: 'unknown'
    }
  };
  
  // Check database
  try {
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'connected';
  } catch (error) {
    health.checks.database = 'disconnected';
    health.status = 'unhealthy';
  }
  
  // Check Redis (if used)
  if (redisClient) {
    try {
      await redisClient.ping();
      health.checks.redis = 'connected';
    } catch (error) {
      health.checks.redis = 'disconnected';
    }
  }
  
  res.status(health.status === 'healthy' ? 200 : 503).json(health);
});
```

## Post-Deployment Checklist

### Immediately After Deployment

- [ ] Verify health check endpoint responds
- [ ] Test user signup flow
- [ ] Test user login flow
- [ ] Test appointment booking
- [ ] Verify webhooks are receiving events
- [ ] Check Stripe checkout flow
- [ ] Test Twilio call handling
- [ ] Verify email notifications (if configured)
- [ ] Check error logging is working
- [ ] Verify database connections
- [ ] Test password reset flow
- [ ] Check 2FA setup and verification

### Within 24 Hours

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify backup ran successfully
- [ ] Review logs for any anomalies
- [ ] Test scaling (if applicable)
- [ ] Verify SSL certificates
- [ ] Check CDN cache hit rates
- [ ] Monitor memory and CPU usage

### Within 1 Week

- [ ] Review monitoring dashboards
- [ ] Analyze performance metrics
- [ ] Check cost and usage
- [ ] Review security scan results
- [ ] Test disaster recovery plan
- [ ] Update documentation
- [ ] Train team on new deployment

## Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd backend && npm ci
      
      - name: Run tests
        run: cd backend && npm test
      
      - name: Deploy to Railway
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: cd frontend && npm ci
      
      - name: Build
        run: cd frontend && npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
```

### Deployment Strategies

**Blue-Green Deployment**:
1. Deploy new version (green)
2. Test thoroughly
3. Switch traffic to green
4. Keep blue for rollback

**Canary Deployment**:
1. Deploy to small percentage of traffic
2. Monitor metrics
3. Gradually increase traffic
4. Rollback if issues detected

## Cost Optimization

### Estimated Monthly Costs

**Minimal Setup** (~$30-50/month):
- Railway: $5/month (hobby plan)
- PlanetScale: $0 (free tier)
- Vercel: $0 (hobby plan)
- Twilio: $1/phone + usage
- Stripe: Pay-as-you-go (2.9% + $0.30)
- OpenAI: Pay-as-you-go

**Production Setup** (~$100-200/month):
- Railway/Render: $25-50/month
- Database: $15-50/month
- CDN: $0-20/month
- Monitoring: $0-30/month
- Third-party APIs: Variable

### Cost Reduction Tips

1. Use free tiers where possible
2. Optimize database queries
3. Implement caching
4. Use CDN for static assets
5. Monitor and optimize API usage
6. Set up billing alerts

---

## Summary

This deployment guide covered:
- ✅ Platform selection and setup
- ✅ Environment configuration
- ✅ Database deployment
- ✅ Backend and frontend deployment
- ✅ Third-party service configuration
- ✅ Monitoring and logging
- ✅ Scaling strategies
- ✅ Backup and disaster recovery
- ✅ Security hardening
- ✅ Troubleshooting

For questions or issues, refer to platform-specific documentation or reach out to the team.

**Happy deploying!** 🚀
