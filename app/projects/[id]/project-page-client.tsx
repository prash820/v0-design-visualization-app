"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Loader2, 
  Code2, 
  FileText, 
  Eye,
  Layers,
  FileCode,
  Cloud,
  Rocket,
  Settings,
  Palette,
  Zap,
  User,
  Wand2,
  CheckCircle,
  Clock,
  ArrowRight,
  Play,
  AlertCircle,
  Plus,
  RotateCcw
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import DashboardHeader from "@/components/dashboard-header"
import { getProjectById } from "@/lib/api/projects"
import { validateToken } from "@/lib/api/auth"
import { ApiError } from "@/lib/api/client"
import type { Project } from "@/lib/types"

// Import components
import { ProjectOverview } from "./components/ProjectOverview"
import { InfrastructureDeployment } from "./components/infrastructure-deployment"
import AppDevelopment from "./components/AppDevelopment"
import DiagramTabs from "@/components/diagram-tabs"

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface GeneratedFiles {
  projectId: string
  files: Record<string, string>
  fileCount: number
  generatedAt: string
}

type FlowMode = 'expert' | 'guided' | null

interface GuidedFlowStatus {
  step: 'summary' | 'diagrams' | 'infrastructure' | 'application' | 'deployment' | 'documentation' | 'completed'
  progress: number
  summary?: {
    title: string
    description: string
    features: string[]
    techStack: string[]
    estimatedCost: string
    timeline: string
  }
  umlJobId?: string
  iacJobId?: string
  umlDiagrams?: any
  infraCode?: string
  appCode?: any
  isProcessing: boolean
  error?: string
}

