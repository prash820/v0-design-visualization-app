import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BarChart2, Code2, FileText, Layers } from "lucide-react"

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
        <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Transform Your Ideas into Visual Diagrams
                </h1>
                <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Generate UML diagrams, flowcharts, and architecture diagrams using AI. Create, manage, and deploy your
                  projects with ease.
                </p>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/register">
                    <Button size="lg" className="gap-1">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/demo">
                    <Button size="lg" variant="outline">
                      View Demo
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="mx-auto lg:ml-auto flex justify-center">
                <div className="relative w-full max-w-[500px] aspect-video rounded-xl border bg-white p-4 shadow-lg dark:bg-gray-950">
                  <img
                    src="/uml-colorful-diagram.png"
                    alt="UML Diagram Preview"
                    className="rounded-md w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Key Features</h2>
                <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                  Everything you need to visualize and document your projects
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">UML Diagrams</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Generate class diagrams, sequence diagrams, and more using AI
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Documentation</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Create high-level and low-level design documentation automatically
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                <div className="rounded-full bg-gray-100 p-3 dark:bg-gray-800">
                  <Code2 className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold">Infrastructure as Code</h3>
                <p className="text-center text-gray-500 dark:text-gray-400">
                  Generate and deploy Terraform configurations for cloud infrastructure
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 px-4 md:px-6 md:flex-row">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5" />
            <span className="text-lg font-semibold">VisualizeAI</span>
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
