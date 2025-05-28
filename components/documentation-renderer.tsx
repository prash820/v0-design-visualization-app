"use client"

import React, { useEffect } from "react"
import { marked } from "marked"
import hljs from "highlight.js"
import "highlight.js/styles/github-dark.css"
import type { UMLDiagram } from "@/lib/types"
import { Card } from "@/components/ui/card"

// Define diagram types more explicitly
type DiagramType = 'component' | 'data-model' | 'integration' | 'class' | 'sequence' | 'entity' | 'architecture';

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

// Add a custom renderer for code blocks using highlight.js
const renderer = new marked.Renderer()
renderer.code = function ({ text, lang }: { text: string; lang?: string }) {
  const id = `codeblock-${Math.random().toString(36).substr(2, 9)}`
  if (lang && hljs.getLanguage(lang)) {
    const highlighted = hljs.highlight(text, { language: lang }).value
    return `<div class="relative group my-6"><button class="copy-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs text-white px-2 py-1 rounded" data-clipboard-target="#${id}">Copy</button><pre><code id="${id}" class="hljs language-${lang}">${highlighted}</code></pre></div>`
  }
  const highlighted = hljs.highlightAuto(text).value
  return `<div class="relative group my-6"><button class="copy-btn absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-800 text-xs text-white px-2 py-1 rounded" data-clipboard-target="#${id}">Copy</button><pre><code id="${id}" class="hljs">${highlighted}</code></pre></div>`
}

// Custom blockquote rendering for Note/Warning/Tip
renderer.blockquote = function ({ text }: { text: string }) {
  if (text.trim().startsWith("Note:")) {
    return `<blockquote class="noteblock flex items-start gap-2 bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-400 p-4 rounded-md my-6"><span class='mt-1'>💡</span><div>${text.replace(/^Note:/, "<strong>Note:</strong>")}</div></blockquote>`
  }
  if (text.trim().startsWith("Warning:")) {
    return `<blockquote class="warnblock flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 p-4 rounded-md my-6"><span class='mt-1'>⚠️</span><div>${text.replace(/^Warning:/, "<strong>Warning:</strong>")}</div></blockquote>`
  }
  if (text.trim().startsWith("Tip:")) {
    return `<blockquote class="tipblock flex items-start gap-2 bg-green-50 dark:bg-green-900/30 border-l-4 border-green-400 p-4 rounded-md my-6"><span class='mt-1'>💡</span><div>${text.replace(/^Tip:/, "<strong>Tip:</strong>")}</div></blockquote>`
  }
  return `<blockquote class="prose-blockquote my-6">${text}</blockquote>`
}

// Add extra spacing after H2/H3
renderer.heading = function ({ text, depth }: { text: string; depth: number }) {
  const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
  if (depth === 2 || depth === 3) {
    return `<h${depth} id="${id}" class="mt-10 mb-4 border-b border-gray-200 dark:border-zinc-700 pb-1">${text}</h${depth}>`
  }
  return `<h${depth} id="${id}" class="mt-8 mb-2">${text}</h${depth}>`
}

// Custom bullets for lists
renderer.listitem = function (text: string | { text?: string; raw?: string }) {
  let content: string;
  if (typeof text === "object" && text !== null) {
    content = text.text || text.raw || JSON.stringify(text);
  } else {
    content = text;
  }
  // Parse inner markdown for formatting
  const html = marked.parseInline ? marked.parseInline(content) : content;
  return `<li class="pl-2 relative before:content-['•'] before:absolute before:-left-4 before:text-blue-500 dark:before:text-blue-400">${html}</li>`;
}

marked.setOptions({
  renderer,
})

// Map section headers to diagram types
const sectionToDiagramType: Record<string, DiagramType> = {
  "Proposed Architecture": "component",
  "Data Models": "entity",
  "API Contracts": "sequence",
  "Component Diagram": "component",
  "Class Diagram": "class",
  "Sequence Diagram": "sequence",
  "Entity Relationship": "entity",
  "System Architecture": "architecture",
  "Component Architecture": "component",
  "Database Schema": "data-model",
  "Integrations": "integration",
  "API Integration": "integration",
  "System Integration": "integration"
};

