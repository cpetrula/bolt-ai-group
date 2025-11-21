<template>
  <div class="min-h-screen">
    <!-- Hero Section -->
    <section class="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h1 class="text-5xl font-bold mb-6">
            Your AI Assistant That Never Takes a Day Off
          </h1>
          <p class="text-xl mb-8 max-w-3xl mx-auto">
            Modernize your business with an AI assistant that answers calls, books appointments, 
            and provides information 24/7 - never in a bad mood, never calls in sick.
          </p>
          <div class="flex justify-center space-x-4">
            <router-link
              to="/signup"
              class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Get Started
            </router-link>
            <a
              href="tel:+1-555-DEMO"
              class="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition text-lg"
            >
              Try Demo: +1-555-DEMO
            </a>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">Why Choose Bolt AI?</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div class="text-center">
            <div class="text-4xl mb-4">🚀</div>
            <h3 class="font-semibold text-lg mb-2">Never Calls Out Sick</h3>
            <p class="text-gray-600">Always available, always reliable</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">😊</div>
            <h3 class="font-semibold text-lg mb-2">Never in a Bad Mood</h3>
            <p class="text-gray-600">Consistently friendly and professional</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">📞</div>
            <h3 class="font-semibold text-lg mb-2">Multiple Calls at Once</h3>
            <p class="text-gray-600">Handle unlimited simultaneous calls</p>
          </div>
          <div class="text-center">
            <div class="text-4xl mb-4">🕐</div>
            <h3 class="font-semibold text-lg mb-2">24/7 Availability</h3>
            <p class="text-gray-600">Round-the-clock customer service</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section -->
    <section class="bg-gray-100 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl font-bold text-center mb-12">Simple, Transparent Pricing</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <div class="bg-white p-8 rounded-lg shadow-md">
            <h3 class="text-2xl font-bold mb-4">Monthly</h3>
            <div class="text-4xl font-bold mb-4">$295<span class="text-lg text-gray-600">/month</span></div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Unlimited calls
              </li>
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Appointment management
              </li>
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Custom business hours
              </li>
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Analytics & reports
              </li>
            </ul>
            <router-link
              to="/signup"
              class="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </router-link>
          </div>
          <div class="bg-white p-8 rounded-lg shadow-md border-2 border-blue-600 relative">
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
              SAVE 20%
            </div>
            <h3 class="text-2xl font-bold mb-4">Yearly</h3>
            <div class="text-4xl font-bold mb-4">$2,832<span class="text-lg text-gray-600">/year</span></div>
            <ul class="space-y-2 mb-6">
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Everything in Monthly
              </li>
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                20% discount
              </li>
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Priority support
              </li>
              <li class="flex items-center">
                <i class="pi pi-check text-green-600 mr-2"></i>
                Early access to new features
              </li>
            </ul>
            <router-link
              to="/signup"
              class="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-16">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl font-bold mb-4">Ready to Transform Your Business?</h2>
        <p class="text-xl text-gray-600 mb-8">
          Join hundreds of businesses leveraging AI to improve customer service
        </p>
        <router-link
          to="/signup"
          class="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition text-lg"
        >
          Start Free Trial
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>
