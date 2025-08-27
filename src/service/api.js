// api.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://127.0.0.1:8000/';

const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    // Check if token expires in next 60 seconds
    return decoded.exp < currentTime + 60;
  } catch {
    return true;
  }
};

// Add a request interceptor to attach the access token to every request
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('access_token');
    
    if (token) {
      // Check if token is about to expire
      if (isTokenExpired(token)) {
        const refreshToken = localStorage.getItem('refresh_token');
        
        if (refreshToken) {
          try {
            // Attempt to refresh the token
            const response = await axios.post(`${API_URL}api/auth/token/refresh/`, {
              refresh: refreshToken,
            });
            
            // Update tokens
            localStorage.setItem('access_token', response.data.access);
            
            // Update the config with new token
            config.headers.Authorization = `Bearer ${response.data.access}`;
          } catch (error) {
            // Refresh failed, clear storage and redirect to login
            localStorage.clear();
            window.location.href = '/login';
            return Promise.reject(error);
          }
        }
      } else {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to catch 401 errors and attempt to refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem('refresh_token');

    // If we get a 401 and we haven't already tried to refresh the token...
    if (
      error.response &&
      error.response.status === 401 &&
      refreshToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true; // prevent infinite loops

      try {
        // Attempt to get a new access token using the refresh token
        const { data } = await axios.post(`${API_URL}api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        // If successful, store the new token
        localStorage.setItem('access_token', data.access);

        // Update the Authorization header and retry the original request
        originalRequest.headers.Authorization = `Bearer ${data.access}`;
        return axiosInstance(originalRequest);
      } catch (err) {
        // If refresh fails (e.g., refresh token expired), force logout
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('role');
        localStorage.removeItem('username');
        localStorage.removeItem('user_id');
        
        // Redirect to login page
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    // If the error wasn't a 401 or token refresh failed, just reject as normal
    return Promise.reject(error);
  }
);

export default axiosInstance;