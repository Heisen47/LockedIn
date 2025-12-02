import { api } from './api';

export interface User {
  id: string;
  username: string;
  email: string;
  handle: string;
}

// Check if user is authenticated
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false;
  
  const token = sessionStorage.getItem('authToken');
  if (!token) return false;

  const result = await api.validate();
  return result.valid;
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  
  const result = await api.validate();
  return result.valid && result.user ? result.user : null;
}

// Auto-refresh token every 24 hours
export function setupTokenRefresh(): void {
  if (typeof window === 'undefined') return;

  // Refresh token every 23 hours (before 24hr expiry)
  const REFRESH_INTERVAL = 23 * 60 * 60 * 1000; // 23 hours in ms

  setInterval(async () => {
    try {
      await api.refreshToken();
      console.log('Token refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh token:', error);
      // Redirect to login if refresh fails
      window.location.href = '/auth';
    }
  }, REFRESH_INTERVAL);
}

// Initialize auth on app load
export async function initAuth(): Promise<User | null> {
  if (typeof window === 'undefined') return null;
  
  const user = await getCurrentUser();
  
  if (user) {
    setupTokenRefresh();
  }
  
  return user;
}
