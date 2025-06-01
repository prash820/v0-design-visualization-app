"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

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
            primaryColor: "#FFD6A5", // Pastel orange
            primaryTextColor: "#22223B",
            primaryBorderColor: "#FFB86B", // Soft orange border
            lineColor: "#FFB86B",
            fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
            fontSize: className?.includes("scale-75") ? "12px" : "14px", // Smaller for playground
            edgeLabelBackground: "#fff",
            clusterBkg: "#FFF5E1", // Lighter orange background
            clusterBorder: "#FFB86B",
            nodeBorder: "#FFB86B",
            nodeTextColor: "#FF7F50", // Coral for node text
            background: "#FFF8F1",
            actorBorder: "#FFB86B",
            actorBkg: "#FFF5E1",
            signalColor: "#FFB86B",
            classText: "#FF7F50",
            labelBoxBkgColor: "#fff",
            labelBoxBorderColor: "#FFD6A5",
            noteBkgColor: "#FFF5E1",
            noteBorderColor: "#FFB86B",
            // Make nodes rounded
            nodeRadius: "8",
          },
          // Add specific config for better rendering in constrained spaces
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
            diagramPadding: className?.includes("scale-75") ? 4 : 8,
          },
          sequence: {
            useMaxWidth: true,
            wrap: true,
            width: className?.includes("scale-75") ? 120 : 150,
          },
          class: {
            useMaxWidth: true,
          },
          // Add this to make diagrams more compact
          htmlLabels: true,
          gantt: {
            useMaxWidth: true,
          },
        })

        // Generate a unique ID for this render
        const diagramId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        // Render the diagram
        const { svg } = await mermaidAPI.render(diagramId, processedChart)

        if (isMounted) {
          setSvg(svg)
          setLoading(false)
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to render diagram")
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
        // Add responsive attributes
        svgElement.setAttribute("width", "100%")
        svgElement.setAttribute("height", "100%")
        svgElement.style.maxWidth = "100%"
        svgElement.style.minHeight = "100%"

        // Ensure the viewBox is set for proper scaling
        if (
          !svgElement.getAttribute("viewBox") &&
          svgElement.getAttribute("width") &&
          svgElement.getAttribute("height")
        ) {
          const width = Number.parseFloat(svgElement.getAttribute("width") || "800")
          const height = Number.parseFloat(svgElement.getAttribute("height") || "600")
          svgElement.setAttribute("viewBox", `0 0 ${width} ${height}`)
        }

        // Add a subtle drop shadow for hero animations
        if (className?.includes("hero")) {
          svgElement.style.filter = "drop-shadow(0 4px 12px rgba(0,0,0,0.1))"
        }

        // Add custom class for further CSS if needed
        svgElement.classList.add("custom-mermaid-svg")
      }
    }
  }, [svg, className])

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
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">Diagram preview unavailable. Showing code instead.</p>
          </div>
        </div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
          <code>{chart}</code>
        </pre>
      </div>
    )
  }

  return (
    <div
      className={`mermaid-diagram w-full overflow-auto ${className || ""}`}
      dangerouslySetInnerHTML={{ __html: svg || "" }}
      ref={mermaidRef}
    />
  )
}
