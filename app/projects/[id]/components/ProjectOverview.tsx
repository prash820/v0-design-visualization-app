"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Code, 
  Package, 
  Settings, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  GitBranch,
  Play,
  Download,
  ExternalLink
} from 'lucide-react'
import { AppCodeResponse } from '@/lib/types'

interface ProjectOverviewProps {
  appCode: AppCodeResponse
  projectId: string
  onDeploy?: () => void
  onDownload?: () => void
}

const getAppIcon = (appType: string) => {
  switch (appType) {
    case 'react':
      return <Code className="h-5 w-5 text-blue-500" />
    case 'nextjs':
      return <Zap className="h-5 w-5 text-black dark:text-white" />
    case 'vue':
      return <Code className="h-5 w-5 text-green-500" />
    case 'angular':
      return <Code className="h-5 w-5 text-red-500" />
    default:
      return <Code className="h-5 w-5 text-gray-500" />
  }
}

const getValidationColor = (status: 'success' | 'warning' | 'error') => {
  switch (status) {
    case 'success':
      return 'text-green-600 dark:text-green-400'
    case 'warning':
      return 'text-yellow-600 dark:text-yellow-400'
    case 'error':
      return 'text-red-600 dark:text-red-400'
  }
}

const getValidationIcon = (status: 'success' | 'warning' | 'error') => {
  switch (status) {
    case 'success':
      return <CheckCircle className="h-4 w-4" />
    case 'warning':
    case 'error':
      return <AlertCircle className="h-4 w-4" />
  }
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({
  appCode,
  projectId,
  onDeploy,
  onDownload
}) => {
  const validation = appCode.validation
  const hasErrors = validation.buildErrors.length > 0 || validation.runtimeErrors.length > 0
  const hasWarnings = validation.lintErrors.length > 0 || validation.typeErrors.length > 0
  
  const validationStatus = hasErrors ? 'error' : hasWarnings ? 'warning' : 'success'
  const totalIssues = validation.buildErrors.length + validation.runtimeErrors.length + 
                     validation.lintErrors.length + validation.typeErrors.length

  const dependencyCount = Object.keys(appCode.buildConfig.dependencies).length
  const devDependencyCount = Object.keys(appCode.buildConfig.devDependencies).length

  return (
    <div className="space-y-6">
      {/* App Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {getAppIcon(appCode.appType)}
            <span>Application Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {appCode.appType.toUpperCase()}
              </div>
              <div className="text-sm text-gray-500">Framework</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                v{appCode.version}
              </div>
              <div className="text-sm text-gray-500">Version</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {dependencyCount}
              </div>
              <div className="text-sm text-gray-500">Dependencies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                {devDependencyCount}
              </div>
              <div className="text-sm text-gray-500">Dev Dependencies</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="capitalize">
                {appCode.appType}
              </Badge>
              <Badge variant="secondary">
                {appCode.framework}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              {onDeploy && (
                <Button size="sm" onClick={onDeploy}>
                  <Play className="h-4 w-4 mr-2" />
                  Deploy
                </Button>
              )}
              {onDownload && (
                <Button size="sm" variant="outline" onClick={onDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Build Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Build Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Scripts</h4>
              <div className="space-y-2">
                {Object.entries(appCode.buildConfig.scripts).map(([script, command]) => (
                  <div key={script} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <span className="font-mono text-sm">{script}</span>
                    <span className="text-xs text-gray-500">{command}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Key Dependencies</h4>
              <div className="space-y-2">
                {Object.entries(appCode.buildConfig.dependencies)
                  .slice(0, 5)
                  .map(([dep, version]) => (
                    <div key={dep} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                      <span className="font-mono text-sm">{dep}</span>
                      <Badge variant="outline" className="text-xs">{version}</Badge>
                    </div>
                  ))}
                {Object.keys(appCode.buildConfig.dependencies).length > 5 && (
                  <div className="text-sm text-gray-500 text-center">
                    +{Object.keys(appCode.buildConfig.dependencies).length - 5} more
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold">{appCode.buildConfig.port}</div>
              <div className="text-sm text-gray-500">Port</div>
            </div>
            <div>
              <div className="text-lg font-semibold font-mono text-sm">
                {appCode.buildConfig.buildCommand}
              </div>
              <div className="text-sm text-gray-500">Build Command</div>
            </div>
            <div>
              <div className="text-lg font-semibold font-mono text-sm">
                {appCode.buildConfig.startCommand}
              </div>
              <div className="text-sm text-gray-500">Start Command</div>
            </div>
            <div>
              <div className="text-lg font-semibold">
                {validation.lastValidated ? 
                  new Date(validation.lastValidated).toLocaleDateString() : 
                  'Never'
                }
              </div>
              <div className="text-sm text-gray-500">Last Validated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Validation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Code Quality</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getValidationIcon(validationStatus)}
              <span className={`font-medium ${getValidationColor(validationStatus)}`}>
                {validationStatus === 'success' ? 'All checks passed' : 
                 validationStatus === 'warning' ? 'Warnings found' : 'Errors found'}
              </span>
            </div>
            <Badge variant={validationStatus === 'success' ? 'default' : 'destructive'}>
              {totalIssues} {totalIssues === 1 ? 'issue' : 'issues'}
            </Badge>
          </div>
          
          {totalIssues > 0 && (
            <div className="space-y-3">
              {validation.buildErrors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Build Errors ({validation.buildErrors.length})
                  </h4>
                  <div className="space-y-1">
                    {validation.buildErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {error}
                      </div>
                    ))}
                    {validation.buildErrors.length > 3 && (
                      <div className="text-sm text-gray-500">
                        +{validation.buildErrors.length - 3} more errors
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {validation.runtimeErrors.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-600 dark:text-red-400 mb-2">
                    Runtime Errors ({validation.runtimeErrors.length})
                  </h4>
                  <div className="space-y-1">
                    {validation.runtimeErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {validation.lintErrors.length > 0 && (
                <div>
                  <h4 className="font-medium text-yellow-600 dark:text-yellow-400 mb-2">
                    Lint Warnings ({validation.lintErrors.length})
                  </h4>
                  <div className="space-y-1">
                    {validation.lintErrors.slice(0, 3).map((error, index) => (
                      <div key={index} className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {validation.addedDependencies.length > 0 && (
            <div>
              <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                Auto-added Dependencies ({validation.addedDependencies.length})
              </h4>
              <div className="flex flex-wrap gap-1">
                {validation.addedDependencies.map((dep, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 