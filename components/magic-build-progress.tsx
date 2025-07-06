"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Zap, Code, Cloud, CheckCircle, Loader2 } from "lucide-react";

interface BuildResult {
  appUrl: string;
  adminUrl: string;
  projectId: string;
}

interface BuildProgressProps {
  buildJobId: string | null;
  onBuildComplete: (result: BuildResult) => void;
  onGoBack: () => void;
}

interface BuildStatus {
  status: 'processing' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  result?: BuildResult;
  error?: string;
  duration: number;
}

const buildSteps = [
  { progress: 30, step: "Writing your app code...", icon: Code, description: "AI is generating React frontend and Node.js backend" },
  { progress: 60, step: "Provisioning cloud infrastructure...", icon: Cloud, description: "Setting up AWS Lambda, S3, and DynamoDB" },
  { progress: 80, step: "Deploying your application...", icon: Zap, description: "Uploading code and configuring services" },
  { progress: 100, step: "Your app is ready!", icon: CheckCircle, description: "Successfully deployed and accessible" }
];

export default function MagicBuildProgress({
  buildJobId,
  onBuildComplete,
  onGoBack
}: BuildProgressProps) {
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const [retryDelay, setRetryDelay] = useState(3000); // Start with 3 seconds (slightly longer than concept)
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (!buildJobId) return;

    let timeoutId: NodeJS.Timeout;

    const pollStatus = async () => {
      try {
        // Increase timeout to 10 minutes for builds (longer than concepts since they involve AWS provisioning)
        const elapsedTime = Date.now() - startTime;
        const timeoutMs = 10 * 60 * 1000; // 10 minutes
        
        if (elapsedTime > timeoutMs) {
          setStatus(prev => prev ? {
            ...prev,
            status: 'failed',
            error: 'Build process timed out after 10 minutes. This might be due to AWS setup issues. The backend may still be processing - please try again.'
          } : null);
          return;
        }

        const response = await fetch(`/api/magic/build-status/${buildJobId}`);
        
        // Handle rate limiting specifically  
        if (response.status === 429) {
          console.warn('Build polling rate limited, backing off...');
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
        console.log('Build status response:', data);
        console.log('Build elapsed time:', Math.round(elapsedTime / 1000), 'seconds');
        
        // Reset retry delay on successful request
        setRetryDelay(3000);
        
        // Update progress based on elapsed time if not provided by backend
        if (!data.progress && data.status === 'processing') {
          data.progress = Math.min((elapsedTime / timeoutMs) * 100, 95);
        }
        
        setStatus(data);

        if (data.status === 'completed' && data.result) {
          onBuildComplete(data.result);
        } else if (data.status === 'processing') {
          // Use current retry delay, but don't go below 3 seconds for build polling
          const pollDelay = Math.max(retryDelay, 3000);
          timeoutId = setTimeout(pollStatus, pollDelay);
        }
      } catch (error) {
        console.error('Failed to poll build status:', error);
        
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
          error: `Failed to check build status: ${errorMessage}`
        } : null);
      }
    };

    pollStatus();
    
    // Cleanup timeout on unmount
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [buildJobId, onBuildComplete, retryDelay, startTime]);

  if (!status) {
    return (
      <Card className="border-primary/20">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (status.status === 'failed') {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">❌ App Build Failed</CardTitle>
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

  const currentStepIndex = buildSteps.findIndex(step => step.progress >= status.progress);
  const currentStepData = buildSteps[currentStepIndex] || buildSteps[buildSteps.length - 1];
  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-2xl">
            {status.status === 'completed' ? (
              <>
                <CheckCircle className="h-7 w-7 text-green-600" />
                Your App is Ready! 🎉
              </>
            ) : (
              <>
                <Zap className="h-7 w-7 text-primary animate-pulse" />
                Building Your App...
              </>
            )}
          </CardTitle>
          <p className="text-muted-foreground">
            {status.status === 'completed' 
              ? "Your app has been successfully deployed to the cloud"
              : "This can take 3-5 minutes for AWS infrastructure setup. We're working our magic!"
            }
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{status.currentStep}</span>
              <span className="text-primary font-medium">{Math.round(status.progress)}%</span>
            </div>
            <Progress value={status.progress} className="h-3" />
            <div className="text-center text-sm text-muted-foreground">
              <div>Elapsed: {Math.floor(elapsedSeconds / 60)}:{(elapsedSeconds % 60).toString().padStart(2, '0')}</div>
              {elapsedSeconds > 180 && (
                <div className="mt-1 text-xs text-amber-600">
                  Taking longer than usual - AWS infrastructure setup can be slow!
                </div>
              )}
            </div>
          </div>

          {/* Step Breakdown */}
          <div className="space-y-4">
            {buildSteps.map((step, index) => {
              const isCompleted = status.progress >= step.progress;
              const isCurrent = status.progress >= (index === 0 ? 0 : buildSteps[index - 1].progress) && 
                               status.progress < step.progress;
              const IconComponent = step.icon;

              return (
                <div 
                  key={index}
                  className={`flex items-start gap-3 p-3 rounded-lg transition-all ${
                    isCompleted 
                      ? 'bg-green-50 border border-green-200' 
                      : isCurrent 
                        ? 'bg-blue-50 border border-blue-200' 
                        : 'bg-muted/20 border border-border'
                  }`}
                >
                  <div className={`mt-0.5 ${
                    isCompleted 
                      ? 'text-green-600' 
                      : isCurrent 
                        ? 'text-blue-600' 
                        : 'text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <IconComponent className="h-5 w-5" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className={`font-medium ${
                      isCompleted 
                        ? 'text-green-800' 
                        : isCurrent 
                          ? 'text-blue-800' 
                          : 'text-muted-foreground'
                    }`}>
                      {step.step}
                    </div>
                    <div className={`text-sm ${
                      isCompleted 
                        ? 'text-green-600' 
                        : isCurrent 
                          ? 'text-blue-600' 
                          : 'text-muted-foreground'
                    }`}>
                      {step.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Build Info */}
          {status.status === 'processing' && (
            <div className="text-center text-sm text-muted-foreground bg-muted/20 p-4 rounded-lg">
              <div className="space-y-2">
                <div>✨ Generating production-ready code</div>
                <div>☁️ Provisioning AWS infrastructure</div>
                <div>🚀 Deploying to the cloud</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {status.status === 'processing' && (
        <div className="text-center">
          <Button onClick={onGoBack} variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Cancel Build
          </Button>
        </div>
      )}
    </div>
  );
} 