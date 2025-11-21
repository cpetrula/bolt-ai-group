import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { multiTenantMiddleware } from './middleware/multiTenant';
import healthRouter from './routes/health';
import authRouter from './modules/auth/auth.routes';
import tenantRouter from './modules/tenants/tenant.routes';
import employeeRouter from './modules/employees/employee.routes';
import serviceRouter from './modules/services/service.routes';
import appointmentRouter from './modules/appointments/appointment.routes';
import billingRouter from './modules/billing/billing.routes';
import telephonyRouter from './modules/telephony/telephony.routes';

// Create Express application
const app: Application = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.nodeEnv === 'production' ? [] : '*', // Configure for production
    credentials: true,
  })
);

// Stripe webhook needs raw body, so handle it before JSON parsing
app.use(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(requestLogger);

// Multi-tenant middleware (applied globally, except for webhooks)
app.use((req, res, next) => {
  if (req.path === '/api/webhooks/stripe' || req.path.startsWith('/api/webhooks/twilio')) {
    next();
  } else {
    multiTenantMiddleware(req, res, next);
  }
});

// API Routes
app.use('/api', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api', tenantRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/services', serviceRouter);
app.use('/api', appointmentRouter);
app.use('/api', billingRouter);
app.use('/api', telephonyRouter);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    app.listen(env.port, () => {
      logger.info(`🚀 Server running on port ${env.port}`);
      logger.info(`📝 Environment: ${env.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${env.port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();

export default app;
