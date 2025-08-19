'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import DiagramTabs from '@/components/diagram-tabs'
import { 
  ArrowLeft, 
  Server, 
  Code2, 
  Database, 
  Cloud, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Trash2,
  Download,
  Eye,
  Settings,
  Brain,
  FileText,
  BarChart3,
  Zap,
  Shield,
  TrendingUp,
  Calendar,
  User,
  Users,
  GitBranch,
  Globe,
  HardDrive,
  Network,
  Activity,
  Rocket,
  DollarSign,
  ArrowUpDown,
  Target
} from 'lucide-react'
import DeploymentForm from '@/components/deployment-form'
import { InfrastructureCleanup } from '@/components/infrastructure-cleanup'

interface PerformanceProfile {
  concurrentUsers: {
    baseline: number;
    peak: number;
    burst: number;
  };
  responseTime: {
    p50: string;
    p95: string;
    p99: string;
  };
  throughput: {
    requestsPerSecond: number;
    dataTransferGB: number;
  };
  availability: string;
}

interface AutoScalingPlan {
  enabled: boolean;
  scalingPolicy: 'horizontal' | 'vertical' | 'hybrid';
  triggers: Array<{
    type: string;
    threshold: number;
    action: string;
    description: string;
  }>;
  limits: {
    minInstances: number;
    maxInstances: number;
    targetCPUUtilization: number;
    targetMemoryUtilization: number;
  };
  cooldownPeriod: number;
  estimatedCostImpact: string;
}

interface ScalingTier {
  name: string;
  concurrentUsers: number;
  monthlyCost: number;
  features: string[];
  autoScaling: boolean;
  estimatedTraffic: {
    dailyRequests: number;
    peakRequestsPerSecond: number;
  };
}

interface InfrastructureTier {
  name: string;
  description: string;
  costBreakdown: {
    resources: Array<{
      service: string;
      resource: string;
      estimatedMonthlyCost: number;
      costCalculation: string;
      notes: string;
    }>;
    totalMonthlyCost: number;
    costNotes: string[];
  };
  maintenanceLevel: 'high' | 'medium' | 'low';
  estimatedMonthlyCost: number;
  pros: string[];
  cons: string[];
  performanceProfile: PerformanceProfile;
  autoScalingPlan: AutoScalingPlan;
  scalingTiers: ScalingTier[];
  isDetailed?: boolean;
  terraformCode?: string;
  architectureDiagram?: string;
}

interface InfrastructureOptions {
  lowCost: InfrastructureTier;
  mediumCost: InfrastructureTier;
  highCost: InfrastructureTier;
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
  jobs: any[]
  infrastructureTiers?: InfrastructureOptions
  selectedTier?: InfrastructureTier
}

interface InfrastructureJob {
  id: string
  type: string
  status: string
  progress: number
  phase: string
  prompt?: string
  result?: any
  error?: string
  projectId?: string
  userId?: string
  createdAt: string
  updatedAt: string
  lastAccessed: string
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  const projectId = params.id as string

  useEffect(() => {
    loadProjectDetails()
  }, [projectId, user])

