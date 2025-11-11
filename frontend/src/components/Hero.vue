<script setup>
import Button from 'primevue/button'
</script>

<template>
  <section id="home" class="hero">
    <div class="container">
      <div class="hero-content">
        <h1 class="hero-title">Empower Your Business with AI</h1>
        <p class="hero-subtitle">
          To empower local businesses with accessible AI technologies that drive growth, 
          efficiency, and excellent customer experiences. We believe every business deserves 
          cutting-edge tools to compete and thrive in the modern marketplace.
        </p>
        <div class="hero-actions">
          <Button label="Get Started" size="large" />
          <Button label="Learn More" size="large" outlined />
        </div>
      </div>
      <div class="hero-image">
        <i class="pi pi-star-fill"></i>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 6rem 0;
  min-height: 600px;
  display: flex;
  align-items: center;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 1.5rem;
}

.hero-subtitle {
  font-size: 1.25rem;
  line-height: 1.8;
  margin-bottom: 2rem;
  opacity: 0.95;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-image {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15rem;
  opacity: 0.3;
}

@media (max-width: 768px) {
  .container {
    grid-template-columns: 1fr;
  }

  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.1rem;
  }

  .hero-image {
    display: none;
  }
}
</style>
