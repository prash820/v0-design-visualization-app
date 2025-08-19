'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { 
  Globe, 
  MapPin, 
  Zap, 
  Clock, 
  AlertCircle,
  CheckCircle,
  Loader2,
  Settings
} from 'lucide-react';
import { 
  getNearestRegion, 
  getAllRegions, 
  getRegionByValue,
  type AWSRegion 
} from '@/lib/geolocation';
import { useToast } from '@/hooks/use-toast';

interface GeolocationRegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
  disabled?: boolean;
  showCard?: boolean;
}

export function GeolocationRegionSelector({ 
  value, 
  onChange, 
  disabled = false, 
  showCard = true 
}: GeolocationRegionSelectorProps) {
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectedRegion, setDetectedRegion] = useState<AWSRegion | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [showManualSelection, setShowManualSelection] = useState(false);
  const [geolocationError, setGeolocationError] = useState<string | null>(null);
  const { toast } = useToast();

  const currentRegion = getRegionByValue(value) || getAllRegions()[0];

  useEffect(() => {
    // Auto-detect location on component mount
    detectLocation();
  }, []);

  const detectLocation = async () => {
    setIsDetecting(true);
    setGeolocationError(null);
    
    try {
      const result = await getNearestRegion();
      setDetectedRegion(result.region);
      setUserLocation(result.userLocation || null);
      
      // Auto-select the detected region if no region is currently selected
      if (value === 'us-east-1' || !value) {
        onChange(result.region.value);
      }
      
      toast({
        title: "Location Detected!",
        description: `Nearest AWS region: ${result.region.name} (${result.region.latency}ms estimated latency)`,
      });
    } catch (error) {
      console.error('Geolocation error:', error);
      setGeolocationError('Failed to detect your location. Please select manually.');
      toast({
        title: "Location Detection Failed",
        description: "Please select your preferred AWS region manually.",
        variant: "destructive"
      });
    } finally {
      setIsDetecting(false);
    }
  };

  const handleManualRegionChange = (newRegion: string) => {
    onChange(newRegion);
    setShowManualSelection(false);
  };

  const content = (
    <div className="space-y-4">
      {/* Current Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Globe className="h-4 w-4" />
          AWS Region
        </Label>
        
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <CheckCircle className="h-5 w-5 text-blue-600" />
          <div className="flex-1">
            <div className="font-medium text-blue-800">{currentRegion.name}</div>
            <div className="text-sm text-blue-600">{currentRegion.description}</div>
          </div>
          <Badge variant="outline" className="text-blue-700">
            {currentRegion.value}
          </Badge>
        </div>
      </div>

      {/* Geolocation Detection */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location Detection
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={detectLocation}
            disabled={isDetecting || disabled}
          >
            {isDetecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Detecting...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Detect Location
              </>
            )}
          </Button>
        </div>

        {detectedRegion && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Nearest Region Detected</span>
            </div>
            <div className="text-sm text-green-700">
              <div><strong>{detectedRegion.name}</strong> ({detectedRegion.value})</div>
              <div className="flex items-center gap-2 mt-1">
                <Clock className="h-3 w-3" />
                Estimated latency: {detectedRegion.latency}ms
              </div>
              {userLocation && (
                <div className="text-xs mt-1">
                  Your location: {userLocation.lat.toFixed(2)}, {userLocation.lng.toFixed(2)}
                </div>
              )}
            </div>
            {detectedRegion.value !== value && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => onChange(detectedRegion.value)}
                disabled={disabled}
              >
                Use This Region
              </Button>
            )}
          </div>
        )}

        {geolocationError && (
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">Detection Failed</span>
            </div>
            <div className="text-sm text-red-700">{geolocationError}</div>
          </div>
        )}
      </div>

      {/* Manual Selection */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manual Selection
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowManualSelection(!showManualSelection)}
          >
            {showManualSelection ? 'Hide' : 'Show'} All Regions
          </Button>
        </div>

        {showManualSelection && (
          <Select value={value} onValueChange={handleManualRegionChange} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select a region" />
            </SelectTrigger>
            <SelectContent>
              {getAllRegions().map((region) => (
                <SelectItem key={region.value} value={region.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{region.name}</span>
                    <span className="text-xs text-gray-500">{region.description}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Performance Info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <Zap className="h-4 w-4 mt-0.5 text-gray-600" />
          <div>
            <p className="font-medium text-gray-800 mb-1">Why Location Matters:</p>
            <ul className="text-gray-700 space-y-1 text-xs">
              <li>• <strong>Lower Latency:</strong> Faster response times for your users</li>
              <li>• <strong>Better Performance:</strong> Reduced network hops</li>
              <li>• <strong>Cost Optimization:</strong> Some regions have different pricing</li>
              <li>• <strong>Compliance:</strong> Data residency requirements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Smart Region Selection
          </CardTitle>
          <CardDescription>
            We'll automatically detect your location and suggest the nearest AWS region for optimal performance.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {content}
        </CardContent>
      </Card>
    );
  }

  return content;
} 