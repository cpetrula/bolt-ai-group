<template>
  <div>
    <h1 class="text-3xl font-bold mb-6">Settings</h1>
    
    <div class="space-y-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Business Information</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
            <input
              type="text"
              value="Demo Salon"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value="+1 (555) 123-4567"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              readonly
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value="owner@demosalon.com"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">AI Assistant Configuration</h2>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Greeting Message</label>
            <textarea
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Hi, thanks for calling [Business Name]. I'm your virtual assistant. How can I help you today?"
            ></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Business Hours</label>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs text-gray-600 mb-1">Monday - Friday</label>
                <div class="flex space-x-2">
                  <input
                    type="time"
                    value="09:00"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="self-center">to</span>
                  <input
                    type="time"
                    value="18:00"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label class="block text-xs text-gray-600 mb-1">Saturday</label>
                <div class="flex space-x-2">
                  <input
                    type="time"
                    value="10:00"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span class="self-center">to</span>
                  <input
                    type="time"
                    value="16:00"
                    class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-4">Notification Preferences</h2>
        <div class="space-y-3">
          <div class="flex items-center">
            <input
              type="checkbox"
              id="email-notif"
              checked
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="email-notif" class="ml-2 text-gray-700">Email notifications for new appointments</label>
          </div>
          <div class="flex items-center">
            <input
              type="checkbox"
              id="sms-notif"
              checked
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="sms-notif" class="ml-2 text-gray-700">SMS notifications for new appointments</label>
          </div>
          <div class="flex items-center">
            <input
              type="checkbox"
              id="cancel-notif"
              checked
              class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label for="cancel-notif" class="ml-2 text-gray-700">Notifications for cancellations</label>
          </div>
        </div>
      </div>

      <div class="flex justify-end">
        <button class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
