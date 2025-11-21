# Frontend - Bolt AI Group

Vue 3 frontend application for the Bolt AI Group salon assistant platform.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next generation frontend tooling
- **TypeScript** - Type-safe JavaScript
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **PrimeVue** - Rich UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client for API calls

## Project Structure

```
frontend/
├── src/
│   ├── main.ts              # Application entry point
│   ├── App.vue              # Root component
│   ├── router/
│   │   └── index.ts         # Vue Router configuration
│   ├── stores/
│   │   ├── auth.ts          # Authentication store
│   │   └── tenant.ts        # Tenant state store
│   ├── components/          # Reusable components
│   ├── layouts/
│   │   ├── PublicLayout.vue     # Layout for public pages
│   │   └── DashboardLayout.vue  # Layout for authenticated pages
│   ├── pages/               # Page components
│   ├── services/
│   │   └── api.ts           # API client with JWT handling
│   └── style.css            # Global styles with Tailwind
├── public/                  # Static assets
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create `.env` file from example:
   ```bash
   cp .env.example .env
   ```

3. Update the `.env` file with your backend API URL (default: `http://localhost:3000/api`)

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Features

### Authentication
- JWT-based authentication with automatic token management
- 2FA support (TOTP)
- Persistent login sessions
- Protected routes with authentication guards

### Public Pages
- **Home** - Landing page with pricing and features
- **Sign Up** - Account registration
- **Login** - User authentication
- **Forgot Password** - Password reset flow
- **How It Works** - Feature explanation
- **FAQ** - Frequently asked questions

### Authenticated Pages (Dashboard)
- **Dashboard** - Overview statistics and quick access
- **Employees** - Manage staff and schedules
- **Services** - Configure services and pricing
- **Appointments** - View and manage appointments
- **Billing** - Subscription and payment management
- **Reports** - Call logs and analytics
- **Settings** - Business configuration

### State Management
- **Auth Store** - User authentication state, login/logout, token management
- **Tenant Store** - Business/tenant settings and configuration

### API Integration
- Automatic JWT token injection in requests
- Token refresh handling
- Error handling and redirect on 401
- Type-safe API client methods

## Routing

### Public Routes
- `/` - Home page
- `/signup` - Sign up
- `/login` - Login
- `/forgot-password` - Password reset
- `/how-it-works` - How it works
- `/faq` - FAQ

### Protected Routes (requires authentication)
All routes under `/app` require authentication:
- `/app` - Dashboard
- `/app/employees` - Employees
- `/app/services` - Services
- `/app/appointments` - Appointments
- `/app/billing` - Billing
- `/app/reports` - Reports
- `/app/settings` - Settings

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3000/api` |

## Responsive Design

The application is fully responsive and works on:
- Desktop (1024px and above)
- Tablet (768px - 1023px)
- Mobile (below 768px)

Tailwind CSS utilities are used throughout for responsive layouts.

## Contributing

When adding new features:
1. Follow the existing project structure
2. Use TypeScript for type safety
3. Maintain responsive design principles
4. Update this README if adding new major features
