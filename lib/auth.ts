// Authentication utilities for the frontend

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Get token from localStorage
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
};

// Get user from localStorage
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set authentication data
export const setAuth = (token: string, user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear authentication data
export const clearAuth = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getToken();
  return !!token;
};

// Get authorization header for API requests
export const getAuthHeader = (): { Authorization: string } | {} => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// API request with authentication
export const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const token = getToken();
  console.log('[authenticatedFetch] Token:', token ? token.substring(0, 50) + '...' : 'No token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
    console.log('[authenticatedFetch] Authorization header set');
  } else {
    console.log('[authenticatedFetch] No token available');
  }

  console.log('[authenticatedFetch] Making request to:', url);
  return fetch(url, {
    ...options,
    headers,
  });
};

// Validate token with backend
export const validateToken = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) return false;

    const response = await authenticatedFetch('/api/auth/validate');
    return response.ok;
  } catch (error) {
    console.error('Token validation error:', error);
    return false;
  }
};

// Login function
export const login = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  return data;
};

// Register function
export const register = async (email: string, password: string, name?: string): Promise<AuthResponse> => {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  return data;
};

// Logout function
export const logout = async (): Promise<void> => {
  try {
    await authenticatedFetch('/api/auth/logout', { method: 'POST' });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearAuth();
  }
}; 