import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Code2, Terminal } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Project, AppCodeResponse } from "@/lib/types"
import { API_BASE_URL } from '@/lib/config'
import { CodeViewer } from './code-viewer'

interface GenerateAppCodeProps {
  project: Project
  onCodeGenerated: (code: AppCodeResponse) => void
}

interface CodeGenerationStatus {
  jobId: string
  status: 'processing' | 'completed' | 'failed'
  progress: number
  currentStep: string
  logs: string[]
  result?: any
  error?: string
}

// Helper function to convert backend response to AppCodeResponse
function convertToAppCodeResponse(data: any): AppCodeResponse {
  // If the data already has the correct structure, return it
  if (data.fileStructure?.build?.frontendPackageJson) {
    return data as AppCodeResponse
  }

  // Convert the backend response to match AppCodeResponse structure
  const converted = {
    appType: data.appType || 'unknown',
    framework: data.framework || '',
    version: data.version || '1.0.0',
    fileStructure: {
      frontend: data.fileStructure?.frontend || {
        components: {},
        pages: {},
        utils: {},
        styles: {},
        assets: {},
        config: {}
      },
      backend: data.fileStructure?.backend || {
        controllers: {},
        models: {},
        routes: {},
        utils: {},
        middleware: {},
        config: {}
      },
      shared: data.fileStructure?.shared || {
        types: {},
        interfaces: {},
        constants: {}
      },
      build: {
        frontendPackageJson: data.fileStructure?.build?.packageJson || '',
        backendPackageJson: data.fileStructure?.build?.packageJson || '',
        tsconfig: data.fileStructure?.build?.tsconfig,
        webpackConfig: data.fileStructure?.build?.webpackConfig,
        viteConfig: data.fileStructure?.build?.viteConfig,
        nextConfig: data.fileStructure?.build?.nextConfig,
        dockerfile: data.fileStructure?.build?.dockerfile,
        dockerCompose: data.fileStructure?.build?.dockerCompose
      }
    },
    frontend: data.frontend || {
      components: {},
      pages: {},
      utils: {}
    },
    backend: data.backend || {
      controllers: {},
      models: {},
      routes: {},
      utils: {}
    },
    documentation: data.documentation || '',
    buildConfig: data.buildConfig || {
      dependencies: {},
      devDependencies: {},
      scripts: {},
      buildCommand: '',
      startCommand: '',
      port: 3000
    },
    validation: data.validation || {
      buildErrors: [],
      runtimeErrors: [],
      missingDependencies: [],
      addedDependencies: [],
      lintErrors: [],
      typeErrors: [],
      lastValidated: new Date()
    }
  } as AppCodeResponse

  return converted
}

export function GenerateAppCode({ project, onCodeGenerated }: GenerateAppCodeProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<AppCodeResponse | null>(null)
  const [generationStatus, setGenerationStatus] = useState<CodeGenerationStatus | null>(null)
  const [showLogs, setShowLogs] = useState(false)
  const { toast } = useToast()
  const eventSourceRef = useRef<EventSource | null>(null)

  const hasPrompt = !!project.prompt && project.prompt.trim() !== ""

  useEffect(() => {
    // Load saved app code if available
    if (project.appCode) {
      setGeneratedCode(project.appCode as AppCodeResponse)
    }
  }, [project.appCode])

  // Cleanup event source on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const startLogStreaming = (jobId: string) => {
    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
    }

    // Create new EventSource connection
    const eventSource = new EventSource(`${API_BASE_URL}/openai/code-generation-stream/${jobId}`)
    eventSourceRef.current = eventSource

    eventSource.onmessage = (event) => {
      try {
        const data: CodeGenerationStatus = JSON.parse(event.data)
        setGenerationStatus(data)

        // If completed, close connection and handle result
        if (data.status === 'completed' && data.result) {
          eventSource.close()
          // Convert the result to the expected AppCodeResponse type
          const appCodeResult = convertToAppCodeResponse(data.result)
          setGeneratedCode(appCodeResult)
          onCodeGenerated(appCodeResult)
          setIsGenerating(false)
          toast({
            title: "Success",
            description: "Application code generated successfully",
          })
        }

        // If failed, close connection and show error
        if (data.status === 'failed') {
          eventSource.close()
          setIsGenerating(false)
          toast({
            title: "Error",
            description: data.error || "Failed to generate code",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error parsing SSE data:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error)
      eventSource.close()
    }
  }

  const handleGenerateCode = async () => {
    if (!hasPrompt) {
      toast({
        title: "No prompt available",
        description: "Please generate diagrams first using a prompt.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsGenerating(true)
      setShowLogs(true)
      setGenerationStatus(null)

      const response = await fetch(`${API_BASE_URL}/openai/generate-app-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: project.prompt,
          projectId: project.id,
          umlDiagrams: project.umlDiagrams,
          documentation: project.documentation,
          infraCode: project.infraCode,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const data = await response.json()
      
      if (data.jobId) {
        // Start streaming logs
        startLogStreaming(data.jobId)
      } else {
        // Fallback to old synchronous approach
        const appCodeResult = convertToAppCodeResponse(data)
        setGeneratedCode(appCodeResult)
        onCodeGenerated(appCodeResult)
        setIsGenerating(false)
        toast({
          title: "Success",
          description: "Application code generated successfully",
        })
      }
    } catch (error) {
      setIsGenerating(false)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Application Code</CardTitle>
          <CardDescription>
            Generate full-stack application code based on your diagrams and prompt: "{project.prompt}"
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={handleGenerateCode}
            disabled={isGenerating || !hasPrompt}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Code...
              </>
            ) : (
              <>
                <Code2 className="mr-2 h-4 w-4" />
                {generatedCode ? 'Regenerate Application Code' : 'Generate Application Code'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Real-time Logs Display */}
      {showLogs && (isGenerating || generationStatus) && (
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-4 w-4 text-blue-600" />
                <CardTitle className="text-sm text-blue-800">Code Generation Progress</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowLogs(false)}
                className="h-6 w-6 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Progress Bar */}
            {generationStatus && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-blue-700 mb-1">
                  <span>{generationStatus.currentStep}</span>
                  <span>{generationStatus.progress}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${generationStatus.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Live Logs */}
            <div className="bg-black/5 rounded-lg p-3 max-h-64 overflow-y-auto">
              <div className="space-y-1">
                {generationStatus?.logs.map((log, index) => (
                  <div 
                    key={index} 
                    className="text-xs font-mono text-gray-600/80 leading-relaxed animate-fade-in"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: 'both'
                    }}
                  >
                    {log}
                  </div>
                ))}
                {isGenerating && !generationStatus?.logs.length && (
                  <div className="text-xs font-mono text-gray-500 animate-pulse">
                    Initializing code generation...
                  </div>
                )}
              </div>
            </div>

            {/* Status Indicator */}
            {generationStatus && (
              <div className="mt-3 text-xs text-blue-700">
                {generationStatus.status === 'processing' && (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    <span>Processing...</span>
                  </div>
                )}
                {generationStatus.status === 'completed' && (
                  <div className="flex items-center gap-2 text-green-700">
                    <span>✓</span>
                    <span>Completed successfully!</span>
                  </div>
                )}
                {generationStatus.status === 'failed' && (
                  <div className="flex items-center gap-2 text-red-700">
                    <span>✗</span>
                    <span>Failed: {generationStatus.error}</span>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {generatedCode && !generatedCode.appType && (
        <CodeViewer code={generatedCode} />
      )}
    </div>
  )
}
