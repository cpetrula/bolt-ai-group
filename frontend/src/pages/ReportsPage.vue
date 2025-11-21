<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Reports</h1>
    
    <div class="mb-6 flex space-x-4">
      <input
        v-model="dateRange.start"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start Date"
      />
      <input
        v-model="dateRange.end"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="End Date"
      />
      <button 
        @click="generateReports"
        :disabled="loading"
        class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {{ loading ? 'Loading...' : 'Generate Report' }}
      </button>
    </div>

    <div v-if="loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Loading reports...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-6">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Call Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Calls</span>
            <span class="font-semibold text-xl">{{ callsReport?.totalCalls || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Appointment Bookings</span>
            <span class="font-semibold">{{ callsReport?.bookings || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Appointment Modifications</span>
            <span class="font-semibold">{{ callsReport?.modifications || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Appointment Cancellations</span>
            <span class="font-semibold">{{ callsReport?.cancellations || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Pricing Inquiries</span>
            <span class="font-semibold">{{ callsReport?.pricingInquiries || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Hours Inquiries</span>
            <span class="font-semibold">{{ callsReport?.hoursInquiries || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Appointment Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Appointments</span>
            <span class="font-semibold text-xl">{{ appointmentsReport?.totalAppointments || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Completed</span>
            <span class="font-semibold text-green-600">{{ appointmentsReport?.completed || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Upcoming</span>
            <span class="font-semibold text-blue-600">{{ appointmentsReport?.upcoming || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Canceled</span>
            <span class="font-semibold text-red-600">{{ appointmentsReport?.canceled || 0 }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">No Show</span>
            <span class="font-semibold text-yellow-600">{{ appointmentsReport?.noShow || 0 }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Revenue Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Revenue</span>
            <span class="font-semibold text-xl text-green-600">
              {{ formatCurrency(revenueReport?.totalRevenue || 0) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Average per Appointment</span>
            <span class="font-semibold">
              {{ formatCurrency(revenueReport?.averagePerAppointment || 0) }}
            </span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Most Popular Service</span>
            <span class="font-semibold">{{ revenueReport?.mostPopularService || 'N/A' }}</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Highest Revenue Service</span>
            <span class="font-semibold">{{ revenueReport?.highestRevenueService || 'N/A' }}</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Cancellation Reasons</h2>
        <div v-if="!appointmentsReport?.cancellationReasons || Object.keys(appointmentsReport.cancellationReasons).length === 0" class="text-center py-8 text-gray-600">
          No cancellation data available.
        </div>
        <div v-else class="space-y-2">
          <div 
            v-for="(count, reason) in appointmentsReport.cancellationReasons" 
            :key="reason"
            class="flex justify-between items-center"
          >
            <span class="text-gray-600">{{ reason }}</span>
            <span class="font-semibold">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import api from '../services/api'

interface CallsReport {
  totalCalls: number
  bookings: number
  modifications: number
  cancellations: number
  pricingInquiries: number
  hoursInquiries: number
}

interface AppointmentsReport {
  totalAppointments: number
  completed: number
  upcoming: number
  canceled: number
  noShow: number
  cancellationReasons?: Record<string, number>
}

interface RevenueReport {
  totalRevenue: number
  averagePerAppointment: number
  mostPopularService: string
  highestRevenueService: string
}

const callsReport = ref<CallsReport | null>(null)
const appointmentsReport = ref<AppointmentsReport | null>(null)
const revenueReport = ref<RevenueReport | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const dateRange = reactive({
  start: '',
  end: ''
})

onMounted(async () => {
  // Set default date range to current month
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  dateRange.start = firstDay.toISOString().split('T')[0]!
  dateRange.end = lastDay.toISOString().split('T')[0]!
  
  await generateReports()
})

async function generateReports() {
  loading.value = true
  error.value = null
  
  const params = {
    startDate: dateRange.start,
    endDate: dateRange.end
  }
  
  try {
    const [callsResponse, appointmentsResponse, revenueResponse] = await Promise.all([
      api.getCallsReport(params),
      api.getAppointmentsReport(params),
      api.getRevenueReport(params)
    ])
    
    callsReport.value = callsResponse.report
    appointmentsReport.value = appointmentsResponse.report
    revenueReport.value = revenueResponse.report
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load reports'
    console.error('Failed to load reports:', err)
  } finally {
    loading.value = false
  }
}

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`
}
</script>
