"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { useAuth } from "@/contexts/AuthContext"
import { authenticatedFetch } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Cloud, 
  Server, 
  Database, 
  Code2, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Trash2,
  Download,
  Eye,
  Settings,
  Brain,
  Plus,
  X,
  LogOut,
  Grid3X3,
  List
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { ProjectTile } from "@/components/project-tile"
import { InfrastructureTiers } from "@/components/infrastructure-tiers"
import { EnhancedInfrastructureTiers } from "@/components/enhanced-infrastructure-tiers"
import { PricingManager } from "@/components/pricing-manager"
import { GeolocationRegionSelector } from "@/components/geolocation-region-selector"
import { SQLiteExplorer } from "@/components/sqlite-explorer"

interface InfrastructureJob {
  id: string
  jobId?: string // For backward compatibility
  type: string
  status: string
  progress: number
  phase: 'analyzing' | 'generating-uml' | 'generating-terraform' | 'deploying' | 'destroying' | 'completed' | 'failed'
  prompt?: string
  result?: any
  error?: string
  projectId?: string
  userId?: string
  createdAt: string
  updatedAt: string
  lastAccessed: string
  umlDiagrams?: any
  terraformCode?: string
  deploymentStatus?: any
}

interface Project {
  projectId: string
  status: string
  createdAt: string
  updatedAt: string
  terraformCode?: string
  umlDiagrams?: any
  deploymentStatus?: any
  prompt?: string
  latestJob?: any
  jobs: InfrastructureJob[]
}

