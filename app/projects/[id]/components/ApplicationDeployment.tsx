"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle, Rocket, ExternalLink, RefreshCw, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  deployApplicationCode,
  getApplicationDeploymentStatus,
  retryApplicationDeploymentApp,
  purgeApplicationResources
} from "@/lib/api/infrastructure"

interface ApplicationDeploymentProps {
  projectId: string
}

export function ApplicationDeployment({ projectId }: ApplicationDeploymentProps) {
  const [isDeployingApp, setIsDeployingApp] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [isPurging, setIsPurging] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<any | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadApplicationStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId])

  const loadApplicationStatus = async () => {
    try {
      const status = await getApplicationDeploymentStatus(projectId)
      setApplicationStatus(status)
    } catch (error) {
      console.error("Error loading application deployment status:", error)
      toast({
        title: "Error",
        description: "Failed to load application deployment status",
        variant: "destructive",
      })
    }
  }

  const handleDeployApp = async () => {
    setIsDeployingApp(true)
    try {
      const result = await deployApplicationCode(projectId)
      toast({
        title: "Application Deployment Started",
        description: `Deploying application code (Job ID: ${result.jobId})`,
      })
      // Poll for application deployment completion
      const pollAppDeployment = async () => {
        const maxAttempts = 60 // 5 minutes
        let attempts = 0
        while (attempts < maxAttempts) {
          try {
            const status = await getApplicationDeploymentStatus(projectId)
            setApplicationStatus(status)
            if (status.appDeploymentStatus === 'deployed') {
              toast({
                title: "Application Deployed Successfully",
                description: `Frontend: ${status.appDeploymentOutputs?.frontendUrl}\nAPI: ${status.appDeploymentOutputs?.apiGatewayUrl}`,
              })
              break
            } else if (status.appDeploymentStatus === 'failed') {
              toast({
                title: "Application Deployment Failed",
                description: "Application deployment encountered an error",
                variant: "destructive",
              })
              break
            }
            attempts++
            await new Promise(resolve => setTimeout(resolve, 5000))
          } catch (error) {
            console.error("Error polling application deployment:", error)
            attempts++
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
        }
      }
      pollAppDeployment()
    } catch (error) {
      console.error("Application deployment error:", error)
      toast({
        title: "Application Deployment Error",
        description: error instanceof Error ? error.message : "Failed to deploy application",
        variant: "destructive",
      })
    } finally {
      setIsDeployingApp(false)
    }
  }

  const handleRetryApp = async () => {
    setIsRetrying(true)
    try {
      const result = await retryApplicationDeploymentApp(projectId)
      toast({
        title: "Retry Successful",
        description: result.message,
      })
      await loadApplicationStatus()
    } catch (error) {
      console.error("Retry application deployment error:", error)
      toast({
        title: "Retry Error",
        description: error instanceof Error ? error.message : "Failed to retry application deployment",
        variant: "destructive",
      })
    } finally {
      setIsRetrying(false)
    }
  }

  const handlePurgeApplication = async () => {
    if (!projectId) return

    setIsPurging(true)
    try {
      console.log("Purging application resources...")
      const result = await purgeApplicationResources(projectId)
      
      if (result.success) {
        toast({
          title: "🧹 Application Resources Purged",
          description: `Removed ${result.details.filesRemoved} files from S3. Infrastructure can now be safely destroyed.`,
        })
        
        // Refresh status
        await loadApplicationStatus()
      } else {
        throw new Error("Purge operation failed")
      }
    } catch (error) {
      console.error("Error purging application:", error)
      toast({
        title: "Purge Failed",
        description: error instanceof Error ? error.message : "Failed to purge application resources",
        variant: "destructive",
      })
    } finally {
      setIsPurging(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'deployed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Deployed</Badge>
      case 'pending':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Pending</Badge>
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Failed</Badge>
      case 'deploying':
        return <Badge variant="secondary"><Loader2 className="w-3 h-3 mr-1 animate-spin" />Deploying</Badge>
      default:
        return <Badge variant="outline">Not Deployed</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Deployment</CardTitle>
        <CardDescription>
          Deploy your generated application code to the provisioned infrastructure
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Application Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Application Status:</span>
          {getStatusBadge(applicationStatus?.appDeploymentStatus || 'not_deployed')}
        </div>
        {/* Application Deployment Button */}
        {(!applicationStatus || applicationStatus.appDeploymentStatus === 'not_deployed' || applicationStatus.appDeploymentStatus === 'failed') && (
          <div className="flex gap-2">
            <Button 
              onClick={handleDeployApp} 
              disabled={isDeployingApp}
              className="w-full"
            >
              {isDeployingApp ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deploying Application...
                </>
              ) : (
                <>
                  <Rocket className="mr-2 h-4 w-4" />
                  Deploy Application Code
                </>
              )}
            </Button>
            {applicationStatus?.appDeploymentStatus === 'failed' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleRetryApp}
                  disabled={isRetrying}
                  variant="outline"
                  size="sm"
                >
                  {isRetrying ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="w-4 h-4 mr-2" />
                  )}
                  {isRetrying ? "Retrying..." : "Retry Deploy"}
                </Button>
                
                <Button
                  onClick={handlePurgeApplication}
                  disabled={isPurging}
                  variant="destructive"
                  size="sm"
                >
                  {isPurging ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isPurging ? "Purging..." : "Purge Application"}
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Application Deployment Outputs */}
        {applicationStatus?.appDeploymentStatus === 'deployed' && applicationStatus.appDeploymentOutputs && (
          <div className="space-y-3">
            <div className="text-sm font-medium text-green-600">✅ Application Successfully Deployed!</div>
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Frontend URL:</span>
                <a 
                  href={applicationStatus.appDeploymentOutputs.frontendUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  Open App
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">API Gateway URL:</span>
                <a 
                  href={applicationStatus.appDeploymentOutputs.apiGatewayUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 underline flex items-center"
                >
                  <ExternalLink className="mr-1 h-4 w-4" />
                  API Docs
                </a>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Lambda Function:</span>
                <span className="text-sm text-gray-600">{applicationStatus.appDeploymentOutputs.lambdaFunctionName}</span>
              </div>
            </div>
            
            {/* Purge button for deployed applications */}
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Application Resources</h4>
                  <p className="text-xs text-gray-500">Clean up application files from S3 bucket</p>
                </div>
                <Button
                  onClick={handlePurgeApplication}
                  disabled={isPurging}
                  variant="outline"
                  size="sm"
                >
                  {isPurging ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isPurging ? "Purging..." : "Purge Application"}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Application Deployment Status */}
        {applicationStatus?.appDeploymentStatus === 'deploying' && (
          <div className="flex items-center space-x-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Application deployment in progress...</span>
          </div>
        )}
        {applicationStatus?.appDeploymentStatus === 'failed' && (
          <div className="text-sm text-red-600">
            ❌ Application deployment failed. Check the logs for more details.
          </div>
        )}
      </CardContent>
    </Card>
  )
} 