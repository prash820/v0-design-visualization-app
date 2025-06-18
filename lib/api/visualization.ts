import { apiClient, ApiError } from "@/lib/api/client"
import { API_ENDPOINTS, POLLING_INTERVAL, MAX_POLLING_ATTEMPTS } from "@/lib/config"
import type { UMLDiagram } from "@/lib/types"

export interface GenerateDiagramRequest {
  prompt: string
  diagramType: string
}

export interface GenerateAllDiagramsRequest {
  prompt: string
  projectId?: string
}

export interface GenerateDocumentationRequest {
  prompt: string
  projectId?: string
  umlDiagrams?: Record<string, string>
}

export interface GenerateIaCRequest {
  prompt: string
  projectId: string
  umlDiagrams?: Record<string, string>
  documentation?: string
  async?: boolean
}

export interface DeployRequest {
  code: string
  projectId?: string
}

export interface AsyncJobResponse {
  jobId: string
  status: "pending" | "processing" | "completed" | "failed"
  result?: any
  error?: string
  progress?: number
}

export interface GenerateIaCResponse {
  code: string
  documentation: string
}

export interface GenerateAppCodeRequest {
  prompt: string;
  projectId: string;
  umlDiagrams: Record<string, string>;
}

export interface AppCodeResponse {
  frontend: {
    components: Record<string, string>;
    pages: Record<string, string>;
    utils: Record<string, string>;
  };
  backend: {
    controllers: Record<string, string>;
    models: Record<string, string>;
    routes: Record<string, string>;
    utils: Record<string, string>;
  };
  documentation: string;
}

// Maximum number of retries for network requests
const MAX_NETWORK_RETRIES = 2
const NETWORK_RETRY_DELAY = 1000 // 1 second

// Generate a single diagram using the AI service
export async function generateDiagram(params: GenerateDiagramRequest): Promise<UMLDiagram> {
  try {
    // Map frontend diagram type to backend diagram type
    const backendDiagramType = mapDiagramType(params.diagramType)

    return await apiClient.post<UMLDiagram>(API_ENDPOINTS.GENERATE.DIAGRAM, {
      prompt: params.prompt,
      diagramType: backendDiagramType,
    })
  } catch (error) {
    console.error("Error generating diagram:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to generate diagram", 500)
  }
}

// Generate all UML diagrams at once with a single API call
export async function generateAllDiagrams(params: GenerateAllDiagramsRequest): Promise<UMLDiagram> {
  try {
    console.log("Generating all diagrams with prompt:", params.prompt)

    // Make a single API call to generate all diagrams
    const response = await apiClient.post<UMLDiagram>(API_ENDPOINTS.GENERATE.UML, {
      prompt: params.prompt,
      projectId: params.projectId,
      generateAll: true, // Signal to backend that we want all diagram types
    })

    console.log("All diagrams response:", response)

    return response
  } catch (error) {
    console.error("Error generating all diagrams:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to generate all diagrams", 500)
  }
}

// Generate UML diagram specifically
export async function generateUML({
  projectId,
  prompt,
  diagramType,
}: {
  projectId?: string
  prompt: string
  diagramType: string
}): Promise<UMLDiagram> {
  try {
    // Map frontend diagram type to backend diagram type
    const backendDiagramType = mapDiagramType(diagramType)

    return await apiClient.post<UMLDiagram>(API_ENDPOINTS.GENERATE.UML, {
      projectId,
      prompt,
      diagramType: backendDiagramType,
    })
  } catch (error) {
    console.error("Error generating UML diagram:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to generate UML diagram", 500)
  }
}

// Generate documentation
export async function generateDocumentation({
  projectId,
  prompt,
  umlDiagrams,
}: GenerateDocumentationRequest): Promise<{ content: string }> {
  try {
    // First try the API endpoint
    try {
      return await apiClient.post<{ content: string }>(API_ENDPOINTS.GENERATE.DOCUMENTATION, {
        projectId,
        prompt,
        umlDiagrams,
      })
    } catch (error) {
      console.error("Error with API documentation generation, falling back to mock:", error)
      // If the API fails, fall back to the mock generator
      return generateMockDocumentation(prompt, projectId)
    }
  } catch (error) {
    console.error("Error generating documentation:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to generate documentation", 500)
  }
}

// Check if we're offline
function isOffline(): boolean {
  return typeof navigator !== "undefined" && !navigator.onLine
}

