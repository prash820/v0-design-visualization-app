"use client"

import { useEffect, useState } from "react"

interface MermaidFallbackProps {
  diagramData: string
}

export default function MermaidFallback({ diagramData }: MermaidFallbackProps) {
  const [svgContent, setSvgContent] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const renderMermaidFallback = async () => {
      try {
        // Create a simple SVG representation of the diagram
        // This is a very basic fallback that just shows boxes with text
        const lines = diagramData.split("\n").filter((line) => line.trim() !== "")

        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="500" height="${lines.length * 30 + 20}" viewBox="0 0 500 ${lines.length * 30 + 20}">
          <rect width="100%" height="100%" fill="#f8f9fa" />
          <text x="10" y="20" fontFamily="monospace" fontSize="14" fill="#333">Diagram Preview (Fallback):</text>`

        lines.forEach((line, index) => {
          svg += `<text x="10" y="${(index + 2) * 20}" fontFamily="monospace" fontSize="12" fill="#555">${line.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`
        })

        svg += `</svg>`

        setSvgContent(svg)
      } catch (err) {
        console.error("Error creating fallback SVG:", err)
        setError("Failed to create fallback diagram visualization")
      }
    }

    renderMermaidFallback()
  }, [diagramData])

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md">
        <p>{error}</p>
        <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">{diagramData}</pre>
      </div>
    )
  }

  if (!svgContent) {
    return (
      <div className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-800 rounded-md min-h-[200px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="w-full overflow-auto">
      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 mb-4 rounded-md">
        <p className="text-yellow-700 dark:text-yellow-400">
          Using simplified diagram view. Mermaid rendering is not available.
        </p>
      </div>
      <div dangerouslySetInnerHTML={{ __html: svgContent }} />
      <pre className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
        <code>{diagramData}</code>
      </pre>
    </div>
  )
}
