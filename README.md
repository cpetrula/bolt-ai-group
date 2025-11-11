# Bolt AI Group - Marketing Website

To empower local businesses with accessible AI technologies that drive growth, efficiency, and excellent customer experiences. We believe every business deserves cutting-edge tools to compete and thrive in the modern marketplace.

## Project Structure

This project consists of two main parts:
- **Frontend**: Vue.js + Vite + PrimeVue - Modern marketing website
- **Backend**: Node.js + Express - API server with Twilio, Supabase, and Resend integrations

## Tech Stack

### Frontend
- **Vue.js 3**: Progressive JavaScript framework
- **Vite**: Next generation frontend tooling
- **PrimeVue**: Rich UI component library
- **PrimeIcons**: Icon library

### Backend
- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **Supabase**: Backend as a Service (Database & Storage)
- **Twilio**: SMS and communication platform
- **Resend**: Email service

## Prerequisites

- Node.js 18+ and npm
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/cpetrula/bolt-ai-group.git
cd bolt-ai-group
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file with your credentials
# You'll need:
# - Supabase URL and API key
# - Twilio Account SID, Auth Token, and Phone Number
# - Resend API key
```

**Configure your .env file:**

```env
PORT=3000
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# Resend Configuration
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# Contact Configuration
CONTACT_EMAIL=contact@boltaigroup.com
NOTIFICATION_PHONE=+1234567890
```

**Start the backend server:**

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The backend API will be available at `http://localhost:3000`

### 3. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env file if needed
```

**Configure your .env file (optional):**

```env
VITE_API_URL=http://localhost:3000
```

**Start the frontend development server:**

```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. Build for Production

**Backend:**
The backend runs as-is in production. Make sure to set `NODE_ENV=production` in your environment.

**Frontend:**
```bash
cd frontend
npm run build
npm run preview  # Preview the production build locally
```

The build output will be in `frontend/dist/`

## API Endpoints

### Media
- `GET /api/media` - Get all media items
- `POST /api/media/upload` - Upload media metadata

### Contact
- `POST /api/contact` - Send contact form message (via email and SMS)

## Features

### Marketing Website Features
- ✅ Responsive design that works on all devices
- ✅ Modern UI with PrimeVue components
- ✅ Image and video gallery
- ✅ Contact form with email/SMS notifications
- ✅ Feature showcase
- ✅ Hero section with call-to-action

### Backend Features
- ✅ RESTful API with Express
- ✅ Supabase integration for database and storage
- ✅ Twilio integration for SMS notifications
- ✅ Resend integration for email notifications
- ✅ CORS enabled for frontend communication
- ✅ Environment-based configuration

## Database Setup (Supabase)

Create a `media` table in your Supabase project:

```sql
CREATE TABLE media (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Development

### Running Both Frontend and Backend

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Project Scripts

**Backend:**
- `npm start` - Start the server
- `npm run dev` - Start with auto-reload (nodemon)

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

See LICENSE file for details.

## Support

For questions or support, please contact us through the website contact form.
