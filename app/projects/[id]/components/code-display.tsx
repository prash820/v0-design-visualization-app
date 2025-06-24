import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppCodeResponse } from "@/lib/types";
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';
const SyntaxHighlighter = require('react-syntax-highlighter').default as any;

const { solarizedLight } = require('react-syntax-highlighter/dist/esm/styles/hljs');

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
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
              </TabsContent>

              <TabsContent value="pages">
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
              </TabsContent>

              <TabsContent value="utils">
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
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
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
              </TabsContent>

              <TabsContent value="models">
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
              </TabsContent>

              <TabsContent value="routes">
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
              </TabsContent>

              <TabsContent value="utils">
                <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
                </div>
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="documentation">
            <div className="h-[600px] rounded-md border p-4 overflow-auto">
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
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

// IaCCodeDisplay: For displaying a single infrastructure code block (e.g., Terraform)
interface IaCCodeDisplayProps {
  code: string;
  language?: string; // e.g., 'hcl' for Terraform, default to 'hcl'
}

export function IaCCodeDisplay({ code, language = 'hcl' }: IaCCodeDisplayProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Generated Infrastructure Code</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border p-4 overflow-auto bg-gray-900" style={{ maxHeight: '80vh' }}>
        <SyntaxHighlighter
            language={language}
            style={solarizedLight}
            customStyle={{
              background: 'transparent',
              color: '#f8f8f2',
              fontSize: '1rem',
              lineHeight: '1.6',
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </CardContent>
    </Card>
  );
} 