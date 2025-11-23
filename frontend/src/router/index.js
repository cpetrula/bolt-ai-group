import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Lazy load components
const HomePage = () => import('../pages/HomePage.vue')
const SignUpPage = () => import('../pages/SignUpPage.vue')
const LoginPage = () => import('../pages/LoginPage.vue')
const ForgotPasswordPage = () => import('../pages/ForgotPasswordPage.vue')
const HowItWorksPage = () => import('../pages/HowItWorksPage.vue')
const FAQPage = () => import('../pages/FAQPage.vue')

const DashboardPage = () => import('../pages/DashboardPage.vue')
const EmployeesPage = () => import('../pages/EmployeesPage.vue')
const ServicesPage = () => import('../pages/ServicesPage.vue')
const AppointmentsPage = () => import('../pages/AppointmentsPage.vue')
const BillingPage = () => import('../pages/BillingPage.vue')
const ReportsPage = () => import('../pages/ReportsPage.vue')
const SettingsPage = () => import('../pages/SettingsPage.vue')

const PublicLayout = () => import('../layouts/PublicLayout.vue')
const DashboardLayout = () => import('../layouts/DashboardLayout.vue')

const routes = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomePage,
        meta: { title: 'Home - Bolt AI Group' }
      },
      {
        path: 'signup',
        name: 'signup',
        component: SignUpPage,
        meta: { title: 'Sign Up - Bolt AI Group' }
      },
      {
        path: 'login',
        name: 'login',
        component: LoginPage,
        meta: { title: 'Login - Bolt AI Group' }
      },
      {
        path: 'forgot-password',
        name: 'forgot-password',
        component: ForgotPasswordPage,
        meta: { title: 'Forgot Password - Bolt AI Group' }
      },
      {
        path: 'how-it-works',
        name: 'how-it-works',
        component: HowItWorksPage,
        meta: { title: 'How It Works - Bolt AI Group' }
      },
      {
        path: 'faq',
        name: 'faq',
        component: FAQPage,
        meta: { title: 'FAQ - Bolt AI Group' }
      },
    ]
  },
  {
    path: '/app',
    component: DashboardLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: DashboardPage,
        meta: { title: 'Dashboard - Bolt AI Group' }
      },
      {
        path: 'employees',
        name: 'employees',
        component: EmployeesPage,
        meta: { title: 'Employees - Bolt AI Group' }
      },
      {
        path: 'services',
        name: 'services',
        component: ServicesPage,
        meta: { title: 'Services - Bolt AI Group' }
      },
      {
        path: 'appointments',
        name: 'appointments',
        component: AppointmentsPage,
        meta: { title: 'Appointments - Bolt AI Group' }
      },
      {
        path: 'billing',
        name: 'billing',
        component: BillingPage,
        meta: { title: 'Billing - Bolt AI Group' }
      },
      {
        path: 'reports',
        name: 'reports',
        component: ReportsPage,
        meta: { title: 'Reports - Bolt AI Group' }
      },
      {
        path: 'settings',
        name: 'settings',
        component: SettingsPage,
        meta: { title: 'Settings - Bolt AI Group' }
      },
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Navigation guard for authentication
router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore()
  
  // Set page title
  if (to.meta.title) {
    document.title = to.meta.title
  }

  // Check if route requires authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      // Redirect to login page with return url
      next({
        name: 'login',
        query: { redirect: to.fullPath }
      })
    } else {
      next()
    }
  } else {
    // Public route
    next()
  }
})

export default router
