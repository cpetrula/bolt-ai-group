import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Appointment {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  employeeId: string
  employeeName: string
  serviceId: string
  serviceName: string
  scheduledAt: string
  duration: number
  status: 'booked' | 'completed' | 'canceled' | 'no-show'
  notes?: string
  createdAt: string
}

export const useAppointmentsStore = defineStore('appointments', () => {
  const appointments = ref<Appointment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAppointments(params?: any) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getAppointments(params)
      appointments.value = response.appointments || []
      loading.value = false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch appointments'
      loading.value = false
      throw err
    }
  }

  async function createAppointment(data: Partial<Appointment>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createAppointment(data)
      appointments.value.push(response.appointment)
      loading.value = false
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create appointment'
      loading.value = false
      throw err
    }
  }

  async function updateAppointment(id: string, data: Partial<Appointment>) {
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update appointment'
      loading.value = false
      throw err
    }
  }

  async function deleteAppointment(id: string) {
    loading.value = true
    error.value = null
    
    try {
      await api.deleteAppointment(id)
      appointments.value = appointments.value.filter(a => a.id !== id)
      loading.value = false
    } catch (err: any) {
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