// Update the generateDocumentationAsync function to use the correct endpoint and handle the response format
export async function generateDocumentationAsync({
  projectId,
  prompt,
  umlDiagrams,
}: GenerateDocumentationRequest): Promise<{ jobId: string }> {
  try {
    console.log("Starting async documentation generation with prompt:", prompt)

    // Validate that prompt exists and is not empty
    if (!prompt || prompt.trim() === "") {
      throw new Error("Prompt is required for documentation generation")
    }

    // Check if we're offline first
    if (isOffline()) {
      console.log("Device is offline, using offline mode")
      return createOfflineJob(prompt, projectId)
    }

    // Prepare the request payload according to the API documentation
    const payload = {
      prompt: prompt.trim(), // Ensure prompt is trimmed
      projectId,
      umlDiagrams: umlDiagrams || {},
      async: true, // Add a flag to indicate this should be processed asynchronously
    }

    console.log("Documentation request payload:", payload)

    // Implement retry logic for network errors
    let retries = 0
    let lastError: Error | null = null

    while (retries <= MAX_NETWORK_RETRIES) {
      try {
        // Make the API request with proper error handling
        const response = await fetch(API_ENDPOINTS.GENERATE.DOCUMENTATION_ASYNC, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Add authorization header if available
            ...(typeof localStorage !== "undefined" && localStorage.getItem("token")
              ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
              : {}),
          },
          body: JSON.stringify(payload),
        })

        // Check if the response is OK
        if (!response.ok) {
          const errorText = await response.text()
          console.error("Error response from documentation API:", errorText)
          throw new Error(`API returned ${response.status}: ${errorText}`)
        }

        // Get the raw text response for debugging
        const responseText = await response.text()
        console.log("Raw API response:", responseText)

        // Try to extract valid JSON from the response
        let responseData
        try {
          // First attempt: Try to parse the entire response as JSON
          responseData = JSON.parse(responseText)
          console.log("Successfully parsed JSON response:", responseData)
        } catch (parseError) {
          console.error("Error parsing full JSON response:", parseError)

          // Second attempt: Check if there are multiple JSON objects concatenated
          if (responseText.includes("}{")) {
            console.log("Detected multiple concatenated JSON objects")

            // Split the response at each closing brace followed by an opening brace
            const jsonParts = responseText.split(/(?<=\})(?=\{)/)
            console.log(`Split into ${jsonParts.length} JSON parts`)

            // Try to parse each part and use the last valid one (usually contains the complete data)
            for (let i = jsonParts.length - 1; i >= 0; i--) {
              try {
                const part = jsonParts[i]
                const parsedPart = JSON.parse(part)
                console.log(`Successfully parsed JSON part ${i}:`, parsedPart)

                // Use this part if it has the data we need
                if (parsedPart.data || parsedPart.jobId || parsedPart.id || parsedPart._id) {
                  responseData = parsedPart
                  console.log("Using this part as the response data")
                  break
                }

                // If we have a "status" field with "complete" or "processing", this is likely the response we want
                if (parsedPart.status === "complete" || parsedPart.status === "processing") {
                  responseData = parsedPart
                  console.log("Using this part as the response data (based on status field)")
                  break
                }
              } catch (partError) {
                console.error(`Error parsing JSON part ${i}:`, partError)
              }
            }
          }

          // If we still don't have valid data, throw an error
          if (!responseData) {
            throw new Error("Failed to parse API response as JSON")
          }
        }

        // Check if the response has the expected format with jobId
        if (!responseData.jobId && !responseData.id && !responseData._id) {
          // Check for alternative field names that might contain the job ID
          const possibleJobIdFields = ["id", "job_id", "jobID", "job", "taskId", "task_id", "documentationId"]

          for (const field of possibleJobIdFields) {
            if (responseData[field]) {
              console.log(`Found alternative jobId field: ${field} with value:`, responseData[field])
              return { jobId: responseData[field] }
            }
          }

          // If we still don't have a jobId, create a fallback
          console.error("API response missing jobId and no alternative fields found:", responseData)

          // Create a fallback job ID
          const fallbackJobId = `fallback-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

          // Store the mock job in localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(
              `mock-job-${fallbackJobId}`,
              JSON.stringify({
                status: "pending",
                createdAt: Date.now(),
              }),
            )

            // Simulate async processing
            setTimeout(() => {
              const mockDoc = generateMockDocumentation(prompt || "System Documentation", projectId)
              localStorage.setItem(
                `mock-job-${fallbackJobId}`,
                JSON.stringify({
                  status: "completed",
                  result: mockDoc,
                  completedAt: Date.now(),
                }),
              )
            }, 3000)
          }

          return { jobId: fallbackJobId }
        }

        // If we still don't have a jobId, but we have a "status" field, create a mock job with the data
        if (!responseData.jobId && !responseData.id && !responseData._id && responseData.status) {
          console.log("Response has status but no jobId, creating a mock job with the data:", responseData)

          // Create a mock job ID with a timestamp to ensure uniqueness
          const mockJobId = `data-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`

          // Store the data in localStorage to simulate async behavior
          if (typeof window !== "undefined") {
            // If the status is already "complete", store it as a completed job
            if (responseData.status === "complete") {
              localStorage.setItem(
                `mock-job-${mockJobId}`,
                JSON.stringify({
                  status: "completed",
                  result: responseData.data || responseData,
                  completedAt: Date.now(),
                }),
              )
            } else {
              // Otherwise, store it as a pending job and simulate completion
              localStorage.setItem(
                `mock-job-${mockJobId}`,
                JSON.stringify({
                  status: "pending",
                  createdAt: Date.now(),
                  data: responseData.data || responseData,
                }),
              )

              // Simulate async processing
              setTimeout(() => {
                localStorage.setItem(
                  `mock-job-${mockJobId}`,
                  JSON.stringify({
                    status: "completed",
                    result: responseData.data || responseData,
                    completedAt: Date.now(),
                  }),
                )
              }, 2000)
            }
          }

          return { jobId: mockJobId }
        }

        // Return the jobId, checking all possible field names
        return { jobId: responseData.jobId || responseData.id || responseData._id }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))

        // Check if it's a network error
        const isNetworkError =
          error instanceof TypeError &&
          (error.message.includes("Failed to fetch") ||
            error.message.includes("NetworkError") ||
            error.message.includes("Network request failed"))

        if (isNetworkError) {
          console.log(`Network error detected (attempt ${retries + 1}/${MAX_NETWORK_RETRIES + 1}):`, error.message)

          // If we've reached max retries, use offline mode
          if (retries >= MAX_NETWORK_RETRIES) {
            console.log("Max retries reached, using offline mode")
            return createOfflineJob(prompt, projectId)
          }

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, NETWORK_RETRY_DELAY))
          retries++
        } else {
          // If it's not a network error, don't retry
          break
        }
      }
    }

    // If we get here, we've either exhausted retries or encountered a non-network error
    console.error("Error with async documentation generation, creating mock job:", lastError)

    // Create a mock job ID with timestamp to ensure uniqueness
    return createOfflineJob(prompt, projectId)
  } catch (error) {
    console.error("Error starting async documentation generation:", error)

    // Create a mock job ID for recovery
    const recoveryJobId = `recovery-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    console.log("Created recovery jobId after error:", recoveryJobId)

    // Store the mock job in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(
        `mock-job-${recoveryJobId}`,
        JSON.stringify({
          status: "pending",
          createdAt: Date.now(),
        }),
      )

      // Simulate async processing with a recovery message
      setTimeout(() => {
        const errorMessage = error instanceof Error ? error.message : String(error)
        const mockDoc = {
          content: `# Documentation Generation Recovery

## Error Information

An error occurred during documentation generation:

\`\`\`
${errorMessage}
\`\`\`

## System Documentation

This is a fallback documentation generated after an error occurred. When the system is working correctly, this would contain detailed documentation based on your diagrams.

## Troubleshooting

- Check your network connection
- Verify that your diagrams contain valid data
- Try regenerating the documentation
- Contact support if the issue persists`,
        }

        localStorage.setItem(
          `mock-job-${recoveryJobId}`,
          JSON.stringify({
            status: "completed",
            result: mockDoc,
            completedAt: Date.now(),
          }),
        )
      }, 3000)
    }

    return { jobId: recoveryJobId }
  }
}

