<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Employees</h1>
      <button 
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <i class="pi pi-plus mr-2"></i>
        Add Employee
      </button>
    </div>
    
    <div v-if="employeesStore.loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Loading employees...</p>
    </div>

    <div v-else-if="employeesStore.error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
      {{ employeesStore.error }}
    </div>

    <div v-else-if="employeesStore.employees.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-600">No employees found. Add your first employee to get started.</p>
    </div>
    
    <div v-else class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="employee in employeesStore.employees" :key="employee.id">
            <td class="px-6 py-4 whitespace-nowrap">{{ employee.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ employee.role }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ employee.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span 
                class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                :class="employee.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'"
              >
                {{ employee.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button 
                @click="editEmployee(employee)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Edit
              </button>
              <button 
                @click="confirmDelete(employee)"
                class="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingEmployee" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editingEmployee ? 'Edit Employee' : 'Add Employee' }}</h2>
        <form @submit.prevent="saveEmployee">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                v-model="formData.name"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                v-model="formData.email"
                type="email"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                v-model="formData.phone"
                type="tel"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <input
                v-model="formData.role"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                v-model="formData.status"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button
              type="submit"
              :disabled="employeesStore.loading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ employeesStore.loading ? 'Saving...' : 'Save' }}
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="deletingEmployee" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
        <p class="text-gray-700 mb-6">
          Are you sure you want to delete {{ deletingEmployee.name }}? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button
            @click="performDelete"
            :disabled="employeesStore.loading"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ employeesStore.loading ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            @click="deletingEmployee = null"
            class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useEmployeesStore, type Employee } from '../stores/employees'

const employeesStore = useEmployeesStore()
const showAddModal = ref(false)
const editingEmployee = ref<Employee | null>(null)
const deletingEmployee = ref<Employee | null>(null)

const formData = reactive({
  name: '',
  email: '',
  phone: '',
  role: '',
  status: 'active' as 'active' | 'inactive'
})

onMounted(async () => {
  try {
    await employeesStore.fetchEmployees()
  } catch (error) {
    console.error('Failed to load employees:', error)
  }
})

function editEmployee(employee: Employee) {
  editingEmployee.value = employee
  formData.name = employee.name
  formData.email = employee.email
  formData.phone = employee.phone || ''
  formData.role = employee.role
  formData.status = employee.status
}

function confirmDelete(employee: Employee) {
  deletingEmployee.value = employee
}

async function saveEmployee() {
  try {
    if (editingEmployee.value) {
      await employeesStore.updateEmployee(editingEmployee.value.id, formData)
    } else {
      await employeesStore.createEmployee(formData)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save employee:', error)
  }
}

async function performDelete() {
  if (!deletingEmployee.value) return
  
  try {
    await employeesStore.deleteEmployee(deletingEmployee.value.id)
    deletingEmployee.value = null
  } catch (error) {
    console.error('Failed to delete employee:', error)
  }
}

function closeModal() {
  showAddModal.value = false
  editingEmployee.value = null
  formData.name = ''
  formData.email = ''
  formData.phone = ''
  formData.role = ''
  formData.status = 'active'
}
</script>
