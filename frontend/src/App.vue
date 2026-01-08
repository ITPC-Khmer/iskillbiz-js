<template>
  <!-- Auth Layout -->
  <Transition name="fade">
    <div v-if="layout === 'auth'" class="auth-layout">
      <div class="auth-card">
        <div class="auth-header">
          <div class="brand-logo">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">iSkillBiz</span>
          </div>
          <p class="auth-subtitle">Access your account</p>
        </div>
        <RouterView v-slot="{ Component, route }">
          <Transition name="slide-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </div>
    </div>
  </Transition>

  <!-- App Layout -->
  <div v-if="layout !== 'auth'" class="app-layout">
    <!-- Sidebar -->
    <aside :class="['sidebar', { 'sidebar-collapsed': sidebarCollapsed }]">
      <div class="sidebar-header">
        <button class="sidebar-toggle" @click="toggleSidebar">
          <span class="toggle-icon">{{ sidebarCollapsed ? '☰' : '✕' }}</span>
        </button>
        <Transition name="fade">
          <div v-if="!sidebarCollapsed" class="brand-logo">
            <span class="logo-icon">🎯</span>
            <span class="logo-text">iSkillBiz</span>
          </div>
        </Transition>
      </div>

      <nav class="sidebar-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="['nav-item', { active: routeActive(item.path) }]"
          :title="item.label"
        >
          <span class="nav-icon">{{ item.icon }}</span>
          <Transition name="fade">
            <span v-if="!sidebarCollapsed" class="nav-label">{{ item.label }}</span>
          </Transition>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <Transition name="slide-up">
          <div v-if="auth.user" class="user-info">
            <div class="user-avatar">
              {{ getUserInitials(auth.user) }}
            </div>
            <Transition name="fade">
              <div v-if="!sidebarCollapsed" class="user-details">
                <div class="user-name">{{ auth.user.name || auth.user.phone }}</div>
                <div class="user-roles">
                  <span v-for="role in auth.user.roles" :key="role" class="role-badge">
                    {{ role }}
                  </span>
                </div>
              </div>
            </Transition>
          </div>
        </Transition>
        <button v-if="auth.isAuthed" class="logout-btn" @click="doLogout" :title="sidebarCollapsed ? 'Logout' : ''">
          <span class="logout-icon">🚪</span>
          <Transition name="fade">
            <span v-if="!sidebarCollapsed">Logout</span>
          </Transition>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="['main-content', { 'main-expanded': sidebarCollapsed }]">
      <div class="content-header">
        <div class="page-title">
          <h1>{{ getPageTitle() }}</h1>
          <p class="page-subtitle">{{ getPageSubtitle() }}</p>
        </div>
      </div>
      <div class="content-body">
        <RouterView v-slot="{ Component, route }">
          <Transition name="slide-fade" mode="out-in">
            <component :is="Component" :key="route.path" />
          </Transition>
        </RouterView>
      </div>
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import { useAuthStore } from './stores/auth';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const sidebarCollapsed = ref(false);

const layout = computed(() => route.meta.layout || 'app');

const navItems = [
  { label: 'Dashboard', icon: '📊', path: '/' },
  { label: 'Profile', icon: '👤', path: '/me' },
  { label: 'Users', icon: '👥', path: '/admin/users' },
  { label: 'Roles', icon: '🔑', path: '/admin/roles' },
  { label: 'Permissions', icon: '🔐', path: '/admin/permissions' }
];

const pageInfo = {
  '/': { title: 'Dashboard', subtitle: 'Overview of your account and activities' },
  '/me': { title: 'Profile', subtitle: 'Manage your personal information' },
  '/admin/users': { title: 'Users', subtitle: 'Manage system users' },
  '/admin/roles': { title: 'Roles', subtitle: 'Configure user roles' },
  '/admin/permissions': { title: 'Permissions', subtitle: 'Manage access permissions' }
};

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value;
}

function routeActive(path) {
  return route.path === path;
}

