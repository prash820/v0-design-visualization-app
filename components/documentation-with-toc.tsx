import React, { useEffect, useRef, useState } from "react"
import DocumentationRenderer from "./documentation-renderer"
import html2pdf from "html2pdf.js"

interface DocumentationWithTOCProps {
  content: string
  diagrams?: any[]
}

interface TOCItem {
  id: string
  text: string
  level: number
}

function extractHeadings(markdown: string): TOCItem[] {
  const lines = markdown.split("\n")
  const headings: TOCItem[] = []
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  for (const line of lines) {
    const match = /^(#{2,4})\s+(.*)/.exec(line)
    if (match) {
      const level = match[1].length
      const text = match[2].trim()
      const id = slugify(text)
      headings.push({ id, text, level })
    }
  }
  return headings
}

export default function DocumentationWithTOC({ content, diagrams = [] }: DocumentationWithTOCProps) {
  const [activeId, setActiveId] = useState<string>("")
  const [tocCollapsed, setTocCollapsed] = useState<boolean>(false)
  const toc = extractHeadings(content)
  const containerRef = useRef<HTMLDivElement>(null)

  // Scroll spy: highlight current section
  useEffect(() => {
    const handleScroll = () => {
      const headings = toc.map((item) => document.getElementById(item.id)).filter(Boolean) as HTMLElement[]
      const scrollY = window.scrollY + 100 // offset for sticky header
      let currentId = ""
      for (const heading of headings) {
        if (heading.offsetTop <= scrollY) {
          currentId = heading.id
        }
      }
      setActiveId(currentId)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [toc])

  // Smooth scroll to section
  const handleTOCClick = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      window.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" })
    }
  }

  // Inject IDs into headings in the rendered HTML
  const contentWithAnchors = content.replace(/^(#{2,4})\s+(.*)$/gm, (match, hashes, title) => {
    const id = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
    return `${hashes} <span id="${id}"></span>${title}`
  })

  // PDF Export function
  const exportPDF = () => {
    const element = document.getElementById('fullDocument');
    if (element) {
      html2pdf()
        .set({
          margin: 10,
          filename: 'MyDocumentation.pdf',
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(element)
        .save();
    }
  };

  return (
    <div className="flex w-full">
      {/* TOC Sidebar (only when not collapsed) */}
      {!tocCollapsed && (
        <nav className="hidden md:block w-64 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] overflow-y-auto pr-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">On this page</div>
            <button
              className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600"
              onClick={() => setTocCollapsed(true)}
              aria-label="Collapse TOC"
              title="Collapse TOC"
            >
              {'<'}
            </button>
          </div>
          <ul className="space-y-1">
            {toc.map((item) => (
              <li key={item.id} className={item.level === 2 ? "ml-0" : item.level === 3 ? "ml-4" : "ml-8"}>
                <button
                  className={`text-left w-full px-2 py-1 rounded transition-colors ${activeId === item.id ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold" : "hover:bg-gray-100 dark:hover:bg-zinc-800"}`}
                  onClick={() => handleTOCClick(item.id)}
                >
                  {item.text}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
      {/* Minimal Expand Button Column (when collapsed) */}
      {tocCollapsed && (
        <div className="hidden md:flex w-8 flex-shrink-0 sticky top-24 h-[calc(100vh-6rem)] pr-0 items-center justify-center">
          <button
            className="text-xs px-1 py-1 rounded bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600 shadow"
            onClick={() => setTocCollapsed(false)}
            aria-label="Expand TOC"
            title="Expand TOC"
          >
            {'>'}
          </button>
        </div>
      )}
      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-end mb-4">
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={exportPDF}
          >
            Export as PDF
          </button>
        </div>
        <div id="fullDocument">
          <DocumentationRenderer content={contentWithAnchors} diagrams={diagrams} />
        </div>
      </div>
    </div>
  )
}
