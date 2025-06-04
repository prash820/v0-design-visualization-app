"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Check, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

// Dynamically import the Mermaid component with no SSR
const Mermaid = dynamic(() => import("./mermaid-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[300px]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  ),
})

interface DiagramRendererProps {
  diagram: any
  className?: string
  splitScreen?: boolean
  onCodeChange?: (code: string) => void
}

export default function DiagramRenderer({
  diagram,
  className = "",
  splitScreen = false,
  onCodeChange,
}: DiagramRendererProps) {
  const [copied, setCopied] = useState(false)
  const [renderAttempt, setRenderAttempt] = useState(0)
  const [localCode, setLocalCode] = useState(diagram?.diagramData || "")
  const { toast } = useToast()

  // Update local code when diagram changes
  useEffect(() => {
    setLocalCode(diagram?.diagramData || "")
  }, [diagram?.diagramData])

  const handleCodeChange = (newCode: string) => {
    setLocalCode(newCode)
    onCodeChange?.(newCode)
  }

  const handleCopyCode = () => {
    if (!diagram?.diagramData) return

    navigator.clipboard.writeText(diagram.diagramData)
    setCopied(true)

    toast({
      title: "Copied to clipboard",
      description: "Diagram code has been copied to your clipboard.",
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!diagram?.diagramData) return

    // Create a Blob from the diagram data
    const file = new Blob([diagram.diagramData], { type: "text/plain" })
    const element = document.createElement("a")
    element.href = URL.createObjectURL(file)
    element.download = `diagram-${diagram.diagramType?.toLowerCase().replace(/\s+/g, "-") || "diagram"}-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download started",
      description: "Your diagram code is being downloaded as text.",
    })
  }

  const handleRetry = () => {
    setRenderAttempt((prev) => prev + 1)
  }

  // If split screen mode, render the split layout
  if (splitScreen) {
    return (
      <div className="flex h-[600px] border rounded-lg overflow-hidden">
        {/* Diagram Preview - 2/3 width */}
        <div className="flex-1 bg-white dark:bg-gray-900 border-r">
          <div className="h-full p-4 overflow-auto">
            <Mermaid key={`split-${renderAttempt}`} chart={localCode} />
          </div>
        </div>

        {/* Code Editor - 1/3 width */}
        <div className="w-1/3 bg-gray-50 dark:bg-gray-800 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-gray-100 dark:bg-gray-700">
            <span className="text-sm font-medium">Mermaid Code</span>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleRetry} title="Re-render diagram">
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopyCode}>
                {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleDownload}>
                <Download className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <div className="flex-1 p-0">
            <textarea
              value={localCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              className="w-full h-full p-3 text-sm font-mono bg-transparent border-none resize-none focus:outline-none focus:ring-0"
              placeholder="Enter Mermaid diagram code..."
              spellCheck={false}
            />
          </div>
        </div>
      </div>
    )
  }

  // If this is a simple renderer (no tabs, just the diagram)
  if (className) {
    return (
      <div className={className}>
        <Mermaid key={`simple-${renderAttempt}`} chart={diagram?.diagramData || ""} />
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <Tabs defaultValue="preview">
        <div className="flex items-center justify-between border-b px-4">
          <TabsList className="h-12">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="code">Code</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleRetry} title="Retry rendering">
              <RefreshCw className="h-4 w-4" />
              <span className="sr-only">Retry</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCopyCode}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy code</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={handleDownload}>
              <Download className="h-4 w-4" />
              <span className="sr-only">Download</span>
            </Button>
          </div>
        </div>
        <TabsContent value="preview" className="m-0 p-4">
          <Mermaid key={`preview-${renderAttempt}`} chart={diagram?.diagramData || ""} />
        </TabsContent>
        <TabsContent value="code" className="m-0">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
            <code>{diagram?.diagramData || "No diagram data available"}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
