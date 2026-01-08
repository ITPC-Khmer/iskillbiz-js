/**
 * Error handling and user notifications
 */

import { ref, computed } from 'vue';
import { formatErrorMessage, getErrorType } from './useApiUtils';

const errors = ref([]);
const warnings = ref([]);
const info = ref([]);

/**
 * Add error notification
 */
function addError(error, options = {}) {
  const {
    duration = 5000,
    id = Math.random().toString(36),
    title = 'Error'
  } = options;

  const message = formatErrorMessage(error);
  const type = getErrorType(error);

  const notification = {
    id,
    message,
    type,
    title,
    timestamp: new Date()
  };

  errors.value.push(notification);

  if (duration > 0) {
    setTimeout(() => removeError(id), duration);
  }

  console.error(`[${title}] ${message}`, error);
  return id;
}

/**
 * Add warning notification
 */
function addWarning(message, options = {}) {
  const {
    duration = 4000,
    id = Math.random().toString(36),
    title = 'Warning'
  } = options;

  const notification = {
    id,
    message: typeof message === 'string' ? message : formatErrorMessage(message),
    title,
    timestamp: new Date()
  };

  warnings.value.push(notification);

  if (duration > 0) {
    setTimeout(() => removeWarning(id), duration);
  }

  return id;
}

/**
 * Add info notification
 */
function addInfo(message, options = {}) {
  const {
    duration = 3000,
    id = Math.random().toString(36),
    title = 'Info'
  } = options;

  const notification = {
    id,
    message: typeof message === 'string' ? message : formatErrorMessage(message),
    title,
    timestamp: new Date()
  };

  info.value.push(notification);

  if (duration > 0) {
    setTimeout(() => removeInfo(id), duration);
  }

  return id;
}

/**
 * Remove error notification
 */
function removeError(id) {
  const index = errors.value.findIndex(e => e.id === id);
  if (index > -1) {
    errors.value.splice(index, 1);
  }
}

/**
 * Remove warning notification
 */
function removeWarning(id) {
  const index = warnings.value.findIndex(w => w.id === id);
  if (index > -1) {
    warnings.value.splice(index, 1);
  }
}

/**
 * Remove info notification
 */
function removeInfo(id) {
  const index = info.value.findIndex(i => i.id === id);
  if (index > -1) {
    info.value.splice(index, 1);
  }
}

/**
 * Clear all notifications
 */
function clearAll() {
  errors.value = [];
  warnings.value = [];
  info.value = [];
}

/**
 * Check if there are any notifications
 */
const hasErrors = computed(() => errors.value.length > 0);
const hasWarnings = computed(() => warnings.value.length > 0);
const hasNotifications = computed(() =>
  errors.value.length > 0 ||
  warnings.value.length > 0 ||
  info.value.length > 0
);

/**
 * Handle API errors with user feedback
 */
function handleApiError(error, context = 'Operation') {
  console.error(`[${context}] API Error:`, error);

  if (error.code === 'REDIRECT_ERROR') {
    addError(error, {
      title: 'Server Connection Issue',
      message: 'The server is experiencing issues. Please try again.',
      duration: 6000
    });
    return;
  }

  if (error.code === 'NETWORK_ERROR') {
    addError(error, {
      title: 'Network Error',
      duration: 6000
    });
    return;
  }

  if (error.code === 'TIMEOUT') {
    addError(error, {
      title: 'Request Timeout',
      message: 'The server took too long to respond. Please try again.',
      duration: 6000
    });
    return;
  }

  if (error.status === 401) {
    addError('Your session has expired. Please login again.', {
      title: 'Session Expired',
      duration: 0
    });
    return;
  }

  if (error.status === 403) {
    addError('You do not have permission to perform this action.', {
      title: 'Access Denied'
    });
    return;
  }

  if (error.status === 404) {
    addError('The requested resource was not found.', {
      title: 'Not Found'
    });
    return;
  }

  if (error.status >= 500) {
    addError(error, {
      title: 'Server Error',
      message: 'The server encountered an error. Please try again later.',
      duration: 6000
    });
    return;
  }

  // Generic error
  addError(error, { title: context });
}

export function useNotifications() {
  return {
    // State
    errors,
    warnings,
    info,
    hasErrors,
    hasWarnings,
    hasNotifications,

    // Methods
    addError,
    addWarning,
    addInfo,
    removeError,
    removeWarning,
    removeInfo,
    clearAll,
    handleApiError
  };
}

