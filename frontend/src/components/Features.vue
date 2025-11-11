<script setup>
import Card from 'primevue/card'

const features = [
  {
    icon: 'pi-images',
    title: 'Image Management',
    description: 'Showcase your products and services with stunning image galleries optimized for web performance.'
  },
  {
    icon: 'pi-video',
    title: 'Video Marketing',
    description: 'Engage your audience with dynamic video content that tells your brand story effectively.'
  },
  {
    icon: 'pi-mobile',
    title: 'Responsive Design',
    description: 'Your content looks perfect on all devices, from smartphones to desktop computers.'
  },
  {
    icon: 'pi-chart-line',
    title: 'Analytics Dashboard',
    description: 'Track engagement and performance with comprehensive analytics and insights.'
  },
  {
    icon: 'pi-users',
    title: 'Customer Engagement',
    description: 'Connect with your customers through integrated communication tools and forms.'
  },
  {
    icon: 'pi-cog',
    title: 'Easy Integration',
    description: 'Seamlessly integrate with your existing tools and workflows using our robust API.'
  }
]
</script>

<template>
  <section id="features" class="features">
    <div class="container">
      <div class="section-header">
        <h2>Powerful Features</h2>
        <p>Everything you need to market your business effectively</p>
      </div>
      <div class="features-grid">
        <Card v-for="feature in features" :key="feature.title" class="feature-card">
          <template #header>
            <div class="feature-icon">
              <i :class="`pi ${feature.icon}`"></i>
            </div>
          </template>
          <template #title>{{ feature.title }}</template>
          <template #content>
            <p>{{ feature.description }}</p>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.features {
  padding: 6rem 0;
  background: #f8f9fa;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 4rem;
}

.section-header h2 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #333;
  margin-bottom: 1rem;
}

.section-header p {
  font-size: 1.25rem;
  color: #666;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.feature-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.feature-icon i {
  font-size: 3rem;
}
</style>
