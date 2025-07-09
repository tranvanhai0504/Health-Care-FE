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

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Handle common errors (401, 403, 500, etc.)
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
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