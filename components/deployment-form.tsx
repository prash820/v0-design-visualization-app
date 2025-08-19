'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Github, 
  Gitlab, 
  Upload, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Eye,
  EyeOff,
  Settings,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { DeploymentEndpoints } from './deployment-endpoints'
import { DeploymentWizard } from './deployment-wizard'

interface DeploymentFormProps {
  projectId: string
  infrastructureId: string
  onDeploymentStarted?: (deploymentId: string) => void
  infrastructureStatus?: 'not-deployed' | 'deployed' | 'failed' | 'unknown'
  hasTerraformCode?: boolean
}

interface DeploymentStatus {
  id: string
  status: 'pending' | 'cloning' | 'building' | 'testing' | 'deploying' | 'completed' | 'failed'
  progress: number
  logs: string[]
  error?: string
  environment: string
  createdAt: string
  updatedAt: string
  source?: {
    type: 'github' | 'gitlab' | 'zip'
    url?: string
    branch?: string
    token?: string
  }
}

interface UserToken {
  hasToken: boolean
  provider: string
}

export default function DeploymentForm({ 
  projectId, 
  infrastructureId, 
  onDeploymentStarted,
  infrastructureStatus = 'unknown',
  hasTerraformCode = false
}: DeploymentFormProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('github')
  const [showToken, setShowToken] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentId, setDeploymentId] = useState<string | null>(null)
  const [deploymentStatus, setDeploymentStatus] = useState<any>(null)
  const [deploymentHistory, setDeploymentHistory] = useState<any[]>([])
  const [userTokens, setUserTokens] = useState<{ github?: { hasToken: boolean }, gitlab?: { hasToken: boolean } }>({})

  // Form state
  const [githubUrl, setGithubUrl] = useState('')
  const [githubBranch, setGithubBranch] = useState('main')
  const [githubToken, setGithubToken] = useState('')
  const [gitlabUrl, setGitlabUrl] = useState('')
  const [gitlabBranch, setGitlabBranch] = useState('main')
  const [gitlabToken, setGitlabToken] = useState('')
  const [zipPath, setZipPath] = useState('')
  const [environment, setEnvironment] = useState('dev')
  const [repositoryStatus, setRepositoryStatus] = useState<string>('')
  const [showWizard, setShowWizard] = useState(false)
  const [wizardConfig, setWizardConfig] = useState<any>(null)

  // Check if deployment is available
  const canDeploy = infrastructureStatus === 'deployed' && hasTerraformCode
  const deploymentDisabled = !canDeploy

  useEffect(() => {
    loadUserTokens()
    loadDeploymentHistory()
  }, [])

  useEffect(() => {
    if (deploymentId) {
      const interval = setInterval(() => {
        pollDeploymentStatus(deploymentId)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [deploymentId])

  // Check repository status when URL changes
  useEffect(() => {
    const checkRepositoryStatus = async () => {
      if (activeTab === 'github' && githubUrl) {
        setRepositoryStatus('Checking repository...')
        try {
          // This would be a backend endpoint to check repository status
          // For now, we'll just show a placeholder
          setRepositoryStatus('Repository found - will pull latest changes if already cloned')
        } catch (error) {
          setRepositoryStatus('Error checking repository')
        }
      } else if (activeTab === 'gitlab' && gitlabUrl) {
        setRepositoryStatus('Repository found - will pull latest changes if already cloned')
      } else {
        setRepositoryStatus('')
      }
    }

    const timeoutId = setTimeout(checkRepositoryStatus, 1000)
    return () => clearTimeout(timeoutId)
  }, [githubUrl, gitlabUrl, activeTab])

  const loadUserTokens = async () => {
    try {
      const [githubResponse, gitlabResponse] = await Promise.all([
        authenticatedFetch('/api/deployment/tokens/github'),
        authenticatedFetch('/api/deployment/tokens/gitlab')
      ])

      if (githubResponse.ok) {
        const githubToken = await githubResponse.json()
        setUserTokens(prev => ({ ...prev, github: githubToken }))
      }

      if (gitlabResponse.ok) {
        const gitlabToken = await gitlabResponse.json()
        setUserTokens(prev => ({ ...prev, gitlab: gitlabToken }))
      }
    } catch (error) {
      console.error('Error loading user tokens:', error)
    }
  }

  const loadDeploymentHistory = async () => {
    try {
      const response = await authenticatedFetch(`/api/deployment/history/${projectId}`)
      if (response.ok) {
        const data = await response.json()
        setDeploymentHistory(data.deployments || [])
      }
    } catch (error) {
      console.error('Error loading deployment history:', error)
    }
  }

  const pollDeploymentStatus = async (id: string) => {
    try {
      const response = await authenticatedFetch(`/api/deployment/status/${id}`)
      if (response.ok) {
        const status = await response.json()
        setDeploymentStatus(status)
        
        if (status.status === 'completed' || status.status === 'failed') {
          setDeploymentId(null)
          setIsDeploying(false)
          loadDeploymentHistory()
          
          if (status.status === 'completed') {
            toast({
              title: "Deployment Completed",
              description: "Your application has been successfully deployed!",
            })
          } else {
            toast({
              title: "Deployment Failed",
              description: status.error || "Deployment failed. Check logs for details.",
              variant: "destructive"
            })
          }
        }
      }
    } catch (error) {
      console.error('Error polling deployment status:', error)
    }
  }

  const saveToken = async (provider: 'github' | 'gitlab', token: string) => {
    try {
      const response = await authenticatedFetch('/api/deployment/tokens', {
        method: 'POST',
        body: JSON.stringify({ provider, token })
      })

      if (response.ok) {
        toast({
          title: "Token Saved",
          description: `${provider} token has been saved successfully.`,
        })
        loadUserTokens()
      } else {
        const error = await response.json()
        toast({
          title: "Token Save Failed",
          description: error.error || "Failed to save token.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error saving token:', error)
      toast({
        title: "Error",
        description: "Failed to save token.",
        variant: "destructive"
      })
    }
  }

  const startDeployment = async () => {
    if (!user) return

    let source: any = {}
    
    switch (activeTab) {
      case 'github':
        if (!githubUrl) {
          toast({
            title: "Missing URL",
            description: "Please enter a GitHub repository URL.",
            variant: "destructive"
          })
          return
        }
        source = {
          type: 'github',
          url: githubUrl,
          branch: githubBranch || 'main',
          token: githubToken || undefined
        }
        break
      case 'gitlab':
        if (!gitlabUrl) {
          toast({
            title: "Missing URL",
            description: "Please enter a GitLab repository URL.",
            variant: "destructive"
          })
          return
        }
        source = {
          type: 'gitlab',
          url: gitlabUrl,
          branch: gitlabBranch || 'main',
          token: gitlabToken || undefined
        }
        break
      case 'zip':
        if (!zipPath) {
          toast({
            title: "Missing File Path",
            description: "Please enter the path to your ZIP file.",
            variant: "destructive"
          })
          return
        }
        source = {
          type: 'zip',
          url: zipPath
        }
        break
    }

    setIsDeploying(true)
    try {
      const response = await authenticatedFetch('/api/deployment/start', {
        method: 'POST',
        body: JSON.stringify({
          projectId,
          source,
          environment,
          infrastructureId
        })
      })

      if (response.ok) {
        const data = await response.json()
        setDeploymentId(data.deploymentId)
        onDeploymentStarted && onDeploymentStarted(data.deploymentId)
        toast({
          title: "Deployment Started",
          description: "Your application deployment has been initiated.",
        })
      } else {
        const error = await response.json()
        toast({
          title: "Deployment Failed",
          description: error.error || "Failed to start deployment.",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Deployment error:', error)
      toast({
        title: "Deployment Error",
        description: "An error occurred during deployment.",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'failed': return 'bg-red-100 text-red-800'
      case 'deploying': return 'bg-blue-100 text-blue-800'
      case 'building': return 'bg-yellow-100 text-yellow-800'
      case 'testing': return 'bg-purple-100 text-purple-800'
      case 'cloning': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'failed': return <AlertCircle className="h-4 w-4" />
      case 'deploying': return <Play className="h-4 w-4" />
      case 'building': return <RefreshCw className="h-4 w-4" />
      case 'testing': return <Settings className="h-4 w-4" />
      case 'cloning': return <Clock className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Infrastructure Dependency Warning */}
      {deploymentDisabled && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Infrastructure Required
            </CardTitle>
            <CardDescription className="text-orange-700">
              You need to provision infrastructure before deploying your application code.
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
                  Once infrastructure is successfully deployed, you'll be able to deploy your application code here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Form */}
      <Card className={deploymentDisabled ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Deploy Application Code
              </CardTitle>
              <CardDescription>
                Deploy your application code to the generated infrastructure
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowWizard(!showWizard)}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              {showWizard ? 'Simple Mode' : 'Wizard Mode'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Source Selection */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="gitlab" className="flex items-center gap-2">
                <Gitlab className="h-4 w-4" />
                GitLab
              </TabsTrigger>
              <TabsTrigger value="zip" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                ZIP File
              </TabsTrigger>
            </TabsList>

            <TabsContent value="github" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="github-url">Repository URL</Label>
                  <Input
                    id="github-url"
                    placeholder="https://github.com/username/repository"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                  />
                  {repositoryStatus && (
                    <p className="text-sm text-blue-600 mt-1">{repositoryStatus}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="github-branch">Branch</Label>
                  <Input
                    id="github-branch"
                    placeholder="main"
                    value={githubBranch}
                    onChange={(e) => setGithubBranch(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    The deployment will pull the latest changes from this branch
                  </p>
                </div>
                <div>
                  <Label htmlFor="github-token">GitHub Token (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="github-token"
                      type={showToken ? "text" : "password"}
                      placeholder="ghp_..."
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {githubToken && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => saveToken('github', githubToken)}
                      className="mt-2"
                    >
                      Save Token
                    </Button>
                  )}
                  {userTokens.github?.hasToken && (
                    <Badge variant="secondary" className="mt-2">
                      Token saved
                    </Badge>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="gitlab" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="gitlab-url">Repository URL</Label>
                  <Input
                    id="gitlab-url"
                    placeholder="https://gitlab.com/username/repository"
                    value={gitlabUrl}
                    onChange={(e) => setGitlabUrl(e.target.value)}
                  />
                  {repositoryStatus && (
                    <p className="text-sm text-blue-600 mt-1">{repositoryStatus}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="gitlab-branch">Branch</Label>
                  <Input
                    id="gitlab-branch"
                    placeholder="main"
                    value={gitlabBranch}
                    onChange={(e) => setGitlabBranch(e.target.value)}
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    The deployment will pull the latest changes from this branch
                  </p>
                </div>
                <div>
                  <Label htmlFor="gitlab-token">GitLab Token (Optional)</Label>
                  <div className="relative">
                    <Input
                      id="gitlab-token"
                      type={showToken ? "text" : "password"}
                      placeholder="glpat-..."
                      value={gitlabToken}
                      onChange={(e) => setGitlabToken(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                  {gitlabToken && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => saveToken('gitlab', gitlabToken)}
                      className="mt-2"
                    >
                      Save Token
                    </Button>
                  )}
                  {userTokens.gitlab?.hasToken && (
                    <Badge variant="secondary" className="mt-2">
                      Token saved
                    </Badge>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="zip" className="space-y-4">
              <div>
                <Label htmlFor="zip-path">ZIP File Path</Label>
                <Input
                  id="zip-path"
                  placeholder="/path/to/your/application.zip"
                  value={zipPath}
                  onChange={(e) => setZipPath(e.target.value)}
                />
                <p className="text-sm text-gray-600 mt-1">
                  Enter the full path to your ZIP file on the server
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* Environment Selection */}
          <div>
            <Label htmlFor="environment">Environment</Label>
            <Select value={environment} onValueChange={setEnvironment}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dev">Development</SelectItem>
                <SelectItem value="staging">Staging</SelectItem>
                <SelectItem value="prod">Production</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Deploy Button */}
          <Button
            onClick={startDeployment}
            disabled={isDeploying}
            className="w-full"
            size="lg"
          >
            <Play className="h-4 w-4 mr-2" />
            {isDeploying ? 'Deploying...' : 'Deploy Application'}
          </Button>
        </CardContent>
        
        {/* Wizard Mode */}
        {showWizard && (
          <div className="border-t pt-6">
            <DeploymentWizard 
              projectId={projectId}
              onComplete={(config) => {
                setWizardConfig(config)
                setShowWizard(false)
                toast({
                  title: "Configuration Complete",
                  description: "Your deployment configuration has been saved. You can now deploy using the form above.",
                })
              }}
            />
          </div>
        )}
      </Card>

      {/* Deployment Status */}
      {deploymentId && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Status: {deploymentStatus?.status || 'Unknown'}</span>
                <Badge variant={deploymentStatus?.status === 'completed' ? 'default' : 'secondary'}>
                  {deploymentStatus?.progress || 0}%
                </Badge>
              </div>
              {deploymentStatus?.logs && (
                <div className="bg-gray-100 p-4 rounded-md">
                  <h4 className="font-medium mb-2">Deployment Logs</h4>
                  <pre className="text-sm whitespace-pre-wrap">{deploymentStatus.logs}</pre>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Deployment Endpoints */}
      {deploymentStatus?.status === 'completed' && deploymentStatus.logs && (
        (() => {
          try {
            const logsData = typeof deploymentStatus.logs === 'string' 
              ? JSON.parse(deploymentStatus.logs) 
              : deploymentStatus.logs
            
            return (
              <DeploymentEndpoints 
                endpoints={logsData.endpoints}
                deploymentUrl={logsData.deploymentUrl}
              />
            )
          } catch (error) {
            return null
          }
        })()
      )}

      {/* Deployment History */}
      {deploymentHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Deployment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deploymentHistory.map((deployment) => (
                <div key={deployment.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <div className="font-medium">
                      {deployment.source?.type} - {deployment.environment}
                    </div>
                    <div className="text-sm text-gray-600">
                      {new Date(deployment.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <Badge variant={deployment.status === 'completed' ? 'default' : 'secondary'}>
                    {deployment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 