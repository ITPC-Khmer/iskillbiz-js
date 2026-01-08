<template>
  <div v-if="layout === 'auth'" class="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
    <div class="card shadow-sm" style="max-width: 520px; width: 100%;">
      <div class="card-body p-4">
        <div class="d-flex align-items-center mb-3">
          <div class="fw-bold fs-4 text-primary me-2">iSkillBiz</div>
          <div class="text-muted">Access your account</div>
        </div>
        <RouterView />
      </div>
    </div>
  </div>
  <div v-else class="d-flex min-vh-100 bg-light">
    <aside class="p-3 bg-dark text-white d-flex flex-column" style="width:260px;">
      <div class="d-flex align-items-center mb-3">
        <div class="fw-bold fs-4 text-primary">iSkillBiz</div>
      </div>
      <nav class="nav flex-column gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-link rounded', routeActive(item.path) ? 'bg-primary text-white' : 'text-white-50']"
        >
          {{ item.label }}
        </RouterLink>
      </nav>
      <div class="mt-auto pt-3 border-top border-secondary-subtle">
        <div v-if="auth.user" class="small text-white-50 mb-1">Signed in as</div>
        <div v-if="auth.user" class="fw-semibold">{{ auth.user.name || auth.user.phone }}</div>
        <div v-if="auth.user" class="d-flex flex-wrap gap-1 mt-1">
          <span v-for="role in auth.user.roles" :key="role" class="badge bg-secondary">{{ role }}</span>
        </div>
        <button v-if="auth.isAuthed" class="btn btn-outline-light btn-sm w-100 mt-3" @click="doLogout">Logout</button>
      </div>
    </aside>
    <main class="flex-grow-1 p-4">
      <div class="mb-3 d-flex align-items-center gap-2">
        <div class="fw-bold fs-5">Dashboard</div>
        <div class="text-muted small">Manage your account and administration</div>
      </div>
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { computed, onMounted } from 'vue';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const layout = computed(() => route.meta.layout || 'app');
const navItems = [
  { label: 'Dashboard', path: '/' },
  { label: 'Profile', path: '/me' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Roles', path: '/admin/roles' },
  { label: 'Permissions', path: '/admin/permissions' }
];

function routeActive(path) {
  return route.path === path;
}

async function doLogout() {
  auth.logout();
  await router.push('/login');
}

onMounted(() => {
  if (auth.token) auth.fetchMe().catch(() => auth.logout());
});
</script>

