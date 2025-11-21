<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="business-name" class="block text-sm font-medium text-gray-700">Business Name</label>
            <input
              id="business-name"
              v-model="formData.businessName"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Your Business Name"
            />
          </div>
          <div>
            <label for="owner-name" class="block text-sm font-medium text-gray-700">Owner Name</label>
            <input
              id="owner-name"
              v-model="formData.ownerName"
              type="text"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="+1 (555) 123-4567"
            />
          </div>
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div v-if="error" class="rounded-md bg-red-50 p-4">
          <p class="text-sm text-red-800">{{ error }}</p>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {{ loading ? 'Creating account...' : 'Sign up' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import api from '../services/api'

const router = useRouter()
const authStore = useAuthStore()

const formData = ref({
  businessName: '',
  ownerName: '',
  email: '',
  phone: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    // Step 1: Create account
    await authStore.signup(formData.value)
    
    // Step 2: Login to get auth token for billing API
    const loginResult = await authStore.login(formData.value.email, formData.value.password)
    
    if (loginResult.requires2FA) {
      // If 2FA is required, redirect to login page
      loading.value = false
      router.push('/login')
      return
    }
    
    // Step 3: Create Stripe checkout session
    const checkoutResponse = await api.createCheckoutSession()
    
    if (checkoutResponse.url) {
      // Keep loading state active during redirect to Stripe
      window.location.href = checkoutResponse.url
    } else {
      // Fallback to dashboard if no checkout URL
      loading.value = false
      router.push('/app')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Account creation or checkout setup failed. Please try again.'
    loading.value = false
  }
}
</script>
