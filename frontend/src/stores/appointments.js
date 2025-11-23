import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'


export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchAppointments(params) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getAppointments(params)
      appointments.value = response.appointments || []
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch appointments'
      loading.value = false
      throw err
    }
  }

  async function createAppointment(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createAppointment(data)
      appointments.value.push(response.appointment)
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create appointment'
      loading.value = false
      throw err
    }
  }

  async function updateAppointment(id, data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateAppointment(id, data)
      const index = appointments.value.findIndex(a => a.id === id)
      if (index !== -1) {
        appointments.value[index] = response.appointment
      }
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update appointment'
      loading.value = false
      throw err
    }
  }

  async function deleteAppointment(id) {
    loading.value = true
    error.value = null
    
    try {
      await api.deleteAppointment(id)
      appointments.value = appointments.value.filter(a => a.id !== id)
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete appointment'
      loading.value = false
      throw err
    }
  }

  return {
    appointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    deleteAppointment,
  }
})
