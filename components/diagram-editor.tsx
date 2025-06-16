"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import dynamic from "next/dynamic"
import { CodeEditor } from "@/app/projects/[id]/components/code-editor"

// Dynamically import the Mermaid component with no SSR
const Mermaid = dynamic(() => import("./mermaid-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[300px]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  ),
})

interface DiagramEditorProps {
  initialCode: string
  title?: string
  onCodeChange?: (code: string) => void
}

export function DiagramEditor({ initialCode, title = "Diagram Editor", onCodeChange }: DiagramEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [renderKey, setRenderKey] = useState(0)

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  const handleCodeChange = (newCode: string | undefined) => {
    if (newCode !== undefined) {
      setCode(newCode)
      onCodeChange?.(newCode)
    }
  }

  const handleRetry = () => {
    setRenderKey(prev => prev + 1)
  }

  return (
    <div className="grid grid-cols-2 gap-4 h-[600px]">
      <Card className="h-full">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium">Code</CardTitle>
          <Button variant="ghost" size="icon" onClick={handleRetry} title="Retry rendering">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Retry</span>
          </Button>
        </CardHeader>
        <CardContent className="h-[calc(100%-3rem)]">
          <CodeEditor
            code={code}
            language="mermaid"
            readOnly={false}
            onChange={handleCodeChange}
          />
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Preview</CardTitle>
        </CardHeader>
        <CardContent className="h-[calc(100%-3rem)]">
          <div className="h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-md">
            <Mermaid key={`preview-${renderKey}`} chart={code} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
