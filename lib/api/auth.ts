import { apiClient, ApiError } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/config"

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: {
    id: string
    email: string
  }
}

export async function loginUser(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const data = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials)

    // Store token and user data in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    return data
  } catch (error) {
    console.error("Login error:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to login", 500)
  }
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponse> {
  try {
    const data = await apiClient.post<AuthResponse>(API_ENDPOINTS.AUTH.REGISTER, credentials)

    // Store token and user data in localStorage
    if (data.token) {
      localStorage.setItem("token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
    }

    return data
  } catch (error) {
    console.error("Registration error:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to register", 500)
  }
}

export async function validateToken(): Promise<boolean> {
  try {
    const token = localStorage.getItem("token")

    if (!token) {
      return false
    }

    await apiClient.post<{ valid: boolean }>(API_ENDPOINTS.AUTH.VALIDATE, {})

    return true
  } catch (error) {
    console.error("Token validation error:", error)
    // Clear invalid token
    localStorage.removeItem("token")
    localStorage.removeItem("user")
    return false
  }
}

export function logoutUser(): void {
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export function getCurrentUser(): { id: string; email: string } | null {
  try {
    const userStr = localStorage.getItem("user")
    if (!userStr) return null
    return JSON.parse(userStr)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem("token")
}
