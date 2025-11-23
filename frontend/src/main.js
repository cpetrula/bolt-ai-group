import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura';
import router from './router'
import { useAuthStore } from './stores/auth'

import './style.css'
import 'primeicons/primeicons.css'

import App from './App.vue'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(PrimeVue, {
    theme: {preset: Aura}
})

// Initialize auth state from localStorage
const authStore = useAuthStore()
authStore.initAuth()

app.mount('#app')
