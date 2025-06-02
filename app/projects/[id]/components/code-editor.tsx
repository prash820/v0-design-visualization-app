import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Save, FileCode } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { AppCodeResponse } from "@/lib/types"

interface CodeEditorProps {
  code: AppCodeResponse
  onSave?: (updatedCode: AppCodeResponse) => Promise<void>
}

export function CodeEditor({ code, onSave }: CodeEditorProps) {
  const [activeTab, setActiveTab] = useState('frontend')
  const [isSaving, setIsSaving] = useState(false)
  const [editedCode, setEditedCode] = useState<AppCodeResponse>(code)
  const { toast } = useToast()

  const handleCodeChange = (section: 'frontend' | 'backend', file: string, newContent: string) => {
    setEditedCode(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [file]: newContent
      }
    }))
  }

  const handleSave = async () => {
    if (!onSave) return

    try {
      setIsSaving(true)
      await onSave(editedCode)
      toast({
        title: "Success",
        description: "Code changes saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save code changes",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const renderFileEditor = (section: 'frontend' | 'backend', file: string, content: string) => {
    return (
      <div className="relative h-[500px] w-full">
        <textarea
          value={content}
          onChange={(e) => handleCodeChange(section, file, e.target.value)}
          className="w-full h-full font-mono text-sm p-4 bg-gray-50 dark:bg-gray-900 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          spellCheck={false}
        />
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Code Editor</CardTitle>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="sm"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
          </TabsList>

          <TabsContent value="frontend">
            <Tabs defaultValue="components">
              <TabsList className="mb-4">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="utils">Utils</TabsTrigger>
              </TabsList>

              <TabsContent value="components">
                {Object.entries(editedCode.frontend.components).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('frontend', file, content)}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="pages">
                {Object.entries(editedCode.frontend.pages).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('frontend', file, content)}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="utils">
                {Object.entries(editedCode.frontend.utils).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('frontend', file, content)}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="backend">
            <Tabs defaultValue="controllers">
              <TabsList className="mb-4">
                <TabsTrigger value="controllers">Controllers</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="routes">Routes</TabsTrigger>
                <TabsTrigger value="utils">Utils</TabsTrigger>
              </TabsList>

              <TabsContent value="controllers">
                {Object.entries(editedCode.backend.controllers).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('backend', file, content)}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="models">
                {Object.entries(editedCode.backend.models).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('backend', file, content)}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="routes">
                {Object.entries(editedCode.backend.routes).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('backend', file, content)}
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="utils">
                {Object.entries(editedCode.backend.utils).map(([file, content]) => (
                  <div key={file} className="mb-6">
                    <h3 className="text-sm font-medium mb-2 flex items-center">
                      <FileCode className="h-4 w-4 mr-2" />
                      {file}
                    </h3>
                    {renderFileEditor('backend', file, content)}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
} 