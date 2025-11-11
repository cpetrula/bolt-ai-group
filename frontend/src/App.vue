<script setup>
import { ref } from 'vue'
import Header from './components/Header.vue'
import Hero from './components/Hero.vue'
import Features from './components/Features.vue'
import MediaGallery from './components/MediaGallery.vue'
import ContactForm from './components/ContactForm.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="app">
    <Header />
    <Hero />
    <Features />
    <MediaGallery />
    <ContactForm />
    <Footer />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
}

.app {
  width: 100%;
  overflow-x: hidden;
}
</style>
