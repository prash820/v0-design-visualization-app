import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Loader2, Code2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Project } from "@/lib/types"

interface GenerateAppCodeProps {
  project: Project
  onCodeGenerated: (code: any) => void
}

export function GenerateAppCode({ project, onCodeGenerated }: GenerateAppCodeProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const hasPrompt = !!project.prompt && project.prompt.trim() !== ""

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

      const response = await fetch('/api/code/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          umlDiagrams: project.umlDiagrams,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate code')
      }

      const data = await response.json()
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
              Generate Application Code
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
} 