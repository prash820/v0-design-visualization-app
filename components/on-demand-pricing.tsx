'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import { 
  Search, 
  DollarSign, 
  Zap, 
  Database, 
  Server,
  Loader2,
  Info
} from 'lucide-react';

interface PricingResult {
  service: string;
  region: string;
  pricing: any;
  estimatedMonthlyCost?: number;
  usage?: any;
}

export function OnDemandPricing() {
  const [serviceName, setServiceName] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PricingResult | null>(null);
  const { toast } = useToast();

  const handleGetPricing = async () => {
    if (!serviceName.trim()) {
      toast({
        title: "Service Required",
        description: "Please enter a service name",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/pricing/on-demand', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: serviceName.trim(),
          region
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data);
        toast({
          title: "Pricing Retrieved",
          description: `Found pricing for ${serviceName}`,
        });
      } else {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get pricing');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || 'Failed to get pricing',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(6)}`;
    }
    return `$${price.toFixed(4)}`;
  };

  const getServiceIcon = (service: string) => {
    const serviceLower = service.toLowerCase();
    if (serviceLower.includes('ec2') || serviceLower.includes('instance')) return <Server className="h-4 w-4" />;
    if (serviceLower.includes('s3') || serviceLower.includes('storage')) return <Database className="h-4 w-4" />;
    if (serviceLower.includes('lambda') || serviceLower.includes('function')) return <Zap className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Get Pricing for Any AWS Service
          </CardTitle>
          <CardDescription>
            Enter any AWS service name to get real-time pricing information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="service">Service Name</Label>
              <Input
                id="service"
                placeholder="e.g., EC2, S3, Lambda, SageMaker..."
                value={serviceName}
                onChange={(e) => setServiceName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGetPricing()}
              />
            </div>
            <div>
              <Label htmlFor="region">Region</Label>
              <Input
                id="region"
                placeholder="us-east-1"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleGetPricing}
                disabled={loading || !serviceName.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting Pricing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Get Pricing
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-md">
            <div className="flex items-start gap-2">
              <Info className="h-4 w-4 mt-0.5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-800">Examples:</p>
                <p className="text-blue-700">EC2, S3, Lambda, DynamoDB, RDS, API Gateway, SageMaker, Redshift, ECS, EKS, etc.</p>
                <p className="text-blue-700 mt-1">Pricing will be fetched on-demand from AWS API if not in cache.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getServiceIcon(result.service)}
              Pricing for {result.service}
            </CardTitle>
            <CardDescription>
              Region: {result.region} • Fetched on-demand
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.estimatedMonthlyCost !== undefined && (
              <div className="bg-green-50 p-4 rounded-md">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-800">
                    Estimated Monthly Cost: {formatPrice(result.estimatedMonthlyCost)}
                  </span>
                </div>
                {result.usage && (
                  <div className="mt-2 text-sm text-green-700">
                    <p>Based on usage: {JSON.stringify(result.usage)}</p>
                  </div>
                )}
              </div>
            )}

            <div>
              <h4 className="font-medium mb-3">Available Pricing Tiers:</h4>
              <div className="space-y-3">
                {Object.entries(result.pricing).map(([usageType, pricing]: [string, any]) => (
                  <div key={usageType} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{usageType}</span>
                      <Badge variant="outline">
                        {pricing.unit || 'per unit'}
                      </Badge>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(pricing.pricePerUnit)}
                    </div>
                    {pricing.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {pricing.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {Object.keys(result.pricing).length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No pricing information available for this service</p>
                <p className="text-sm">This service might be free tier or require different pricing model</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 