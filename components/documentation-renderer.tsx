"use client"

import React, { useEffect, useRef } from "react"
import { marked } from "marked"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"
import mermaid from "mermaid"
import { Card } from "@/components/ui/card"

type DiagramType = 'component' | 'data-model' | 'integration' | 'class' | 'sequence' | 'architecture';

interface Diagram {
  type: DiagramType;
  mermaid?: string;
  svg?: string;
  url?: string;
  title?: string;
  description?: string;
}

interface DocumentationRendererProps {
  content: string
  diagrams?: Diagram[]
}

const renderer = new marked.Renderer()
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const id = `codeblock-${Math.random().toString(36).substr(2, 9)}`
  const highlighted = lang && hljs.getLanguage(lang)
    ? hljs.highlight(text, { language: lang }).value
    : hljs.highlightAuto(text).value
  return `<div class="relative group my-6"><button class="copy-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs text-white px-2 py-1 rounded" data-clipboard-target="#${id}">Copy</button><pre><code id="${id}" class="hljs language-${lang}">${highlighted}</code></pre></div>`
}

renderer.blockquote = function ({ text }: { text: string }) {
  if (text.startsWith("Note:")) return styledBlockquote(text, 'Note', 'blue', '💡')
  if (text.startsWith("Warning:")) return styledBlockquote(text, 'Warning', 'yellow', '⚠️')
  if (text.startsWith("Tip:")) return styledBlockquote(text, 'Tip', 'green', '💡')
  return `<blockquote class="prose-blockquote my-6">${text}</blockquote>`
}

const styledBlockquote = (text: string, label: string, color: string, icon: string) =>
  `<blockquote class="${label.toLowerCase()}block flex items-start gap-2 bg-${color}-50 dark:bg-${color}-900/30 border-l-4 border-${color}-400 p-4 rounded-md my-6"><span class='mt-1'>${icon}</span><div>${text.replace(`${label}:`, `<strong>${label}:</strong>`)}</div></blockquote>`

renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  const base = `mt-${depth === 2 || depth === 3 ? '10' : '8'} mb-${depth === 2 || depth === 3 ? '4' : '2'}`
  return `<h${depth} id="${id}" class="${base}">${text}</h${depth}>`
}

renderer.listitem = function (text: any) {
  const content = typeof text === 'string' ? text : text.text || text.raw || JSON.stringify(text)
  const html = marked.parseInline ? marked.parseInline(content) : content
  return `<li class="pl-2 relative before:content-['•'] before:absolute before:-left-4 before:text-blue-500 dark:before:text-blue-400">${html}</li>`
}

marked.setOptions({ renderer })

const sectionToDiagramType: Record<string, DiagramType> = {
  "Proposed Architecture": "component",
  "System Architecture": "component",
  "Component Architecture": "component",
  "Architecture Overview": "component",
  "API Contracts": "sequence",
  "Sequence Diagram": "sequence",
  "API Flow": "sequence",
  "System Flow": "sequence",
  "Integrations": "integration",
  "API Integration": "integration",
  "System Integration": "integration",
  "Class Diagram": "class",
  "Class Structure": "class",
  "Component Diagram": "component",
  "System Components": "component"
}

function insertDiagramPlaceholders(md: string, map: Record<string, DiagramType>, diagrams: Diagram[]) {
  return md.replace(/^(##+\s+([^\n]+))/gm, (match, _header, sectionTitle) => {
    const cleanTitle = sectionTitle.trim().replace(/^<span[^>]*>.*?<\/span>\s*/i, '')
    const type = map[cleanTitle]
    return type ? `${match}\n\n{{DIAGRAM:${type}}}` : match
  })
}

function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, tag => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] as string
  ))
}

function injectDiagrams(html: string, diagrams: Diagram[] = []) {
  return html.replace(/\{\{DIAGRAM:([a-zA-Z0-9_-]+)\}\}/g, (match, type) => {
    const items = type === 'ALL' ? diagrams : diagrams.filter(d => d.type === type)
    return items.map((diagram, idx) => {
      let content = diagram.svg
        || (diagram.url ? `<img src="${diagram.url}" alt="${diagram.title || diagram.type}" class="w-full h-auto mb-2" />`
        : diagram.mermaid ? `<pre><code class="language-mermaid">${escapeHtml(diagram.mermaid)}</code></pre>` : "")
      return `
        <div id="diagram-container-${type}-${idx}" class="my-4 p-4 border rounded bg-zinc-50 dark:bg-zinc-800">
          ${diagram.title ? `<div class="font-semibold mb-2">${diagram.title}</div>` : ""}
          ${content}
          ${diagram.description ? `<div class="text-sm text-gray-600 dark:text-gray-300">${diagram.description}</div>` : ""}
        </div>
      `
    }).join('')
  })
}

export default function DocumentationRenderer({ content, diagrams = [] }: DocumentationRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  const mdWithPlaceholders = insertDiagramPlaceholders(content, sectionToDiagramType, diagrams)
  const rawHtml = typeof marked.parse === 'function'
    ? (marked.parse(mdWithPlaceholders) as string)
    : marked(mdWithPlaceholders) as string

  const html = injectDiagrams(rawHtml, diagrams)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = html
    }

    // Mermaid rendering
    document.querySelectorAll('pre code.language-mermaid').forEach(async (block, idx) => {
      const code = block.textContent
      if (!code) return
      try {
        const { svg } = await mermaid.render('mermaid-' + idx, code)
        const pre = block.parentElement
        if (pre?.tagName === 'PRE') {
          const div = document.createElement('div')
          div.innerHTML = svg
          pre.replaceWith(div)
        }
      } catch (e) {
        console.error('[Mermaid Render] Failed:', e)
      }
    })

    // Highlight code
    containerRef.current?.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })

    // Copy to clipboard
    const buttons = containerRef.current?.querySelectorAll('.copy-btn') || []
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-clipboard-target')?.replace('#', '')
        const code = document.getElementById(targetId || '')
        if (code) {
          navigator.clipboard.writeText(code.textContent || "")
          btn.textContent = "Copied!"
          setTimeout(() => btn.textContent = "Copy", 1200)
        }
      })
    })

    return () => {
      buttons.forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true))
      })
    }
  }, [html])

  return (
    <Card className="overflow-hidden p-6 bg-white dark:bg-zinc-900">
      <div
        ref={containerRef}
        className="max-w-3xl mx-auto font-sans prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h1:mb-6 prose-h2:mb-4 prose-h3:mb-3 prose-h4:mb-2 prose-p:mb-4 prose-li:marker:text-primary prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-zinc-800 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-md prose-table:border prose-table:border-gray-300 prose-th:bg-gray-100 prose-td:bg-white prose-pre:bg-zinc-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-code:bg-zinc-800 prose-code:text-green-300 prose-code:px-1 prose-code:rounded"
      />
    </Card>
  )
}
