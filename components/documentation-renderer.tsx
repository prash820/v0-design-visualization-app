"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import dynamic from "next/dynamic"
import { Loader2 } from "lucide-react"

// Dynamically import the Mermaid component with no SSR
const Mermaid = dynamic(() => import("./mermaid-component"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[200px]">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
    </div>
  ),
})

export default function DocumentationRenderer({ content, diagrams }: { content: string; diagrams: any[] }) {
  const [isProcessing, setIsProcessing] = useState(true)
  const [sections, setSections] = useState<Array<{ type: string; content: string; diagramData?: string }>>([])

  useEffect(() => {
    const processDocumentation = () => {
      if (!content) return

      setIsProcessing(true)

      try {
        // Ensure diagrams is always an array
        const safeDiagrams = Array.isArray(diagrams) ? diagrams : []

        // Define the section types and their corresponding diagram types
        const sectionTypes = [
          { title: "System Architecture", diagramType: "Architecture Diagram" },
          { title: "Data Models", diagramType: "ERD Diagram" },
          { title: "Class Diagram", diagramType: "Class Diagram" },
          { title: "Component Diagram", diagramType: "Component Diagram" },
          { title: "Sequence Diagram", diagramType: "Sequence Diagram" },
        ]

        // Split the content by section headers (## Title)
        const sectionRegex = /^## (.+)$/gm
        const parts = content.split(sectionRegex)

        // The first part is content before any section
        const processedSections: Array<{ type: string; content: string; diagramData?: string }> = []

        // Add the introduction section (content before any ## heading)
        if (parts[0].trim()) {
          processedSections.push({
            type: "introduction",
            content: parts[0].trim(),
          })
        }

        // Process each section (title and content pairs)
        for (let i = 1; i < parts.length; i += 2) {
          const sectionTitle = parts[i].trim()
          const sectionContent = parts[i + 1]?.trim() || ""

          // Find if this section should have a diagram
          const sectionType = sectionTypes.find((type) => sectionTitle.toLowerCase().includes(type.title.toLowerCase()))

          // Find matching diagram if any
          const matchingDiagram = sectionType
            ? safeDiagrams.find((d) => d.diagramType?.includes(sectionType.diagramType))
            : null

          processedSections.push({
            type: sectionTitle.toLowerCase().replace(/\s+/g, "-"),
            content: sectionContent,
            diagramData: matchingDiagram?.diagramData,
          })
        }

        setSections(processedSections)
      } catch (error) {
        console.error("Error processing documentation:", error)
      } finally {
        setIsProcessing(false)
      }
    }

    processDocumentation()
  }, [content, diagrams])

  if (isProcessing) {
    return (
      <Card className="overflow-hidden p-6">
        <div className="flex flex-col items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin mb-4" />
          <p className="text-sm text-gray-500">Processing documentation...</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden p-6">
      <div className="prose dark:prose-invert max-w-none">
        {sections.map((section, index) => (
          <div key={`section-${index}`} className="mb-8">
            {section.type !== "introduction" && (
              <h2 id={section.type} className="scroll-mt-16">
                {section.type
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </h2>
            )}

            {/* Render the section content */}
            <div className="mb-4">
              {section.content.split("\n").map((paragraph, pIndex) => {
                // Skip empty paragraphs
                if (!paragraph.trim()) return null

                // Check if it's a list item
                if (paragraph.trim().startsWith("- ")) {
                  return <li key={`p-${pIndex}`}>{paragraph.trim().substring(2)}</li>
                }

                // Check if it's a heading
                if (paragraph.trim().startsWith("### ")) {
                  return <h3 key={`p-${pIndex}`}>{paragraph.trim().substring(4)}</h3>
                }

                // Regular paragraph
                return <p key={`p-${pIndex}`}>{paragraph}</p>
              })}
            </div>

            {/* Render the diagram if available */}
            {section.diagramData && (
              <div className="my-6 border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                  {section.type
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}{" "}
                  Visualization
                </h4>
                <Mermaid chart={section.diagramData} />
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}
