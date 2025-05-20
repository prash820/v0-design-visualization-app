"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"
import DiagramRenderer from "@/components/diagram-renderer"
import { useToast } from "@/hooks/use-toast"

interface DiagramTabsProps {
  diagrams: any[]
  isGenerating: boolean
  onRegenerateAll: () => void
}

export default function DiagramTabs({ diagrams, isGenerating, onRegenerateAll }: DiagramTabsProps) {
  // Map diagram types to tab IDs
  const getDiagramTabId = (diagramType: string) => {
    return diagramType?.toLowerCase().replace(/\s+/g, "-") || ""
  }

  // Ensure diagrams is always an array
  const safeDiagrams = Array.isArray(diagrams) ? diagrams : []

  // Filter out diagrams with no data
  const validDiagrams = safeDiagrams.filter((d) => d.diagramData && d.diagramData.trim() !== "")

  const [activeTab, setActiveTab] = useState<string>(
    validDiagrams.length > 0 ? getDiagramTabId(validDiagrams[0].diagramType) : "class-diagram",
  )
  const { toast } = useToast()

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value)
  }

  // If no valid diagrams, show a message
  if (validDiagrams.length === 0) {
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

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-0 pt-4 px-4 flex flex-row items-center justify-between">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              {validDiagrams.map((diagram) => (
                <TabsTrigger key={getDiagramTabId(diagram.diagramType)} value={getDiagramTabId(diagram.diagramType)}>
                  {diagram.diagramType.replace(" Diagram", "")}
                </TabsTrigger>
              ))}
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

          {validDiagrams.map((diagram) => (
            <TabsContent
              key={getDiagramTabId(diagram.diagramType)}
              value={getDiagramTabId(diagram.diagramType)}
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
                  <DiagramRenderer diagram={diagram} />
                </CardContent>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>
    </Card>
  )
}
