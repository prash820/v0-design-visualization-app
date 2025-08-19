'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import { 
  Users, 
  Zap, 
  TrendingUp, 
  Clock, 
  Server, 
  Database,
  Activity,
  Target,
  ArrowUpDown,
  CheckCircle,
  AlertTriangle,
  Info,
  DollarSign,
  BarChart3
} from 'lucide-react';

interface PerformanceProfile {
  concurrentUsers: {
    baseline: number;
    peak: number;
    burst: number;
  };
  responseTime: {
    p50: string;
    p95: string;
    p99: string;
  };
  throughput: {
    requestsPerSecond: number;
    dataTransferGB: number;
  };
  availability: string;
}

interface AutoScalingPlan {
  enabled: boolean;
  scalingPolicy: 'horizontal' | 'vertical' | 'hybrid';
  triggers: Array<{
    type: string;
    threshold: number;
    action: string;
    description: string;
  }>;
  limits: {
    minInstances: number;
    maxInstances: number;
    targetCPUUtilization: number;
    targetMemoryUtilization: number;
  };
  cooldownPeriod: number;
  estimatedCostImpact: string;
}

interface ScalingTier {
  name: string;
  concurrentUsers: number;
  monthlyCost: number;
  features: string[];
  autoScaling: boolean;
  estimatedTraffic: {
    dailyRequests: number;
    peakRequestsPerSecond: number;
  };
}

interface InfrastructureTier {
  name: string;
  description: string;
  costBreakdown: {
    resources: Array<{
      service: string;
      resource: string;
      estimatedMonthlyCost: number;
      costCalculation: string;
      notes: string;
    }>;
    totalMonthlyCost: number;
    costNotes: string[];
  };
  maintenanceLevel: 'high' | 'medium' | 'low';
  estimatedMonthlyCost: number;
  pros: string[];
  cons: string[];
  performanceProfile: PerformanceProfile;
  autoScalingPlan: AutoScalingPlan;
  scalingTiers: ScalingTier[];
  isDetailed?: boolean;
  terraformCode?: string;
  architectureDiagram?: string;
}

interface InfrastructureOptions {
  lowCost: InfrastructureTier;
  mediumCost: InfrastructureTier;
  highCost: InfrastructureTier;
}

interface EnhancedInfrastructureTiersProps {
  jobId: string;
  onTierSelected?: (tier: InfrastructureTier) => void;
}

