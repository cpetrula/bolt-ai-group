<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Header -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <span class="text-2xl font-bold text-blue-600">⚡ Bolt AI Group</span>
            </router-link>
          </div>
          <div class="flex items-center space-x-4">
            <router-link to="/how-it-works" class="text-gray-700 hover:text-blue-600 px-3 py-2">
              How It Works
            </router-link>
            <router-link to="/faq" class="text-gray-700 hover:text-blue-600 px-3 py-2">
              FAQ
            </router-link>
            <router-link to="/login" class="text-gray-700 hover:text-blue-600 px-3 py-2">
              Login
            </router-link>
            <router-link 
              to="/signup" 
              class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main>
      <router-view />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 text-white mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 class="text-lg font-semibold mb-4">Bolt AI Group</h3>
            <p class="text-gray-400">
              AI-powered virtual assistants for your business
            </p>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Links</h3>
            <ul class="space-y-2">
              <li>
                <router-link to="/how-it-works" class="text-gray-400 hover:text-white">
                  How It Works
                </router-link>
              </li>
              <li>
                <router-link to="/faq" class="text-gray-400 hover:text-white">
                  FAQ
                </router-link>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="text-lg font-semibold mb-4">Contact</h3>
            <p class="text-gray-400">
              Email: support@boltaigroup.com
            </p>
          </div>
        </div>
        <div class="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Bolt AI Group. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
</script>
