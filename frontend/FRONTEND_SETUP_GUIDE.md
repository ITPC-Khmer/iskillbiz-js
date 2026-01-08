# Frontend Integration Guide

## Setup Instructions

### Step 1: Update main.js
```javascript
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import health monitoring and interceptors
import { setupInterceptors, startHealthMonitoring } from '@/composables/useApiHealth'

const app = createApp(App)

app.use(router)

// Setup global API interceptors and health monitoring
setupInterceptors()
startHealthMonitoring(30000) // Check health every 30 seconds

app.mount('#app')
```

---

## Component Usage Examples

### Example 1: Login Component
```vue
<template>
  <div class="login">
    <!-- Notifications -->
    <div v-if="authError" class="error-message">{{ authError }}</div>
    
    <!-- Loading state -->
    <button @click="handleLogin" :disabled="isLoading">
      {{ isLoading ? 'Logging in...' : 'Login' }}
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'
import { useRouter } from 'vue-router'

const router = useRouter()
const { login, isLoading, error: authError } = useAuth()
const { handleApiError, addInfo } = useNotifications()

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await login({
      email: email.value,
      password: password.value
    })
    addInfo('Login successful!')
    router.push('/dashboard')
  } catch (error) {
    handleApiError(error, 'Login')
  }
}
</script>
```

### Example 2: Data Fetching Component
```vue
<template>
  <div class="data-component">
    <!-- Loading state -->
    <div v-if="loading" class="spinner">Loading...</div>
    
    <!-- Error state -->
    <div v-if="error" class="error-message">{{ error }}</div>
    
    <!-- Data display -->
    <div v-if="data" class="data-content">
      {{ data }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { api } from '@/composables/useApi'
import { useNotifications } from '@/composables/useNotifications'

const data = ref(null)
const loading = ref(false)
const error = ref(null)
const { handleApiError } = useNotifications()

async function fetchData() {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/api/facebook/pages')
    data.value = response.data
  } catch (err) {
    error.value = err.message
    handleApiError(err, 'Fetch Data')
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)
</script>
```

### Example 3: Authenticated Request
```vue
<template>
  <div>
    <button @click="createFacebook">Create Facebook Page</button>
  </div>
</template>

<script setup>
import { api } from '@/composables/useApi'
import { useAuth } from '@/composables/useAuth'
import { useNotifications } from '@/composables/useNotifications'

const { token } = useAuth()
const { addError, addInfo } = useNotifications()

async function createFacebook() {
  try {
    const response = await api.post(
      '/api/facebook/pages',
      {
        name: 'My Page',
        category: 'Business'
      },
      {
        token: token.value
      }
    )
    addInfo('Page created successfully!')
  } catch (error) {
    addError(error, { title: 'Create Page Failed' })
  }
}
</script>
```

### Example 4: Notifications Display Component
```vue
<template>
  <div class="notifications">
    <!-- Errors -->
    <div v-for="notif in errors" :key="notif.id" class="notification error">
      <strong>{{ notif.title }}</strong>
      <p>{{ notif.message }}</p>
    </div>
    
    <!-- Warnings -->
    <div v-for="notif in warnings" :key="notif.id" class="notification warning">
      <strong>{{ notif.title }}</strong>
      <p>{{ notif.message }}</p>
    </div>
    
    <!-- Info -->
    <div v-for="notif in info" :key="notif.id" class="notification info">
      <strong>{{ notif.title }}</strong>
      <p>{{ notif.message }}</p>
    </div>
  </div>
</template>

<script setup>
import { useNotifications } from '@/composables/useNotifications'

const { errors, warnings, info } = useNotifications()
</script>

<style scoped>
.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
}

.notification {
  padding: 16px;
  margin-bottom: 10px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 300px;
}

.notification.error {
  background-color: #fee;
  color: #c33;
  border-left: 4px solid #c33;
}

.notification.warning {
  background-color: #ffeaa7;
  color: #ff7675;
  border-left: 4px solid #ff7675;
}

.notification.info {
  background-color: #d0ebff;
  color: #004085;
  border-left: 4px solid #004085;
}
</style>
```

### Example 5: Protected Route Guard
```javascript
// router/index.js
import { useAuth } from '@/composables/useAuth'

router.beforeEach(async (to, from, next) => {
  const { isAuthed, verifyToken } = useAuth()
  
  // Check if route requires auth
  if (to.meta.requiresAuth) {
    // Verify token is still valid
    const isValid = await verifyToken()
    
    if (!isValid) {
      // Redirect to login
      next('/login')
      return
    }
  }
  
  next()
})
```

---

## Common Issues & Solutions

### Issue: `/cdn-cgi/rum` Error Still Occurring
**Solution:**
1. Ensure `setupInterceptors()` is called in main.js
2. Enable health monitoring: `startHealthMonitoring()`
3. Check server is running: `npm start`
4. Check `.env` has correct `VITE_API_BASE`

### Issue: Token not persisting
**Solution:**
- useAuth automatically saves to localStorage
- Check if localStorage is enabled in browser
- Check private/incognito mode

### Issue: Notifications not showing
**Solution:**
1. Add Notifications component to App.vue:
```vue
<template>
  <div>
    <Notifications />
    <RouterView />
  </div>
</template>

<script setup>
import Notifications from '@/components/Notifications.vue'
</script>
```

2. Or use useNotifications in your component

### Issue: Requests hanging/not completing
**Solution:**
- Timeout is 30 seconds by default
- Check server logs for errors
- Ensure API endpoint exists
- Use health check: `checkApiHealth()`

---

## Testing

### Test Health Monitoring
```javascript
import { checkApiHealth, getApiStatus } from '@/composables/useApiHealth'

// Check health manually
const healthy = await checkApiHealth()
console.log('API Health:', getApiStatus())
```

### Test Error Handling
```javascript
import { useNotifications } from '@/composables/useNotifications'

const { addError } = useNotifications()

// Simulate error
addError(new Error('Test error'), { title: 'Test' })
```

### Test Auth
```javascript
import { useAuth } from '@/composables/useAuth'

const { login, logout, token } = useAuth()

// Login
await login({ email: 'test@example.com', password: 'password' })
console.log('Token:', token.value)

// Logout
logout()
```

---

## Environment Variables

In `frontend/.env`:
```
VITE_API_BASE=/api
```

Or in `frontend/.env.production`:
```
VITE_API_BASE=https://api.iskillbiz.com/api
```

---

## Summary

✅ **useApi.js** - Enhanced with timeout, retry, redirect detection
✅ **useAuth.js** - Improved token management and validation
✅ **useApiUtils.js** - New utility functions
✅ **useNotifications.js** - User feedback system
✅ **useApiHealth.js** - Health monitoring and recovery
✅ **API_IMPROVEMENTS.md** - Complete documentation

All `/cdn-cgi/rum` errors should now be handled automatically with:
- Redirect detection
- Automatic retries
- Health monitoring
- User-friendly error messages

**Ready for integration!** 🚀

