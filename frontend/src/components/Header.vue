<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'

const menuOpen = ref(false)

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}
</script>

<template>
  <header class="header">
    <div class="container">
      <div class="logo">
        <i class="pi pi-bolt"></i>
        <span>Bolt AI Group</span>
      </div>
      <nav :class="{ active: menuOpen }">
        <a href="#home">Home</a>
        <a href="#features">Features</a>
        <a href="#gallery">Gallery</a>
        <a href="#contact">Contact</a>
      </nav>
      <Button 
        icon="pi pi-bars" 
        class="menu-toggle" 
        text 
        @click="toggleMenu"
      />
    </div>
  </header>
</template>

<style scoped>
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.5rem;
  font-weight: bold;
}

.logo i {
  font-size: 2rem;
}

nav {
  display: flex;
  gap: 2rem;
}

nav a {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s;
}

nav a:hover {
  opacity: 0.8;
}

.menu-toggle {
  display: none;
  color: white;
}

@media (max-width: 768px) {
  nav {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    flex-direction: column;
    padding: 1rem 2rem;
    gap: 1rem;
  }

  nav.active {
    display: flex;
  }

  .menu-toggle {
    display: block;
  }
}
</style>
