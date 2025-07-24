import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store' // Import Vuex Store
import './assets/tailwind.css'

const app = createApp(App)
app.use(store) // Sử dụng Vuex
app.use(router)
app.mount('#app')
