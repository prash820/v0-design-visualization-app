"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  Sparkles, 
  RotateCcw, 
  Settings, 
  Share2,
  Smartphone,
  Monitor
} from "lucide-react";

interface MagicCompleteProps {
  result: {
    appUrl: string;
    adminUrl: string;
    projectId: string;
  };
  concept?: {
    name: string;
    description: string;
    coreFeature: string;
    targetUser: string;
  };
  onStartOver: () => void;
}

export default function MagicComplete({
  result,
  concept,
  onStartOver
}: MagicCompleteProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = async () => {
    await navigator.clipboard.writeText(result.appUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: concept?.name || 'My New App',
        text: concept?.description || 'Check out my new app!',
        url: result.appUrl
      });
    } else {
      handleCopyUrl();
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-3xl text-green-800">
            <CheckCircle className="h-8 w-8" />
            🎉 Your App is Live!
          </CardTitle>
          <p className="text-green-700 text-lg">
            From idea to production in under 2 minutes. Welcome to the future of app development!
          </p>
        </CardHeader>
      </Card>

      {/* App Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            {concept?.name || 'Your New App'}
          </CardTitle>
          <p className="text-muted-foreground">
            {concept?.description || 'Your app has been successfully deployed'}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* App Details */}
          {concept && (
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Badge variant="outline" className="mb-2">Core Feature</Badge>
                <p className="text-sm">{concept.coreFeature}</p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Target User</Badge>
                <p className="text-sm">{concept.targetUser}</p>
              </div>
            </div>
          )}

          {/* App URL */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-5 w-5 text-primary" />
              <span className="font-medium">Live App URL</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border">
              <code className="flex-1 text-sm">{result.appUrl}</code>
              <Button
                size="sm"
                variant="outline"
                onClick={handleCopyUrl}
                className="gap-1"
              >
                {copiedUrl ? <CheckCircle className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                {copiedUrl ? 'Copied!' : 'Copy'}
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1 gap-2"
              onClick={() => window.open(result.appUrl, '_blank')}
            >
              <ExternalLink className="h-5 w-5" />
              Open Your App
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={handleShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="gap-2"
              onClick={() => window.open(result.adminUrl, '_blank')}
            >
              <Settings className="h-4 w-4" />
              Admin Panel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* App Features */}
      <Card>
        <CardHeader>
          <CardTitle>What You Got</CardTitle>
          <p className="text-muted-foreground">
            Your app includes everything needed for production use
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Frontend Application</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Backend API</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Cloud Database</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">AWS Infrastructure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Production Hosting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium">Responsive Design</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Technical Details */}
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle className="text-lg">Technical Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 text-sm">
            <div>
              <span className="text-muted-foreground">Project ID:</span>
              <div className="font-mono">{result.projectId}</div>
            </div>
            <div>
              <span className="text-muted-foreground">Hosting:</span>
              <div>AWS (Lambda + S3)</div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Your app is deployed on AWS with automatic scaling, 99.9% uptime, and global CDN distribution.
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Smartphone className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Test Your App</div>
                <div className="text-sm text-blue-600">Try all features and share with friends for feedback</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <div className="font-medium text-purple-800">Customize Further</div>
                <div className="text-sm text-purple-600">Use the admin panel to configure and modify your app</div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button
              onClick={onStartOver}
              variant="outline"
              className="w-full gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Build Another App
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 