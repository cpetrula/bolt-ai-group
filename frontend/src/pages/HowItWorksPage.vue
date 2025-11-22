<template>
  <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold text-secondary-900 mb-4 text-center">How It Works</h1>
    <p class="text-xl text-secondary-600 mb-12 text-center">
      Get started with your AI assistant in four simple steps
    </p>
    
    <div class="space-y-8">
      <section class="bg-white rounded-xl shadow-soft p-8 border border-gray-100">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            1
          </div>
          <div class="flex-grow">
            <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Sign Up & Get Your Phone Number</h2>
            <p class="text-secondary-700 leading-relaxed">
              Create your account and receive a unique phone number dedicated to your business.
              Forward your existing phone line to this number, or use it as your primary contact.
            </p>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-soft p-8 border border-gray-100">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            2
          </div>
          <div class="flex-grow">
            <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Customize Your AI Assistant</h2>
            <p class="text-secondary-700 mb-4 leading-relaxed">
              Through our admin portal, you can:
            </p>
            <ul class="space-y-3 text-secondary-700">
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Add your employees and their schedules</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Define your services with prices and durations</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Set your business hours and greeting</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Configure notification preferences</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-soft p-8 border border-gray-100">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            3
          </div>
          <div class="flex-grow">
            <h2 class="text-2xl font-semibold text-secondary-900 mb-4">AI Handles Your Calls</h2>
            <p class="text-secondary-700 mb-4 leading-relaxed">
              When customers call, your AI assistant can:
            </p>
            <ul class="space-y-3 text-secondary-700">
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Answer questions about your services and pricing</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Check employee availability and schedules</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Book, modify, or cancel appointments</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Provide your business hours</span>
              </li>
              <li class="flex items-start">
                <i class="pi pi-check-circle text-success-600 mr-3 mt-1" aria-hidden="true"></i>
                <span>Send confirmation texts to customers</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section class="bg-white rounded-xl shadow-soft p-8 border border-gray-100">
        <div class="flex items-start gap-4">
          <div class="flex-shrink-0 w-12 h-12 bg-primary-600 text-white rounded-full flex items-center justify-center text-xl font-bold">
            4
          </div>
          <div class="flex-grow">
            <h2 class="text-2xl font-semibold text-secondary-900 mb-4">Manage Everything from Your Dashboard</h2>
            <p class="text-secondary-700 leading-relaxed">
              View all appointments, call logs, and reports in one place. Make manual adjustments
              as needed and track your business performance with detailed analytics.
            </p>
          </div>
        </div>
      </section>

      <div class="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-2xl shadow-medium text-center text-white mt-12">
        <h3 class="text-2xl font-semibold mb-4">Ready to get started?</h3>
        <p class="text-primary-100 mb-6 text-lg">
          Join hundreds of businesses already using Bolt AI to transform their customer service
        </p>
        <router-link
          to="/signup"
          class="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-white"
          aria-label="Sign up now"
        >
          Sign Up Now
          <i class="pi pi-arrow-right ml-2" aria-hidden="true"></i>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
