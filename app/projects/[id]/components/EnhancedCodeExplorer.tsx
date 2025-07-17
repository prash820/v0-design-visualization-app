"use client"

import React, { useState, useMemo } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen, Code, Package, Settings, Zap, AlertCircle, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppCodeResponse } from '@/lib/types'

interface FileNode {
  name: string
  content: string
  type: 'file'
  path: string
  language: string
}

interface FolderNode {
  name: string
  type: 'folder'
  path: string
  children: (FileNode | FolderNode)[]
  isOpen?: boolean
}

interface EnhancedCodeExplorerProps {
  appCode: AppCodeResponse
  projectId: string
  onCodeChange?: (updatedCode: AppCodeResponse) => void
}

const getLanguageFromFilename = (filename: string): string => {
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
    case 'scss':
      return 'scss'
    case 'json':
      return 'json'
    case 'md':
      return 'markdown'
    case 'yml':
    case 'yaml':
      return 'yaml'
    case 'dockerfile':
      return 'dockerfile'
    default:
      return 'typescript'
  }
}

const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'json':
      return <Package className="h-4 w-4 text-yellow-500" />
    case 'ts':
    case 'tsx':
    case 'js':
    case 'jsx':
      return <Code className="h-4 w-4 text-blue-500" />
    case 'css':
    case 'scss':
      return <Settings className="h-4 w-4 text-purple-500" />
    case 'dockerfile':
      return <Zap className="h-4 w-4 text-cyan-500" />
    default:
      return <File className="h-4 w-4 text-gray-500" />
  }
}

const buildFileTree = (appCode: AppCodeResponse): (FileNode | FolderNode)[] => {
  const tree: (FileNode | FolderNode)[] = []

  // Add frontend package.json at root
  if (appCode.fileStructure.build.frontendPackageJson) {
    tree.push({
      name: 'package.json (Frontend)',
      content: appCode.fileStructure.build.frontendPackageJson,
      type: 'file',
      path: 'package.json',
      language: 'json'
    })
  }

  // Add backend package.json
  if (appCode.fileStructure.build.backendPackageJson) {
    tree.push({
      name: 'package.json (Backend)',
      content: appCode.fileStructure.build.backendPackageJson,
      type: 'file',
      path: 'backend/package.json',
      language: 'json'
    })
  }

  // Frontend folder
  const frontendFiles: FileNode[] = []
  Object.entries(appCode.fileStructure.frontend).forEach(([category, files]) => {
    Object.entries(files).forEach(([filename, content]) => {
      frontendFiles.push({
        name: `${filename}.${category === 'styles' ? 'css' : 'tsx'}`,
        content,
        type: 'file',
        path: `frontend/${category}/${filename}`,
        language: getLanguageFromFilename(filename)
      })
    })
  })

  if (frontendFiles.length > 0) {
    tree.push({
      name: 'frontend',
      type: 'folder',
      path: 'frontend',
      children: frontendFiles,
      isOpen: true
    })
  }

  // Backend folder
  const backendFiles: FileNode[] = []
  Object.entries(appCode.fileStructure.backend).forEach(([category, files]) => {
    Object.entries(files).forEach(([filename, content]) => {
      backendFiles.push({
        name: `${filename}.ts`,
        content,
        type: 'file',
        path: `backend/${category}/${filename}`,
        language: getLanguageFromFilename(filename)
      })
    })
  })

  if (backendFiles.length > 0) {
    tree.push({
      name: 'backend',
      type: 'folder',
      path: 'backend',
      children: backendFiles,
      isOpen: true
    })
  }

  // Shared folder
  const sharedFiles: FileNode[] = []
  Object.entries(appCode.fileStructure.shared).forEach(([category, files]) => {
    Object.entries(files).forEach(([filename, content]) => {
      sharedFiles.push({
        name: `${filename}.ts`,
        content,
        type: 'file',
        path: `shared/${category}/${filename}`,
        language: getLanguageFromFilename(filename)
      })
    })
  })

  if (sharedFiles.length > 0) {
    tree.push({
      name: 'shared',
      type: 'folder',
      path: 'shared',
      children: sharedFiles,
      isOpen: true
    })
  }

  // Build config files
  const buildFiles: FileNode[] = []
  Object.entries(appCode.fileStructure.build).forEach(([filename, content]) => {
    if (content && !filename.includes('PackageJson')) {
      buildFiles.push({
        name: filename,
        content,
        type: 'file',
        path: `build/${filename}`,
        language: getLanguageFromFilename(filename)
      })
    }
  })

  if (buildFiles.length > 0) {
    tree.push({
      name: 'build',
      type: 'folder',
      path: 'build',
      children: buildFiles,
      isOpen: false
    })
  }

  return tree
}