export default function ProjectPageClient({ id }: { id: string }) {
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGeneratingUML, setIsGeneratingUML] = useState(false)
  const [isGeneratingInfrastructure, setIsGeneratingInfrastructure] = useState(false)
  const [isGeneratingCode, setIsGeneratingCode] = useState(false)
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFiles | null>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [flowMode, setFlowMode] = useState<FlowMode>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [showPromptDialog, setShowPromptDialog] = useState(false)
  const [editPrompt, setEditPrompt] = useState("")
  const [isUpdatingPrompt, setIsUpdatingPrompt] = useState(false)
  const [guidedFlowStatus, setGuidedFlowStatus] = useState<GuidedFlowStatus>({
    step: 'summary',
    progress: 0,
    isProcessing: false
  })
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // For development, allow viewing projects without authentication
        const isDevelopment = process.env.NODE_ENV === 'development'
        
        if (isDevelopment) {
          // Skip authentication check in development mode
          console.log("Development mode: Skipping authentication check")
          await loadProject()
          return
        }
        
        const isValid = await validateToken()
        if (!isValid) {
          router.push("/login")
          return
        }
        await loadProject()
      } catch (error) {
        console.error("Auth check error:", error)
        // In development, still try to load the project even if auth fails
        if (process.env.NODE_ENV === 'development') {
          console.log("Development mode: Attempting to load project despite auth error")
          await loadProject()
        } else {
          router.push("/login")
        }
      }
    }
    checkAuth()
  }, [id, router])

  const loadProject = async () => {
    setIsLoading(true)
    try {
      if (!id || id === "undefined") {
        throw new Error("Invalid project ID")
      }

      // Debug logging for authentication
      const token = localStorage.getItem('token')
      console.log("Auth token available:", !!token)
      console.log("Fetching project ID:", id)
      console.log("API endpoint will be:", `${API_BASE_URL}/api/projects/${id}`)
      
      const projectData = await getProjectById(id)
      if (!projectData) {
        throw new Error("Project not found")
      }
      
      // Debug logging to see what data we're getting
      console.log("Project data loaded:", {
        id: projectData.id,
        name: projectData.name,
        hasInfraCode: !!projectData.infraCode,
        infraCodeType: typeof projectData.infraCode,
        infraCodeLength: projectData.infraCode ? projectData.infraCode.length : 0,
        hasPrompt: !!projectData.prompt,
        hasUmlDiagrams: !!projectData.umlDiagrams,
        hasAppCode: !!projectData.appCode
      })
      
      setProject(projectData)

      // Auto-determine flow mode based on project data
      if (projectData.umlDiagrams || projectData.infraCode || projectData.appCode) {
        setFlowMode('expert')
      }

      // Check for generated files
      await checkGeneratedFiles()
    } catch (error) {
      console.error("Error loading project:", error)
      setError(error instanceof ApiError ? error.message : "Failed to load project")
      toast({
        title: "Error loading project",
        description: error instanceof ApiError ? error.message : "Failed to load project",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const checkGeneratedFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/deploy/files/${id}`)
      if (response.ok) {
        const files = await response.json()
        setGeneratedFiles(files)
        
        // Auto-select first file
        const fileNames = Object.keys(files.files)
        if (fileNames.length > 0) {
          setSelectedFile(fileNames[0])
        }
      } else {
        setGeneratedFiles(null)
      }
    } catch (error) {
      console.log("No generated files found:", error)
      setGeneratedFiles(null)
    }
  }

  // API Helper Functions
  const pollJobStatus = async (endpoint: string, jobId: string, maxAttempts: number = 30): Promise<any> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_BASE_URL}${endpoint}/${jobId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }
        
        const status = await response.json()
        console.log(`Job status for ${endpoint}:`, status)
        
        if (status.status === 'completed') {
          return status
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Job failed')
        }
        
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (error) {
        console.error(`Poll attempt ${attempt + 1} failed for ${endpoint}:`, error)
        if (attempt === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    throw new Error('Job polling timeout')
  }

  const generateProjectSummary = async () => {
    if (!project?.prompt) {
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        error: 'No project prompt available' 
      }))
      return
    }

    setGuidedFlowStatus(prev => ({ ...prev, isProcessing: true, error: undefined }))
    
    try {
      // Create a basic summary from the project prompt
        setGuidedFlowStatus(prev => ({
          ...prev,
          isProcessing: false,
        summary: {
            title: project.name || 'Untitled Project',
          description: project.prompt || 'No description available',
          features: ['Core functionality', 'User interface', 'Data management'],
          techStack: ['React', 'TypeScript', 'Node.js', 'AWS'],
          estimatedCost: '$50-200/month',
          timeline: '2-4 weeks'
          },
          progress: 20
        }))

    } catch (error) {
      console.error('Error generating project summary:', error)
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Failed to generate project summary' 
      }))
    }
  }

  const executeGuidedFlow = async () => {
    if (!project?.prompt) {
      toast({
        title: "Error",
        description: "Project prompt is required",
        variant: "destructive"
      })
      return
    }

    setGuidedFlowStatus(prev => ({ ...prev, isProcessing: true, error: undefined }))

    try {
      const token = localStorage.getItem('token')
      
      // Step 1: Generate UML Diagrams
        setGuidedFlowStatus(prev => ({ 
          ...prev, 
          step: 'diagrams',
          progress: 25
        }))

      console.log('Generating UML diagrams...')
      const umlResponse = await fetch(`${API_BASE_URL}/api/uml/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id
        })
      })

      if (!umlResponse.ok) {
        throw new Error('Failed to start UML generation')
      }

      const umlResult = await umlResponse.json()

            setGuidedFlowStatus(prev => ({ 
              ...prev, 
        umlJobId: umlResult.jobId,
        progress: 30
      }))

      // Poll for UML completion
      const umlStatus = await pollJobStatus('/api/uml/status', umlResult.jobId)
      
      // Check if UML diagrams were generated successfully
      if (!umlStatus || !umlStatus.result) {
        throw new Error('Failed to generate UML diagrams')
      }
      
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        umlDiagrams: umlStatus.result,
        progress: 40
      }))

      // Step 2: Generate Infrastructure Code
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        step: 'infrastructure',
        progress: 45
      }))

      console.log('Generating infrastructure code...')
      const iacResponse = await fetch(`${API_BASE_URL}/api/iac/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id,
          umlDiagrams: umlStatus.result
        })
      })

      if (!iacResponse.ok) {
        throw new Error('Failed to start infrastructure generation')
      }

      const iacResult = await iacResponse.json()
      
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        iacJobId: iacResult.jobId,
        progress: 50
      }))

      // Poll for IaC completion
      const iacStatus = await pollJobStatus('/api/iac/status', iacResult.jobId)
      
      // Check if infrastructure code was generated successfully
      if (!iacStatus || !iacStatus.result) {
        throw new Error('Failed to generate infrastructure code')
      }

      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        infraCode: iacStatus.result.terraformCode || iacStatus.result,
        progress: 60
      }))

      // Step 3: Generate Application Code
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        step: 'application',
        progress: 65
      }))

      console.log('Generating application code...')
      const codeResponse = await fetch(`${API_BASE_URL}/api/code/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id,
          umlDiagrams: umlStatus.result
        })
      })

      if (!codeResponse.ok) {
        throw new Error('Failed to generate application code')
      }

      const codeResult = await codeResponse.json()
      
      // Poll for code generation completion
      const codeStatus = await pollJobStatus('/api/code/logs', codeResult.jobId)
      
      // Check if application code was generated successfully
      if (!codeStatus || !codeStatus.result) {
        throw new Error('Failed to generate application code')
      }
      
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        appCode: codeStatus.result,
        progress: 80
      }))

      // Step 4: Deploy Infrastructure (optional)
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        step: 'deployment',
        progress: 85
      }))

      // Infrastructure deployment can be triggered separately
          setGuidedFlowStatus(prev => ({ 
            ...prev, 
            step: 'completed',
            progress: 100,
            isProcessing: false
          }))

          toast({
        title: "Project Completed!",
        description: "All code has been generated successfully.",
          })

          // Reload project data to show the new artifacts
          await loadProject()

    } catch (error) {
      console.error('Error executing guided flow:', error)
      setGuidedFlowStatus(prev => ({ 
        ...prev, 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Build process failed'
      }))

      toast({
        title: "Build Failed",
        description: error instanceof Error ? error.message : "An error occurred during the build process",
        variant: "destructive"
      })
    }
  }

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.tsx') || filename.endsWith('.jsx')) {
      return <Code2 className="h-4 w-4 text-blue-500" />
    }
    if (filename.endsWith('.ts') || filename.endsWith('.js')) {
      return <Code2 className="h-4 w-4 text-yellow-500" />
    }
    if (filename.endsWith('.json')) {
      return <FileText className="h-4 w-4 text-green-500" />
    }
    return <FileText className="h-4 w-4 text-gray-500" />
  }

  const organizeFiles = (files: Record<string, string>) => {
    const organized: Record<string, string[]> = {}
    
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/')
      const category = parts[0] || 'root'
      
      if (!organized[category]) {
        organized[category] = []
      }
      organized[category].push(filePath)
    })
    
    return organized
  }

  const handleGenerateUML = async () => {
    if (!project?.prompt) {
      toast({
        title: "Error",
        description: "Project prompt is required",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingUML(true)
    try {
      const token = localStorage.getItem('token')
      
      toast({
        title: "UML Generation Started",
        description: "Generating UML diagrams...",
      })
      
      const response = await fetch(`${API_BASE_URL}/api/uml/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start UML generation')
      }

      const result = await response.json()
      
      // Poll for completion
      const status = await pollJobStatus('/api/uml/status', result.jobId)
      
      toast({
        title: "UML Generation Complete",
        description: "UML diagrams have been generated successfully",
      })

      // Reload project to show new diagrams
      await loadProject()
      
    } catch (error) {
      toast({
        title: "UML Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate UML diagrams",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingUML(false)
    }
  }

  const handleGenerateInfrastructure = async () => {
    if (!project?.prompt) {
      toast({
        title: "Error",
        description: "Project prompt is required",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingInfrastructure(true)
    try {
      const token = localStorage.getItem('token')
      
      toast({
        title: "Infrastructure Generation Started",
        description: "Generating infrastructure code...",
      })
      
      const response = await fetch(`${API_BASE_URL}/api/iac/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id,
          umlDiagrams: project.umlDiagrams
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start infrastructure generation')
      }

      const result = await response.json()
      
      // Poll for completion
      const status = await pollJobStatus('/api/iac/status', result.jobId)
      
      toast({
        title: "Infrastructure Generation Complete",
        description: "Infrastructure code has been generated successfully",
      })

      // Reload project to show new infrastructure
      await loadProject()
      
    } catch (error) {
      toast({
        title: "Infrastructure Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate infrastructure code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingInfrastructure(false)
    }
  }

  const handleRegenerateInfrastructure = async () => {
    if (!project?.prompt) {
      toast({
        title: "Error",
        description: "Project prompt is required",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingInfrastructure(true)
    try {
      const token = localStorage.getItem('token')
      
      toast({
        title: "Infrastructure Regeneration Started",
        description: "Regenerating infrastructure code with latest fixes...",
      })
      
      const response = await fetch(`${API_BASE_URL}/api/iac/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id,
          umlDiagrams: project.umlDiagrams,
          forceRegenerate: true // Force regeneration flag
        })
      })

      if (!response.ok) {
        throw new Error('Failed to start infrastructure regeneration')
      }

      const result = await response.json()
      
      // Poll for completion
      const status = await pollJobStatus('/api/iac/status', result.jobId)
      
      toast({
        title: "Infrastructure Regeneration Complete",
        description: "Infrastructure code has been regenerated with improvements",
      })

      // Reload project to show updated infrastructure
      await loadProject()
      
    } catch (error) {
      toast({
        title: "Infrastructure Regeneration Failed",
        description: error instanceof Error ? error.message : "Failed to regenerate infrastructure code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingInfrastructure(false)
    }
  }

  const handleGenerateCode = async () => {
    if (!project?.prompt) {
      toast({
        title: "Error",
        description: "Project prompt is required",
        variant: "destructive"
      })
      return
    }

    setIsGeneratingCode(true)
    try {
      const token = localStorage.getItem('token')

      // Purge old app code before generating new code
      await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ appCode: null })
      })

      toast({
        title: project?.appCode ? "Regeneration Started" : "Code Generation Started",
        description: project?.appCode ? "Regenerating application code..." : "Generating application code...",
      })

      const response = await fetch(`${API_BASE_URL}/api/code/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: id,
          umlDiagrams: project.umlDiagrams
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate application code')
      }

      const result = await response.json()

      // Poll for completion
      const status = await pollJobStatus('/api/code/logs', result.jobId)

      toast({
        title: "Code Generation Complete",
        description: "Application code has been generated successfully",
      })

      // Reload project to show new code
      await loadProject()

    } catch (error) {
      toast({
        title: "Code Generation Failed",
        description: error instanceof Error ? error.message : "Failed to generate application code",
        variant: "destructive",
      })
    } finally {
      setIsGeneratingCode(false)
    }
  }

  const updateProjectPrompt = async () => {
    if (!editPrompt.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid prompt",
        variant: "destructive"
      })
      return
    }

    setIsUpdatingPrompt(true)
    try {
      // Get the token from localStorage
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      // Update project prompt via API
      const response = await fetch(`${API_BASE_URL}/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ prompt: editPrompt })
      })

      if (!response.ok) {
        throw new Error('Failed to update project prompt')
      }

      const updatedProject = await response.json()
      setProject(prev => prev ? { ...prev, prompt: editPrompt } : null)
      setShowPromptDialog(false)
      setEditPrompt("")

      toast({
        title: "Success",
        description: "Project prompt updated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update project prompt",
        variant: "destructive"
      })
    } finally {
      setIsUpdatingPrompt(false)
    }
  }

  const renderPromptSection = () => {
    if (!project?.prompt) {
      return (
        <Card className="mb-6 border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertCircle className="h-5 w-5" />
              Missing Project Requirements
            </CardTitle>
            <CardDescription className="text-orange-700">
              This project doesn't have detailed requirements. Add a prompt to enable AI-powered features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => {
                setEditPrompt("")
                setShowPromptDialog(true)
              }}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Project Requirements
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Project Requirements
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditPrompt(project.prompt || "")
                setShowPromptDialog(true)
              }}
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm whitespace-pre-wrap">{project.prompt}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderFlowSelector = () => (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Choose Your Development Flow</CardTitle>
        <CardDescription>
          Select how you want to approach building your application
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${flowMode === 'expert' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFlowMode('expert')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <User className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Expert Mode</h3>
                  <Badge variant="outline">Full Control</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Step-by-step control over diagrams, infrastructure code, application code, and deployment. 
                Perfect for developers who want to customize every aspect.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">Diagrams</Badge>
                <Badge variant="secondary">Infrastructure</Badge>
                <Badge variant="secondary">App Code</Badge>
                <Badge variant="secondary">Deployment</Badge>
              </div>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${flowMode === 'guided' ? 'ring-2 ring-green-500' : ''}`}
            onClick={() => setFlowMode('guided')}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <Wand2 className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">Guided Mode</h3>
                  <Badge variant="outline">Automated</Badge>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                AI-powered end-to-end automation. Provide your requirements and we'll handle 
                everything from architecture to deployment automatically.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="secondary">AI Summary</Badge>
                <Badge variant="secondary">Auto Deploy</Badge>
                <Badge variant="secondary">Zero Config</Badge>
                <Badge variant="secondary">Fast Setup</Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )

  const renderGuidedFlow = () => (
    <div className="space-y-6">
      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-green-500" />
            Guided Development Pipeline
          </CardTitle>
          <CardDescription>
            Automated end-to-end application development and deployment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${guidedFlowStatus.progress}%` }}
              />
            </div>
            
            {/* Current Step */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                Step: {guidedFlowStatus.step.charAt(0).toUpperCase() + guidedFlowStatus.step.slice(1)}
              </span>
              <span className="text-sm text-muted-foreground">
                {guidedFlowStatus.progress}% Complete
              </span>
            </div>

            {/* Step Indicators */}
            <div className="grid grid-cols-6 gap-2 text-xs">
              {[
                { step: 'summary', label: 'Summary', icon: Eye },
                { step: 'diagrams', label: 'Diagrams', icon: Layers },
                { step: 'infrastructure', label: 'Infrastructure', icon: Cloud },
                { step: 'application', label: 'Application', icon: Code2 },
                { step: 'deployment', label: 'Deployment', icon: Rocket },
                { step: 'documentation', label: 'Docs', icon: FileText }
              ].map(({ step, label, icon: Icon }) => {
                const isCompleted = ['summary', 'diagrams', 'infrastructure', 'application', 'deployment', 'documentation'].indexOf(guidedFlowStatus.step) > ['summary', 'diagrams', 'infrastructure', 'application', 'deployment', 'documentation'].indexOf(step)
                const isCurrent = guidedFlowStatus.step === step
                
                return (
                  <div key={step} className={`flex flex-col items-center p-2 rounded ${
                    isCompleted ? 'bg-green-100 text-green-600' :
                    isCurrent ? 'bg-blue-100 text-blue-600' : 
                    'bg-gray-100 text-gray-400'
                  }`}>
                    <Icon className="h-4 w-4 mb-1" />
                    <span>{label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      {guidedFlowStatus.step === 'summary' && (
        <Card>
          <CardHeader>
            <CardTitle>Project Summary & Confirmation</CardTitle>
            <CardDescription>
              Review what we're going to build based on your requirements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!guidedFlowStatus.summary ? (
              <div className="text-center py-8">
                <Button 
                  onClick={generateProjectSummary}
                  disabled={guidedFlowStatus.isProcessing}
                  size="lg"
                >
                  {guidedFlowStatus.isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Requirements...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Generate Project Summary
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{guidedFlowStatus.summary?.title || 'Project Summary'}</h3>
                  <p className="text-muted-foreground">{guidedFlowStatus.summary?.description || 'No description available'}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Key Features</h4>
                    <ul className="space-y-2">
                      {(guidedFlowStatus.summary?.features || []).map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Technology Stack</h4>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(guidedFlowStatus.summary?.techStack || []).map((tech, index) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Cost:</span>
                        <span className="font-medium">{guidedFlowStatus.summary?.estimatedCost || 'To be calculated'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Timeline:</span>
                        <span className="font-medium">{guidedFlowStatus.summary?.timeline || 'To be determined'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button 
                    onClick={executeGuidedFlow}
                    disabled={guidedFlowStatus.isProcessing}
                    size="lg"
                    className="min-w-48"
                  >
                    {guidedFlowStatus.isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Building Your App...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-4 w-4" />
                        Start Building
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {guidedFlowStatus.step !== 'summary' && guidedFlowStatus.step !== 'completed' && (
        <Card>
          <CardContent className="text-center py-12">
            <Loader2 className="h-12 w-12 mx-auto mb-4 animate-spin text-blue-500" />
            <h3 className="text-lg font-semibold mb-2">
              Processing: {guidedFlowStatus.step.charAt(0).toUpperCase() + guidedFlowStatus.step.slice(1)}
            </h3>
            <p className="text-muted-foreground mb-4">
              {guidedFlowStatus.step === 'diagrams' && "Generating architecture diagrams..."}
              {guidedFlowStatus.step === 'infrastructure' && "Creating infrastructure code..."}
              {guidedFlowStatus.step === 'application' && "Building application code..."}
              {guidedFlowStatus.step === 'deployment' && "Deploying to cloud..."}
              {guidedFlowStatus.step === 'documentation' && "Generating documentation..."}
            </p>

            {/* Show error if any */}
            {guidedFlowStatus.error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-left max-w-md mx-auto">
                <div className="flex items-center gap-2 text-red-600 mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Error Occurred</span>
                </div>
                <p className="text-sm text-red-700">{guidedFlowStatus.error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => setGuidedFlowStatus(prev => ({ ...prev, error: undefined }))}
                >
                  Dismiss
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {guidedFlowStatus.step === 'completed' && (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
            <h3 className="text-xl font-semibold mb-2">Application Generated Successfully!</h3>
            <p className="text-muted-foreground mb-6">
              Your application code has been generated. You can now view the diagrams, infrastructure code, and application code.
            </p>
            <div className="flex justify-center gap-4">
              <Button onClick={() => setFlowMode('expert')} variant="outline">
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Button>
              <Button onClick={() => setActiveTab('infrastructure')}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Deploy Infrastructure
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderExpertMode = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview" className="flex items-center gap-2">
          <Eye className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger value="diagrams" className="flex items-center gap-2">
          <Layers className="h-4 w-4" />
          Diagrams
        </TabsTrigger>
        <TabsTrigger value="design" className="flex items-center gap-2">
          <Palette className="h-4 w-4" />
          Design Doc
        </TabsTrigger>
        <TabsTrigger value="infrastructure" className="flex items-center gap-2">
          <Cloud className="h-4 w-4" />
          Infrastructure
        </TabsTrigger>
        <TabsTrigger value="application" className="flex items-center gap-2">
          <Rocket className="h-4 w-4" />
          Application
        </TabsTrigger>
      </TabsList>

      {/* Overview Tab */}
      <TabsContent value="overview" className="space-y-4">
        {/* Project Status Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Project Status Overview
            </CardTitle>
            <CardDescription>
              Track the progress of your project artifacts and see what's ready to use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Progress Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Diagrams Status */}
              <Card className={`${project?.umlDiagrams ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Layers className={`h-5 w-5 ${project?.umlDiagrams ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-medium">UML Diagrams</span>
                    </div>
                    {project?.umlDiagrams ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project?.umlDiagrams 
                      ? 'Architecture diagrams available' 
                      : 'Generate visual system architecture'
                    }
                  </p>
                  {project?.umlDiagrams ? (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('diagrams')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Diagrams
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleGenerateUML}>
                      <Layers className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Infrastructure Status */}
              <Card className={`${project?.infraCode ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Cloud className={`h-5 w-5 ${project?.infraCode ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-medium">Infrastructure</span>
                    </div>
                    {project?.infraCode ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project?.infraCode 
                      ? `Terraform code ready (${typeof project.infraCode === 'string' ? Math.round(project.infraCode.length / 100) : 'Unknown'} lines)` 
                      : 'Generate cloud infrastructure code'
                    }
                  </p>
                  {project?.infraCode ? (
                    <div className="flex flex-col gap-2">
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('infrastructure')}>
                        <Eye className="h-4 w-4 mr-2" />
                        View & Deploy
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleRegenerateInfrastructure}
                        disabled={isGeneratingInfrastructure}
                        className="border-orange-200 text-orange-600 hover:bg-orange-50"
                      >
                        {isGeneratingInfrastructure ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Regenerating...
                          </>
                        ) : (
                          <>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Regenerate Infrastructure
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button variant="outline" size="sm" onClick={handleGenerateInfrastructure}>
                      <Cloud className="h-4 w-4 mr-2" />
                      Generate
                    </Button>
                  )}
                </CardContent>
              </Card>

              {/* Application Code Status */}
              <Card className={`${project?.appCode ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Code2 className={`h-5 w-5 ${project?.appCode ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className="font-medium">Application Code</span>
                    </div>
        {project?.appCode ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <Clock className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {project?.appCode 
                      ? 'Full-stack application code ready' 
                      : 'Generate complete application code'
                    }
                  </p>
                  {project?.appCode ? (
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('application')}>
                      <Eye className="h-4 w-4 mr-2" />
                      View & Deploy
                    </Button>
                  ) : (
                    <Button onClick={handleGenerateCode} disabled={isGeneratingCode}>
                      {isGeneratingCode ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Rocket className="h-4 w-4 mr-2" />
                          Generate Application Code
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Overall Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {[project?.umlDiagrams, project?.infraCode, project?.appCode].filter(Boolean).length}/3 Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${([project?.umlDiagrams, project?.infraCode, project?.appCode].filter(Boolean).length / 3) * 100}%` 
                  }}
                />
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <ArrowRight className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Next Steps</span>
              </div>
              <div className="text-sm text-blue-800 space-y-1">
                {!project?.umlDiagrams && (
                  <p>• Generate UML diagrams to visualize your system architecture</p>
                )}
                {project?.umlDiagrams && !project?.infraCode && (
                  <p>• Generate infrastructure code based on your diagrams</p>
                )}
                {project?.infraCode && !project?.appCode && (
                  <p>• Generate application code for your complete system</p>
                )}
                {project?.appCode && project?.infraCode && (
                  <p>• Deploy your infrastructure and application to the cloud</p>
                )}
                {!project?.prompt && (
                  <p>• Add detailed project requirements to enable AI-powered generation</p>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-3">
              {!project?.umlDiagrams && (
                <Button onClick={handleGenerateUML} className="flex-1 min-w-fit">
                  <Layers className="h-4 w-4 mr-2" />
                  Generate Diagrams
                </Button>
              )}
              {project?.umlDiagrams && !project?.infraCode && (
                <Button onClick={handleGenerateInfrastructure} className="flex-1 min-w-fit">
                  <Cloud className="h-4 w-4 mr-2" />
                  Generate Infrastructure
                </Button>
              )}
              {project?.umlDiagrams && project?.infraCode && !project?.appCode && (
                <Button onClick={handleGenerateCode} disabled={isGeneratingCode} className="flex-1 min-w-fit">
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Code2 className="h-4 w-4 mr-2" />
                      Generate App Code
                    </>
                  )}
                </Button>
              )}
              {(project?.umlDiagrams || project?.infraCode || project?.appCode) && (
                <Button variant="outline" onClick={() => setFlowMode('guided')} className="flex-1 min-w-fit">
                  <Wand2 className="h-4 w-4 mr-2" />
                  Try Guided Flow
                </Button>
              )}
            </div>

            {/* Detailed Project Overview for Complete Projects */}
            {project?.appCode && project.appCode.validation && project.appCode.buildConfig && (
              <div className="mt-6 pt-6 border-t">
            <ProjectOverview 
              appCode={project.appCode as any}
              projectId={id}
              onDeploy={() => setActiveTab("application")}
              onDownload={() => {
                toast({
                  title: "Download Started",
                  description: "Preparing project files for download...",
                })
              }}
            />
              </div>
            )}
              </CardContent>
            </Card>
      </TabsContent>

      {/* Diagrams Tab */}
      <TabsContent value="diagrams" className="space-y-4">
        {(() => {
          // Debug logging for diagram data
          console.log("Diagrams tab - project.umlDiagrams:", project?.umlDiagrams)
          console.log("Diagrams type:", typeof project?.umlDiagrams)
          
          if (project?.umlDiagrams) {
            // Check if it's an enhanced UML object with multiple diagram types
            const isEnhancedFormat = typeof project.umlDiagrams === 'object' && 
              !Array.isArray(project.umlDiagrams) &&
              Object.keys(project.umlDiagrams).some(key => 
                ['class', 'sequence', 'component', 'uiComponent', 'architecture', 'entity'].includes(key)
              )
            
            console.log("Is enhanced format:", isEnhancedFormat)
            console.log("Available diagram types:", Object.keys(project.umlDiagrams))
            
            if (isEnhancedFormat) {
              // Enhanced format - pass the whole object
              return (
                <DiagramTabs 
                  diagrams={project.umlDiagrams} 
                  isGenerating={isGeneratingUML}
                  onRegenerateAll={handleGenerateUML}
                />
              )
            } else if (Array.isArray(project.umlDiagrams)) {
              // Legacy array format
              return (
                <DiagramTabs 
                  diagrams={project.umlDiagrams} 
                  isGenerating={isGeneratingUML}
                  onRegenerateAll={handleGenerateUML}
                />
              )
            } else {
              // Single diagram or string format - convert to enhanced format
              const convertedDiagrams = {
                class: typeof project.umlDiagrams === 'string' ? project.umlDiagrams : JSON.stringify(project.umlDiagrams)
              }
              return (
                <DiagramTabs 
                  diagrams={convertedDiagrams} 
                  isGenerating={isGeneratingUML}
                  onRegenerateAll={handleGenerateUML}
                />
              )
            }
          }
          
          return (
            <Card>
              <CardContent className="text-center py-12">
                <Layers className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Diagrams Available</h3>
                <p className="text-muted-foreground mb-4">
                  Generate UML diagrams from your project prompt to visualize the architecture.
                </p>
                <Button 
                  onClick={handleGenerateUML}
                  variant="outline"
                >
                  <Layers className="h-4 w-4 mr-2" />
                  Generate Diagrams
                </Button>
              </CardContent>
            </Card>
          )
        })()}
      </TabsContent>

      {/* Design Documentation Tab */}
      <TabsContent value="design" className="space-y-4">
        {project?.designDocument ? (
          <Card>
            <CardHeader>
              <CardTitle>Design Documentation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <h2>{project.designDocument.metadata?.title || 'Design Document'}</h2>
                <p>{project.designDocument.executive_summary}</p>
                {/* Add more documentation sections as needed */}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Design Document Available</h3>
              <p className="text-gray-600 mb-6">
                Design documentation will be generated during the project creation process
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Infrastructure Tab */}
      <TabsContent value="infrastructure" className="space-y-4">
        {project?.infraCode ? (
          <>
            {/* Infrastructure Actions Header */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Cloud className="h-5 w-5" />
                    Infrastructure Code
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={handleRegenerateInfrastructure}
                    disabled={isGeneratingInfrastructure}
                    className="border-orange-200 text-orange-600 hover:bg-orange-50"
                  >
                    {isGeneratingInfrastructure ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Regenerate Infrastructure
                      </>
                    )}
                  </Button>
                </CardTitle>
                <CardDescription>
                  Deploy your infrastructure to AWS or regenerate with latest improvements
                </CardDescription>
              </CardHeader>
            </Card>
            
          <InfrastructureDeployment 
            projectId={id}
            iacCode={project.infraCode}
            onDeploymentComplete={(outputs) => {
              toast({
                title: "Infrastructure Deployed",
                description: "Infrastructure has been successfully deployed!",
              })
            }}
          />
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Cloud className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Infrastructure Code Available</h3>
              <p className="text-gray-600 mb-6">
                Generate infrastructure code based on your project requirements
              </p>
              <Button onClick={handleGenerateInfrastructure}>
                <Cloud className="h-4 w-4 mr-2" />
                Generate Infrastructure Code
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Application Development Tab */}
      <TabsContent value="application" className="space-y-4">
        {project?.appCode ? (
          project.appCode.validation && project.appCode.buildConfig ? (
            <AppDevelopment 
              projectId={id}
              appCode={project.appCode}
              projectPrompt={project.prompt}
              umlDiagrams={project.umlDiagrams}
              infraCode={project.infraCode}
              onCodeChange={(updatedCode) => {
                // Update project with new code
                if (project) {
                  setProject({ ...project, appCode: updatedCode })
                }
              }}
            />
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Rocket className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Legacy App Code Format</h3>
                <p className="text-gray-600 mb-6">
                  Application code exists but needs to be regenerated for the development pipeline
                </p>
                <Button onClick={handleGenerateCode} disabled={isGeneratingCode}>
                  {isGeneratingCode ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Regenerating...
                    </>
                  ) : (
                    <>Regenerate Application Code</>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Rocket className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Application Code Available</h3>
              <p className="text-gray-600 mb-6">
                Generate application code first to access the development pipeline
              </p>
              <Button onClick={handleGenerateCode} disabled={isGeneratingCode}>
                {isGeneratingCode ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>Generate Application Code</>
                )}
              </Button>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      {/* Code Tab */}
      {/* REMOVED: The Code tab and its content */}
    </Tabs>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <DashboardHeader />
        <Card className="mt-8">
          <CardContent className="p-8 text-center">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4">
      <DashboardHeader />
      
      <div className="mt-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">{project?.name || "Project"}</h1>
            <p className="text-muted-foreground mt-1">{project?.description || "No description provided"}</p>
          </div>
          
          {flowMode && (
            <div className="flex items-center gap-2">
              <Badge variant={flowMode === 'expert' ? 'default' : 'secondary'}>
                {flowMode === 'expert' ? 'Expert Mode' : 'Guided Mode'}
              </Badge>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setFlowMode(null)}
              >
                Switch Mode
              </Button>
            </div>
          )}
        </div>

        {renderPromptSection()}

        {!flowMode && renderFlowSelector()}
        {flowMode === 'guided' && renderGuidedFlow()}
        {flowMode === 'expert' && renderExpertMode()}
      </div>

      {/* Prompt Edit Dialog */}
      <Dialog open={showPromptDialog} onOpenChange={setShowPromptDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {project?.prompt ? 'Edit Project Requirements' : 'Add Project Requirements'}
            </DialogTitle>
            <DialogDescription>
              Describe what you want to build in detail. This will be used to generate diagrams, code, and infrastructure.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-prompt">
                Project Requirements
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Textarea
                id="edit-prompt"
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                placeholder="Describe what you want to build in detail:&#10;&#10;Example:&#10;- Build an e-commerce platform with user authentication&#10;- Include product catalog, shopping cart, and payment processing&#10;- Support multiple payment methods (Stripe, PayPal)&#10;- Admin dashboard for inventory management&#10;- Email notifications for orders&#10;- Mobile-responsive design"
                className="min-h-[200px] resize-none"
                required
              />
              <p className="text-xs text-muted-foreground">
                Be specific about features, technologies, and requirements.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPromptDialog(false)}>
              Cancel
            </Button>
            <Button onClick={updateProjectPrompt} disabled={isUpdatingPrompt || !editPrompt.trim()}>
              {isUpdatingPrompt ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                project?.prompt ? 'Update Requirements' : 'Add Requirements'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 