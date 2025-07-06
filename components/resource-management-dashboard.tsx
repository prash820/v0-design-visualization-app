'use client';

import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DollarSign, 
  Server, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Clock,
  ExternalLink,
  Trash2,
  Info,
  BarChart3
} from 'lucide-react';
import CostBreakdownChart from './cost-breakdown-chart';

interface Resource {
  projectId: string;
  workspaceType: string;
  source: string;
  deploymentStatus: string;
  resourceCount: number;
  resourceTypes: Record<string, number>;
  outputs: Record<string, any>;
  hasLiveResources: boolean;
  estimatedMonthlyCost: number;
  createdAt: string;
  ageInHours: number;
  ageInDays: number;
  actions: {
    details: string;
    cleanup: string;
    console: string | null;
  };
}

interface ResourcesOverview {
  resources: Resource[];
  summary: {
    total: number;
    active: number;
    provisioned: number;
    deploymentFailed: number;
    orphaned: number;
    incomplete: number;
  };
  costEstimate: {
    monthly: number;
    breakdown: Record<string, number>;
  };
  lastUpdated: string;
}

const statusConfig = {
  active: {
    label: 'Active',
    icon: CheckCircle,
    color: 'bg-green-100 text-green-800 border-green-200',
    urgency: 'none'
  },
  deployment_failed: {
    label: 'Deployment Failed',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    urgency: 'high'
  },
  provisioned_no_app: {
    label: 'Provisioned (No App)',
    icon: AlertTriangle,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    urgency: 'medium'
  },
  orphaned: {
    label: 'Orphaned',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    urgency: 'high'
  },
  incomplete: {
    label: 'Incomplete',
    icon: Clock,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    urgency: 'low'
  },
  corrupted_state: {
    label: 'Corrupted State',
    icon: XCircle,
    color: 'bg-red-100 text-red-800 border-red-200',
    urgency: 'high'
  }
};

