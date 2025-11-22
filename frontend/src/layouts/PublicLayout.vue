<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Skip to main content link for accessibility -->
    <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg">
      Skip to main content
    </a>

    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm sticky top-0 z-40" role="navigation" aria-label="Main navigation">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center gap-3" aria-label="Bolt AI Group Home">
              <img src="/logo.svg" alt="Bolt AI Group Logo" class="h-10" />
            </router-link>
          </div>
          <div class="flex items-center space-x-1 sm:space-x-4">
            <router-link 
              to="/how-it-works" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Learn how it works"
            >
              How It Works
            </router-link>
            <router-link 
              to="/faq" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Frequently asked questions"
            >
              FAQ
            </router-link>
            <router-link 
              to="/login" 
              class="text-secondary-700 hover:text-primary-600 px-3 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Log in to your account"
            >
              Login
            </router-link>
            <router-link 
              to="/signup" 
              class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
              aria-label="Sign up for an account"
            >
              Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main id="main-content" class="flex-grow" role="main">
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-secondary-800 text-white mt-16" role="contentinfo">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">Bolt AI Group</h3>
            <p class="text-secondary-300">
              AI-powered virtual assistants for your business
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Links</h3>
            <ul class="space-y-2">
              <li>
                <router-link 
                  to="/how-it-works" 
                  class="text-secondary-300 hover:text-white transition-colors focus:outline-none focus:underline"
                  aria-label="Learn how it works"
                >
                  How It Works
                </router-link>
              </li>
              <li>
                <router-link 
                  to="/faq" 
                  class="text-secondary-300 hover:text-white transition-colors focus:outline-none focus:underline"
                  aria-label="View frequently asked questions"
                >
                  FAQ
                </router-link>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact</h3>
            <p class="text-secondary-300">
              Email: <a href="mailto:support@boltaigroup.com" class="hover:text-white transition-colors focus:outline-none focus:underline">support@boltaigroup.com</a>
            </p>
          </div>
        </div>
        <div class="border-t border-secondary-700 mt-8 pt-8 text-center text-secondary-400">
          <p>&copy; 2024 Bolt AI Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
/* Screen reader only class for accessibility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: 0.5rem 1rem;
  margin: 0;
  overflow: visible;
  clip: auto;
  white-space: normal;
}
</style>
