import { REQUEST_TIMEOUT } from "@/lib/config"

// Custom API error class
export class ApiError extends Error {
  statusCode: number

  constructor(message: string, statusCode: number) {
    super(message)
    this.statusCode = statusCode
    this.name = "ApiError"
  }
}

// Helper function to transform MongoDB _id to id
function transformMongoResponse(data: any): any {
  // If data is null or undefined, return it as is
  if (data == null) return data

  // If it's an array, transform each item
  if (Array.isArray(data)) {
    return data.map((item) => transformMongoResponse(item))
  }

  // If it's an object with _id, transform it
  if (data && typeof data === "object") {
    // Create a new object to avoid mutating the original
    const transformed = { ...data }

    // If _id exists, add an id property with the same value
    if (transformed._id !== undefined) {
      transformed.id = transformed._id
    }

    // Check for common response patterns with nested data
    if (transformed.project && typeof transformed.project === "object") {
      transformed.project = transformMongoResponse(transformed.project)
    }

    if (transformed.data && typeof transformed.data === "object") {
      transformed.data = transformMongoResponse(transformed.data)
    }

    // Transform nested objects
    Object.keys(transformed).forEach((key) => {
      if (typeof transformed[key] === "object" && transformed[key] !== null) {
        transformed[key] = transformMongoResponse(transformed[key])
      }
    })

    return transformed
  }

  // Otherwise return as is
  return data
}

// Maximum number of retries for API requests
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

// Base API client for making requests
export const apiClient = {
  async request<T>(endpoint: string, options: RequestInit = {}, retries = 0): Promise<T> {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...options.headers,
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }

    const config: RequestInit = {
      ...options,
      headers,
      // Add cache control to prevent caching issues
      cache: "no-cache",
    }

    // Add timeout using AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    config.signal = controller.signal

    try {
      // Ensure the endpoint is properly formatted
      const formattedEndpoint = endpoint.trim()

      // Log the request for debugging
      console.log(
        `API Request: ${options.method || "GET"} ${formattedEndpoint}`,
        options.body ? JSON.parse(options.body as string) : null,
      )

      const response = await fetch(formattedEndpoint, config)
      clearTimeout(timeoutId)

      // Check for rate limiting
      if (response.status === 429) {
        const resetTime = response.headers.get("X-RateLimit-Reset")
        throw new ApiError(`Rate limit exceeded. Try again in ${resetTime} seconds.`, 429)
      }

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new ApiError(errorData.error || `HTTP error! status: ${response.status}`, response.status)
      }

      // Parse JSON response
      const data = await response.json()

      // Log the raw response for debugging
      console.log("API Response:", data)

      // Transform MongoDB _id to id
      const transformedData = transformMongoResponse(data)

      // Log the transformed data
      console.log("Transformed data:", transformedData)

      // Return transformed data
      return transformedData as T
    } catch (error) {
      clearTimeout(timeoutId)

      // Handle abort error (timeout)
      if (error.name === "AbortError") {
        console.error(`Request timeout for ${endpoint}`)
        throw new ApiError(
          "Request timeout. The operation is taking longer than expected. The process will continue in the background.",
          408,
        )
      }

      // Handle network errors more specifically
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(`Network error when calling ${endpoint}:`, error)

        // Check if we're offline
        const isOffline = typeof navigator !== "undefined" && !navigator.onLine
        if (isOffline) {
          console.log("Device is offline, handling gracefully")
          throw new ApiError(
            "You are currently offline. Some features may be limited until your connection is restored.",
            0,
          )
        }

        // Retry logic for network errors
        if (retries < MAX_RETRIES) {
          console.log(`Retrying request to ${endpoint} (attempt ${retries + 1}/${MAX_RETRIES})`)
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
          return this.request<T>(endpoint, options, retries + 1)
        }

        throw new ApiError(
          `Network error when calling ${endpoint}. The server may be unavailable or the endpoint may not exist. The application will continue to function with limited features.`,
          0,
        )
      }

      // Re-throw ApiError or wrap other errors
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(error.message || "Unknown error occurred", 500)
    }
  },

  // HTTP method helpers
  async get<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" })
  },

  async post<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    })
  },

  async put<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  async patch<T>(endpoint: string, data: any, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    })
  },

  async delete<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" })
  },
}
