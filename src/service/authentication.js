// authService.js
import axiosInstance from './api';
import { jwtDecode } from 'jwt-decode';

const API_URL = 'http://127.0.0.1:8000/';

// Login function
export const login = async (username, password) => {
  try {
    const response = await axiosInstance.post('api/auth/login/', {
      username,
      password,
    });

    // Store tokens and user data
    localStorage.setItem('access_token', response.data.access);
    localStorage.setItem('refresh_token', response.data.refresh);
    
    // Decode token to get user info
    const decodedToken = jwtDecode(response.data.access);
    
    // Store user information
    localStorage.setItem('role', response.data.role);
    localStorage.setItem('username', response.data.username);
    localStorage.setItem('user_id', response.data.user_id);
    localStorage.setItem('email', response.data.email || '');

    return { 
      success: true, 
      data: {
        ...response.data,
        role: response.data.role,
        username: response.data.username,
      }
    };
  } catch (error) {
    // Parse and return meaningful error messages
    const errorMessage =
      error.response?.data?.error || 
      error.response?.data?.detail || 
      'Invalid username or password';
    
    console.error('Login error:', errorMessage);
    
    return {
      success: false,
      error: errorMessage,
    };
  }
};

// Logout function
export const logout = async () => {
  try {
    const refresh = localStorage.getItem('refresh_token');
    if (refresh) {
      await axiosInstance.post('api/auth/logout/', { refresh });
    }
  } catch (error) {
    console.error('Error during logout:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('email');

    return { success: true };
  }
};

// Register new staff member (superadmin only)
export const registerStaff = async (userData) => {
  try {
    const response = await axiosInstance.post('api/auth/staff/register/', userData);
    
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    const errorMessage = 
      error.response?.data?.username?.[0] ||
      error.response?.data?.email?.[0] ||
      error.response?.data?.password?.[0] ||
      error.response?.data?.error ||
      'Failed to create staff member';
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Get all staff members (superadmin only)
export const getStaffList = async () => {
  try {
    const response = await axiosInstance.get('api/auth/staff/');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch staff list'
    };
  }
};

// Get specific staff member details (superadmin only)
export const getStaffDetail = async (userId) => {
  try {
    const response = await axiosInstance.get(`api/auth/staff/${userId}/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch staff details'
    };
  }
};

// Update staff member (superadmin only)
export const updateStaff = async (userId, userData) => {
  try {
    const response = await axiosInstance.put(`api/auth/staff/${userId}/`, userData);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update staff member'
    };
  }
};

// Deactivate staff member (superadmin only)
export const deactivateStaff = async (userId) => {
  try {
    const response = await axiosInstance.delete(`api/authstaff/${userId}/`);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to deactivate staff member'
    };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('api/user/profile/');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch profile'
    };
  }
};

// Change password
export const changePassword = async (oldPassword, newPassword) => {
  try {
    const response = await axiosInstance.post('api/user/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    const errorMessage = 
      error.response?.data?.old_password?.[0] ||
      error.response?.data?.new_password?.[0] ||
      error.response?.data?.error ||
      'Failed to change password';
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

// Get dashboard data
export const getDashboard = async () => {
  try {
    const response = await axiosInstance.get('api/dashboard/');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch dashboard data'
    };
  }
};

// Check if user is logged in
export const isLoggedIn = () => {
  const token = localStorage.getItem('access_token');
  if (!token) return false;
  
  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000;
    return decoded.exp > currentTime;
  } catch {
    return false;
  }
};

// Get user role
export const getUserRole = () => {
  return localStorage.getItem('role');
};

// Get username
export const getUsername = () => {
  return localStorage.getItem('username');
};

// Get user ID
export const getUserId = () => {
  return localStorage.getItem('user_id');
};

// Check if user is superadmin
export const isSuperAdmin = () => {
  return getUserRole() === 'superadmin';
};

// Check if user is staff
export const isStaff = () => {
  return getUserRole() === 'staff';
};

// Auto refresh token setup
export const setupTokenRefresh = () => {
  // Check token every 30 seconds
  const interval = setInterval(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      clearInterval(interval);
      return;
    }
    
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      // If token expires in next 5 minutes, refresh it
      if (decoded.exp < currentTime + 300) {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axiosInstance.post('api/auth/token/refresh/', {
            refresh: refreshToken,
          });
          
          localStorage.setItem('access_token', response.data.access);
        }
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearInterval(interval);
    }
  }, 30000); // Check every 30 seconds
  
  return interval;
};