function getUserInitials(user) {
  if (user.name) {
    return user.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  return user.phone ? user.phone.substring(0, 2) : '??';
}

function getPageTitle() {
  return pageInfo[route.path]?.title || 'Dashboard';
}

function getPageSubtitle() {
  return pageInfo[route.path]?.subtitle || 'Manage your account and administration';
}

async function doLogout() {
  auth.logout();
  await router.push('/login');
}

onMounted(() => {
  // Load sidebar state from localStorage
  const savedState = localStorage.getItem('sidebarCollapsed');
  if (savedState !== null) {
    sidebarCollapsed.value = JSON.parse(savedState);
  }
  // User data is already loaded by the router guard in main.js
});

// Save sidebar state to localStorage
import { watch } from 'vue';
watch(sidebarCollapsed, (newValue) => {
  localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
});
</script>

<style scoped>
/* ===== Auth Layout ===== */
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
}

.auth-layout::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: drift 20s linear infinite;
}

@keyframes drift {
  0% { transform: translate(0, 0); }
  100% { transform: translate(50px, 50px); }
}

.auth-card {
  background: white;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  padding: 3rem 2.5rem;
  max-width: 480px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-subtitle {
  color: #6c757d;
  margin-top: 0.5rem;
  font-size: 0.95rem;
}

/* ===== App Layout ===== */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: #f8f9fa;
}

/* ===== Sidebar ===== */
.sidebar {
  width: 280px;
  background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
  color: white;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 100;
}

.sidebar-collapsed {
  width: 80px;
}

.sidebar-header {
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-toggle {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 1.2rem;
}

.sidebar-toggle:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.5rem;
}

.logo-icon {
  font-size: 2rem;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.logo-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ===== Sidebar Navigation ===== */
.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.875rem 1rem;
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  font-weight: 500;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.nav-item.active {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
  color: white;
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-icon {
  font-size: 1.5rem;
  min-width: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-label {
  white-space: nowrap;
}

/* ===== Sidebar Footer ===== */
.sidebar-footer {
  padding: 1.5rem 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.user-avatar {
  width: 44px;
  height: 44px;
  min-width: 44px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-roles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.375rem;
}

.role-badge {
  font-size: 0.7rem;
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-weight: 500;
}

.logout-btn {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  border-color: rgba(239, 68, 68, 0.5);
  color: #fee2e2;
  transform: translateY(-2px);
}

.logout-icon {
  font-size: 1.2rem;
}

/* ===== Main Content ===== */
.main-content {
  flex: 1;
  margin-left: 280px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  min-width: 0;
  position: relative;
}

.main-expanded {
  margin-left: 80px;
}

.content-header {
  background: white;
  padding: 2rem 2.5rem;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.page-title h1 {
  font-size: 1.875rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0.5rem 0 0 0;
  font-size: 0.95rem;
}

.content-body {
  flex: 1;
  padding: 2rem 2.5rem;
  overflow-y: auto;
}

/* ===== Transitions ===== */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.slide-fade-enter-from {
  transform: translateX(20px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-20px);
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    z-index: 1000;
    transform: translateX(0);
  }

  .sidebar-collapsed {
    transform: translateX(-100%);
  }

  .main-content {
    margin-left: 0;
  }

  .main-expanded {
    margin-left: 0;
  }

  .sidebar-toggle {
    position: fixed;
    top: 1rem;
    left: 1rem;
    z-index: 999;
  }

  .content-header {
    padding: 1.5rem 1rem;
    padding-top: 4rem;
  }

  .content-body {
    padding: 1.5rem 1rem;
  }

  .page-title h1 {
    font-size: 1.5rem;
  }

  .auth-card {
    padding: 2rem 1.5rem;
  }
}

@media (max-width: 480px) {
  .auth-layout {
    padding: 1rem;
  }

  .brand-logo {
    font-size: 1.25rem;
  }

  .logo-icon {
    font-size: 1.75rem;
  }
}

/* ===== Scrollbar Styling ===== */
.sidebar-nav::-webkit-scrollbar,
.content-body::-webkit-scrollbar {
  width: 8px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.sidebar-nav::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.content-body::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.content-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.content-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

