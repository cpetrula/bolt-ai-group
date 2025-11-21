<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Reports</h1>
    
    <div class="mb-6 flex space-x-4">
      <input
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Start Date"
      />
      <input
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="End Date"
      />
      <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
        Generate Report
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Call Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Calls</span>
            <span class="font-semibold text-xl">156</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Appointment Bookings</span>
            <span class="font-semibold">89</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Appointment Modifications</span>
            <span class="font-semibold">23</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Appointment Cancellations</span>
            <span class="font-semibold">12</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Pricing Inquiries</span>
            <span class="font-semibold">18</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Hours Inquiries</span>
            <span class="font-semibold">14</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Appointment Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Appointments</span>
            <span class="font-semibold text-xl">124</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Completed</span>
            <span class="font-semibold text-green-600">98</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Upcoming</span>
            <span class="font-semibold text-blue-600">14</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Canceled</span>
            <span class="font-semibold text-red-600">12</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Revenue Summary</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Total Revenue</span>
            <span class="font-semibold text-xl text-green-600">$8,450</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Average per Appointment</span>
            <span class="font-semibold">$86</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Most Popular Service</span>
            <span class="font-semibold">Women's Haircut</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Cancellation Reasons</h2>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Schedule Conflict</span>
            <span class="font-semibold">5</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Personal Emergency</span>
            <span class="font-semibold">3</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Found Alternative</span>
            <span class="font-semibold">2</span>
          </div>
          <div class="flex justify-between items-center">
            <span class="text-gray-600">Other</span>
            <span class="font-semibold">2</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
