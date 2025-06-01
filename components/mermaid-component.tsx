"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

interface MermaidProps {
  chart: string
}

// Utility: auto-assign colors to nodes/services in component diagrams
const pastelPalette = [
  '#FFD6A5', // pastel orange
  '#A7C7E7', // pastel blue
  '#B5EAD7', // pastel green
  '#FFB7B2', // pastel pink
  '#FFFACD', // pastel yellow
  '#C7CEEA', // pastel purple
  '#FFDAC1', // pastel peach
  '#E2F0CB', // pastel mint
]

function colorizeComponentDiagram(mermaidCode: string): string {
  // Only apply to flowchart/component diagrams
  if (!/^\s*(flowchart|graph)\s/i.test(mermaidCode)) return mermaidCode;

  // Find all node IDs (e.g., A[Service A], B, etc.)
  const nodeRegex = /([A-Za-z0-9_]+)\s*(\[|\(|\{)/g;
  const nodes = new Set<string>();
  let match;
  while ((match = nodeRegex.exec(mermaidCode))) {
    nodes.add(match[1]);
  }
  const nodeList = Array.from(nodes);
  // Assign a color class to each node
  let classDefs = '';
  let classAssigns = '';
  nodeList.forEach((node, idx) => {
    const color = pastelPalette[idx % pastelPalette.length];
    const border = '#FFB86B';
    const text = '#22223B';
    const className = `autoColor${idx}`;
    classDefs += `classDef ${className} fill:${color},stroke:${border},color:${text},stroke-width:2px;\n`;
    classAssigns += `class ${node} ${className};\n`;
  });
  // Append classDefs and classAssigns to the end
  return `${mermaidCode}\n${classDefs}${classAssigns}`;
}

function preprocessMermaidChart(chart: string): string {
  return colorizeComponentDiagram(chart);
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mermaidRef = useRef<HTMLDivElement>(null)

  // Preprocess chart for component and sequence diagrams
  const processedChart = preprocessMermaidChart(chart);

  useEffect(() => {
    if (!processedChart) {
      setLoading(false)
      setError("No diagram data provided")
      return
    }

    let isMounted = true
    setLoading(true)
    setError(null)

    const renderMermaid = async () => {
      try {
        // Import mermaid
        const mermaidAPI = (await import("mermaid")).default

        // Configure mermaid with a custom, non-default theme
        mermaidAPI.initialize({
          startOnLoad: false,
          theme: "base",
          themeVariables: {
            primaryColor: "#FFD6A5", // Pastel orange
            primaryTextColor: "#22223B",
            primaryBorderColor: "#FFB86B", // Soft orange border
            lineColor: "#FFB86B",
            fontFamily: "'Inter', 'Segoe UI', 'Arial', sans-serif",
            fontSize: "18px",
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
            nodeRadius: "12",
          },
        })

        // Render the diagram
        const { svg } = await mermaidAPI.render(`mermaid-${Date.now()}`, processedChart)

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

    // Add a small delay to ensure the component is mounted
    const timer = setTimeout(() => {
      renderMermaid()
    }, 100)

    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [processedChart])

  // Post-process SVG for extra uniqueness
  useEffect(() => {
    if (mermaidRef.current) {
      const svg = mermaidRef.current.querySelector('svg')
      if (svg) {
        // Add a drop shadow filter
        svg.style.filter = 'drop-shadow(0 6px 24px #A084E880)'
        // Add a custom class for further CSS if needed
        svg.classList.add('custom-mermaid-svg')
        // Optionally, tweak more SVG styles here
      }
    }
  }, [svg])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full">
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-md mb-4">
          <div className="flex items-center mb-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p>Mermaid rendering failed. Showing diagram code instead.</p>
          </div>
          {error && <p className="text-sm mt-1">{error}</p>}
        </div>
        <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto">
          <code>{chart}</code>
        </pre>
      </div>
    )
  }

  return (
    <div
      className="mermaid-diagram w-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: svg || "" }}
      ref={mermaidRef}
    />
  )
}
