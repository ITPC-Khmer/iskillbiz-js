# Frontend API & Auth Improvements

## Problems Fixed

### 1. **Cloudflare `/cdn-cgi/rum` Redirect Error**
- ✅ Detects HTML responses that are Cloudflare redirects
- ✅ Blocks redirect following with `redirect: 'error'`
- ✅ Identifies Cloudflare/HTML content and throws proper error
- ✅ Automatic retry with exponential backoff
- ✅ Health monitoring to detect issues early

### 2. **Request Timeout Issues**
- ✅ Configurable 30-second timeout
- ✅ Automatic retry with exponential backoff (1s, 2s, 4s)
- ✅ Retries up to 3 times by default
- ✅ Backoff delay: `delay = 1000 * 2^(attempt-1)`

### 3. **Network Errors & Connection Issues**
- ✅ Detects network errors vs API errors
- ✅ Proper error categorization (NETWORK_ERROR, TIMEOUT, REDIRECT_ERROR)
- ✅ Retryable error detection
- ✅ Connection health monitoring

### 4. **Auth Issues**
- ✅ Better token extraction from responses
- ✅ Automatic token validation on app load
- ✅ Session expiration detection
- ✅ Auto-logout on 401 Unauthorized
- ✅ Token refresh caching (5 min)

---

## Files Updated/Created

### Updated Files

1. **useApi.js** - Enhanced with:
   - Redirect detection and prevention
   - Request timeout (30s)
   - Automatic retry with exponential backoff (3 retries)
   - Better error handling
   - Timeout detection
   - Network error detection

2. **useAuth.js** - Enhanced with:
   - Better token/user extraction
   - Error state management
   - Loading state
   - Token verification with caching
   - Auto-logout on 401
   - Token validation on load
   - Clear error method

### New Files Created

3. **useApiUtils.js** - New utilities:
   - Request queue (prevent race conditions)
   - Request retry logic
   - Error classification
   - Error formatting
   - API health check
   - Retryable error detection

4. **useNotifications.js** - User feedback:
   - Error notifications
   - Warning notifications
   - Info notifications
   - Error handling with context
   - User-friendly error messages
   - Notification auto-dismiss

5. **useApiHealth.js** - Health monitoring:
   - API health checking
   - Periodic health monitoring (30s interval)
   - Cloudflare redirect detection
   - Connection recovery
   - Exponential backoff
   - Fetch interceptor setup

---

## Usage Examples

### 1. Basic Request (with auto-retry)
```javascript
import { api } from '@/composables/useApi';

// Automatically retries up to 3 times on failure
const response = await api.get('/api/data');
```

### 2. Request without retries
```javascript
// Skip retries for non-critical requests
const response = await api.get('/api/data', { retries: false });
```

### 3. Authenticated requests
```javascript
const { token } = useAuth();

const response = await api.post('/api/facebook/pages', {
  body: { name: 'My Page' },
  token: token.value
});
```

### 4. Handle errors with notifications
```javascript
import { useNotifications } from '@/composables/useNotifications';

const { handleApiError } = useNotifications();

try {
  await api.post('/api/data', { body });
} catch (error) {
  handleApiError(error, 'Save Data');
}
```

### 5. Monitor API health
```javascript
import { 
  startHealthMonitoring, 
  getApiStatus 
} from '@/composables/useApiHealth';

// Start monitoring (checks every 30 seconds)
startHealthMonitoring();

// Get status
const status = getApiStatus();
console.log(status);
// { healthy: true, lastCheck: Date, connectionAttempts: 0, isMonitoring: true }
```

### 6. Login with better error handling
```javascript
import { useAuth } from '@/composables/useAuth';
import { useNotifications } from '@/composables/useNotifications';

const { login, error: authError } = useAuth();
const { handleApiError, addSuccess } = useNotifications();

try {
  await login({ email: 'user@example.com', password: 'password' });
  addInfo('Logged in successfully!');
} catch (error) {
  handleApiError(error, 'Login');
}
```

### 7. Setup in main.js
```javascript
import { setupInterceptors, startHealthMonitoring } from '@/composables/useApiHealth';

// Setup global interceptors
setupInterceptors();

// Start health monitoring
startHealthMonitoring(30000); // Check every 30 seconds

app.mount('#app');
```

---

## Error Types Handled

