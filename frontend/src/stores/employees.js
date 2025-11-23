import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'


export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchEmployees() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getEmployees()
      employees.value = response.employees || []
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to fetch employees'
      loading.value = false
      throw err
    }
  }

  async function createEmployee(data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createEmployee(data)
      employees.value.push(response.employee)
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to create employee'
      loading.value = false
      throw err
    }
  }

  async function updateEmployee(id, data) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.updateEmployee(id, data)
      const index = employees.value.findIndex(e => e.id === id)
      if (index !== -1) {
        employees.value[index] = response.employee
      }
      loading.value = false
      return response
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to update employee'
      loading.value = false
      throw err
    }
  }

  async function deleteEmployee(id) {
    loading.value = true
    error.value = null
    
    try {
      await api.deleteEmployee(id)
      employees.value = employees.value.filter(e => e.id !== id)
      loading.value = false
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to delete employee'
      loading.value = false
      throw err
    }
  }

  return {
    employees,
    loading,
    error,
    fetchEmployees,
    createEmployee,
    updateEmployee,
    deleteEmployee,
  }
})
