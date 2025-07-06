"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, CheckCircle, Edit3, Brain, Layers, GitBranch, Boxes } from "lucide-react";
import MermaidComponent from "./mermaid-component";

interface ConceptResult {
  concept: {
    name: string;
    description: string;
    coreFeature: string;
    problemSolved: string;
    targetUser: string;
    valueProposition: string;
  };
  diagrams: {
    architecture: string;
    sequence: string;
    component: string;
  };
}

interface ConceptValidationProps {
  conceptJobId: string | null;
  onConceptComplete: (result: ConceptResult) => void;
  onApprove: (modifications?: string) => void;
  onGoBack: () => void;
}

interface ConceptStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  result?: ConceptResult;
  error?: string;
  duration: number;
}

// Fallback diagram component in case Mermaid fails
const DiagramFallback = ({ chart, title }: { chart: string; title: string }) => (
  <div className="p-4 border rounded bg-muted/10">
    <p className="text-sm text-muted-foreground mb-2">{title}</p>
    <pre className="text-xs overflow-auto bg-background p-2 rounded border">
      {chart}
    </pre>
  </div>
);

// Safe Mermaid wrapper
const SafeMermaidComponent = ({ chart, title }: { chart: string; title?: string }) => {
  try {
    return <MermaidComponent chart={chart} />;
  } catch (error) {
    console.warn('Mermaid rendering failed, using fallback:', error);
    return <DiagramFallback chart={chart} title={title || 'Diagram'} />;
  }
};

