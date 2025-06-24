import { apiClient, ApiError } from "@/lib/api/client"
import { API_ENDPOINTS, POLLING_INTERVAL, MAX_POLLING_ATTEMPTS } from "@/lib/config"
import type {
  InfrastructureDeployRequest,
  InfrastructureDeployResponse,
  InfrastructureJobStatus,
  InfrastructureStatus,
  InfrastructureDestroyRequest,
  InfrastructureValidationResponse,
  InfrastructureCostEstimate,
  TerraformOutputsResponse,
  TerraformStateResponse
} from "@/lib/types"

// Maximum number of retries for network requests
const MAX_NETWORK_RETRIES = 2
const NETWORK_RETRY_DELAY = 1000 // 1 second

/**
 * Deploy infrastructure using Terraform
 */
export async function deployInfrastructure(request: InfrastructureDeployRequest): Promise<InfrastructureDeployResponse> {
  try {
    console.log("Deploying infrastructure for project:", request.projectId)
    
    return await apiClient.post<InfrastructureDeployResponse>(API_ENDPOINTS.DEPLOY.BASE, {
      projectId: request.projectId,
      iacCode: request.iacCode,
    })
  } catch (error) {
    console.error("Error deploying infrastructure:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to deploy infrastructure", 500)
  }
}

/**
 * Get deployment job status
 */
export async function getDeploymentJobStatus(jobId: string): Promise<InfrastructureJobStatus> {
  try {
    console.log("Checking deployment job status:", jobId)
    
    return await apiClient.get<InfrastructureJobStatus>(API_ENDPOINTS.DEPLOY.JOB_STATUS(jobId))
  } catch (error) {
    console.error("Error getting deployment job status:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get deployment job status", 500)
  }
}

/**
 * Get infrastructure status for a project
 */
export async function getInfrastructureStatus(projectId: string): Promise<InfrastructureStatus> {
  try {
    console.log("Getting infrastructure status for project:", projectId)
    
    return await apiClient.get<InfrastructureStatus>(API_ENDPOINTS.DEPLOY.INFRASTRUCTURE_STATUS(projectId))
  } catch (error) {
    console.error("Error getting infrastructure status:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get infrastructure status", 500)
  }
}

/**
 * Destroy infrastructure
 */
export async function destroyInfrastructure(request: InfrastructureDestroyRequest): Promise<InfrastructureDeployResponse> {
  try {
    console.log("Destroying infrastructure for project:", request.projectId)
    
    return await apiClient.post<InfrastructureDeployResponse>(API_ENDPOINTS.DEPLOY.DESTROY, {
      projectId: request.projectId,
    })
  } catch (error) {
    console.error("Error destroying infrastructure:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to destroy infrastructure", 500)
  }
}

/**
 * Validate Terraform configuration
 */
export async function validateTerraformConfig(projectId: string): Promise<InfrastructureValidationResponse> {
  try {
    console.log("Validating Terraform configuration for project:", projectId)
    
    return await apiClient.get<InfrastructureValidationResponse>(API_ENDPOINTS.DEPLOY.VALIDATE(projectId))
  } catch (error) {
    console.error("Error validating Terraform configuration:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to validate Terraform configuration", 500)
  }
}

/**
 * Estimate infrastructure costs
 */
export async function estimateInfrastructureCosts(projectId: string): Promise<InfrastructureCostEstimate> {
  try {
    console.log("Estimating costs for project:", projectId)
    
    return await apiClient.get<InfrastructureCostEstimate>(API_ENDPOINTS.DEPLOY.COSTS(projectId))
  } catch (error) {
    console.error("Error estimating infrastructure costs:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to estimate infrastructure costs", 500)
  }
}

/**
 * Get Terraform outputs
 */
export async function getTerraformOutputs(projectId: string): Promise<TerraformOutputsResponse> {
  try {
    console.log("Getting Terraform outputs for project:", projectId)
    
    return await apiClient.get<TerraformOutputsResponse>(API_ENDPOINTS.DEPLOY.OUTPUTS(projectId))
  } catch (error) {
    console.error("Error getting Terraform outputs:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get Terraform outputs", 500)
  }
}

/**
 * Get Terraform state
 */
export async function getTerraformState(projectId: string): Promise<TerraformStateResponse> {
  try {
    console.log("Getting Terraform state for project:", projectId)
    
    return await apiClient.get<TerraformStateResponse>(API_ENDPOINTS.DEPLOY.STATE(projectId))
  } catch (error) {
    console.error("Error getting Terraform state:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get Terraform state", 500)
  }
}

/**
 * Poll for deployment completion
 */
export async function pollDeploymentCompletion(
  jobId: string,
  onProgress?: (status: string, progress?: number) => void,
): Promise<InfrastructureJobStatus> {
  let attempts = 0
  
  while (attempts < MAX_POLLING_ATTEMPTS) {
    try {
      const status = await getDeploymentJobStatus(jobId)
      
      console.log(`Deployment job ${jobId} status:`, status.status, `progress: ${status.progress}%`)
      
      if (onProgress) {
        onProgress(status.status, status.progress)
      }
      
      if (status.status === 'completed' || status.status === 'failed') {
        return status
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL))
      attempts++
      
    } catch (error) {
      console.error(`Error polling deployment status (attempt ${attempts + 1}):`, error)
      attempts++
      
      if (attempts >= MAX_POLLING_ATTEMPTS) {
        throw error
      }
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, NETWORK_RETRY_DELAY))
    }
  }
  
  throw new Error(`Deployment polling timed out after ${MAX_POLLING_ATTEMPTS} attempts`)
}