// Helper function to create an offline job
function createOfflineJob(prompt: string, projectId?: string): { jobId: string } {
  const offlineJobId = `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
  console.log("Created offline jobId:", offlineJobId)

  // Store the mock job in localStorage to simulate async behavior
  if (typeof window !== "undefined") {
    localStorage.setItem(
      `mock-job-${offlineJobId}`,
      JSON.stringify({
        status: "pending",
        createdAt: Date.now(),
      }),
    )

    // Simulate async processing
    setTimeout(() => {
      const mockDoc = generateMockDocumentation(prompt || "System Documentation", projectId)
      localStorage.setItem(
        `mock-job-${offlineJobId}`,
        JSON.stringify({
          status: "completed",
          result: {
            content: `# ${prompt || "System"} Documentation (Offline Mode)

*Generated while offline*

${mockDoc.content.split("\n").slice(2).join("\n")}

> Note: This documentation was generated in offline mode. Some features may be limited until your connection is restored.`,
          },
          completedAt: Date.now(),
        }),
      )
    }, 2000)
  }

  return { jobId: offlineJobId }
}

// Update the checkAsyncJobStatus function to use the correct endpoint
export async function checkAsyncJobStatus(jobId: string, projectId?: string): Promise<AsyncJobResponse> {
  try {
    const response = await apiClient.get<AsyncJobResponse>(API_ENDPOINTS.GENERATE.ASYNC_STATUS(jobId, projectId || ''));
    return response;
  } catch (error) {
    console.error("Error checking job status:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to check job status", 500);
  }
}

// Get the result of a completed async job
export async function getAsyncJobResult(jobId: string): Promise<any> {
  try {
    // Check if this is a mock job (including fallback, recovery, and offline jobs)
    if (
      (jobId.startsWith("mock-") ||
        jobId.startsWith("fallback-") ||
        jobId.startsWith("recovery-") ||
        jobId.startsWith("offline-")) &&
      typeof window !== "undefined"
    ) {
      const mockJobData = localStorage.getItem(`mock-job-${jobId}`)
      if (mockJobData) {
        const parsedData = JSON.parse(mockJobData)
        if (parsedData.status === "completed" && parsedData.result) {
          return parsedData.result
        }

        // If the job is not completed yet, return a pending message
        return {
          content:
            "# Documentation Generation In Progress\n\nYour documentation is still being generated. Please wait a moment and try again.",
        }
      }

      // If we don't have data for this mock job, return a fallback message
      return {
        content: "# Documentation Fallback\n\nUnable to retrieve the documentation. This is a fallback message.",
      }
    }

    // Check if we're offline
    if (isOffline()) {
      console.log("Device is offline, using offline result for job:", jobId)
      return {
        content: `# Documentation (Offline Mode)\n\nYou are currently offline. This is a placeholder documentation.\n\nWhen your connection is restored, you'll be able to access the full documentation.\n\n## Offline Features\n\n- You can still view and edit your diagrams\n- Changes will be synchronized when you're back online\n- You can create new projects and save them locally`,
      }
    }

    // Otherwise, try the real API
    try {
      const response = await fetch(API_ENDPOINTS.GENERATE.ASYNC_RESULT(jobId), {
        headers: {
          // Add authorization header if available
          ...(typeof localStorage !== "undefined" && localStorage.getItem("token")
            ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
            : {}),
        },
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error getting job result for ${jobId}:`, errorText)

        // If we get a 404, the job might not exist or might have been removed
        if (response.status === 404) {
          return {
            content: `# Documentation Not Found\n\nThe documentation job (ID: ${jobId}) could not be found. It may have expired or been removed.`,
          }
        }

        throw new Error(`API returned ${response.status}: ${errorText}`)
      }

      // Parse the response as JSON
      const responseData = await response.json()
      console.log(`Result response for job ${jobId}:`, responseData)

      // Check if the response has the expected format with a result field
      if (responseData.result) {
        // Convert the complex result structure to a simple content string for our UI
        return {
          content: convertDesignDocumentToMarkdown(responseData.result),
        }
      }

      // If the response doesn't have the expected format, return it as is
      return responseData
    } catch (error: unknown) {
      console.error(`Error getting job result for ${jobId}:`, error)

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        console.log("Network error when getting job result, using offline mode")
        return {
          content: `# Documentation (Offline Mode)\n\nYou are currently offline and cannot retrieve the documentation from the server.\n\nPlease check your internet connection and try again when you're back online.`,
        }
      }

      // Return a fallback response
      return {
        content: `# Documentation Error

An error occurred while retrieving the documentation: ${error instanceof Error ? error.message : String(error)}

Please try regenerating the documentation.`,
      }
    }
  } catch (error) {
    console.error(`Error getting job result for ${jobId}:`, error)

    // Return a safe fallback
    return {
      content:
        "# Documentation Error\n\nAn unexpected error occurred while retrieving the documentation. Please try regenerating the documentation.",
    }
  }
}

