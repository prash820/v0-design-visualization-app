'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChevronLeft, ChevronRight, Check, AlertCircle, Info } from 'lucide-react';
import { authenticatedFetch } from '@/lib/auth';

interface DeploymentWizardStep {
  id: string;
  title: string;
  description: string;
  fields: DeploymentWizardField[];
}

interface DeploymentWizardField {
  name: string;
  type: 'select' | 'text' | 'textarea' | 'checkbox' | 'radio';
  label: string;
  description?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: any;
  placeholder?: string;
}

interface DeploymentConfig {
  appType: 'frontend' | 'backend' | 'fullstack' | 'static';
  framework?: string;
  buildCommand?: string;
  outputDirectory?: string;
  entryPoint?: string;
  runtime?: string;
  databaseType?: 'rds' | 'dynamodb' | 'none';
  databaseName?: string;
  environmentVariables: Record<string, string> | string;
  resources: {
    database?: string;
    apiGateway?: string;
    s3Bucket?: string;
    cloudFront?: string;
    lambda?: string;
  };
  deploymentSettings: {
    autoDeploy: boolean;
    rollbackOnFailure: boolean;
    healthCheckPath?: string;
    corsEnabled: boolean;
    corsOrigins?: string[];
  };
}

interface DeploymentPreview {
  resources: {
    type: string;
    name: string;
    configuration: any;
  }[];
  environmentVariables: Record<string, string>;
  buildSteps: string[];
  deploymentSteps: string[];
  estimatedCost: number;
  estimatedTime: string;
}

export function DeploymentWizard({ projectId, onComplete }: { projectId: string; onComplete: (config: DeploymentConfig) => void }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<DeploymentWizardStep[]>([]);
  const [config, setConfig] = useState<Partial<DeploymentConfig>>({
    environmentVariables: {},
    resources: {},
    deploymentSettings: {
      autoDeploy: true,
      rollbackOnFailure: true,
      corsEnabled: false
    }
  });
  const [preview, setPreview] = useState<DeploymentPreview | null>(null);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadWizardSteps();
  }, []);

  const loadWizardSteps = async () => {
    try {
      const response = await authenticatedFetch('/api/deployment-wizard/steps');
      const data = await response.json();
      if (data.success) {
        setSteps(data.steps);
      }
    } catch (error) {
      console.error('Failed to load wizard steps:', error);
    }
  };

  const loadSmartDefaults = async (appType: string) => {
    try {
      const response = await authenticatedFetch(`/api/deployment-wizard/defaults/${appType}`);
      const data = await response.json();
      if (data.success) {
        setConfig(prev => ({ ...prev, ...data.defaults }));
      }
    } catch (error) {
      console.error('Failed to load smart defaults:', error);
    }
  };

  const validateStep = async () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return true;

    const stepErrors: string[] = [];
    
    currentStepData.fields.forEach(field => {
      if (field.required) {
        const value = getFieldValue(field.name);
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          stepErrors.push(`${field.label} is required`);
        }
      }
    });

    if (stepErrors.length > 0) {
      setErrors(prev => ({ ...prev, [currentStepData.id]: stepErrors }));
      return false;
    }

    setErrors(prev => ({ ...prev, [currentStepData.id]: [] }));
    return true;
  };

  const getFieldValue = (fieldName: string) => {
    const keys = fieldName.split('.');
    let value: any = config;
    
    for (const key of keys) {
      value = value?.[key];
    }
    
    return value;
  };

  const setFieldValue = (fieldName: string, value: any) => {
    const keys = fieldName.split('.');
    setConfig(prev => {
      const newConfig = { ...prev };
      let current: any = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (!isValid) return;

    if (currentStep === 0 && config.appType) {
      await loadSmartDefaults(config.appType);
    }

    if (currentStep === steps.length - 2) {
      // Generate preview before final step
      await generatePreview();
    }

    setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  };

  const generatePreview = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch('/api/deployment-wizard/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success) {
        setPreview(data.preview);
      }
    } catch (error) {
      console.error('Failed to generate preview:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(`/api/deployment-wizard/save/${projectId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });
      const data = await response.json();
      if (data.success) {
        onComplete(config as DeploymentConfig);
      }
    } catch (error) {
      console.error('Failed to save configuration:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: DeploymentWizardField) => {
    const value = getFieldValue(field.name);
    const fieldErrors = errors[steps[currentStep]?.id] || [];

    switch (field.type) {
      case 'select':
        return (
          <Select value={value} onValueChange={(val) => setFieldValue(field.name, val)}>
            <SelectTrigger>
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'radio':
        return (
          <RadioGroup value={value} onValueChange={(val) => setFieldValue(field.name, val)}>
            {field.options?.map(option => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label htmlFor={option.value}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        );

      case 'textarea':
        return (
          <Textarea
            value={value || ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );

      case 'checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              checked={value || false}
              onCheckedChange={(checked) => setFieldValue(field.name, checked)}
            />
            <Label>{field.label}</Label>
          </div>
        );

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => setFieldValue(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        );
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  if (steps.length === 0) {
    return <div>Loading wizard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Deployment Configuration Wizard</CardTitle>
              <CardDescription>
                Step {currentStep + 1} of {steps.length}: {currentStepData?.title}
              </CardDescription>
            </div>
            <Badge variant="outline">{Math.round(progress)}% Complete</Badge>
          </div>
          <Progress value={progress} className="mt-4" />
        </CardHeader>

        <CardContent className="space-y-6">
          {currentStepData && (
            <>
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
                <p className="text-muted-foreground">{currentStepData.description}</p>
              </div>

              {errors[currentStepData.id]?.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <ul className="list-disc list-inside">
                      {errors[currentStepData.id].map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                {currentStepData.fields.map((field) => (
                  <div key={field.name} className="space-y-2">
                    <Label htmlFor={field.name}>
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </Label>
                    {field.description && (
                      <p className="text-sm text-muted-foreground">{field.description}</p>
                    )}
                    {renderField(field)}
                  </div>
                ))}
              </div>
            </>
          )}

          {currentStep === steps.length - 1 && preview && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Deployment Preview</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Resources</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {preview.resources.map((resource, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <Badge variant="secondary">{resource.type}</Badge>
                          <span className="text-sm">{resource.name}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Estimated Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${preview.estimatedCost}/month</div>
                    <p className="text-sm text-muted-foreground">
                      Estimated deployment time: {preview.estimatedTime}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Deployment Steps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {preview.deploymentSteps.map((step, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous
            </Button>

            {currentStep === steps.length - 1 ? (
              <Button onClick={handleComplete} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Complete Configuration'}
                <Check className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleNext} disabled={isLoading}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 