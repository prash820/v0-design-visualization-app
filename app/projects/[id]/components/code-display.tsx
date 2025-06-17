import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AppCodeResponse } from "@/lib/types"
import { ScrollArea } from "@/components/ui/scroll-area"

interface CodeDisplayProps {
  code: AppCodeResponse
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  const highlightCode = (code: string, language: string) => {
    // In v0 environment, just return the plain code
    // In production, this would use highlight.js
    return code
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Application Code</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="frontend" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="documentation">Documentation</TabsTrigger>
          </TabsList>

          <TabsContent value="frontend">
            <Tabs defaultValue="components" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="components">Components</TabsTrigger>
                <TabsTrigger value="pages">Pages</TabsTrigger>
                <TabsTrigger value="utils">Utils</TabsTrigger>
              </TabsList>

              <TabsContent value="components">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.frontend.components).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="pages">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.frontend.pages).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="utils">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.frontend.utils).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="backend">
            <Tabs defaultValue="controllers" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="controllers">Controllers</TabsTrigger>
                <TabsTrigger value="models">Models</TabsTrigger>
                <TabsTrigger value="routes">Routes</TabsTrigger>
                <TabsTrigger value="utils">Utils</TabsTrigger>
              </TabsList>

              <TabsContent value="controllers">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.backend.controllers).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="models">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.backend.models).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="routes">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.backend.routes).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>

              <TabsContent value="utils">
                <ScrollArea className="h-[600px] rounded-md border p-4">
                  {Object.entries(code.backend.utils).map(([filename, content]) => (
                    <div key={filename} className="mb-8">
                      <h3 className="text-lg font-semibold mb-2">{filename}</h3>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                        <code>{content}</code>
                      </pre>
                    </div>
                  ))}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="documentation">
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="prose prose-invert max-w-none">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-auto text-sm">
                  <code>{code.documentation}</code>
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
