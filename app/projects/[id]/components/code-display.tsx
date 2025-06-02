import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppCodeResponse } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeDisplayProps {
  code: AppCodeResponse;
}

export function CodeDisplay({ code }: CodeDisplayProps) {
  const highlightCode = (code: string, language: string) => {
    try {
      return hljs.highlight(code, { language }).value;
    } catch (error) {
      return code;
    }
  };

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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                      <pre className="rounded-md overflow-hidden">
                        <code
                          className="language-typescript"
                          dangerouslySetInnerHTML={{
                            __html: highlightCode(content, 'typescript'),
                          }}
                        />
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
                <pre className="rounded-md overflow-hidden">
                  <code
                    className="language-markdown"
                    dangerouslySetInnerHTML={{
                      __html: highlightCode(code.documentation, 'markdown'),
                    }}
                  />
                </pre>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
} 