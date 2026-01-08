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

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore(pinia);

  // Get token value properly (handles both ref and plain value)
  const tokenValue = typeof auth.token === 'object' && auth.token.value ? auth.token.value : auth.token;

  // Check authentication requirements first
  if (to.meta.layout === 'auth' && auth.isAuthed) {
    return next('/');
  }

  if (to.meta.layout === 'app' && !auth.isAuthed) {
    return next('/login');
  }

  // If we have a token but no user data, fetch it before proceeding
  if (tokenValue && !auth.user && to.meta.layout === 'app') {
    try {
      await auth.fetchMe();
    } catch (error) {
      auth.logout();
      return next('/login');
    }
  }

  next();
});

createApp(App).use(pinia).use(router).mount('#app');
