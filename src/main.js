import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import 'mapbox-gl/dist/mapbox-gl.css';
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.mount('#app')
