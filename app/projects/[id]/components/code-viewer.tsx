import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from './code-editor'

interface CodeViewerProps {
  code: {
    frontend: {
      components: Record<string, string>
      pages: Record<string, string>
      utils: Record<string, string>
    }
    backend: {
      controllers: Record<string, string>
      models: Record<string, string>
      routes: Record<string, string>
      utils: Record<string, string>
    }
    documentation: string
  }
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [activeSection, setActiveSection] = useState('frontend')
  const [activeTab, setActiveTab] = useState('components')

  const getLanguageFromFilename = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript'
      case 'jsx':
      case 'js':
        return 'javascript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      default:
        return 'plaintext'
    }
  }

  const renderCodeSection = (section: Record<string, string>) => {
    return Object.entries(section).map(([filename, content]) => (
      <div key={filename} className="mb-4">
        <h3 className="text-sm font-medium mb-2">{filename}</h3>
        <CodeEditor
          code={content}
          language={getLanguageFromFilename(filename)}
          title={filename}
          readOnly
        />
      </div>
    ))
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="mb-4">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="frontend">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="utils">Utils</TabsTrigger>
              </TabsList>

              <TabsContent value="components">
                {renderCodeSection(code.frontend.components)}
              </TabsContent>

              <TabsContent value="pages">
                {renderCodeSection(code.frontend.pages)}
              </TabsContent>

              <TabsContent value="utils">
                {renderCodeSection(code.frontend.utils)}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="backend">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="controllers">Controllers</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="routes">Routes</TabsTrigger>
                <TabsTrigger value="utils">Utils</TabsTrigger>
              </TabsList>

              <TabsContent value="controllers">
                {renderCodeSection(code.backend.controllers)}
              </TabsContent>

              <TabsContent value="models">
                {renderCodeSection(code.backend.models)}
              </TabsContent>

              <TabsContent value="routes">
                {renderCodeSection(code.backend.routes)}
              </TabsContent>

              <TabsContent value="utils">
                {renderCodeSection(code.backend.utils)}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="documentation">
            <CodeEditor
              code={code.documentation}
              language="markdown"
              title="Documentation"
              readOnly
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
