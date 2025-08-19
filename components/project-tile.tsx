import React, { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Trash2, 
  Eye, 
  Download, 
  Settings,
  Server,
  Code2,
  Database,
  CheckCircle,
  XCircle,
  Clock,
  Cloud,
  FileText,
  ExternalLink,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth'
import { useToast } from '@/hooks/use-toast'

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
}

interface ProjectTileProps {
  project: Project
  onRefresh: () => void
}

export function ProjectTile({ project, onRefresh }: ProjectTileProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on buttons or expand/collapse
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('[data-expand]')) {
      return
    }
    // Navigate to project details
    window.location.href = `/projects/${project.projectId}`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
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

  const getDeploymentStatus = () => {
    if (project.deploymentStatus) {
      return 'Deployed'
    }
    if (project.terraformCode) {
      return 'Ready to Deploy'
    }
    return 'Not Ready'
  }

  const hasFailedJobs = () => {
    return project.jobs && project.jobs.some(job => job.status === 'failed')
  }

  const handleDeploy = async () => {
    if (!project.terraformCode) {
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
        body: JSON.stringify({ projectId: project.projectId })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Deployment Started",
          description: "Your infrastructure is being deployed to AWS.",
        })
        onRefresh()
      } else {
        throw new Error(data.error || 'Failed to deploy infrastructure')
      }
    } catch (error) {
      toast({
        title: "Deployment Failed",
        description: error instanceof Error ? error.message : "Failed to deploy infrastructure",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const handleDestroy = async () => {
    if (!confirm('Are you sure you want to destroy this infrastructure? This will delete all AWS resources but preserve the Terraform configuration for future deployments.')) {
      return
    }

    setIsDestroying(true)
    try {
      const response = await authenticatedFetch('/api/iac/destroy', {
        method: 'POST',
        body: JSON.stringify({ projectId: project.projectId })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Infrastructure Destruction Started",
          description: "Your infrastructure is being destroyed. Terraform configuration will be preserved.",
        })
        onRefresh()
      } else {
        throw new Error(data.error || 'Failed to destroy infrastructure')
      }
    } catch (error) {
      toast({
        title: "Destruction Failed",
        description: error instanceof Error ? error.message : "Failed to destroy infrastructure",
        variant: "destructive"
      })
    } finally {
      setIsDestroying(false)
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      const response = await authenticatedFetch('/api/iac/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.projectId
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Retry Started",
          description: "Infrastructure deployment retry has been initiated.",
        })
        onRefresh()
      } else {
        throw new Error(data.error || 'Failed to retry deployment')
      }
    } catch (error) {
      toast({
        title: "Retry Failed",
        description: error instanceof Error ? error.message : "Failed to retry deployment",
        variant: "destructive"
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const handleDelete = async () => {
    // Check if project has been provisioned
    const hasBeenProvisioned = project.deploymentStatus && 
      (project.deploymentStatus.status === 'deployed' || 
       project.deploymentStatus.status === 'deploying' ||
       project.deploymentStatus.status === 'failed_deployment');

    if (hasBeenProvisioned) {
      toast({
        title: "Cannot Delete",
        description: "This project has been provisioned. Please destroy the infrastructure first.",
        variant: "destructive"
      })
      return
    }

    if (!confirm('Are you sure you want to delete this project? This will permanently remove the project and all associated data. This action cannot be undone.')) {
      return
    }

    setIsDeleting(true)
    try {
      const response = await authenticatedFetch(`/api/iac/project/${project.projectId}`, {
        method: 'DELETE'
      })

      const data = await response.json()
      
      if (response.ok) {
        toast({
          title: "Project Deleted",
          description: "Project has been permanently deleted.",
        })
        onRefresh()
      } else {
        throw new Error(data.error || 'Failed to delete project')
      }
    } catch (error) {
      toast({
        title: "Delete Failed",
        description: error instanceof Error ? error.message : "Failed to delete project",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Card className="w-full hover:shadow-lg hover:border-blue-300 transition-all duration-200 cursor-pointer" onClick={handleCardClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(project.status)}
            <CardTitle className="text-lg">Project {project.projectId}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsExpanded(!isExpanded)
              }}
              data-expand
            >
              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Created: {formatDate(project.createdAt)}</span>
          <span>Updated: {formatDate(project.updatedAt)}</span>
        </div>

        {project.prompt && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {project.prompt}
          </p>
        )}
      </CardHeader>

      <CardContent className="pt-0">
        {/* Quick Status Overview */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Code2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-xs text-muted-foreground">Infrastructure</div>
            <div className="text-sm font-medium">
              {project.terraformCode ? 'Generated' : 'Not Generated'}
            </div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Server className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-xs text-muted-foreground">Deployment</div>
            <div className="text-sm font-medium">{getDeploymentStatus()}</div>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Database className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-xs text-muted-foreground">Architecture</div>
            <div className="text-sm font-medium">
              {project.umlDiagrams?.architecture ? 'Generated' : 'Not Generated'}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-4">
          <Button 
            size="sm" 
            onClick={(e) => {
              e.stopPropagation()
              handleDeploy()
            }}
            disabled={isDeploying || !project.terraformCode}
            className="flex-1"
          >
            <Play className="mr-2 h-4 w-4" />
            {isDeploying ? 'Deploying...' : 'Deploy'}
          </Button>
          
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation()
              handleDestroy()
            }}
            disabled={isDestroying}
            className="flex-1"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDestroying ? 'Destroying...' : 'Destroy'}
          </Button>

          {/* Retry button - only show for failed jobs */}
          {hasFailedJobs() && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={(e) => {
                e.stopPropagation()
                handleRetry()
              }}
              disabled={isRetrying}
              className="flex-1"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {isRetrying ? 'Retrying...' : 'Retry'}
            </Button>
          )}

          {/* Delete button - only show for non-provisioned projects */}
          {(!project.deploymentStatus || 
            (project.deploymentStatus.status !== 'deployed' && 
             project.deploymentStatus.status !== 'deploying' && 
             project.deploymentStatus.status !== 'failed_deployment')) && (
            <Button 
              size="sm" 
              variant="destructive"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete()
              }}
              disabled={isDeleting}
              className="flex-1"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          )}
        </div>

        {/* View Details Button */}
        <div className="flex justify-center">
          <Link href={`/projects/${project.projectId}`}>
            <Button 
              size="sm" 
              variant="ghost"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View Details
            </Button>
          </Link>
        </div>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
            {/* Job History */}
            <div>
              <h4 className="text-sm font-medium mb-2">Job History</h4>
              <div className="space-y-2">
                {project.jobs.map((job, index) => (
                  <div key={job.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(job.status)}
                      <span className="font-mono text-xs">{job.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{job.phase}</span>
                      <Badge variant="outline" className="text-xs">
                        {job.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h4 className="text-sm font-medium mb-2">Quick Actions</h4>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  <Eye className="mr-2 h-4 w-4" />
                  View Code
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                {hasFailedJobs() && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={handleRetry}
                    disabled={isRetrying}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {isRetrying ? 'Retrying...' : 'Retry'}
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>

            {/* Deployment Status */}
            {project.deploymentStatus && (
              <div>
                <h4 className="text-sm font-medium mb-2">Deployment Status</h4>
                <div className="p-3 bg-green-50 rounded border">
                  <div className="flex items-center gap-2">
                    <Cloud className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Successfully Deployed</span>
                  </div>
                  <pre className="text-xs mt-2 text-muted-foreground overflow-auto">
                    {JSON.stringify(project.deploymentStatus, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
} 