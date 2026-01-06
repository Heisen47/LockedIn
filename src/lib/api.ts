import axios from 'axios';
import type { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.PUBLIC_API_BASE_URL;

interface RegisterData {
  username: string;
  email: string;
  password: string;
  bio?: string;
  techStack?: string[];
}

interface LoginData {
  username: string;
  password: string;
}

interface AuthResponse {
  redirectUrl: string;
  message: string;
  auth: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    userId: string;
    username: string;
    email: string;
    role: string;
  };
}

interface ValidateResponse {
  valid: boolean;
  user?: {
    id: string;
    username: string;
    email: string;
    handle: string;
  };
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token (skip for public endpoints)
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Skip auth header for public endpoints
        const publicEndpoints = ['/auth/login', '/auth/register', '/auth/refresh'];
        const isPublicEndpoint = publicEndpoints.some(endpoint => config.url?.includes(endpoint));
        
        if (!isPublicEndpoint) {
          const token = this.getAuthToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor to handle errors
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log('📥 API Response:', response.config.url, response.data);
        return response;
      },
      (error: AxiosError<{ message?: string }>) => {
        console.error('❌ API Error:', error.config?.url, error.response?.status, error.response?.data);
        if (error.response?.status === 401) {
          this.clearTokens();
        }
        const message = error.response?.data?.message || error.message || 'Request failed';
        throw new Error(message);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('authToken');
  }

  private setAuthToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('authToken', token);
  }

  private setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('refreshToken', token);
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('refreshToken');
  }

  private clearTokens(): void {
    if (typeof window === 'undefined') return;
    // sessionStorage.removeItem('authToken');
    // sessionStorage.removeItem('refreshToken');
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/register', data);
    
    this.setAuthToken(response.data.auth.accessToken);
    this.setRefreshToken(response.data.auth.refreshToken);
    
    // Store user info in sessionStorage
    sessionStorage.setItem('userId', response.data.auth.userId);
    sessionStorage.setItem('username', response.data.auth.username);
    sessionStorage.setItem('email', response.data.auth.email);
    
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.axiosInstance.post<AuthResponse>('/auth/login', data);
    
    this.setAuthToken(response.data.auth.accessToken);
    this.setRefreshToken(response.data.auth.refreshToken);
    
    // Store user info in sessionStorage
    sessionStorage.setItem('userId', response.data.auth.userId);
    sessionStorage.setItem('username', response.data.auth.username);
    sessionStorage.setItem('email', response.data.auth.email);
    
    return response.data;
  }

  async refreshToken(): Promise<{ token: string; refreshToken: string }> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.axiosInstance.post<{ token: string; refreshToken: string }>(
      '/auth/refresh',
      { refreshToken }
    );

    this.setAuthToken(response.data.token);
    this.setRefreshToken(response.data.refreshToken);
    
    return response.data;
  }

  async validate(): Promise<ValidateResponse> {
    const token = this.getAuthToken();
    
    try {
      if (!token) {
        return { valid: false };
      }
      const response = await this.axiosInstance.get<ValidateResponse>('/auth/validate');
      return response.data;
    } catch (error: any) {
      console.error('Validate error:', error?.message || error);
      // Fallback to sessionStorage if API fails
      const userId = sessionStorage.getItem('userId');
      const username = sessionStorage.getItem('username');
      const email = sessionStorage.getItem('email');
      
      if (token && userId && username && email) {
        return {
          valid: true,
          user: {
            id: userId,
            username: username,
            email: email,
            handle: username,
          }
        };
      }
      return { valid: false };
    }
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  // Generic API methods
  async get<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.get<T>(endpoint);
    return response.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.axiosInstance.post<T>(endpoint, data);
    return response.data;
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    const response = await this.axiosInstance.put<T>(endpoint, data);
    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const response = await this.axiosInstance.delete<T>(endpoint);
    return response.data;
  }
}

export const api = new ApiClient();
