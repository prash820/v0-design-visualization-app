import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from './code-editor'

interface CodeViewerProps {
  code: {
    frontend: {
      components: Record<string, string>
      pages: Record<string, string>
      utils: Record<string, string>
      services?: Record<string, string>
      hooks?: Record<string, string>
    }
    backend: {
      controllers: Record<string, string>
      models: Record<string, string>
      routes: Record<string, string>
      utils: Record<string, string>
      services?: Record<string, string>
      middleware?: Record<string, string>
    }
    shared?: {
      interfaces?: Record<string, string>
      types?: Record<string, string>
      utils?: Record<string, string>
    }
    documentation?: string
  }
}

export function CodeViewer({ code }: CodeViewerProps) {
  const [activeSection, setActiveSection] = useState('frontend')
  const [activeTab, setActiveTab] = useState('')

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
    if (!section || Object.keys(section).length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          No code generated for this section
        </div>
      )
    }

    return Object.entries(section).map(([filename, content]) => (
      <div key={filename} className="mb-6">
        <h3 className="text-sm font-medium mb-2 px-1">{filename}</h3>
        <CodeEditor
          code={content || '// No content available'}
          language={getLanguageFromFilename(filename)}
          title={filename}
          readOnly
        />
      </div>
    ))
  }

  // Helper function to check if a section has content
  const hasContent = (section: Record<string, string> | undefined) => {
    return section && Object.keys(section).length > 0
  }

  // Get available tabs for frontend
  const getFrontendTabs = () => {
    const tabs = []
    if (hasContent(code.frontend.components)) tabs.push({ key: 'components', label: 'Components' })
    if (hasContent(code.frontend.pages)) tabs.push({ key: 'pages', label: 'Pages' })
    if (hasContent(code.frontend.utils)) tabs.push({ key: 'utils', label: 'Utils' })
    if (hasContent(code.frontend.services)) tabs.push({ key: 'services', label: 'Services' })
    if (hasContent(code.frontend.hooks)) tabs.push({ key: 'hooks', label: 'Hooks' })
    return tabs
  }

  // Get available tabs for backend
  const getBackendTabs = () => {
    const tabs = []
    if (hasContent(code.backend.controllers)) tabs.push({ key: 'controllers', label: 'Controllers' })
    if (hasContent(code.backend.models)) tabs.push({ key: 'models', label: 'Models' })
    if (hasContent(code.backend.routes)) tabs.push({ key: 'routes', label: 'Routes' })
    if (hasContent(code.backend.utils)) tabs.push({ key: 'utils', label: 'Utils' })
    if (hasContent(code.backend.services)) tabs.push({ key: 'services', label: 'Services' })
    if (hasContent(code.backend.middleware)) tabs.push({ key: 'middleware', label: 'Middleware' })
    return tabs
  }

  // Get available tabs for shared
  const getSharedTabs = () => {
    const tabs = []
    if (hasContent(code.shared?.interfaces)) tabs.push({ key: 'interfaces', label: 'Interfaces' })
    if (hasContent(code.shared?.types)) tabs.push({ key: 'types', label: 'Types' })
    if (hasContent(code.shared?.utils)) tabs.push({ key: 'utils', label: 'Utils' })
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
                      {renderCodeSection(code.frontend[tab.key as keyof typeof code.frontend] as Record<string, string>)}
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
                      {renderCodeSection(code.backend[tab.key as keyof typeof code.backend] as Record<string, string>)}
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
                      {renderCodeSection(code.shared?.[tab.key as keyof typeof code.shared] as Record<string, string>)}
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
