import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '../services/api'


export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const isOwner = computed(() => user.value?.role === 'owner')
  const isManager = computed(() => user.value?.role === 'manager' || user.value?.role === 'owner')

  // Initialize auth state from localStorage
  function initAuth() {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('user')
    
    if (storedToken && storedUser) {
      token.value = storedToken
      user.value = JSON.parse(storedUser)
    }
  }

  async function login(email, password) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.login(email, password)
      
      if (response.requires2FA) {
        // Return indicator that 2FA is required
        loading.value = false
        return { requires2FA: true }
      }

      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      loading.value = false
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || 'Login failed'
      loading.value = false
      throw err
    }
  }

  async function verify2FA(code) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.verify2FA(code)
      
      token.value = response.token
      user.value = response.user
      
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      loading.value = false
      return { success: true }
    } catch (err) {
      error.value = err.response?.data?.message || '2FA verification failed'
      loading.value = false
      throw err
    }
  }

  async function signup(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.signup(data)
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Signup failed'
      loading.value = false
      throw err
    }
  }

  async function logout() {
    user.value = null
    token.value = null
    
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user')
  }

  async function fetchCurrentUser() {
    try {
      const response = await api.getCurrentUser()
      user.value = response.user
      localStorage.setItem('user', JSON.stringify(response.user))
    } catch (err) {
      // If fetch fails, clear auth
      await logout()
      throw err
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    isOwner,
    isManager,
    initAuth,
    login,
    verify2FA,
    signup,
    logout,
    fetchCurrentUser,
  }
})
