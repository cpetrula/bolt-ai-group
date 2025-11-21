<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-4xl font-bold mb-8">How It Works</h1>
    
    <div class="space-y-8">
      <section>
        <h2 class="text-2xl font-semibold mb-4">1. Sign Up & Get Your Phone Number</h2>
        <p class="text-gray-700">
          Create your account and receive a unique phone number dedicated to your business.
          Forward your existing phone line to this number, or use it as your primary contact.
        </p>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">2. Customize Your AI Assistant</h2>
        <p class="text-gray-700 mb-4">
          Through our admin portal, you can:
        </p>
        <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Add your employees and their schedules</li>
          <li>Define your services with prices and durations</li>
          <li>Set your business hours and greeting</li>
          <li>Configure notification preferences</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">3. AI Handles Your Calls</h2>
        <p class="text-gray-700 mb-4">
          When customers call, your AI assistant can:
        </p>
        <ul class="list-disc list-inside space-y-2 text-gray-700 ml-4">
          <li>Answer questions about your services and pricing</li>
          <li>Check employee availability and schedules</li>
          <li>Book, modify, or cancel appointments</li>
          <li>Provide your business hours</li>
          <li>Send confirmation texts to customers</li>
        </ul>
      </section>

      <section>
        <h2 class="text-2xl font-semibold mb-4">4. Manage Everything from Your Dashboard</h2>
        <p class="text-gray-700">
          View all appointments, call logs, and reports in one place. Make manual adjustments
          as needed and track your business performance with detailed analytics.
        </p>
      </section>

      <div class="bg-blue-50 p-6 rounded-lg">
        <h3 class="text-xl font-semibold mb-4">Ready to get started?</h3>
        <router-link
          to="/signup"
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Sign Up Now
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