const FileTreeItem: React.FC<{
  item: FileNode | FolderNode
  onSelect: (item: FileNode) => void
  selectedFile?: FileNode
  depth?: number
}> = ({ item, onSelect, selectedFile, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(item.type === 'folder' ? item.isOpen || false : false)

  if (item.type === 'file') {
    const isSelected = selectedFile?.path === item.path
    return (
      <div
        className={`flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded ${
          isSelected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : ''
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => onSelect(item)}
      >
        {getFileIcon(item.name)}
        <span className="ml-2 truncate">{item.name}</span>
      </div>
    )
  }

  return (
    <div>
      <div
        className="flex items-center px-2 py-1 text-sm cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-500" />
        )}
        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-blue-500 ml-1" />
        ) : (
          <Folder className="h-4 w-4 text-blue-500 ml-1" />
        )}
        <span className="ml-2 font-medium">{item.name}</span>
      </div>
      {isOpen && (
        <div>
          {item.children.map((child, index) => (
            <FileTreeItem
              key={`${child.path}-${index}`}
              item={child}
              onSelect={onSelect}
              selectedFile={selectedFile}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export const EnhancedCodeExplorer: React.FC<EnhancedCodeExplorerProps> = ({
  appCode,
  projectId,
  onCodeChange
}) => {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null)
  const [activeTab, setActiveTab] = useState('explorer')

  const fileTree = useMemo(() => buildFileTree(appCode), [appCode])
  
  // Get all files for search
  const allFiles = useMemo(() => {
    const files: FileNode[] = []
    const collectFiles = (items: (FileNode | FolderNode)[]) => {
      items.forEach(item => {
        if (item.type === 'file') {
          files.push(item)
        } else if (item.children) {
          collectFiles(item.children)
        }
      })
    }
    collectFiles(fileTree)
    return files
  }, [fileTree])

  const handleFileSelect = (file: FileNode) => {
    setSelectedFile(file)
  }

  const getValidationStatus = () => {
    const validation = appCode.validation
    const hasErrors = validation.buildErrors.length > 0 || validation.runtimeErrors.length > 0
    const hasWarnings = validation.lintErrors.length > 0 || validation.typeErrors.length > 0
    
    if (hasErrors) return { status: 'error', count: validation.buildErrors.length + validation.runtimeErrors.length }
    if (hasWarnings) return { status: 'warning', count: validation.lintErrors.length + validation.typeErrors.length }
    return { status: 'success', count: 0 }
  }

  const validationStatus = getValidationStatus()

  return (
    <div className="h-full flex flex-col">
      {/* Header with app info */}
      <div className="border-b border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Code className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Code Explorer</h2>
            </div>
            <Badge variant="outline" className="capitalize">
              {appCode.appType}
            </Badge>
            <Badge variant="secondary">
              {appCode.framework} {appCode.version}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            {validationStatus.status === 'success' && (
              <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Valid</span>
              </div>
            )}
            {validationStatus.status === 'warning' && (
              <div className="flex items-center space-x-1 text-yellow-600 dark:text-yellow-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{validationStatus.count} warnings</span>
              </div>
            )}
            {validationStatus.status === 'error' && (
              <div className="flex items-center space-x-1 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">{validationStatus.count} errors</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* File tree sidebar */}
        <div className="w-80 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="explorer">Explorer</TabsTrigger>
              <TabsTrigger value="search">Search</TabsTrigger>
            </TabsList>
            
            <TabsContent value="explorer" className="flex-1 mt-0">
              <div className="h-full overflow-y-auto">
                <div className="p-2">
                  {fileTree.map((item, index) => (
                    <FileTreeItem
                      key={`${item.path}-${index}`}
                      item={item}
                      onSelect={handleFileSelect}
                      selectedFile={selectedFile || undefined}
                    />
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="search" className="flex-1 mt-0">
              <div className="p-4">
                <p className="text-sm text-gray-500">Search functionality coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Code editor area */}
        <div className="flex-1 flex flex-col">
          {selectedFile ? (
            <>
              {/* File header */}
              <div className="border-b border-gray-200 dark:border-gray-700 px-4 py-2 bg-gray-50 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getFileIcon(selectedFile.name)}
                    <span className="font-medium">{selectedFile.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {selectedFile.language}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">
                      {selectedFile.content.split('\n').length} lines
                    </span>
                  </div>
                </div>
              </div>

              {/* Code content */}
              <div className="flex-1 overflow-hidden">
                <div className="h-full overflow-y-auto">
                  <div className="p-4">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm font-mono overflow-x-auto">
                      <code>{selectedFile.content}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <Code className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  Select a file to view
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Choose a file from the explorer to see its contents
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer with project info */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-4">
            <span>Project: {projectId}</span>
            <span>•</span>
            <span>{allFiles.length} files</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Build: {appCode.buildConfig.buildCommand}</span>
            <span>•</span>
            <span>Port: {appCode.buildConfig.port}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 