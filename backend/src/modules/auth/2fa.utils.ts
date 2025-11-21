import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

export interface TwoFactorSecret {
  secret: string;
  qrCodeUrl: string;
}

/**
 * Generate a 2FA secret and QR code for a user
 */
export const generate2FASecret = async (
  email: string
): Promise<TwoFactorSecret> => {
  const secret = speakeasy.generateSecret({
    name: `Bolt AI Salon (${email})`,
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
export const verify2FAToken = (token: string, secret: string): boolean => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2, // Allow 2 time steps (60 seconds) of clock drift
  });
};
