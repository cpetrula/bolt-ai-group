import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface TenantSettings {
  id: string
  name: string
  businessType: string
  primaryContactName: string
  primaryContactEmail: string
  primaryContactPhone: string
  twilioPhoneNumber?: string
  status: string
  greeting?: string
  notificationPreferences?: any
}

export const useTenantStore = defineStore('tenant', () => {
  const settings = ref<TenantSettings | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getTenantSettings()
      settings.value = response.settings
      loading.value = false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch tenant settings'
      loading.value = false
      throw err
    }
  }

  async function updateSettings(data: Partial<TenantSettings>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateTenantSettings(data)
      settings.value = response.settings
      loading.value = false
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update tenant settings'
      loading.value = false
      throw err
    }
  }

  function clearSettings() {
    settings.value = null
    error.value = null
  }

  return {
    settings,
    loading,
    error,
    fetchSettings,
    updateSettings,
    clearSettings,
  }
})
