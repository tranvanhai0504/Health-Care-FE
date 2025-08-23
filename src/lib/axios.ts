import axios from 'axios';
import { toast } from 'sonner';
import { host } from '@/utils';

// Create an Axios instance with custom configurations
const api = axios.create({
  baseURL: host,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // 15 seconds
  withCredentials: true, // Needed for cookies if your API uses cookie-based auth
});

// Request interceptor for adding auth token or other headers
api.interceptors.request.use(
  (config) => {
    // First check for direct JWT token
    const jwtToken = localStorage.getItem('jwt_token');
    if (jwtToken) {
      config.headers.Authorization = `Bearer ${jwtToken}`;
      return config;
    }
    
    // Fall back to auth storage if direct token not found
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      try {
        const { state } = JSON.parse(authStorage);
        if (state?.token) {
          config.headers.Authorization = `Bearer ${state.token}`;
        }
      } catch (e) {
        console.error('Error parsing auth storage', e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to get refresh token from storage
function getRefreshToken() {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const { state } = JSON.parse(authStorage);
      return state?.refreshToken;
    } catch {
      return null;
    }
  }
  return null;
}

// Helper to set new access and refresh tokens in storage
function setTokens(authenToken: string, refreshToken: string) {
  const authStorage = localStorage.getItem('auth-storage');
  if (authStorage) {
    try {
      const parsed = JSON.parse(authStorage);
      parsed.state = parsed.state || {};
      parsed.state.token = authenToken;
      parsed.state.refreshToken = refreshToken;
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
      localStorage.setItem('jwt_token', authenToken);
    } catch {}
  } else {
    localStorage.setItem('jwt_token', authenToken);
  }
}

// Prevent multiple refreshes
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes('/auth/refresh-token') &&
      // Do not attempt refresh for unsignup flow; surface error to UI instead
      !originalRequest.url.includes('/user/unsignup')
    ) {
      // Try to refresh token
      if (isRefreshing) {
        // Wait for the refresh to finish
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            resolve(api(originalRequest));
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = getRefreshToken();
        if (!refreshToken) throw new Error('No refresh token');
        const res = await axios.post(
          `${host}/auth/refresh-token`,
          { refreshToken },
          { withCredentials: true }
        );
        // Expect { status: 'success', data: { authenToken, refreshToken } }
        if (res.data?.status === 'success' && res.data.data?.authenToken) {
          const newToken = res.data.data.authenToken;
          const newRefreshToken = res.data.data.refreshToken;
          setTokens(newToken, newRefreshToken);
          api.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
          onRefreshed(newToken);
          isRefreshing = false;
          originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
          return api(originalRequest);
        } else {
          throw new Error(res.data?.error?.message || 'Failed to refresh token');
        }
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        // Clear auth data from localStorage
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('jwt_token');
        let errorMsg = 'Session expired. Please sign in again.';
        if (
          refreshError &&
          typeof refreshError === 'object' &&
          'response' in refreshError &&
          refreshError.response &&
          typeof refreshError.response === 'object' &&
          'data' in refreshError.response &&
          refreshError.response.data &&
          typeof refreshError.response.data === 'object' &&
          'error' in refreshError.response.data &&
          refreshError.response.data.error &&
          typeof refreshError.response.data.error === 'object' &&
          'message' in refreshError.response.data.error
        ) {
          errorMsg = String(refreshError.response.data.error.message);
        }
        toast.error(errorMsg);
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Skip forced logout for unsignup endpoint; let caller handle error
          if (originalRequest?.url?.includes('/user/unsignup')) {
            break;
          }
          // If we're already on the login page, don't show the toast
          if (!window.location.pathname.includes('/login')) {
            toast.error('Session expired. Please sign in again.');
            
            // Clear auth data from localStorage
            localStorage.removeItem('auth-storage');
            
            // Redirect to login page with redirect back to current page
            const currentPath = window.location.pathname;
            window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
          }
          break;
          
        case 403:
          toast.error('You do not have permission to access this resource');
          break;
          
        case 404:
          // Only show toast for API calls, not page navigations
          if (error.config.url.includes('/api/')) {
            toast.error('The requested resource was not found');
          }
          break;
          
        case 500:
          toast.error('Server error. Please try again later.');
          break;
          
        default:
          // For other errors, show the message from the server if available
          if (data?.message) {
            toast.error(data.message);
          } else {
            toast.error('An error occurred. Please try again.');
          }
      }
    } else if (error.request) {
      // Request was made but no response was received
      // Don't show toast for aborted requests (timeouts) as they might be handled by components
      if (error.code !== 'ECONNABORTED') {
      toast.error('No response from server. Please check your connection.');
      }
    } else {
      // Error in setting up the request
      // Only show toast for actual setup errors, not aborted requests
      if (error.code !== 'ECONNABORTED') {
      toast.error('Error setting up request. Please try again.');
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 