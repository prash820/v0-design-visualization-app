"use client"

import { useEffect, useRef, useState } from "react"
import { AlertCircle } from "lucide-react"

interface MermaidProps {
  chart: string
}

export default function Mermaid({ chart }: MermaidProps) {
  const [svg, setSvg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mermaidRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chart) {
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

        // Configure mermaid
        mermaidAPI.initialize({
          startOnLoad: false,
          theme: "default",
          securityLevel: "loose",
          fontFamily: "sans-serif",
        })

        // Render the diagram
        const { svg } = await mermaidAPI.render(`mermaid-${Date.now()}`, chart)

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
  }, [chart])

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