// Helper function to convert the complex design document to markdown
function convertDesignDocumentToMarkdown(designDoc: any): string {
  if (!designDoc) return "# No documentation available"

  try {
    let markdown = ""

    // Add metadata and title
    if (designDoc.metadata && designDoc.metadata.title) {
      markdown += `# ${designDoc.metadata.title}\n\n`
    } else {
      markdown += "# System Documentation\n\n"
    }

    // Add metadata information
    if (designDoc.metadata) {
      markdown += "## Document Information\n\n"

      if (designDoc.metadata.authors && designDoc.metadata.authors.length > 0) {
        markdown += `**Authors:** ${designDoc.metadata.authors.join(", ")}\n\n`
      }

      if (designDoc.metadata.date_created) {
        markdown += `**Created:** ${designDoc.metadata.date_created}\n\n`
      }

      if (designDoc.metadata.date_updated) {
        markdown += `**Updated:** ${designDoc.metadata.date_updated}\n\n`
      }

      if (designDoc.metadata.version) {
        markdown += `**Version:** ${designDoc.metadata.version}\n\n`
      }

      if (designDoc.metadata.status) {
        markdown += `**Status:** ${designDoc.metadata.status}\n\n`
      }
    }

    // Add executive summary
    if (designDoc.executive_summary) {
      markdown += "## Executive Summary\n\n"
      markdown += `${designDoc.executive_summary}\n\n`
    }

    // Add goals
    if (designDoc.goals) {
      markdown += "## Goals\n\n"

      if (designDoc.goals.goals_list && designDoc.goals.goals_list.length > 0) {
        markdown += "### Goals\n\n"
        designDoc.goals.goals_list.forEach((goal: string) => {
          markdown += `- ${goal}\n`
        })
        markdown += "\n"
      }

      if (designDoc.goals.non_goals_list && designDoc.goals.non_goals_list.length > 0) {
        markdown += "### Non-Goals\n\n"
        designDoc.goals.non_goals_list.forEach((nonGoal: string) => {
          markdown += `- ${nonGoal}\n`
        })
        markdown += "\n"
      }
    }

    // Add background context
    if (designDoc.background_context) {
      markdown += "## Background Context\n\n"
      markdown += `${designDoc.background_context}\n\n`
    }

    // Add requirements
    if (designDoc.requirements) {
      markdown += "## Requirements\n\n"

      if (designDoc.requirements.functional && designDoc.requirements.functional.length > 0) {
        markdown += "### Functional Requirements\n\n"
        designDoc.requirements.functional.forEach((req: string) => {
          markdown += `- ${req}\n`
        })
        markdown += "\n"
      }

      if (designDoc.requirements.non_functional && designDoc.requirements.non_functional.length > 0) {
        markdown += "### Non-Functional Requirements\n\n"
        designDoc.requirements.non_functional.forEach((req: string) => {
          markdown += `- ${req}\n`
        })
        markdown += "\n"
      }
    }

    // Add proposed architecture
    if (designDoc.proposed_architecture) {
      markdown += "## Proposed Architecture\n\n"

      if (designDoc.proposed_architecture.high_level_architecture_diagram) {
        markdown += "### High-Level Architecture\n\n"
        markdown += `${designDoc.proposed_architecture.high_level_architecture_diagram}\n\n`
      }

      if (designDoc.proposed_architecture.components && designDoc.proposed_architecture.components.length > 0) {
        markdown += "### Components\n\n"
        designDoc.proposed_architecture.components.forEach((component: any) => {
          markdown += `#### ${component.name}\n\n`
          if (component.purpose) markdown += `**Purpose:** ${component.purpose}\n\n`
          if (component.responsibility) markdown += `**Responsibility:** ${component.responsibility}\n\n`
        })
      }

      if (designDoc.proposed_architecture.data_models && designDoc.proposed_architecture.data_models.length > 0) {
        markdown += "### Data Models\n\n"
        designDoc.proposed_architecture.data_models.forEach((model: any) => {
          markdown += `#### ${model.name}\n\n`
          if (model.description) markdown += `${model.description}\n\n`
          if (model.fields && model.fields.length > 0) {
            markdown += "**Fields:**\n\n"
            model.fields.forEach((field: string) => {
              markdown += `- ${field}\n`
            })
            markdown += "\n"
          }
        })
      }
    }

    // Add detailed design
    if (designDoc.detailed_design) {
      markdown += "## Detailed Design\n\n"

      if (designDoc.detailed_design.sequence_diagrams && designDoc.detailed_design.sequence_diagrams.length > 0) {
        markdown += "### Sequence Diagrams\n\n"
        designDoc.detailed_design.sequence_diagrams.forEach((diagram: any) => {
          markdown += `#### ${diagram.name}\n\n`
          if (diagram.description) markdown += `${diagram.description}\n\n`
        })
      }

      if (designDoc.detailed_design.modules_classes && designDoc.detailed_design.modules_classes.length > 0) {
        markdown += "### Modules and Classes\n\n"
        designDoc.detailed_design.modules_classes.forEach((module: any) => {
          markdown += `#### ${module.name}\n\n`
          if (module.purpose) markdown += `**Purpose:** ${module.purpose}\n\n`
          if (module.responsibilities && module.responsibilities.length > 0) {
            markdown += "**Responsibilities:**\n\n"
            module.responsibilities.forEach((resp: string) => {
              markdown += `- ${resp}\n`
            })
            markdown += "\n"
          }
        })
      }
    }

    // Add API contracts
    if (designDoc.api_contracts) {
      markdown += "## API Contracts\n\n"

      if (designDoc.api_contracts.api_type) {
        markdown += `**API Type:** ${designDoc.api_contracts.api_type}\n\n`
      }

      if (designDoc.api_contracts.endpoints && designDoc.api_contracts.endpoints.length > 0) {
        markdown += "### Endpoints\n\n"
        designDoc.api_contracts.endpoints.forEach((endpoint: any) => {
          markdown += `#### ${endpoint.method} ${endpoint.path}\n\n`
          if (endpoint.description) markdown += `${endpoint.description}\n\n`
          if (endpoint.request_format)
            markdown += `**Request Format:**\n\`\`\`json\n${endpoint.request_format}\n\`\`\`\n\n`
          if (endpoint.response_format)
            markdown += `**Response Format:**\n\`\`\`json\n${endpoint.response_format}\n\`\`\`\n\n`
        })
      }
    }

    // Add security considerations
    if (designDoc.security_considerations) {
      markdown += "## Security Considerations\n\n"

      if (designDoc.security_considerations.threat_model) {
        markdown += `### Threat Model\n\n${designDoc.security_considerations.threat_model}\n\n`
      }

      if (designDoc.security_considerations.encryption) {
        markdown += "### Encryption\n\n"
        if (designDoc.security_considerations.encryption.at_rest) {
          markdown += `**At Rest:** ${designDoc.security_considerations.encryption.at_rest}\n\n`
        }
        if (designDoc.security_considerations.encryption.in_transit) {
          markdown += `**In Transit:** ${designDoc.security_considerations.encryption.in_transit}\n\n`
        }
      }

      if (designDoc.security_considerations.authentication_authorization) {
        markdown += `### Authentication & Authorization\n\n${designDoc.security_considerations.authentication_authorization}\n\n`
      }
    }

    // Add risks and tradeoffs
    if (designDoc.risks_tradeoffs && designDoc.risks_tradeoffs.length > 0) {
      markdown += "## Risks and Tradeoffs\n\n"
      designDoc.risks_tradeoffs.forEach((item: any, index: number) => {
        markdown += `### Risk ${index + 1}: ${item.risk}\n\n`
        if (item.mitigation) markdown += `**Mitigation:** ${item.mitigation}\n\n`
        if (item.tradeoff) markdown += `**Tradeoff:** ${item.tradeoff}\n\n`
      })
    }

    // Add alternatives considered
    if (designDoc.alternatives_considered && designDoc.alternatives_considered.length > 0) {
      markdown += "## Alternatives Considered\n\n"
      designDoc.alternatives_considered.forEach((alt: any, index: number) => {
        markdown += `### Alternative ${index + 1}: ${alt.alternative}\n\n`

        if (alt.pros && alt.pros.length > 0) {
          markdown += "**Pros:**\n\n"
          alt.pros.forEach((pro: string) => {
            markdown += `- ${pro}\n`
          })
          markdown += "\n"
        }

        if (alt.cons && alt.cons.length > 0) {
          markdown += "**Cons:**\n\n"
          alt.cons.forEach((con: string) => {
            markdown += `- ${con}\n`
          })
          markdown += "\n"
        }

        if (alt.why_rejected) markdown += `**Why Rejected:** ${alt.why_rejected}\n\n`
      })
    }

    // Add appendix
    if (designDoc.appendix) {
      markdown += "## Appendix\n\n"

      if (designDoc.appendix.external_links && designDoc.appendix.external_links.length > 0) {
        markdown += "### External Links\n\n"
        designDoc.appendix.external_links.forEach((link: string) => {
          markdown += `- ${link}\n`
        })
        markdown += "\n"
      }

      if (designDoc.appendix.terminology && designDoc.appendix.terminology.length > 0) {
        markdown += "### Terminology\n\n"
        designDoc.appendix.terminology.forEach((term: any) => {
          markdown += `**${term.term}:** ${term.definition}\n\n`
        })
      }
    }

    return markdown
  } catch (error) {
    console.error("Error converting design document to markdown:", error)
    return "# Error Converting Documentation\n\nThere was an error converting the documentation to a readable format. Please try regenerating the documentation."
  }
}