export default function ResourceManagementDashboard() {
  const [overview, setOverview] = useState<ResourcesOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshKey, setRefreshKey] = useState(0);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/magic/resources/overview');
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setOverview(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
    // Refresh every 30 seconds
    const interval = setInterval(fetchOverview, 30000);
    return () => clearInterval(interval);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleCleanup = async (projectId: string) => {
    if (!confirm(`Are you sure you want to cleanup resources for ${projectId}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/magic/cleanup/${projectId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Cleanup initiated successfully');
        handleRefresh();
      } else {
        const error = await response.json();
        alert(`Cleanup failed: ${error.error || error.message}`);
      }
    } catch (err: any) {
      alert(`Cleanup failed: ${err.message}`);
    }
  };

  const getFilteredResources = (category: string) => {
    if (!overview) return [];
    
    switch (category) {
      case 'active':
        return overview.resources.filter(r => r.deploymentStatus === 'active');
      case 'failed':
        return overview.resources.filter(r => 
          r.deploymentStatus === 'deployment_failed' || 
          r.deploymentStatus === 'corrupted_state'
        );
      case 'orphaned':
        return overview.resources.filter(r => 
          r.deploymentStatus === 'provisioned_no_app' || 
          r.deploymentStatus === 'orphaned'
        );
      case 'costly':
        return overview.resources.filter(r => r.estimatedMonthlyCost > 0);
      case 'incomplete':
        return overview.resources.filter(r => r.deploymentStatus === 'incomplete');
      default:
        return overview.resources;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 mb-2">Failed to load resource data</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Info className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">No resource data available</p>
      </div>
    );
  }

  const filteredResources = getFilteredResources(selectedCategory);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage your AWS resources and costs
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          Refresh
        </Button>
      </div>

      {/* Cost Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview?.costEstimate.monthly || 0}</div>
            <p className="text-xs text-muted-foreground">
              Estimated AWS charges
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.summary.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              All workspaces
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Apps</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {overview?.summary.active || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Working deployments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {overview ? (overview.summary.deploymentFailed + overview.summary.orphaned) : 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown Chart */}
      {overview && Object.keys(overview.costEstimate.breakdown).length > 0 && (
        <div className="grid gap-6 md:grid-cols-2">
          <CostBreakdownChart 
            costBreakdown={overview.costEstimate.breakdown}
            totalCost={overview.costEstimate.monthly}
          />
          
          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Resources with Issues</span>
                <Badge variant="destructive">
                  {overview.summary.deploymentFailed + overview.summary.orphaned}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Active Deployments</span>
                <Badge variant="secondary">
                  {overview.summary.active}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Monthly Cost</span>
                <Badge variant="outline">
                  ${overview.costEstimate.monthly}
                </Badge>
              </div>
              <div className="pt-2 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setSelectedCategory('costly')}
                >
                  View Costly Resources
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resource List with Filtering */}
      <Card>
        <CardHeader>
          <CardTitle>Resources</CardTitle>
          <CardDescription>
            Filter and manage your deployed resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">
                All ({overview?.summary.total || 0})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({overview?.summary.active || 0})
              </TabsTrigger>
              <TabsTrigger value="failed">
                Failed ({overview?.summary.deploymentFailed || 0})
              </TabsTrigger>
              <TabsTrigger value="orphaned">
                Orphaned ({overview?.summary.orphaned || 0})
              </TabsTrigger>
              <TabsTrigger value="costly">
                Costly ({overview?.resources.filter(r => r.estimatedMonthlyCost > 0).length || 0})
              </TabsTrigger>
              <TabsTrigger value="incomplete">
                Incomplete ({overview?.summary.incomplete || 0})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={selectedCategory} className="mt-6">
              {filteredResources.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No resources found in this category
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredResources.map((resource) => (
                    <ResourceCard 
                      key={resource.projectId} 
                      resource={resource} 
                      onCleanup={handleCleanup}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Last Updated */}
      <div className="text-xs text-muted-foreground text-center">
        Last updated: {overview ? new Date(overview.lastUpdated).toLocaleString() : 'Never'}
      </div>
    </div>
  );
}

function ResourceCard({ 
  resource, 
  onCleanup 
}: { 
  resource: Resource; 
  onCleanup: (projectId: string) => void;
}) {
  const config = statusConfig[resource.deploymentStatus as keyof typeof statusConfig] || statusConfig.incomplete;
  const StatusIcon = config.icon;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="font-semibold">{resource.projectId}</h3>
            <Badge className={config.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {config.label}
            </Badge>
            <Badge variant="outline">
              {resource.source}
            </Badge>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3">
            <div>
              <span className="font-medium">Resources:</span> {resource.resourceCount}
            </div>
            <div>
              <span className="font-medium">Cost:</span> ${resource.estimatedMonthlyCost}/month
            </div>
            <div>
              <span className="font-medium">Age:</span> {resource.ageInDays} days
            </div>
            <div>
              <span className="font-medium">Type:</span> {resource.workspaceType}
            </div>
          </div>

          {resource.resourceCount > 0 && (
            <div className="text-xs text-muted-foreground mb-3">
              <span className="font-medium">Resource Types:</span>{' '}
              {Object.entries(resource.resourceTypes).map(([type, count]) => (
                `${type} (${count})`
              )).join(', ')}
            </div>
          )}

          {resource.outputs.s3_website_url && (
            <div className="mb-3">
              <a 
                href={resource.outputs.s3_website_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                View Live App
              </a>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {resource.actions.console && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(resource.actions.console!, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
          
          {resource.hasLiveResources && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onCleanup(resource.projectId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {config.urgency === 'high' && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-800">
              {resource.deploymentStatus === 'deployment_failed' 
                ? 'This deployment failed but resources are still provisioned and incurring costs.'
                : 'These orphaned resources are incurring ongoing AWS costs.'
              } Consider cleaning up if not needed.
            </div>
          </div>
        </div>
      )}
    </Card>
  );
} 