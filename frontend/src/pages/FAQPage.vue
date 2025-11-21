<template>
  <div class="max-w-4xl mx-auto py-8 px-4">
    <h1 class="text-4xl font-bold mb-8">Frequently Asked Questions</h1>
    
    <div class="space-y-6">
      <div class="border-b pb-6">
        <h2 class="text-xl font-semibold mb-2">How does the AI answer calls?</h2>
        <p class="text-gray-700">
          Our AI uses advanced natural language processing to understand customer requests
          and respond intelligently. It's trained specifically for your business type and
          can access your service information, employee schedules, and appointment availability
          in real-time.
        </p>
      </div>

      <div class="border-b pb-6">
        <h2 class="text-xl font-semibold mb-2">Can I customize my services and prices?</h2>
        <p class="text-gray-700">
          Absolutely! Through your admin dashboard, you can add, modify, or remove services,
          set custom prices and durations, and even add service add-ons. Changes take effect
          immediately.
        </p>
      </div>

      <div class="border-b pb-6">
        <h2 class="text-xl font-semibold mb-2">How do I cancel my subscription?</h2>
        <p class="text-gray-700">
          You can cancel anytime from your billing page. There are no long-term contracts.
          Your service will remain active until the end of your current billing period.
        </p>
      </div>

      <div class="border-b pb-6">
        <h2 class="text-xl font-semibold mb-2">Is it safe and secure?</h2>
        <p class="text-gray-700">
          Yes! We use industry-standard encryption for all data transmission and storage.
          Your customer information is protected and never shared with third parties.
          We're compliant with all major data protection regulations.
        </p>
      </div>

      <div class="border-b pb-6">
        <h2 class="text-xl font-semibold mb-2">What if the AI can't handle a call?</h2>
        <p class="text-gray-700">
          While our AI can handle most common scenarios, you can configure fallback options
          such as forwarding complex calls to a staff member or taking a message for callback.
        </p>
      </div>

      <div class="border-b pb-6">
        <h2 class="text-xl font-semibold mb-2">Can customers still book online?</h2>
        <p class="text-gray-700">
          Yes! Your phone-based AI assistant works alongside our system. Customers can call
          or you can manually manage appointments through your dashboard.
        </p>
      </div>

      <div class="bg-blue-50 p-6 rounded-lg">
        <h3 class="text-xl font-semibold mb-4">Still have questions?</h3>
        <p class="text-gray-700 mb-4">
          Contact us at support@boltaigroup.com or call our demo number to experience
          the AI assistant firsthand.
        </p>
        <router-link
          to="/signup"
          class="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Try It Free
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>
