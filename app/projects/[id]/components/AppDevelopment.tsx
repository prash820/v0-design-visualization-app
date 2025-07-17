"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import { Loader2, Code2, Play, CheckCircle, XCircle, AlertCircle, RotateCcw, Rocket, Eye, Download, Settings, ExternalLink } from 'lucide-react'
import CodeEditor from './CodeEditor'

// Backend API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001'

interface AppDevelopmentProps {
  projectId: string;
  appCode: any;
  onCodeChange?: (updatedCode: any) => void;
  projectPrompt?: string;
  umlDiagrams?: any;
  infraCode?: any;
}

const AppDevelopment: React.FC<AppDevelopmentProps> = ({
  projectId,
  appCode,
  onCodeChange,
  projectPrompt,
  umlDiagrams,
  infraCode
}) => {
  const [currentPhase, setCurrentPhase] = useState<'editor' | 'sandbox' | 'deploy'>('editor')
  const [isLoading, setIsLoading] = useState(false)
  const [isRegeneratingCode, setIsRegeneratingCode] = useState(false)
  const [sandboxJobId, setSandboxJobId] = useState<string | null>(null)
  const [sandboxStatus, setSandboxStatus] = useState<any>(null)
  const [deploymentJobId, setDeploymentJobId] = useState<string | null>(null)
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null)
  const [buildErrors, setBuildErrors] = useState<string[]>([])
  const [runtimeErrors, setRuntimeErrors] = useState<string[]>([])
  const { toast } = useToast()

  // Poll sandbox status
  useEffect(() => {
    if (sandboxJobId) {
      const interval = setInterval(() => {
        fetchSandboxStatus(sandboxJobId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [sandboxJobId]);

  // Poll deployment status
  useEffect(() => {
    if (deploymentJobId) {
      const interval = setInterval(() => {
        fetchDeploymentStatus(deploymentJobId);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [deploymentJobId]);

  // Poll for job status
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
        
        if (status.status === 'completed') {
          return status
        } else if (status.status === 'failed') {
          throw new Error(status.error || 'Job failed')
        }
        
        // Still processing, wait and retry
        await new Promise(resolve => setTimeout(resolve, 3000))
      } catch (error) {
        if (attempt === maxAttempts - 1) {
          throw error
        }
        await new Promise(resolve => setTimeout(resolve, 3000))
      }
    }
    throw new Error('Job polling timeout')
  }

  const regenerateAppCode = async () => {
    if (!projectPrompt) {
      toast({
        title: 'Error',
        description: 'Project prompt is required to regenerate code',
        variant: "destructive",
      })
      return
    }

    setIsRegeneratingCode(true);
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/code/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          prompt: projectPrompt,
          projectId,
          umlDiagrams,
          documentation: null, // Will be generated if needed
          infraCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate application code');
      }

      const result = await response.json();
      
      // Poll for completion
      const status = await pollJobStatus('/api/code/logs', result.jobId)
      
      // Update the app code with the regenerated code
      if (onCodeChange && status.result) {
        onCodeChange(status.result);
      }
      
      // Reset sandbox and deployment status since we have new code
      setSandboxJobId(null);
      setSandboxStatus(null);
      setDeploymentJobId(null);
      setDeploymentStatus(null);
      setBuildErrors([]);
      setRuntimeErrors([]);
      setCurrentPhase('editor');
      
      toast({
        title: 'Application Code Regenerated',
        description: 'Your application code has been regenerated with improvements. You can now create a new sandbox to test the updated code.',
      });
    } catch (error: any) {
      toast({
        title: 'Code Regeneration Failed',
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRegeneratingCode(false);
    }
  };

  const createSandbox = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/sandbox/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          appCode
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create sandbox');
      }

      const result = await response.json();
      setSandboxJobId(result.jobId);
      setCurrentPhase('sandbox');
      
      toast({
        title: 'Sandbox Created',
        description: 'Your sandbox environment is being prepared...',
      });
    } catch (error: any) {
      toast({
        title: 'Sandbox Creation Failed',
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const redeploySandbox = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/sandbox/redeploy`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to redeploy sandbox');
      }

      const result = await response.json();
      setSandboxJobId(result.jobId);
      setCurrentPhase('sandbox');
      setSandboxStatus(null); // Reset status for new attempt
      
      toast({
        title: 'Sandbox Redeploy Started',
        description: 'Your sandbox environment is being redeployed with AI auto-fixes...',
      });
    } catch (error: any) {
      toast({
        title: 'Sandbox Redeploy Failed',
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSandboxStatus = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/sandbox/status/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const status = await response.json();
        setSandboxStatus(status);
        
        if (status.status === 'completed') {
          setBuildErrors(status.buildErrors || []);
          setRuntimeErrors(status.runtimeErrors || []);
          
          if (status.buildErrors?.length === 0 && status.runtimeErrors?.length === 0) {
            toast({
              title: 'Sandbox Ready',
              description: 'Your application is running in the sandbox environment!',
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching sandbox status:', error);
    }
  };

  const deployToProduction = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/deploy/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId,
          sandboxJobId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start deployment');
      }

      const result = await response.json();
      setDeploymentJobId(result.jobId);
      setCurrentPhase('deploy');
      
      toast({
        title: 'Deployment Started',
        description: 'Your application is being deployed to production...',
      });
    } catch (error: any) {
      toast({
        title: 'Deployment Failed',
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDeploymentStatus = async (jobId: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/deploy/job/${jobId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const status = await response.json();
        setDeploymentStatus(status);
        
        if (status.status === 'completed') {
          toast({
            title: 'Deployment Complete',
            description: `Your application is live at ${status.productionUrl}`,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching deployment status:', error);
    }
  };

  const getPhaseStatus = (phase: string) => {
    switch (phase) {
      case 'editor':
        return { status: 'completed', label: 'Code Generated' };
      case 'sandbox':
        if (!sandboxJobId) return { status: 'pending', label: 'Not Started' };
        if (sandboxStatus?.status === 'completed') return { status: 'completed', label: 'Sandbox Ready' };
        if (sandboxStatus?.status === 'failed') return { status: 'failed', label: 'Sandbox Failed' };
        return { status: 'processing', label: 'Preparing Sandbox' };
      case 'deploy':
        if (!deploymentJobId) return { status: 'pending', label: 'Not Started' };
        if (deploymentStatus?.status === 'completed') return { status: 'completed', label: 'Deployed' };
        if (deploymentStatus?.status === 'failed') return { status: 'failed', label: 'Deployment Failed' };
        return { status: 'processing', label: 'Deploying' };
      default:
        return { status: 'pending', label: 'Not Started' };
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'processing': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'processing': return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">App Development Pipeline</h2>
          
          <div className="flex items-center gap-4">
            {/* Phase Indicators */}
            <div className="flex items-center gap-2">
              {['editor', 'sandbox', 'deploy'].map((phase) => {
                const phaseStatus = getPhaseStatus(phase);
                return (
                  <Badge
                    key={phase}
                    variant={getStatusVariant(phaseStatus.status)}
                    className="flex items-center gap-1 px-3 py-1"
                  >
                    {getStatusIcon(phaseStatus.status)}
                    <span className="text-sm">{phaseStatus.label}</span>
                  </Badge>
                );
              })}
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Regenerate App Code Button - Always visible */}
              <Button
                variant="outline"
                onClick={regenerateAppCode}
                disabled={isRegeneratingCode || !projectPrompt}
                size="sm"
              >
                {isRegeneratingCode ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <Code2 className="mr-2 h-4 w-4" />
                    Regenerate Code
                  </>
                )}
              </Button>
              
              {currentPhase === 'editor' && (
                <Button
                  onClick={createSandbox}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Sandbox
                    </>
                  ) : (
                    'Create Sandbox'
                  )}
                </Button>
              )}
              
              {currentPhase === 'sandbox' && sandboxStatus?.status === 'failed' && (
                <Button
                  onClick={redeploySandbox}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Redeploying Sandbox
                    </>
                  ) : (
                    'Redeploy Sandbox'
                  )}
                </Button>
              )}
              
              {currentPhase === 'sandbox' && sandboxStatus?.status === 'completed' && (
                <Button
                  onClick={deployToProduction}
                  disabled={isLoading || buildErrors.length > 0 || runtimeErrors.length > 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deploying
                    </>
                  ) : (
                    'Deploy to Production'
                  )}
                </Button>
              )}
              
              {sandboxStatus?.sandboxUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(sandboxStatus.sandboxUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Sandbox
                </Button>
              )}
              
              {deploymentStatus?.productionUrl && (
                <Button
                  variant="outline"
                  onClick={() => window.open(deploymentStatus.productionUrl, '_blank')}
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open Production
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <Progress
            value={
              currentPhase === 'editor' ? 33 :
              currentPhase === 'sandbox' ? 66 :
              currentPhase === 'deploy' ? 100 : 0
            }
            className="h-2"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Code Editor */}
        <div className="flex-1">
          <CodeEditor
            appCode={appCode}
            onCodeChange={onCodeChange}
            onDeploy={deployToProduction}
            sandboxStatus={sandboxStatus}
            buildErrors={buildErrors}
            runtimeErrors={runtimeErrors}
          />
        </div>

        {/* Right Panel - Status & Logs */}
        <div className="w-96 border-l bg-muted/50 overflow-y-auto">
          <Tabs defaultValue="status" className="h-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="status">Status</TabsTrigger>
              <TabsTrigger value="logs">Logs</TabsTrigger>
              <TabsTrigger value="errors">Errors</TabsTrigger>
            </TabsList>

            <TabsContent value="status" className="p-4 space-y-4">
              {/* Regenerate Code Info */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Code Generation</CardTitle>
                  <CardDescription className="text-xs">
                    Regenerate application code with AI improvements
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={regenerateAppCode}
                    disabled={isRegeneratingCode || !projectPrompt}
                    className="w-full"
                  >
                    {isRegeneratingCode ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating Code...
                      </>
                    ) : (
                      <>
                        <Code2 className="mr-2 h-4 w-4" />
                        Regenerate App Code
                      </>
                    )}
                  </Button>
                  {!projectPrompt && (
                    <p className="text-xs text-muted-foreground">
                      Project prompt required to regenerate code
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Sandbox Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Sandbox Environment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sandboxStatus ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status:</span>
                        <Badge variant={getStatusVariant(sandboxStatus.status)}>
                          {sandboxStatus.status}
                        </Badge>
                      </div>
                      
                      {sandboxStatus.progress && (
                        <div>
                          <span className="text-sm mb-1 block">Progress:</span>
                          <Progress value={sandboxStatus.progress} className="h-2" />
                        </div>
                      )}
                      
                      {sandboxStatus.phase && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Phase:</span>
                          <span className="text-sm font-medium">{sandboxStatus.phase}</span>
                        </div>
                      )}
                      
                      {sandboxStatus.sandboxUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(sandboxStatus.sandboxUrl, '_blank')}
                          className="w-full"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Sandbox
                        </Button>
                      )}
                      
                      {sandboxStatus.status === 'failed' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={redeploySandbox}
                          disabled={isLoading}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Redeploying...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="mr-2 h-4 w-4" />
                              Redeploy with AI Fixes
                            </>
                          )}
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No sandbox created yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Deployment Status */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Production Deployment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {deploymentStatus ? (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status:</span>
                        <Badge variant={getStatusVariant(deploymentStatus.status)}>
                          {deploymentStatus.status}
                        </Badge>
                      </div>
                      
                      {deploymentStatus.progress && (
                        <div>
                          <span className="text-sm mb-1 block">Progress:</span>
                          <Progress value={deploymentStatus.progress} className="h-2" />
                        </div>
                      )}
                      
                      {deploymentStatus.phase && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Phase:</span>
                          <span className="text-sm font-medium">{deploymentStatus.phase}</span>
                        </div>
                      )}
                      
                      {deploymentStatus.productionUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(deploymentStatus.productionUrl, '_blank')}
                          className="w-full"
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Open Production
                        </Button>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">No deployment started yet</p>
                  )}
                </CardContent>
              </Card>

              {/* Test Results */}
              {(sandboxStatus?.testResults || deploymentStatus?.testResults) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Test Results</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {sandboxStatus?.testResults && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Sandbox Tests:</h4>
                        <div className="space-y-1">
                          {Object.entries(sandboxStatus.testResults).map(([test, result]: [string, any]) => (
                            <div key={test} className="flex justify-between items-center">
                              <span className="text-xs">{test}:</span>
                              <Badge
                                variant={result.status === 'OK' ? 'default' : 'destructive'}
                              >
                                {result.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {deploymentStatus?.testResults && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Production Tests:</h4>
                        <div className="space-y-1">
                          {Object.entries(deploymentStatus.testResults).map(([test, result]: [string, any]) => (
                            <div key={test} className="flex justify-between items-center">
                              <span className="text-xs">{test}:</span>
                              <Badge
                                variant={result.status === 'healthy' ? 'default' : 'destructive'}
                              >
                                {result.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="logs" className="p-4 space-y-4">
              {/* Sandbox Logs */}
              {sandboxStatus && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Sandbox Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto">
                      <pre className="text-xs p-2 bg-muted rounded-md">
                        {sandboxStatus.deploymentLogs?.join('\n') || 'No logs available'}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deployment Logs */}
              {deploymentStatus && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Deployment Logs</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="max-h-48 overflow-y-auto">
                      <pre className="text-xs p-2 bg-muted rounded-md">
                        {deploymentStatus.deploymentLogs?.join('\n') || 'No logs available'}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="errors" className="p-4 space-y-4">
              {/* Build Errors */}
              {buildErrors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <p className="font-bold">Build Errors ({buildErrors.length})</p>
                      <div className="mt-2 space-y-1">
                        {buildErrors.map((error, index) => (
                          <p key={index} className="text-sm">{error}</p>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Runtime Errors */}
              {runtimeErrors.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div>
                      <p className="font-bold">Runtime Errors ({runtimeErrors.length})</p>
                      <div className="mt-2 space-y-1">
                        {runtimeErrors.map((error, index) => (
                          <p key={index} className="text-sm">{error}</p>
                        ))}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Missing Dependencies */}
              {sandboxStatus?.missingDependencies?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Missing Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {sandboxStatus.missingDependencies.map((dep: string, index: number) => (
                        <p key={index} className="text-sm text-orange-600">{dep}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Added Dependencies */}
              {sandboxStatus?.addedDependencies?.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Added Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {sandboxStatus.addedDependencies.map((dep: string, index: number) => (
                        <p key={index} className="text-sm text-green-600">{dep}</p>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {buildErrors.length === 0 && runtimeErrors.length === 0 && 
               (!sandboxStatus?.missingDependencies || sandboxStatus.missingDependencies.length === 0) && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-600 font-bold">✅ No Errors Found</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Your application is ready for deployment!
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AppDevelopment; 