<script setup>
import { ref, onMounted } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Image from 'primevue/image'

const media = ref([])
const loading = ref(false)
const error = ref(null)

// Sample media data (will be fetched from API)
const sampleMedia = [
  {
    id: 1,
    title: 'AI Solutions',
    type: 'image',
    url: 'https://via.placeholder.com/400x300/667eea/ffffff?text=AI+Solutions',
    description: 'Cutting-edge AI technology for businesses'
  },
  {
    id: 2,
    title: 'Business Growth',
    type: 'image',
    url: 'https://via.placeholder.com/400x300/764ba2/ffffff?text=Business+Growth',
    description: 'Accelerate your business growth with AI'
  },
  {
    id: 3,
    title: 'Customer Experience',
    type: 'image',
    url: 'https://via.placeholder.com/400x300/667eea/ffffff?text=Customer+Experience',
    description: 'Enhanced customer experiences through technology'
  },
  {
    id: 4,
    title: 'Innovation',
    type: 'image',
    url: 'https://via.placeholder.com/400x300/764ba2/ffffff?text=Innovation',
    description: 'Innovative solutions for modern businesses'
  }
]

const fetchMedia = async () => {
  loading.value = true
  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/media`)
    const result = await response.json()
    
    if (result.success && result.data.length > 0) {
      media.value = result.data
    } else {
      // Use sample data if no media from API
      media.value = sampleMedia
    }
  } catch (err) {
    console.error('Error fetching media:', err)
    // Use sample data on error
    media.value = sampleMedia
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchMedia()
})
</script>

<template>
  <section id="gallery" class="gallery">
    <div class="container">
      <div class="section-header">
        <h2>Media Gallery</h2>
        <p>Explore our visual showcase</p>
      </div>
      
      <div v-if="loading" class="loading">
        <i class="pi pi-spin pi-spinner" style="font-size: 3rem"></i>
      </div>
      
      <div v-else class="media-grid">
        <Card v-for="item in media" :key="item.id" class="media-card">
          <template #header>
            <div class="media-image">
              <Image :src="item.url" :alt="item.title" preview />
            </div>
          </template>
          <template #title>{{ item.title }}</template>
          <template #content>
            <p>{{ item.description }}</p>
          </template>
        </Card>
      </div>
    </div>
  </section>
</template>

<style scoped>
.gallery {
  padding: 6rem 0;
  background: white;
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

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  color: #667eea;
}

.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.media-card {
  transition: transform 0.3s, box-shadow 0.3s;
}

.media-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.media-image {
  height: 250px;
  overflow: hidden;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.media-image :deep(img) {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
