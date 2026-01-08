import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import routes from './router';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';

const router = createRouter({
  history: createWebHistory(),
  routes
});

const pinia = createPinia();

createApp(App).use(pinia).use(router).mount('#app');
