<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    
    <div v-if="loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Loading dashboard...</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Today's Appointments</p>
              <p class="text-3xl font-bold">{{ metrics.todayAppointments }}</p>
            </div>
            <i class="pi pi-calendar text-blue-600 text-4xl"></i>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Total Calls This Week</p>
              <p class="text-3xl font-bold">{{ metrics.weekCalls }}</p>
            </div>
            <i class="pi pi-phone text-green-600 text-4xl"></i>
          </div>
        </div>
        
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-gray-600 text-sm">Revenue This Month</p>
              <p class="text-3xl font-bold">{{ formatCurrency(metrics.monthRevenue) }}</p>
            </div>
            <i class="pi pi-dollar text-purple-600 text-4xl"></i>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Upcoming Appointments</h2>
          <div v-if="upcomingAppointments.length === 0" class="text-center py-8 text-gray-600">
            No upcoming appointments.
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="appointment in upcomingAppointments" 
              :key="appointment.id"
              class="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p class="font-medium">{{ appointment.serviceName }}</p>
                <p class="text-sm text-gray-600">
                  {{ appointment.customerName }} - {{ formatTime(appointment.scheduledAt) }}
                </p>
              </div>
              <span class="text-blue-600">{{ formatRelativeDate(appointment.scheduledAt) }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white p-6 rounded-lg shadow">
          <h2 class="text-xl font-semibold mb-4">Recent Calls</h2>
          <div v-if="recentCalls.length === 0" class="text-center py-8 text-gray-600">
            No recent calls.
          </div>
          <div v-else class="space-y-3">
            <div 
              v-for="call in recentCalls" 
              :key="call.id"
              class="flex justify-between items-center border-b pb-2"
            >
              <div>
                <p class="font-medium">{{ call.type || 'Phone Call' }}</p>
                <p class="text-sm text-gray-600">{{ call.phoneNumber }}</p>
              </div>
              <span class="text-sm text-gray-600">{{ formatRelativeTime(call.createdAt) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

interface DashboardMetrics {
  todayAppointments: number
  weekCalls: number
  monthRevenue: number
}

interface Appointment {
  id: string
  serviceName: string
  customerName: string
  scheduledAt: string
}

interface Call {
  id: string
  type: string
  phoneNumber: string
  createdAt: string
}

const loading = ref(false)
const metrics = ref<DashboardMetrics>({
  todayAppointments: 0,
  weekCalls: 0,
  monthRevenue: 0
})
const upcomingAppointments = ref<Appointment[]>([])
const recentCalls = ref<Call[]>([])

onMounted(async () => {
  await loadDashboardData()
})

async function loadDashboardData() {
  loading.value = true
  
  try {
    // Load appointments
    const appointmentsResponse = await api.getAppointments({ limit: 10, status: 'booked' })
    upcomingAppointments.value = appointmentsResponse.appointments || []
    
    // Calculate today's appointments
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    metrics.value.todayAppointments = upcomingAppointments.value.filter(apt => {
      const aptDate = new Date(apt.scheduledAt)
      return aptDate >= today && aptDate < tomorrow
    }).length
    
    // Load reports for metrics
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const firstDayOfWeek = new Date(now)
    firstDayOfWeek.setDate(now.getDate() - now.getDay())
    
    const [callsReport, revenueReport] = await Promise.all([
      api.getCallsReport({
        startDate: firstDayOfWeek.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      }),
      api.getRevenueReport({
        startDate: firstDayOfMonth.toISOString().split('T')[0],
        endDate: now.toISOString().split('T')[0]
      })
    ])
    
    metrics.value.weekCalls = callsReport.report?.totalCalls || 0
    metrics.value.monthRevenue = revenueReport.report?.totalRevenue || 0
    
    // Mock recent calls data (would come from API in production)
    recentCalls.value = []
  } catch (error) {
    console.error('Failed to load dashboard data:', error)
  } finally {
    loading.value = false
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

function formatTime(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  })
}

function formatRelativeDate(dateString: string): string {
  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  const aptDate = new Date(date)
  aptDate.setHours(0, 0, 0, 0)
  
  if (aptDate.getTime() === today.getTime()) return 'Today'
  if (aptDate.getTime() === tomorrow.getTime()) return 'Tomorrow'
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  })
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`
  
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}
</script>
