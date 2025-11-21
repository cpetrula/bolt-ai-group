<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Settings</h1>
    
    <div v-if="tenantStore.loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Loading settings...</p>
    </div>

    <div v-else-if="tenantStore.error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700 mb-6">
      {{ tenantStore.error }}
    </div>

    <div v-else class="space-y-6">
      <div v-if="successMessage" class="bg-green-50 border border-green-200 p-4 rounded-lg text-green-700 mb-6">
        {{ successMessage }}
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Business Information</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              v-model="formData.name"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Type</label>
            <input
              v-model="formData.businessType"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
            <input
              v-model="formData.primaryContactName"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              v-model="formData.primaryContactPhone"
              type="tel"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              v-model="formData.primaryContactEmail"
              type="email"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div v-if="formData.twilioPhoneNumber">
            <label class="block text-sm font-medium text-gray-700 mb-1">Twilio Phone Number</label>
            <input
              v-model="formData.twilioPhoneNumber"
              type="tel"
              readonly
              class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
            />
            <p class="text-xs text-gray-600 mt-1">This is your AI assistant's phone number</p>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">AI Assistant Configuration</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
            <textarea
              v-model="formData.greeting"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hi, thanks for calling [Business Name]. I'm your virtual assistant. How can I help you today?"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
            <p class="text-xs text-gray-600 mb-2">Configure your business hours for the AI assistant</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Monday - Friday</label>
                <div class="flex space-x-2">
                  <input
                    v-model="businessHours.weekdayStart"
                    type="time"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="self-center">to</span>
                  <input
                    v-model="businessHours.weekdayEnd"
                    type="time"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Saturday</label>
                <div class="flex space-x-2">
                  <input
                    v-model="businessHours.saturdayStart"
                    type="time"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="self-center">to</span>
                  <input
                    v-model="businessHours.saturdayEnd"
                    type="time"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              v-model="notificationPreferences.emailAppointments"
              type="checkbox"
              id="email-notif"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="email-notif" class="ml-2 text-gray-700">Email notifications for new appointments</label>
          </div>
          <div class="flex items-center">
            <input
              v-model="notificationPreferences.smsAppointments"
              type="checkbox"
              id="sms-notif"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="sms-notif" class="ml-2 text-gray-700">SMS notifications for new appointments</label>
          </div>
          <div class="flex items-center">
            <input
              v-model="notificationPreferences.cancellations"
              type="checkbox"
              id="cancel-notif"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="cancel-notif" class="ml-2 text-gray-700">Notifications for cancellations</label>
          </div>
          <div class="flex items-center">
            <input
              v-model="notificationPreferences.dailySummary"
              type="checkbox"
              id="daily-summary"
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="daily-summary" class="ml-2 text-gray-700">Daily summary email</label>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button 
          @click="saveSettings"
          :disabled="saving"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useTenantStore } from '../stores/tenant'

const tenantStore = useTenantStore()
const saving = ref(false)
const successMessage = ref<string | null>(null)

const formData = reactive({
  name: '',
  businessType: '',
  primaryContactName: '',
  primaryContactEmail: '',
  primaryContactPhone: '',
  twilioPhoneNumber: '',
  greeting: ''
})

const businessHours = reactive({
  weekdayStart: '09:00',
  weekdayEnd: '18:00',
  saturdayStart: '10:00',
  saturdayEnd: '16:00'
})

const notificationPreferences = reactive({
  emailAppointments: true,
  smsAppointments: true,
  cancellations: true,
  dailySummary: false
})

onMounted(async () => {
  if (!tenantStore.settings) {
    try {
      await tenantStore.fetchSettings()
    } catch (error) {
      console.error('Failed to load settings:', error)
    }
  }
  loadFormData()
})

watch(() => tenantStore.settings, () => {
  loadFormData()
})

function loadFormData() {
  if (!tenantStore.settings) return
  
  formData.name = tenantStore.settings.name || ''
  formData.businessType = tenantStore.settings.businessType || ''
  formData.primaryContactName = tenantStore.settings.primaryContactName || ''
  formData.primaryContactEmail = tenantStore.settings.primaryContactEmail || ''
  formData.primaryContactPhone = tenantStore.settings.primaryContactPhone || ''
  formData.twilioPhoneNumber = tenantStore.settings.twilioPhoneNumber || ''
  formData.greeting = tenantStore.settings.greeting || ''
  
  if (tenantStore.settings.notificationPreferences) {
    Object.assign(notificationPreferences, tenantStore.settings.notificationPreferences)
  }
}

async function saveSettings() {
  saving.value = true
  successMessage.value = null
  
  try {
    const updateData = {
      ...formData,
      businessHours,
      notificationPreferences
    }
    
    await tenantStore.updateSettings(updateData)
    successMessage.value = 'Settings saved successfully!'
    
    setTimeout(() => {
      successMessage.value = null
    }, 3000)
  } catch (error) {
    console.error('Failed to save settings:', error)
  } finally {
    saving.value = false
  }
}
</script>
