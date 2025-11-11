<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'

const formData = ref({
  name: '',
  email: '',
  phone: '',
  message: ''
})

const loading = ref(false)
const success = ref(false)
const error = ref(null)

const submitForm = async () => {
  loading.value = true
  error.value = null
  success.value = false

  try {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const response = await fetch(`${apiUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData.value)
    })

    const result = await response.json()

    if (response.ok) {
      success.value = true
      formData.value = {
        name: '',
        email: '',
        phone: '',
        message: ''
      }
    } else {
      error.value = result.message || 'Failed to send message'
    }
  } catch (err) {
    console.error('Error submitting form:', err)
    error.value = 'Failed to send message. Please try again later.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section id="contact" class="contact">
    <div class="container">
      <div class="section-header">
        <h2>Get In Touch</h2>
        <p>Let's discuss how we can help your business grow</p>
      </div>
      
      <Card class="contact-card">
        <template #content>
          <form @submit.prevent="submitForm" class="contact-form">
            <Message v-if="success" severity="success" :closable="false">
              Thank you! Your message has been sent successfully.
            </Message>
            <Message v-if="error" severity="error" :closable="false">
              {{ error }}
            </Message>

            <div class="form-group">
              <label for="name">Name *</label>
              <InputText 
                id="name" 
                v-model="formData.name" 
                placeholder="Your Name"
                required
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="email">Email *</label>
              <InputText 
                id="email" 
                v-model="formData.email" 
                type="email"
                placeholder="your.email@example.com"
                required
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone</label>
              <InputText 
                id="phone" 
                v-model="formData.phone" 
                type="tel"
                placeholder="+1 (555) 123-4567"
                class="w-full"
              />
            </div>

            <div class="form-group">
              <label for="message">Message *</label>
              <Textarea 
                id="message" 
                v-model="formData.message" 
                rows="5"
                placeholder="Tell us about your needs..."
                required
                class="w-full"
              />
            </div>

            <Button 
              type="submit" 
              label="Send Message" 
              :loading="loading"
              icon="pi pi-send"
              class="submit-btn"
            />
          </form>
        </template>
      </Card>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 6rem 0;
  background: #f8f9fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  text-align: center;
  margin-bottom: 3rem;
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

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
}

.w-full {
  width: 100%;
}

.submit-btn {
  align-self: flex-start;
  padding: 0.75rem 2rem;
}
</style>
