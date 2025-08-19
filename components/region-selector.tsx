'use client';

import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe } from 'lucide-react';

interface RegionSelectorProps {
  value: string;
  onChange: (region: string) => void;
  disabled?: boolean;
  showCard?: boolean;
}

const AWS_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)', description: 'Most popular, lowest latency for US East Coast' },
  { value: 'us-west-2', label: 'US West (Oregon)', description: 'Good for US West Coast, competitive pricing' },
  { value: 'eu-west-1', label: 'Europe (Ireland)', description: 'Primary European region, good for EU compliance' },
  { value: 'ap-southeast-1', label: 'Asia Pacific (Singapore)', description: 'Good for Asia-Pacific markets' },
  { value: 'ca-central-1', label: 'Canada (Central)', description: 'Canadian region for data residency' },
  { value: 'eu-central-1', label: 'Europe (Frankfurt)', description: 'Central Europe, good performance' },
  { value: 'ap-northeast-1', label: 'Asia Pacific (Tokyo)', description: 'Japan region, good for Japanese market' },
  { value: 'sa-east-1', label: 'South America (São Paulo)', description: 'South American region' },
  { value: 'ap-south-1', label: 'Asia Pacific (Mumbai)', description: 'India region, good for Indian market' },
  { value: 'eu-west-2', label: 'Europe (London)', description: 'UK region, good for UK compliance' },
];

export function RegionSelector({ value, onChange, disabled = false, showCard = true }: RegionSelectorProps) {
  const selectedRegion = AWS_REGIONS.find(region => region.value === value);

  const content = (
    <div className="space-y-2">
      <Label htmlFor="region" className="flex items-center gap-2">
        <Globe className="h-4 w-4" />
        AWS Region
      </Label>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger id="region">
          <SelectValue placeholder="Select a region" />
        </SelectTrigger>
        <SelectContent>
          {AWS_REGIONS.map((region) => (
            <SelectItem key={region.value} value={region.value}>
              <div className="flex flex-col">
                <span className="font-medium">{region.label}</span>
                <span className="text-xs text-gray-500">{region.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedRegion && (
        <p className="text-sm text-gray-600">
          {selectedRegion.description}
        </p>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            AWS Region Selection
          </CardTitle>
          <CardDescription>
            Choose the AWS region where your infrastructure will be deployed. 
            This affects pricing, latency, and data residency.
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