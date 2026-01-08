<template>
  <div class="row g-3">
    <div class="col-12">
      <div class="card border-0 shadow-lg bg-gradient header-card">
        <div class="card-body p-5">
          <div class="d-flex align-items-center justify-content-between">
            <div>
              <div class="mb-2">
                <span class="badge bg-light text-primary fw-semibold">Admin Dashboard</span>
              </div>
              <h1 class="display-5 fw-bold mb-2">Welcome back, {{ auth.user?.name || 'User' }}! 👋</h1>
              <p class="lead text-white-50 mb-0">Manage users, roles, permissions, and more from your workspace</p>
            </div>
            <div class="text-end d-none d-md-block">
              <div class="display-1" style="opacity: 0.1;">📊</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-primary">📊 Quick Stats</h5>
          <p class="mb-1"><strong>Status:</strong> <span class="badge bg-success">Online</span></p>
          <p class="mb-0"><strong>Roles:</strong> <span v-for="r in auth.user?.roles" :key="r" class="badge bg-secondary me-1">{{ r }}</span></p>
        </div>
      </div>
    </div>
    <div class="col-md-6">
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <h5 class="card-title text-primary">🔐 Permissions</h5>
          <div class="d-flex flex-wrap gap-1">
            <span v-for="p in auth.user?.permissions?.slice(0, 3)" :key="p" class="badge bg-light text-dark border">{{ p }}</span>
            <span v-if="(auth.user?.permissions?.length || 0) > 3" class="badge bg-light text-dark">+{{ auth.user.permissions.length - 3 }} more</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '../stores/auth';
const auth = useAuthStore();
</script>

<style scoped>
.bg-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.header-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.header-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 35px rgba(102, 126, 234, 0.2) !important;
}

.badge {
  letter-spacing: 0.5px;
}
</style>
