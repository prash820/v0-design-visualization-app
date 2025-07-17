import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from './code-editor'
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronRight } from "lucide-react"

interface CodeViewerProps {
  code: {
    frontend?: {
      components?: Record<string, string>
      pages?: Record<string, string>
      utils?: Record<string, string>
      services?: Record<string, string>
      hooks?: Record<string, string>
    }
    backend?: {
      controllers?: Record<string, string>
      models?: Record<string, string>
      routes?: Record<string, string>
      utils?: Record<string, string>
      services?: Record<string, string>
      middleware?: Record<string, string>
      config?: Record<string, string>
    }
    shared?: {
      interfaces?: Record<string, string>
      types?: Record<string, string>
      utils?: Record<string, string>
    }
    deployment?: {
      docker?: Record<string, string>
      config?: Record<string, string>
      instructions?: Record<string, string>
    }
    documentation?: string
    success?: boolean
    fixesApplied?: any[]
    validationMetrics?: any
  }
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [activeSection, setActiveSection] = useState('frontend')
  const [activeTab, setActiveTab] = useState('components')
  const [expandedFiles, setExpandedFiles] = useState<Set<string>>(new Set())
  const [activeEditor, setActiveEditor] = useState<string | null>(null)

  const getLanguageFromFilename = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'js':
      case 'jsx':
        return 'javascript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      case 'tf':
        return 'hcl'
      case 'yml':
      case 'yaml':
        return 'yaml'
      case 'dockerfile':
        return 'dockerfile'
      default:
        return 'plaintext'
    }
  }

  const toggleFileExpansion = (filename: string) => {
    const newExpanded = new Set(expandedFiles)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
      if (activeEditor === filename) {
        setActiveEditor(null)
      }
    } else {
      newExpanded.add(filename)
      setActiveEditor(filename)
    }
    setExpandedFiles(newExpanded)
  }

  const renderCodeSection = (section: Record<string, string>) => {
    if (!section || Object.keys(section).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No code generated for this section
        </div>
      )
    }

    return Object.entries(section).map(([filename, content]) => {
      const isExpanded = expandedFiles.has(filename)
      const isActiveEditor = activeEditor === filename
      
      return (
        <div key={filename} className="mb-4 border rounded-lg">
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto"
            onClick={() => toggleFileExpansion(filename)}
          >
            <div className="flex items-center space-x-2">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="font-medium">{filename}</span>
            </div>
            <span className="text-sm text-gray-500">
              {content ? `${content.split('\n').length} lines` : 'Empty'}
            </span>
          </Button>
          
          {isExpanded && (
            <div className="border-t">
              {isActiveEditor ? (
                <div className="p-4">
                  <CodeEditor
                    code={content || '// No content available'}
                    language={getLanguageFromFilename(filename)}
                    title={filename}
                    readOnly
                  />
                </div>
              ) : (
                <div className="p-4">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Click to load in editor
                    </p>
                    <pre className="text-xs overflow-x-auto max-h-40 overflow-y-auto">
                      {content ? content.slice(0, 500) + (content.length > 500 ? '\n...' : '') : '// No content available'}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    })
  }

  // Helper function to check if a section has content
  const hasContent = (section: Record<string, string> | undefined) => {
    return section && Object.keys(section).length > 0
  }

  // Get available tabs for frontend
  const getFrontendTabs = () => {
    const tabs = []
    if (hasContent(code?.frontend?.components)) tabs.push({ key: 'components', label: 'Components' })
    if (hasContent(code?.frontend?.pages)) tabs.push({ key: 'pages', label: 'Pages' })
    if (hasContent(code?.frontend?.utils)) tabs.push({ key: 'utils', label: 'Utils' })
    if (hasContent(code?.frontend?.services)) tabs.push({ key: 'services', label: 'Services' })
    if (hasContent(code?.frontend?.hooks)) tabs.push({ key: 'hooks', label: 'Hooks' })
    return tabs
  }

  // Get available tabs for backend
  const getBackendTabs = () => {
    const tabs = []
    if (hasContent(code?.backend?.controllers)) tabs.push({ key: 'controllers', label: 'Controllers' })
    if (hasContent(code?.backend?.models)) tabs.push({ key: 'models', label: 'Models' })
    if (hasContent(code?.backend?.routes)) tabs.push({ key: 'routes', label: 'Routes' })
    if (hasContent(code?.backend?.utils)) tabs.push({ key: 'utils', label: 'Utils' })
    if (hasContent(code?.backend?.services)) tabs.push({ key: 'services', label: 'Services' })
    if (hasContent(code?.backend?.middleware)) tabs.push({ key: 'middleware', label: 'Middleware' })
    return tabs
  }

  // Get available tabs for shared
  const getSharedTabs = () => {
    const tabs = []
    if (hasContent(code?.shared?.interfaces)) tabs.push({ key: 'interfaces', label: 'Interfaces' })
    if (hasContent(code?.shared?.types)) tabs.push({ key: 'types', label: 'Types' })
    if (hasContent(code?.shared?.utils)) tabs.push({ key: 'utils', label: 'Utils' })
    return tabs
  }

  // Check if any section has content
  const hasAnyContent = () => {
    return getFrontendTabs().length > 0 || getBackendTabs().length > 0 || getSharedTabs().length > 0
  }

  // Auto-select first available tab for each section
  const frontendTabs = getFrontendTabs()
  const backendTabs = getBackendTabs()
  const sharedTabs = getSharedTabs()

  // Set default active tab based on available content
  const getDefaultTab = (sectionTabs: any[]) => {
    return sectionTabs.length > 0 ? sectionTabs[0].key : 'components'
  }

  // Auto-set default section and tab
  useEffect(() => {
    let defaultSection = 'frontend'
    if (frontendTabs.length > 0) {
      defaultSection = 'frontend'
    } else if (backendTabs.length > 0) {
      defaultSection = 'backend'
    } else if (sharedTabs.length > 0) {
      defaultSection = 'shared'
    }
    
    setActiveSection(defaultSection)
    
    // Set default tab based on active section
    if (defaultSection === 'frontend' && frontendTabs.length > 0) {
      setActiveTab(getDefaultTab(frontendTabs))
    } else if (defaultSection === 'backend' && backendTabs.length > 0) {
      setActiveTab(getDefaultTab(backendTabs))
    } else if (defaultSection === 'shared' && sharedTabs.length > 0) {
      setActiveTab(getDefaultTab(sharedTabs))
    }
  }, [code]) // Only re-run when code changes

  if (!hasAnyContent()) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Generated Code</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">No code has been generated yet</p>
            <p className="text-sm mt-2">Generate application code to view the results here</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSection} onValueChange={setActiveSection}>
          <TabsList className="mb-4">
            {frontendTabs.length > 0 && <TabsTrigger value="frontend">Frontend</TabsTrigger>}
            {backendTabs.length > 0 && <TabsTrigger value="backend">Backend</TabsTrigger>}
            {sharedTabs.length > 0 && <TabsTrigger value="shared">Shared</TabsTrigger>}
          </TabsList>

          {frontendTabs.length > 0 && (
            <TabsContent value="frontend">
              <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={getDefaultTab(frontendTabs)}>
                <TabsList className="mb-4">
                  {frontendTabs.map(tab => (
                    <TabsTrigger key={tab.key} value={tab.key}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="max-h-[600px] overflow-y-auto">
                  {frontendTabs.map(tab => (
                    <TabsContent key={tab.key} value={tab.key}>
                      {renderCodeSection(code?.frontend?.[tab.key as keyof typeof code.frontend] as Record<string, string> || {})}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </TabsContent>
          )}

          {backendTabs.length > 0 && (
            <TabsContent value="backend">
              <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={getDefaultTab(backendTabs)}>
                <TabsList className="mb-4">
                  {backendTabs.map(tab => (
                    <TabsTrigger key={tab.key} value={tab.key}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="max-h-[600px] overflow-y-auto">
                  {backendTabs.map(tab => (
                    <TabsContent key={tab.key} value={tab.key}>
                      {renderCodeSection(code?.backend?.[tab.key as keyof typeof code.backend] as Record<string, string> || {})}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </TabsContent>
          )}

          {sharedTabs.length > 0 && (
            <TabsContent value="shared">
              <Tabs value={activeTab} onValueChange={setActiveTab} defaultValue={getDefaultTab(sharedTabs)}>
                <TabsList className="mb-4">
                  {sharedTabs.map(tab => (
                    <TabsTrigger key={tab.key} value={tab.key}>
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="max-h-[600px] overflow-y-auto">
                  {sharedTabs.map(tab => (
                    <TabsContent key={tab.key} value={tab.key}>
                      {renderCodeSection(code?.shared?.[tab.key as keyof typeof code.shared] as Record<string, string> || {})}
                    </TabsContent>
                  ))}
                </div>
              </Tabs>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
