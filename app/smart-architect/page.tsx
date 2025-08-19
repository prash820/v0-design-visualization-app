'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { authenticatedFetch } from '@/lib/auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { useToast } from '@/hooks/use-toast'
import { 
  Brain, 
  Zap, 
  DollarSign, 
  Shield, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  ArrowRight,
  Sparkles,
  Target,
  Scale,
  LogOut,
  Cloud,
  X,
  Server,
  Code2,
  Play,
  Eye
} from 'lucide-react'

interface ArchitectureOption {
  id: string
  name: string
  description: string
  architecture: string
  estimatedCost: {
    monthly: number
    yearly: number
    currency: string
  }
  costBreakdown?: {
    compute: number
    storage: number
    database: number
    networking: number
    monitoring: number
    other: number
  }
  pros: string[]
  cons: string[]
  bestFor: string
  complexity: 'low' | 'medium' | 'high'
  scalability: 'low' | 'medium' | 'high'
  security: 'low' | 'medium' | 'high'
  performance: 'low' | 'medium' | 'high'
  infrastructureCode?: string
  deploymentSteps?: string[]
  estimatedDeploymentTime?: string
  maintenanceEffort?: 'low' | 'medium' | 'high'
  disasterRecovery?: string
  compliance?: string[]
}

interface ArchitectureJob {
  id: string
  status: string
  progress: number
  phase: string
  userPrompt?: string
  architectureOptions?: ArchitectureOption[]
  selectedOption?: string
  recommendationReasoning?: string
  error?: string
  createdAt: string
  updatedAt: string
}

