"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Code2, FileText, Layers } from "lucide-react"

import WorkflowAnimation from "@/components/workflow-animation"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <BarChart2 className="h-6 w-6" />
            <span>VisualizeAI</span>
          </Link>
          <nav className="hidden md:flex gap-6">
            <Link href="/features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="/docs" className="text-sm font-medium hover:underline underline-offset-4">
              Documentation
            </Link>
          </nav>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-[#3B86D1] via-[#6C63FF] to-[#A084E8] text-white">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight drop-shadow-lg">
                  Transform Ideas into Production-Ready Applications
                </h1>
                <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  AI-powered platform that generates diagrams, documentation, infrastructure code, and full-stack
                  applications from simple descriptions. Go from concept to deployment in minutes.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1 bg-accent hover:bg-accent/80 text-white shadow-lg">
                      Start Building
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button
                      size="lg"
                      variant="secondary"
                      className="gap-1 border-white text-white hover:bg-white/10 hover:text-white"
                    >
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="w-full max-w-full overflow-hidden flex justify-center lg:justify-end">
                <div className="w-full max-w-[650px] min-w-0">
                  <WorkflowAnimation />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                  Complete Development Platform
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  From concept to deployment - everything you need to build production-ready applications
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mt-12">
              <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-primary bg-primary/10 p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-primary p-3 text-white shadow-lg">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary">AI Diagram Generation</h3>
                <p className="text-center text-sm text-muted-foreground">
                  UML, sequence, architecture, and ERD diagrams generated from natural language descriptions
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-accent bg-accent/10 p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-accent p-3 text-white shadow-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-accent">Smart Documentation</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Auto-generated technical docs, API contracts, and system specifications with TOC navigation
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-secondary bg-secondary/10 p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-secondary p-3 text-white shadow-lg">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-secondary">Full-Stack Code</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Complete React/TypeScript frontend and Node.js/Express backend applications ready to deploy
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 rounded-lg border-2 border-primary bg-primary/10 p-6 shadow-md hover:shadow-lg transition-shadow">
                <div className="rounded-full bg-primary p-3 text-white shadow-lg">
                  <BarChart2 className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-primary">Infrastructure as Code</h3>
                <p className="text-center text-sm text-muted-foreground">
                  Production-ready Terraform configurations for AWS with VPCs, load balancers, and databases
                </p>
              </div>
            </div>

            <div className="mt-16 bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary mb-2">Complete Workflow</h3>
                <p className="text-muted-foreground">See how VisualizeAI transforms your ideas into reality</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-blue-600 font-bold text-lg">1</span>
                  </div>
                  <h4 className="font-semibold text-primary">Describe Your System</h4>
                  <p className="text-sm text-muted-foreground">
                    Natural language input describing your application requirements
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-purple-600 font-bold text-lg">2</span>
                  </div>
                  <h4 className="font-semibold text-primary">AI Analysis & Design</h4>
                  <p className="text-sm text-muted-foreground">
                    AI generates architecture diagrams and system documentation
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-green-600 font-bold text-lg">3</span>
                  </div>
                  <h4 className="font-semibold text-primary">Code Generation</h4>
                  <p className="text-sm text-muted-foreground">
                    Full-stack application code and infrastructure configurations
                  </p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <span className="text-orange-600 font-bold text-lg">4</span>
                  </div>
                  <h4 className="font-semibold text-primary">Deploy & Scale</h4>
                  <p className="text-sm text-muted-foreground">
                    One-click deployment to cloud with auto-scaling infrastructure
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-primary text-white border-t-0 py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-accent" />
            <span className="text-lg font-semibold text-accent">VisualizeAI</span>
          </div>
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/terms" className="text-xs hover:underline underline-offset-4">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-xs hover:underline underline-offset-4">
              Privacy Policy
            </Link>
          </nav>
          <div className="flex-1 text-center md:text-right text-xs">© 2025 VisualizeAI. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
