<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Dashboard</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Today's Appointments</p>
            <p class="text-3xl font-bold">12</p>
          </div>
          <i class="pi pi-calendar text-blue-600 text-4xl"></i>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Total Calls This Week</p>
            <p class="text-3xl font-bold">48</p>
          </div>
          <i class="pi pi-phone text-green-600 text-4xl"></i>
        </div>
      </div>
      
      <div class="bg-white p-6 rounded-lg shadow">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-600 text-sm">Revenue This Month</p>
            <p class="text-3xl font-bold">$8,450</p>
          </div>
          <i class="pi pi-dollar text-purple-600 text-4xl"></i>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Upcoming Appointments</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center border-b pb-2">
            <div>
              <p class="font-medium">Women's Haircut</p>
              <p class="text-sm text-gray-600">Jane Doe - 2:00 PM</p>
            </div>
            <span class="text-blue-600">Today</span>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <div>
              <p class="font-medium">Full Color</p>
              <p class="text-sm text-gray-600">Sarah Smith - 3:30 PM</p>
            </div>
            <span class="text-blue-600">Today</span>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">Men's Haircut</p>
              <p class="text-sm text-gray-600">John Johnson - 10:00 AM</p>
            </div>
            <span class="text-gray-600">Tomorrow</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Recent Calls</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center border-b pb-2">
            <div>
              <p class="font-medium">Appointment Booking</p>
              <p class="text-sm text-gray-600">+1 (555) 123-4567</p>
            </div>
            <span class="text-sm text-gray-600">5 mins ago</span>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <div>
              <p class="font-medium">Pricing Inquiry</p>
              <p class="text-sm text-gray-600">+1 (555) 987-6543</p>
            </div>
            <span class="text-sm text-gray-600">1 hour ago</span>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">Hours of Operation</p>
              <p class="text-sm text-gray-600">+1 (555) 456-7890</p>
            </div>
            <span class="text-sm text-gray-600">2 hours ago</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
