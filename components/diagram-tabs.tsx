"use client"

import { useState, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw, Palette, Building, Workflow, Layers, Code, Server, Network, Cloud, Users } from "lucide-react"
import DiagramRenderer from "@/components/diagram-renderer"
import { useToast } from "@/hooks/use-toast"

interface DiagramTabsProps {
  diagrams: any[] | any // Support both array format and single UML object
  isGenerating: boolean
  onRegenerateAll: () => void
}

// Define diagram type metadata for enhanced UML diagrams
const DIAGRAM_TYPE_CONFIG = {
  // Overall Architecture
  architecture: {
    label: "Architecture",
    icon: Building,
    color: "text-orange-600",
    description: "Shows simple serverless infrastructure"
  },
  
  // System-level diagrams
  component: {
    label: "System Components",
    icon: Layers,
    color: "text-purple-600",
    description: "Shows system components"
  },
  sequence: {
    label: "System Sequence", 
    icon: Workflow,
    color: "text-green-600",
    description: "Shows system interactions"
  },
  class: {
    label: "System Classes",
    icon: Building,
    color: "text-blue-600",
    description: "Shows system classes and relationships"
  },
  entity: {
    label: "Database Entities",
    icon: Code,
    color: "text-indigo-600",
    description: "Shows database entities"
  },
  state: {
    label: "System States",
    icon: Workflow,
    color: "text-teal-600",
    description: "Shows system behavior and state transitions",
    isNew: true
  },
  c4: {
    label: "System Context",
    icon: Network,
    color: "text-cyan-600",
    description: "Shows system context and external dependencies",
    isNew: true
  },
  
  // Frontend-specific diagrams
  frontendComponent: {
    label: "Frontend Components",
    icon: Palette,
    color: "text-pink-600",
    description: "Shows frontend component hierarchy",
    isNew: true
  },
  frontendClass: {
    label: "Frontend Classes",
    icon: Code,
    color: "text-pink-500",
    description: "Shows frontend classes and relationships",
    isNew: true
  },
  frontendSequence: {
    label: "Frontend Sequence",
    icon: Workflow,
    color: "text-pink-400",
    description: "Shows frontend user interactions",
    isNew: true
  },
  uiComponent: {
    label: "UI Components",
    icon: Palette,
    color: "text-pink-600",
    description: "Shows UI component hierarchy",
    isNew: true
  },
  
  // Backend-specific diagrams
  backendComponent: {
    label: "Backend Components",
    icon: Server,
    color: "text-blue-600",
    description: "Shows backend services and controllers",
    isNew: true
  },
  backendClass: {
    label: "Backend Classes",
    icon: Code,
    color: "text-blue-500",
    description: "Shows backend classes and models",
    isNew: true
  },
  backendSequence: {
    label: "Backend Sequence",
    icon: Workflow,
    color: "text-blue-400",
    description: "Shows backend service interactions",
    isNew: true
  },
  apiSequence: {
    label: "API Sequence",
    icon: Network,
    color: "text-blue-300",
    description: "Shows API endpoint interactions",
    isNew: true
  },
  
  // Integration and deployment
  integration: {
    label: "Integration",
    icon: Network,
    color: "text-green-500",
    description: "Shows integration points",
    isNew: true
  },
  deployment: {
    label: "Deployment",
    icon: Cloud,
    color: "text-gray-600",
    description: "Shows deployment architecture",
    isNew: true
  },
  useCase: {
    label: "Use Cases",
    icon: Users,
    color: "text-purple-500",
    description: "Shows actors and use cases",
    isNew: true
  }
} as const

// Define the order and keys for all diagrams to show as tabs
const DIAGRAM_TAB_ORDER = [
  'class',
  'sequence',
  'entity',
  'state',
  'c4',
  'frontendComponent',
  'backendComponent',
  'architecture',
  'component',
  'uiComponent',
  'frontendClass',
  'frontendSequence',
  'backendClass',
  'backendSequence',
  'apiSequence',
  'integration',
  'deployment',
  'useCase',
];

