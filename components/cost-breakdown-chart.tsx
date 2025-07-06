'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, DollarSign } from 'lucide-react';

interface CostBreakdownChartProps {
  costBreakdown: Record<string, number>;
  totalCost: number;
}

export default function CostBreakdownChart({ costBreakdown, totalCost }: CostBreakdownChartProps) {
  const colors = [
    'bg-blue-500',
    'bg-green-500', 
    'bg-yellow-500',
    'bg-red-500',
    'bg-purple-500',
    'bg-pink-500',
  ];

  const entries = Object.entries(costBreakdown);
  const maxValue = Math.max(...entries.map(([, value]) => value));

  if (entries.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No cost data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Cost Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {entries.map(([source, cost], index) => {
            const percentage = maxValue > 0 ? (cost / maxValue) * 100 : 0;
            const colorClass = colors[index % colors.length];
            
            return (
              <div key={source} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">{source}</span>
                  <span className="text-sm font-bold flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {cost}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground">
                  {Math.round((cost / totalCost) * 100)}% of total monthly cost
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Monthly Cost</span>
            <span className="text-2xl font-bold text-green-600 flex items-center gap-1">
              <DollarSign className="h-5 w-5" />
              {totalCost}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 