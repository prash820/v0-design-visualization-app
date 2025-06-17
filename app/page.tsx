"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Code2, FileText, Layers, Zap, Brain, Cpu, Network } from "lucide-react"

import WorkflowAnimation from "@/components/workflow-animation"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="border-b border-border/50 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl group">
            <div className="relative">
              <BarChart2 className="h-7 w-7 text-primary transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-300"></div>
            </div>
            <span className="holographic text-xl font-black tracking-tight">VisualizeAI</span>
          </Link>
          <nav className="hidden md:flex gap-8">
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
                  <span className="holographic">Transform Ideas</span>
                  <br />
                  <span className="text-foreground">into</span>
                  <br />
                  <span className="text-primary">Production-Ready</span>
                  <br />
                  <span className="text-accent">Applications</span>
                </h1>

                <p className="max-w-[600px] text-foreground/80 text-lg md:text-xl leading-relaxed">
                  AI platform that generates <span className="text-primary font-semibold">diagrams</span>,
                  <span className="text-secondary font-semibold"> documentation</span>,
                  <span className="text-accent font-semibold"> infrastructure code</span>, and
                  <span className="text-primary font-semibold"> full-stack applications</span> from simple descriptions.
                  Go from concept to deployment in minutes.
                </p>

                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button
                      size="lg"
                      className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground glow-cyan transition-all duration-300 hover:scale-105 text-base px-8 py-6"
                    >
                      <Zap className="h-5 w-5" />
                      Start Building
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button
                      size="lg"
                      variant="outline"
                      className="gap-2 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 text-base px-8 py-6"
                    >
                      <Network className="h-5 w-5" />
                      View App Demo
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="w-full max-w-full overflow-hidden flex justify-center lg:justify-end">
                <div className="w-full max-w-[650px] min-w-0 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl"></div>
                  <div className="relative">
                    <WorkflowAnimation />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-16 md:py-24 lg:py-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background"></div>

          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-sm font-medium">
                <Cpu className="h-4 w-4" />
                <span>Advanced AI Architecture</span>
              </div>

              <h2 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight">
                <span className="holographic">Complete Development</span>
                <br />
                <span className="text-foreground">Platform</span>
              </h2>

              <p className="max-w-[900px] text-foreground/70 text-lg md:text-xl leading-relaxed">
                From concept to deployment - everything you need to build production-ready applications with AI
                precision
              </p>
            </div>

            <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* AI Diagram Generation */}
              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                  <div className="rounded-2xl bg-primary/10 p-4 glow-cyan group-hover:scale-110 transition-transform duration-300">
                    <Layers className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary">AI Diagram Generation</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Advanced AI generates UML, sequence, and architecture diagrams from natural language with AI
                    precision
                  </p>
                </div>
              </div>

              {/* Smart Documentation */}
              <div className="group relative overflow-hidden rounded-2xl border border-accent/20 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-accent/40 hover:bg-card/80 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                  <div className="rounded-2xl bg-accent/10 p-4 glow-neural group-hover:scale-110 transition-transform duration-300">
                    <FileText className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-bold text-accent">Smart Documentation</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Auto-generated technical docs, API contracts, and system specifications with advanced TOC navigation
                  </p>
                </div>
              </div>

              {/* Full-Stack Code */}
              <div className="group relative overflow-hidden rounded-2xl border border-secondary/20 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-secondary/40 hover:bg-card/80 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                  <div className="rounded-2xl bg-secondary/10 p-4 glow-purple group-hover:scale-110 transition-transform duration-300">
                    <Code2 className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-bold text-secondary">AI Code Generation</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Complete React/TypeScript frontend and Node.js/Express backend applications ready for deployment
                  </p>
                </div>
              </div>

              {/* Infrastructure as Code */}
              <div className="group relative overflow-hidden rounded-2xl border border-primary/20 bg-card/50 backdrop-blur-sm p-8 transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10 flex flex-col items-center space-y-4 text-center">
                  <div className="rounded-2xl bg-primary/10 p-4 glow-cyan group-hover:scale-110 transition-transform duration-300">
                    <BarChart2 className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary">Smart Infrastructure</h3>
                  <p className="text-sm text-foreground/70 leading-relaxed">
                    Production-ready Terraform configurations for advanced cloud with intelligent load balancers
                  </p>
                </div>
              </div>
            </div>

            {/* Workflow Section */}
            <div className="mt-24 relative overflow-hidden rounded-3xl border border-border/50 bg-card/30 backdrop-blur-xl p-12">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5"></div>

              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h3 className="text-3xl md:text-4xl font-black mb-4">
                    <span className="holographic">AI Workflow</span>
                  </h3>
                  <p className="text-foreground/70 text-lg">See how VisualizeAI transforms your ideas into reality</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                  {[
                    {
                      num: "01",
                      title: "AI Input",
                      desc: "Describe your system using natural language processed by advanced AI",
                      color: "primary",
                    },
                    {
                      num: "02",
                      title: "AI Analysis",
                      desc: "AI analyzes and generates architecture diagrams with advanced precision",
                      color: "secondary",
                    },
                    {
                      num: "03",
                      title: "Smart Docs",
                      desc: "Comprehensive technical documentation with advanced specifications",
                      color: "accent",
                    },
                    {
                      num: "04",
                      title: "Code Generation",
                      desc: "Infrastructure and full-stack application generation via advanced AI",
                      color: "primary",
                    },
                    {
                      num: "05",
                      title: "Smart Deploy",
                      desc: "One-click deployment to advanced cloud infrastructure",
                      color: "secondary",
                    },
                  ].map((step, index) => (
                    <div key={index} className="text-center space-y-4 group">
                      <div
                        className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-all duration-300 group-hover:scale-110 ${
                          step.color === "primary"
                            ? "bg-primary/10 glow-cyan"
                            : step.color === "secondary"
                              ? "bg-secondary/10 glow-purple"
                              : "bg-accent/10 glow-neural"
                        }`}
                      >
                        <span
                          className={`font-black text-lg ${
                            step.color === "primary"
                              ? "text-primary"
                              : step.color === "secondary"
                                ? "text-secondary"
                                : "text-accent"
                          }`}
                        >
                          {step.num}
                        </span>
                      </div>
                      <h4 className="font-bold text-foreground text-lg">{step.title}</h4>
                      <p className="text-sm text-foreground/70 leading-relaxed">{step.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-card/30 backdrop-blur-xl py-12">
        <div className="container flex flex-col items-center justify-center gap-6 px-4 md:px-6 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="relative">
              <BarChart2 className="h-6 w-6 text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl"></div>
            </div>
            <span className="text-xl font-black holographic">VisualizeAI</span>
          </div>
          <nav className="flex gap-6 sm:gap-8">
            <Link
              href="/terms"
              className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="text-sm text-foreground/70 hover:text-primary transition-colors duration-200"
            >
              Privacy
            </Link>
          </nav>
          <div className="flex-1 text-center md:text-right text-sm text-foreground/70">
            © 3050 VisualizeAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
