<template>
  <div class="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <h1 class="text-4xl font-bold text-secondary-900 mb-4 text-center">Frequently Asked Questions</h1>
    <p class="text-xl text-secondary-600 mb-12 text-center">
      Everything you need to know about TONRIS AI virtual assistants
    </p>
    
    <div class="space-y-6">
      <div class="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h2 class="text-xl font-semibold text-secondary-900 mb-3 flex items-start">
          <i class="pi pi-question-circle text-primary-600 mr-3 mt-1" aria-hidden="true"></i>
          <span>How does the AI answer calls?</span>
        </h2>
        <p class="text-secondary-700 leading-relaxed ml-9">
          Our AI uses advanced natural language processing to understand customer requests
          and respond intelligently. It's trained specifically for your business type and
          can access your service information, employee schedules, and appointment availability
          in real-time.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h2 class="text-xl font-semibold text-secondary-900 mb-3 flex items-start">
          <i class="pi pi-question-circle text-primary-600 mr-3 mt-1" aria-hidden="true"></i>
          <span>Can I customize my services and prices?</span>
        </h2>
        <p class="text-secondary-700 leading-relaxed ml-9">
          Absolutely! Through your admin dashboard, you can add, modify, or remove services,
          set custom prices and durations, and even add service add-ons. Changes take effect
          immediately.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h2 class="text-xl font-semibold text-secondary-900 mb-3 flex items-start">
          <i class="pi pi-question-circle text-primary-600 mr-3 mt-1" aria-hidden="true"></i>
          <span>How do I cancel my subscription?</span>
        </h2>
        <p class="text-secondary-700 leading-relaxed ml-9">
          You can cancel anytime from your billing page. There are no long-term contracts.
          Your service will remain active until the end of your current billing period.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h2 class="text-xl font-semibold text-secondary-900 mb-3 flex items-start">
          <i class="pi pi-question-circle text-primary-600 mr-3 mt-1" aria-hidden="true"></i>
          <span>Is it safe and secure?</span>
        </h2>
        <p class="text-secondary-700 leading-relaxed ml-9">
          Yes! We use industry-standard encryption for all data transmission and storage.
          Your customer information is protected and never shared with third parties.
          We're compliant with all major data protection regulations.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h2 class="text-xl font-semibold text-secondary-900 mb-3 flex items-start">
          <i class="pi pi-question-circle text-primary-600 mr-3 mt-1" aria-hidden="true"></i>
          <span>What if the AI can't handle a call?</span>
        </h2>
        <p class="text-secondary-700 leading-relaxed ml-9">
          While our AI can handle most common scenarios, you can configure fallback options
          such as forwarding complex calls to a staff member or taking a message for callback.
        </p>
      </div>

      <div class="bg-white rounded-xl shadow-soft p-6 border border-gray-100">
        <h2 class="text-xl font-semibold text-secondary-900 mb-3 flex items-start">
          <i class="pi pi-question-circle text-primary-600 mr-3 mt-1" aria-hidden="true"></i>
          <span>Can customers still book online?</span>
        </h2>
        <p class="text-secondary-700 leading-relaxed ml-9">
          Yes! Your phone-based AI assistant works alongside our system. Customers can call
          or you can manually manage appointments through your dashboard.
        </p>
      </div>

      <div class="bg-gradient-to-br from-primary-600 to-primary-700 p-8 rounded-2xl shadow-medium text-center text-white mt-12">
        <h3 class="text-2xl font-semibold mb-4">Still have questions?</h3>
        <p class="text-primary-100 mb-6 text-lg">
          Contact us at <a href="mailto:support@boltaigroup.com" class="underline hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white rounded">support@boltaigroup.com</a> or call our demo number to experience
          the AI assistant firsthand.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            to="/signup"
            class="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-white"
            aria-label="Try Bolt AI for free"
          >
            Try It Free
            <i class="pi pi-arrow-right ml-2" aria-hidden="true"></i>
          </router-link>
          <a
            href="tel:+15555551234"
            class="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all focus:outline-none focus:ring-4 focus:ring-white"
            aria-label="Call demo number"
          >
            <i class="pi pi-phone mr-2" aria-hidden="true"></i>
            Call Demo
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
