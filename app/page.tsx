"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Code2, FileText, Layers, Play } from "lucide-react"
import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Mermaid from "@/components/mermaid-component"
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
                  Transform Your Ideas into Visual Diagrams
                </h1>
                <p className="max-w-[600px] text-white/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Generate UML diagrams, flowcharts, and architecture diagrams using AI. Create, manage, and deploy your
                  projects with ease.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1 bg-accent hover:bg-accent/80 text-white shadow-lg">
                      Get Started
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

        <section className="w-full py-12 md:py-20 bg-white dark:bg-gray-950 border-b">
          <div className="container px-4 md:px-6 max-w-3xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2">Try the AI Diagram Playground</h2>
              <p className="text-muted-foreground max-w-xl mb-4">
                Type a prompt and see a live UML diagram generated instantly by AI.
              </p>
            </div>
            <PlaygroundDemo />
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to visualize and document your projects
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border-2 border-primary bg-primary/10 p-6 shadow-md">
                <div className="rounded-full bg-accent p-3 text-white shadow-lg">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-primary">UML Diagrams</h3>
                <p className="text-center text-muted-foreground">
                  Generate class diagrams, sequence diagrams, and more using AI
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border-2 border-accent bg-accent/10 p-6 shadow-md">
                <div className="rounded-full bg-secondary p-3 text-white shadow-lg">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-accent">Documentation</h3>
                <p className="text-center text-muted-foreground">
                  Create high-level and low-level design documentation automatically
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border-2 border-secondary bg-secondary/10 p-6 shadow-md">
                <div className="rounded-full bg-primary p-3 text-white shadow-lg">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-secondary">Infrastructure as Code</h3>
                <p className="text-center text-muted-foreground">
                  Generate and deploy Terraform configurations for cloud infrastructure
                </p>
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

function PlaygroundDemo() {
  const templates = {
    class: {
      label: "Class Diagram",
      prompt: "Generate a class diagram for a blog platform with User, Post, and Comment.",
      diagram: `classDiagram
    class User {
        +String name
        +String email
        +createPost()
    }
    class Post {
        +String title
        +String content
        +addComment()
    }
    class Comment {
        +String content
        +Date createdAt
    }
    User "1" --> "0..*" Post : creates
    Post "1" --> "0..*" Comment : has`,
    },
    sequence: {
      label: "Sequence Diagram",
      prompt: "Generate a sequence diagram for a user logging in to a web app.",
      diagram: `sequenceDiagram
    User->>Browser: Enter credentials
    Browser->>Server: Send login request
    Server-->>Browser: Return token
    Browser-->>User: Show dashboard`,
    },
    component: {
      label: "Component Diagram",
      prompt: "Generate a component diagram for a serverless web app on AWS.",
      diagram: `flowchart TB
    Client --> APIGateway
    APIGateway --> Lambda
    Lambda --> DynamoDB
    Lambda --> S3
    S3 --> CloudFront`,
    },
    erd: {
      label: "ERD Diagram",
      prompt: "Generate an ERD for an e-commerce system with Customer, Order, and Product.",
      diagram: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ PRODUCT : contains
    CUSTOMER {
        string id PK
        string name
    }
    ORDER {
        string id PK
        date orderDate
    }
    PRODUCT {
        string id PK
        string name
        float price
    }`,
    },
  }

  const [tab, setTab] = useState<keyof typeof templates>("class")
  const [prompt, setPrompt] = useState(templates.class.prompt)
  const [diagram, setDiagram] = useState<string>(templates.class.diagram)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When tab changes, update prompt and diagram to template
  const handleTabChange = (value: string) => {
    const t = value as keyof typeof templates
    setTab(t)
    setPrompt(templates[t].prompt)
    setDiagram(templates[t].diagram)
    setError(null)
  }

  // Simulate AI generation (replace with real API call if available)
  const handleGenerate = () => {
    setLoading(true)
    setError(null)
    setTimeout(() => {
      setDiagram(
        prompt.includes("sequence")
          ? templates.sequence.diagram
          : prompt.includes("component")
            ? templates.component.diagram
            : prompt.includes("erd") || prompt.includes("entity") || prompt.includes("data model")
              ? templates.erd.diagram
              : templates.class.diagram,
      )
      setLoading(false)
    }, 1200)
  }

  return (
    <div className="rounded-2xl bg-muted/50 p-6 shadow-lg flex flex-col gap-6">
      <Tabs value={tab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="mb-4">
          {Object.entries(templates).map(([key, t]) => (
            <TabsTrigger key={key} value={key} className="capitalize">
              {t.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      <textarea
        className="w-full min-h-[80px] rounded-lg border border-border p-3 text-base focus:ring-2 focus:ring-primary focus:outline-none transition"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your system or diagram..."
        aria-label="Prompt for diagram generation"
      />
      <div className="flex gap-4 items-center justify-end">
        <button
          className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-white font-semibold shadow-md hover:bg-primary/90 active:scale-95 transition disabled:opacity-60"
          onClick={handleGenerate}
          disabled={loading}
        >
          <Play className="h-4 w-4" />
          {loading ? "Generating..." : "Generate Diagram"}
        </button>
      </div>
      <div className="w-full min-h-[220px] bg-white dark:bg-gray-900 rounded-lg border border-border p-4 flex items-center justify-center">
        {loading ? (
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        ) : (
          <Mermaid chart={diagram} className="transform scale-75 origin-top" />
        )}
      </div>
      {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
    </div>
  )
}
