'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Trash2, AlertTriangle, CheckCircle, Loader2, RefreshCw } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { authenticatedFetch } from '@/lib/auth'

interface InfrastructureCleanupProps {
  infrastructureId: string
  projectId: string
  infrastructureStatus?: 'not-deployed' | 'deployed' | 'failed' | 'unknown'
  hasTerraformCode?: boolean
}

interface CleanupStatus {
  infrastructureId: string
  hasTerraformState: boolean
  hasTerraformDir: boolean
  resources: Array<{
    type: string
    name: string
    id: string
  }>
  canCleanup: boolean
  error?: string
}

export function InfrastructureCleanup({ 
  infrastructureId, 
  projectId, 
  infrastructureStatus = 'unknown',
  hasTerraformCode = false
}: InfrastructureCleanupProps) {
  const [cleanupStatus, setCleanupStatus] = useState<CleanupStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCleaning, setIsCleaning] = useState(false)
  const { toast } = useToast()

  // Check if cleanup is available
  const canCleanup = infrastructureStatus === 'deployed' && hasTerraformCode
  const cleanupDisabled = !canCleanup

  useEffect(() => {
    loadCleanupStatus()
  }, [infrastructureId])

  const loadCleanupStatus = async () => {
    setIsLoading(true)
    try {
      const response = await authenticatedFetch(`/api/deployment/cleanup/status/${infrastructureId}`)
      if (response.ok) {
        const status = await response.json()
        setCleanupStatus(status)
      } else {
        toast({
          title: "Error",
          description: "Failed to load cleanup status",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Failed to load cleanup status:', error)
      toast({
        title: "Error",
        description: "Failed to load cleanup status",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCleanup = async () => {
    if (!confirm('Are you sure you want to destroy this infrastructure? This action cannot be undone.')) {
      return
    }

    setIsCleaning(true)
    try {
      const response = await authenticatedFetch('/api/deployment/cleanup', {
        method: 'POST',
        body: JSON.stringify({
          infrastructureId,
          projectId
        })
      })

      if (response.ok) {
        toast({
          title: "Cleanup Initiated",
          description: "Infrastructure cleanup has been started. This may take several minutes.",
        })
        
        // Poll for status updates
        setTimeout(() => {
          loadCleanupStatus()
        }, 5000)
      } else {
        const error = await response.json()
        toast({
          title: "Cleanup Failed",
          description: error.error || "Failed to initiate cleanup",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Cleanup error:', error)
      toast({
        title: "Cleanup Error",
        description: "An error occurred during cleanup",
        variant: "destructive"
      })
    } finally {
      setIsCleaning(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading Cleanup Status
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (!cleanupStatus) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Infrastructure Cleanup</CardTitle>
          <CardDescription>
            Unable to load cleanup status
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Infrastructure Dependency Warning */}
      {cleanupDisabled && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Infrastructure Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              You need to deploy infrastructure before you can clean it up.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Infrastructure Status:</span>
                <Badge variant={infrastructureStatus === 'deployed' ? 'default' : 'secondary'}>
                  {infrastructureStatus === 'deployed' ? 'Deployed' : 
                   infrastructureStatus === 'failed' ? 'Failed' : 
                   infrastructureStatus === 'not-deployed' ? 'Not Deployed' : 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Terraform Code:</span>
                <Badge variant={hasTerraformCode ? 'default' : 'secondary'}>
                  {hasTerraformCode ? 'Available' : 'Not Available'}
                </Badge>
              </div>
              <div className="mt-3 p-3 bg-orange-100 rounded-md">
                <p className="text-sm text-orange-800">
                  <strong>Next Steps:</strong> Go to the "Infrastructure" tab and deploy your infrastructure first. 
                  Once infrastructure is successfully deployed, you'll be able to clean it up here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className={cleanupDisabled ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Infrastructure Cleanup
          </CardTitle>
          <CardDescription>
            Destroy infrastructure and clean up all associated resources
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status Overview */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Terraform State:</span>
                <Badge variant={cleanupStatus.hasTerraformState ? "default" : "secondary"}>
                  {cleanupStatus.hasTerraformState ? "Available" : "Not Found"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Terraform Directory:</span>
                <Badge variant={cleanupStatus.hasTerraformDir ? "default" : "secondary"}>
                  {cleanupStatus.hasTerraformDir ? "Exists" : "Not Found"}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Can Cleanup:</span>
                <Badge variant={cleanupStatus.canCleanup ? "default" : "destructive"}>
                  {cleanupStatus.canCleanup ? "Yes" : "No"}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Resources:</span>
                <Badge variant="outline">
                  {cleanupStatus.resources.length}
                </Badge>
              </div>
            </div>
          </div>

          {/* Resources List */}
          {cleanupStatus.resources.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Resources to be destroyed:</h4>
              <div className="space-y-2">
                {cleanupStatus.resources.map((resource, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="font-medium">{resource.type}</span>
                      <span className="text-sm text-gray-600 ml-2">({resource.name})</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.id}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error Display */}
          {cleanupStatus.error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Error: {cleanupStatus.error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Button
              onClick={handleCleanup}
              disabled={!cleanupStatus.canCleanup || isCleaning}
              variant="destructive"
              className="flex items-center gap-2"
            >
              {isCleaning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              {isCleaning ? "Cleaning Up..." : "Destroy Infrastructure"}
            </Button>
            
            <Button
              onClick={loadCleanupStatus}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Status
            </Button>
          </div>

          {/* Warning */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Warning:</strong> This action will permanently destroy all infrastructure resources 
              including databases, storage, and compute instances. This action cannot be undone.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
} 