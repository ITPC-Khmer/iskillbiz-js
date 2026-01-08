<template>
  <div class="profile-container">
    <!-- Profile Content -->
    <template v-if="hasUser">
      <!-- Profile Header Card -->
      <div class="profile-header-card">
        <div class="profile-banner">
          <div class="banner-decoration"></div>
        </div>
        <div class="profile-header-content">
          <div class="profile-avatar-section">
            <div class="profile-avatar-large">
              <img v-if="photoUrl" :src="photoUrl" alt="avatar" class="avatar-image" />
              <span v-else class="avatar-initials">{{ getUserInitials() }}</span>
            </div>
            <button class="edit-photo-btn" @click="triggerFileInput" title="Change photo">
              <span>📸</span>
            </button>
            <input
              ref="fileInput"
              type="file"
              @change="onFile"
              accept="image/*"
              style="display: none;"
            />
          </div>
          <div class="profile-header-info">
            <h2 class="profile-name">{{ user.name || 'Unknown User' }}</h2>
            <div class="profile-contact">
              <span class="contact-item">
                <span class="contact-icon">📱</span>
                {{ user.phone }}
              </span>
              <span v-if="user.email" class="contact-item">
                <span class="contact-icon">✉️</span>
                {{ user.email }}
              </span>
            </div>
            <div class="profile-status">
              <span class="status-dot"></span>
              <span>Active</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Content Grid -->
      <div class="content-grid">
        <!-- Personal Information Card -->
        <div class="info-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-icon">ℹ️</span>
              Personal Information
            </h3>
          </div>
          <div class="card-body">
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Full Name</div>
                <div class="info-value">{{ user.name || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Phone Number</div>
                <div class="info-value">{{ user.phone || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Email Address</div>
                <div class="info-value">{{ user.email || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Gender</div>
                <div class="info-value">{{ user.gender || '—' }}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date of Birth</div>
                <div class="info-value">{{ user.dob || '—' }}</div>
              </div>
              <div class="info-item full-width">
                <div class="info-label">Bio</div>
                <div class="info-value bio-text">{{ user.bio || '—' }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Roles Card -->
        <div class="info-card">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-icon">🔑</span>
              Your Roles
            </h3>
            <span class="count-badge">{{ user.roles?.length || 0 }}</span>
          </div>
          <div class="card-body">
            <div v-if="user.roles?.length" class="roles-grid">
              <div v-for="role in user.roles" :key="role" class="role-tag">
                <span class="role-icon">🎭</span>
                <span>{{ role }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🔒</div>
              <div class="empty-text">No roles assigned</div>
            </div>
          </div>
        </div>

        <!-- Permissions Card -->
        <div class="info-card full-width">
          <div class="card-header">
            <h3 class="card-title">
              <span class="title-icon">🔐</span>
              Your Permissions
            </h3>
            <span class="count-badge">{{ user.permissions?.length || 0 }}</span>
          </div>
          <div class="card-body">
            <div v-if="user.permissions?.length" class="permissions-grid">
              <div v-for="permission in user.permissions" :key="permission" class="permission-tag">
                <span class="permission-icon">✓</span>
                <span>{{ permission }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="empty-icon">🚫</div>
              <div class="empty-text">No permissions assigned</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Modal (appears when file is selected) -->
      <Transition name="modal">
        <div v-if="file" class="upload-modal-overlay" @click="cancelUpload">
          <div class="upload-modal" @click.stop>
            <div class="upload-modal-header">
              <h3>Upload Profile Photo</h3>
              <button class="close-btn" @click="cancelUpload">✕</button>
            </div>
            <div class="upload-modal-body">
              <div class="file-preview">
                <img v-if="filePreview" :src="filePreview" alt="preview" class="preview-image" />
                <div class="file-info">
                  <span class="file-icon">📄</span>
                  <span class="file-name">{{ file.name }}</span>
                </div>
              </div>
            </div>
            <div class="upload-modal-footer">
              <button class="cancel-btn" @click="cancelUpload" :disabled="uploading">Cancel</button>
              <button class="upload-btn" @click="upload" :disabled="uploading">
                <span v-if="uploading" class="btn-spinner"></span>
                <span v-else>Upload</span>
              </button>
            </div>
            <div v-if="msg" class="success-alert">
              <span class="alert-icon">✓</span>
              <span>{{ msg }}</span>
            </div>
            <div v-if="uploadError" class="error-alert">
              <span class="alert-icon">⚠️</span>
              <span>{{ uploadError }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </template>

    <!-- No User State -->
    <div v-else class="empty-profile">
      <div class="empty-icon">👤</div>
      <h3>Profile Not Loaded</h3>
      <p>Your profile information is not available. Please refresh the page.</p>
    </div>
  </div>
</template>

<script setup>
import { API_BASE } from '../composables/useApi';
import { ref, computed } from 'vue';
import { useAuthStore } from '../stores/auth';
import { api } from '../composables/useApi';

const auth = useAuthStore();
const uploading = ref(false);
const file = ref(null);
const filePreview = ref('');
const fileInput = ref(null);
const msg = ref('');
const uploadError = ref('');

const hasUser = computed(() => !!(auth.user && auth.user.id));
const user = computed(() => auth.user || {});

const photoUrl = computed(() => {
  if (!auth.user || !auth.user.photo) return '';
  if (auth.user.photo.startsWith('http')) return auth.user.photo;
  return API_BASE.replace(/\/$/, '') + auth.user.photo;
});

function getUserInitials() {
  const name = auth.user?.name;
  if (name) {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
  return '??';
}

function triggerFileInput() {
  fileInput.value?.click();
}

function onFile(e) {
  const selectedFile = e.target.files[0] || null;
  file.value = selectedFile;

  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = (event) => {
      filePreview.value = event.target.result;
    };
    reader.readAsDataURL(selectedFile);
  }
}

function cancelUpload() {
  file.value = null;
  filePreview.value = '';
  msg.value = '';
  uploadError.value = '';
  if (fileInput.value) {
    fileInput.value.value = '';
  }
}

async function upload() {
  if (!file.value) return;
  if (!hasUser.value) {
    uploadError.value = 'User not loaded yet. Please refresh and try again.';
    return;
  }
  uploading.value = true;
  msg.value = '';
  uploadError.value = '';
  try {
    const form = new FormData();
    form.append('photo', file.value);
    const tokenValue = typeof auth.token === 'object' && auth.token.value ? auth.token.value : auth.token;
    const res = await api.post(`/users/${auth.user.id}/photo`, form, { token: tokenValue });

    if (auth.user && typeof auth.user === 'object') {
      Object.assign(auth.user, res.data.user);
    }

    msg.value = 'Photo updated successfully!';
    setTimeout(() => {
      cancelUpload();
    }, 2000);
  } catch (err) {
    uploadError.value = err.message;
  } finally {
    uploading.value = false;
  }
}

// User data should already be loaded by the router guard in main.js
// No need for onMounted or watch - the component will be reactive to auth.user changes
</script>

<style scoped>
.profile-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

/* ===== Loading State ===== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f0f0f0;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #64748b;
  font-size: 1rem;
  margin: 0;
}

/* ===== Alert States ===== */
.error-alert,
.success-alert {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  font-size: 0.95rem;
  font-weight: 500;
  margin-bottom: 1rem;
}

.error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
}

.success-alert {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  color: #16a34a;
}

.alert-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

/* ===== Profile Header Card ===== */
.profile-header-card {
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.profile-banner {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
  overflow: hidden;
}

.banner-decoration {
  position: absolute;
  top: -50%;
  right: -10%;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  50% {
    transform: translate(-20px, -20px) scale(1.1);
  }
}

.profile-header-content {
  padding: 0 2.5rem 2.5rem 2.5rem;
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  margin-top: -60px;
  position: relative;
}

.profile-avatar-section {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar-large {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  font-weight: 700;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 5px solid white;
  overflow: hidden;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-initials {
  user-select: none;
}

.edit-photo-btn {
  position: absolute;
  bottom: 5px;
  right: 5px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 3px solid #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.5rem;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.edit-photo-btn:hover {
  transform: scale(1.1);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: white;
}

.profile-header-info {
  flex: 1;
  min-width: 0;
  padding-top: 20px;
}

.profile-name {
  font-size: 2rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 1rem 0;
  line-height: 1.2;
}

.profile-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-bottom: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #64748b;
  font-size: 0.95rem;
}

.contact-icon {
  font-size: 1.2rem;
}

.profile-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border-radius: 20px;
  color: #16a34a;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
}

/* ===== Content Grid ===== */
.content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #f0f0f0;
}

.info-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

.info-card.full-width {
  grid-column: 1 / -1;
}

.card-header {
  padding: 1.5rem 1.75rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
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

.card-body {
  padding: 1.75rem;
}

/* ===== Info Grid ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  word-break: break-word;
}

.bio-text {
  font-weight: 400;
  line-height: 1.6;
  color: #475569;
}

/* ===== Roles Grid ===== */
.roles-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.role-tag {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.15);
  border-radius: 12px;
  font-weight: 600;
  color: #1e293b;
  transition: all 0.3s ease;
}

.role-tag:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
}

.role-icon {
  font-size: 1.5rem;
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
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);
  border: 1px solid rgba(102, 126, 234, 0.2);
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  color: #5b21b6;
  transition: all 0.3s ease;
}

.permission-tag:hover {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
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

.empty-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.empty-profile .empty-icon {
  font-size: 5rem;
  opacity: 0.3;
  margin-bottom: 1.5rem;
}

.empty-profile h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 0.5rem 0;
}

.empty-profile p {
  color: #64748b;
  margin: 0;
}

/* ===== Upload Modal ===== */
.upload-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.upload-modal {
  background: white;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: modalSlideUp 0.3s ease-out;
}

@keyframes modalSlideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.upload-modal-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f8fafc;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 1.25rem;
  color: #64748b;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
  transform: rotate(90deg);
}

.upload-modal-body {
  padding: 2rem;
}

.file-preview {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

.preview-image {
  width: 100%;
  max-height: 300px;
  object-fit: contain;
  border-radius: 12px;
  border: 2px solid #f0f0f0;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 12px;
  width: 100%;
}

.file-icon {
  font-size: 1.5rem;
}

.file-name {
  flex: 1;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-modal-footer {
  padding: 1.5rem 2rem;
  border-top: 1px solid #f0f0f0;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.cancel-btn,
.upload-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: #f8fafc;
  color: #64748b;
}

.cancel-btn:hover:not(:disabled) {
  background: #f1f5f9;
  color: #1e293b;
}

.upload-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  min-width: 120px;
}

.upload-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
}

.cancel-btn:disabled,
.upload-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-spinner {
  width: 18px;
  height: 18px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* ===== Modal Transitions ===== */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .upload-modal,
.modal-leave-active .upload-modal {
  transition: transform 0.3s ease;
}

.modal-enter-from .upload-modal,
.modal-leave-to .upload-modal {
  transform: translateY(20px);
}

/* ===== Responsive Design ===== */
@media (max-width: 768px) {
  .profile-header-content {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 0 1.5rem 2rem 1.5rem;
  }

  .profile-header-info {
    padding-top: 0;
  }

  .profile-name {
    font-size: 1.5rem;
  }

  .profile-contact {
    justify-content: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .upload-modal {
    margin: 1rem;
  }
}

@media (max-width: 480px) {
  .profile-banner {
    height: 120px;
  }

  .profile-avatar-large {
    width: 100px;
    height: 100px;
    font-size: 2rem;
  }

  .edit-photo-btn {
    width: 36px;
    height: 36px;
    font-size: 1.2rem;
  }

  .card-header,
  .card-body {
    padding: 1.25rem;
  }
}
</style>
