"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Copy, Check, RefreshCw, Code, Eye, Layers, Workflow, Building, Palette } from "lucide-react"
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

// Define diagram types with their metadata
const DIAGRAM_TYPES = {
  class: {
    label: "Class Diagram",
    icon: Building,
    description: "Shows classes, attributes, methods, and relationships",
    color: "text-blue-600"
  },
  sequence: {
    label: "Sequence Diagram", 
    icon: Workflow,
    description: "Shows interactions between objects over time",
    color: "text-green-600"
  },
  component: {
    label: "System Components",
    icon: Layers,
    description: "Shows system architecture and service dependencies",
    color: "text-purple-600"
  },
  uiComponent: {
    label: "UI Components",
    icon: Palette,
    description: "Shows frontend UI component hierarchy and relationships",
    color: "text-pink-600"
  },
  architecture: {
    label: "Architecture Diagram",
    icon: Building,
    description: "Shows AWS infrastructure and deployment architecture",
    color: "text-orange-600"
  },
  entity: {
    label: "Entity Diagram",
    icon: Code,
    description: "Shows database entities and relationships",
    color: "text-indigo-600"
  }
}

export default function DiagramRenderer({
  diagram,
  className = "",
  splitScreen = false,
  onCodeChange,
}: DiagramRendererProps) {
  const [copied, setCopied] = useState(false)
  const [renderAttempt, setRenderAttempt] = useState(0)
  const [activeTab, setActiveTab] = useState("preview")
  const [activeDiagramType, setActiveDiagramType] = useState("")
  const { toast } = useToast()

  // Check if diagram contains multiple UML diagrams (enhanced format)
  // Enhanced format has direct properties like 'class', 'sequence', 'uiComponent' etc.
  // Legacy format has 'diagramData', 'diagramType', 'id', 'projectId' etc.
  const isMultiDiagram = diagram && typeof diagram === 'object' && 
    Object.keys(diagram).some(key => ['class', 'sequence', 'component', 'uiComponent', 'architecture', 'entity'].includes(key)) &&
    !diagram.hasOwnProperty('diagramData') // If it has diagramData, it's legacy format

  // Get available diagram types (only for enhanced format)
  const availableDiagrams = isMultiDiagram ? 
    Object.keys(diagram).filter(key => ['class', 'sequence', 'component', 'uiComponent', 'architecture', 'entity'].includes(key) && diagram[key]) :
    []

  // Set initial active diagram type
  useEffect(() => {
    if (availableDiagrams.length > 0 && !activeDiagramType) {
      // Prioritize UI Component diagram if available
      if (availableDiagrams.includes('uiComponent')) {
        setActiveDiagramType('uiComponent')
      } else if (availableDiagrams.includes('component')) {
        setActiveDiagramType('component')
      } else {
        setActiveDiagramType(availableDiagrams[0])
      }
    }
  }, [availableDiagrams, activeDiagramType])

  // Get current diagram data
  const getCurrentDiagramData = () => {
    if (isMultiDiagram && activeDiagramType) {
      return diagram[activeDiagramType]
    }
    return diagram?.diagramData || ""
  }

  const handleCopyCode = () => {
    const currentData = getCurrentDiagramData()
    if (!currentData) return

    navigator.clipboard.writeText(currentData)
    setCopied(true)

    toast({
      title: "Copied to clipboard",
      description: `${DIAGRAM_TYPES[activeDiagramType as keyof typeof DIAGRAM_TYPES]?.label || 'Diagram'} code has been copied to your clipboard.`,
    })

    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const currentData = getCurrentDiagramData()
    if (!currentData) return

    const diagramLabel = DIAGRAM_TYPES[activeDiagramType as keyof typeof DIAGRAM_TYPES]?.label || 'diagram'
    const file = new Blob([currentData], { type: "text/plain" })
    const element = document.createElement("a")
    element.href = URL.createObjectURL(file)
    element.download = `${diagramLabel.toLowerCase().replace(/\s+/g, "-")}-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Download started",
      description: `Your ${diagramLabel.toLowerCase()} code is being downloaded.`,
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
            <Mermaid key={`split-${renderAttempt}`} chart={getCurrentDiagramData()} />
          </div>
        </div>

        {/* Code Editor - 1/3 width */}
        <div className="w-1/3 bg-black-50 dark:bg-black-800 flex flex-col">
          <div className="flex items-center justify-between p-3 border-b bg-black-100 dark:bg-black-700">
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
              value={getCurrentDiagramData()}
              onChange={(e) => onCodeChange?.(e.target.value)}
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
        <Mermaid key={`simple-${renderAttempt}`} chart={getCurrentDiagramData()} />
      </div>
    )
  }

  // Multi-diagram renderer with enhanced tabs
  if (isMultiDiagram && availableDiagrams.length > 0) {
    return (
      <Card className="overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between border-b px-4">
            <TabsList className="h-12">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code className="h-4 w-4" />
                Code
              </TabsTrigger>
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

          {/* Diagram Type Selection */}
          <div className="border-b bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center gap-2 p-3 overflow-x-auto">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 whitespace-nowrap">
                Diagram Type:
              </span>
              <div className="flex gap-2">
                {availableDiagrams.map((diagramType) => {
                  const config = DIAGRAM_TYPES[diagramType as keyof typeof DIAGRAM_TYPES]
                  if (!config) return null
                  
                  const Icon = config.icon
                  const isActive = activeDiagramType === diagramType
                  
                  return (
                    <Button
                      key={diagramType}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveDiagramType(diagramType)}
                      className={`flex items-center gap-2 whitespace-nowrap ${
                        isActive ? "" : "hover:border-gray-300"
                      }`}
                      title={config.description}
                    >
                      <Icon className={`h-4 w-4 ${isActive ? "text-white" : config.color}`} />
                      {config.label}
                      {diagramType === 'uiComponent' && (
                        <span className="ml-1 px-1.5 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full">
                          NEW
                        </span>
                      )}
                    </Button>
                  )
                })}
              </div>
            </div>
          </div>

          <TabsContent value="preview" className="m-0 p-4">
            <div className="space-y-4">
              {/* Current diagram info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                {(() => {
                  const config = DIAGRAM_TYPES[activeDiagramType as keyof typeof DIAGRAM_TYPES]
                  if (!config) return null
                  const Icon = config.icon
                  return (
                    <>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-medium">{config.label}</span>
                      <span>•</span>
                      <span>{config.description}</span>
                    </>
                  )
                })()}
              </div>
              
              {/* Diagram rendering */}
              <div className="min-h-[400px]">
                <Mermaid key={`multi-${activeDiagramType}-${renderAttempt}`} chart={getCurrentDiagramData()} />
              </div>
              
              {/* UI Component diagram special info */}
              {activeDiagramType === 'uiComponent' && (
                <div className="mt-4 p-3 bg-pink-50 dark:bg-pink-900/20 border border-pink-200 dark:border-pink-800 rounded-lg">
                  <div className="flex items-center gap-2 text-pink-800 dark:text-pink-200">
                    <Palette className="h-4 w-4" />
                    <span className="font-medium">UI Component Hierarchy</span>
                  </div>
                  <p className="text-sm text-pink-700 dark:text-pink-300 mt-1">
                    This diagram shows the complete frontend UI component structure that will be generated for your application, 
                    including pages, forms, modals, navigation, and reusable components.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="code" className="m-0">
            <div className="space-y-4">
              {/* Current diagram info */}
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 px-4 pt-4">
                {(() => {
                  const config = DIAGRAM_TYPES[activeDiagramType as keyof typeof DIAGRAM_TYPES]
                  if (!config) return null
                  const Icon = config.icon
                  return (
                    <>
                      <Icon className={`h-4 w-4 ${config.color}`} />
                      <span className="font-medium">{config.label}</span>
                      <span>•</span>
                      <span>Mermaid Syntax</span>
                    </>
                  )
                })()}
              </div>
              
              <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-sm">
                <code>{getCurrentDiagramData() || "No diagram data available"}</code>
              </pre>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    )
  }

  // Fallback to single diagram renderer
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
          <Mermaid key={`single-${renderAttempt}`} chart={getCurrentDiagramData()} />
        </TabsContent>
        <TabsContent value="code" className="m-0">
          <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
            <code>{getCurrentDiagramData() || "No diagram data available"}</code>
          </pre>
        </TabsContent>
      </Tabs>
    </Card>
  )
}
