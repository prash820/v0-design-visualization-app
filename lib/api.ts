import { getSession } from "next-auth/react"

interface ApiOptions extends RequestInit {
  requireAuth?: boolean
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { requireAuth = true, ...fetchOptions } = options
  const headers = new Headers({
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  })

  // Add auth token if required
  if (requireAuth) {
    const session = await getSession()
    if (!session?.backendToken) {
      throw new Error('Authentication required')
    }
    headers.set('Authorization', `Bearer ${session.backendToken}`)
  }

  const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }))
    throw new Error(error.error || 'An error occurred')
  }

  return response.json()
}

// Example API functions
export const projectsApi = {
  getAll: () => api('/api/projects'),
  getOne: (id: string) => api(`/api/projects/${id}`),
  create: (data: { name: string; description?: string }) => 
    api('/api/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; description?: string }) =>
    api(`/api/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    api(`/api/projects/${id}`, { method: 'DELETE' }),
} 