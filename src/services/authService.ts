/**
 * Authentication service for handling login/logout operations
 */

import { apiClient } from '../lib/apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface AuthResponse {
  user: User;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${apiClient['baseURL']}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }

    return response.json();
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${apiClient['baseURL']}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }

    return response.json();
  }

  async logout(): Promise<void> {
    const response = await fetch(`${apiClient['baseURL']}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies
    });

    if (!response.ok) {
      throw new Error('Logout failed');
    }
  }

  // Check if user is authenticated by making a request that requires auth
  async checkAuth(): Promise<User | null> {
    try {
      // Try to access a protected endpoint
      const user = await apiClient.get<User>('/user/profile');
      return user;
    } catch {
      return null;
    }
  }
}

// Create and export a singleton instance
export const authService = new AuthService();

// Export the class for testing or multiple instances
export { AuthService };