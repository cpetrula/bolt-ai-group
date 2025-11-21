<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Services</h1>
      <button 
        @click="showAddModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        <i class="pi pi-plus mr-2"></i>
        Add Service
      </button>
    </div>

    <div v-if="servicesStore.loading" class="text-center py-8">
      <i class="pi pi-spinner pi-spin text-3xl text-blue-600"></i>
      <p class="mt-2 text-gray-600">Loading services...</p>
    </div>

    <div v-else-if="servicesStore.error" class="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">
      {{ servicesStore.error }}
    </div>

    <div v-else-if="servicesStore.services.length === 0" class="bg-white rounded-lg shadow p-8 text-center">
      <p class="text-gray-600">No services found. Add your first service to get started.</p>
    </div>
    
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="service in servicesStore.services" :key="service.id" class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">{{ service.name }}</h3>
        <p class="text-gray-600 mb-4">{{ service.description || 'No description' }}</p>
        <div class="flex justify-between items-center mb-4">
          <span class="text-2xl font-bold text-blue-600">${{ service.price }}</span>
          <span class="text-gray-600">{{ service.duration }} min</span>
        </div>
        <div class="flex space-x-2">
          <button 
            @click="editService(service)"
            class="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100"
          >
            Edit
          </button>
          <button 
            @click="confirmDelete(service)"
            class="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100"
          >
            Delete
          </button>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || editingService" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">{{ editingService ? 'Edit Service' : 'Add Service' }}</h2>
        <form @submit.prevent="saveService">
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
              <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                v-model="formData.description"
                rows="3"
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
              <input
                v-model.number="formData.price"
                type="number"
                step="0.01"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
              <input
                v-model.number="formData.duration"
                type="number"
                required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                v-model="formData.category"
                type="text"
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
              :disabled="servicesStore.loading"
              class="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ servicesStore.loading ? 'Saving...' : 'Save' }}
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
    <div v-if="deletingService" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-xl font-bold mb-4">Confirm Delete</h2>
        <p class="text-gray-700 mb-6">
          Are you sure you want to delete {{ deletingService.name }}? This action cannot be undone.
        </p>
        <div class="flex space-x-3">
          <button
            @click="performDelete"
            :disabled="servicesStore.loading"
            class="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {{ servicesStore.loading ? 'Deleting...' : 'Delete' }}
          </button>
          <button
            @click="deletingService = null"
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
import { useServicesStore, type Service } from '../stores/services'

const servicesStore = useServicesStore()
const showAddModal = ref(false)
const editingService = ref<Service | null>(null)
const deletingService = ref<Service | null>(null)

const formData = reactive({
  name: '',
  description: '',
  price: 0,
  duration: 60,
  category: '',
  status: 'active' as 'active' | 'inactive'
})

onMounted(async () => {
  try {
    await servicesStore.fetchServices()
  } catch (error) {
    console.error('Failed to load services:', error)
  }
})

function editService(service: Service) {
  editingService.value = service
  formData.name = service.name
  formData.description = service.description || ''
  formData.price = service.price
  formData.duration = service.duration
  formData.category = service.category || ''
  formData.status = service.status
}

function confirmDelete(service: Service) {
  deletingService.value = service
}

async function saveService() {
  try {
    if (editingService.value) {
      await servicesStore.updateService(editingService.value.id, formData)
    } else {
      await servicesStore.createService(formData)
    }
    closeModal()
  } catch (error) {
    console.error('Failed to save service:', error)
  }
}

async function performDelete() {
  if (!deletingService.value) return
  
  try {
    await servicesStore.deleteService(deletingService.value.id)
    deletingService.value = null
  } catch (error) {
    console.error('Failed to delete service:', error)
  }
}

function closeModal() {
  showAddModal.value = false
  editingService.value = null
  formData.name = ''
  formData.description = ''
  formData.price = 0
  formData.duration = 60
  formData.category = ''
  formData.status = 'active'
}
</script>
