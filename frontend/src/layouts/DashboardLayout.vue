<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Top Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/app" class="flex items-center gap-2">
              <img src="/logo.svg" alt="TONRIS Logo" class="h-8" />
            </router-link>
            <span v-if="tenantStore.settings" class="ml-4 text-gray-600">
              - {{ tenantStore.settings.name }}
            </span>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-gray-700">{{ authStore.user?.email }}</span>
            <button
              @click="handleLogout"
              class="text-gray-700 hover:text-blue-600 px-3 py-2"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <div class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white shadow-sm min-h-screen">
        <nav class="p-4 space-y-2">
          <router-link
            to="/app"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app' }"
          >
            <i class="pi pi-home mr-3"></i>
            Dashboard
          </router-link>
          <router-link
            to="/app/employees"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app/employees' }"
          >
            <i class="pi pi-users mr-3"></i>
            Employees
          </router-link>
          <router-link
            to="/app/services"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app/services' }"
          >
            <i class="pi pi-list mr-3"></i>
            Services
          </router-link>
          <router-link
            to="/app/appointments"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app/appointments' }"
          >
            <i class="pi pi-calendar mr-3"></i>
            Appointments
          </router-link>
          <router-link
            to="/app/billing"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app/billing' }"
          >
            <i class="pi pi-credit-card mr-3"></i>
            Billing
          </router-link>
          <router-link
            to="/app/reports"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app/reports' }"
          >
            <i class="pi pi-chart-bar mr-3"></i>
            Reports
          </router-link>
          <router-link
            to="/app/settings"
            class="flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-blue-50 hover:text-blue-600"
            :class="{ 'bg-blue-50 text-blue-600': $route.path === '/app/settings' }"
          >
            <i class="pi pi-cog mr-3"></i>
            Settings
          </router-link>
        </nav>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-8">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useTenantStore } from '../stores/tenant'

const router = useRouter()
const authStore = useAuthStore()
const tenantStore = useTenantStore()

onMounted(async () => {
  // Fetch tenant settings when dashboard layout mounts
  if (authStore.isAuthenticated && !tenantStore.settings) {
    try {
      await tenantStore.fetchSettings()
    } catch (error) {
      console.error('Failed to fetch tenant settings:', error)
    }
  }
})

const handleLogout = async () => {
  await authStore.logout()
  tenantStore.clearSettings()
  router.push('/login')
}
</script>
