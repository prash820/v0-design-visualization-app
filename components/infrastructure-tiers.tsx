'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, AlertCircle, DollarSign, Settings, Zap, Shield } from 'lucide-react';
import Mermaid from './mermaid-component';
import { authenticatedFetch } from '@/lib/auth';

interface ResourceCost {
  service: string;
  resource: string;
  estimatedMonthlyCost: number;
  costCalculation: string;
  notes: string;
}

interface CostBreakdown {
  resources: ResourceCost[];
  totalMonthlyCost: number;
  costNotes: string[];
}

interface InfrastructureTier {
  name: string;
  description: string;
  terraformCode?: string; // Optional - only generated after selection
  architectureDiagram?: string; // Optional - only generated after selection
  costBreakdown: CostBreakdown;
  maintenanceLevel: 'high' | 'medium' | 'low';
  estimatedMonthlyCost: number;
  pros: string[];
  cons: string[];
  isDetailed?: boolean; // Flag to indicate if detailed code has been generated
}

interface InfrastructureOptions {
  lowCost: InfrastructureTier;
  mediumCost: InfrastructureTier;
  highCost: InfrastructureTier;
}

interface InfrastructureTiersProps {
  jobId: string;
  onTierSelected?: (tierIndex: number) => void;
}

const getMaintenanceIcon = (level: string) => {
  switch (level) {
    case 'high':
      return <Settings className="h-4 w-4 text-orange-500" />;
    case 'medium':
      return <Zap className="h-4 w-4 text-blue-500" />;
    case 'low':
      return <Shield className="h-4 w-4 text-green-500" />;
    default:
      return <Settings className="h-4 w-4" />;
  }
};

