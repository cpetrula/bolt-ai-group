<template>
  <div class="min-h-screen">
    <!-- Hero Section - Above the Fold -->
    <section class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20 lg:py-28 overflow-hidden">
      <!-- Background pattern -->
      <div class="absolute inset-0 opacity-10">
        <div class="absolute inset-0" style="background-image: radial-gradient(circle at 2px 2px, white 1px, transparent 0); background-size: 40px 40px;"></div>
      </div>
      
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-4xl mx-auto">
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Your AI Assistant That Never Takes a Day Off
          </h1>
          <p class="text-xl sm:text-2xl mb-8 text-primary-100 leading-relaxed">
            Transform your business with an AI assistant that handles calls, books appointments, 
            and provides information 24/7 — always professional, always available.
          </p>

          <!-- Main Benefits - Above the Fold -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 text-left">
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div class="text-3xl mb-3" role="img" aria-label="Rocket emoji">🚀</div>
              <h3 class="font-semibold text-lg mb-2">Never Calls Out Sick</h3>
              <p class="text-primary-100 text-sm">Always available, always reliable</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div class="text-3xl mb-3" role="img" aria-label="Smiling emoji">😊</div>
              <h3 class="font-semibold text-lg mb-2">Never in a Bad Mood</h3>
              <p class="text-primary-100 text-sm">Consistently friendly and professional</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div class="text-3xl mb-3" role="img" aria-label="Phone emoji">📞</div>
              <h3 class="font-semibold text-lg mb-2">Multiple Calls at Once</h3>
              <p class="text-primary-100 text-sm">Handle unlimited simultaneous calls</p>
            </div>
            <div class="bg-white/10 backdrop-blur-sm rounded-xl p-5 border border-white/20">
              <div class="text-3xl mb-3" role="img" aria-label="Clock emoji">🕐</div>
              <h3 class="font-semibold text-lg mb-2">24/7 Availability</h3>
              <p class="text-primary-100 text-sm">Round-the-clock customer service</p>
            </div>
          </div>

          <!-- Demo Phone Number - Visually Dominant -->
          <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8 max-w-2xl mx-auto">
            <p class="text-secondary-700 text-lg font-semibold mb-4">
              Try it now! Call our demo number:
            </p>
            <a 
              href="tel:+14242839238" 
              class="inline-flex items-center justify-center text-4xl sm:text-5xl font-bold text-primary-600 hover:text-primary-700 transition-colors mb-4 focus:outline-none focus:ring-4 focus:ring-primary-300 rounded-lg px-6 py-3"
              aria-label="Call demo number +1-555-555-1234"
            >
              <i class="pi pi-phone mr-4" aria-hidden="true"></i>
              +1-424-283-9238
            </a>
            <p class="text-secondary-600 text-lg font-medium">
              <strong class="text-primary-600">Call now to hear exactly what your customers will experience!</strong>
            </p>
            <p class="text-secondary-500 text-sm mt-3">
              Our demo AI assistant will walk you through booking an appointment, 
              checking availability, and answering questions — just like it will for your customers.
            </p>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <router-link
              to="/signup"
              class="inline-flex items-center justify-center bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              aria-label="Get started with Bolt AI"
            >
              Get Started Today
              <i class="pi pi-arrow-right ml-2" aria-hidden="true"></i>
            </router-link>
            <router-link
              to="/how-it-works"
              class="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-primary-600 transition-all focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
              aria-label="Learn how Bolt AI works"
            >
              Learn How It Works
            </router-link>
          </div>
        </div>
      </div>
    </section>

    <!-- Pricing Section - Below the Fold -->
    <section class="py-20 bg-gradient-to-b from-white to-gray-50" aria-labelledby="pricing-heading">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h2 id="pricing-heading" class="text-4xl font-bold text-secondary-900 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p class="text-xl text-secondary-600 max-w-3xl mx-auto">
            Choose the plan that works best for your business. No hidden fees, no surprises.
          </p>
        </div>

        <!-- Pricing Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          <!-- Monthly Plan -->
          <article class="bg-white rounded-2xl shadow-soft border-2 border-gray-200 overflow-hidden hover:shadow-medium transition-shadow" aria-label="Monthly pricing plan">
            <div class="p-8">
              <h3 class="text-2xl font-bold text-secondary-900 mb-2">Monthly Plan</h3>
              <div class="flex items-baseline mb-6">
                <span class="text-5xl font-bold text-primary-600">$295</span>
                <span class="text-xl text-secondary-600 ml-2">/month</span>
              </div>
              <ul class="space-y-4 mb-8" role="list">
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-success-600 mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-secondary-700">Unlimited calls — no per-minute charges</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-success-600 mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-secondary-700">Automated appointment management</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-success-600 mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-secondary-700">Custom business hours and services</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-success-600 mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-secondary-700">Detailed analytics & reports</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-success-600 mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-secondary-700">Email and SMS notifications</span>
                </li>
              </ul>
              <router-link
                to="/signup"
                class="block w-full bg-primary-600 text-white text-center px-6 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-4 focus:ring-primary-300"
                aria-label="Sign up for monthly plan"
              >
                Get Started
              </router-link>
            </div>
          </article>

          <!-- Yearly Plan - Featured -->
          <article class="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl shadow-medium overflow-hidden relative transform hover:scale-105 transition-transform" aria-label="Yearly pricing plan - Best value">
            <div class="absolute top-0 right-0 bg-warning-400 text-secondary-900 px-6 py-2 rounded-bl-2xl font-bold text-sm">
              SAVE 20% — BEST VALUE
            </div>
            <div class="p-8 text-white">
              <h3 class="text-2xl font-bold mb-2">Yearly Plan</h3>
              <div class="flex items-baseline mb-2">
                <span class="text-5xl font-bold">$2,832</span>
                <span class="text-xl text-primary-100 ml-2">/year</span>
              </div>
              <p class="text-primary-100 mb-6 text-sm">That's just $236/month — save $708/year!</p>
              <ul class="space-y-4 mb-8" role="list">
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-white mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-white font-medium">Everything in Monthly Plan</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-white mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-white font-medium">20% discount (2 months free!)</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-white mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-white font-medium">Priority customer support</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-white mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-white font-medium">Early access to new features</span>
                </li>
                <li class="flex items-start">
                  <i class="pi pi-check-circle text-white mr-3 mt-1 text-xl" aria-hidden="true"></i>
                  <span class="text-white font-medium">Dedicated account manager</span>
                </li>
              </ul>
              <router-link
                to="/signup"
                class="block w-full bg-white text-primary-600 text-center px-6 py-4 rounded-xl font-semibold text-lg hover:bg-primary-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white"
                aria-label="Sign up for yearly plan"
              >
                Get Started & Save
              </router-link>
            </div>
          </article>
        </div>

        <!-- Cost Comparison Section -->
        <div class="bg-white rounded-2xl shadow-soft p-8 lg:p-12 border border-gray-200" aria-labelledby="comparison-heading">
          <h3 id="comparison-heading" class="text-3xl font-bold text-center text-secondary-900 mb-8">
            Cost Comparison: AI Assistant vs. Full-Time Employee
          </h3>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <!-- Traditional Employee -->
            <div class="bg-gray-50 rounded-xl p-6 border-2 border-gray-300">
              <div class="text-center mb-4">
                <div class="text-4xl mb-3" role="img" aria-label="Person emoji">👤</div>
                <h4 class="text-xl font-bold text-secondary-900 mb-2">Full-Time Receptionist</h4>
                <p class="text-sm text-secondary-600">At federal minimum wage</p>
              </div>
              <div class="space-y-3 text-secondary-700">
                <div class="flex justify-between border-b border-gray-300 pb-2">
                  <span>Hourly wage:</span>
                  <span class="font-semibold">$7.25/hr</span>
                </div>
                <div class="flex justify-between border-b border-gray-300 pb-2">
                  <span>Hours per week:</span>
                  <span class="font-semibold">40 hrs</span>
                </div>
                <div class="flex justify-between border-b border-gray-300 pb-2">
                  <span>Monthly salary:</span>
                  <span class="font-semibold">~$1,257</span>
                </div>
                <div class="flex justify-between border-b border-gray-300 pb-2">
                  <span>Payroll taxes (15%):</span>
                  <span class="font-semibold">+$188</span>
                </div>
                <div class="flex justify-between border-b border-gray-300 pb-2">
                  <span>Benefits estimate:</span>
                  <span class="font-semibold">+$200</span>
                </div>
                <div class="flex justify-between pt-3 text-lg">
                  <span class="font-bold">Total Monthly Cost:</span>
                  <span class="font-bold text-warning-600">$1,645</span>
                </div>
              </div>
              <div class="mt-4 p-3 bg-warning-50 rounded-lg border border-warning-200">
                <p class="text-sm text-warning-800 font-medium">
                  ⚠️ Limited to 40 hours/week, no coverage during sick days, vacations, or after hours
                </p>
              </div>
            </div>

            <!-- AI Assistant -->
            <div class="bg-gradient-to-br from-success-50 to-primary-50 rounded-xl p-6 border-2 border-primary-300">
              <div class="text-center mb-4">
                <div class="text-4xl mb-3" role="img" aria-label="Robot emoji">🤖</div>
                <h4 class="text-xl font-bold text-secondary-900 mb-2">Bolt AI Assistant</h4>
                <p class="text-sm text-secondary-600">Monthly plan</p>
              </div>
              <div class="space-y-3 text-secondary-700">
                <div class="flex justify-between border-b border-primary-200 pb-2">
                  <span>Monthly service:</span>
                  <span class="font-semibold">$295</span>
                </div>
                <div class="flex justify-between border-b border-primary-200 pb-2">
                  <span>Payroll taxes:</span>
                  <span class="font-semibold">$0</span>
                </div>
                <div class="flex justify-between border-b border-primary-200 pb-2">
                  <span>Benefits:</span>
                  <span class="font-semibold">$0</span>
                </div>
                <div class="flex justify-between border-b border-primary-200 pb-2">
                  <span>Training:</span>
                  <span class="font-semibold">$0</span>
                </div>
                <div class="flex justify-between border-b border-primary-200 pb-2">
                  <span>Sick days/vacation:</span>
                  <span class="font-semibold">$0</span>
                </div>
                <div class="flex justify-between pt-3 text-lg">
                  <span class="font-bold">Total Monthly Cost:</span>
                  <span class="font-bold text-success-600">$295</span>
                </div>
              </div>
              <div class="mt-4 p-3 bg-success-50 rounded-lg border border-success-200">
                <p class="text-sm text-success-800 font-medium">
                  ✅ 24/7/365 coverage, unlimited calls, never takes a day off
                </p>
              </div>
            </div>
          </div>

          <!-- Savings Highlight -->
          <div class="mt-8 text-center">
            <div class="inline-block bg-gradient-to-r from-success-500 to-primary-600 text-white rounded-2xl px-8 py-6 shadow-lg">
              <p class="text-lg mb-2">You Save Every Month:</p>
              <p class="text-5xl font-bold mb-2">$1,350</p>
              <p class="text-lg">That's <strong>$16,200 per year</strong> in savings!</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="py-20 bg-secondary-900 text-white" aria-labelledby="cta-heading">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="cta-heading" class="text-4xl font-bold mb-6">
          Ready to Transform Your Business?
        </h2>
        <p class="text-xl text-secondary-300 mb-10 leading-relaxed">
          Join hundreds of businesses leveraging AI to improve customer service, 
          reduce costs, and never miss a call again.
        </p>
        <div class="flex flex-col sm:flex-row justify-center gap-4">
          <router-link
            to="/signup"
            class="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-primary-700 transition-all transform hover:scale-105 shadow-lg focus:outline-none focus:ring-4 focus:ring-primary-300"
            aria-label="Start your free trial"
          >
            Start Free Trial
            <i class="pi pi-arrow-right ml-2" aria-hidden="true"></i>
          </router-link>
          <a
            href="tel:+14242839238"
            class="inline-flex items-center justify-center border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-secondary-900 transition-all focus:outline-none focus:ring-4 focus:ring-white"
            aria-label="Call demo number to try now"
          >
            <i class="pi pi-phone mr-2" aria-hidden="true"></i>
            Try Demo: +1-424-283-9238
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* Ensure smooth transitions and accessibility */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
