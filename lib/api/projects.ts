import { apiClient, ApiError } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/config"
import type { Project } from "@/lib/types"

export interface CreateProjectRequest {
  name: string
  description?: string
  prompt?: string
}

export interface UpdateProjectRequest {
  name?: string
  description?: string
}

export interface ProjectStateUpdate {
  prompt?: string
  lastCode?: string
  diagramType?: string
  design?: string
}

export async function getProjects(): Promise<Project[]> {
  try {
    const response = await apiClient.get<Project[]>(API_ENDPOINTS.PROJECTS.BASE)
    // Ensure we always return an array
    return Array.isArray(response) ? response : []
  } catch (error) {
    console.error("Error fetching projects:", error)
    // Return empty array on error
    return []
  }
}

export async function getProjectById(id: string): Promise<Project> {
  try {
    // Check if the ID is valid
    if (!id || id === "undefined") {
      throw new ApiError("Invalid project ID", 400)
    }

    return await apiClient.get<Project>(API_ENDPOINTS.PROJECTS.DETAIL(id))
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error)
    throw error instanceof ApiError ? error : new ApiError(`Failed to fetch project: ${error instanceof Error ? error.message : 'Unknown error'}`, 500)
  }
}

export async function createProject(project: CreateProjectRequest): Promise<Project> {
  try {
    const response = await apiClient.post<any>(API_ENDPOINTS.PROJECTS.BASE, project)

    // Log the raw response
    console.log("Create project response:", response)

    // Check if the response has a nested project property
    const projectData = response.project || response

    // Log the extracted project data
    console.log("Extracted project data:", projectData)

    // Ensure we have an ID field (either id or _id)
    const projectWithId: Project = {
      ...projectData,
      // If id is missing but _id exists, use _id as id
      id: projectData.id || projectData._id,
    }

    // Log the processed project
    console.log("Processed project with ID:", projectWithId)

    if (!projectWithId.id) {
      console.error("Project created but no ID found in response:", response)
      throw new Error("Project created but no ID was returned from the server")
    }

    return projectWithId
  } catch (error) {
    console.error("Error creating project:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to create project", 500)
  }
}

export async function updateProject(id: string, project: UpdateProjectRequest): Promise<Project> {
  try {
    const response = await apiClient.put<any>(API_ENDPOINTS.PROJECTS.DETAIL(id), project)
    // Check if the response has a nested project property
    return response.project || response
  } catch (error) {
    console.error(`Error updating project ${id}:`, error)
    throw error instanceof ApiError ? error : new ApiError("Failed to update project", 500)
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.PROJECTS.DETAIL(id))
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error)
    throw error instanceof ApiError ? error : new ApiError("Failed to delete project", 500)
  }
}

// Maximum number of retries for updateProjectState
const MAX_RETRIES = 2
const RETRY_DELAY = 1000 // 1 second

export async function updateProjectState(id: string, state: ProjectStateUpdate): Promise<Project | null> {
  let retries = 0

  // Check if we're offline first
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    console.log("Device is offline, skipping project state update")
    return null
  }

  while (retries <= MAX_RETRIES) {
    try {
      // Log the request details
      console.log(`Updating project state for ID: ${id}`, state)

      // Validate the endpoint
      const endpoint = API_ENDPOINTS.PROJECTS.STATE(id)
      console.log(`Using endpoint: ${endpoint}`)

      if (!endpoint.includes(id)) {
        throw new Error(`Invalid endpoint for project state update: ${endpoint}`)
      }

      // Make the API request
      const response = await apiClient.patch<any>(endpoint, state)

      // Log the response
      console.log(`Project state update response:`, response)

      // Check if the response has a nested project property
      return response.project || response
    } catch (error) {
      retries++
      console.error(`Error updating project state ${id} (attempt ${retries}/${MAX_RETRIES + 1}):`, error)

      // Add more detailed error information
      if (error instanceof TypeError && error.message.includes("fetch")) {
        console.error(`Network error when updating project state. Endpoint: ${API_ENDPOINTS.PROJECTS.STATE(id)}`)
      }

      // If we've reached max retries, return null instead of throwing
      if (retries > MAX_RETRIES) {
        console.log("Max retries reached for project state update, continuing without state update")
        return null
      }

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
    }
  }

  return null
}
