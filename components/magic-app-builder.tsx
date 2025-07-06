"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ArrowRight, ExternalLink, Settings, CheckCircle } from "lucide-react";
import MagicConceptValidation from "./magic-concept-validation";
import MagicBuildProgress from "./magic-build-progress";
import MagicComplete from "./magic-complete";

type Step = 'input' | 'validate' | 'build' | 'complete';

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

interface BuildResult {
  appUrl: string;
  adminUrl: string;
  projectId: string;
}

export default function MagicAppBuilder() {
  const [step, setStep] = useState<Step>('input');
  const [idea, setIdea] = useState('');
  
  // Concept generation state
  const [conceptJobId, setConceptJobId] = useState<string | null>(null);
  const [conceptResult, setConceptResult] = useState<ConceptResult | null>(null);
  
  // Build state
  const [buildJobId, setBuildJobId] = useState<string | null>(null);
  const [buildResult, setBuildResult] = useState<BuildResult | null>(null);

  const handleGenerateConcept = async () => {
    if (!idea.trim()) return;
    
    setStep('validate');
    
    try {
      const response = await fetch('/api/magic/generate-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea })
      });
      
      const result = await response.json();
      setConceptJobId(result.jobId);
    } catch (error) {
      console.error('Failed to generate concept:', error);
      setStep('input');
    }
  };

  const handleApproveConcept = async (modifications?: string) => {
    if (!conceptJobId) return;
    
    setStep('build');
    
    try {
      const response = await fetch('/api/magic/approve-and-build', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          conceptJobId,
          modifications 
        })
      });
      
      const result = await response.json();
      setBuildJobId(result.buildJobId);
    } catch (error) {
      console.error('Failed to start build:', error);
      setStep('validate');
    }
  };

  const handleGoBack = () => {
    setStep('input');
    setConceptJobId(null);
    setConceptResult(null);
    setBuildJobId(null);
    setBuildResult(null);
  };

  const handleConceptComplete = (result: ConceptResult) => {
    setConceptResult(result);
  };

  const handleBuildComplete = (result: BuildResult) => {
    setBuildResult(result);
    setStep('complete');
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center gap-2 ${step === 'input' ? 'text-primary' : step === 'validate' || step === 'build' || step === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'input' ? 'border-primary bg-primary text-primary-foreground' : step === 'validate' || step === 'build' || step === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'}`}>
              {step === 'validate' || step === 'build' || step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '1'}
            </div>
            <span className="font-medium">Describe Idea</span>
          </div>
          
          <div className={`w-24 h-1 ${step === 'validate' || step === 'build' || step === 'complete' ? 'bg-green-600' : 'bg-muted'}`}></div>
          
          <div className={`flex items-center gap-2 ${step === 'validate' ? 'text-primary' : step === 'build' || step === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'validate' ? 'border-primary bg-primary text-primary-foreground' : step === 'build' || step === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'}`}>
              {step === 'build' || step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '2'}
            </div>
            <span className="font-medium">Validate Concept</span>
          </div>
          
          <div className={`w-24 h-1 ${step === 'build' || step === 'complete' ? 'bg-green-600' : 'bg-muted'}`}></div>
          
          <div className={`flex items-center gap-2 ${step === 'build' ? 'text-primary' : step === 'complete' ? 'text-green-600' : 'text-muted-foreground'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${step === 'build' ? 'border-primary bg-primary text-primary-foreground' : step === 'complete' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'}`}>
              {step === 'complete' ? <CheckCircle className="h-4 w-4" /> : '3'}
            </div>
            <span className="font-medium">Build App</span>
          </div>
        </div>
      </div>

      {/* Step Content */}
      {step === 'input' && (
        <Card className="border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Sparkles className="h-6 w-6 text-primary" />
              What app do you want to build?
            </CardTitle>
            <p className="text-muted-foreground">
              Describe your app idea in simple terms. The AI will understand and create the concept for you.
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder="I want to build an app that helps busy freelancers track their daily expenses..."
                className="min-h-[120px] text-lg"
              />
              <p className="text-sm text-muted-foreground mt-2">
                💡 Examples: "expense tracker for freelancers", "simple todo app for teams", "workout tracker for gym-goers"
              </p>
            </div>
            
            <Button 
              onClick={handleGenerateConcept}
              disabled={!idea.trim()}
              size="lg"
              className="w-full gap-2 text-lg py-6"
            >
              <Sparkles className="h-5 w-5" />
              Generate Concept & Diagrams
              <ArrowRight className="h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'validate' && (
        <MagicConceptValidation
          conceptJobId={conceptJobId}
          onConceptComplete={handleConceptComplete}
          onApprove={handleApproveConcept}
          onGoBack={handleGoBack}
        />
      )}

      {step === 'build' && (
        <MagicBuildProgress
          buildJobId={buildJobId}
          onBuildComplete={handleBuildComplete}
          onGoBack={() => setStep('validate')}
        />
      )}

      {step === 'complete' && buildResult && (
        <MagicComplete
          result={buildResult}
          concept={conceptResult?.concept}
          onStartOver={() => {
            setStep('input');
            setIdea('');
            setConceptJobId(null);
            setConceptResult(null);
            setBuildJobId(null);
            setBuildResult(null);
          }}
        />
      )}
    </div>
  );
} 