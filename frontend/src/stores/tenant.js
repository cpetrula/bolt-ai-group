import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'


export const useTenantStore = defineStore('tenant', () => {
  const settings = ref(null)
  const loading = ref(false)
  const error = ref(null)

  async function fetchSettings() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getTenantSettings()
      settings.value = response.settings
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch tenant settings'
      loading.value = false
      throw err
    }
  }

  async function updateSettings(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateTenantSettings(data)
      settings.value = response.settings
      loading.value = false
      return response
    } catch (err) {
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
