"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { 
  Cloud, 
  Play, 
  StopCircle, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  DollarSign, 
  Settings, 
  Trash2,
  Eye,
  RefreshCw,
  Server,
  Database,
  Globe,
  HardDrive,
  Rocket,
  ExternalLink,
  Terminal,
  X
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  deployInfrastructure,
  getInfrastructureStatus,
  destroyInfrastructure,
  validateTerraformConfig,
  estimateInfrastructureCosts,
  getTerraformOutputs,
  getTerraformState,
  completeInfrastructureDeployment,
  retryInfrastructureDeployment,
  getDeploymentJobStatus
} from "@/lib/api/infrastructure"
import type {
  InfrastructureStatus,
  InfrastructureCostEstimate,
  TerraformOutputsResponse,
  TerraformStateResponse
} from "@/lib/types"

interface InfrastructureDeploymentProps {
  projectId: string
  iacCode: string
  onDeploymentComplete?: (outputs: any) => void
}

export function InfrastructureDeployment({ 
  projectId, 
  iacCode, 
  onDeploymentComplete 
}: InfrastructureDeploymentProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [isDestroying, setIsDestroying] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [destroyProgress, setDestroyProgress] = useState(0)
  const [destroyLogs, setDestroyLogs] = useState<string[]>([])
  const [destroyJobId, setDestroyJobId] = useState<string | null>(null)
  const [showDestroyProgress, setShowDestroyProgress] = useState(false)
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deploymentStatus, setDeploymentStatus] = useState<string>("")
  const [infrastructureStatus, setInfrastructureStatus] = useState<InfrastructureStatus | null>(null)
  const [costEstimate, setCostEstimate] = useState<InfrastructureCostEstimate | null>(null)
  const [terraformOutputs, setTerraformOutputs] = useState<TerraformOutputsResponse | null>(null)
  const [terraformState, setTerraformState] = useState<TerraformStateResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const { toast } = useToast()

  // Load initial infrastructure status
  useEffect(() => {
    loadInfrastructureStatus()
  }, [projectId])

  const loadInfrastructureStatus = async () => {
    try {
      const [status] = await Promise.all([
        getInfrastructureStatus(projectId)
      ])
      
      setInfrastructureStatus(status)
      
      // Load outputs and state if deployed
      if (status.deploymentStatus === 'deployed') {
        try {
          const [outputs, state] = await Promise.all([
            getTerraformOutputs(projectId),
            getTerraformState(projectId)
          ])
          setTerraformOutputs(outputs)
          setTerraformState(state)
        } catch (error) {
          console.error("Error loading outputs/state:", error)
        }
      }
    } catch (error) {
      console.error("Error loading infrastructure status:", error)
      toast({
        title: "Error",
        description: "Failed to load infrastructure status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const loadCostEstimate = async () => {
    try {
      const costs = await estimateInfrastructureCosts(projectId)
      setCostEstimate(costs)
    } catch (error) {
      console.error("Error loading cost estimate:", error)
    }
  }

  const handleDeploy = async () => {
    if (!iacCode.trim()) {
      toast({
        title: "No Infrastructure Code",
        description: "Please generate infrastructure code first",
        variant: "destructive",
      })
      return
    }

    setIsDeploying(true)
    setDeploymentProgress(0)
    setDeploymentStatus("Starting deployment...")

    try {
      const result = await completeInfrastructureDeployment(
        projectId,
        iacCode,
        (status, progress) => {
          setDeploymentStatus(status)
          setDeploymentProgress(progress || 0)
        }
      )

      if (result.success) {
        toast({
          title: "Deployment Successful",
          description: "Infrastructure has been deployed successfully!",
        })
        
        // Reload infrastructure status
        await loadInfrastructureStatus()
        
        // Call completion callback
        if (onDeploymentComplete && result.outputs) {
          onDeploymentComplete(result.outputs)
        }
      } else {
        toast({
          title: "Deployment Failed",
          description: result.error || "Infrastructure deployment failed",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Deployment error:", error)
      toast({
        title: "Deployment Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsDeploying(false)
      setDeploymentProgress(0)
      setDeploymentStatus("")
    }
  }

  const handleDestroy = async () => {
    if (!projectId) return

    setIsDestroying(true)
    setDestroyProgress(0)
    setDestroyLogs(["🗑️ Starting infrastructure destruction..."])
    setShowDestroyProgress(true)

    try {
      console.log("Destroying infrastructure...")
      const result = await destroyInfrastructure({ projectId })
      
      if (result.jobId) {
        setDestroyJobId(result.jobId)
        await pollDestruction(result.jobId)
      }
    } catch (error: any) {
      console.error("Error destroying infrastructure:", error)
      
      // Handle specific warning about application being deployed
      if (error.response?.data?.code === "APP_DEPLOYED_WARNING") {
        setDestroyLogs(prev => [
          ...prev,
          "",
          "⚠️ Infrastructure destruction blocked:",
          error.response.data.error,
          "",
          "💡 Suggestion:",
          error.response.data.suggestion,
          "",
          "🔄 Next steps:",
          "1. Go to the 'Application' tab",
          "2. Click 'Purge Application' to clean up app resources",
          "3. Return here and try destroying infrastructure again"
        ])
        
        toast({
          title: "Application Cleanup Required",
          description: "Please purge application resources first, then try destroying infrastructure again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Destruction Failed",
          description: error instanceof Error ? error.message : "Failed to destroy infrastructure",
          variant: "destructive",
        })
        
        setDestroyLogs(prev => [
          ...prev,
          "",
          "❌ Error starting destruction:",
          error instanceof Error ? error.message : "Unknown error"
        ])
      }
      
      setIsDestroying(false)
      setDestroyProgress(100)
    }
  }

  const pollDestruction = async (jobId: string) => {
    const maxAttempts = 60 // 5 minutes
    let attempts = 0
    
    while (attempts < maxAttempts) {
      try {
        const jobStatus = await getDeploymentJobStatus(jobId)
        
        // Update progress
        setDestroyProgress(jobStatus.progress || 0)
        
        // Update logs if available
        if (jobStatus.result?.logs) {
          setDestroyLogs(prev => [...prev, jobStatus.result!.logs])
        }
        
        if (jobStatus.status === 'completed') {
          setDestroyProgress(100)
          setIsDestroying(false)
          
          toast({
            title: "🎉 Infrastructure Destroyed Successfully!",
            description: "All AWS resources have been safely cleaned up and removed.",
          })
          
          // Reload infrastructure status
          await loadInfrastructureStatus()
          break
          
        } else if (jobStatus.status === 'failed') {
          setDestroyProgress(100)
          setIsDestroying(false)
          
          toast({
            title: "Destruction Error",
            description: "Infrastructure destruction failed. Check the logs for details.",
            variant: "destructive",
          })
          break
        }
        
        attempts++
        await new Promise(resolve => setTimeout(resolve, 3000)) // Wait 3 seconds
      } catch (error) {
        console.error("Error polling destruction:", error)
        attempts++
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    
    if (attempts >= maxAttempts) {
      setDestroyLogs(prev => [...prev, "⚠️ Polling timeout - please check infrastructure status manually"])
      setIsDestroying(false)
      toast({
        title: "Polling Timeout",
        description: "Destruction may still be in progress. Please check the status.",
        variant: "destructive",
      })
    }
  }

  const handleRetry = async () => {
    setIsRetrying(true)

    try {
      const result = await retryInfrastructureDeployment(projectId)
      
      toast({
        title: "Retry Successful",
        description: result.message,
      })
      
      // Reload infrastructure status
      await loadInfrastructureStatus()
    } catch (error) {
      console.error("Retry error:", error)
      toast({
        title: "Retry Error",
        description: error instanceof Error ? error.message : "Failed to retry deployment",
        variant: "destructive",
      })
    } finally {
      setIsRetrying(false)
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
      case 'destroyed':
        return <Badge variant="outline"><Trash2 className="w-3 h-3 mr-1" />Destroyed</Badge>
      default:
        return <Badge variant="outline"><Server className="w-3 h-3 mr-1" />Not Deployed</Badge>
    }
  }

  const renderOverview = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5" />
            Infrastructure Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium">Status:</span>
            {infrastructureStatus ? getStatusBadge(infrastructureStatus.deploymentStatus) : <Badge variant="outline">Loading...</Badge>}
          </div>
          
          {infrastructureStatus?.deploymentStatus === 'deployed' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Last Updated:</span>
                <span className="text-sm">{new Date(infrastructureStatus.lastUpdated || '').toLocaleString()}</span>
              </div>
              {costEstimate?.estimated && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Monthly Cost:</span>
                  <span className="text-sm font-medium">${costEstimate.costs.total}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {infrastructureStatus?.deploymentStatus === 'not_deployed' && (
        <Card>
          <CardHeader>
            <CardTitle>Deploy Infrastructure</CardTitle>
            <CardDescription>
              Deploy your infrastructure to AWS using the generated Terraform code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleDeploy} 
              disabled={isDeploying || !iacCode.trim()}
              className="w-full"
            >
              {isDeploying ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deploying...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Deploy Infrastructure
                </>
              )}
            </Button>
            
            {isDeploying && (
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{deploymentStatus}</span>
                  <span>{deploymentProgress}%</span>
                </div>
                <Progress value={deploymentProgress} className="w-full" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {(infrastructureStatus?.deploymentStatus === 'deployed' || infrastructureStatus?.deploymentStatus === 'failed') && (
        <Card>
          <CardHeader>
            <CardTitle>Infrastructure Management</CardTitle>
            <CardDescription>
              {infrastructureStatus?.deploymentStatus === 'deployed' 
                ? "Manage your deployed infrastructure"
                : "Clean up failed infrastructure deployment or retry"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {infrastructureStatus?.deploymentStatus === 'failed' && (
              <>
                <Button 
                  onClick={handleRetry} 
                  disabled={isRetrying}
                  className="w-full"
                  variant="outline"
                >
                  {isRetrying ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Retry Deployment
                    </>
                  )}
                </Button>
                <div className="text-sm text-muted-foreground">
                  This will reset the deployment status and allow you to deploy again.
                </div>
              </>
            )}

            <Button 
              onClick={handleDestroy} 
              disabled={isDestroying}
              className="w-full"
              variant="destructive"
            >
              {isDestroying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Destroying...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Destroy Infrastructure
                </>
              )}
            </Button>
            
            <div className="text-sm text-muted-foreground">
              {infrastructureStatus?.deploymentStatus === 'deployed' 
                ? "⚠️ This will permanently destroy all deployed AWS resources. This action cannot be undone."
                : "This will clean up any remaining resources from the failed deployment."
              }
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )

  const renderCosts = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Cost Estimation
        </CardTitle>
      </CardHeader>
      <CardContent>
        {costEstimate?.estimated ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-2xl font-bold text-green-600">${costEstimate.costs.total}</div>
                <div className="text-sm text-muted-foreground">Monthly Total</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-semibold">{costEstimate.costs.currency}</div>
                <div className="text-sm text-muted-foreground">Currency</div>
              </div>
            </div>
            
            <div className="border-t my-4"></div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  <span>Compute</span>
                </div>
                <span className="font-medium">${costEstimate.costs.compute}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  <span>Storage</span>
                </div>
                <span className="font-medium">${costEstimate.costs.storage}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  <span>Networking</span>
                </div>
                <span className="font-medium">${costEstimate.costs.networking}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>Database</span>
                </div>
                <span className="font-medium">${costEstimate.costs.database}</span>
              </div>
            </div>
            
            <div className="border-t my-4"></div>
            
            <div>
              <h4 className="font-medium mb-2">Resource Breakdown</h4>
              <div className="space-y-1">
                {Object.entries(costEstimate.costs.resourceCounts).map(([resource, count]) => (
                  <div key={resource} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{resource}</span>
                    <span>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <DollarSign className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {infrastructureStatus?.deploymentStatus === 'deployed' 
                ? "Cost estimation not available" 
                : "Deploy infrastructure to see cost estimates"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderOutputs = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          Terraform Outputs
        </CardTitle>
      </CardHeader>
      <CardContent>
        {terraformOutputs?.outputs ? (
          <div className="space-y-4">
            {Object.entries(terraformOutputs.outputs).map(([key, value]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="font-medium text-sm mb-2">{key}</div>
                <div className="text-sm text-muted-foreground break-all">{value}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Eye className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {infrastructureStatus?.deploymentStatus === 'deployed' 
                ? "No outputs available" 
                : "Deploy infrastructure to see outputs"
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const renderState = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Terraform State
        </CardTitle>
      </CardHeader>
      <CardContent>
        {terraformState?.state ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(terraformState.state, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Settings className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            {infrastructureStatus?.deploymentStatus === 'deployed' ? (
              <div className="space-y-2">
                <p className="text-yellow-600 font-medium flex items-center justify-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  No Terraform state found
                </p>
                <p className="text-sm text-muted-foreground">
                  Infrastructure status was corrected from "deployed" to "not_deployed"
                </p>
                <p className="text-xs text-muted-foreground">
                  This can happen if previous deployment data was inconsistent
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">
                {infrastructureStatus?.deploymentStatus === 'not_deployed' 
                  ? "Deploy infrastructure to see state" 
                  : "No state available"
                }
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading infrastructure status...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Infrastructure Deployment</h2>
          <p className="text-muted-foreground">
            Deploy and manage your cloud infrastructure
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="costs">Costs</TabsTrigger>
          <TabsTrigger value="outputs">Outputs</TabsTrigger>
          <TabsTrigger value="state">State</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          {renderOverview()}
        </TabsContent>
        
        <TabsContent value="costs" className="space-y-4">
          {renderCosts()}
        </TabsContent>
        
        <TabsContent value="outputs" className="space-y-4">
          {renderOutputs()}
        </TabsContent>
        
        <TabsContent value="state" className="space-y-4">
          {renderState()}
        </TabsContent>
      </Tabs>

      {/* Destruction Progress Modal */}
      <Dialog open={showDestroyProgress} onOpenChange={setShowDestroyProgress}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Infrastructure Destruction Progress
            </DialogTitle>
            <DialogDescription>
              Automated cleanup and resource destruction in progress...
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Destruction Progress</span>
                <span>{destroyProgress}%</span>
              </div>
              <Progress value={destroyProgress} className="w-full" />
            </div>
            
            {/* Status Indicator */}
            <div className="flex items-center gap-2">
              {destroyProgress < 100 ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  <span className="text-sm text-blue-600">Cleaning up AWS resources automatically...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm text-green-600">Cleanup completed!</span>
                </>
              )}
            </div>
            
            {/* Live Logs */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Live Cleanup Logs
              </h4>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg max-h-64 overflow-y-auto font-mono text-xs">
                {destroyLogs.map((log, index) => (
                  <div key={index} className="py-1">
                    {log}
                  </div>
                ))}
                {isDestroying && destroyProgress < 100 && (
                  <div className="py-1 text-blue-400">
                    <Loader2 className="w-3 h-3 inline animate-spin mr-2" />
                    Processing...
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="text-xs text-muted-foreground">
                💡 This process automatically handles S3 bucket cleanup, Lambda functions, API Gateways, and more
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDestroyProgress(false)}
                disabled={isDestroying && destroyProgress < 100}
              >
                <X className="w-4 h-4 mr-1" />
                {destroyProgress === 100 ? 'Close' : 'Minimize'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 