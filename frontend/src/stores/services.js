import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'


export const useServicesStore = defineStore('services', () => {
  const services = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchServices() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getServices()
      services.value = response.services || []
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch services'
      loading.value = false
      throw err
    }
  }

  async function createService(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createService(data)
      services.value.push(response.service)
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create service'
      loading.value = false
      throw err
    }
  }

  async function updateService(id, data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateService(id, data)
      const index = services.value.findIndex(s => s.id === id)
      if (index !== -1) {
        services.value[index] = response.service
      }
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update service'
      loading.value = false
      throw err
    }
  }

  async function deleteService(id) {
    loading.value = true
    error.value = null
    
    try {
      await api.deleteService(id)
      services.value = services.value.filter(s => s.id !== id)
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete service'
      loading.value = false
      throw err
    }
  }

  return {
    services,
    loading,
    error,
    fetchServices,
    createService,
    updateService,
    deleteService,
  }
})
