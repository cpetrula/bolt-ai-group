<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Billing & Subscription</h1>
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Current Plan</h2>
        <div class="mb-4">
          <p class="text-gray-600">Plan Type</p>
          <p class="text-2xl font-bold text-blue-600">Monthly</p>
        </div>
        <div class="mb-4">
          <p class="text-gray-600">Amount</p>
          <p class="text-2xl font-bold">$295 / month</p>
        </div>
        <div class="mb-6">
          <p class="text-gray-600">Next Billing Date</p>
          <p class="font-semibold">December 21, 2024</p>
        </div>
        <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 mb-2">
          Upgrade to Yearly (Save 20%)
        </button>
        <button class="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200">
          Manage Payment Method
        </button>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Billing History</h2>
        <div class="space-y-3">
          <div class="flex justify-between items-center border-b pb-2">
            <div>
              <p class="font-medium">Monthly Subscription</p>
              <p class="text-sm text-gray-600">Nov 21, 2024</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">$295.00</p>
              <a href="#" class="text-sm text-blue-600 hover:underline">Download</a>
            </div>
          </div>
          <div class="flex justify-between items-center border-b pb-2">
            <div>
              <p class="font-medium">Monthly Subscription</p>
              <p class="text-sm text-gray-600">Oct 21, 2024</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">$295.00</p>
              <a href="#" class="text-sm text-blue-600 hover:underline">Download</a>
            </div>
          </div>
          <div class="flex justify-between items-center">
            <div>
              <p class="font-medium">Monthly Subscription</p>
              <p class="text-sm text-gray-600">Sep 21, 2024</p>
            </div>
            <div class="text-right">
              <p class="font-semibold">$295.00</p>
              <a href="#" class="text-sm text-blue-600 hover:underline">Download</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-red-50 border border-red-200 p-6 rounded-lg mt-6">
      <h3 class="text-lg font-semibold text-red-800 mb-2">Cancel Subscription</h3>
      <p class="text-red-700 mb-4">
        Canceling your subscription will disable your AI assistant at the end of the current billing period.
      </p>
      <button class="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
        Cancel Subscription
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