  const loadProjectDetails = async () => {
    if (!user || !projectId) return

    try {
      setLoading(true)
      // Use the new efficient endpoint for single project lookup
      const response = await authenticatedFetch(`/api/iac/project/${projectId}`)
      
      if (response.ok) {
        const data = await response.json()
        const foundProject = data.project
        
        if (foundProject) {
          console.log('[ProjectDetails] Found project:', foundProject);
          console.log('[ProjectDetails] UML Diagrams:', foundProject.umlDiagrams);
          setProject(foundProject)
        } else {
          toast({
            title: "Project Not Found",
            description: "The requested project could not be found.",
            variant: "destructive"
          })
          router.push('/dashboard')
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to load project details.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error loading project details:', error)
      toast({
        title: "Error",
        description: "Failed to load project details.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeploy = async () => {
    if (!project?.terraformCode) {
      toast({
        title: "No Terraform Code",
        description: "Please generate infrastructure first",
        variant: "destructive"
      })
      return
    }

    setIsDeploying(true)
    try {
      const response = await authenticatedFetch('/api/iac/deploy', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.projectId,
          terraformCode: project.terraformCode
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Deployment Started",
          description: "Infrastructure deployment has been initiated.",
        })
        // Refresh project details
        setTimeout(loadProjectDetails, 2000)
      } else {
        const errorData = await response.json()
        toast({
          title: "Deployment Failed",
          description: errorData.error || "Failed to start deployment",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Deployment error:', error)
      toast({
        title: "Deployment Error",
        description: "An error occurred during deployment",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDestroy = async () => {
    if (!confirm('Are you sure you want to destroy this infrastructure? This action cannot be undone.')) {
      return
    }

    setIsDestroying(true)
    try {
      const response = await authenticatedFetch('/api/iac/destroy', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project?.projectId
        })
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Destruction Started",
          description: "Infrastructure destruction has been initiated.",
        })
        // Refresh project details
        setTimeout(loadProjectDetails, 2000)
      } else {
        const errorData = await response.json()
        toast({
          title: "Destruction Failed",
          description: errorData.error || "Failed to start destruction",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Destruction error:', error)
      toast({
        title: "Destruction Error",
        description: "An error occurred during destruction",
        variant: "destructive"
      })
    } finally {
      setIsDestroying(false)
    }
  }

  const handleDownloadCode = () => {
    if (!project?.terraformCode) return

    const blob = new Blob([project.terraformCode], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `terraform-${project.projectId}.tf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Code Downloaded",
      description: "Terraform code has been downloaded successfully.",
    })
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      case 'processing':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'failed':
        return 'bg-red-100 text-red-800'
      case 'processing':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const getMaintenanceColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  const getScalingPolicyIcon = (policy: string) => {
    switch (policy) {
      case 'horizontal': return <TrendingUp className="h-4 w-4" />;
      case 'vertical': return <ArrowUpDown className="h-4 w-4" />;
      case 'hybrid': return <Activity className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  }

  const getDeploymentStatus = () => {
    if (project?.deploymentStatus) {
      return 'Deployed'
    }
    if (project?.terraformCode) {
      return 'Ready to Deploy'
    }
    return 'Not Ready'
  }

  const getInfrastructureStatus = (): 'not-deployed' | 'deployed' | 'failed' | 'unknown' => {
    if (project?.deploymentStatus) {
      return 'deployed'
    }
    if (project?.terraformCode) {
      return 'not-deployed'
    }
    return 'unknown'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  <div className="h-64 bg-gray-200 rounded"></div>
                  <div className="h-96 bg-gray-200 rounded"></div>
                </div>
                <div className="space-y-6">
                  <div className="h-48 bg-gray-200 rounded"></div>
                  <div className="h-64 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="text-center py-12">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Project Not Found</h1>
              <p className="text-gray-600 mb-6">The requested project could not be found.</p>
              <Link href="/dashboard">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Project Details</h1>
                  <p className="text-gray-600">Project ID: {project.projectId}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusIcon(project.status)}
                  <span className="ml-1">{project.status}</span>
                </Badge>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-7">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
                  <TabsTrigger value="tiers">Tiers</TabsTrigger>
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="diagrams">Diagrams</TabsTrigger>
                  <TabsTrigger 
                    value="deploy" 
                    className={!project?.terraformCode ? 'opacity-50' : ''}
                    title={!project?.terraformCode ? 'Infrastructure must be deployed first' : ''}
                  >
                    Deploy Code
                  </TabsTrigger>
                  <TabsTrigger 
                    value="cleanup" 
                    className={!project?.deploymentStatus ? 'opacity-50' : ''}
                    title={!project?.deploymentStatus ? 'Infrastructure must be deployed first' : ''}
                  >
                    Cleanup
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                  {/* Project Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Project Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.prompt && (
                        <div>
                          <h3 className="font-semibold mb-2">Original Prompt</h3>
                          <p className="text-gray-700 bg-gray-50 p-3 rounded-md">
                            {project.prompt}
                          </p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="font-semibold mb-2">Created</h3>
                          <p className="text-gray-600">{formatDate(project.createdAt)}</p>
                        </div>
                        <div>
                          <h3 className="font-semibold mb-2">Last Updated</h3>
                          <p className="text-gray-600">{formatDate(project.updatedAt)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Job History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5" />
                        Job History
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {project.jobs.map((job: InfrastructureJob) => (
                          <div key={job.id} className="flex items-center justify-between p-3 border rounded-md">
                            <div className="flex items-center gap-3">
                              {getStatusIcon(job.status)}
                              <div>
                                <p className="font-medium">{job.phase.replace('-', ' ')}</p>
                                <p className="text-sm text-gray-600">Job ID: {job.id}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={getStatusColor(job.status)}>
                                {job.status}
                              </Badge>
                              <span className="text-sm text-gray-600">
                                {formatDate(job.updatedAt)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="infrastructure" className="space-y-6">
                  {/* Infrastructure Status */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5" />
                        Infrastructure Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Deployment Status</span>
                        <Badge className={getStatusColor(getDeploymentStatus().toLowerCase())}>
                          {getDeploymentStatus()}
                        </Badge>
                      </div>
                      
                      {project.deploymentStatus && (
                        <div className="bg-green-50 p-4 rounded-md">
                          <h4 className="font-semibold text-green-800 mb-2">Deployment Details</h4>
                          <pre className="text-sm text-green-700 whitespace-pre-wrap">
                            {JSON.stringify(project.deploymentStatus, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button 
                          onClick={handleDeploy} 
                          disabled={isDeploying || !project.terraformCode}
                          className="flex items-center gap-2"
                        >
                          <Play className="h-4 w-4" />
                          {isDeploying ? 'Deploying...' : 'Deploy'}
                        </Button>
                        <Button 
                          variant="destructive" 
                          onClick={handleDestroy}
                          disabled={isDestroying}
                          className="flex items-center gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          {isDestroying ? 'Destroying...' : 'Destroy'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tiers" className="space-y-6">
                  {project.selectedTier ? (
                    <div className="space-y-6">
                      {/* Selected Tier Overview */}
                      <Card className="border-2 border-blue-300 bg-blue-50">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div>
                              <CardTitle className="text-xl flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                Selected Infrastructure: {project.selectedTier.name || 'Unknown Tier'}
                              </CardTitle>
                              <CardDescription className="text-sm mt-2">
                                {project.selectedTier.description || 'No description available'}
                              </CardDescription>
                            </div>
                            <div className="text-right">
                              <div className="text-3xl font-bold text-green-600">
                                ${(project.selectedTier.estimatedMonthlyCost || 0).toFixed(2)}
                              </div>
                              <div className="text-sm text-gray-500">/month</div>
                              <Badge className={getMaintenanceColor(project.selectedTier.maintenanceLevel || 'medium')}>
                                {project.selectedTier.maintenanceLevel || 'medium'} maintenance
                              </Badge>
                            </div>
                          </div>
                        </CardHeader>
                      </Card>

                      {/* Detailed Tier Information */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Infrastructure Details
                          </CardTitle>
                          <CardDescription>
                            Performance profile, auto-scaling capabilities, and cost breakdown for your selected tier
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Performance Profile */}
                          {project.selectedTier.performanceProfile && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Users className="h-4 w-4" />
                                  Concurrent Users
                                </h4>
                                <div className="space-y-3">
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Baseline</span>
                                      <span>{(project.selectedTier.performanceProfile.concurrentUsers?.baseline || 0).toLocaleString()}</span>
                                    </div>
                                    <Progress value={(project.selectedTier.performanceProfile.concurrentUsers?.baseline || 0) / 1000} className="h-2" />
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Peak</span>
                                      <span>{(project.selectedTier.performanceProfile.concurrentUsers?.peak || 0).toLocaleString()}</span>
                                    </div>
                                    <Progress value={(project.selectedTier.performanceProfile.concurrentUsers?.peak || 0) / 1000} className="h-2" />
                                  </div>
                                  <div>
                                    <div className="flex justify-between text-sm mb-1">
                                      <span>Burst</span>
                                      <span>{(project.selectedTier.performanceProfile.concurrentUsers?.burst || 0).toLocaleString()}</span>
                                    </div>
                                    <Progress value={(project.selectedTier.performanceProfile.concurrentUsers?.burst || 0) / 1000} className="h-2" />
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Response Times
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm">P50 (Median)</span>
                                    <span className="font-medium">{project.selectedTier.performanceProfile.responseTime?.p50 || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">P95</span>
                                    <span className="font-medium">{project.selectedTier.performanceProfile.responseTime?.p95 || 'N/A'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm">P99</span>
                                    <span className="font-medium">{project.selectedTier.performanceProfile.responseTime?.p99 || 'N/A'}</span>
                                  </div>
                                </div>
                                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                                  <div className="flex items-center gap-2 text-sm text-blue-800">
                                    <BarChart3 className="h-4 w-4" />
                                    <span>Throughput: {project.selectedTier.performanceProfile.throughput?.requestsPerSecond || 0} req/s</span>
                                  </div>
                                  <div className="text-sm text-blue-700 mt-1">
                                    Availability: {project.selectedTier.performanceProfile.availability || 'N/A'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Auto-Scaling Plan */}
                          {project.selectedTier.autoScalingPlan && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                <h4 className="font-semibold mb-3 flex items-center gap-2">
                                  {getScalingPolicyIcon(project.selectedTier.autoScalingPlan.scalingPolicy || 'horizontal')}
                                  Auto-Scaling Plan
                                </h4>
                                <div className="space-y-3">
                                  <div className="flex items-center gap-2">
                                    <Badge variant={project.selectedTier.autoScalingPlan.enabled ? "default" : "secondary"}>
                                      {project.selectedTier.autoScalingPlan.enabled ? "Enabled" : "Disabled"}
                                    </Badge>
                                    <span className="text-sm capitalize">{project.selectedTier.autoScalingPlan.scalingPolicy || 'horizontal'} scaling</span>
                                  </div>
                                  <div className="text-sm space-y-1">
                                    <div>Min Instances: {project.selectedTier.autoScalingPlan.limits?.minInstances || 0}</div>
                                    <div>Max Instances: {project.selectedTier.autoScalingPlan.limits?.maxInstances || 0}</div>
                                    <div>Target CPU: {project.selectedTier.autoScalingPlan.limits?.targetCPUUtilization || 0}%</div>
                                    <div>Cooldown: {project.selectedTier.autoScalingPlan.cooldownPeriod || 0}s</div>
                                  </div>
                                  <div className="text-sm text-green-600">
                                    Cost Impact: {project.selectedTier.autoScalingPlan.estimatedCostImpact || 'N/A'}
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-3">Scaling Triggers</h4>
                                <div className="space-y-2">
                                  {project.selectedTier.autoScalingPlan.triggers?.map((trigger, index) => (
                                    <div key={index} className="p-3 border rounded-md">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-xs">
                                          {trigger.type?.toUpperCase() || 'UNKNOWN'}
                                        </Badge>
                                        <span className="text-sm font-medium">{trigger.threshold || 0}%</span>
                                      </div>
                                      <p className="text-sm text-gray-600">{trigger.description || 'No description'}</p>
                                    </div>
                                  )) || (
                                    <div className="p-3 border rounded-md text-sm text-gray-500">
                                      No scaling triggers configured
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Scaling Tiers */}
                          {project.selectedTier.scalingTiers && project.selectedTier.scalingTiers.length > 0 && (
                            <div>
                              <h4 className="font-semibold mb-3">Scaling Tiers</h4>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {project.selectedTier.scalingTiers.map((scalingTier, index) => (
                                  <Card key={index} className="border-2 border-gray-200">
                                    <CardHeader className="pb-3">
                                      <CardTitle className="text-lg">{scalingTier.name || 'Unknown Tier'}</CardTitle>
                                      <div className="flex items-center gap-2">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">{(scalingTier.concurrentUsers || 0).toLocaleString()} users</span>
                                      </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                      <div className="text-2xl font-bold text-green-600">
                                        ${(scalingTier.monthlyCost || 0).toFixed(2)}
                                        <span className="text-sm font-normal text-gray-500">/month</span>
                                      </div>
                                      <div className="space-y-2">
                                        <div className="text-sm">
                                          <strong>Traffic:</strong> {(scalingTier.estimatedTraffic?.dailyRequests || 0).toLocaleString()} requests/day
                                        </div>
                                        <div className="text-sm">
                                          <strong>Peak:</strong> {scalingTier.estimatedTraffic?.peakRequestsPerSecond || 0} req/s
                                        </div>
                                      </div>
                                      <div className="space-y-1">
                                        {scalingTier.features?.map((feature, featureIndex) => (
                                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                                            <CheckCircle className="h-3 w-3 text-green-500" />
                                            <span>{feature}</span>
                                          </div>
                                        )) || (
                                          <div className="text-sm text-gray-500">No features listed</div>
                                        )}
                                      </div>
                                    </CardContent>
                                  </Card>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Scaling Details and Range Pricing */}
                          {project.selectedTier && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Scaling Details & Range Pricing
                              </h4>
                            <div className="space-y-6">
                              {/* Current vs Scaled Scenarios */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card className="border-2 border-blue-200 bg-blue-50">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <Target className="h-4 w-4 text-blue-600" />
                                      Current Baseline
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="text-2xl font-bold text-blue-600">
                                      ${(project.selectedTier.estimatedMonthlyCost || 0).toFixed(2)}
                                      <span className="text-sm font-normal text-gray-500">/month</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Concurrent Users:</span>
                                        <span className="font-medium">{(project.selectedTier.performanceProfile?.concurrentUsers?.baseline || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Daily Requests:</span>
                                        <span className="font-medium">{(project.selectedTier.performanceProfile?.throughput?.requestsPerSecond || 0) * 86400} requests</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Response Time:</span>
                                        <span className="font-medium">{project.selectedTier.performanceProfile?.responseTime?.p50 || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>

                                <Card className="border-2 border-green-200 bg-green-50">
                                  <CardHeader className="pb-3">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                      <TrendingUp className="h-4 w-4 text-green-600" />
                                      Peak Scaling
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="text-2xl font-bold text-green-600">
                                      ${((project.selectedTier.estimatedMonthlyCost || 0) * 1.5).toFixed(2)}
                                      <span className="text-sm font-normal text-gray-500">/month</span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                      <div className="flex justify-between">
                                        <span>Concurrent Users:</span>
                                        <span className="font-medium">{(project.selectedTier.performanceProfile?.concurrentUsers?.peak || 0).toLocaleString()}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Daily Requests:</span>
                                        <span className="font-medium">{((project.selectedTier.performanceProfile?.throughput?.requestsPerSecond || 0) * 86400 * 1.5).toLocaleString()} requests</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Response Time:</span>
                                        <span className="font-medium">{project.selectedTier.performanceProfile?.responseTime?.p95 || 'N/A'}</span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Scaling Range Table */}
                              <Card>
                                <CardHeader>
                                  <CardTitle className="text-lg">Scaling Range Pricing</CardTitle>
                                  <CardDescription>
                                    Cost estimates for different scaling scenarios based on your selected infrastructure
                                  </CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                      <thead>
                                        <tr className="border-b-2 border-gray-200">
                                          <th className="text-left p-3 font-semibold">Scaling Level</th>
                                          <th className="text-left p-3 font-semibold">Concurrent Users</th>
                                          <th className="text-left p-3 font-semibold">Daily Requests</th>
                                          <th className="text-left p-3 font-semibold">Monthly Cost</th>
                                          <th className="text-left p-3 font-semibold">Cost Increase</th>
                                          <th className="text-left p-3 font-semibold">Response Time</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="p-3">
                                            <Badge variant="outline" className="bg-blue-50 text-blue-700">Baseline</Badge>
                                          </td>
                                          <td className="p-3">{(project.selectedTier.performanceProfile?.concurrentUsers?.baseline || 0).toLocaleString()}</td>
                                          <td className="p-3">{((project.selectedTier.performanceProfile?.throughput?.requestsPerSecond || 0) * 86400).toLocaleString()}</td>
                                          <td className="p-3 font-semibold text-green-600">${(project.selectedTier.estimatedMonthlyCost || 0).toFixed(2)}</td>
                                          <td className="p-3 text-gray-500">-</td>
                                          <td className="p-3">{project.selectedTier.performanceProfile?.responseTime?.p50 || 'N/A'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="p-3">
                                            <Badge variant="outline" className="bg-yellow-50 text-yellow-700">Growth</Badge>
                                          </td>
                                          <td className="p-3">{(project.selectedTier.performanceProfile?.concurrentUsers?.peak || 0).toLocaleString()}</td>
                                          <td className="p-3">{((project.selectedTier.performanceProfile?.throughput?.requestsPerSecond || 0) * 86400 * 1.5).toLocaleString()}</td>
                                          <td className="p-3 font-semibold text-green-600">${((project.selectedTier.estimatedMonthlyCost || 0) * 1.5).toFixed(2)}</td>
                                          <td className="p-3 text-orange-600">+50%</td>
                                          <td className="p-3">{project.selectedTier.performanceProfile?.responseTime?.p95 || 'N/A'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="p-3">
                                            <Badge variant="outline" className="bg-red-50 text-red-700">Burst</Badge>
                                          </td>
                                          <td className="p-3">{(project.selectedTier.performanceProfile?.concurrentUsers?.burst || 0).toLocaleString()}</td>
                                          <td className="p-3">{((project.selectedTier.performanceProfile?.throughput?.requestsPerSecond || 0) * 86400 * 3).toLocaleString()}</td>
                                          <td className="p-3 font-semibold text-green-600">${((project.selectedTier.estimatedMonthlyCost || 0) * 3).toFixed(2)}</td>
                                          <td className="p-3 text-red-600">+200%</td>
                                          <td className="p-3">{project.selectedTier.performanceProfile?.responseTime?.p99 || 'N/A'}</td>
                                        </tr>
                                        <tr className="border-b border-gray-100 hover:bg-gray-50">
                                          <td className="p-3">
                                            <Badge variant="outline" className="bg-purple-50 text-purple-700">Enterprise</Badge>
                                          </td>
                                          <td className="p-3">{((project.selectedTier.performanceProfile?.concurrentUsers?.burst || 0) * 2).toLocaleString()}</td>
                                          <td className="p-3">{((project.selectedTier.performanceProfile?.throughput?.requestsPerSecond || 0) * 86400 * 5).toLocaleString()}</td>
                                          <td className="p-3 font-semibold text-green-600">${((project.selectedTier.estimatedMonthlyCost || 0) * 5).toFixed(2)}</td>
                                          <td className="p-3 text-purple-600">+400%</td>
                                          <td className="p-3">{project.selectedTier.performanceProfile?.responseTime?.p99 || 'N/A'}</td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </div>
                                </CardContent>
                              </Card>

                              {/* Scaling Triggers and Cost Impact */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Scaling Triggers & Costs</CardTitle>
                                    <CardDescription>
                                      When and how your infrastructure will scale automatically
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-4">
                                    {project.selectedTier.autoScalingPlan?.triggers?.map((trigger, index) => (
                                      <div key={index} className="p-3 border rounded-md bg-gray-50">
                                        <div className="flex items-center justify-between mb-2">
                                          <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-xs">
                                              {trigger.type?.toUpperCase() || 'UNKNOWN'}
                                            </Badge>
                                            <span className="text-sm font-medium">{trigger.threshold || 0}%</span>
                                          </div>
                                          <div className="text-sm text-green-600 font-medium">
                                            +${((project.selectedTier.estimatedMonthlyCost || 0) * 0.2).toFixed(2)}/month
                                          </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{trigger.description || 'No description'}</p>
                                        <div className="text-xs text-gray-500">
                                          Estimated cost impact when triggered
                                        </div>
                                      </div>
                                    )) || (
                                      <div className="p-4 text-center text-gray-500">
                                        No scaling triggers configured
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                <Card>
                                  <CardHeader>
                                    <CardTitle className="text-lg">Scaling Recommendations</CardTitle>
                                    <CardDescription>
                                      Best practices for scaling your infrastructure
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent className="space-y-3">
                                    <div className="flex items-start gap-3 p-3 border rounded-md">
                                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div>
                                        <div className="font-medium text-sm">Monitor Usage Patterns</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Track your current usage to predict scaling needs
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-md">
                                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div>
                                        <div className="font-medium text-sm">Set Up Alerts</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Configure notifications for scaling events
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-md">
                                      <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div>
                                        <div className="font-medium text-sm">Budget Planning</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Plan for peak scaling costs in your budget
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-3 border rounded-md">
                                      <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                                      <div>
                                        <div className="font-medium text-sm">Performance Testing</div>
                                        <div className="text-xs text-gray-600 mt-1">
                                          Test your application under load before scaling
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Cost Optimization Tips */}
                              <Card className="border-2 border-yellow-200 bg-yellow-50">
                                <CardHeader>
                                  <CardTitle className="text-lg flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-yellow-600" />
                                    Cost Optimization Tips
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                      <div className="font-medium text-sm">Right-sizing</div>
                                      <div className="text-xs text-gray-600">
                                        Start with baseline and scale up based on actual usage
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="font-medium text-sm">Reserved Instances</div>
                                      <div className="text-xs text-gray-600">
                                        Consider reserved instances for predictable workloads
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="font-medium text-sm">Auto-scaling Limits</div>
                                      <div className="text-xs text-gray-600">
                                        Set reasonable min/max limits to control costs
                                      </div>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="font-medium text-sm">Monitoring</div>
                                      <div className="text-xs text-gray-600">
                                        Use CloudWatch to track costs and performance
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          </div>
                        )}

                          {/* Cost Breakdown */}
                          {project.selectedTier.costBreakdown && (
                            <div>
                              <h4 className="font-semibold mb-3 flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Cost Breakdown
                              </h4>
                              <div className="space-y-3">
                                {project.selectedTier.costBreakdown.resources?.map((resource, index) => (
                                  <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                                    <div>
                                      <div className="font-medium">{resource.service || 'Unknown'} - {resource.resource || 'Unknown'}</div>
                                      <div className="text-sm text-gray-600">{resource.costCalculation || 'No calculation details'}</div>
                                      {resource.notes && (
                                        <div className="text-xs text-blue-600 mt-1">{resource.notes}</div>
                                      )}
                                    </div>
                                    <div className="text-right">
                                      <div className="font-semibold">${(resource.estimatedMonthlyCost || 0).toFixed(2)}</div>
                                      <div className="text-sm text-gray-500">/month</div>
                                    </div>
                                  </div>
                                )) || (
                                  <div className="p-3 border rounded-md text-sm text-gray-500">
                                    No cost breakdown available
                                  </div>
                                )}
                              </div>
                              <div className="mt-4 p-4 bg-green-50 rounded-md">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-green-800">Total Monthly Cost</span>
                                  <span className="text-2xl font-bold text-green-600">
                                    ${(project.selectedTier.costBreakdown.totalMonthlyCost || 0).toFixed(2)}
                                  </span>
                                </div>
                                <div className="mt-2 text-sm text-green-700">
                                  {project.selectedTier.costBreakdown.costNotes?.join(' • ') || 'No cost notes available'}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Pros and Cons */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h4 className="font-semibold mb-3">Pros</h4>
                              <ul className="space-y-2">
                                {project.selectedTier.pros?.map((pro, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{pro}</span>
                                  </li>
                                )) || (
                                  <li className="text-sm text-gray-500">No pros listed</li>
                                )}
                              </ul>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-3">Cons</h4>
                              <ul className="space-y-2">
                                {project.selectedTier.cons?.map((con, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <AlertCircle className="h-4 w-4 text-yellow-500" />
                                    <span className="text-sm">{con}</span>
                                  </li>
                                )) || (
                                  <li className="text-sm text-gray-500">No cons listed</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : project.infrastructureTiers ? (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Tier Selected</h3>
                        <p className="text-gray-600 text-center mb-4">
                          Infrastructure tiers are available but no tier has been selected yet.
                        </p>
                        <Link href="/dashboard">
                          <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Select a Tier
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Infrastructure Tiers</h3>
                        <p className="text-gray-600 text-center mb-4">
                          This project doesn't have infrastructure tiers generated yet.
                        </p>
                        <Link href="/dashboard">
                          <Button>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Generate Tiers
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="code" className="space-y-6">
                  {/* Terraform Code */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code2 className="h-5 w-5" />
                        Terraform Code
                      </CardTitle>
                      <CardDescription>
                        Infrastructure as Code generated for this project
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {project.terraformCode ? (
                        <>
                          <div className="flex justify-end">
                            <Button onClick={handleDownloadCode} variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-2" />
                              Download Code
                            </Button>
                          </div>
                          <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                            <pre className="text-sm font-mono">
                              {project.terraformCode}
                            </pre>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <Code2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No Terraform code generated yet</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="diagrams" className="space-y-6">
                  {project.umlDiagrams?.architecture ? (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          Architecture Diagram
                        </CardTitle>
                        <CardDescription>
                          AWS infrastructure architecture for this project
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <DiagramTabs 
                          diagrams={{ architecture: project.umlDiagrams.architecture }} 
                          isGenerating={false}
                          onRegenerateAll={() => {
                            toast({
                              title: "Regeneration",
                              description: "Diagram regeneration not available in this view",
                            })
                          }}
                        />
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-8 text-gray-500">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>No architecture diagram generated yet</p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="deploy" className="space-y-6">
                  <DeploymentForm
                    projectId={project.projectId}
                    infrastructureId={project.latestJob?.id || project.projectId}
                    infrastructureStatus={getInfrastructureStatus()}
                    hasTerraformCode={!!project.terraformCode}
                    onDeploymentStarted={(deploymentId) => {
                      toast({
                        title: "Deployment Started",
                        description: "Application deployment has been initiated.",
                      })
                    }}
                  />
                </TabsContent>

                <TabsContent value="cleanup" className="space-y-6">
                  <InfrastructureCleanup 
                    projectId={project.projectId} 
                    infrastructureId={project.latestJob?.id || project.projectId}
                    infrastructureStatus={getInfrastructureStatus()}
                    hasTerraformCode={!!project.terraformCode}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Project Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Project Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Jobs</span>
                    <span className="font-semibold">{project.jobs.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Completed Jobs</span>
                    <span className="font-semibold">
                      {project.jobs.filter(job => job.status === 'completed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Failed Jobs</span>
                    <span className="font-semibold">
                      {project.jobs.filter(job => job.status === 'failed').length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Has Code</span>
                    <span className="font-semibold">
                      {project.terraformCode ? 'Yes' : 'No'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={handleDeploy} 
                    disabled={isDeploying || !project.terraformCode}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Deploy Infrastructure
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleDownloadCode}
                    disabled={!project.terraformCode}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Code
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={handleDestroy}
                    disabled={isDestroying}
                    className="w-full justify-start"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Destroy Infrastructure
                  </Button>
                  
                  {/* Deployment Readiness Indicator */}
                  <div className="mt-4 p-3 border rounded-md">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Deployment Ready</span>
                      <Badge variant={project.deploymentStatus ? 'default' : 'secondary'}>
                        {project.deploymentStatus ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div className="flex items-center gap-2">
                        <span>Infrastructure:</span>
                        <Badge variant={project.deploymentStatus ? 'default' : 'secondary'} className="text-xs">
                          {project.deploymentStatus ? 'Deployed' : 'Not Deployed'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Terraform Code:</span>
                        <Badge variant={project.terraformCode ? 'default' : 'secondary'} className="text-xs">
                          {project.terraformCode ? 'Available' : 'Not Available'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Project Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">Project Created</p>
                        <p className="text-xs text-gray-600">{formatDate(project.createdAt)}</p>
                      </div>
                    </div>
                    {project.jobs.map((job: InfrastructureJob, index: number) => (
                      <div key={job.id} className="flex items-start gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          job.status === 'completed' ? 'bg-green-500' :
                          job.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium">{job.phase.replace('-', ' ')}</p>
                          <p className="text-xs text-gray-600">{formatDate(job.updatedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
