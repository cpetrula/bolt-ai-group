import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '../services/api'

export interface Employee {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  status: 'active' | 'inactive'
  schedule?: any
  createdAt: string
}

export const useEmployeesStore = defineStore('employees', () => {
  const employees = ref<Employee[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchEmployees() {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.getEmployees()
      employees.value = response.employees
      loading.value = false
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to fetch employees'
      loading.value = false
      throw err
    }
  }

  async function createEmployee(data: Partial<Employee>) {
    loading.value = true
    error.value = null
    
    try {
      const response = await api.createEmployee(data)
      employees.value.push(response.employee)
      loading.value = false
      return response
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to create employee'
      loading.value = false
      throw err
    }
  }

  async function updateEmployee(id: string, data: Partial<Employee>) {
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
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update employee'
      loading.value = false
      throw err
    }
  }

  async function deleteEmployee(id: string) {
    loading.value = true
    error.value = null
    
    try {
      await api.deleteEmployee(id)
      employees.value = employees.value.filter(e => e.id !== id)
      loading.value = false
    } catch (err: any) {
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
