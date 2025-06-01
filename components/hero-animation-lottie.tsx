"use client"

import { useEffect, useState } from "react"
import Mermaid from "@/components/mermaid-component"

const diagrams = [
  {
    title: "Class Diagram",
    prompt: "Create a user login flow diagram",
    diagram: `classDiagram
    class User {
        +String name
        +String email
        +login()
    }
    class Post {
        +String title
        +String content
    }
    class Comment {
        +String text
    }
    User "1" --> "*" Post
    Post "1" --> "*" Comment`,
    color: "bg-gradient-to-r from-blue-600 to-indigo-700",
  },
  {
    title: "Sequence Diagram",
    prompt: "Design a blog system class structure",
    diagram: `sequenceDiagram
    participant U as User
    participant A as App
    participant S as Server
    
    U->>A: Enter credentials
    A->>S: Validate login
    S-->>A: Return token
    A-->>U: Show dashboard`,
    color: "bg-gradient-to-r from-purple-600 to-pink-600",
  },
  {
    title: "Architecture Diagram",
    prompt: "Show AWS serverless architecture",
    diagram: `flowchart TB
    A[Client] --> B[API Gateway]
    B --> C[Lambda Functions]
    C --> D[(Database)]
    C --> E[S3 Storage]`,
    color: "bg-gradient-to-r from-emerald-600 to-teal-700",
  },
]

// Custom typing animation component
function TypingAnimation({ text, isActive }: { text: string; isActive: boolean }) {
  const [displayText, setDisplayText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (!isActive) {
      setDisplayText("")
      setCurrentIndex(0)
      return
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(text.slice(0, currentIndex + 1))
        setCurrentIndex(currentIndex + 1)
      }, 80)
      return () => clearTimeout(timeout)
    }
  }, [currentIndex, text, isActive])

  return (
    <div className="p-3 text-sm text-gray-700 dark:text-gray-300 font-mono">
      {displayText}
      {isActive && currentIndex < text.length && <span className="animate-pulse text-blue-500">|</span>}
    </div>
  )
}

// Custom processing animation component
function ProcessingAnimation({ isActive }: { isActive: boolean }) {
  if (!isActive) return null

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin">
          <div className="absolute top-0 left-0 w-4 h-4 bg-blue-600 rounded-full animate-ping"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
        </div>
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400 font-medium animate-pulse">
        🤖 AI is analyzing your request...
      </div>
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.2}s` }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export default function HeroAnimationLottie() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [phase, setPhase] = useState<"typing" | "processing" | "complete">("typing")
  const [showDiagram, setShowDiagram] = useState(false)
  const [diagramKey, setDiagramKey] = useState(0) // Force re-render of diagram

  const currentDiagram = diagrams[currentIndex]

  // Control animation phases
  useEffect(() => {
    let timeout: NodeJS.Timeout

    const runCycle = () => {
      // Reset state
      setShowDiagram(false)
      setPhase("typing")

      // Typing phase - 3 seconds
      timeout = setTimeout(() => {
        setPhase("processing")

        // Processing phase - 2 seconds
        timeout = setTimeout(() => {
          setShowDiagram(true)
          setDiagramKey((prev) => prev + 1) // Force diagram re-render
          setPhase("complete")

          // Complete phase - 4 seconds before cycling
          timeout = setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % diagrams.length)
          }, 4000)
        }, 2000)
      }, 3000)
    }

    runCycle()

    return () => clearTimeout(timeout)
  }, [currentIndex])

  // Debug logging
  useEffect(() => {
    console.log("Hero Animation State:", {
      currentIndex,
      phase,
      showDiagram,
      diagramData: currentDiagram.diagram,
      diagramTitle: currentDiagram.title,
    })
  }, [currentIndex, phase, showDiagram, currentDiagram])

  return (
    <div className="relative w-full max-w-[650px] aspect-[4/3] rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Header with dynamic gradient */}
      <div className={`${currentDiagram.color} p-4 text-white transition-all duration-1000`}>
        <div className="flex items-center gap-3 mb-2">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-red-400 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-sm"></div>
            <div className="w-3 h-3 rounded-full bg-green-400 shadow-sm"></div>
          </div>
          <span className="ml-2 text-sm font-semibold">VisualizeAI - {currentDiagram.title}</span>
        </div>
        <div className="text-xs opacity-90">✨ AI-Powered Diagram Generation</div>
      </div>

      {/* Content */}
      <div className="p-6 h-full flex flex-col">
        {/* Input Section */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            💬 Describe what you want to visualize:
          </label>
          <div className="relative h-24 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-800 overflow-hidden">
            <TypingAnimation text={currentDiagram.prompt} isActive={phase === "typing"} />
          </div>
        </div>

        {/* Generate Button */}
        <div className="mb-6">
          <button
            className={`px-6 py-3 rounded-xl font-semibold text-white transition-all duration-500 flex items-center gap-2 shadow-lg ${
              phase === "typing"
                ? "bg-gray-400 cursor-not-allowed"
                : phase === "processing"
                  ? "bg-blue-500 animate-pulse"
                  : "bg-green-500"
            }`}
            disabled={phase === "typing"}
          >
            {phase === "typing" && "✏️ Keep typing..."}
            {phase === "processing" && (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>🤖
                AI is generating...
              </>
            )}
            {phase === "complete" && "✅ Diagram generated!"}
          </button>
        </div>

        {/* Diagram Section */}
        <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center transition-all duration-500 overflow-hidden">
          {!showDiagram ? (
            <div className="text-center">
              {phase === "typing" ? (
                <div className="text-gray-400 dark:text-gray-500">
                  <div className="text-4xl mb-2">📝</div>
                  <div className="text-sm animate-pulse">Waiting for your description...</div>
                </div>
              ) : (
                <ProcessingAnimation isActive={phase === "processing"} />
              )}
            </div>
          ) : (
            <div className="w-full h-full p-3 animate-fadeIn">
              <div className="w-full h-full overflow-hidden bg-white dark:bg-gray-900 rounded-lg shadow-inner">
                <Mermaid
                  key={`${currentIndex}-${diagramKey}`}
                  chart={currentDiagram.diagram}
                  className="hero-diagram h-full"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Progress Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-3">
        {diagrams.map((_, index) => (
          <div
            key={index}
            className={`transition-all duration-500 rounded-full ${
              index === currentIndex
                ? "w-8 h-3 bg-white shadow-lg"
                : "w-3 h-3 bg-white/40 hover:bg-white/60 cursor-pointer"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>

      {/* Floating badge */}
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-gray-700 shadow-lg border border-white/20">
        🎬 Live Demo
      </div>
    </div>
  )
}
