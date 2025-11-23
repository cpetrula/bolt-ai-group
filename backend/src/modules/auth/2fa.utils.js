const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const { env } = require('../../config/env');

/**
 * Generate a 2FA secret and QR code for a user
 */
const generate2FASecret = async (email) => {
  const secret = speakeasy.generateSecret({
    name: `${env.appName} (${email})`,
    length: 32,
  });

  if (!secret.otpauth_url) {
    throw new Error('Failed to generate 2FA secret');
  }

  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  return {
    secret: secret.base32,
    qrCodeUrl,
  };
};

/**
 * Verify a TOTP token against a secret
 */
const verify2FAToken = (token, secret) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow ±2 time steps (±60 seconds) of clock drift
  });
};

module.exports = { generate2FASecret, verify2FAToken };
