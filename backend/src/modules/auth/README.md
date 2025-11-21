# Authentication Module

This module provides a complete authentication system with JWT-based sessions and two-factor authentication (2FA) support.

## Features

- ✅ User signup with email/password
- ✅ Secure password hashing with bcrypt (12 rounds)
- ✅ JWT token-based authentication
- ✅ Password reset flow
- ✅ Two-factor authentication (TOTP)
- ✅ Rate limiting to prevent brute force attacks
- ✅ Auth middleware for protected routes

## Security Features

### Password Security
- Bcrypt hashing with 12 salt rounds
- Password requirements:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number

### Brute Force Protection
- **Login/Signup**: 5 attempts per 15 minutes per IP
- **Password Reset**: 3 attempts per hour per IP
- **2FA Operations**: 10 attempts per 15 minutes per IP

### Additional Security
- Timing attack prevention in login
- JWT token expiration
- 2FA with TOTP (30-second codes, 60-second tolerance window)

## API Endpoints

### Public Endpoints

#### Signup
```
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (201)**:
```json
{
  "status": "success",
  "message": "User created successfully",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt-token-here"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "twoFactorToken": "123456"  // Optional, required if 2FA is enabled
}
```

**Response (200)**:
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "twoFactorEnabled": false
    },
    "token": "jwt-token-here"
  }
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "message": "If the email exists, a reset link has been sent"
  }
}
```

**Note**: In production, the reset token should be sent via email. Currently, email integration is not implemented.

#### Reset Password
```
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "NewSecurePass123"
}
```

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "message": "Password reset successfully"
  }
}
```

### Protected Endpoints

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <jwt-token>
```

#### Setup 2FA
```
POST /api/auth/2fa/setup
Authorization: Bearer <jwt-token>
```

**Response (200)**:
```json
{
  "status": "success",
  "message": "Scan the QR code with your authenticator app",
  "data": {
    "secret": "base32-secret",
    "qrCodeUrl": "data:image/png;base64,..."
  }
}
```

#### Verify 2FA
```
POST /api/auth/2fa/verify
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "token": "123456"
}
```

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "message": "2FA enabled successfully"
  }
}
```

#### Disable 2FA
```
POST /api/auth/2fa/disable
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "token": "123456"
}
```

**Response (200)**:
```json
{
  "status": "success",
  "data": {
    "message": "2FA disabled successfully"
  }
}
```

## Using the Auth Middleware

To protect routes with authentication, use the `authMiddleware`:

```typescript
import { Router } from 'express';
import { authMiddleware } from '../../middleware/auth';

const router = Router();

router.get('/protected-route', authMiddleware, (req, res) => {
  // Access user info from req.user
  const { userId, email } = req.user!;
  res.json({ message: 'Access granted', userId, email });
});

export default router;
```

The `authMiddleware` adds the user payload to `req.user`:
```typescript
req.user = {
  userId: string;
  email: string;
}
```

## Environment Variables

Required environment variables in `.env`:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Application Name (for 2FA)
APP_NAME="Bolt AI Salon"

# Database
DATABASE_URL="mysql://user:password@localhost:3306/bolt_ai_salon"
```

## Error Responses

All errors follow this format:

```json
{
  "status": "error",
  "message": "Error description"
}
```

Common status codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials or token)
- `403` - Forbidden (2FA required)
- `404` - Not Found
- `409` - Conflict (user already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

## Database Schema

```prisma
model User {
  id                String    @id @default(uuid())
  email             String    @unique
  password          String
  isEmailVerified   Boolean   @default(false)
  twoFactorEnabled  Boolean   @default(false)
  twoFactorSecret   String?
  resetToken        String?
  resetTokenExpiry  DateTime?
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt

  @@map("users")
}
```

## Dependencies

- `bcrypt` - Password hashing
- `jsonwebtoken` - JWT token generation/verification
- `speakeasy` - TOTP generation/verification for 2FA
- `qrcode` - QR code generation for 2FA setup
- `express-rate-limit` - Rate limiting
- `express-validator` - Request validation

## TODO / Future Improvements

- [ ] Email integration for password reset
- [ ] Email verification on signup
- [ ] Refresh token support
- [ ] Remember me functionality
- [ ] Account lockout after failed attempts
- [ ] Audit log for authentication events
- [ ] Multi-device 2FA management
- [ ] Backup codes for 2FA recovery