// Poll for async job completion
export async function pollForCompletion(
  jobId: string,
  onProgress?: (status: string, progress?: number) => void,
): Promise<any> {
  let attempts = 0

  while (attempts < MAX_POLLING_ATTEMPTS) {
    try {
      const status = await checkAsyncJobStatus(jobId)

      // Call the progress callback if provided
      if (onProgress) {
        onProgress(status.status, status.progress)
      }

      if (status.status === "completed") {
        return await getAsyncJobResult(jobId)
      }

      if (status.status === "failed") {
        throw new ApiError(status.error || "Job failed", 500)
      }

      // Wait before polling again
      await new Promise((resolve) => setTimeout(resolve, POLLING_INTERVAL))
      attempts++
    } catch (error) {
      console.error(`Error polling job ${jobId}:`, error)

      // Check if it's a network error
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        console.log("Network error when polling, using offline mode")

        // If this is a mock job or we're offline, generate mock documentation as fallback
        if (
          jobId.startsWith("mock-") ||
          jobId.startsWith("offline-") ||
          jobId.startsWith("fallback-") ||
          jobId.startsWith("recovery-") ||
          isOffline()
        ) {
          return {
            content: generateMockDocumentationContent("Fallback documentation due to network error"),
          }
        }
      }

      // For other errors, if this is a mock job, generate mock documentation as fallback
      if (
        jobId.startsWith("mock-") ||
        jobId.startsWith("offline-") ||
        jobId.startsWith("fallback-") ||
        jobId.startsWith("recovery-")
      ) {
        return {
          content: generateMockDocumentationContent("Fallback documentation due to polling error"),
        }
      }

      throw error instanceof ApiError ? error : new ApiError("Failed to poll for job completion", 500)
    }
  }

  throw new ApiError("Polling timeout - job is taking too long", 408)
}

