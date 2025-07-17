import { useEffect, useRef, useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import Monaco Editor with no SSR
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-800">
        <div className="text-sm text-gray-500">Loading editor...</div>
      </div>
    )
  }
)

interface CodeEditorProps {
  code: string
  language?: string
  title?: string
  readOnly?: boolean
  onChange?: (value: string | undefined) => void
}

export function CodeEditor({ 
  code, 
  language = 'typescript',
  title = 'Code Editor',
  readOnly = false,
  onChange 
}: CodeEditorProps) {
  const editorRef = useRef<any>(null)
  const [hasError, setHasError] = useState(false)

  const handleEditorDidMount = useCallback((editor: any) => {
    try {
      editorRef.current = editor
      setHasError(false)
    } catch (error) {
      console.error('Monaco Editor mount error:', error)
      setHasError(true)
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      editorRef.current = null
    }
  }, [])

  // Error fallback with code display
  if (hasError) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-2">Editor failed to load</p>
            <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded text-sm max-h-[500px] overflow-auto text-left">
              {code}
            </pre>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px]">
        <div style={{ height: '100%', position: 'relative' }}>
          <MonacoEditor
            key={`${title}-${language}-${code.length}`} // Unique key to prevent conflicts
            height="100%"
            language={language}
            value={code}
            theme="vs-dark"
            options={{
              readOnly,
              minimap: { enabled: false },
              fontSize: 14,
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              lineNumbers: 'on',
              contextmenu: false,
            }}
            onMount={handleEditorDidMount}
            onChange={onChange}
            beforeMount={(monaco) => {
              try {
                monaco.editor.setTheme('vs-dark')
              } catch (error) {
                console.warn('Monaco theme setup warning:', error)
              }
            }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
