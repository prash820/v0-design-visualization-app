"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Code2, FileText, Layers, Zap, Brain, Cpu, Network, Sparkles, Cloud, Server, Database, Globe, Play } from "lucide-react"

import WorkflowAnimation from "@/components/workflow-animation"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="relative">
              <Cloud className="h-7 w-7 text-primary transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            </div>
            <span className="holographic text-xl font-black tracking-tight">InfraAI</span>
          </Link>
          <nav className="hidden md:flex gap-8">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 relative group"
            >
              Infrastructure
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></div>
            </Link>
            <Link
              href="/smart-architect"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 relative group"
            >
              Smart Architect
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></div>
            </Link>
            <Link
              href="/features"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 relative group"
            >
              Features
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></div>
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 relative group"
            >
              Pricing
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></div>
            </Link>
            <Link
              href="/docs"
              className="text-sm font-medium text-foreground/70 hover:text-primary transition-colors duration-200 relative group"
            >
              Documentation
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-200 group-hover:w-full"></div>
            </Link>
          </nav>
          <div className="flex gap-3">
            <Link href="/login">
              <Button
                variant="outline"
                className="border-border/50 hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all duration-200"
              >
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan transition-all duration-200 hover:scale-105">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 neural-bg quantum-particles"></div>

          {/* Grid Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
              linear-gradient(rgba(6, 182, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
            `,
              backgroundSize: "50px 50px",
            }}
          ></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-2 lg:gap-16 items-center">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                  <Brain className="h-4 w-4" />
                  <span>Powered by Advanced AI Technology</span>
                </div>

                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none">
                  <span className="holographic">Prompt to Infra</span>
                  <br />
                  <span className="text-foreground">Ready in</span>
                  <br />
                  <span className="text-primary">Minutes</span>
                </h1>

                <p className="max-w-[600px] text-foreground/80 text-lg md:text-xl leading-relaxed">
                  Transform your application ideas into <span className="text-primary font-semibold">production-ready infrastructure</span> instantly. 
                  Generate <span className="text-secondary font-semibold">Terraform code</span>, 
                  <span className="text-accent font-semibold"> AWS architecture</span>, and 
                  <span className="text-primary font-semibold"> deploy automatically</span> with AI.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/smart-architect">
                    <Button className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan transition-all duration-200 hover:scale-105 text-lg px-8 py-6">
                      <Brain className="mr-2 h-5 w-5" />
                      Smart Cloud Architect
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full sm:w-auto border-border/50 hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all duration-200 text-lg px-8 py-6">
                      <Zap className="mr-2 h-5 w-5" />
                      Create Infrastructure
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button variant="outline" className="w-full sm:w-auto border-border/50 hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all duration-200 text-lg px-8 py-6">
                      <Play className="mr-2 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </Link>
                </div>

                <div className="flex items-center gap-6 text-sm text-foreground/60">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Deploy in minutes</span>
                  </div>
                </div>
              </div>

              <div className="relative">
                <WorkflowAnimation />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-muted/30">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl md:text-4xl font-bold">
                From Idea to Infrastructure in Minutes
              </h2>
              <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
                Describe your application architecture and let AI generate everything you need to deploy on AWS
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Analysis</h3>
                <p className="text-foreground/70">
                  Describe your app idea in plain English. Our AI analyzes your requirements and generates optimal infrastructure architecture.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Code2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Terraform Generation</h3>
                <p className="text-foreground/70">
                  Automatically generate production-ready Terraform code with best practices, security, and cost optimization built-in.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Server className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">One-Click Deployment</h3>
                <p className="text-foreground/70">
                  Deploy your infrastructure directly to AWS with a single click. Monitor deployment progress in real-time.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Database className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Architecture Diagrams</h3>
                <p className="text-foreground/70">
                  Get visual UML diagrams showing your infrastructure components, data flow, and system architecture.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AWS Best Practices</h3>
                <p className="text-foreground/70">
                  Infrastructure follows AWS Well-Architected Framework with security, reliability, and cost optimization.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="group p-6 rounded-2xl bg-background border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <BarChart2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Cost Estimation</h3>
                <p className="text-foreground/70">
                  Get upfront cost estimates for your infrastructure before deployment. Optimize for cost and performance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon Section */}
        <section className="py-16 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="text-center space-y-4 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 text-sm font-medium">
                <Sparkles className="h-4 w-4" />
                <span>Coming Soon</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold">
                Full Application Generation
              </h2>
              <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
                Beyond infrastructure, we're building AI-powered application code generation. Generate complete applications from your ideas.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto">
                  <Code2 className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Frontend Generation</h3>
                <p className="text-foreground/70">
                  Generate React, Vue, or Angular applications with modern UI components and responsive design.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto">
                  <Server className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Backend APIs</h3>
                <p className="text-foreground/70">
                  Generate Node.js, Python, or Go backend APIs with authentication, database models, and business logic.
                </p>
              </div>

              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-yellow-500/10 flex items-center justify-center mx-auto">
                  <Database className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-semibold">Database Schema</h3>
                <p className="text-foreground/70">
                  Generate database schemas, migrations, and seed data for PostgreSQL, MySQL, or MongoDB.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 md:py-24 bg-primary/5">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Deploy Your Infrastructure?
            </h2>
            <p className="text-foreground/70 text-lg mb-8 max-w-2xl mx-auto">
              Join thousands of developers who are deploying infrastructure faster than ever before.
            </p>
            <Link href="/register">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan transition-all duration-200 hover:scale-105 text-lg px-8 py-6">
                <Zap className="mr-2 h-5 w-5" />
                Start Building Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 bg-muted/30">
        <div className="container px-4 md:px-6 py-12">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 font-bold text-xl">
                <Cloud className="h-6 w-6 text-primary" />
                <span>InfraAI</span>
              </Link>
              <p className="text-foreground/70 text-sm">
                Transform your ideas into production-ready infrastructure with AI.
              </p>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Product</h3>
              <div className="space-y-2 text-sm text-foreground/70">
                <Link href="/features" className="block hover:text-primary transition-colors">Features</Link>
                <Link href="/pricing" className="block hover:text-primary transition-colors">Pricing</Link>
                <Link href="/docs" className="block hover:text-primary transition-colors">Documentation</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Company</h3>
              <div className="space-y-2 text-sm text-foreground/70">
                <Link href="/about" className="block hover:text-primary transition-colors">About</Link>
                <Link href="/blog" className="block hover:text-primary transition-colors">Blog</Link>
                <Link href="/contact" className="block hover:text-primary transition-colors">Contact</Link>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="font-semibold">Support</h3>
              <div className="space-y-2 text-sm text-foreground/70">
                <Link href="/help" className="block hover:text-primary transition-colors">Help Center</Link>
                <Link href="/status" className="block hover:text-primary transition-colors">Status</Link>
                <Link href="/privacy" className="block hover:text-primary transition-colors">Privacy</Link>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-foreground/70">
            <p>&copy; 2024 InfraAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
