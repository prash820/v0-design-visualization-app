"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Editor, { useMonaco } from "@monaco-editor/react"

interface CodeEditorProps {
  initialValue: string
  onChange: (value: string) => void
  readOnly?: boolean
}

export const CodeEditor: React.FC<CodeEditorProps> = ({ initialValue, onChange, readOnly = false }) => {
  const [value, setValue] = useState(initialValue)
  const editorRef = useRef<any>(null)
  const monaco = useMonaco()

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setValue(value)
      onChange(value)
    }
  }

  const options = {
    selectOnLineNumbers: true,
    fontSize: 14,
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
    wordWrap: "on" as const,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    minimap: { enabled: false },
    lineNumbers: "on" as const,
    theme: "custom-light", // Use light theme with dark text
    // Force text colors
    "editor.foreground": "#000000",
    "editor.background": "#ffffff",
    readOnly,
  }

  useEffect(() => {
    if (typeof window !== "undefined") {
      import("monaco-editor").then((monaco) => {
        monaco.editor.defineTheme("custom-light", {
          base: "vs",
          inherit: true,
          rules: [
            { token: "", foreground: "000000" },
            { token: "comment", foreground: "008000" },
            { token: "keyword", foreground: "0000FF" },
            { token: "string", foreground: "A31515" },
          ],
          colors: {
            "editor.foreground": "#000000",
            "editor.background": "#ffffff",
            "editorCursor.foreground": "#000000",
            "editor.lineHighlightBackground": "#f0f0f0",
            "editorLineNumber.foreground": "#666666",
          },
        })
      })
    }
  }, [])

  return (
    <Editor
      height="50vh"
      defaultLanguage="javascript"
      defaultValue={initialValue}
      onChange={handleEditorChange}
      options={options}
      onMount={(editor) => {
        editorRef.current = editor
      }}
    />
  )
}
