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
import DiagramTabs from "./diagram-tabs";

interface ConceptResult {
  concept: {
    name: string;
    description: string;
    coreFeature: string;
    problemSolved: string;
    targetUser: string;
    valueProposition: string;
  };
  diagrams: any; // Can be either old format or enhanced format
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

// Check if diagrams are in enhanced format (object with multiple diagram types)
const isEnhancedDiagramFormat = (diagrams: any) => {
  if (!diagrams || typeof diagrams !== 'object') return false;
  
  // Enhanced format has keys like 'class', 'sequence', 'component', 'uiComponent', etc.
  const enhancedKeys = ['class', 'sequence', 'component', 'uiComponent', 'architecture', 'entity'];
  return enhancedKeys.some(key => key in diagrams);
};

// Convert old format to enhanced format
const convertToEnhancedFormat = (oldDiagrams: any) => {
  if (!oldDiagrams) return {};
  
  return {
    architecture: oldDiagrams.architecture,
    sequence: oldDiagrams.sequence,
    component: oldDiagrams.component
  };
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
              <div className="mt-1 text-xs text-amber-600">
                Generating comprehensive UML diagrams...
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
            Go Back
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { concept, diagrams } = status.result!;
  const isEnhanced = isEnhancedDiagramFormat(diagrams);
  const diagramsToRender = isEnhanced ? diagrams : convertToEnhancedFormat(diagrams);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            <CheckCircle className="h-7 w-7 text-green-600" />
            Your App Concept is Ready! 🎉
          </CardTitle>
          <p className="text-muted-foreground">
            Review your personalized app concept and architecture diagrams below
          </p>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="concept" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            App Concept
          </TabsTrigger>
          <TabsTrigger value="diagrams" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Architecture
            {isEnhanced && (
              <Badge variant="secondary" className="ml-1 text-xs">
                Enhanced
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="concept" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Boxes className="h-5 w-5 text-primary" />
                {concept.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">DESCRIPTION</h4>
                <p className="text-sm">{concept.description}</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">CORE FEATURE</h4>
                  <p className="text-sm">{concept.coreFeature}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">PROBLEM SOLVED</h4>
                  <p className="text-sm">{concept.problemSolved}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">TARGET USER</h4>
                  <p className="text-sm">{concept.targetUser}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground mb-2">VALUE PROPOSITION</h4>
                  <p className="text-sm">{concept.valueProposition}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagrams" className="space-y-4">
          {isEnhanced ? (
            <DiagramTabs 
              diagrams={diagramsToRender} 
              isGenerating={false}
              onRegenerateAll={() => {
                // Could implement regeneration if needed
                console.log('Regenerate diagrams requested');
              }}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Architecture Diagrams</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="architecture">
                  <TabsList>
                    <TabsTrigger value="architecture">Architecture</TabsTrigger>
                    <TabsTrigger value="sequence">Sequence</TabsTrigger>
                    <TabsTrigger value="component">Component</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="architecture" className="mt-4">
                    <SafeMermaidComponent chart={diagrams.architecture} title="Architecture Diagram" />
                  </TabsContent>
                  
                  <TabsContent value="sequence" className="mt-4">
                    <SafeMermaidComponent chart={diagrams.sequence} title="Sequence Diagram" />
                  </TabsContent>
                  
                  <TabsContent value="component" className="mt-4">
                    <SafeMermaidComponent chart={diagrams.component} title="Component Diagram" />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modifications Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="h-5 w-5" />
            Request Modifications (Optional)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Want to modify anything? Describe your changes here (e.g., 'Add user profiles and social features')"
            value={modifications}
            onChange={(e) => setModifications(e.target.value)}
            rows={3}
          />
          
          <div className="flex justify-between items-center">
            <Button variant="outline" onClick={onGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Start Over
            </Button>
            <Button 
              onClick={() => onApprove(modifications.trim() || undefined)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve & Build App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 