const { PrismaClient } = require('@prisma/client');
const { env } = require('./env');
const { logger } = require('../utils/logger');

// Singleton pattern for Prisma client
const prisma =
  global.prisma ||
  new PrismaClient({
    log: env.nodeEnv === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.nodeEnv !== 'production') {
  global.prisma = prisma;
}

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

module.exports = { prisma, connectDB, disconnectDB };
