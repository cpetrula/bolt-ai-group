const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { env } = require('./config/env');
const { connectDB } = require('./config/db');
const { logger } = require('./utils/logger');
const { requestLogger } = require('./middleware/logger');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { multiTenantMiddleware } = require('./middleware/multiTenant');
const healthRouter = require('./routes/health');
const authRouter = require('./modules/auth/auth.routes');
const tenantRouter = require('./modules/tenants/tenant.routes');
const employeeRouter = require('./modules/employees/employee.routes');
const serviceRouter = require('./modules/services/service.routes');
const appointmentRouter = require('./modules/appointments/appointment.routes');
const billingRouter = require('./modules/billing/billing.routes');
const telephonyRouter = require('./modules/telephony/telephony.routes');
const aiRouter = require('./modules/ai-assistant/ai.routes');
const path = require('path'); // Import path module for resolving paths
const reportsRouter = require('./modules/reports/reports.routes');
global.__basedir = __dirname

// Create Express application
const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: env.nodeEnv === 'production' ? [] : '*', // Configure for production
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// API Routers
app.use('/api/auth', authRouter);
app.use('/api/tenants', tenantRouter);
app.use('/api', healthRouter);
app.use('/api/employees', employeeRouter);
app.use('/api/services', serviceRouter);
app.use('/api', appointmentRouter);
app.use('/api', billingRouter);
app.use('/api', telephonyRouter);
app.use('/api/ai', aiRouter);
app.use('/api', reportsRouter);

// Serve static files from the "frontend/dist" directory
const staticPath = path.join(__dirname, '../../frontend/dist');
console.log('Serving static files from:', staticPath);
app.use(express.static(staticPath));

// SPA fallback - serve index.html for all non-API routes
// This must come after static files but before 404 handler
app.use((req, res, next) => {
  // Only serve index.html for non-API routes
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(staticPath, 'index.html'));
  } else {
    next();
  }
});

// 404 handler for API routes
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);



// Start server
const startServer = async () => {
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
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
  process.exit(1);
});

// Start the server
startServer();