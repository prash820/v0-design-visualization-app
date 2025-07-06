import { useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Dynamically import Monaco Editor with no SSR (correctly handling default export)
const MonacoEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  { ssr: false }
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

  function handleEditorDidMount(editor: any) {
    editorRef.current = editor
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px]">
        <MonacoEditor
          height="100%"
          defaultLanguage={language}
          defaultValue={code}
          theme="vs-dark"
          options={{
            minimap: { enabled: true },
            fontSize: 14,
            wordWrap: 'on',
            readOnly,
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
          onMount={handleEditorDidMount}
          onChange={onChange}
        />
      </CardContent>
    </Card>
  )
}
