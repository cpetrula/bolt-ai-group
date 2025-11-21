# Bolt AI Salon Assistant - Backend

Backend API server for the Bolt AI Salon Assistant application. Built with Node.js, TypeScript, Express, and Prisma ORM.

## 🚀 Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MySQL
- **ORM**: Prisma
- **Authentication**: JWT (to be implemented)
- **Logging**: Winston
- **Security**: Helmet, CORS

## 📁 Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Main application entry point
│   ├── config/
│   │   ├── env.ts             # Environment variables configuration
│   │   └── db.ts              # Database connection setup
│   ├── middleware/
│   │   ├── errorHandler.ts    # Error handling middleware
│   │   ├── logger.ts          # Request logging middleware
│   │   └── multiTenant.ts     # Multi-tenant context middleware
│   ├── routes/
│   │   └── health.ts          # Health check endpoint
│   └── utils/
│       └── logger.ts          # Winston logger configuration
├── prisma/
│   └── schema.prisma          # Prisma database schema
├── dist/                      # Compiled JavaScript (generated)
├── logs/                      # Application logs (generated)
├── .env                       # Environment variables (do not commit)
├── .env.example               # Example environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Prerequisites

- Node.js 18+ and npm
- MySQL 8.0+ database server

## 📦 Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Configure database**:
   - Create a MySQL database
   - Update `DATABASE_URL` in `.env` file:
     ```
     DATABASE_URL="mysql://username:password@localhost:3306/bolt_ai_salon"
     ```

4. **Generate Prisma client**:
   ```bash
   npm run prisma:generate
   ```

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```
The server will start with hot-reload enabled on `http://localhost:3000`

### Production Build
```bash
# Build TypeScript to JavaScript
npm run build

# Start the production server
npm start
```

## 🗄️ Database Management

### Initialize Prisma (already done)
```bash
npm run prisma:init
```

### Generate Prisma Client
```bash
npm run prisma:generate
```

### Run Migrations
```bash
npm run prisma:migrate
```

### Open Prisma Studio (Database GUI)
```bash
npm run prisma:studio
```

## 🔍 API Endpoints

### Health Check
```
GET /api/health
```

Returns server health status and database connectivity.

**Response**:
```json
{
  "status": "ok",
  "message": "Server is healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": "connected"
  }
}
```

## 🏢 Multi-Tenant Architecture

The application implements multi-tenant isolation using middleware. Each request can be associated with a specific tenant using:

1. **Custom Header**: `X-Tenant-Id` header (current implementation)
2. **JWT Token**: Tenant ID extracted from authenticated user (to be implemented)
3. **Subdomain**: Tenant identification via subdomain (future enhancement)

Example request with tenant context:
```bash
curl -H "X-Tenant-Id: 1" http://localhost:3000/api/health
```

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | MySQL connection string | - | Yes |
| `PORT` | Server port | 3000 | No |
| `NODE_ENV` | Environment (development/production) | development | No |
| `JWT_SECRET` | Secret key for JWT tokens | - | Yes |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d | No |
| `LOG_LEVEL` | Logging level (error/warn/info/debug) | debug | No |

## 📝 Logging

The application uses Winston for structured logging:

- **Console**: All logs are output to console with colors
- **Files**:
  - `logs/error.log`: Error-level logs only
  - `logs/all.log`: All logs

Log levels: `error`, `warn`, `info`, `http`, `debug`

## 🛡️ Error Handling

The application includes comprehensive error handling:

- **AppError**: Custom error class for operational errors
- **Error Middleware**: Centralized error handling
- **404 Handler**: Catches undefined routes
- **Uncaught Exceptions**: Graceful shutdown on critical errors

## 🧪 Testing

```bash
npm test
```

*Note: Test infrastructure to be implemented*

## 🔜 Next Steps

- [ ] Implement authentication system (JWT, 2FA)
- [ ] Add tenant management endpoints
- [ ] Implement employee management
- [ ] Add service management
- [ ] Create appointment booking system
- [ ] Integrate Stripe for billing
- [ ] Add Twilio integration for telephony
- [ ] Implement AI assistant integration

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Winston Logger](https://github.com/winstonjs/winston)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Submit a pull request

## 📄 License

ISC
