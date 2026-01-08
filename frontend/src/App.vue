<template>
  <div v-if="layout === 'auth'" class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <RouterView />
  </div>
  <div v-else class="d-flex min-vh-100">
    <aside class="p-3 bg-dark text-white" style="width:240px;">
      <h4 class="mb-3">iSkillBiz</h4>
      <nav class="nav flex-column">
        <RouterLink class="nav-link text-white" to="/">Dashboard</RouterLink>
        <RouterLink class="nav-link text-white" to="/me">Profile</RouterLink>
        <RouterLink class="nav-link text-white" to="/admin/users">Users</RouterLink>
        <RouterLink class="nav-link text-white" to="/admin/roles">Roles</RouterLink>
        <RouterLink class="nav-link text-white" to="/admin/permissions">Permissions</RouterLink>
      </nav>
      <button v-if="auth.isAuthed" class="btn btn-outline-light btn-sm mt-3" @click="doLogout">Logout</button>
    </aside>
    <main class="flex-grow-1 p-4 bg-light">
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

async function doLogout() {
  auth.logout();
  await router.push('/login');
}

onMounted(() => {
  if (auth.token) auth.fetchMe().catch(() => auth.logout());
});
</script>