// Insert diagram placeholders after relevant section headers in Markdown
function insertDiagramPlaceholders(markdown: string, sectionToDiagramType: Record<string, DiagramType>, diagrams: Diagram[]) {
  let md = markdown;

  // Log all section headers found in the markdown
  const sectionHeaders = Array.from(md.matchAll(/^(##+\s+([^\n]+))/gm)).map(match => match[2].trim());
  console.log('[insertDiagramPlaceholders] Section headers found in markdown:', sectionHeaders);
  return md.replace(
    /^(##+\s+([^\n]+))/gm,
    (match, header, sectionTitle) => {
      // Remove leading <span ...></span> from the section title
      const cleanTitle = sectionTitle.trim().replace(/^<span[^>]*>.*?<\/span>\s*/i, '');
      const type = sectionToDiagramType[cleanTitle];
      if (type) {
        console.log(`[insertDiagramPlaceholders] Inserting placeholder for section: '${cleanTitle}' with type: '${type}'`);
        return `${match}\n\n{{DIAGRAM:${type}}}`;
      }
      return match;
    }
  );
}

// Utility to escape HTML for safe code block rendering
function escapeHtml(str: string) {
  return str.replace(/[&<>'"]/g, tag => (
    {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] as string
  ));
}

// Replace placeholders in HTML with diagram HTML (supporting svg, img, fallback to mermaid code)
function injectDiagrams(html: string, diagrams: Diagram[] = []) {
  return html.replace(/\{\{DIAGRAM:([a-zA-Z0-9_-]+)\}\}/g, (match, type) => {
    const diagramsForType = type === 'ALL' ? diagrams : diagrams.filter((d) => d.type === type);
    console.log(`[injectDiagrams] Replacing placeholder for type: '${type}' with ${diagramsForType.length} diagram(s)`);
    if (diagramsForType.length === 0) return "";
    return diagramsForType.map(diagram => {
      let diagramContent = "";
      if (diagram.svg) {
        console.log('Rendering SVG for diagram:', diagram.type, diagram.svg.substring(0, 200));
        diagramContent = diagram.svg;
      } else if (diagram.url) {
        diagramContent = `<img src=\"${diagram.url}\" alt=\"${diagram.title || diagram.type}\" class=\"w-full h-auto mb-2\" />`;
      } else if (diagram.mermaid) {
        diagramContent = `<pre>${escapeHtml(diagram.mermaid)}</pre>`;
      }
      return `
        <div class=\"my-4 p-4 border rounded bg-zinc-50 dark:bg-zinc-800\">
          ${diagram.title ? `<div class=\"font-semibold mb-2\">${diagram.title}</div>` : ""}
          ${diagramContent}
          ${diagram.description ? `<div class=\"text-sm text-gray-600 dark:text-gray-300\">${diagram.description}</div>` : ""}
        </div>
      `;
    }).join('');
  });
}

export default function DocumentationRenderer({ content, diagrams = [] }: DocumentationRendererProps) {
  // Debug: log diagrams prop
  // Insert placeholders in the Markdown
  const markdownWithPlaceholders = insertDiagramPlaceholders(content, sectionToDiagramType, diagrams);
  
  // Render Markdown to HTML
  let htmlContent: string;
  if (typeof marked.parse === 'function') {
    const result = marked.parse(markdownWithPlaceholders);
    if (typeof result === 'string') {
      htmlContent = result;
    } else if (result instanceof Promise) {
      throw new Error('Async marked.parse is not supported in this component.');
    } else {
      throw new Error('Unexpected return type from marked.parse.');
    }
  } else {
    htmlContent = marked(markdownWithPlaceholders) as string;
  }

  // Inject diagrams into the HTML
  const htmlWithDiagrams = injectDiagrams(htmlContent, diagrams);

  useEffect(() => {
    // Highlight code blocks after rendering (for any dynamic content)
    document.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block as HTMLElement)
    })

    // Copy-to-clipboard for code blocks
    const buttons = document.querySelectorAll('.copy-btn')
    buttons.forEach((btn) => {
      btn.addEventListener('click', function (e) {
        const targetId = (btn as HTMLElement).getAttribute('data-clipboard-target')?.replace('#', '')
        if (targetId) {
          const code = document.getElementById(targetId)
          if (code) {
            navigator.clipboard.writeText(code.textContent || "")
            btn.textContent = "Copied!"
            setTimeout(() => {
              btn.textContent = "Copy"
            }, 1200)
          }
        }
      })
    })
    return () => {
      buttons.forEach((btn) => {
        btn.replaceWith(btn.cloneNode(true))
      })
    }
  }, [htmlWithDiagrams])


  return (
    <Card className="overflow-hidden p-6 bg-white dark:bg-zinc-900">
      <div 
        className="max-w-3xl mx-auto font-sans prose prose-slate dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-h1:mb-6 prose-h2:mb-4 prose-h3:mb-3 prose-h4:mb-2 prose-p:mb-4 prose-li:marker:text-primary prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 dark:prose-blockquote:bg-zinc-800 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-md prose-table:border prose-table:border-gray-300 prose-th:bg-gray-100 prose-td:bg-white prose-pre:bg-zinc-900 prose-pre:text-gray-100 prose-pre:rounded-lg prose-pre:p-4 prose-code:bg-zinc-800 prose-code:text-green-300 prose-code:px-1 prose-code:rounded"
        dangerouslySetInnerHTML={{ __html: htmlWithDiagrams }}
      />
    </Card>
  )
}
