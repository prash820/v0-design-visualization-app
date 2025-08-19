'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Copy, ExternalLink, Check, Globe, Server, Database, Zap } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface DeploymentEndpointsProps {
  endpoints: any
  deploymentUrl?: string
}

export function DeploymentEndpoints({ endpoints, deploymentUrl }: DeploymentEndpointsProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedUrl(label)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      })
      setTimeout(() => setCopiedUrl(null), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive"
      })
    }
  }

  const openUrl = (url: string) => {
    window.open(url, '_blank')
  }

  if (!endpoints) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Deployment Endpoints
          </CardTitle>
          <CardDescription>
            No endpoints available yet. The deployment may still be in progress.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const endpointCategories = {
    primary: {
      title: 'Primary Endpoints',
      icon: Globe,
      endpoints: {
        primary: endpoints.primary,
        deploymentUrl: deploymentUrl
      }
    },
    api: {
      title: 'API Endpoints',
      icon: Server,
      endpoints: {
        api: endpoints.api,
        websocket: endpoints.websocket
      }
    },
    infrastructure: {
      title: 'Infrastructure',
      icon: Database,
      endpoints: {
        database: endpoints.database,
        redis: endpoints.redis,
        loadBalancer: endpoints.loadBalancer
      }
    },
    cdn: {
      title: 'CDN & Distribution',
      icon: Zap,
      endpoints: {
        frontend: endpoints.frontend,
        cloudfront: endpoints.cloudfront
      }
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Deployment Endpoints
          </CardTitle>
          <CardDescription>
            Your application has been successfully deployed. Use these endpoints to access your services.
          </CardDescription>
        </CardHeader>
      </Card>

      {Object.entries(endpointCategories).map(([category, config]) => {
        const Icon = config.icon
        const validEndpoints = Object.entries(config.endpoints).filter(([_, url]) => url)
        
        if (validEndpoints.length === 0) return null

        return (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Icon className="h-5 w-5" />
                {config.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {validEndpoints.map(([key, url]) => (
                <div key={key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(url, key)}
                        className="h-8"
                      >
                        {copiedUrl === key ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openUrl(url)}
                        className="h-8"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      value={url}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Badge variant="secondary" className="text-xs">
                      {url.startsWith('https://') ? 'HTTPS' : url.startsWith('wss://') ? 'WSS' : 'TCP'}
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )
      })}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Common actions for your deployed application
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {endpoints.primary && (
            <Button
              variant="outline"
              onClick={() => openUrl(endpoints.primary)}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              Open Application
            </Button>
          )}
          {endpoints.api && (
            <Button
              variant="outline"
              onClick={() => openUrl(endpoints.api)}
              className="flex items-center gap-2"
            >
              <Server className="h-4 w-4" />
              Test API
            </Button>
          )}
          {endpoints.frontend && (
            <Button
              variant="outline"
              onClick={() => openUrl(endpoints.frontend)}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              View Frontend
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 