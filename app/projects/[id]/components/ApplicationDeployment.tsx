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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Application Deployment</CardTitle>
            <CardDescription>
              Deploy your generated application code to the provisioned infrastructure
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadApplicationStatus}
            disabled={isDeployingApp}
            title="Refresh deployment status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Application Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <span className="font-medium">Application Status:</span>
          <div className="flex items-center gap-2">
            {getStatusBadge(applicationStatus?.appDeploymentStatus || 'not_deployed')}
            {applicationStatus?.appDeploymentStatus === 'deployed' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Live
              </Badge>
            )}
          </div>
        </div>

        {/* Infrastructure Status Indicator */}
        {applicationStatus?.infrastructureStatus && (
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <span className="font-medium">Infrastructure Status:</span>
            <Badge 
              variant={applicationStatus.infrastructureStatus === 'deployed' ? 'default' : 'outline'}
              className={applicationStatus.infrastructureStatus === 'deployed' ? 'bg-green-500' : ''}
            >
              {applicationStatus.infrastructureStatus === 'deployed' ? (
                <><CheckCircle className="w-3 h-3 mr-1" />Deployed</>
              ) : (
                applicationStatus.infrastructureStatus || 'Unknown'
              )}
            </Badge>
          </div>
        )}

        {/* Application Deployment Button */}
        {(!applicationStatus || applicationStatus.appDeploymentStatus === 'not_deployed' || applicationStatus.appDeploymentStatus === 'failed') && (
          <div className="space-y-3">
            <Button 
              onClick={handleDeployApp} 
              disabled={isDeployingApp || applicationStatus?.infrastructureStatus !== 'deployed'}
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
            
            {applicationStatus?.infrastructureStatus !== 'deployed' && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Infrastructure must be deployed before deploying application code
                </p>
              </div>
            )}

            {applicationStatus?.appDeploymentStatus === 'failed' && (
              <div className="flex gap-2">
                <Button
                  onClick={handleRetryApp}
                  disabled={isRetrying}
                  variant="outline"
                  className="flex-1"
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
                  className="flex-1"
                >
                  {isPurging ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-2" />
                  )}
                  {isPurging ? "Purging..." : "Purge & Reset"}
                </Button>
              </div>
            )}
          </div>
        )}
        {/* Application Deployment Outputs */}
        {applicationStatus?.appDeploymentStatus === 'deployed' && applicationStatus.appDeploymentOutputs && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <div>
                  <h4 className="font-medium text-green-800 dark:text-green-200">Application Successfully Deployed!</h4>
                  <p className="text-sm text-green-600 dark:text-green-300">Your application is live and accessible</p>
                </div>
              </div>
            </div>
            
            <div className="grid gap-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
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
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <span className="font-medium">Lambda Function:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">{applicationStatus.appDeploymentOutputs.lambdaFunctionName}</span>
              </div>
            </div>
            
            {/* Prominent Purge Section for Deployed Applications */}
            <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-orange-800 dark:text-orange-200 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Application Resource Management
                  </h4>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    <strong>Important:</strong> You must purge application resources before destroying infrastructure. 
                    AWS prevents deletion of resources containing application files.
                  </p>
                  <ul className="text-xs text-orange-600 dark:text-orange-400 mt-2 space-y-1">
                    <li>• Removes all files from S3 bucket</li>
                    <li>• Cleans application deployment state</li>
                    <li>• Enables safe infrastructure destruction</li>
                  </ul>
                </div>
                <Button
                  onClick={handlePurgeApplication}
                  disabled={isPurging}
                  variant="outline"
                  size="sm"
                  className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-600 dark:text-orange-300 dark:hover:bg-orange-900/30"
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