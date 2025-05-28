"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Loader2, FileText, Code2, BarChart2, RefreshCw, CheckCircle, AlertCircle, WifiOff } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import DiagramTabs from "@/components/diagram-tabs"
import DocumentationWithTOC from "@/components/documentation-with-toc"
import { getProjectById, updateProjectState } from "@/lib/api/projects"
import {
  generateAllDiagrams,
  generateDocumentation,
  generateDocumentationAsync,
  generateIaC,
} from "@/lib/api/visualization"
import { validateToken } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { Project, UMLDiagram } from "@/lib/types"
import { Progress } from "@/components/ui/progress"
import ConnectionStatus from "@/components/connection-status"

// Define diagram type mapping
const DIAGRAM_TYPE_MAPPING = {
  class: "Class Diagram",
  entity: "ERD Diagram",
  sequence: "Sequence Diagram",
  component: "Component Diagram",
  architecture: "Architecture Diagram",
}

export default function ProjectPageClient({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingDocs, setIsGeneratingDocs] = useState(false)
  const [activeTab, setActiveTab] = useState("diagrams")
  const [projectDiagrams, setProjectDiagrams] = useState<UMLDiagram[]>([])
  const [hasDiagrams, setHasDiagrams] = useState(false)
  const [documentation, setDocumentation] = useState("")
  const [terraformConfig, setTerraformConfig] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [asyncDocJobId, setAsyncDocJobId] = useState<string | null>(null)
  const [asyncStatus, setAsyncStatus] = useState<string | null>(null)
  const [asyncProgress, setAsyncProgress] = useState<number>(0)
  const [isOffline, setIsOffline] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Define diagram types
  const diagramTypes = [
    { id: "class", name: "Class Diagram" },
    { id: "entity", name: "ERD Diagram" },
    { id: "sequence", name: "Sequence Diagram" },
    { id: "component", name: "Component Diagram" },
    { id: "architecture", name: "Architecture Diagram" },
  ]

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false)
      toast({
        title: "Back online",
        description: "Your internet connection has been restored.",
      })
    }

    const handleOffline = () => {
      setIsOffline(true)
      toast({
        title: "You are offline",
        description: "Some features may be limited until your connection is restored.",
        variant: "destructive",
      })
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Set initial state
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [toast])

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const isValid = await validateToken()

        if (!isValid) {
          router.push("/login")
          return
        }

        setIsAuthenticated(true)

        // Validate project ID
        if (!id || id === "undefined") {
          console.error("Invalid project ID:", id)
          setError("Invalid project ID. Please select a valid project.")
          toast({
            title: "Error",
            description: "Invalid project ID. Redirecting to dashboard.",
            variant: "destructive",
          })

          // Set a short timeout before redirecting to allow the toast to be seen
          setTimeout(() => {
            router.push("/dashboard")
          }, 1500)
          return
        }

        // Load project data
        loadProject()
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      }
    }

    checkAuth()
  }, [id, router, toast])

  const loadProject = async () => {
    setIsLoading(true)

    try {
      // Validate project ID again as a safeguard
      if (!id || id === "undefined") {
        throw new Error("Invalid project ID")
      }

      // Log the project ID we're trying to fetch
      console.log("Fetching project with ID:", id)

      const projectData = await getProjectById(id)

      // Log the project data we received
      console.log("Received project data:", projectData)

      if (!projectData) {
        throw new Error("Project not found")
      }

      setProject(projectData)

      if (projectData.lastPrompt) {
        setPrompt(projectData.lastPrompt)
      }

      // If design documentation exists, set it
      if (projectData.design) {
        setDocumentation(projectData.design)
      }

      // Check if the project has UML diagrams
      if (projectData.umlDiagrams) {
        console.log("Project has UML diagrams:", projectData.umlDiagrams)

        // Convert the UML diagrams object to an array of UML diagram objects
        const diagramsArray: UMLDiagram[] = []
        const timestamp = new Date().toISOString()

        // Process each diagram type in the umlDiagrams object
        Object.entries(projectData.umlDiagrams).forEach(([key, value]) => {
          if (value && typeof value === "string") {
            diagramsArray.push({
              id: `diagram-${projectData.id}-${key}-${Date.now()}`,
              projectId: projectData.id,
              diagramType: DIAGRAM_TYPE_MAPPING[key as keyof typeof DIAGRAM_TYPE_MAPPING] || `${key.charAt(0).toUpperCase() + key.slice(1)} Diagram`,
              diagramData: value,
              prompt: projectData.lastPrompt || "",
              createdAt: timestamp,
              updatedAt: timestamp,
            })
          }
        })

        if (diagramsArray.length > 0) {
          setProjectDiagrams(diagramsArray)
          setHasDiagrams(true)
          console.log("Set project diagrams from existing data:", diagramsArray)
        } else {
          // If no valid diagrams were found, initialize empty ones
          const initialDiagrams = initializeDiagrams(id)
          setProjectDiagrams(initialDiagrams)
          setHasDiagrams(false)
        }
      } else {
        // Initialize diagrams if needed
        const initialDiagrams = initializeDiagrams(id)
        setProjectDiagrams(initialDiagrams)
        setHasDiagrams(false)
      }
    } catch (error) {
      console.error("Error loading project:", error)
      setError(error instanceof ApiError ? error.message : "Failed to load project. Please try again.")

      toast({
        title: "Error loading project",
        description: error instanceof ApiError ? error.message : "Failed to load project. Please try again.",
        variant: "destructive",
      })

      // Redirect to dashboard on error after a short delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  // Initialize diagrams for all types
  const initializeDiagrams = (projectId: string): UMLDiagram[] => {
    // Ensure diagramTypes is an array
    if (!Array.isArray(diagramTypes)) {
      console.error("diagramTypes is not an array")
      return []
    }

    return diagramTypes.map((type) => ({
      id: `diagram-${projectId}-${type.id}`,
      projectId: projectId,
      diagramType: type.name || "Unknown Diagram",
      diagramData: "",
      prompt: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))
  }

  // Process the diagrams from the backend response
  const processDiagramResponse = (response: any): UMLDiagram[] => {
    console.log("Processing diagram response:", response)

    // Check if the response has the expected format with diagram types as properties
    const diagramsArray: UMLDiagram[] = []
    const timestamp = new Date().toISOString()
    const projectId = id
    const currentPrompt = response.prompt || prompt

    // Check for the nested diagrams object structure
    if (response.diagrams && typeof response.diagrams === "object" && !Array.isArray(response.diagrams)) {
      console.log("Found nested diagrams object structure")

      // Process each diagram type in the nested diagrams object
      Object.entries(response.diagrams).forEach(([key, value]) => {
        // Skip non-diagram properties
        if (!value || typeof value !== "string" || !DIAGRAM_TYPE_MAPPING[key as keyof typeof DIAGRAM_TYPE_MAPPING]) {
          return
        }

        diagramsArray.push({
          id: `diagram-${projectId}-${key}-${Date.now()}`,
          projectId: projectId,
          diagramType: DIAGRAM_TYPE_MAPPING[key as keyof typeof DIAGRAM_TYPE_MAPPING] || `${key.charAt(0).toUpperCase() + key.slice(1)} Diagram`,
          diagramData: value as string,
          prompt: currentPrompt,
          createdAt: response.createdAt || timestamp,
          updatedAt: response.updatedAt || timestamp,
        })
      })
    }
    // Check for direct properties format
    else if (response.class || response.entity || response.sequence || response.component || response.architecture) {
      console.log("Found diagram data as direct properties")

      // Process each diagram type
      Object.entries(response).forEach(([key, value]) => {
        // Skip non-diagram properties
        if (!value || typeof value !== "string" || !DIAGRAM_TYPE_MAPPING[key as keyof typeof DIAGRAM_TYPE_MAPPING]) {
          return
        }

        diagramsArray.push({
          id: `diagram-${projectId}-${key}-${Date.now()}`,
          projectId: projectId,
          diagramType: DIAGRAM_TYPE_MAPPING[key as keyof typeof DIAGRAM_TYPE_MAPPING] || `${key.charAt(0).toUpperCase() + key.slice(1)} Diagram`,
          diagramData: value as string,
          prompt: currentPrompt,
          createdAt: timestamp,
          updatedAt: timestamp,
        })
      })
    }
    // Check if the response has a diagrams array
    else if (response.diagrams && Array.isArray(response.diagrams)) {
      console.log("Found diagrams array with length:", response.diagrams.length)

      // Map each diagram to the expected format
      response.diagrams.forEach((diagram: any, index: number) => {
        // Determine the diagram type based on the index or any type information in the diagram
        const diagramType =
          diagram.diagramType || (index < diagramTypes.length ? diagramTypes[index].name : "Unknown Diagram")

        diagramsArray.push({
          id: diagram.id || `diagram-${Date.now()}-${index}`,
          projectId: projectId,
          diagramType: diagramType,
          diagramData: diagram.diagramData || "",
          prompt: currentPrompt,
          createdAt: diagram.createdAt || timestamp,
          updatedAt: diagram.updatedAt || timestamp,
        })
      })
    }
    // If no diagrams array or properties, create a single diagram entry if there's diagramData
    else if (response.diagramData) {
      console.log("Found single diagram entry with diagramData")
      diagramsArray.push({
        id: response.id || `diagram-${Date.now()}`,
        projectId: projectId,
        diagramType: response.diagramType || "Class Diagram",
        diagramData: response.diagramData || "",
        prompt: currentPrompt,
        createdAt: response.createdAt || timestamp,
        updatedAt: response.updatedAt || timestamp,
      })
    }

    console.log("Processed diagrams:", diagramsArray)
    return diagramsArray
  }

  // Generate all diagrams with a single API call - Synchronous version
  const handleGenerateDiagrams = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate diagrams.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setActiveTab("diagrams")

    try {
      // Get the project ID, checking both id and _id fields
      const projectId = project?.id

      // Ensure we have a valid project ID
      if (!projectId) {
        throw new Error("Invalid project ID")
      }

      // Try to save the prompt to the project state, but continue even if it fails
      try {
        // Skip state update if we're offline
        if (isOffline) {
          console.log("Device is offline, skipping project state update")
        } else {
          const stateUpdateResult = await updateProjectState(projectId, { lastPrompt: prompt })
          if (stateUpdateResult) {
            console.log("Successfully updated project state with prompt")
          } else {
            console.log("Project state update skipped or failed, continuing with diagram generation")
          }
        }
      } catch (stateError) {
        // Log the error but continue with diagram generation
        console.error("Failed to update project state, continuing with diagram generation:", stateError)
        // Don't show a toast for this error since it's not critical
      }

      // Generate all diagrams with a single API call
      const response = await generateAllDiagrams({
        prompt,
        projectId: id,
      })

      console.log("Generate all diagrams response:", response)

      // Process the response to extract all diagrams
      const processedDiagrams = processDiagramResponse(response)

      console.log("Processed diagrams:", processedDiagrams)

      // Update state with the processed diagrams
      if (Array.isArray(processedDiagrams) && processedDiagrams.length > 0) {
        setProjectDiagrams(processedDiagrams)
        setHasDiagrams(true)
      } else {
        setProjectDiagrams([])
        setHasDiagrams(false)
      }

      toast({
        title: "Diagrams generated",
        description: "All diagrams have been generated successfully. You can now generate documentation.",
      })
    } catch (error) {
      console.error("Error in batch generation:", error)

      // Check if it's a network error
      const isNetworkError =
        error instanceof ApiError &&
        (error.message.includes("Network error") || error.message.includes("Failed to fetch"))

      if (isNetworkError) {
        setIsOffline(true)
        toast({
          title: "Network error",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error generating diagrams",
          description:
            error instanceof ApiError
              ? error.message
              : "There was an error generating your diagrams. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Generate documentation asynchronously
  const handleGenerateDocumentation = async () => {
    if (!hasDiagrams) {
      toast({
        title: "No diagrams available",
        description: "Please generate diagrams first before creating documentation.",
        variant: "destructive",
      })
      return
    }

    // Validate that we have a prompt
    if (!prompt || prompt.trim() === "") {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate documentation.",
        variant: "destructive",
      })
      return
    }

    setIsGeneratingDocs(true)
    setActiveTab("documentation")
    setAsyncStatus("pending")
    setAsyncProgress(0)

    try {
      // Get the project ID
      const projectId = project?.id

      // Ensure we have a valid project ID
      if (!projectId) {
        throw new Error("Invalid project ID")
      }

      // Extract UML diagrams from projectDiagrams
      const umlDiagrams: Record<string, string> = {}

      // Map diagram types to the format expected by the API
      projectDiagrams.forEach((diagram) => {
        if (diagram.diagramData) {
          // Convert diagram type to the key expected by the API
          let diagramKey = ""

          if (diagram.diagramType.toLowerCase().includes("class")) {
            diagramKey = "classDiagram"
          } else if (diagram.diagramType.toLowerCase().includes("sequence")) {
            diagramKey = "sequenceDiagram"
          } else if (diagram.diagramType.toLowerCase().includes("component")) {
            diagramKey = "componentDiagram"
          } else if (diagram.diagramType.toLowerCase().includes("erd")) {
            diagramKey = "entityDiagram"
          } else {
            // Use the diagram type as the key, converted to camelCase
            diagramKey = diagram.diagramType
              .toLowerCase()
              .replace(/\s+(.)/g, (_, c) => c.toUpperCase())
              .replace(/\s+/g, "")
              .replace(/diagram$/i, "Diagram")
          }

          umlDiagrams[diagramKey] = diagram.diagramData
        }
      })

      console.log("UML diagrams for documentation:", umlDiagrams)
      console.log("Using prompt for documentation:", prompt)

      // Check if we're offline
      if (isOffline) {
        // Use mock documentation generation
        console.log("Offline mode: Using mock documentation generation")
        await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate delay

        const mockJobId = `mock-${Date.now()}`
        setAsyncDocJobId(mockJobId)
        setAsyncStatus("processing")

        // Store mock job in localStorage
        if (typeof window !== "undefined") {
          localStorage.setItem(
            `mock-job-${mockJobId}`,
            JSON.stringify({
              status: "pending",
              createdAt: Date.now(),
            }),
          )

          // Simulate async processing
          setTimeout(() => {
            localStorage.setItem(
              `mock-job-${mockJobId}`,
              JSON.stringify({
                status: "completed",
                result: {
                  content: `# ${prompt || "System"} Documentation\n\n*Generated in offline mode*\n\n## Overview\n\nThis is a mock documentation generated while you are offline. When your connection is restored, you'll be able to generate more detailed documentation.\n\n## System Components\n\nBased on the diagrams, the system appears to have several key components that work together to provide functionality.\n\n## Data Models\n\nThe system uses various data models to represent entities and their relationships.\n\n## Future Considerations\n\nWhen your internet connection is restored, you can generate more detailed documentation with AI assistance.`,
                },
                completedAt: Date.now(),
              }),
            )
          }, 3000)
        }

        toast({
          title: "Offline documentation",
          description: "Using offline mode to generate basic documentation.",
        })

        return
      }

      // Try async documentation generation first
      try {
        // Start the async documentation job
        const response = await generateDocumentationAsync({
          projectId: id,
          prompt: prompt.trim(), // Ensure prompt is trimmed
          umlDiagrams,
        })

        console.log("Async documentation job started with ID:", response.jobId)

        // Set the job ID to trigger the polling effect
        setAsyncDocJobId(response.jobId)
        setAsyncStatus("processing")

        toast({
          title: "Documentation generation started",
          description: "Your documentation is being generated. This may take a minute or two.",
        })
      } catch (error) {
        // If async fails, fall back to synchronous
        console.error("Error starting async documentation generation, falling back to synchronous:", error)
        await generateDocumentationSynchronously(projectId, umlDiagrams)
      }
    } catch (error) {
      console.error("Error generating documentation:", error)

      // Check if it's a network error
      const isNetworkError =
        error instanceof ApiError &&
        (error.message.includes("Network error") || error.message.includes("Failed to fetch"))

      if (isNetworkError) {
        setIsOffline(true)
        toast({
          title: "Network error",
          description: "Unable to connect to the server. Using offline mode for basic documentation.",
        })

        // Generate basic offline documentation
        setDocumentation(
          `# ${prompt || "System"} Documentation\n\n*Generated in offline mode*\n\n## Overview\n\nThis is a basic documentation generated while you are offline. When your connection is restored, you'll be able to generate more detailed documentation.\n\n## System Components\n\nBased on the diagrams, the system appears to have several key components that work together to provide functionality.\n\n## Data Models\n\nThe system uses various data models to represent entities and their relationships.\n\n## Future Considerations\n\nWhen your internet connection is restored, you can generate more detailed documentation with AI assistance.`,
        )
      } else {
        toast({
          title: "Documentation generation failed",
          description:
            error instanceof ApiError ? error.message : "Failed to generate documentation. Please try again.",
          variant: "destructive",
        })
      }

      setIsGeneratingDocs(false)
      setAsyncStatus(null)
      setAsyncProgress(0)
    }
  }

  // Synchronous documentation generation fallback
  const generateDocumentationSynchronously = async (projectId: string, umlDiagrams?: Record<string, string>) => {
    try {
      // Ensure we have a valid prompt
      const validPrompt = prompt && prompt.trim() !== "" ? prompt.trim() : "Generate comprehensive documentation"

      // Generate documentation based on the diagrams
      const docResponse = await generateDocumentation({
        projectId: id,
        prompt: validPrompt,
        umlDiagrams,
      })

      setDocumentation(docResponse.content)

      // Save the documentation string to the backend
      try {
        await updateProjectState(projectId, { design: docResponse.content })
      } catch (e) {
        console.error("Failed to save documentation to project state", e)
      }

      toast({
        title: "Documentation generated",
        description: "Documentation has been generated successfully based on your diagrams.",
      })
    } catch (error) {
      console.error("Error generating documentation synchronously:", error)
      throw error
    } finally {
      setIsGeneratingDocs(false)
      setAsyncStatus(null)
      setAsyncProgress(0)
    }
  }

  const handleGenerateIaC = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Empty prompt",
        description: "Please enter a prompt to generate infrastructure code.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setActiveTab("infrastructure")

    try {
      // Get the project ID
      const projectId = project?.id

      // Ensure we have a valid project ID
      if (!projectId) {
        throw new Error("Invalid project ID")
      }

      // Try to save the prompt to the project state, but continue even if it fails
      try {
        await updateProjectState(projectId, { lastPrompt: prompt })
        console.log("Successfully updated project state with prompt")
      } catch (stateError) {
        // Log the error but continue with infrastructure generation
        console.error("Failed to update project state, continuing with infrastructure generation:", stateError)
        // Don't show a toast for this error since it's not critical
      }

      // Generate infrastructure code
      const response = await generateIaC({ prompt })
      setTerraformConfig(response.code)

      // Try to update project state with the generated code, but don't fail if it doesn't work
      try {
        await updateProjectState(projectId, { lastCode: response.code })
        console.log("Successfully updated project state with generated code")
      } catch (stateError) {
        // Log the error but don't fail the overall operation
        console.error("Failed to update project state with generated code:", stateError)
      }

      toast({
        title: "Infrastructure code generated",
        description: "Your Terraform configuration has been generated successfully.",
      })
    } catch (error) {
      console.error("Error generating infrastructure code:", error)

      // Check if it's a network error
      const isNetworkError =
        error instanceof ApiError &&
        (error.message.includes("Network error") || error.message.includes("Failed to fetch"))

      if (isNetworkError) {
        setIsOffline(true)
        toast({
          title: "Network error",
          description: "Unable to connect to the server. Please check your internet connection.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error generating infrastructure code",
          description:
            error instanceof ApiError
              ? error.message
              : "There was an error generating your infrastructure code. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsGenerating(false)
    }
  }

  // Render the async generation status
  const renderAsyncStatus = () => {
    if (!asyncStatus) return null

    let statusText = ""
    let statusColor = ""

    switch (asyncStatus) {
      case "pending":
        statusText = "Initializing documentation generation..."
        statusColor = "text-blue-600 dark:text-blue-400"
        break
      case "processing":
        statusText = "Generating documentation... This may take a minute or two."
        statusColor = "text-blue-600 dark:text-blue-400"
        break
      case "completed":
        statusText = "Documentation generated successfully!"
        statusColor = "text-green-600 dark:text-green-400"
        break
      case "failed":
        statusText = "Failed to generate documentation. Please try again."
        statusColor = "text-red-600 dark:text-red-400"
        break
      default:
        statusText = "Processing..."
        statusColor = "text-blue-600 dark:text-blue-400"
    }

    return (
      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        <div className="flex items-center mb-2">
          {asyncStatus === "failed" ? (
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
          )}
          <p className={`text-sm font-medium ${statusColor}`}>{statusText}</p>
        </div>
        {asyncStatus !== "failed" && <Progress value={asyncProgress} className="h-2 mt-2" />}
      </div>
    )
  }

  useEffect(() => {
    let pollingInterval: NodeJS.Timeout | null = null;

    const pollStatus = async () => {
      if (!asyncDocJobId) return;
      try {
        const statusResp = await import("@/lib/api/visualization").then(m => m.checkAsyncJobStatus(asyncDocJobId, id));
        setAsyncStatus(statusResp.status);
        setAsyncProgress(statusResp.progress ?? 0);
        // Print status response for debugging
        console.log("[Doc Poll] Status response:", statusResp);
        if (statusResp.status === "completed") {
          // Use the result directly from the status response
          if (statusResp.result) {
            if (typeof statusResp.result === "string") {
              setDocumentation(statusResp.result);
            } else if (statusResp.result.content) {
              setDocumentation(statusResp.result.content);
            } else {
              setDocumentation(JSON.stringify(statusResp.result, null, 2));
            }
          } else {
            setDocumentation("Documentation generated, but could not parse content.");
          }
          setIsGeneratingDocs(false);
          setAsyncStatus("completed");
          setAsyncProgress(100);
          setAsyncDocJobId(null); // Stop polling
          // Optionally, reload the project to get the latest documentations
          loadProject();
        } else if (statusResp.status === "failed") {
          setIsGeneratingDocs(false);
          setAsyncStatus("failed");
          setAsyncProgress(0);
          setAsyncDocJobId(null); // Stop polling
          if (statusResp.error) {
            setError(statusResp.error);
          }
        }
      } catch (err) {
        console.error("[Doc Poll] Error polling documentation status:", err);
        setIsGeneratingDocs(false);
        setAsyncStatus("failed");
        setAsyncProgress(0);
        setAsyncDocJobId(null);
        setError("Failed to poll documentation status. Please try again.");
      }
    };

    if (asyncDocJobId && (asyncStatus === "pending" || asyncStatus === "processing")) {
      pollStatus(); // Immediate first poll
      pollingInterval = setInterval(pollStatus, 3000);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [asyncDocJobId]);

  // Helper to extract diagrams from project or documentation
  function extractDiagrams(source: any): any[] {
    console.log('[extractDiagrams] source:', source);
    console.log('[extractDiagrams] source.umlDiagramsSvg:', source?.umlDiagramsSvg);
    const umlDiagrams = source?.umlDiagrams || {};
    const umlDiagramsSvg = source?.umlDiagramsSvg || {};
    console.log("[extractDiagrams] umlDiagramsSvg:", umlDiagramsSvg);
    return Object.entries(umlDiagrams).map(([key, value]) => {
      let type;
      if (key.toLowerCase().includes("class")) type = "class";
      else if (key.toLowerCase().includes("sequence")) type = "sequence";
      else if (key.toLowerCase().includes("entity")) type = "entity";
      else if (key.toLowerCase().includes("component")) type = "component";
      else if (key.toLowerCase().includes("architecture")) type = "architecture";
      else if (key.toLowerCase().includes("data")) type = "data-model";
      else if (key.toLowerCase().includes("integration")) type = "integration";
      if (!type) return null;
      // Try both keyDiagram and key for SVG lookup
      const svg = umlDiagramsSvg[`${key}Diagram`] || umlDiagramsSvg[key];
      if (svg) {
        console.log(`[extractDiagrams] SVG for ${key}:`, svg.substring(0, 200) + (svg.length > 200 ? '...' : ''));
      } else {
        console.log(`[extractDiagrams] No SVG for ${key}`);
      }
      return {
        type,
        svg,
        mermaid: value
      };
    }).filter(Boolean);
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Error</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <p className="text-gray-500 mb-4">The project you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      {isOffline && (
        <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 text-center">
          <div className="flex items-center justify-center gap-2">
            <WifiOff className="h-4 w-4 text-yellow-700 dark:text-yellow-500" />
            <p className="text-sm text-yellow-700 dark:text-yellow-500">
              You are currently offline. Some features may be limited.
            </p>
          </div>
        </div>
      )}
      <main className="flex-1 container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">{project.description}</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Back to Dashboard
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Generate</CardTitle>
              <CardDescription>
                Enter a prompt to generate diagrams. After reviewing, you can generate documentation and infrastructure
                code.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe your system. For example: 'Generate diagrams for an e-commerce system with users, products, and orders.'"
                className="min-h-[200px]"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />

              <div className="flex flex-col space-y-2">
                <Button onClick={handleGenerateDiagrams} disabled={isGenerating} className="w-full">
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Diagrams...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Generate Diagrams
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            {hasDiagrams && (
              <CardFooter className="flex flex-col space-y-2 pt-0">
                <div className="w-full border-t my-2"></div>
                <Button
                  onClick={handleGenerateDocumentation}
                  disabled={isGeneratingDocs || !hasDiagrams || isGenerating}
                  className="w-full"
                  variant="outline"
                >
                  {isGeneratingDocs ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Documentation...
                    </>
                  ) : (
                    <>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Documentation
                    </>
                  )}
                </Button>
                <Button onClick={handleGenerateIaC} disabled={isGenerating} variant="outline" className="w-full">
                  {isGenerating && activeTab === "infrastructure" ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating Infrastructure...
                    </>
                  ) : (
                    <>
                      <Code2 className="mr-2 h-4 w-4" />
                      Generate Infrastructure
                    </>
                  )}
                </Button>
              </CardFooter>
            )}
          </Card>

          <Card className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <CardHeader className="pb-0 pt-4">
                <TabsList>
                  <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                  <TabsTrigger value="documentation">Documentation</TabsTrigger>
                  <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="pt-4">
                <TabsContent value="diagrams" className="mt-0">
                  {Array.isArray(projectDiagrams) &&
                  projectDiagrams.length > 0 &&
                  projectDiagrams.some((d) => d.diagramData) ? (
                    <>
                      <DiagramTabs
                        diagrams={projectDiagrams}
                        isGenerating={isGenerating}
                        onRegenerateAll={handleGenerateDiagrams}
                      />
                      {hasDiagrams && !documentation && (
                        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md flex items-center">
                          <CheckCircle className="h-5 w-5 text-blue-500 mr-2" />
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Diagrams look good? Generate documentation based on these diagrams.
                          </p>
                          <Button
                            size="sm"
                            className="ml-auto"
                            onClick={handleGenerateDocumentation}
                            disabled={isGeneratingDocs}
                          >
                            {isGeneratingDocs ? (
                              <>
                                <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              "Generate Docs"
                            )}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800 mb-4">
                        <BarChart2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No diagrams yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                        Enter a prompt and click "Generate Diagrams" to create diagrams for your project.
                      </p>
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="documentation" className="mt-0">
                  {(() => {
                    // Log for debugging
                    console.log("[Documentation Render] documentation:", documentation)
                    console.log("[Documentation Render] project.documentation:", project && project.documentation && project.umlDiagramsSvg)

                    // Helper to extract markdown string
                    function extractMarkdown(doc: any) {
                      if (!doc) return ""
                      if (typeof doc === "string") return doc
                      if (typeof doc === "object" && doc.content && typeof doc.content === "string") return doc.content
                      // If it's a full design doc object, try to convert to markdown (fallback)
                      if (typeof doc === "object") return JSON.stringify(doc, null, 2)
                      return ""
                    }

                    // Prefer the documentation from project.documentation
                    const docString = extractMarkdown(documentation) || extractMarkdown(project && project.documentation && project.documentation.result)

                    if (isGeneratingDocs) {
                      return (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                          <Loader2 className="h-8 w-8 animate-spin mb-4" />
                          <h3 className="text-lg font-medium mb-2">Generating Documentation</h3>
                          <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                            Please wait while we generate comprehensive documentation based on your diagrams...
                          </p>
                          {renderAsyncStatus()}
                        </div>
                      )
                    } else if (docString && docString.trim() !== "") {
                      // Prefer documentation object, then project, then documentation variable
                      const docSource = project;
                      const diagrams = extractDiagrams(docSource);
                      return <DocumentationWithTOC content={docString} diagrams={diagrams} />
                    }
                    return (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800 mb-4">
                          <FileText className="h-6 w-6" />
                        </div>
                        <h3 className="text-lg font-medium mb-2">No documentation yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                          Click 'Generate Documentation' to create documentation based on your diagrams.
                        </p>
                        {hasDiagrams && (
                          <Button onClick={handleGenerateDocumentation} disabled={isGeneratingDocs}>
                            {isGeneratingDocs ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <FileText className="mr-2 h-4 w-4" />
                                Generate Documentation
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    )
                  })()}
                </TabsContent>
                <TabsContent value="infrastructure" className="mt-0">
                  {terraformConfig ? (
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
                      <code>{terraformConfig}</code>
                    </pre>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800 mb-4">
                        <Code2 className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-medium mb-2">No infrastructure code yet</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 max-w-md">
                        Enter a prompt and click "Generate Infrastructure" to create Terraform configuration.
                      </p>
                      {hasDiagrams && (
                        <Button onClick={handleGenerateIaC} disabled={isGenerating}>
                          {isGenerating && activeTab === "infrastructure" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Generating...
                            </>
                          ) : (
                            <>
                              <Code2 className="mr-2 h-4 w-4" />
                              Generate Infrastructure
                            </>
                          )}
                        </Button>
                      )}
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </main>
      <ConnectionStatus />
    </div>
  )
} 