import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import App from './App.vue';
import routes from './router';
import './style.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useAuthStore } from './stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes
});

const pinia = createPinia();

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore(pinia);
  if (auth.token && !auth.user) {
    try { await auth.fetchMe(); } catch { auth.logout(); }
  }
  if (to.meta.layout === 'auth' && auth.isAuthed) return next('/');
  if (to.meta.layout === 'app' && !auth.isAuthed) return next('/login');
  return next();
});

createApp(App).use(pinia).use(router).mount('#app');
