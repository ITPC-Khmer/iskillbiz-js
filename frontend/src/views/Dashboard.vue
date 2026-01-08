<template>
  <div class="dashboard">
    <!-- Welcome Header -->
    <div class="welcome-header">
      <div class="welcome-content">
        <div class="welcome-badge">
          <span class="badge-icon">✨</span>
          <span>Admin Dashboard</span>
        </div>
        <h1 class="welcome-title">
          Welcome back, {{ auth.user?.name || "User" }}!
        </h1>
        <p class="welcome-subtitle">
          Here's what's happening with your workspace today
        </p>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-circle"></div>
        <div class="decoration-icon">📊</div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in stats" :key="stat.label">
        <div class="stat-icon" :style="{ background: stat.color }">
          {{ stat.icon }}
        </div>
        <div class="stat-content">
          <div class="stat-value">{{ stat.value }}</div>
          <div class="stat-label">{{ stat.label }}</div>
          <div class="stat-trend" :class="stat.trendClass">
            <span class="trend-icon">{{ stat.trendIcon }}</span>
            <span>{{ stat.trend }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid -->
    <div class="content-grid">
      <!-- User Info Card -->
      <div class="info-card">
        <div class="card-header-custom">
          <h3 class="card-title-custom">
            <span class="title-icon">👤</span>
            Your Profile
          </h3>
        </div>
        <div class="card-body-custom">
          <div class="profile-info">
            <div class="profile-avatar">
              {{ getUserInitials() }}
            </div>
            <div class="profile-details">
              <div class="profile-name">{{ auth.user?.name || "Unknown" }}</div>
              <div class="profile-phone">{{ auth.user?.phone || "N/A" }}</div>
            </div>
          </div>
          <div class="info-divider"></div>
          <div class="info-section">
            <div class="info-label">Status</div>
            <div class="info-value">
              <span class="status-dot status-online"></span>
              Online
            </div>
          </div>
          <div class="info-section">
            <div class="info-label">Member Since</div>
            <div class="info-value">
              {{ formatDate(auth.user?.created_at) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Roles Card -->
      <div class="info-card">
        <div class="card-header-custom">
          <h3 class="card-title-custom">
            <span class="title-icon">🔑</span>
            Your Roles
          </h3>
          <span class="count-badge">{{ auth.user?.roles?.length || 0 }}</span>
        </div>
        <div class="card-body-custom">
          <div class="roles-list">
            <div v-if="auth.user?.roles?.length" class="role-items">
              <div
                v-for="role in auth.user.roles"
                :key="role"
                class="role-item"
              >
                <span class="role-icon">🎭</span>
                <span class="role-name">{{ role }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">No roles assigned</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Permissions Card -->
      <div class="info-card full-width">
        <div class="card-header-custom">
          <h3 class="card-title-custom">
            <span class="title-icon">🔐</span>
            Your Permissions
          </h3>
          <span class="count-badge">{{
            auth.user?.permissions?.length || 0
          }}</span>
        </div>
        <div class="card-body-custom">
          <div v-if="auth.user?.permissions?.length" class="permissions-grid">
            <div
              v-for="permission in auth.user.permissions"
              :key="permission"
              class="permission-tag"
            >
              <span class="permission-icon">✓</span>
              <span class="permission-name">{{ permission }}</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">🚫</div>
            <div class="empty-text">No permissions assigned</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions Card -->
      <div class="info-card full-width">
        <div class="card-header-custom">
          <h3 class="card-title-custom">
            <span class="title-icon">⚡</span>
            Quick Actions
          </h3>
        </div>
        <div class="card-body-custom">
          <div class="actions-grid">
            <RouterLink
              v-for="action in quickActions"
              :key="action.path"
              :to="action.path"
              class="action-button"
            >
              <div class="action-icon" :style="{ background: action.color }">
                {{ action.icon }}
              </div>
              <div class="action-content">
                <div class="action-title">{{ action.title }}</div>
                <div class="action-description">{{ action.description }}</div>
              </div>
              <div class="action-arrow">→</div>
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- Recent Activity Card -->
      <div class="info-card full-width">
        <div class="card-header-custom">
          <h3 class="card-title-custom">
            <span class="title-icon">📋</span>
            Recent Activity
          </h3>
        </div>
        <div class="card-body-custom">
          <div class="activity-list">
            <div
              v-for="activity in recentActivity"
              :key="activity.id"
              class="activity-item"
            >
              <div
                class="activity-icon"
                :style="{ background: activity.color }"
              >
                {{ activity.icon }}
              </div>
              <div class="activity-content">
                <div class="activity-title">{{ activity.title }}</div>
                <div class="activity-time">{{ activity.time }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from "../stores/auth";
import { RouterLink } from "vue-router";
import { computed, onMounted } from "vue";

const auth = useAuthStore();

const stats = computed(() => [
  {
    icon: "👥",
    value: "1,234",
    label: "Total Users",
    trend: "+12% from last month",
    trendIcon: "📈",
    trendClass: "trend-up",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: "🔑",
    value: auth.user?.roles?.length || 0,
    label: "Your Roles",
    trend: "Active",
    trendIcon: "✓",
    trendClass: "trend-neutral",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    icon: "🔐",
    value: auth.user?.permissions?.length || 0,
    label: "Permissions",
    trend: "Granted",
    trendIcon: "🔓",
    trendClass: "trend-neutral",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: "⚡",
    value: "24/7",
    label: "System Status",
    trend: "All systems operational",
    trendIcon: "✓",
    trendClass: "trend-up",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
]);

const quickActions = [
  {
    icon: "👤",
    title: "View Profile",
    description: "Manage your personal information",
    path: "/me",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    icon: "👥",
    title: "Manage Users",
    description: "Add, edit, or remove users",
    path: "/admin/users",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    icon: "🔑",
    title: "Configure Roles",
    description: "Set up user roles and access",
    path: "/admin/roles",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    icon: "🔐",
    title: "Manage Permissions",
    description: "Control system permissions",
    path: "/admin/permissions",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
];

const recentActivity = [
  {
    id: 1,
    icon: "👤",
    title: "You logged in successfully",
    time: "Just now",
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  },
  {
    id: 2,
    icon: "🔑",
    title: "Role permissions updated",
    time: "2 hours ago",
    color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  },
  {
    id: 3,
    icon: "👥",
    title: "New user registered",
    time: "5 hours ago",
    color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  },
  {
    id: 4,
    icon: "🔐",
    title: "Security settings updated",
    time: "Yesterday",
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  },
];

function getUserInitials() {
  const name = auth.user?.name;
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  }
  return "??";
}

function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  const options = { year: "numeric", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
onMounted(() => {
  getUserInitials();
});
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* ===== Welcome Header ===== */
.welcome-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 20px;
  padding: 3rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-content {
  position: relative;
  z-index: 2;
  max-width: 600px;
}

.welcome-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  padding: 0.5rem 1.25rem;
  border-radius: 50px;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.badge-icon {
  font-size: 1.2rem;
}

.welcome-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin: 0 0 0.75rem 0;
  line-height: 1.2;
}

.welcome-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

.welcome-decoration {
  position: relative;
  width: 200px;
  height: 200px;
  display: none;
}

.decoration-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

.decoration-icon {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 6rem;
  opacity: 0.3;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.15;
  }
}

/* ===== Stats Grid ===== */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.75rem;
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 600;
  margin-bottom: 0.75rem;
}

.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.trend-up {
  background: rgba(34, 197, 94, 0.1);
  color: #16a34a;
}

.trend-neutral {
  background: rgba(59, 130, 246, 0.1);
  color: #2563eb;
}

.trend-icon {
  font-size: 0.9rem;
}

/* ===== Content Grid ===== */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
  display: flex;
  flex-direction: column;
}

.info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.card-header-custom {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title-custom {
  font-size: 1.125rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  font-size: 1.5rem;
}

.count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 700;
}

.card-body-custom {
  padding: 1.75rem;
  flex: 1;
}

/* ===== Profile Info ===== */
.profile-info {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
}

.profile-avatar {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
  flex-shrink: 0;
}

.profile-details {
  flex: 1;
  min-width: 0;
}

.profile-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.profile-phone {
  font-size: 0.9rem;
  color: #64748b;
}

.info-divider {
  height: 1px;
  background: #f0f0f0;
  margin: 1.5rem 0;
}

.info-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #64748b;
}

.info-value {
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-online {
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

/* ===== Roles List ===== */
.roles-list {
  min-height: 200px;
  display: flex;
  align-items: center;
}

.role-items {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
}

.role-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.role-item:hover {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateX(4px);
}

.role-icon {
  font-size: 1.5rem;
}

.role-name {
  font-weight: 600;
  color: #1e293b;
}

/* ===== Permissions Grid ===== */
.permissions-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.permission-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #5b21b6;
  transition: all 0.3s ease;
}

.permission-tag:hover {
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.1) 0%,
    rgba(118, 75, 162, 0.1) 100%
  );
  transform: translateY(-2px);
}

.permission-icon {
  font-weight: 700;
  color: #22c55e;
}

/* ===== Empty State ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  width: 100%;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-text {
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 500;
}

/* ===== Quick Actions ===== */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: white;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.action-button::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    135deg,
    rgba(102, 126, 234, 0.05) 0%,
    rgba(118, 75, 162, 0.05) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
}

