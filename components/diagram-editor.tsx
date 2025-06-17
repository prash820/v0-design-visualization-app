"use client"

import type React from "react"
import MonacoEditor from "react-monaco-editor"

interface DiagramEditorProps {
  value: string
  onChange: (newValue: string) => void
}

const DiagramEditor: React.FC<DiagramEditorProps> = ({ value, onChange }) => {
  const editorDidMount = (editor: any, monaco: any) => {
    console.log("editorDidMount", editor)
    editor.focus()
  }

  const onChangeHandler = (newValue: string, e: any) => {
    console.log("onChange", newValue, e)
    onChange(newValue)
  }

  return (
    <MonacoEditor
      width="800"
      height="600"
      language="json"
      value={value}
      options={{
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        automaticLayout: true,
        theme: "vs-dark", // Force dark theme
        // Or for light theme with dark text:
        foreground: "#000000",
        background: "#ffffff",
      }}
      onChange={onChangeHandler}
      editorDidMount={editorDidMount}
    />
  )
}

export default DiagramEditor
