import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Code2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Project } from "@/lib/types"
import { API_ENDPOINTS } from '@/lib/config'
import { CodeViewer } from './code-viewer'

interface GenerateAppCodeProps {
  project: Project
  onCodeGenerated: (code: any) => void
}

export function GenerateAppCode({ project, onCodeGenerated }: GenerateAppCodeProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedCode, setGeneratedCode] = useState<any>(null)
  const { toast } = useToast()

  const hasPrompt = !!project.prompt && project.prompt.trim() !== ""

  useEffect(() => {
    // Load saved app code if available
    if (project.appCode) {
      setGeneratedCode(project.appCode)
    }
  }, [project.appCode])

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

      const response = await fetch(API_ENDPOINTS.GENERATE.APP_CODE, {
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
      setGeneratedCode(data)
      onCodeGenerated(data)
      
      toast({
        title: "Success",
        description: "Application code generated successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate code",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
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

      {generatedCode && (
        <CodeViewer code={generatedCode} />
      )}
    </div>
  )
} 