// API configuration
const isDevelopment = process.env.NODE_ENV === "development"

// Base API URL - change based on environment with fallback mechanism
export const API_BASE_URL = (() => {
  // Primary URL
  const primaryUrl = isDevelopment
    ? "http://localhost:5001/api"
    : "https://chartai-backend-697f80778bd2.herokuapp.com/api"

  // Check if the URL is accessible (this will be done at runtime)
  // For now, just return the primary URL
  return primaryUrl
})()

// Ensure the API URL ends with a slash if needed
const ensureTrailingSlash = (url: string) => (url.endsWith("/") ? url : `${url}/`)

// API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    VALIDATE: `${API_BASE_URL}/auth/validate-token`,
  },
  // Project endpoints
  PROJECTS: {
    BASE: `${API_BASE_URL}/projects`,
    DETAIL: (id: string) => `${API_BASE_URL}/projects/${id}`,
    STATE: (id: string) => `${API_BASE_URL}/projects/${id}/state`,
  },
  // Generation endpoints
  GENERATE: {
    DIAGRAM: `${API_BASE_URL}/generate`,
    UML: `${API_BASE_URL}/uml/generate`,
    UML_BASE: `${API_BASE_URL}/uml`,
    DOCUMENTATION: `${API_BASE_URL}/documentation/generate`,
    DOCUMENTATION_ASYNC: `${API_BASE_URL}/documentation/generate`,
    HIGH_LEVEL_DOCS: `${API_BASE_URL}/documentation/high-level`,
    LOW_LEVEL_DOCS: `${API_BASE_URL}/documentation/low-level`,
    IAC: `${API_BASE_URL}/iac`,
    APP_CODE: `${API_BASE_URL}/code`,
    ASYNC_STATUS: (jobId: string, projectId: string) => `${API_BASE_URL}/documentation/status/${jobId}?projectId=${projectId}`,
    ASYNC_RESULT: (jobId: string) => `${API_BASE_URL}/documentation/result/${jobId}`,
  },
  // Deployment endpoint
  DEPLOY: `${API_BASE_URL}/deploy`,
}

// Diagram types mapping
export const DIAGRAM_TYPES = {
  CLASS: "class",
  SEQUENCE: "sequence",
  ARCHITECTURE: "architecture",
  COMPONENT: "component",
}

// Request timeout in milliseconds (increased from 30s to 3 minutes)
export const REQUEST_TIMEOUT = 180000

// Polling interval for async tasks (in milliseconds)
export const POLLING_INTERVAL = 3000

// Maximum polling attempts before giving up
export const MAX_POLLING_ATTEMPTS = 60 // 3 minutes with 3s interval

// Rate limit settings
export const RATE_LIMIT = {
  MAX_REQUESTS: 100,
  WINDOW_MINUTES: 15,
}

// Helper function to check if an API endpoint is available
export async function isEndpointAvailable(endpoint: string): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    const response = await fetch(endpoint, {
      method: "HEAD",
      signal: controller.signal,
      cache: "no-cache",
    })

    clearTimeout(timeoutId)
    return response.ok
  } catch (error) {
    console.error(`Endpoint ${endpoint} is not available:`, error)
    return false
  }
}
