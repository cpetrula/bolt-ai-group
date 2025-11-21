<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Billing & Subscription</h1>
    
    <div v-if="loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Loading billing information...</p>
    </div>

    <div v-else-if="error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-6">
      {{ error }}
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Current Plan</h2>
        <div class="mb-4">
          <p class="text-gray-600">Plan Type</p>
          <p class="text-2xl font-bold text-blue-600">{{ subscription?.interval || 'Monthly' }}</p>
        </div>
        <div class="mb-4">
          <p class="text-gray-600">Amount</p>
          <p class="text-2xl font-bold">{{ formatMonthlyPrice(subscription?.amount || 29500) }}</p>
        </div>
        <div class="mb-6">
          <p class="text-gray-600">Next Billing Date</p>
          <p class="font-semibold">{{ formatDate(subscription?.currentPeriodEnd) }}</p>
        </div>
        <div class="mb-6">
          <p class="text-gray-600">Status</p>
          <p class="font-semibold">
            <span 
              class="px-2 py-1 rounded-full text-sm"
              :class="{
                'bg-green-100 text-green-800': subscription?.status === 'active',
                'bg-yellow-100 text-yellow-800': subscription?.status === 'trialing',
                'bg-red-100 text-red-800': subscription?.status === 'canceled' || subscription?.status === 'past_due'
              }"
            >
              {{ subscription?.status || 'Active' }}
            </span>
          </p>
        </div>
        <button 
          @click="openCustomerPortal"
          :disabled="portalLoading"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-2 disabled:opacity-50"
        >
          {{ portalLoading ? 'Loading...' : 'Manage Subscription & Payment' }}
        </button>
        <p class="text-xs text-gray-600 text-center">
          Opens Stripe Customer Portal for subscription and payment management
        </p>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Billing History</h2>
        <div v-if="!subscription?.invoices || subscription.invoices.length === 0" class="text-center py-8 text-gray-600">
          No billing history available.
        </div>
        <div v-else class="space-y-3">
          <div 
            v-for="invoice in subscription.invoices" 
            :key="invoice.id"
            class="flex justify-between items-center border-b pb-2"
          >
            <div>
              <p class="font-medium">{{ invoice.description || 'Monthly Subscription' }}</p>
              <p class="text-sm text-gray-600">{{ formatDate(invoice.date) }}</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">{{ formatMonthlyPrice(invoice.amount) }}</p>
              <a 
                v-if="invoice.pdfUrl"
                :href="invoice.pdfUrl" 
                target="_blank"
                class="text-sm text-blue-600 hover:underline"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="subscription?.status === 'active'" class="bg-red-50 border border-red-200 p-6 rounded-lg mt-6">
      <h3 class="text-lg font-semibold text-red-800 mb-2">Cancel Subscription</h3>
      <p class="text-red-700 mb-4">
        Canceling your subscription will disable your AI assistant at the end of the current billing period.
        You can manage cancellation through the Stripe Customer Portal.
      </p>
      <button 
        @click="openCustomerPortal"
        :disabled="portalLoading"
        class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
      >
        {{ portalLoading ? 'Loading...' : 'Manage Subscription' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../services/api'

interface Subscription {
  id: string
  status: string
  amount: number
  interval: string
  currentPeriodEnd: string
  invoices?: Array<{
    id: string
    description?: string
    date: string
    amount: number
    pdfUrl?: string
  }>
}

const subscription = ref<Subscription | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const portalLoading = ref(false)

onMounted(async () => {
  await fetchSubscription()
})

async function fetchSubscription() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.getSubscription()
    subscription.value = response.subscription
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load subscription details'
    console.error('Failed to load subscription:', err)
  } finally {
    loading.value = false
  }
}

async function openCustomerPortal() {
  portalLoading.value = true
  error.value = null
  
  try {
    const response = await api.createPortalSession()
    if (response.url) {
      window.location.href = response.url
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to open customer portal'
    console.error('Failed to open portal:', err)
  } finally {
    portalLoading.value = false
  }
}

function formatMonthlyPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)} / month`
}

function formatDate(dateString?: string): string {
  if (!dateString) return 'N/A'
  
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>
