import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Service {
  id: string
  name: string
  description?: string
  price: number
  duration: number
  category?: string
  status: 'active' | 'inactive'
  createdAt: string
}

export const useServicesStore = defineStore('services', () => {
  const services = ref<Service[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchServices() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getServices()
      services.value = response.services || []
      loading.value = false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch services'
      loading.value = false
      throw err
    }
  }

  async function createService(data: Partial<Service>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createService(data)
      services.value.push(response.service)
      loading.value = false
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create service'
      loading.value = false
      throw err
    }
  }

  async function updateService(id: string, data: Partial<Service>) {
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update service'
      loading.value = false
      throw err
    }
  }

  async function deleteService(id: string) {
    loading.value = true
    error.value = null
    
    try {
      await api.deleteService(id)
      services.value = services.value.filter(s => s.id !== id)
      loading.value = false
    } catch (err: any) {
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