const getMaintenanceColor = (level: string) => {
  switch (level) {
    case 'high':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    case 'medium':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'low':
      return 'bg-green-100 text-green-800 border-green-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getMaintenanceText = (level: string) => {
  switch (level) {
    case 'high':
      return 'High Maintenance';
    case 'medium':
      return 'Medium Maintenance';
    case 'low':
      return 'Low Maintenance';
    default:
      return 'Unknown';
  }
};

export function InfrastructureTiers({ jobId, onTierSelected }: InfrastructureTiersProps) {
  const [infrastructureTiers, setInfrastructureTiers] = useState<InfrastructureOptions | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deploymentStatus, setDeploymentStatus] = useState<string | null>(null);
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [detailedJobId, setDetailedJobId] = useState<string | null>(null);

  useEffect(() => {
    const checkJobStatus = async () => {
      try {
        const response = await authenticatedFetch(`/api/iac/status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch job status');
        }
        
        const job = await response.json();
        
        // Parse the result if it's a string
        let parsedResult = job.result;
        if (typeof job.result === 'string') {
          try {
            parsedResult = JSON.parse(job.result);
          } catch (parseError) {
            console.error('Failed to parse job result:', parseError);
            setError('Failed to parse infrastructure data');
            setLoading(false);
            return;
          }
        }
        
        if (job.status === 'completed' && parsedResult?.infrastructureTiers) {
          setInfrastructureTiers(parsedResult.infrastructureTiers);
          setLoading(false);
        } else if (job.status === 'failed') {
          setError(job.error || 'Job failed');
          setLoading(false);
        } else {
          // Job still processing, check again in 2 seconds
          setTimeout(checkJobStatus, 5000); // Increased from 2s to 5s
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    checkJobStatus();
  }, [jobId]);

  const handleTierSelection = (tierIndex: number) => {
    setSelectedTier(tierIndex);
    onTierSelected?.(tierIndex);
  };

  const handleGenerateDetails = async () => {
    if (selectedTier === null || !infrastructureTiers) return;

    setGeneratingDetails(true);
    
    try {
      const tierKeys = ['lowCost', 'mediumCost', 'highCost'] as const;
      const tierType = tierKeys[selectedTier];
      
      const response = await authenticatedFetch('/api/iac/generate-detailed', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          tierType,
          prompt: infrastructureTiers[tierType].description
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start detailed generation');
      }

      const result = await response.json();
      setDetailedJobId(result.jobId);
      
      // Poll for completion
      pollDetailedGeneration(result.jobId);
      
    } catch (err) {
      console.error('Error generating details:', err);
      setGeneratingDetails(false);
    }
  };

  const pollDetailedGeneration = async (detailedJobId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes max
    
    const poll = async () => {
      try {
        attempts++;
        
        const response = await authenticatedFetch(`/api/iac/status/${detailedJobId}`);
        
        if (response.ok) {
          const job = await response.json();
          
          if (job.status === 'completed') {
            // Parse the result if it's a string
            let parsedResult = job.result;
            if (typeof job.result === 'string') {
              try {
                parsedResult = JSON.parse(job.result);
              } catch (parseError) {
                console.error('Failed to parse job result:', parseError);
                return;
              }
            }
            
            // Update the infrastructure tiers with detailed information
            if (infrastructureTiers && selectedTier !== null) {
              const tierKeys = ['lowCost', 'mediumCost', 'highCost'] as const;
              const tierType = tierKeys[selectedTier];
              
              const updatedTiers = {
                ...infrastructureTiers,
                [tierType]: {
                  ...infrastructureTiers[tierType],
                  ...parsedResult.selectedTier,
                  isDetailed: true
                }
              };
              
              setInfrastructureTiers(updatedTiers);
            }
            
            setGeneratingDetails(false);
            setDetailedJobId(null);
            return;
          } else if (job.status === 'failed') {
            throw new Error(job.error || 'Detailed generation failed');
          }
        }

        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          throw new Error('Detailed generation timeout');
        }
      } catch (error) {
        console.error('Error polling detailed generation:', error);
        setGeneratingDetails(false);
        setDetailedJobId(null);
      }
    };

    poll();
  };

  const handleDeploy = async () => {
    if (selectedTier === null) return;

    setDeploying(true);
    setDeploymentStatus('Starting deployment...');

    try {
      const response = await authenticatedFetch('/api/iac/deploy-tier', {
        method: 'POST',
        body: JSON.stringify({
          jobId,
          selectedTierIndex: selectedTier
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start deployment');
      }

      const result = await response.json();
      setDeploymentStatus('Deployment started successfully! Check the deployment status for updates.');
      
      // You can implement polling here to track deployment progress
      
    } catch (err) {
      setDeploymentStatus(`Deployment failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDeploying(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span>Generating infrastructure tiers...</span>
        </div>
        <Progress value={33} className="w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error: {error}</AlertDescription>
      </Alert>
    );
  }

  if (!infrastructureTiers) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>No infrastructure tiers available</AlertDescription>
      </Alert>
    );
  }

  const tiers = [
    { key: 'lowCost', index: 0, tier: infrastructureTiers.lowCost, color: 'border-green-200 bg-green-50' },
    { key: 'mediumCost', index: 1, tier: infrastructureTiers.mediumCost, color: 'border-blue-200 bg-blue-50' },
    { key: 'highCost', index: 2, tier: infrastructureTiers.highCost, color: 'border-purple-200 bg-purple-50' }
  ];

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Choose Your Infrastructure</h2>
        <p className="text-muted-foreground">
          Select the infrastructure tier that best fits your needs and budget
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map(({ key, index, tier, color }) => (
          <Card 
            key={key}
            className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTier === index ? 'ring-2 ring-blue-500' : ''
            } ${color}`}
            onClick={() => handleTierSelection(index)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{tier.name}</CardTitle>
                <Badge variant="outline" className={getMaintenanceColor(tier.maintenanceLevel)}>
                  {getMaintenanceIcon(tier.maintenanceLevel)}
                  <span className="ml-1">{getMaintenanceText(tier.maintenanceLevel)}</span>
                </Badge>
              </div>
              <CardDescription>{tier.description}</CardDescription>
              
              <div className="flex items-center space-x-2 mt-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold text-green-600">
                  ${tier.estimatedMonthlyCost.toFixed(2)}
                </span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Pros */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                  Pros
                </h4>
                <ul className="text-sm space-y-1">
                  {tier.pros.map((pro, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-600 mr-1">•</span>
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Cons */}
              <div>
                <h4 className="font-semibold text-sm mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 text-orange-600 mr-1" />
                  Cons
                </h4>
                <ul className="text-sm space-y-1">
                  {tier.cons.map((con, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-orange-600 mr-1">•</span>
                      {con}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 my-4"></div>

              {/* Cost Breakdown */}
              <div>
                <h4 className="font-semibold text-sm mb-2">Cost Breakdown</h4>
                <div className="space-y-2">
                  {tier.costBreakdown.resources.map((resource, i) => (
                    <div key={i} className="flex justify-between items-start text-sm">
                      <div>
                        <div className="font-medium">{resource.service}</div>
                        <div className="text-muted-foreground text-xs">{resource.resource}</div>
                        <div className="text-muted-foreground text-xs">{resource.costCalculation}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${resource.estimatedMonthlyCost.toFixed(2)}</div>
                        <div className="text-muted-foreground text-xs">{resource.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Tier Details */}
      {selectedTier !== null && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Selected Infrastructure: {tiers[selectedTier].tier.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="architecture" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="architecture">Architecture</TabsTrigger>
                <TabsTrigger value="terraform">Terraform Code</TabsTrigger>
                <TabsTrigger value="costs">Detailed Costs</TabsTrigger>
              </TabsList>
              
                             <TabsContent value="architecture" className="mt-4">
                 <div className="border rounded-lg p-4 bg-gray-50">
                   {tiers[selectedTier].tier.architectureDiagram ? (
                     <Mermaid 
                       chart={tiers[selectedTier].tier.architectureDiagram}
                       className="w-full"
                     />
                   ) : (
                     <div className="text-center py-8">
                       <p className="text-yellow-600 mb-4">Architecture diagram not yet generated</p>
                       <p className="text-gray-500 text-sm">Click "Generate Details" to create the architecture diagram for this infrastructure tier.</p>
                     </div>
                   )}
                 </div>
               </TabsContent>
              
                             <TabsContent value="terraform" className="mt-4">
                 <div className="border rounded-lg p-4 bg-gray-900 text-green-400 font-mono text-sm overflow-x-auto">
                   {tiers[selectedTier].tier.terraformCode ? (
                     <pre>{tiers[selectedTier].tier.terraformCode}</pre>
                   ) : (
                     <div className="text-center py-8">
                       <p className="text-yellow-400 mb-4">Terraform code not yet generated</p>
                       <p className="text-gray-400 text-sm">Click "Generate Details" to create the Terraform code for this infrastructure tier.</p>
                     </div>
                   )}
                 </div>
               </TabsContent>
              
              <TabsContent value="costs" className="mt-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tiers[selectedTier].tier.costBreakdown.resources.map((resource, i) => (
                      <Card key={i}>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">{resource.service}</CardTitle>
                          <CardDescription className="text-xs">{resource.resource}</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="text-lg font-bold text-green-600">
                            ${resource.estimatedMonthlyCost.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {resource.costCalculation}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {resource.notes}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">Total Monthly Cost</span>
                        <span className="text-2xl font-bold text-green-600">
                          ${tiers[selectedTier].tier.costBreakdown.totalMonthlyCost.toFixed(2)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="space-y-2">
                    {tiers[selectedTier].tier.costBreakdown.costNotes.map((note, i) => (
                      <Alert key={i}>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-sm">{note}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 flex justify-center space-x-4">
              {!tiers[selectedTier].tier.isDetailed ? (
                <Button 
                  onClick={handleGenerateDetails}
                  disabled={generatingDetails}
                  className="px-8 py-2"
                  size="lg"
                >
                  {generatingDetails ? 'Generating Details...' : 'Generate Details'}
                </Button>
              ) : (
                <Button 
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="px-8 py-2"
                  size="lg"
                >
                  {deploying ? 'Deploying...' : 'Deploy This Infrastructure'}
                </Button>
              )}
            </div>
            
            {deploymentStatus && (
              <Alert className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{deploymentStatus}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 