// Generate high-level documentation
export async function generateHighLevelDocumentation({
  projectId,
  prompt,
}: GenerateDocumentationRequest): Promise<{ content: string }> {
  try {
    try {
      return await apiClient.post<{ content: string }>(API_ENDPOINTS.GENERATE.HIGH_LEVEL_DOCS, {
        projectId,
        prompt,
      })
    } catch (error) {
      console.error("Error with API high-level documentation generation, falling back to mock:", error)
      return generateMockDocumentation(prompt, projectId, "high-level")
    }
  } catch (error) {
    console.error("Error generating high-level documentation:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to generate high-level documentation", 500)
  }
}

// Generate low-level documentation
export async function generateLowLevelDocumentation({
  projectId,
  prompt,
}: GenerateDocumentationRequest): Promise<{ content: string }> {
  try {
    try {
      return await apiClient.post<{ content: string }>(API_ENDPOINTS.GENERATE.LOW_LEVEL_DOCS, {
        projectId,
        prompt,
      })
    } catch (error) {
      console.error("Error with API low-level documentation generation, falling back to mock:", error)
      return generateMockDocumentation(prompt, projectId, "low-level")
    }
  } catch (error) {
    console.error("Error generating low-level documentation:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to generate low-level documentation", 500)
  }
}

// Generate Infrastructure as Code
export const generateIaC = async (
  request: GenerateIaCRequest
): Promise<{ jobId: string }> => {
  try {
    console.log("Generating IaC with request:", request);
    const response = await apiClient.post<{ jobId: string }>(
      API_ENDPOINTS.GENERATE.IAC,
      request
    );
    console.log("IaC generation response:", response);
    return response;
  } catch (error) {
    console.error("Error generating IaC:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to generate IaC", 500);
  }
};

