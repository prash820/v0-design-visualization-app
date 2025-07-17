"use client"

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChevronDown, FileText, Folder, CheckCircle } from "lucide-react";

interface FileNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  children?: FileNode[];
  content?: string;
  errors?: string[];
  warnings?: string[];
}

interface CodeEditorProps {
  appCode: any;
  onCodeChange?: (updatedCode: any) => void;
  onDeploy?: () => void;
  sandboxStatus?: any;
  buildErrors?: string[];
  runtimeErrors?: string[];
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  appCode,
  onCodeChange,
  onDeploy,
  sandboxStatus,
  buildErrors = [],
  runtimeErrors = []
}) => {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isEditing, setIsEditing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Convert app code to file tree structure
  useEffect(() => {
    const tree = convertAppCodeToFileTree(appCode);
    setFileTree(tree);
    
    // Select first file by default
    if (tree.length > 0) {
      const firstFile = findFirstFile(tree);
      if (firstFile) {
        setSelectedFile(firstFile.path);
        setFileContent(firstFile.content || '');
      }
    }
  }, [appCode]);

  // Update file content when selected file changes
  useEffect(() => {
    if (selectedFile) {
      const file = findFileByPath(fileTree, selectedFile);
      if (file) {
        setFileContent(file.content || '');
        setIsEditing(false);
        setHasUnsavedChanges(false);
      }
    }
  }, [selectedFile, fileTree]);

  const convertAppCodeToFileTree = (code: any): FileNode[] => {
    const tree: FileNode[] = [];
    
    // Frontend section
    if (code.frontend) {
      const frontendNode: FileNode = {
        name: 'frontend',
        path: 'frontend',
        type: 'directory',
        children: []
      };
      
      for (const [category, files] of Object.entries(code.frontend)) {
        if (typeof files === 'object' && files !== null) {
          const categoryNode: FileNode = {
            name: category,
            path: `frontend/${category}`,
            type: 'directory',
            children: []
          };
          
          for (const [fileName, content] of Object.entries(files)) {
            if (typeof content === 'string') {
              categoryNode.children!.push({
                name: fileName,
                path: `frontend/${category}/${fileName}`,
                type: 'file',
                content: content as string,
                errors: getFileErrors(fileName, buildErrors, runtimeErrors),
                warnings: getFileWarnings(fileName, buildErrors, runtimeErrors)
              });
            }
          }
          
          frontendNode.children!.push(categoryNode);
        }
      }
      
      tree.push(frontendNode);
    }
    
    // Backend section
    if (code.backend) {
      const backendNode: FileNode = {
        name: 'backend',
        path: 'backend',
        type: 'directory',
        children: []
      };
      
      for (const [category, files] of Object.entries(code.backend)) {
        if (typeof files === 'object' && files !== null) {
          const categoryNode: FileNode = {
            name: category,
            path: `backend/${category}`,
            type: 'directory',
            children: []
          };
          
          for (const [fileName, content] of Object.entries(files)) {
            if (typeof content === 'string') {
              categoryNode.children!.push({
                name: fileName,
                path: `backend/${category}/${fileName}`,
                type: 'file',
                content: content as string,
                errors: getFileErrors(fileName, buildErrors, runtimeErrors),
                warnings: getFileWarnings(fileName, buildErrors, runtimeErrors)
              });
            }
          }
          
          backendNode.children!.push(categoryNode);
        }
      }
      
      tree.push(backendNode);
    }
    
    return tree;
  };

  const getFileErrors = (fileName: string, buildErrors: string[], runtimeErrors: string[]): string[] => {
    const errors: string[] = [];
    
    // Check build errors
    buildErrors.forEach(error => {
      if (error.toLowerCase().includes(fileName.toLowerCase())) {
        errors.push(error);
      }
    });
    
    // Check runtime errors
    runtimeErrors.forEach(error => {
      if (error.toLowerCase().includes(fileName.toLowerCase())) {
        errors.push(error);
      }
    });
    
    return errors;
  };

  const getFileWarnings = (fileName: string, buildErrors: string[], runtimeErrors: string[]): string[] => {
    // For now, return empty array - can be extended for warnings
    return [];
  };

  const findFirstFile = (nodes: FileNode[]): FileNode | null => {
    for (const node of nodes) {
      if (node.type === 'file') {
        return node;
      }
      if (node.children) {
        const found = findFirstFile(node.children);
        if (found) return found;
      }
    }
    return null;
  };

  const findFileByPath = (nodes: FileNode[], path: string): FileNode | null => {
    for (const node of nodes) {
      if (node.path === path) {
        return node;
      }
      if (node.children) {
        const found = findFileByPath(node.children, path);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleFolder = (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedFolders(newExpanded);
  };

  const handleFileSelect = (file: FileNode) => {
    if (file.type === 'file') {
      setSelectedFile(file.path);
    }
  };

  const handleContentChange = (newContent: string) => {
    setFileContent(newContent);
    setHasUnsavedChanges(true);
  };

  const saveFile = () => {
    if (selectedFile && onCodeChange) {
      const updatedCode = { ...appCode };
      const pathParts = selectedFile.split('/');
      
      if (pathParts.length >= 3) {
        const [section, category, fileName] = pathParts;
        if (updatedCode[section] && updatedCode[section][category]) {
          updatedCode[section][category][fileName] = fileContent;
          onCodeChange(updatedCode);
          setHasUnsavedChanges(false);
        }
      }
    }
  };

  const renderFileTree = (nodes: FileNode[], level: number = 0) => {
    return nodes.map((node) => (
      <div key={node.path} className="ml-4">
        <div
          className={`flex items-center p-1 cursor-pointer hover:bg-muted rounded ${
            selectedFile === node.path ? 'bg-muted' : ''
          }`}
          onClick={() => {
            if (node.type === 'directory') {
              toggleFolder(node.path);
            } else {
              handleFileSelect(node);
            }
          }}
        >
          {node.type === 'directory' ? (
            expandedFolders.has(node.path) ? (
              <ChevronDown className="mr-2 h-4 w-4" />
            ) : (
              <ChevronRight className="mr-2 h-4 w-4" />
            )
          ) : (
            <div className="w-4 mr-2" />
          )}
          
          {node.type === 'directory' ? (
            <Folder className="mr-2 h-4 w-4" />
          ) : (
            <FileText className="mr-2 h-4 w-4" />
          )}
          
          <span className={`text-sm ${node.type === 'directory' ? 'font-bold' : ''}`}>
            {node.name}
          </span>
          
          {node.type === 'file' && node.errors && node.errors.length > 0 && (
            <Badge variant="destructive" className="ml-2 text-xs">
              {node.errors.length}
            </Badge>
          )}
          
          {node.type === 'file' && node.warnings && node.warnings.length > 0 && (
            <Badge variant="secondary" className="ml-2 text-xs">
              {node.warnings.length}
            </Badge>
          )}
        </div>
        
        {node.type === 'directory' && expandedFolders.has(node.path) && node.children && (
          renderFileTree(node.children, level + 1)
        )}
      </div>
    ));
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b bg-background">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Code Editor</h3>
          
          <div className="flex gap-2">
            {hasUnsavedChanges && (
              <Button size="sm" variant="outline" onClick={saveFile}>
                Save Changes
              </Button>
            )}
            
            {sandboxStatus && (
              <Button
                size="sm"
                variant={sandboxStatus.status === 'ready' ? 'default' : 'secondary'}
                onClick={onDeploy}
                disabled={sandboxStatus.status !== 'ready'}
              >
                {sandboxStatus.status === 'ready' ? 'Deploy to Production' : 'Preparing Sandbox...'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* File Tree Sidebar */}
        <div className="w-64 border-r bg-muted/50 overflow-y-auto">
          <div className="p-3 border-b">
            <span className="text-sm font-bold text-muted-foreground">EXPLORER</span>
          </div>
          <div className="p-2">
            {renderFileTree(fileTree)}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File Header */}
              <div className="p-3 border-b bg-background flex items-center justify-between">
                <span className="text-sm font-medium">{selectedFile}</span>
                <div className="flex gap-2 items-center">
                  {hasUnsavedChanges && (
                    <span className="text-xs text-orange-500">● Modified</span>
                  )}
                  <Button size="sm" variant="outline" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? 'View' : 'Edit'}
                  </Button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="flex-1 p-4 bg-gray-900 overflow-auto">
                {isEditing ? (
                  <textarea
                    value={fileContent}
                    onChange={(e) => handleContentChange(e.target.value)}
                    className="w-full h-full bg-gray-900 text-white font-mono text-sm border-none outline-none resize-none p-4 leading-relaxed"
                    spellCheck={false}
                  />
                ) : (
                  <pre className="m-0 p-4 bg-gray-900 text-white font-mono text-sm leading-relaxed whitespace-pre-wrap word-wrap-break-word">
                    {fileContent}
                  </pre>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a file to view its contents</p>
            </div>
          )}
        </div>

        {/* Problems Panel */}
        {(buildErrors.length > 0 || runtimeErrors.length > 0) && (
          <div className="w-80 border-l bg-background">
            <div className="p-3 border-b">
              <span className="text-sm font-bold text-muted-foreground">PROBLEMS</span>
            </div>
            <div className="p-3 overflow-y-auto max-h-96">
              {buildErrors.map((error, index) => (
                <div key={`build-${index}`} className="mb-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              ))}
              {runtimeErrors.map((error, index) => (
                <div key={`runtime-${index}`} className="mb-2 p-2 bg-orange-100 border border-orange-200 rounded">
                  <span className="text-sm text-orange-700">{error}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Status Bar */}
      <div className="p-2 border-t bg-muted flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {selectedFile ? `${selectedFile} • ${fileContent.length} characters` : 'Ready'}
        </span>
        
        {sandboxStatus && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sandbox:</span>
            {sandboxStatus.status === 'ready' ? (
              <div className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3 text-green-500" />
                <span className="text-xs text-green-500">Ready</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-3 w-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-orange-500">Preparing...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeEditor; 