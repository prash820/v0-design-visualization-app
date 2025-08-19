'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { InfrastructureTiers } from '@/components/infrastructure-tiers';
import { AlertCircle } from 'lucide-react';

export default function InfrastructureTiersDemo() {
  const [prompt, setPrompt] = useState('');
  const [jobId, setJobId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateTiers = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description of your application');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/iac/tiers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          projectId: `demo-${Date.now()}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start infrastructure tiers generation');
      }

      const result = await response.json();
      setJobId(result.jobId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleTierSelected = (tierIndex: number) => {
    console.log(`Selected tier: ${tierIndex}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Infrastructure Tiers Demo</h1>
          <p className="text-muted-foreground">
            Generate three different infrastructure options with detailed cost breakdowns
          </p>
        </div>

        {!jobId ? (
          <Card>
            <CardHeader>
              <CardTitle>Describe Your Application</CardTitle>
              <CardDescription>
                Tell us about your application and we'll generate three infrastructure options:
                low cost (high maintenance), medium cost (medium maintenance), and high cost (low maintenance).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="prompt">Application Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe your application, its features, expected traffic, and any specific requirements..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button 
                onClick={handleGenerateTiers}
                disabled={loading || !prompt.trim()}
                className="w-full"
                size="lg"
              >
                {loading ? 'Generating Infrastructure Tiers...' : 'Generate Infrastructure Options'}
              </Button>

              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Example prompts:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>"A simple blog application with user authentication and comment system"</li>
                  <li>"E-commerce platform with product catalog, shopping cart, and payment processing"</li>
                  <li>"Task management app with real-time collaboration and file sharing"</li>
                  <li>"Social media platform with user profiles, posts, and messaging"</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        ) : (
          <InfrastructureTiers 
            jobId={jobId} 
            onTierSelected={handleTierSelected}
          />
        )}
      </div>
    </div>
  );
} 