export default function DiagramTabs({ diagrams, isGenerating, onRegenerateAll }: DiagramTabsProps) {
  const { toast } = useToast()
  const [diagramCodes, setDiagramCodes] = useState<Record<string, string>>({})
  const updateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  // Detect if this is enhanced UML format (single object with multiple diagram types)
  const isEnhancedUMLFormat = diagrams && 
    !Array.isArray(diagrams) && 
    typeof diagrams === 'object' &&
    Object.keys(diagrams).some(key => DIAGRAM_TAB_ORDER.includes(key))

  // Convert diagrams to normalized format in the desired order
  const normalizedDiagrams = (() => {
    if (isEnhancedUMLFormat) {
      return DIAGRAM_TAB_ORDER
        .filter(key => diagrams[key])
        .map(key => ({
          id: key,
          diagramType: DIAGRAM_TYPE_CONFIG[key as keyof typeof DIAGRAM_TYPE_CONFIG]?.label || key,
          diagramData: diagrams[key],
          rawType: key,
          isEnhanced: true
        }))
    } else {
      // Handle legacy array format
      const safeDiagrams = Array.isArray(diagrams) ? diagrams : []
      return safeDiagrams.filter((d) => d.diagramData && d.diagramData.trim() !== "")
    }
  })()

  // Map diagram types to tab IDs
  const getDiagramTabId = (diagram: any) => {
    if (diagram.isEnhanced) {
      return diagram.rawType
    }
    return diagram.diagramType?.toLowerCase().replace(/\s+/g, "-") || ""
  }

  const [activeTab, setActiveTab] = useState<string>(() => {
    if (normalizedDiagrams.length > 0) {
      // Prioritize state diagram if available (shows system behavior)
      const stateDiagram = normalizedDiagrams.find(d => d.rawType === 'state')
      if (stateDiagram) {
        return getDiagramTabId(stateDiagram)
      }
      
      // Then prioritize C4 context diagram (shows system context)
      const c4Diagram = normalizedDiagrams.find(d => d.rawType === 'c4')
      if (c4Diagram) {
        return getDiagramTabId(c4Diagram)
      }
      
      // Then prioritize frontend and backend component diagrams if available
      const frontendComponentDiagram = normalizedDiagrams.find(d => d.rawType === 'frontendComponent')
      if (frontendComponentDiagram) {
        return getDiagramTabId(frontendComponentDiagram)
      }
      
      const backendComponentDiagram = normalizedDiagrams.find(d => d.rawType === 'backendComponent')
      if (backendComponentDiagram) {
        return getDiagramTabId(backendComponentDiagram)
      }
      
      // Then prioritize architecture diagram
      const architectureDiagram = normalizedDiagrams.find(d => d.rawType === 'architecture')
      if (architectureDiagram) {
        return getDiagramTabId(architectureDiagram)
      }
      
      // Then UI Component diagram
      const uiComponentDiagram = normalizedDiagrams.find(d => d.rawType === 'uiComponent')
      if (uiComponentDiagram) {
        return getDiagramTabId(uiComponentDiagram)
      }
      
      // Otherwise use first available
      return getDiagramTabId(normalizedDiagrams[0])
    }
    return "class"
  })

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  const handleCodeChange = (diagramId: string, newCode: string) => {
    setDiagramCodes((prev) => ({
      ...prev,
      [diagramId]: newCode,
    }))

    // Debounced update to avoid too many re-renders
    clearTimeout(updateTimeoutRef.current)
    updateTimeoutRef.current = setTimeout(() => {
      console.log("Code updated for diagram:", diagramId, newCode)
    }, 1000)
  }

  // If no valid diagrams, show a message
  if (normalizedDiagrams.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {isGenerating ? "Generating diagrams..." : "No valid diagrams available."}
            </p>
            {!isGenerating && (
              <Button variant="outline" size="sm" onClick={onRegenerateAll} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Diagrams
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // If this is enhanced UML format, render individual tabs for each diagram
  if (isEnhancedUMLFormat) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">UML Diagrams</h3>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
              Enhanced
            </span>
            {normalizedDiagrams.some(d => d.rawType === 'frontendComponent' || d.rawType === 'backendComponent') && (
              <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                Frontend & Backend
              </span>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onRegenerateAll} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Regenerate All
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {isGenerating ? (
            <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[400px]">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 animate-spin mb-4" />
                <p className="text-sm text-gray-500">Generating comprehensive UML diagrams...</p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <div className="flex items-center justify-between mb-4">
                <TabsList className="flex-wrap">
                  {normalizedDiagrams.map((diagram) => {
                    const config = diagram.rawType ? DIAGRAM_TYPE_CONFIG[diagram.rawType as keyof typeof DIAGRAM_TYPE_CONFIG] : null
                    const Icon = config?.icon || Code
                    
                    return (
                      <TabsTrigger 
                        key={getDiagramTabId(diagram)} 
                        value={getDiagramTabId(diagram)}
                        className="flex items-center gap-2"
                      >
                        <Icon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                        {diagram.diagramType.replace(" Diagram", "")}
                        {(config as any)?.isNew && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full">
                            NEW
                          </span>
                        )}
                      </TabsTrigger>
                    )
                  })}
                </TabsList>
              </div>

              {normalizedDiagrams.map((diagram) => (
                <TabsContent
                  key={getDiagramTabId(diagram)}
                  value={getDiagramTabId(diagram)}
                  className="mt-0"
                >
                  <CardContent className="p-4">
                    <DiagramRenderer
                      diagram={{
                        ...diagram,
                        diagramData: diagramCodes[diagram.id] || diagram.diagramData,
                      }}
                      splitScreen={true}
                      onCodeChange={(newCode) => handleCodeChange(diagram.id, newCode)}
                    />
                  </CardContent>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </CardContent>
      </Card>
    )
  }

  // Legacy format - render individual diagram tabs
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {normalizedDiagrams.map((diagram) => {
                const config = diagram.rawType ? DIAGRAM_TYPE_CONFIG[diagram.rawType as keyof typeof DIAGRAM_TYPE_CONFIG] : null
                const Icon = config?.icon || Code
                
                return (
                  <TabsTrigger 
                    key={getDiagramTabId(diagram)} 
                    value={getDiagramTabId(diagram)}
                    className="flex items-center gap-2"
                  >
                    <Icon className={`h-4 w-4 ${config?.color || 'text-gray-600'}`} />
                    {diagram.diagramType.replace(" Diagram", "")}
                    {(config as any)?.isNew && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-pink-100 text-pink-800 rounded-full">
                        NEW
                      </span>
                    )}
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <Button variant="outline" size="sm" onClick={onRegenerateAll} disabled={isGenerating} className="ml-2">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate All
                </>
              )}
            </Button>
          </div>

          {normalizedDiagrams.map((diagram) => (
            <TabsContent
              key={getDiagramTabId(diagram)}
              value={getDiagramTabId(diagram)}
              className="mt-0"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[400px]">
                  <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-sm text-gray-500">Generating {diagram.diagramType}...</p>
                  </div>
                </div>
              ) : (
                <CardContent className="p-4">
                  <DiagramRenderer
                    diagram={{
                      ...diagram,
                      diagramData: diagramCodes[diagram.id] || diagram.diagramData,
                    }}
                    splitScreen={true}
                    onCodeChange={(newCode) => handleCodeChange(diagram.id, newCode)}
                  />
                </CardContent>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
    </Card>
  )
}
