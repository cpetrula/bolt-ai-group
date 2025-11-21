<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Appointments</h1>
      <button 
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <i class="pi pi-plus mr-2"></i>
        New Appointment
      </button>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <div class="mb-4 flex space-x-4">
        <input
          v-model="filters.date"
          type="date"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select 
          v-model="filters.employeeId"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Employees</option>
        </select>
        <select 
          v-model="filters.status"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="booked">Booked</option>
          <option value="completed">Completed</option>
          <option value="canceled">Canceled</option>
          <option value="no-show">No Show</option>
        </select>
        <button 
          @click="applyFilters"
          class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Apply
        </button>
      </div>

      <div v-if="appointmentsStore.loading" class="text-center py-8">
        <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
        <p class="mt-2 text-gray-600">Loading appointments...</p>
      </div>

      <div v-else-if="appointmentsStore.error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
        {{ appointmentsStore.error }}
      </div>

      <div v-else-if="appointmentsStore.appointments.length === 0" class="text-center py-8">
        <p class="text-gray-600">No appointments found.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date & Time
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Customer
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Service
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
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
            <tr v-for="appointment in appointmentsStore.appointments" :key="appointment.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDateTime(appointment.scheduledAt) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ appointment.customerName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ appointment.serviceName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ appointment.employeeName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  :class="{
                    'bg-green-100 text-green-800': appointment.status === 'booked',
                    'bg-blue-100 text-blue-800': appointment.status === 'completed',
                    'bg-red-100 text-red-800': appointment.status === 'canceled',
                    'bg-yellow-100 text-yellow-800': appointment.status === 'no-show'
                  }"
                >
                  {{ appointment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button 
                  @click="editAppointment(appointment)"
                  class="text-blue-600 hover:text-blue-900 mr-3"
                >
                  Edit
                </button>
                <button 
                  @click="confirmCancel(appointment)"
                  class="text-red-600 hover:text-red-900"
                >
                  Cancel
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingAppointment" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editingAppointment ? 'Edit Appointment' : 'New Appointment' }}</h2>
        <form @submit.prevent="saveAppointment">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input
                v-model="formData.customerName"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
              <input
                v-model="formData.customerPhone"
                type="tel"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Service</label>
              <input
                v-model="formData.serviceName"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Employee</label>
              <input
                v-model="formData.employeeName"
                type="text"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <input
                v-model="formData.scheduledAt"
                type="datetime-local"
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
                <option value="booked">Booked</option>
                <option value="completed">Completed</option>
                <option value="canceled">Canceled</option>
                <option value="no-show">No Show</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                v-model="formData.notes"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
          </div>
          <div class="flex space-x-3 mt-6">
            <button
              type="submit"
              :disabled="appointmentsStore.loading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ appointmentsStore.loading ? 'Saving...' : 'Save' }}
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

    <!-- Cancel Confirmation Modal -->
    <div v-if="cancelingAppointment" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Confirm Cancellation</h2>
        <p class="text-gray-700 mb-6">
          Are you sure you want to cancel this appointment for {{ cancelingAppointment.customerName }}?
        </p>
        <div class="flex space-x-3">
          <button
            @click="performCancel"
            :disabled="appointmentsStore.loading"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ appointmentsStore.loading ? 'Canceling...' : 'Cancel Appointment' }}
          </button>
          <button
            @click="cancelingAppointment = null"
            class="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200"
          >
            Keep Appointment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { useAppointmentsStore, type Appointment } from '../stores/appointments'

const appointmentsStore = useAppointmentsStore()
const showAddModal = ref(false)
const editingAppointment = ref<Appointment | null>(null)
const cancelingAppointment = ref<Appointment | null>(null)

const filters = reactive({
  date: '',
  employeeId: '',
  status: ''
})

const formData = reactive({
  customerName: '',
  customerPhone: '',
  serviceName: '',
  employeeName: '',
  scheduledAt: '',
  status: 'booked' as 'booked' | 'completed' | 'canceled' | 'no-show',
  notes: ''
})

onMounted(async () => {
  try {
    await appointmentsStore.fetchAppointments()
  } catch (error) {
    console.error('Failed to load appointments:', error)
  }
})

function formatDateTime(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  })
}

function editAppointment(appointment: Appointment) {
  editingAppointment.value = appointment
  formData.customerName = appointment.customerName
  formData.customerPhone = appointment.customerPhone
  formData.serviceName = appointment.serviceName
  formData.employeeName = appointment.employeeName
  formData.scheduledAt = new Date(appointment.scheduledAt).toISOString().slice(0, 16)
  formData.status = appointment.status
  formData.notes = appointment.notes || ''
}

function confirmCancel(appointment: Appointment) {
  cancelingAppointment.value = appointment
}

async function saveAppointment() {
  try {
    if (editingAppointment.value) {
      await appointmentsStore.updateAppointment(editingAppointment.value.id, formData)
    } else {
      await appointmentsStore.createAppointment(formData)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save appointment:', error)
  }
}

async function performCancel() {
  if (!cancelingAppointment.value) return
  
  try {
    await appointmentsStore.updateAppointment(cancelingAppointment.value.id, { status: 'canceled' })
    cancelingAppointment.value = null
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
  }
}

async function applyFilters() {
  try {
    await appointmentsStore.fetchAppointments(filters)
  } catch (error) {
    console.error('Failed to apply filters:', error)
  }
}

function closeModal() {
  showAddModal.value = false
  editingAppointment.value = null
  formData.customerName = ''
  formData.customerPhone = ''
  formData.serviceName = ''
  formData.employeeName = ''
  formData.scheduledAt = ''
  formData.status = 'booked'
  formData.notes = ''
}
</script>