/**
 * Complete infrastructure deployment workflow
 */
export async function completeInfrastructureDeployment(
  projectId: string,
  iacCode: string,
  onProgress?: (status: string, progress?: number) => void,
): Promise<{
  success: boolean;
  jobId?: string;
  outputs?: any;
  error?: string;
}> {
  try {
    console.log("Starting complete infrastructure deployment workflow")
    
    // Step 1: Validate configuration
    onProgress?.("validating", 10)
    const validation = await validateTerraformConfig(projectId)
    
    if (!validation.valid) {
      return {
        success: false,
        error: `Configuration validation failed: ${validation.errors.join(', ')}`
      }
    }
    
    // Step 2: Deploy infrastructure
    onProgress?.("deploying", 20)
    const deployResponse = await deployInfrastructure({
      projectId,
      iacCode
    })
    
    // Step 3: Poll for completion
    onProgress?.("monitoring", 30)
    const finalStatus = await pollDeploymentCompletion(deployResponse.jobId, onProgress)
    
    if (finalStatus.status === 'completed') {
      // Step 4: Get outputs
      onProgress?.("completed", 100)
      const outputs = await getTerraformOutputs(projectId)
      
      return {
        success: true,
        jobId: deployResponse.jobId,
        outputs: outputs.outputs
      }
    } else {
      return {
        success: false,
        jobId: deployResponse.jobId,
        error: finalStatus.error || 'Deployment failed'
      }
    }
    
  } catch (error) {
    console.error("Infrastructure deployment workflow failed:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Retry failed infrastructure deployment
 */
export async function retryInfrastructureDeployment(projectId: string): Promise<{
  projectId: string;
  message: string;
  newStatus: string;
}> {
  try {
    console.log("Retrying infrastructure deployment for project:", projectId)
    
    return await apiClient.post<{
      projectId: string;
      message: string;
      newStatus: string;
    }>(API_ENDPOINTS.DEPLOY.RETRY, {
      projectId,
    })
  } catch (error) {
    console.error("Error retrying infrastructure deployment:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to retry infrastructure deployment", 500)
  }
}

/**
 * Deploy application code to provisioned infrastructure
 */
export async function deployApplicationCode(projectId: string): Promise<{
  message: string;
  jobId: string;
  status: string;
}> {
  try {
    console.log("Deploying application code for project:", projectId)
    
    return await apiClient.post<{
      message: string;
      jobId: string;
      status: string;
    }>(API_ENDPOINTS.DEPLOY.APP, {
      projectId,
    })
  } catch (error) {
    console.error("Error deploying application code:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to deploy application code", 500)
  }
}

/**
 * Get application deployment status
 */
export async function getApplicationDeploymentStatus(projectId: string): Promise<{
  projectId: string;
  appDeploymentStatus: string;
  appDeploymentJobId: string | null;
  appDeploymentOutputs: {
    apiGatewayUrl: string;
    frontendUrl: string;
    lambdaFunctionName: string;
  } | null;
  infrastructureStatus: string;
  infrastructureOutputs: any;
}> {
  try {
    console.log("Getting application deployment status for project:", projectId)
    
    return await apiClient.get<{
      projectId: string;
      appDeploymentStatus: string;
      appDeploymentJobId: string | null;
      appDeploymentOutputs: {
        apiGatewayUrl: string;
        frontendUrl: string;
        lambdaFunctionName: string;
      } | null;
      infrastructureStatus: string;
      infrastructureOutputs: any;
    }>(API_ENDPOINTS.DEPLOY.APP_STATUS(projectId))
  } catch (error) {
    console.error("Error getting application deployment status:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to get application deployment status", 500)
  }
}

/**
 * Retry application deployment
 */
export async function retryApplicationDeploymentApp(projectId: string): Promise<{
  projectId: string;
  message: string;
  newStatus: string;
  infrastructureStatus: string;
}> {
  try {
    console.log("Retrying application deployment for project:", projectId)
    return await apiClient.post<{
      projectId: string;
      message: string;
      newStatus: string;
      infrastructureStatus: string;
    }>(API_ENDPOINTS.DEPLOY.APP_RETRY, {
      projectId,
    })
  } catch (error) {
    console.error("Error retrying application deployment:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to retry application deployment", 500)
  }
}

export async function purgeApplicationResources(projectId: string): Promise<{
  success: boolean;
  message: string;
  details: {
    projectId: string;
    bucketName: string;
    filesRemoved: number;
    errors: string[];
    bucketEmptied: boolean;
    statusReset: boolean;
  };
}> {
  try {
    console.log("Purging application resources for project:", projectId)
    return await apiClient.post<{
      success: boolean;
      message: string;
      details: {
        projectId: string;
        bucketName: string;
        filesRemoved: number;
        errors: string[];
        bucketEmptied: boolean;
        statusReset: boolean;
      };
    }>(API_ENDPOINTS.DEPLOY.APP_PURGE, {
      projectId,
    })
  } catch (error) {
    console.error("Error purging application resources:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to purge application resources", 500)
  }
} 