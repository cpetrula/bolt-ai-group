import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

class ApiClient {
  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor to add JWT token
    this.client.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor to handle token expiration
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid, clear auth and redirect to login
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )
  }

  get axiosInstance() {
    return this.client
  }

  // Auth endpoints
  async login(email, password) {
    const response = await this.client.post('/auth/login', { email, password })
    return response.data
  }

  async signup(data) {
    const response = await this.client.post('/auth/signup', data)
    return response.data
  }

  async forgotPassword(email) {
    const response = await this.client.post('/auth/forgot-password', { email })
    return response.data
  }

  async resetPassword(token, password) {
    const response = await this.client.post('/auth/reset-password', { token, password })
    return response.data
  }

  async setup2FA() {
    const response = await this.client.post('/auth/2fa/setup')
    return response.data
  }

  async verify2FA(token) {
    const response = await this.client.post('/auth/2fa/verify', { token })
    return response.data
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.client.get('/me')
    return response.data
  }

  // Tenant endpoints
  async getTenantSettings() {
    const response = await this.client.get('/tenant/settings')
    return response.data
  }

  async updateTenantSettings(data) {
    const response = await this.client.patch('/tenant/settings', data)
    return response.data
  }

  // Employees endpoints
  async getEmployees() {
    const response = await this.client.get('/employees')
    return response.data
  }

  async createEmployee(data) {
    const response = await this.client.post('/employees', data)
    return response.data
  }

  async updateEmployee(id, data) {
    const response = await this.client.patch(`/employees/${id}`, data)
    return response.data
  }

  async deleteEmployee(id) {
    const response = await this.client.delete(`/employees/${id}`)
    return response.data
  }

  // Services endpoints
  async getServices() {
    const response = await this.client.get('/services')
    return response.data
  }

  async createService(data) {
    const response = await this.client.post('/services', data)
    return response.data
  }

  async updateService(id, data) {
    const response = await this.client.patch(`/services/${id}`, data)
    return response.data
  }

  async deleteService(id) {
    const response = await this.client.delete(`/services/${id}`)
    return response.data
  }

  // Appointments endpoints
  async getAppointments(params) {
    const response = await this.client.get('/appointments', { params })
    return response.data
  }

  async createAppointment(data) {
    const response = await this.client.post('/appointments', data)
    return response.data
  }

  async updateAppointment(id, data) {
    const response = await this.client.patch(`/appointments/${id}`, data)
    return response.data
  }

  async deleteAppointment(id) {
    const response = await this.client.delete(`/appointments/${id}`)
    return response.data
  }

  // Billing endpoints
  async getSubscription() {
    const response = await this.client.get('/billing/subscription')
    return response.data
  }

  async createCheckoutSession() {
    const response = await this.client.post('/billing/create-checkout-session')
    return response.data
  }

  async createPortalSession() {
    const response = await this.client.post('/billing/portal-session')
    return response.data
  }

  // Reports endpoints
  async getCallsReport(params) {
    const response = await this.client.get('/reports/calls', { params })
    return response.data
  }

  async getAppointmentsReport(params) {
    const response = await this.client.get('/reports/appointments', { params })
    return response.data
  }

  async getRevenueReport(params) {
    const response = await this.client.get('/reports/revenue', { params })
    return response.data
  }
}

export default new ApiClient()
