<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-3xl font-bold">Services</h1>
      <button class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
        <i class="pi pi-plus mr-2"></i>
        Add Service
      </button>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">Women's Haircut</h3>
        <p class="text-gray-600 mb-4">Professional haircut and styling</p>
        <div class="flex justify-between items-center mb-4">
          <span class="text-2xl font-bold text-blue-600">$75</span>
          <span class="text-gray-600">60 min</span>
        </div>
        <div class="flex space-x-2">
          <button class="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100">
            Edit
          </button>
          <button class="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">Men's Haircut</h3>
        <p class="text-gray-600 mb-4">Classic men's haircut</p>
        <div class="flex justify-between items-center mb-4">
          <span class="text-2xl font-bold text-blue-600">$50</span>
          <span class="text-gray-600">45 min</span>
        </div>
        <div class="flex space-x-2">
          <button class="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100">
            Edit
          </button>
          <button class="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-xl font-semibold mb-2">Full Color</h3>
        <p class="text-gray-600 mb-4">Complete hair coloring service</p>
        <div class="flex justify-between items-center mb-4">
          <span class="text-2xl font-bold text-blue-600">$150</span>
          <span class="text-gray-600">120 min</span>
        </div>
        <div class="flex space-x-2">
          <button class="flex-1 bg-blue-50 text-blue-600 px-3 py-2 rounded hover:bg-blue-100">
            Edit
          </button>
          <button class="flex-1 bg-red-50 text-red-600 px-3 py-2 rounded hover:bg-red-100">
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