export const getIaCJobStatus = async (jobId: string): Promise<any> => {
  try {
    return await apiClient.get<any>(`${API_ENDPOINTS.GENERATE.IAC}/status/${jobId}`);
  } catch (error) {
    console.error("Error getting IaC job status:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to get IaC job status", 500);
  }
};

// Deploy infrastructure
export async function deployInfrastructure({ code, projectId }: DeployRequest): Promise<{ status: string }> {
  try {
    return await apiClient.post<{ status: string }>(API_ENDPOINTS.DEPLOY, {
      code,
      projectId,
    })
  } catch (error) {
    console.error("Error deploying infrastructure:", error)
    throw error instanceof ApiError ? error : new ApiError("Failed to deploy infrastructure", 500)
  }
}

// Generate Application Code
export const generateAppCode = async (request: GenerateAppCodeRequest): Promise<AppCodeResponse> => {
  try {
    console.log("Generating application code with request:", request);
    const response = await apiClient.post<AppCodeResponse>(API_ENDPOINTS.GENERATE.APP_CODE, request);
    console.log("Application code generation response:", response);
    return response;
  } catch (error) {
    console.error("Error generating application code:", error);
    throw error instanceof ApiError ? error : new ApiError("Failed to generate application code", 500);
  }
};

const DIAGRAM_TYPES = {
  CLASS: "class",
  SEQUENCE: "sequence",
  ARCHITECTURE: "architecture",
  COMPONENT: "component",
}

