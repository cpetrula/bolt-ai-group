<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
            />
          </div>
          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
            />
          </div>
        </div>

        <div v-if="show2FA" class="rounded-md shadow-sm">
          <label for="twofa-code" class="sr-only">2FA Code</label>
          <input
            id="twofa-code"
            v-model="twoFACode"
            name="twofa-code"
            type="text"
            required
            class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
            placeholder="Enter 2FA code"
          />
        </div>

        <div class="flex items-center justify-between">
          <div class="text-sm">
            <router-link to="/forgot-password" class="font-medium text-blue-600 hover:text-blue-500">
              Forgot your password?
            </router-link>
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
            {{ loading ? 'Signing in...' : (show2FA ? 'Verify 2FA' : 'Sign in') }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/signup" class="font-medium text-blue-600 hover:text-blue-500">
            Don't have an account? Sign up
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const twoFACode = ref('')
const show2FA = ref(false)
const loading = ref(false)
const error = ref('')

const handleSubmit = async () => {
  loading.value = true
  error.value = ''

  try {
    if (show2FA.value) {
      await authStore.verify2FA(twoFACode.value)
      const redirect = route.query.redirect as string || '/app'
      router.push(redirect)
    } else {
      const result = await authStore.login(email.value, password.value)
      
      if (result.requires2FA) {
        show2FA.value = true
      } else {
        const redirect = route.query.redirect as string || '/app'
        router.push(redirect)
      }
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Login failed'
    loading.value = false
  }
}
</script>
