const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const getEnvVariable = (key, defaultValue) => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

const env = {
  port: parseInt(getEnvVariable('PORT', '3000'), 10),
  nodeEnv: getEnvVariable('NODE_ENV', 'development'),
  databaseUrl: getEnvVariable('DATABASE_URL'),
  jwtSecret: getEnvVariable('JWT_SECRET'),
  jwtExpiresIn: getEnvVariable('JWT_EXPIRES_IN', '7d'),
  logLevel: getEnvVariable('LOG_LEVEL', 'info'),
  appName: getEnvVariable('APP_NAME', 'Bolt AI Salon'),
  ngrokUrl: process.env.NGROK_URL,
  stripeSecretKey: getEnvVariable('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: getEnvVariable('STRIPE_WEBHOOK_SECRET'),
  stripeMonthlyPriceId: getEnvVariable('STRIPE_MONTHLY_PRICE_ID'),
  stripeYearlyPriceId: getEnvVariable('STRIPE_YEARLY_PRICE_ID'),
  twilioAccountSid: getEnvVariable('TWILIO_ACCOUNT_SID'),
  twilioAuthToken: getEnvVariable('TWILIO_AUTH_TOKEN'),
  twilioPhoneNumber: getEnvVariable('TWILIO_PHONE_NUMBER'),
  openaiApiKey: process.env.OPENAI_API_KEY,
  vapiApiKey: process.env.VAPI_API_KEY,
  vapiAssistantId: process.env.VAPI_ASSISTANT_ID,
  elevenlabsApiKey: process.env.ELEVENLABS_API_KEY,
};

module.exports = { env };
