"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { AlertCircle, Code } from "lucide-react"

interface MermaidProps {
  chart: string
  className?: string
  fallback?: React.ReactNode
}

// Utility: auto-assign colors to nodes/services in component diagrams
const pastelPalette = [
  "#FFD6A5", // pastel orange
  "#A7C7E7", // pastel blue
  "#B5EAD7", // pastel green
  "#FFB7B2", // pastel pink
  "#FFFACD", // pastel yellow
  "#C7CEEA", // pastel purple
  "#FFDAC1", // pastel peach
  "#E2F0CB", // pastel mint
]

function colorizeComponentDiagram(mermaidCode: string): string {
  // Only apply to flowchart/component diagrams
  if (!/^\s*(flowchart|graph)\s/i.test(mermaidCode)) return mermaidCode

  // Find all node IDs (e.g., A[Service A], B, etc.)
  const nodeRegex = /([A-Za-z0-9_]+)\s*(\[|\(|\{)/g
  const nodes = new Set<string>()
  let match
  while ((match = nodeRegex.exec(mermaidCode))) {
    nodes.add(match[1])
  }
  const nodeList = Array.from(nodes)
  // Assign a color class to each node
  let classDefs = ""
  let classAssigns = ""
  nodeList.forEach((node, idx) => {
    const color = pastelPalette[idx % pastelPalette.length]
    const border = "#FFB86B"
    const text = "#22223B"
    const className = `autoColor${idx}`
    classDefs += `classDef ${className} fill:${color},stroke:${border},color:${text},stroke-width:2px;\n`
    classAssigns += `class ${node} ${className};\n`
  })
  // Append classDefs and classAssigns to the end
  return `${mermaidCode}\n${classDefs}${classAssigns}`
}

function preprocessMermaidChart(chart: string): string {
  return colorizeComponentDiagram(chart)
}

function isValidMermaidSyntax(chart: string): boolean {
  // Basic validation to catch common syntax errors
  const trimmed = chart.trim()
  if (!trimmed) return false

  // Check for basic diagram types
  const validStarters = [
    "graph",
    "flowchart",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "journey",
    "gantt",
    "pie",
    "gitgraph",
    "mindmap",
    "timeline",
    "quadrantChart",
    "architecture-beta", // Allow architecture diagrams
  ]

  const hasValidStarter = validStarters.some((starter) => trimmed.toLowerCase().startsWith(starter.toLowerCase()))

  return hasValidStarter
}

function isArchitectureBeta(chart: string): boolean {
  return chart.trim().toLowerCase().startsWith("architecture-beta")
}

export default function Mermaid({ chart, className, fallback }: MermaidProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mermaidRef = useRef<HTMLDivElement>(null)
  const [renderKey, setRenderKey] = useState(0)

  // Preprocess chart for component and sequence diagrams
  const processedChart = preprocessMermaidChart(chart)

  useEffect(() => {
    if (!processedChart || processedChart.trim() === "") {
      setLoading(false)
      setError("No diagram data provided")
      return
    }

    // Basic syntax validation before attempting to render
    if (!isValidMermaidSyntax(processedChart)) {
      setLoading(false)
      setError("Invalid diagram syntax")
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    const renderMermaid = async () => {
      try {
        // Import mermaid dynamically
        const mermaidAPI = (await import("mermaid")).default

        // Configure mermaid with a custom theme optimized for hero animations
        mermaidAPI.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            // Force all text to be dark
            primaryTextColor: "#000000",
            textColor: "#000000",
            nodeTextColor: "#000000",
            classText: "#000000",
            noteTextColor: "#000000",
            actorTextColor: "#000000",
            labelTextColor: "#000000",
            loopTextColor: "#000000",
            activationTextColor: "#000000",
            sequenceNumberColor: "#000000",
            sectionTextColor: "#000000",
            altTextColor: "#000000",
            optTextColor: "#000000",

            // Background colors
            primaryColor: "#FFD6A5",
            primaryBorderColor: "#FFB86B",
            lineColor: "#FFB86B",
            fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
            fontSize: className?.includes("scale-75") ? "12px" : "14px",

            // Node and shape colors
            mainBkg: "#ffffff",
            secondaryColor: "#f8f9fa",
            tertiaryColor: "#e9ecef",
            background: "#ffffff",

            // Class diagram specific
            classText: "#000000",

            // Sequence diagram specific
            actorBkg: "#FFF5E1",
            actorBorder: "#FFB86B",
            actorTextColor: "#000000",
            signalColor: "#FFB86B",
            signalTextColor: "#000000",

            // Flowchart specific
            clusterBkg: "#FFF5E1",
            clusterBorder: "#FFB86B",
            edgeLabelBackground: "#fff",

            // Notes and labels
            labelBoxBkgColor: "#fff",
            labelBoxBorderColor: "#FFD6A5",
            noteBkgColor: "#FFF5E1",
            noteBorderColor: "#FFB86B",
            noteTextColor: "#000000",
          },
        })

        // Force dark text with CSS overrides
        const style = document.createElement("style")
        style.textContent = `
  .mermaid-diagram text,
  .mermaid-diagram .node text,
  .mermaid-diagram .label text,
  .mermaid-diagram .edgeLabel text,
  .mermaid-diagram .actor text,
  .mermaid-diagram .messageText,
  .mermaid-diagram .noteText,
  .mermaid-diagram .loopText,
  .mermaid-diagram .labelText {
    fill: #000000 !important;
    color: #000000 !important;
  }
  
  .mermaid-diagram .cluster text {
    fill: #000000 !important;
  }
  
  .mermaid-diagram .titleText {
    fill: #000000 !important;
  }
`
        document.head.appendChild(style)

        // Generate a unique ID for this render
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram with error handling
        const { svg } = await mermaidAPI.render(diagramId, processedChart)

        if (isMounted) {
          setSvg(svg)
          setLoading(false)
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err)
        if (isMounted) {
          // Don't show the raw mermaid error to users
          setError("Unable to render diagram")
          setLoading(false)
        }
      }
    }

    // Add a small delay to ensure the component is mounted and ready
    const timer = setTimeout(() => {
      renderMermaid()
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [processedChart, renderKey])

  // Force re-render when chart changes significantly
  useEffect(() => {
    setRenderKey((prev) => prev + 1)
  }, [chart])

  // Post-process SVG for extra styling
  useEffect(() => {
    if (mermaidRef.current && svg) {
      const svgElement = mermaidRef.current.querySelector("svg")
      if (svgElement) {
        if (isArchitectureBeta(chart)) {
          // Only for architecture-beta diagrams:
          svgElement.setAttribute("width", "100%")
          svgElement.style.height = "auto"
          svgElement.style.maxWidth = "100%"
          svgElement.style.display = "block"
          svgElement.style.minHeight = "0"
          // Ensure viewBox is set
          if (
            !svgElement.getAttribute("viewBox") &&
            svgElement.getAttribute("width") &&
            svgElement.getAttribute("height")
          ) {
            const width = Number.parseFloat(svgElement.getAttribute("width") || "800")
            const height = Number.parseFloat(svgElement.getAttribute("height") || "600")
            svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`)
          }
        }
        // Add a subtle drop shadow for hero animations
        if (className?.includes("hero")) {
          svgElement.style.filter = "drop-shadow(0 4px 12px rgba(0,0,0,0.1))"
        }
        // Add custom class for further CSS if needed
        svgElement.classList.add("custom-mermaid-svg")
      }
    }
  }, [svg, className, chart])

  if (loading) {
    return (
      <div
        className={`flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[200px] ${className || ""}`}
      >
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    if (fallback) {
      return <>{fallback}</>
    }
    return (
      <div className={`w-full ${className || ""}`}>
        <div className="flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[200px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Diagram Preview Unavailable</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              There's an issue with the diagram syntax. Please check your code and try again.
            </p>
            <div className="flex items-center justify-center text-xs text-gray-400">
              <Code className="h-4 w-4 mr-1" />
              Check the code panel for syntax errors
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`mermaid-diagram w-full overflow-auto ${isArchitectureBeta(chart) ? "architecture-diagram" : ""} ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: svg || "" }}
      ref={mermaidRef}
    />
  )
}