// Helper function to map frontend diagram types to backend diagram types
function mapDiagramType(frontendType: string): string {
  const type = frontendType.toLowerCase().replace(/\s+/g, "")

  if (type.includes("class")) return DIAGRAM_TYPES.CLASS
  if (type.includes("sequence")) return DIAGRAM_TYPES.SEQUENCE
  if (type.includes("architecture")) return DIAGRAM_TYPES.ARCHITECTURE
  if (type.includes("component")) return DIAGRAM_TYPES.COMPONENT

  // Default to flowchart if no match
  return DIAGRAM_TYPES.COMPONENT
}

// Mock documentation generator
function generateMockDocumentation(
  prompt: string,
  projectId?: string,
  docType: "general" | "high-level" | "low-level" = "general",
): { content: string } {
  console.log(`Generating mock ${docType} documentation for prompt:`, prompt)

  let title = "System Documentation"
  if (prompt) {
    // Extract a title from the prompt
    const words = prompt.split(" ")
    if (words.length > 3) {
      title = words.slice(0, 3).join(" ") + " System"
    } else {
      title = prompt + " System"
    }
  }

  return {
    content: generateMockDocumentationContent(title, docType),
  }
}

// Generate mock documentation content
function generateMockDocumentationContent(
  title: string,
  docType: "general" | "high-level" | "low-level" = "general",
): string {
  const timestamp = new Date().toISOString().split("T")[0]

  let content = `# ${title}\n\n`
  content += `*Generated on ${timestamp}*\n\n`
  content += `## Overview\n\nThis document provides a ${docType === "high-level" ? "high-level" : docType === "low-level" ? "detailed technical" : "comprehensive"} overview of the system architecture, including its components, relationships, and functionality.\n\n`

  // Add different sections based on doc type
  if (docType === "high-level") {
    content += `## System Purpose\n\nThe system is designed to provide a scalable and maintainable solution for managing data and business processes efficiently. It follows modern architectural patterns to ensure reliability and performance.\n\n`
    content += `## Key Stakeholders\n\n- Business Users\n- System Administrators\n- Technical Support Team\n- Development Team\n\n`
    content += `## Business Goals\n\n- Improve operational efficiency\n- Reduce manual processes\n- Enhance data visibility and reporting\n- Support business growth\n\n`
  } else {
    content += `## System Components\n\n### User Management\n- **User Registration**: New users can register by providing their name, email, and password.\n- **Authentication**: Users can log in using their email and password.\n- **Profile Management**: Users can view and update their profile information.\n\n`
    content += `### Data Processing\n- **Data Import**: The system can import data from various sources.\n- **Data Validation**: Imported data is validated against business rules.\n- **Data Transformation**: Data is transformed into the required format for storage and analysis.\n\n`
    content += `### Reporting\n- **Dashboard**: Users can view key metrics on a customizable dashboard.\n- **Report Generation**: Users can generate reports based on various criteria.\n- **Export Functionality**: Reports can be exported in various formats (PDF, CSV, Excel).\n\n`
  }

  if (docType === "low-level") {
    content += `## Technical Architecture\n\n### Frontend\n- **Framework**: React with TypeScript\n- **State Management**: Redux for global state, React Context for component state\n- **UI Components**: Custom component library with responsive design\n\n`
    content += `### Backend\n- **API Layer**: RESTful API built with Express.js\n- **Business Logic**: Service-oriented architecture with clear separation of concerns\n- **Data Access**: Repository pattern for database interactions\n\n`
    content += `### Database\n- **Primary Database**: PostgreSQL for transactional data\n- **Caching**: Redis for performance optimization\n- **Schema Design**: Normalized schema with appropriate indexes\n\n`
    content += `### Infrastructure\n- **Deployment**: Docker containers orchestrated with Kubernetes\n- **Scaling**: Horizontal scaling for API services\n- **Monitoring**: Prometheus and Grafana for metrics and alerting\n\n`
  }

  content += `## Data Models\n\n### User\n- id: String (unique identifier)\n- name: String\n- email: String (unique)\n- role: String\n- createdAt: Date\n\n`
  content += `### Project\n- id: String (unique identifier)\n- name: String\n- description: String\n- ownerId: String (reference to User)\n- status: String\n- createdAt: Date\n\n`

  if (docType !== "high-level") {
    content += `## System Interactions\n\nThe system follows a client-server architecture with RESTful API communication. The frontend communicates with the backend via HTTP requests, and the backend interacts with the database using a data access layer.\n\n`
    content += `## Security Considerations\n\n- All passwords are hashed before storage.\n- API endpoints are protected with JWT authentication.\n- HTTPS is used for all communications.\n- Input validation is performed on all user inputs.\n\n`
  }

  content += `## Future Enhancements\n\n- Integration with additional third-party services\n- Implementation of a recommendation system\n- Addition of advanced analytics capabilities\n- Support for multiple languages and regions\n\n`

  return content;
}