.action-button:hover {
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.action-button:hover::before {
  opacity: 1;
}

.action-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1;
}

.action-content {
  flex: 1;
  min-width: 0;
  z-index: 1;
}

.action-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.action-description {
  font-size: 0.875rem;
  color: #64748b;
}

.action-arrow {
  font-size: 1.5rem;
  color: #cbd5e1;
  transition: all 0.3s ease;
  z-index: 1;
}

.action-button:hover .action-arrow {
  color: #667eea;
  transform: translateX(4px);
}

/* ===== Recent Activity ===== */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.25rem;
  background: #fafafa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #f5f5f5;
  transform: translateX(4px);
}

.activity-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.8rem;
  color: #94a3b8;
}

/* ===== Responsive Design ===== */
@media (min-width: 768px) {
  .welcome-decoration {
    display: block;
  }
}

@media (max-width: 768px) {
  .welcome-header {
    padding: 2rem 1.5rem;
  }

  .welcome-title {
    font-size: 1.75rem;
  }

  .welcome-subtitle {
    font-size: 1rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .actions-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .dashboard {
    gap: 1.5rem;
  }

  .welcome-header {
    padding: 1.5rem 1rem;
  }

  .welcome-title {
    font-size: 1.5rem;
  }

  .stat-card {
    padding: 1.25rem;
  }

  .card-header-custom,
  .card-body-custom {
    padding: 1.25rem;
  }
}
</style>