export default function SmartArchitectPage() {
  const [prompt, setPrompt] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentJob, setCurrentJob] = useState<ArchitectureJob | null>(null)
  const [jobs, setJobs] = useState<ArchitectureJob[]>([])
  const [selectedOptionForDetails, setSelectedOptionForDetails] = useState<ArchitectureOption | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentStatus, setDeploymentStatus] = useState<string>('')
  const [deploymentCompleted, setDeploymentCompleted] = useState(false)
  const { toast } = useToast()
  const { user, logout } = useAuth()

  const handleCreateRecommendation = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please describe your application idea to get architecture recommendations.",
        variant: "destructive"
      })
      return
    }

    setIsAnalyzing(true)
    setCurrentJob(null)

    try {
      const response = await authenticatedFetch('/api/architecture/generate', {
        method: 'POST',
        body: JSON.stringify({
          prompt,
          projectId: `arch-${Date.now()}`,
          userId: user?.id
        })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to start architecture analysis')
      }

      setCurrentJob({
        id: data.jobId,
        status: data.status,
        progress: 0,
        phase: 'analyzing',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast({
        title: "Analysis Started",
        description: "Your architecture analysis is being processed. This may take a few minutes.",
      })

      // Start polling
      pollJobStatus(data.jobId)

    } catch (error) {
      console.error('Error creating architecture recommendation:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to start architecture analysis",
        variant: "destructive"
      })
      setIsAnalyzing(false)
    }
  }

  const pollJobStatus = async (jobId: string) => {
    const maxAttempts = 60 // 5 minutes with 5-second intervals
    let attempts = 0

    const poll = async () => {
      try {
        const response = await authenticatedFetch(`/api/architecture/status/${jobId}`)
        const job = await response.json()

        if (!response.ok) {
          throw new Error(job.error || 'Failed to fetch job status')
        }

        setCurrentJob(job)

        if (job.status === 'completed') {
          setIsAnalyzing(false)
          setCurrentJob(job) // Keep the job to display the results
          toast({
            title: "Analysis Complete!",
            description: "Your architecture recommendations are ready. Review the options below.",
          })
          return
        } else if (job.status === 'failed') {
          setIsAnalyzing(false)
          setCurrentJob(job) // Keep the job to show the error
          toast({
            title: "Analysis Failed",
            description: job.error || "Failed to generate architecture recommendations",
            variant: "destructive"
          })
          return
        }

        // Continue polling
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000) // Poll every 5 seconds
        } else {
          setIsAnalyzing(false)
          setCurrentJob(null)
          toast({
            title: "Analysis Timeout",
            description: "The analysis is taking longer than expected. Please try again.",
            variant: "destructive"
          })
        }
      } catch (error) {
        console.error('Error polling job status:', error)
        attempts++
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000)
        } else {
          setIsAnalyzing(false)
          setCurrentJob(null)
          toast({
            title: "Polling Error",
            description: "Failed to check analysis status. Please refresh the page.",
            variant: "destructive"
          })
        }
      }
    }

    poll()
  }

  const handleSelectOption = async (jobId: string, optionId: string) => {
    try {
      const response = await authenticatedFetch(`/api/architecture/select/${jobId}`, {
        method: 'POST',
        body: JSON.stringify({ selectedOptionId: optionId })
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to select option')
      }

      toast({
        title: "Option Selected",
        description: "Your architecture option has been selected successfully!",
      })

      // Update the current job
      if (currentJob) {
        setCurrentJob({
          ...currentJob,
          selectedOption: optionId,
          status: 'option-selected'
        })
      }

    } catch (error) {
      console.error('Error selecting option:', error)
      toast({
        title: "Selection Error",
        description: error instanceof Error ? error.message : "Failed to select architecture option",
        variant: "destructive"
      })
    }
  }

  const handleOptionDoubleClick = (option: ArchitectureOption) => {
    setSelectedOptionForDetails(option)
    setShowDetailsModal(true)
    // Reset deployment state
    setIsDeploying(false)
    setDeploymentStatus('')
    setDeploymentCompleted(false)
  }

  const handleDeployInfrastructure = async () => {
    if (!selectedOptionForDetails || !currentJob) {
      toast({
        title: "Error",
        description: "No architecture option selected for deployment",
        variant: "destructive"
      })
      return
    }

    setIsDeploying(true)
    setDeploymentStatus('Initializing deployment...')

    try {
      // First, create an infrastructure job using the selected architecture
      const createResponse = await authenticatedFetch('/api/iac/create', {
        method: 'POST',
        body: JSON.stringify({
          prompt: currentJob.userPrompt || 'Deploying selected architecture',
          projectId: `deploy-${currentJob.id}-${selectedOptionForDetails.id}`,
          autoDeploy: true,
          selectedArchitecture: selectedOptionForDetails,
          userId: user?.id
        })
      })

      if (!createResponse.ok) {
        const errorData = await createResponse.json()
        throw new Error(errorData.error || 'Failed to create deployment job')
      }

      const createData = await createResponse.json()
      const jobId = createData.jobId

      toast({
        title: "Deployment Started",
        description: "Infrastructure deployment is being initialized. This may take several minutes.",
      })

      // Poll for deployment status
      const pollDeployment = async () => {
        const maxAttempts = 120 // 10 minutes with 5-second intervals (deployment takes longer)
        let attempts = 0

        const poll = async () => {
          try {
            console.log(`[Deployment] Polling job status for jobId: ${jobId}, attempt: ${attempts + 1}`)
            const statusResponse = await authenticatedFetch(`/api/iac/status/${jobId}`)
            const job = await statusResponse.json()

            console.log(`[Deployment] Job status response:`, job)

            if (!statusResponse.ok) {
              throw new Error(job.error || 'Failed to fetch deployment status')
            }

            setDeploymentStatus(`${job.phase.replace('-', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())} - ${job.progress}%`)

            if (job.status === 'completed') {
              console.log(`[Deployment] Job completed successfully`)
              setIsDeploying(false)
              setDeploymentCompleted(true)
              setDeploymentStatus('Deployment completed successfully!')
              toast({
                title: "Deployment Complete!",
                description: "Your infrastructure has been deployed successfully.",
              })
              return
            } else if (job.status === 'failed') {
              console.log(`[Deployment] Job failed:`, job.error)
              setIsDeploying(false)
              setDeploymentStatus('Deployment failed')
              toast({
                title: "Deployment Failed",
                description: job.error || "Failed to deploy infrastructure",
                variant: "destructive"
              })
              return
            }

            console.log(`[Deployment] Job still processing, status: ${job.status}, phase: ${job.phase}, progress: ${job.progress}%`)
            
            // Continue polling
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000) // Poll every 5 seconds
            } else {
              setIsDeploying(false)
              setDeploymentStatus('Deployment timeout')
              toast({
                title: "Deployment Timeout",
                description: "The deployment is taking longer than expected. Please check the dashboard for status.",
                variant: "destructive"
              })
            }
          } catch (error) {
            console.error(`[Deployment] Polling error:`, error)
            attempts++
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000)
            } else {
              setIsDeploying(false)
              setDeploymentStatus('Deployment failed')
              toast({
                title: "Deployment Error",
                description: error instanceof Error ? error.message : "Failed to deploy infrastructure",
                variant: "destructive"
              })
            }
          }
        }

        // Start polling
        poll()
      }

    } catch (error) {
      setIsDeploying(false)
      setDeploymentStatus('Deployment failed')
      console.error('Error deploying infrastructure:', error)
      toast({
        title: "Deployment Error",
        description: error instanceof Error ? error.message : "Failed to deploy infrastructure",
        variant: "destructive"
      })
    }
  }

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'high': return 'text-green-600 bg-green-100'
      case 'medium': return 'text-yellow-600 bg-yellow-100'
      case 'low': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'high': return <TrendingUp className="h-4 w-4" />
      case 'medium': return <Scale className="h-4 w-4" />
      case 'low': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="text-center mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center justify-center flex-1">
            <Sparkles className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">Smart Cloud Architect</h1>
          </div>
          
          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Cloud className="h-4 w-4" />
                Dashboard
              </Button>
            </Link>
          </div>
          
          {/* User Profile and Logout */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-medium">{user.name || user.email}</p>
                <p className="text-xs text-gray-500">{user.role}</p>
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
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Describe your application idea and get 3 optimized architecture options with detailed cost analysis and trade-offs
        </p>
      </div>

      {/* Input Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            Describe Your Application
          </CardTitle>
          <CardDescription>
            Tell us about your application idea, requirements, and goals. Be as detailed as possible for better recommendations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            placeholder="e.g., I want to build a social media platform for photographers with image upload, user profiles, comments, and real-time notifications. It should handle high traffic and be cost-effective..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] mb-4"
            disabled={isAnalyzing}
          />
          <Button 
            onClick={handleCreateRecommendation}
            disabled={isAnalyzing || !prompt.trim()}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Architecture...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Get Architecture Recommendations
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Section */}
      {currentJob && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Analysis Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Phase: {currentJob.phase.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                <span>{currentJob.progress}%</span>
              </div>
              <Progress value={currentJob.progress} className="w-full" />
              <div className="text-sm text-gray-500">
                {currentJob.phase === 'analyzing-requirements' && 'Analyzing your requirements and understanding the architecture needs...'}
                {currentJob.phase === 'generating-options' && 'Generating 3 optimized architecture options with cost analysis...'}
                {currentJob.phase === 'completed' && 'Analysis complete! Review your options below.'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Section */}
      {currentJob?.architectureOptions && (
        <div className="space-y-8">
          {/* Recommendation Reasoning */}
          {currentJob.recommendationReasoning && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                  Expert Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  {currentJob.recommendationReasoning}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Architecture Options */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {currentJob.architectureOptions.map((option, index) => (
              <Card 
                key={option.id} 
                className="relative cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onDoubleClick={() => handleOptionDoubleClick(option)}
                title="Double-click for detailed view"
              >
                {/* Option Type Badge */}
                <div className="absolute top-4 right-4">
                  <Badge variant={index === 0 ? "default" : index === 1 ? "secondary" : "outline"}>
                    {index === 0 ? "Cost-Optimized" : index === 1 ? "Performance-Optimized" : "Balanced"}
                  </Badge>
                </div>

                <CardHeader>
                  <CardTitle className="text-xl">{option.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {option.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Cost Analysis */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <DollarSign className="h-4 w-4 mr-2 text-green-600" />
                      <span className="font-semibold">Estimated Costs</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Monthly:</span>
                        <div className="font-semibold text-green-600">
                          ${option.estimatedCost.monthly.toLocaleString()}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Yearly:</span>
                        <div className="font-semibold text-green-600">
                          ${option.estimatedCost.yearly.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ratings */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">Security:</span>
                      <Badge className={`text-xs ${getRatingColor(option.security)}`}>
                        {getRatingIcon(option.security)}
                        <span className="ml-1 capitalize">{option.security}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="text-sm">Scalability:</span>
                      <Badge className={`text-xs ${getRatingColor(option.scalability)}`}>
                        {getRatingIcon(option.scalability)}
                        <span className="ml-1 capitalize">{option.scalability}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm">Performance:</span>
                      <Badge className={`text-xs ${getRatingColor(option.performance)}`}>
                        {getRatingIcon(option.performance)}
                        <span className="ml-1 capitalize">{option.performance}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4 text-indigo-600" />
                      <span className="text-sm">Complexity:</span>
                      <Badge className={`text-xs ${getRatingColor(option.complexity)}`}>
                        {getRatingIcon(option.complexity)}
                        <span className="ml-1 capitalize">{option.complexity}</span>
                      </Badge>
                    </div>
                  </div>

                  {/* Pros and Cons */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Pros
                      </h4>
                      <ul className="text-sm space-y-1">
                        {option.pros.map((pro, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-green-500 mr-2">•</span>
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-red-700 mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        Cons
                      </h4>
                      <ul className="text-sm space-y-1">
                        {option.cons.map((con, idx) => (
                          <li key={idx} className="flex items-start">
                            <span className="text-red-500 mr-2">•</span>
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Best For */}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-1">Best For:</h4>
                    <p className="text-sm text-blue-700">{option.bestFor}</p>
                  </div>

                  {/* Architecture Details */}
                  <details className="group">
                    <summary className="cursor-pointer font-semibold text-gray-700 hover:text-gray-900 flex items-center">
                      <ArrowRight className="h-4 w-4 mr-2 group-open:rotate-90 transition-transform" />
                      Technical Architecture
                    </summary>
                    <div className="mt-3 p-3 bg-gray-900 text-green-400 rounded-md text-sm font-mono whitespace-pre-wrap">
                      {option.architecture}
                    </div>
                  </details>

                  {/* Select Button */}
                  <Button 
                    onClick={() => handleSelectOption(currentJob.id, option.id)}
                    className="w-full"
                    variant={currentJob.selectedOption === option.id ? "default" : "outline"}
                    disabled={currentJob.selectedOption === option.id}
                  >
                    {currentJob.selectedOption === option.id ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Selected
                      </>
                    ) : (
                      <>
                        <Target className="h-4 w-4 mr-2" />
                        Select This Option
                      </>
                    )}
                  </Button>
                  
                  {/* Double-click hint */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 flex items-center justify-center gap-1">
                      <Eye className="h-3 w-3" />
                      Double-click for detailed view
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Detailed View Modal */}
      {showDetailsModal && selectedOptionForDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedOptionForDetails.name}</h2>
                <p className="text-gray-600 mt-1">{selectedOptionForDetails.description}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (currentJob) {
                      handleSelectOption(currentJob.id, selectedOptionForDetails.id)
                    }
                  }}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Select This Option
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleDeployInfrastructure}
                  disabled={isDeploying || !selectedOptionForDetails.infrastructureCode}
                  className="flex items-center gap-2"
                >
                  {isDeploying ? (
                    <>
                      <Clock className="h-4 w-4 animate-spin" />
                      Deploying...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      Deploy Infrastructure
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowDetailsModal(false)}
                >
                  <X className="h-4 w-4" />
                  Close
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              {/* Deployment Status */}
              {isDeploying && (
                <Card className="mb-6 border-blue-200 bg-blue-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Clock className="h-6 w-6 text-blue-600 animate-spin" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-blue-800">
                          Deploying Infrastructure
                        </h3>
                        <p className="text-blue-700 mt-1">
                          {deploymentStatus}
                        </p>
                        <div className="mt-3">
                          <Progress value={deploymentStatus.includes('%') ? parseInt(deploymentStatus.match(/(\d+)%/)?.[1] || '0') : 0} className="w-full" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Deployment Success */}
              {deploymentCompleted && (
                <Card className="mb-6 border-green-200 bg-green-50">
                  <CardContent className="pt-6">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-green-800">
                          Infrastructure Deployed Successfully!
                        </h3>
                        <p className="text-green-700 mt-1">
                          Your infrastructure has been deployed to AWS and is ready to use.
                        </p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.location.href = '/dashboard'}
                            className="border-green-300 text-green-700 hover:bg-green-100"
                          >
                            <Cloud className="mr-2 h-4 w-4" />
                            View in Dashboard
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeploymentCompleted(false)}
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Cost Analysis */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5 text-green-600" />
                        Detailed Cost Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            ${selectedOptionForDetails.estimatedCost.monthly.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Monthly</div>
                        </div>
                        <div className="text-center p-3 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            ${selectedOptionForDetails.estimatedCost.yearly.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-600">Yearly</div>
                        </div>
                      </div>
                      
                      {/* Cost Breakdown */}
                      {selectedOptionForDetails.costBreakdown && (
                        <div>
                          <h4 className="font-semibold mb-3">Cost Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span>Compute</span>
                              <span className="font-semibold">${selectedOptionForDetails.costBreakdown.compute.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Storage</span>
                              <span className="font-semibold">${selectedOptionForDetails.costBreakdown.storage.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Database</span>
                              <span className="font-semibold">${selectedOptionForDetails.costBreakdown.database.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Networking</span>
                              <span className="font-semibold">${selectedOptionForDetails.costBreakdown.networking.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Monitoring</span>
                              <span className="font-semibold">${selectedOptionForDetails.costBreakdown.monitoring.toLocaleString()}/mo</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="font-semibold">Other</span>
                              <span className="font-semibold">${selectedOptionForDetails.costBreakdown.other.toLocaleString()}/mo</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Technical Specifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Server className="h-5 w-5 text-blue-600" />
                        Technical Specifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-700 capitalize">
                            {selectedOptionForDetails.complexity}
                          </div>
                          <div className="text-sm text-gray-600">Complexity</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-700 capitalize">
                            {selectedOptionForDetails.scalability}
                          </div>
                          <div className="text-sm text-gray-600">Scalability</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-700 capitalize">
                            {selectedOptionForDetails.security}
                          </div>
                          <div className="text-sm text-gray-600">Security</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold text-gray-700 capitalize">
                            {selectedOptionForDetails.performance}
                          </div>
                          <div className="text-sm text-gray-600">Performance</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Deployment Information */}
                  {selectedOptionForDetails.estimatedDeploymentTime && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-orange-600" />
                          Deployment Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span>Estimated Deployment Time</span>
                          <span className="font-semibold">{selectedOptionForDetails.estimatedDeploymentTime}</span>
                        </div>
                        {selectedOptionForDetails.maintenanceEffort && (
                          <div className="flex justify-between items-center">
                            <span>Maintenance Effort</span>
                            <span className="font-semibold capitalize">{selectedOptionForDetails.maintenanceEffort}</span>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Infrastructure Code */}
                  {selectedOptionForDetails.infrastructureCode && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Code2 className="h-5 w-5 text-purple-600" />
                          Infrastructure Code
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-md overflow-x-auto">
                          <pre className="text-sm font-mono whitespace-pre-wrap">
                            {selectedOptionForDetails.infrastructureCode}
                          </pre>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Deployment Steps */}
                  {selectedOptionForDetails.deploymentSteps && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Play className="h-5 w-5 text-green-600" />
                          Deployment Steps
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {selectedOptionForDetails.deploymentSteps.map((step, index) => (
                            <li key={index} className="flex items-start">
                              <span className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="text-sm">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </CardContent>
                    </Card>
                  )}

                  {/* Disaster Recovery */}
                  {selectedOptionForDetails.disasterRecovery && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Shield className="h-5 w-5 text-red-600" />
                          Disaster Recovery
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-700">{selectedOptionForDetails.disasterRecovery}</p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Compliance */}
                  {selectedOptionForDetails.compliance && selectedOptionForDetails.compliance.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          Compliance & Standards
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2">
                          {selectedOptionForDetails.compliance.map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </ProtectedRoute>
  )
} 