export default function Dashboard() {
  const [prompt, setPrompt] = useState("")
  const [projectId, setProjectId] = useState("")
  const [autoDeploy, setAutoDeploy] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [currentJob, setCurrentJob] = useState<InfrastructureJob | null>(null)
  const [jobs, setJobs] = useState<InfrastructureJob[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [completedJob, setCompletedJob] = useState<InfrastructureJob | null>(null)
  const [activeTab, setActiveTab] = useState("create")
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [selectedJob, setSelectedJob] = useState<InfrastructureJob | null>(null)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)
  const [deployingJobId, setDeployingJobId] = useState<string | null>(null)
  const [destroyingJobId, setDestroyingJobId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'tiles' | 'list'>('tiles')
  const [showInfrastructureTiers, setShowInfrastructureTiers] = useState(false)
  const [tiersJobId, setTiersJobId] = useState<string | null>(null)
  const [selectedRegion, setSelectedRegion] = useState('us-east-1')
  const { toast } = useToast()
  const { user, logout } = useAuth()
  const router = useRouter()

  // Load user's projects on component mount
  useEffect(() => {
    const loadUserProjects = async () => {
      if (!user) {
        console.log('No user found, skipping project load')
        return;
      }
      
      console.log('Loading projects for user:', user.id)
      
      try {
        const response = await authenticatedFetch('/api/iac/user')
        console.log('API response status:', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('Projects data:', data)
          setProjects(data.projects || [])
        } else {
          const errorData = await response.json()
          console.error('API error:', errorData)
        }
      } catch (error) {
        console.error('Error loading user projects:', error)
      }
    }

    loadUserProjects()
  }, [user])

  // Auto-dismiss success message after 10 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false)
      }, 10000) // 10 seconds

      return () => clearTimeout(timer)
    }
  }, [showSuccessMessage])

  const resetForm = () => {
    setPrompt("")
    setProjectId("")
    setAutoDeploy(false)
    setShowSuccessMessage(false)
    setCompletedJob(null)
  }

  const refreshProjects = async () => {
    if (!user) {
      console.log('No user found, skipping project refresh')
      return;
    }
    
    console.log('Refreshing projects for user:', user.id)
    
    try {
      const response = await authenticatedFetch('/api/iac/user')
      console.log('Refresh API response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        console.log('Refresh projects data:', data)
        setProjects(data.projects || [])
      } else {
        const errorData = await response.json()
        console.error('Refresh API error:', errorData)
      }
    } catch (error) {
      console.error('Error refreshing projects:', error)
    }
  }

  const handleTierSelected = (tier: any) => {
    console.log('Selected infrastructure tier:', tier);
    console.log('Current tiersJobId:', tiersJobId);
    console.log('Current projectId:', projectId);
    console.log('Available jobs:', jobs.map(j => ({ id: j.id, projectId: j.projectId })));
    
    // Use the projectId from the form state (which was set during creation)
    let finalProjectId = projectId;
    
    // Fallback: Extract project ID from the current job
    if (!finalProjectId) {
      const currentJobData = jobs.find(job => job.id === tiersJobId);
      console.log('Current job data:', currentJobData);
      finalProjectId = currentJobData?.projectId || '';
    }
    
    // Final fallback: generate a new project ID
    if (!finalProjectId) {
      finalProjectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    console.log('Final project ID for navigation:', finalProjectId);
    
    if (finalProjectId) {
      // Navigate to project details page
      router.push(`/projects/${finalProjectId}`);
      
      toast({
        title: "Redirecting to Project Details",
        description: "Taking you to the project details page...",
      });
    } else {
      toast({
        title: "Navigation Error",
        description: "Could not determine project ID for navigation",
        variant: "destructive"
      });
    }
  };

  const handleCreateInfrastructure = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Please describe your infrastructure requirements",
        variant: "destructive",
      })
      return
    }

    setIsCreating(true)
    setShowSuccessMessage(false) // Clear any existing success message
    
    // Generate a consistent project ID
    const generatedProjectId = `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    setProjectId(generatedProjectId);
    
    try {
      // Use the new infrastructure tiers endpoint
      const response = await authenticatedFetch('/api/iac/tiers', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          projectId: generatedProjectId,
          region: selectedRegion,
          userId: user?.id
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setTiersJobId(data.jobId)
        setShowInfrastructureTiers(true)
        
        toast({
          title: "Infrastructure Tiers Generation Started",
          description: "Generating three infrastructure options with cost analysis. This may take a few minutes.",
        })
      } else {
        throw new Error(data.error || 'Failed to generate infrastructure tiers')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate infrastructure tiers",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    let pollCount = 0
    const maxPolls = 300 // 10 minutes max (300 * 2 seconds)
    
    const poll = async () => {
      try {
        pollCount++
        
        const response = await authenticatedFetch(`/api/iac/status/${jobId}`)
        
        if (response.status === 404) {
          // Job not found, might have expired
          setIsCreating(false)
          setCurrentJob(null)
          toast({
            title: "Job Not Found",
            description: "The job may have expired or been deleted.",
            variant: "destructive",
          })
          return
        }
        
        const job: InfrastructureJob = await response.json()
        
        if (response.ok) {
          setCurrentJob(job)
          
          // Update jobs list
          setJobs(prev => {
            const existing = prev.find(j => j.id === jobId)
            if (existing) {
              return prev.map(j => j.id === jobId ? job : j)
            } else {
              return [job, ...prev]
            }
          })
          
          if (job.status === 'completed') {
            setIsCreating(false)
            setCurrentJob(null)
            setCompletedJob(job)
            setShowSuccessMessage(true)
            setActiveTab("manage") // Switch to manage tab to show the completed job
            toast({
              title: "Infrastructure Created!",
              description: "Your infrastructure has been generated successfully. Check the 'Manage Infrastructure' tab to view details.",
            })
            refreshProjects() // Refresh the projects list
          } else if (job.status === 'failed') {
            setIsCreating(false)
            setCurrentJob(null)
            toast({
              title: "Infrastructure Creation Failed",
              description: job.error || "An error occurred during infrastructure creation",
              variant: "destructive",
            })
          } else if (job.status === 'pending' || job.status === 'processing') {
            // Continue polling with exponential backoff
            if (pollCount < maxPolls) {
              const delay = Math.min(5000 + (pollCount * 1000), 15000) // Increased base delay and max
              setTimeout(poll, delay)
            } else {
              setIsCreating(false)
              toast({
                title: "Timeout",
                description: "Job is taking longer than expected. Please check back later.",
                variant: "destructive",
              })
            }
          }
        } else {
          throw new Error(job.error || 'Failed to get job status')
        }
      } catch (error) {
        console.error('Error polling job status:', error)
        
        // Retry with exponential backoff on network errors
        if (pollCount < maxPolls) {
          const delay = Math.min(5000 + (pollCount * 1000), 30000)
          setTimeout(poll, delay)
        } else {
          setIsCreating(false)
          setCurrentJob(null)
          toast({
            title: "Error",
            description: "Failed to get job status. Please try again.",
            variant: "destructive",
          })
        }
      }
    }
    
    poll()
  }

  const handleDeploy = async (job: InfrastructureJob) => {
    setIsDeploying(true)
    setDeployingJobId(job.id)
    console.log('[Deploy] Starting deployment for job:', job.id)
    console.log('[Deploy] Using projectId:', job.projectId || job.id.replace('infra-', 'project-'))
    
    try {
      const response = await authenticatedFetch('/api/iac/deploy', {
        method: 'POST',
        body: JSON.stringify({
          projectId: job.projectId || job.id.replace('infra-', 'project-')
        }),
      })

      const data = await response.json()
      console.log('[Deploy] Response:', data)
      
      if (response.ok) {
        toast({
          title: "Deployment Started",
          description: "Your infrastructure is being deployed to AWS. This may take several minutes.",
        })
        
        // Create a new deployment job entry
        const deploymentJob: InfrastructureJob = {
          id: data.jobId || `deploy-${Date.now()}`,
          type: 'infrastructure',
          status: 'pending',
          progress: 0,
          phase: 'deploying',
          projectId: job.projectId || job.id.replace('infra-', 'project-'),
          userId: user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        }
        
        setJobs(prev => [...prev, deploymentJob])

        // Start polling for deploy status using the new job ID
        pollDeployStatus(data.jobId || deploymentJob.id)
      } else {
        throw new Error(data.error || 'Failed to deploy infrastructure')
      }
    } catch (error) {
      console.error('[Deploy] Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to deploy infrastructure",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
      setDeployingJobId(null)
    }
  }

  const pollDeployStatus = async (jobId: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await authenticatedFetch(`/api/iac/status/${jobId}`)
        const job = await response.json()

        if (response.ok) {
          // Update the job in the list
          setJobs(prev => prev.map(j => 
            j.id === jobId ? { ...j, ...job } : j
          ))

          if (job.status === 'completed') {
            toast({
              title: "Deployment Completed",
              description: "Your infrastructure has been successfully deployed to AWS!",
            })
            setIsDeploying(false)
            setDeployingJobId(null)
            return
          } else if (job.status === 'failed') {
            let errorMessage = job.error || "Failed to deploy infrastructure";
            
            // Provide a more helpful message for the terraform file not found error
            if (errorMessage.includes('no such file or directory') && errorMessage.includes('terraform.tf')) {
              errorMessage = "Terraform configuration not found. The system will attempt to restore it from the database. If this fails, please regenerate the infrastructure first.";
            }
            
            toast({
              title: "Deployment Failed",
              description: errorMessage,
              variant: "destructive",
            })
            setIsDeploying(false)
            setDeployingJobId(null)
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          toast({
            title: "Polling Timeout",
            description: "Deployment is taking longer than expected. Please check the status manually.",
            variant: "destructive",
          })
          setIsDeploying(false)
          setDeployingJobId(null)
        }
      } catch (error) {
        console.error('[Poll Deploy] Error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          toast({
            title: "Polling Error",
            description: "Failed to check deployment status. Please check manually.",
            variant: "destructive",
          })
          setIsDeploying(false)
          setDeployingJobId(null)
        }
      }
    }

    poll()
  }

  const handleViewCode = (job: InfrastructureJob) => {
    setSelectedJob(job)
    setShowCodePreview(true)
  }

  const handleDownloadCode = (job: InfrastructureJob) => {
    if (!job.terraformCode) {
      toast({
        title: "No Code Available",
        description: "Terraform code has not been generated for this job.",
        variant: "destructive",
      })
      return
    }

    const blob = new Blob([job.terraformCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terraform-${job.id}.tf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Code Downloaded",
      description: "Terraform code has been downloaded to your device.",
    })
  }

  const handleDestroyInfrastructure = async (job: InfrastructureJob) => {
    if (!confirm('Are you sure you want to destroy this infrastructure? This will delete all AWS resources but preserve the Terraform configuration for future deployments.')) {
      return
    }

    setIsDestroying(true)
    setDestroyingJobId(job.id)

    try {
      const response = await authenticatedFetch('/api/iac/destroy', {
        method: 'POST',
        body: JSON.stringify({
          projectId: job.projectId || job.id.replace('infra-', 'project-')
        }),
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Infrastructure Destruction Started",
          description: "Your infrastructure is being destroyed. This may take several minutes.",
        })
        
        // Create a new destruction job entry
        const destructionJob: InfrastructureJob = {
          id: data.jobId || `destroy-${Date.now()}`,
          type: 'infrastructure',
          status: 'pending',
          progress: 0,
          phase: 'destroying',
          projectId: job.projectId || job.id.replace('infra-', 'project-'),
          userId: user?.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString()
        }
        
        setJobs(prev => [...prev, destructionJob])

        // Start polling for destroy status using the new job ID
        pollDestroyStatus(data.jobId || destructionJob.id)
      } else {
        throw new Error(data.error || 'Failed to destroy infrastructure')
      }
    } catch (error) {
      console.error('[Destroy] Error:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to destroy infrastructure",
        variant: "destructive",
      })
    } finally {
      setIsDestroying(false)
      setDestroyingJobId(null)
    }
  }

  const pollDestroyStatus = async (jobId: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await authenticatedFetch(`/api/iac/status/${jobId}`)
        const job = await response.json()

        if (response.ok) {
          // Update the job in the list
          setJobs(prev => prev.map(j => 
            j.id === jobId ? { ...j, ...job } : j
          ))

          if (job.status === 'completed') {
            toast({
              title: "Infrastructure Destroyed",
              description: "Your infrastructure has been successfully destroyed. Terraform configuration has been preserved for future deployments.",
            })
            setIsDestroying(false)
            setDestroyingJobId(null)
            return
          } else if (job.status === 'failed') {
            toast({
              title: "Destruction Failed",
              description: job.error || "Failed to destroy infrastructure",
              variant: "destructive",
            })
            setIsDestroying(false)
            setDestroyingJobId(null)
            return
          }
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          toast({
            title: "Polling Timeout",
            description: "Destruction is taking longer than expected. Please check the status manually.",
            variant: "destructive",
          })
          setIsDestroying(false)
          setDestroyingJobId(null)
        }
      } catch (error) {
        console.error('[Poll Destroy] Error:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          toast({
            title: "Polling Error",
            description: "Failed to check destruction status. Please check manually.",
            variant: "destructive",
          })
          setIsDestroying(false)
          setDestroyingJobId(null)
        }
      }
    }

    poll()
  }

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'analyzing':
        return <Brain className="h-4 w-4" />
      case 'generating-uml':
        return <Database className="h-4 w-4" />
      case 'generating-terraform':
        return <Code2 className="h-4 w-4" />
      case 'deploying':
        return <Server className="h-4 w-4" />
      case 'destroying':
        return <Trash2 className="h-4 w-4" />
      case 'completed':
        return <CheckCircle className="h-4 w-4" />
      case 'failed':
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'completed':
        return 'text-green-600'
      case 'failed':
        return 'text-red-600'
      case 'deploying':
        return 'text-blue-600'
      case 'destroying':
        return 'text-orange-600'
      default:
        return 'text-yellow-600'
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Infrastructure Dashboard</h1>
          <p className="text-muted-foreground">Create and manage your cloud infrastructure</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Link href="/smart-architect">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Smart Architect
              </Button>
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Cloud className="h-6 w-6 text-primary" />
            <span className="font-semibold">InfraAI</span>
          </div>
          
          {/* User Profile and Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <p className="text-xs text-muted-foreground">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Success Message */}
      {showSuccessMessage && completedJob && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800">
                  Infrastructure Generated Successfully!
                </h3>
                <p className="text-green-700 mt-1">
                  Your infrastructure has been created and is ready for deployment.
                  {completedJob && (
                    <span className="block text-sm text-green-600 mt-1">
                      Job ID: <code className="bg-green-100 px-1 rounded text-xs">{completedJob.id}</code>
                    </span>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowSuccessMessage(false)
                      setActiveTab("manage")
                    }}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View Infrastructure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetForm()
                      setActiveTab("create")
                    }}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Another
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSuccessMessage(false)}
                    className="border-green-300 text-green-700 hover:bg-green-100"
                  >
                    <X className="mr-2 h-4 w-4" />
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Infrastructure Tiers Component */}
      {showInfrastructureTiers && tiersJobId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Choose Your Infrastructure
            </CardTitle>
            <CardDescription>
              Select the infrastructure tier that best fits your needs and budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <EnhancedInfrastructureTiers 
                jobId={tiersJobId} 
                onTierSelected={handleTierSelected}
              />
              
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInfrastructureTiers(false)
                    setTiersJobId(null)
                    resetForm()
                  }}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Create New Infrastructure
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="create">Create Infrastructure</TabsTrigger>
          <TabsTrigger value="manage">Manage Infrastructure</TabsTrigger>
          <TabsTrigger value="pricing">AWS Pricing</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Create New Infrastructure
              </CardTitle>
              <CardDescription>
                Describe your application architecture and let AI generate three infrastructure options with cost analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe Your Infrastructure</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., I need a blog application with user authentication, comment system, and admin dashboard. The app should handle moderate traffic and be cost-effective."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="projectId">Project ID (Optional)</Label>
                  <Input
                    id="projectId"
                    placeholder="my-awesome-app"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="autoDeploy"
                    checked={autoDeploy}
                    onChange={(e) => setAutoDeploy(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="autoDeploy">Auto-deploy to AWS</Label>
                </div>
              </div>

              <GeolocationRegionSelector
                value={selectedRegion}
                onChange={setSelectedRegion}
                disabled={isCreating}
                showCard={false}
              />
              
              <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="font-medium text-blue-800 mb-1">💡 What you'll get:</p>
                <ul className="text-blue-700 space-y-1">
                  <li>• <strong>Low Cost</strong> - Budget-friendly serverless (high maintenance)</li>
                  <li>• <strong>Medium Cost</strong> - Balanced performance and cost (medium maintenance)</li>
                  <li>• <strong>High Cost</strong> - Enterprise-ready managed services (low maintenance)</li>
                </ul>
              </div>

              <Button 
                onClick={handleCreateInfrastructure} 
                disabled={isCreating || !prompt.trim()}
                className="w-full"
              >
                {isCreating ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Generating Infrastructure Options...
                  </>
                ) : (
                  <>
                    <Cloud className="mr-2 h-4 w-4" />
                    Generate Infrastructure Options
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Current Job Progress */}
          {currentJob && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPhaseIcon(currentJob.phase)}
                  <span className={getPhaseColor(currentJob.phase)}>
                    {currentJob.phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                </CardTitle>
                <CardDescription>
                  Job ID: {currentJob.id}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Progress value={currentJob.progress} className="w-full" />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>{currentJob.progress}% Complete</span>
                    <span>{currentJob.status}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your Projects</h2>
              <p className="text-muted-foreground">Manage your infrastructure projects</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'tiles' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tiles')}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={refreshProjects}
              >
                Refresh
              </Button>
            </div>
          </div>

          {projects.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Cloud className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Create your first infrastructure project to see it here
                </p>
                <Button onClick={() => setActiveTab("create")}>
                  Create Infrastructure
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className={viewMode === 'tiles' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {projects.map((project) => (
                <ProjectTile
                  key={project.projectId}
                  project={project}
                  onRefresh={refreshProjects}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="space-y-6">
          <PricingManager />
        </TabsContent>

        <TabsContent value="database" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Database Explorer
              </CardTitle>
              <CardDescription>
                Explore your application's database in real-time. View tables, execute custom queries, and monitor database performance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SQLiteExplorer />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Code Preview Modal */}
      {showCodePreview && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold">Terraform Code Preview</h2>
                <p className="text-muted-foreground text-sm">
                  Job ID: {selectedJob.id} • Generated: {new Date(selectedJob.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadCode(selectedJob)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCodePreview(false)}
                >
                  <X className="mr-2 h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {selectedJob.terraformCode ? (
                <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                  <pre className="text-sm font-mono whitespace-pre-wrap">
                    {selectedJob.terraformCode}
                  </pre>
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground">
                  <AlertCircle className="mr-2 h-4 w-4" />
                  No Terraform code available for this job
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
}
