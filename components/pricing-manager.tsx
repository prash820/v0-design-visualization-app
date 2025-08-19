'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { authenticatedFetch } from '@/lib/auth';
import { 
  RefreshCw, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Database,
  Server,
  Zap,
  Search
} from 'lucide-react';

interface PricingStatus {
  lastUpdated: string;
  isValid: boolean;
}

interface PricingData {
  EC2: Record<string, number>;
  S3: Record<string, number>;
  Lambda: Record<string, number>;
  DynamoDB: Record<string, number>;
  RDS: Record<string, number>;
  APIGateway: Record<string, number>;
}

export function PricingManager() {
  const [status, setStatus] = useState<PricingStatus | null>(null);
  const [pricingData, setPricingData] = useState<PricingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showOnDemand, setShowOnDemand] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPricingStatus();
    loadPricingData();
  }, []);

  const loadPricingStatus = async () => {
    try {
      const response = await authenticatedFetch('/api/pricing/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data.status);
      }
    } catch (error) {
      console.error('Error loading pricing status:', error);
    }
  };

  const loadPricingData = async () => {
    try {
      const response = await authenticatedFetch('/api/pricing/all');
      if (response.ok) {
        const data = await response.json();
        setPricingData(data.pricing);
      }
    } catch (error) {
      console.error('Error loading pricing data:', error);
    }
  };

  const handleRefreshPricing = async () => {
    setRefreshing(true);
    try {
      const response = await authenticatedFetch('/api/pricing/refresh', {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "Pricing Refresh Started",
          description: "AWS pricing data is being refreshed. This may take a few minutes.",
        });
        
        // Poll for completion
        pollRefreshStatus();
      } else {
        throw new Error('Failed to start pricing refresh');
      }
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh pricing data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  const pollRefreshStatus = async () => {
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    
    const poll = async () => {
      try {
        attempts++;
        await loadPricingStatus();
        
        if (status?.isValid) {
          await loadPricingData();
          toast({
            title: "Pricing Updated",
            description: "AWS pricing data has been refreshed successfully!",
          });
          return;
        }
        
        if (attempts < maxAttempts) {
          setTimeout(poll, 5000); // Poll every 5 seconds
        } else {
          toast({
            title: "Refresh Timeout",
            description: "Pricing refresh is taking longer than expected. Please check back later.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error polling refresh status:', error);
      }
    };
    
    poll();
  };

  const formatPrice = (price: number) => {
    if (price < 1) {
      return `$${price.toFixed(3)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            AWS Pricing Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span>Loading pricing status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pricing Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            AWS Pricing Status
          </CardTitle>
          <CardDescription>
            Real-time AWS pricing data for infrastructure cost estimation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {status.isValid ? 'Pricing Cache Valid' : 'Pricing Cache Expired'}
              </span>
            </div>
            <Badge variant={status.isValid ? "default" : "secondary"}>
              {status.isValid ? 'Current' : 'Needs Refresh'}
            </Badge>
          </div>
          
          <div className="text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Last Updated: {formatDate(status.lastUpdated)}
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleRefreshPricing}
              disabled={refreshing}
              className="flex-1"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Refreshing Pricing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Pricing Data
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowOnDemand(!showOnDemand)}
              className="flex items-center gap-2"
            >
              <Search className="h-4 w-4" />
              {showOnDemand ? 'Hide' : 'On-Demand'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Data Overview */}
      {pricingData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Pricing Overview
            </CardTitle>
            <CardDescription>
              Monthly costs for common AWS services (us-east-1)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* EC2 Pricing */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Server className="h-4 w-4" />
                EC2 Instances (Monthly)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(pricingData.EC2).map(([instance, cost]) => (
                  <div key={instance} className="text-sm">
                    <div className="font-medium">{instance.replace('_', '.')}</div>
                    <div className="text-green-600">{formatPrice(cost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* S3 Pricing */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Database className="h-4 w-4" />
                S3 Storage (Monthly)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(pricingData.S3).map(([size, cost]) => (
                  <div key={size} className="text-sm">
                    <div className="font-medium">{size.replace('_', ' ')}</div>
                    <div className="text-green-600">{formatPrice(cost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lambda Pricing */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4" />
                Lambda Usage (Monthly)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(pricingData.Lambda).map(([usage, cost]) => (
                  <div key={usage} className="text-sm">
                    <div className="font-medium">{usage.replace('_', ' ')}</div>
                    <div className="text-green-600">{formatPrice(cost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DynamoDB Pricing */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Database className="h-4 w-4" />
                DynamoDB Usage (Monthly)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(pricingData.DynamoDB).map(([size, cost]) => (
                  <div key={size} className="text-sm">
                    <div className="font-medium">{size}</div>
                    <div className="text-green-600">{formatPrice(cost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RDS Pricing */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Server className="h-4 w-4" />
                RDS Instances (Monthly)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {Object.entries(pricingData.RDS).map(([instance, cost]) => (
                  <div key={instance} className="text-sm">
                    <div className="font-medium">{instance.replace('_', '.')}</div>
                    <div className="text-green-600">{formatPrice(cost)}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* API Gateway Pricing */}
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4" />
                API Gateway Usage (Monthly)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {Object.entries(pricingData.APIGateway).map(([usage, cost]) => (
                  <div key={usage} className="text-sm">
                    <div className="font-medium">{usage.replace('_', ' ')}</div>
                    <div className="text-green-600">{formatPrice(cost)}</div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* On-Demand Pricing Component */}
      {showOnDemand && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              On-Demand Pricing Lookup
            </CardTitle>
            <CardDescription>
              Get real-time pricing for any AWS service not in the cache
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Search className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="text-lg font-semibold mb-2">On-Demand Pricing Available</h3>
              <p className="text-gray-600 mb-4">
                The system can fetch pricing for any AWS service on-demand. 
                When the AI recommends a service not in our cache, pricing will be automatically fetched.
              </p>
              <div className="bg-blue-50 p-4 rounded-md text-left">
                <h4 className="font-medium text-blue-800 mb-2">How it works:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• AI recommends infrastructure with any AWS service</li>
                  <li>• System checks cache for pricing</li>
                  <li>• If not found, fetches from AWS Pricing API</li>
                  <li>• Caches the result for future use</li>
                  <li>• Provides accurate cost estimates</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 