export default function MagicConceptValidation({
  conceptJobId,
  onConceptComplete,
  onApprove,
  onGoBack
}: ConceptValidationProps) {
  const [status, setStatus] = useState<ConceptStatus | null>(null);
  const [modifications, setModifications] = useState('');
  const [activeTab, setActiveTab] = useState('concept');
  const [pollingCount, setPollingCount] = useState(0);
  const [retryDelay, setRetryDelay] = useState(2000); // Start with 2 seconds
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!conceptJobId) return;

    let timeoutId: NodeJS.Timeout;
    
    const pollStatus = async () => {
      try {
        // Increase timeout to 5 minutes (300 seconds) and base it on elapsed time instead of poll count
        const elapsedTime = Date.now() - startTime;
        const timeoutMs = 5 * 60 * 1000; // 5 minutes
        
        if (elapsedTime > timeoutMs) {
          setStatus(prev => prev ? {
            ...prev,
            status: 'failed',
            error: 'Concept generation timed out after 5 minutes. The backend may still be processing - please try again.'
          } : null);
          return;
        }

        const response = await fetch(`/api/magic/concept-status/${conceptJobId}`);
        
        // Handle rate limiting specifically
        if (response.status === 429) {
          console.warn('Rate limited, backing off...');
          const newDelay = Math.min(retryDelay * 2, 30000); // Max 30 seconds
          setRetryDelay(newDelay);
          
          // Show rate limit message to user
          setStatus(prev => prev ? {
            ...prev,
            currentStep: `Rate limited, retrying in ${Math.round(newDelay/1000)} seconds...`,
            progress: Math.min((elapsedTime / timeoutMs) * 100, 95) // Show progress based on time
          } : null);
          
          timeoutId = setTimeout(pollStatus, newDelay);
          return;
        }
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        // Debug logging
        console.log('Concept status response:', data);
        console.log('Response status:', response.status);
        console.log('Elapsed time:', Math.round(elapsedTime / 1000), 'seconds');
        
        // Reset retry delay on successful request
        setRetryDelay(2000);
        
        // Update progress based on elapsed time if not provided by backend
        if (!data.progress && data.status === 'processing') {
          data.progress = Math.min((elapsedTime / timeoutMs) * 100, 95);
        }
        
        setStatus(data);
        setPollingCount(prev => prev + 1);

        if (data.status === 'completed' && data.result) {
          onConceptComplete(data.result);
        } else if (data.status === 'processing') {
          // Use current retry delay, but don't go below 3 seconds for normal polling to be gentler
          const pollDelay = Math.max(retryDelay, 3000);
          timeoutId = setTimeout(pollStatus, pollDelay);
        }
      } catch (error) {
        console.error('Failed to poll concept status:', error);
        
        // Handle different types of errors
        let errorMessage = 'Unknown error occurred';
        if (error instanceof Error) {
          if (error.message.includes('429')) {
            errorMessage = 'Too many requests. Please wait a moment and try again.';
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error. Please check your connection and try again.';
          } else {
            errorMessage = error.message;
          }
        }
        
        setStatus(prev => prev ? {
          ...prev,
          status: 'failed',
          error: `Failed to check status: ${errorMessage}`
        } : null);
      }
    };

    pollStatus();
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [conceptJobId, onConceptComplete, pollingCount, retryDelay, startTime]);

  if (!status || status.status === 'processing') {
    const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
    
    return (
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <Brain className="h-6 w-6 text-primary animate-pulse" />
            AI is designing your app concept...
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{status?.currentStep || 'Analyzing your idea...'}</span>
              <span className="text-primary font-medium">{Math.round(status?.progress || 0)}%</span>
            </div>
            <Progress value={status?.progress || 0} className="h-2" />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            <div>This can take 1-3 minutes for complex apps...</div>
            <div className="mt-1 text-xs">Elapsed: {elapsedSeconds}s</div>
            {elapsedSeconds > 60 && (
              <div className="mt-2 text-xs text-amber-600">
                Taking longer than usual - the AI is working hard on your concept!
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (status.status === 'failed') {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">❌ Concept Generation Failed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-red-700">{status.error}</p>
          <Button onClick={onGoBack} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (status.status === 'completed' && (!status.result || !status.result.concept || !status.result.diagrams)) {
    return (
      <Card className="border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-600">⚠️ Incomplete Concept Data</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-yellow-700">
            The concept was generated but some data is missing. Please try again.
          </p>
          <div className="text-sm text-muted-foreground">
            <p>Debug info:</p>
            <pre className="bg-muted p-2 rounded text-xs overflow-auto">
              {JSON.stringify(status, null, 2)}
            </pre>
          </div>
          <Button onClick={onGoBack} variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { concept, diagrams } = status.result!;

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            <CheckCircle className="h-6 w-6" />
            Concept Generated! Does this look right?
          </CardTitle>
          <p className="text-green-700">
            Review the AI-generated concept and diagrams. You can make modifications before building.
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="concept" className="gap-2">
            <Brain className="h-4 w-4" />
            Concept
          </TabsTrigger>
          <TabsTrigger value="architecture" className="gap-2">
            <Layers className="h-4 w-4" />
            Architecture
          </TabsTrigger>
          <TabsTrigger value="sequence" className="gap-2">
            <GitBranch className="h-4 w-4" />
            User Flow
          </TabsTrigger>
          <TabsTrigger value="component" className="gap-2">
            <Boxes className="h-4 w-4" />
            Components
          </TabsTrigger>
        </TabsList>

        <TabsContent value="concept" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">{concept.name}</CardTitle>
              <p className="text-lg text-muted-foreground">{concept.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Core Feature</Badge>
                    <p className="text-sm">{concept.coreFeature}</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Target User</Badge>
                    <p className="text-sm">{concept.targetUser}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <Badge variant="outline" className="mb-2">Problem Solved</Badge>
                    <p className="text-sm">{concept.problemSolved}</p>
                  </div>
                  <div>
                    <Badge variant="outline" className="mb-2">Value Proposition</Badge>
                    <p className="text-sm">{concept.valueProposition}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="architecture" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Architecture</CardTitle>
              <p className="text-muted-foreground">How your app components will be structured</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/20">
                <SafeMermaidComponent chart={diagrams.architecture} title="System Architecture" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Flow Sequence</CardTitle>
              <p className="text-muted-foreground">How users will interact with your app</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/20">
                <SafeMermaidComponent chart={diagrams.sequence} title="User Flow Sequence" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="component" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Component Structure</CardTitle>
              <p className="text-muted-foreground">Main components and their relationships</p>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/20">
                <SafeMermaidComponent chart={diagrams.component} title="Component Structure" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Want to modify anything?
          </CardTitle>
          <p className="text-muted-foreground">
            Describe any changes you'd like before we build your app
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
            placeholder="Add a dark mode option, change the color scheme to blue, include user authentication, etc."
            className="min-h-[80px]"
          />
          <div className="flex gap-3">
            <Button onClick={onGoBack} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Start Over
            </Button>
            <Button 
              onClick={() => onApprove(modifications)}
              size="lg"
              className="flex-1 gap-2 text-lg"
            >
              Looks Good! Build My App
              <ArrowRight className="h-5 w-5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 