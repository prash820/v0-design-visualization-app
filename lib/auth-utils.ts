/**
 * Utility functions for handling authentication in the mock environment
 */

// Check if the user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false

  const token = localStorage.getItem("mockToken")
  const user = localStorage.getItem("mockUser")

  return !!token && !!user
}

// Get the current user
export function getCurrentUser(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null

  try {
    const userStr = localStorage.getItem("mockUser")
    if (!userStr) return null

    return JSON.parse(userStr)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

// Log the user out
export function logout(): void {
  if (typeof window === "undefined") return

  localStorage.removeItem("mockToken")
  localStorage.removeItem("mockUser")
}

// Set authentication data
export function setAuthData(token: string, user: { id: string; email: string }): void {
  if (typeof window === "undefined") return

  localStorage.setItem("mockToken", token)
  localStorage.setItem("mockUser", JSON.stringify(user))
}