| Error Code | Meaning | Retryable | Auto-Retry |
|-----------|---------|-----------|-----------|
| `NETWORK_ERROR` | No internet/connection failed | ✅ Yes | ✅ Yes |
| `TIMEOUT` | Request took > 30 seconds | ✅ Yes | ✅ Yes |
| `REDIRECT_ERROR` | Cloudflare/HTML response | ✅ Yes | ✅ Yes |
| `PARSE_ERROR` | Invalid JSON response | ❌ No | ❌ No |
| `API_ERROR` | Server returned error | Depends | ✅ If 5xx |
| 5xx errors | Server error | ✅ Yes | ✅ Yes |
| 4xx errors | Client error | ❌ No (except 408, 429) | ❌ No |
| 401 | Unauthorized | ❌ No | ❌ No |
| 403 | Forbidden | ❌ No | ❌ No |
| 404 | Not found | ❌ No | ❌ No |

---

## Retry Logic

**Automatic retry strategy:**
- Retries: Up to 3 attempts
- Delay: Exponential backoff
  - Attempt 1: Immediate
  - Attempt 2: Wait 1s
  - Attempt 3: Wait 2s
  - Attempt 4: Wait 4s
- Max wait: Configurable per request
- Disabling retries: `{ retries: false }` option

---

## Response Handling

### Success Response
```javascript
{
  success: true,
  data: { ... },
  message: "Operation successful"
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  status: 400,
  code: "ERROR_CODE"
}
```

---

## Performance Improvements

1. **Request Deduplication** - Prevents duplicate concurrent requests
2. **Health Caching** - Verification cached for 5 minutes
3. **Exponential Backoff** - Reduces server load on retries
4. **Timeout Detection** - Fails fast on slow connections
5. **Connection Monitoring** - Early detection of issues

---

## Configuration

### API Timeout
```javascript
// In useApi.js
const REQUEST_TIMEOUT = 30000; // 30 seconds
```

### Health Check Interval
```javascript
// In main.js
startHealthMonitoring(30000); // 30 seconds
```

### Retry Configuration
```javascript
// Default: 3 retries
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second base
```

---

## Cloudflare Issue Specifics

The `/cdn-cgi/rum` error typically happens when:

1. **Server is down** - Cloudflare shows error page
2. **Connection timeout** - Server not responding
3. **Rate limited** - Too many requests
4. **Misconfigured** - Proxy/CORS issues

**Solution implemented:**
- ✅ Detect HTML responses from Cloudflare
- ✅ Block automatic redirects
- ✅ Auto-retry with backoff
- ✅ Health monitoring to detect early
- ✅ User notifications with helpful messages

---

## Migration Guide

### Before (Old useApi.js)
```javascript
const res = await api.post('/auth/login', payload);
token.value = res.data.token;
user.value = res.data.user;
```

### After (New useAuth.js)
```javascript
const { login } = useAuth();
await login(payload);
// Token and user automatically set
```

---

## Best Practices

1. **Always use useAuth for authentication**
   ```javascript
   const { login, logout, token } = useAuth();
   ```

2. **Use notifications for user feedback**
   ```javascript
   const { handleApiError } = useNotifications();
   try { ... } catch(e) { handleApiError(e); }
   ```

3. **Enable health monitoring on app startup**
   ```javascript
   startHealthMonitoring();
   ```

4. **Check auth token validity**
   ```javascript
   const { verifyToken } = useAuth();
   const isValid = await verifyToken();
   ```

5. **Handle specific errors**
   ```javascript
   if (error.status === 401) { logout(); }
   if (error.code === 'REDIRECT_ERROR') { /* retry logic */ }
   ```

---

## Summary of Improvements

✅ **Cloudflare Redirect Detection** - Prevents and recovers from `/cdn-cgi/rum` errors
✅ **Automatic Retry Logic** - 3 retries with exponential backoff
✅ **Request Timeout** - 30-second timeout with detection
✅ **Health Monitoring** - Periodic checks to detect issues early
✅ **Better Error Handling** - Categorized errors with proper messages
✅ **Auth Improvements** - Better token/user extraction and validation
✅ **User Notifications** - Feedback for errors, warnings, and info
✅ **Request Deduplication** - Prevents race conditions
✅ **Connection Recovery** - Automatic recovery with backoff

**Status: Ready for Production** 🚀