export function EnhancedInfrastructureTiers({ jobId, onTierSelected }: EnhancedInfrastructureTiersProps) {
  const [infrastructureTiers, setInfrastructureTiers] = useState<InfrastructureOptions | null>(null);
  const [selectedTier, setSelectedTier] = useState<'lowCost' | 'mediumCost' | 'highCost'>('lowCost');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatingDetails, setGeneratingDetails] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkJobStatus();
  }, [jobId]);

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
        
        toast({
          title: "Infrastructure Tiers Generated!",
          description: "Review the options below and select a tier to generate detailed infrastructure.",
        });
      } else if (job.status === 'failed') {
        setError(job.error || 'Infrastructure generation failed');
        setLoading(false);
      } else if (job.status === 'processing') {
        // Update progress based on job progress
        if (job.progress) {
          setGenerationProgress(job.progress);
        }
        // Continue polling
        setTimeout(checkJobStatus, 5000); // Increased from 2s to 5s
      } else if (job.status === 'completed') {
        // Job completed, stop polling
        setLoading(false);
      }
    } catch (error: any) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleGenerateDetails = async () => {
    if (!infrastructureTiers) return;

    setGeneratingDetails(true);
    try {
      const response = await authenticatedFetch('/api/iac/generate-detailed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          tierType: selectedTier,
          prompt: infrastructureTiers[selectedTier].description
        })
      });

      if (response.ok) {
        toast({
          title: "Details Generation Started",
          description: "Generating detailed Terraform code and architecture diagram...",
        });
        
        // Start polling for completion
        pollDetailedGeneration();
      } else {
        throw new Error('Failed to start detailed generation');
      }
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setGeneratingDetails(false);
    }
  };

    const pollDetailedGeneration = async () => {
    let attempts = 0;
    const maxAttempts = 120; // 10 minutes max (120 * 5 seconds)
    setGeneratingDetails(true); // Keep the button in loading state

    const poll = async () => {
      try {
        attempts++;
        const response = await authenticatedFetch(`/api/iac/status/${jobId}`);
        const job = await response.json();

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

        console.log('Job status:', job.status);
        console.log('Job progress:', job.progress);
        console.log('Parsed result:', parsedResult);
        console.log('Selected tier:', selectedTier);
        
        if (job.status === 'completed') {
          console.log('Job completed, checking for selectedTier...');
          setGeneratingDetails(false); // Stop loading state
          
          // Check if we have the detailed infrastructure data
          if (parsedResult?.selectedTier?.terraformCode) {
            console.log('Detailed infrastructure generated successfully!');
            
            // Update the selected tier with detailed information
            setInfrastructureTiers(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                [selectedTier]: {
                  ...prev[selectedTier],
                  ...parsedResult.selectedTier,
                  isDetailed: true
                }
              };
            });

            toast({
              title: "Infrastructure Generated Successfully!",
              description: "Redirecting to project details page...",
            });
            
            console.log('Scheduling redirect...');
            // Auto-navigate to project details after a short delay
            setTimeout(() => {
              console.log('Executing redirect...');
              if (onTierSelected && infrastructureTiers) {
                console.log('Calling onTierSelected with:', infrastructureTiers[selectedTier]);
                onTierSelected(infrastructureTiers[selectedTier]);
              } else {
                console.log('onTierSelected or infrastructureTiers not available');
              }
            }, 2000);
            return;
          } else {
            console.log('Job completed but no terraform code found, continuing to poll...');
            // Job says completed but no terraform code yet, continue polling
            if (attempts < maxAttempts) {
              setTimeout(poll, 5000);
            } else {
              setGeneratingDetails(false);
              toast({
                title: "Generation Incomplete",
                description: "Infrastructure generation did not complete properly.",
                variant: "destructive"
              });
            }
            return;
          }
        } else if (job.status === 'processing') {
          console.log('Job still processing, attempt:', attempts, 'progress:', job.progress);
          
          // Update progress state
          const progressPercent = job.progress || 0;
          setGenerationProgress(progressPercent);
          setGenerationStatus(`Processing... ${progressPercent}% complete`);
          
          // Show progress toast every 15 attempts (75 seconds)
          if (attempts % 15 === 0) {
            toast({
              title: "Generation in Progress",
              description: `Creating detailed infrastructure... ${progressPercent}% complete.`,
            });
          }
          
          // Continue polling
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            setGeneratingDetails(false);
            toast({
              title: "Generation Timeout",
              description: "Detailed generation is taking longer than expected.",
              variant: "destructive"
            });
          }
        } else if (job.status === 'failed') {
          console.log('Job failed:', job.error);
          setGeneratingDetails(false);
          toast({
            title: "Generation Failed",
            description: job.error || "Failed to generate detailed infrastructure.",
            variant: "destructive"
          });
        } else {
          // Unknown status, continue polling
          console.log('Unknown job status:', job.status);
          if (attempts < maxAttempts) {
            setTimeout(poll, 5000);
          } else {
            setGeneratingDetails(false);
            toast({
              title: "Generation Timeout",
              description: "Detailed generation is taking longer than expected.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error polling detailed generation:', error);
        setGeneratingDetails(false); // Stop loading state on error
        toast({
          title: "Polling Error",
          description: "Error checking generation status.",
          variant: "destructive"
        });
      }
    };

    poll();
  };

  const handleDeploy = async () => {
    if (!infrastructureTiers) return;

    setDeploying(true);
    try {
      const response = await authenticatedFetch('/api/iac/deploy-tier', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobId,
          tierType: selectedTier,
          prompt: infrastructureTiers[selectedTier].description
        })
      });

      if (response.ok) {
        toast({
          title: "Deployment Started",
          description: "Your infrastructure is being deployed to AWS...",
        });
        onTierSelected?.(infrastructureTiers[selectedTier]);
      } else {
        throw new Error('Failed to start deployment');
      }
    } catch (error: any) {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setDeploying(false);
    }
  };

  const getMaintenanceColor = (level: string) => {
    switch (level) {
      case 'low': return 'text-green-600 bg-green-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'high': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getScalingPolicyIcon = (policy: string) => {
    switch (policy) {
      case 'horizontal': return <TrendingUp className="h-4 w-4" />;
      case 'vertical': return <ArrowUpDown className="h-4 w-4" />;
      case 'hybrid': return <Activity className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg font-medium mb-2">Generating Infrastructure Options...</p>
            <p className="text-sm text-gray-600 mb-4">This may take a few minutes. We're analyzing your requirements and creating cost-optimized solutions.</p>
            
            {/* Progress Bar */}
            <div className="w-64 mx-auto mb-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">{generationProgress}% Complete</p>
            </div>
            
            <div className="flex justify-center space-x-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-red-600">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4" />
            <p>Error: {error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!infrastructureTiers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center text-gray-600">
            <Info className="h-12 w-12 mx-auto mb-4" />
            <p>No infrastructure tiers available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tiers = infrastructureTiers;
  const currentTier = tiers[selectedTier];

  return (
    <div className="space-y-6">
      {/* Success Notification */}
      {infrastructureTiers && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Infrastructure Tiers Ready!</h3>
              <p className="text-green-700 text-sm">Review the options below, select a tier, and click "Generate Details" to create your infrastructure</p>
            </div>
          </div>
        </div>
      )}

      {/* Tier Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(['lowCost', 'mediumCost', 'highCost'] as const).map((tierKey) => {
          const tier = tiers[tierKey];
          const isSelected = selectedTier === tierKey;
          
          return (
            <Card 
              key={tierKey}
              className={`cursor-pointer transition-all ${
                isSelected ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedTier(tierKey)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tier.name}</CardTitle>
                  <Badge className={getMaintenanceColor(tier.maintenanceLevel)}>
                    {tier.maintenanceLevel} maintenance
                  </Badge>
                </div>
                <CardDescription className="text-sm">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-green-600">
                    ${tier.estimatedMonthlyCost.toFixed(2)}
                  </span>
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span>{tier.performanceProfile.concurrentUsers.baseline.toLocaleString()} concurrent users</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-4 w-4 text-green-500" />
                    <span>{tier.autoScalingPlan.enabled ? 'Auto-scaling enabled' : 'Manual scaling'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span>{tier.performanceProfile.responseTime.p50} response time</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Tier Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5" />
            {currentTier.name} - Detailed Analysis
          </CardTitle>
          <CardDescription>
            Performance profile, auto-scaling capabilities, and scaling tiers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="scaling">Auto-Scaling</TabsTrigger>
              <TabsTrigger value="tiers">Scaling Tiers</TabsTrigger>
              <TabsTrigger value="costs">Costs</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Pros</h4>
                  <ul className="space-y-2">
                    {currentTier.pros.map((pro, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Cons</h4>
                  <ul className="space-y-2">
                    {currentTier.cons.map((con, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="performance" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Concurrent Users
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Baseline</span>
                        <span>{currentTier.performanceProfile.concurrentUsers.baseline.toLocaleString()}</span>
                      </div>
                      <Progress value={currentTier.performanceProfile.concurrentUsers.baseline / 1000} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Peak</span>
                        <span>{currentTier.performanceProfile.concurrentUsers.peak.toLocaleString()}</span>
                      </div>
                      <Progress value={currentTier.performanceProfile.concurrentUsers.peak / 1000} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Burst</span>
                        <span>{currentTier.performanceProfile.concurrentUsers.burst.toLocaleString()}</span>
                      </div>
                      <Progress value={currentTier.performanceProfile.concurrentUsers.burst / 1000} className="h-2" />
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Response Times
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">P50 (Median)</span>
                      <span className="font-medium">{currentTier.performanceProfile.responseTime.p50}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">P95</span>
                      <span className="font-medium">{currentTier.performanceProfile.responseTime.p95}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">P99</span>
                      <span className="font-medium">{currentTier.performanceProfile.responseTime.p99}</span>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <div className="flex items-center gap-2 text-sm text-blue-800">
                      <BarChart3 className="h-4 w-4" />
                      <span>Throughput: {currentTier.performanceProfile.throughput.requestsPerSecond} req/s</span>
                    </div>
                    <div className="text-sm text-blue-700 mt-1">
                      Availability: {currentTier.performanceProfile.availability}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="scaling" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    {getScalingPolicyIcon(currentTier.autoScalingPlan.scalingPolicy)}
                    Auto-Scaling Plan
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={currentTier.autoScalingPlan.enabled ? "default" : "secondary"}>
                        {currentTier.autoScalingPlan.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                      <span className="text-sm capitalize">{currentTier.autoScalingPlan.scalingPolicy} scaling</span>
                    </div>
                    <div className="text-sm space-y-1">
                      <div>Min Instances: {currentTier.autoScalingPlan.limits.minInstances}</div>
                      <div>Max Instances: {currentTier.autoScalingPlan.limits.maxInstances}</div>
                      <div>Target CPU: {currentTier.autoScalingPlan.limits.targetCPUUtilization}%</div>
                      <div>Cooldown: {currentTier.autoScalingPlan.cooldownPeriod}s</div>
                    </div>
                    <div className="text-sm text-green-600">
                      Cost Impact: {currentTier.autoScalingPlan.estimatedCostImpact}
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Scaling Triggers</h4>
                  <div className="space-y-2">
                    {currentTier.autoScalingPlan.triggers.map((trigger, index) => (
                      <div key={index} className="p-3 border rounded-md">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {trigger.type.toUpperCase()}
                          </Badge>
                          <span className="text-sm font-medium">{trigger.threshold}%</span>
                        </div>
                        <p className="text-sm text-gray-600">{trigger.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="tiers" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentTier.scalingTiers.map((tier, index) => (
                  <Card key={index} className="border-2 border-gray-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">{tier.name}</CardTitle>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">{tier.concurrentUsers.toLocaleString()} users</span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="text-2xl font-bold text-green-600">
                        ${tier.monthlyCost.toFixed(2)}
                        <span className="text-sm font-normal text-gray-500">/month</span>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <strong>Traffic:</strong> {tier.estimatedTraffic.dailyRequests.toLocaleString()} requests/day
                        </div>
                        <div className="text-sm">
                          <strong>Peak:</strong> {tier.estimatedTraffic.peakRequestsPerSecond} req/s
                        </div>
                      </div>
                      <div className="space-y-1">
                        {tier.features.map((feature, featureIndex) => (
                          <div key={featureIndex} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-3 w-3 text-green-500" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="costs" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Breakdown
                </h4>
                <div className="space-y-3">
                  {currentTier.costBreakdown.resources.map((resource, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                      <div>
                        <div className="font-medium">{resource.service} - {resource.resource}</div>
                        <div className="text-sm text-gray-600">{resource.costCalculation}</div>
                        {resource.notes && (
                          <div className="text-xs text-blue-600 mt-1">{resource.notes}</div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${resource.estimatedMonthlyCost.toFixed(2)}</div>
                        <div className="text-sm text-gray-500">/month</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-green-800">Total Monthly Cost</span>
                    <span className="text-2xl font-bold text-green-600">
                      ${currentTier.costBreakdown.totalMonthlyCost.toFixed(2)}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-green-700">
                    {currentTier.costBreakdown.costNotes.join(' • ')}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Progress Indicator */}
          {generatingDetails && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Generating Infrastructure</span>
                <span className="text-sm text-blue-600">{generationProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${generationProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-blue-600 mt-2">{generationStatus}</p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {!currentTier.isDetailed ? (
              <>
                <Button 
                  onClick={handleGenerateDetails}
                  disabled={generatingDetails}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  size="lg"
                >
                  {generatingDetails ? '🔄 Generating Infrastructure (Please Wait)...' : '🚀 Generate Infrastructure'}
                </Button>
                <Button 
                  onClick={() => onTierSelected?.(currentTier)}
                  className="px-8 py-3"
                  size="lg"
                  variant="outline"
                  disabled={generatingDetails}
                >
                  📋 View Project Details
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleDeploy}
                  disabled={deploying}
                  className="px-8 py-3 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  {deploying ? 'Deploying...' : 'Deploy This Infrastructure'}
                </Button>
                <Button 
                  onClick={() => onTierSelected?.(currentTier)}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                  size="lg"
                >
                  📋 View Project Details
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 