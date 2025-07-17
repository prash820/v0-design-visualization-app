import { apiClient, ApiError } from "@/lib/api/client"
import { API_ENDPOINTS } from "@/lib/config"

export interface MagicFlowStartRequest {
  prompt: string
  targetCustomers?: string
  projectId?: string
}

export interface MagicFlowStartResponse {
  jobId: string
  status: string
  phase: string
  message: string
}

export interface ProjectSummary {
  title: string
  description: string
  features: string[]
  techStack: string[]
  estimatedCost: string
  timeline: string
}

export interface MagicConceptStatus {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  phase: string
  progress: number
  analysisResult?: {
    appSummary: {
      name: string
      description: string
      coreValue: string
      keyFeatures: string[]
      userJourney: string
    }
    targetAudience: {
      primaryUsers: string
      userPersonas: string[]
      painPoints: string[]
      useCases: string[]
    }
    technicalOverview: {
      appType: string
      architecture: string
      estimatedComplexity: string
      keyTechnologies: string[]
      dataRequirements: string
      integrations: string[]
    }
    businessModel: {
      revenueModel: string
      marketSize: string
      competitiveAdvantage: string
      mvpFeatures: string[]
    }
    implementationPlan: {
      estimatedTimeline: string
      developmentPhases: string[]
      riskFactors: string[]
      successMetrics: string[]
    }
    recommendation: {
      viability: string
      reasoning: string
      suggestedImprovements: string[]
      nextSteps: string
    }
  }
  startTime?: string
  endTime?: string
  error?: string
}

export interface MagicBuildStatus {
  jobId: string
  status: 'processing' | 'ready_for_provision' | 'completed' | 'failed'
  phase: 'uml_generation' | 'infra_generation' | 'app_generation' | 'infra_provision' | 'completed'
  progress: number
  umlDiagrams?: any
  infraCode?: string
  appCode?: any
  provisioningResult?: any
  startTime?: string
  endTime?: string
  error?: string
}

export interface MagicConfirmRequest {
  jobId: string
  confirmed: boolean
  rejectionReason?: string
  updatedPrompt?: string
  updatedTargetCustomers?: string
}

export interface MagicConfirmResponse {
  conceptJobId?: string
  buildJobId?: string
  originalJobId?: string
  newJobId?: string
  status: 'confirmed' | 'restarted'
  phase: string
  message: string
}

/**
 * Start the magic flow by analyzing the app idea
 */
export async function startMagicFlow(request: MagicFlowStartRequest): Promise<MagicFlowStartResponse> {
  try {
    console.log("Starting magic flow with request:", request)
    
    return await apiClient.post<MagicFlowStartResponse>('/api/magic/start', request)
  } catch (error) {
    console.error("Error starting magic flow:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to start magic flow", 500)
  }
}

/**
 * Get concept analysis status
 */
export async function getConceptStatus(jobId: string): Promise<MagicConceptStatus> {
  try {
    console.log("Getting concept status for job:", jobId)
    
    return await apiClient.get<MagicConceptStatus>(`/api/magic/concept-status/${jobId}`)
  } catch (error) {
    console.error("Error getting concept status:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get concept status", 500)
  }
}

/**
 * Confirm or reject the concept analysis
 */
export async function confirmConcept(request: MagicConfirmRequest): Promise<MagicConfirmResponse> {
  try {
    console.log("Confirming concept with request:", request)
    
    return await apiClient.post<MagicConfirmResponse>('/api/magic/confirm', request)
  } catch (error) {
    console.error("Error confirming concept:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to confirm concept", 500)
  }
}

/**
 * Get build status (UML, Infrastructure, App Code generation)
 */
export async function getBuildStatus(jobId: string): Promise<MagicBuildStatus> {
  try {
    console.log("Getting build status for job:", jobId)
    
    return await apiClient.get<MagicBuildStatus>(`/api/magic/build-status/${jobId}`)
  } catch (error) {
    console.error("Error getting build status:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get build status", 500)
  }
}

/**
 * Provision infrastructure (manual trigger)
 */
export async function provisionInfrastructure(jobId: string): Promise<{ message: string; status: string }> {
  try {
    console.log("Provisioning infrastructure for job:", jobId)
    
    return await apiClient.post<{ message: string; status: string }>(`/api/magic/provision/${jobId}`, {})
  } catch (error) {
    console.error("Error provisioning infrastructure:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to provision infrastructure", 500)
  }
}

/**
 * Check magic flow health
 */
export async function checkMagicHealth(): Promise<{ status: string; message: string }> {
  try {
    return await apiClient.get<{ status: string; message: string }>('/api/magic/health')
  } catch (error) {
    console.error("Error checking magic health:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to check magic health", 500)
  }
}

/**
 * Transform analysis result to project summary format
 */
export function transformToProjectSummary(analysisResult: MagicConceptStatus['analysisResult']): ProjectSummary | null {
  if (!analysisResult) return null
  
  try {
    return {
      title: analysisResult.appSummary?.name || 'Untitled Project',
      description: analysisResult.appSummary?.description || 'No description available',
      features: [
        ...(analysisResult.appSummary?.keyFeatures || []),
        ...(analysisResult.targetAudience?.useCases || [])
      ].slice(0, 5), // Limit to 5 features for display
      techStack: analysisResult.technicalOverview?.keyTechnologies || [],
      estimatedCost: 'To be calculated based on infrastructure',
      timeline: analysisResult.implementationPlan?.estimatedTimeline || 'To be determined'
    }
  } catch (error) {
    console.error('Error transforming analysis result to project summary:', error)
    return {
      title: 'Project Summary',
      description: 'Error loading project details',
      features: [],
      techStack: [],
      estimatedCost: 'To be calculated',
      timeline: 'To be determined'
    }
  }
}

/**
 * Poll concept status until completion
 */
export async function pollConceptStatus(
  jobId: string, 
  onProgress?: (status: MagicConceptStatus) => void,
  maxAttempts: number = 60,
  interval: number = 2000
): Promise<MagicConceptStatus> {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const status = await getConceptStatus(jobId)
      onProgress?.(status)
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    } catch (error) {
      console.error(`Error polling concept status (attempt ${attempts + 1}):`, error)
      
      if (attempts >= maxAttempts - 1) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }
  }
  
  throw new Error(`Concept analysis timeout after ${maxAttempts} attempts`)
}

/**
 * Poll build status until completion
 */
export async function pollBuildStatus(
  jobId: string,
  onProgress?: (status: MagicBuildStatus) => void,
  maxAttempts: number = 120,
  interval: number = 3000
): Promise<MagicBuildStatus> {
  let attempts = 0
  
  while (attempts < maxAttempts) {
    try {
      const status = await getBuildStatus(jobId)
      onProgress?.(status)
      
      if (status.status === 'ready_for_provision' || status.status === 'completed' || status.status === 'failed') {
        return status
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    } catch (error) {
      console.error(`Error polling build status (attempt ${attempts + 1}):`, error)
      
      if (attempts >= maxAttempts - 1) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, interval))
      attempts++
    }
  }
  
  throw new Error(`Build process timeout after ${maxAttempts} attempts`)
} 