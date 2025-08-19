'use client';

import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
  className?: string;
}

export function MermaidDiagram({ chart, title, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
    });

    // Render the diagram
    if (containerRef.current && chart) {
      const element = containerRef.current;
      element.innerHTML = '';
      
      mermaid.render('mermaid-diagram-' + Math.random(), chart).then(({ svg }) => {
        element.innerHTML = svg;
      }).catch((error) => {
        console.error('Mermaid rendering error:', error);
        element.innerHTML = `
          <div class="p-4 text-center text-gray-500">
            <p>Failed to render diagram</p>
            <details class="mt-2 text-left">
              <summary class="cursor-pointer text-sm">Show code</summary>
              <pre class="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">${chart}</pre>
            </details>
          </div>
        `;
      });
    }
  }, [chart]);

  return (
    <div className={`mermaid-diagram ${className}`}>
      {title && (
        <h4 className="font-semibold mb-2">{title}</h4>
      )}
      <div 
        ref={containerRef} 
        className="bg-white border rounded-md p-4 overflow-auto"
        style={{ minHeight: '200px' }}
      />
    </div>
  );
} 