"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Cloud, 
  Server, 
  Database, 
  Code2, 
  Zap, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Play,
  Brain,
  Globe,
  Shield,
  DollarSign,
  ArrowRight
} from "lucide-react"

const examples = [
  {
    title: "E-commerce Platform",
    description: "Full-stack e-commerce with React frontend, Node.js API, PostgreSQL database, and Redis cache",
    prompt: "I need an e-commerce platform with user authentication, product catalog, shopping cart, payment processing (Stripe), order management, and admin dashboard. The app should be scalable and secure.",
    features: ["React Frontend", "Node.js API", "PostgreSQL", "Redis Cache", "Stripe Payments", "Admin Dashboard"],
    estimatedCost: "$150-300/month"
  },
  {
    title: "Blog Platform",
    description: "Modern blog with content management, user authentication, and SEO optimization",
    prompt: "Create a blog platform with user authentication, content management system, SEO optimization, comment system, and analytics dashboard. Support for markdown content and image uploads.",
    features: ["Next.js Frontend", "Node.js API", "PostgreSQL", "S3 Storage", "CDN", "Analytics"],
    estimatedCost: "$50-100/month"
  },
  {
    title: "SaaS Application",
    description: "Multi-tenant SaaS platform with subscription management and analytics",
    prompt: "Build a SaaS application with multi-tenant architecture, user authentication, subscription management (Stripe), analytics dashboard, and API rate limiting. Include automated backups and monitoring.",
    features: ["React Frontend", "Node.js API", "PostgreSQL", "Redis", "Stripe Subscriptions", "Monitoring"],
    estimatedCost: "$200-500/month"
  },
  {
    title: "API Gateway",
    description: "Microservices API gateway with authentication, rate limiting, and monitoring",
    prompt: "Create an API gateway for microservices with authentication, rate limiting, request/response transformation, logging, monitoring, and load balancing. Support for multiple backend services.",
    features: ["API Gateway", "Lambda Functions", "DynamoDB", "CloudWatch", "Load Balancer", "VPC"],
    estimatedCost: "$100-250/month"
  }
]

const workflowSteps = [
  {
    step: "01",
    title: "Describe Your Architecture",
    description: "Tell us about your application in plain English",
    icon: Brain,
    color: "text-blue-600"
  },
  {
    step: "02",
    title: "AI Analysis & UML Generation",
    description: "AI analyzes your requirements and generates architecture diagrams",
    icon: Database,
    color: "text-green-600"
  },
  {
    step: "03",
    title: "Terraform Code Generation",
    description: "Production-ready Terraform code with AWS best practices",
    icon: Code2,
    color: "text-purple-600"
  },
  {
    step: "04",
    title: "One-Click Deployment",
    description: "Deploy directly to AWS with real-time monitoring",
    icon: Server,
    color: "text-orange-600"
  }
]

export default function DemoPage() {
  const [selectedExample, setSelectedExample] = useState(0)

  return (
    <div className="container mx-auto p-6 space-y-12">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
          <Play className="h-4 w-4" />
          <span>Live Demo</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold">
          See Infrastructure Automation in Action
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Watch how InfraAI transforms your application ideas into production-ready infrastructure in minutes
        </p>
      </div>

      {/* Workflow Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground">From idea to infrastructure in 4 simple steps</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {workflowSteps.map((step, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <div className={`w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4`}>
                  <step.icon className={`h-8 w-8 ${step.color}`} />
                </div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Examples Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Example Architectures</h2>
          <p className="text-muted-foreground">See what InfraAI can build for you</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {examples.map((example, index) => (
            <Card 
              key={index} 
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedExample === index ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedExample(index)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{example.title}</CardTitle>
                  <Badge variant="outline">{example.estimatedCost}</Badge>
                </div>
                <CardDescription>{example.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {example.features.map((feature, featureIndex) => (
                    <Badge key={featureIndex} variant="secondary" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
                
                {selectedExample === index && (
                  <div className="space-y-3">
                    <div className="text-sm font-medium">Example Prompt:</div>
                    <div className="bg-muted p-3 rounded-md text-sm">
                      "{example.prompt}"
                    </div>
                    <Button className="w-full">
                      <Zap className="mr-2 h-4 w-4" />
                      Try This Example
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Why Choose InfraAI?</h2>
          <p className="text-muted-foreground">The advantages of AI-powered infrastructure automation</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle>Save Time</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate production-ready infrastructure in minutes instead of days or weeks
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle>Security First</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Built-in security best practices and compliance with AWS Well-Architected Framework
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Cost Optimized</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get upfront cost estimates and optimize your infrastructure for cost and performance
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center mb-4">
                <Globe className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>AWS Best Practices</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Follow AWS Well-Architected Framework with reliability, performance, and scalability
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center mb-4">
                <Code2 className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle>Production Ready</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Generate Terraform code that's ready for production deployment with proper monitoring
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-indigo-600" />
              </div>
              <CardTitle>AI Powered</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Advanced AI analyzes your requirements and generates optimal architecture
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center space-y-6 py-12 bg-primary/5 rounded-2xl">
        <h2 className="text-3xl font-bold">Ready to Get Started?</h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Join thousands of developers who are deploying infrastructure faster than ever before
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-primary hover:bg-primary/90">
            <Cloud className="mr-2 h-5 w-5" />
            Start Building Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline">
            <Play className="mr-2 h-5 w-5" />
            Watch Full Demo
          </Button>
        </div>
      </section>
    </div>
  )
}
