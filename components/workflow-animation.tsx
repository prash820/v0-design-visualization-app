"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { BarChart2, FileText, Server, Rocket, ArrowRight, CheckCircle, Loader2, Zap } from "lucide-react"
import Mermaid from "@/components/mermaid-component"

// Define the workflow steps with better visual representation
const workflowSteps = [
  {
    id: "overview",
    title: "Complete Workflow",
    icon: <Zap className="h-4 w-4" />,
    color: "bg-gradient-to-r from-blue-500 to-purple-600",
    isOverview: true,
  },
  {
    id: "prompt",
    title: "Describe Your System",
    icon: <BarChart2 className="h-4 w-4" />,
    color: "bg-blue-500",
    prompt:
      "Generate a microservice architecture for an e-commerce platform with user authentication, product catalog, and order processing.",
  },
  {
    id: "diagrams",
    title: "AI Generates Diagrams",
    icon: <BarChart2 className="h-4 w-4" />,
    color: "bg-indigo-600",
    diagram: `classDiagram
    class Frontend {
      +requestData()
    }
    
    class APIGateway {
      +routeRequest()
    }
    
    class UserService {
      +getUserData()
    }
    
    class ProductService {
      +getProducts()
    }
    
    class OrderService {
      +createOrder()
    }
    
    class Database {
      +store()
    }
    
    Frontend --> APIGateway
    APIGateway --> UserService
    APIGateway --> ProductService
    APIGateway --> OrderService
    UserService --> Database
    ProductService --> Database
    OrderService --> Database`,
  },
  {
    id: "documentation",
    title: "Generate Documentation",
    icon: <FileText className="h-4 w-4" />,
    color: "bg-purple-600",
    documentation: `# 🏗️ E-Commerce Microservice Architecture

## 📋 Overview
This document outlines a scalable e-commerce platform built using microservices architecture.

## 🔧 Core Services

### 👤 User Service
- **Purpose**: Manages user profiles and authentication
- **Database**: Dedicated user database
- **Key Features**: Registration, profile management, user preferences

### 📦 Product Service  
- **Purpose**: Handles product catalog and inventory
- **Database**: Product database with search capabilities
- **Key Features**: Product CRUD, search, filtering, recommendations

### 🛒 Order Service
- **Purpose**: Processes customer orders and manages order lifecycle
- **Database**: Order database with transaction history
- **Key Features**: Order creation, status tracking, order history

### 💳 Payment Service
- **Purpose**: Handles payment processing and financial transactions
- **Integration**: Third-party payment gateways
- **Key Features**: Payment processing, refunds, transaction logs

## 🔄 Service Communication
- **API Gateway**: Central entry point for all client requests
- **Service Mesh**: Inter-service communication and load balancing
- **Event Bus**: Asynchronous communication for order events

## 🏗️ Architecture Patterns
- **Microservices**: Each service is independently deployable
- **Event-Driven**: Services communicate via events
- **CQRS**: Command Query Responsibility Segregation
- **Circuit Breaker**: Fault tolerance patterns

## 🔐 Security Considerations
- **OAuth 2.0**: Authentication and authorization
- **JWT Tokens**: Stateless authentication
- **API Rate Limiting**: Prevent abuse
- **Data Encryption**: At rest and in transit

## 📊 Monitoring & Observability
- **Distributed Tracing**: Request flow tracking
- **Metrics Collection**: Performance monitoring
- **Centralized Logging**: Log aggregation
- **Health Checks**: Service availability monitoring`,
  },
  {
    id: "infrastructure",
    title: "Generate Infrastructure",
    icon: <Server className="h-4 w-4" />,
    color: "bg-pink-600",
    code: `# AWS Infrastructure for E-Commerce Platform

provider "aws" {
  region = "us-west-2"
}

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"
  
  tags = {
    Name = "e-commerce-vpc"
  }
}

# Subnets
resource "aws_subnet" "public" {
  count = 2
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index}.0/24"
  availability_zone = "us-west-2\${count.index == 0 ? "a" : "b"}"
  
  tags = {
    Name = "public-subnet-\${count.index}"
  }
}

resource "aws_subnet" "private" {
  count = 2
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = "us-west-2\${count.index == 0 ? "a" : "b"}"
  
  tags = {
    Name = "private-subnet-\${count.index}"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "e-commerce-igw"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "e-commerce-cluster"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "e-commerce-alb"
  internal           = false
  load_balancer_type = "application"
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = false
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier     = "e-commerce-db"
  engine         = "postgres"
  engine_version = "13.7"
  instance_class = "db.t3.micro"
  
  allocated_storage = 20
  storage_encrypted = true
  
  db_name  = "ecommerce"
  username = "admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  skip_final_snapshot = true
}

# User Service
module "user_service" {
  source = "./modules/service"
  
  name       = "user-service"
  port       = 8080
  cluster_id = aws_ecs_cluster.main.id
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id
}

# Product Service
module "product_service" {
  source = "./modules/service"
  
  name       = "product-service"
  port       = 8081
  cluster_id = aws_ecs_cluster.main.id
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id
}

# Order Service
module "order_service" {
  source = "./modules/service"
  
  name       = "order-service"
  port       = 8082
  cluster_id = aws_ecs_cluster.main.id
  vpc_id     = aws_vpc.main.id
  subnet_ids = aws_subnet.private[*].id
}`,
  },
  {
    id: "deployment",
    title: "Deploy to Cloud",
    icon: <Rocket className="h-4 w-4" />,
    color: "bg-rose-600",
    deployment: {
      steps: [
        "🏗️ Provisioning AWS infrastructure...",
        "🐳 Building Docker container images...",
        "🚀 Deploying microservices to ECS...",
        "⚖️ Configuring load balancers...",
        "📊 Setting up monitoring & logging...",
        "✅ Running health checks...",
      ],
      status: "🎉 Deployment complete! Your e-commerce platform is now live at https://your-app.com",
    },
  },
]

export default function WorkflowAnimation() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isAnimating, setIsAnimating] = useState(true)
  const [typedText, setTypedText] = useState("")
  const [deploymentProgress, setDeploymentProgress] = useState(0)
  const [deploymentStep, setDeploymentStep] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [diagramRendered, setDiagramRendered] = useState(false)

  const step = workflowSteps[currentStep]

  // Handle typing animation for the prompt
  useEffect(() => {
    if (currentStep === 1 && step.prompt) {
      let index = 0
      const interval = setInterval(() => {
        if (index < step.prompt.length) {
          setTypedText(step.prompt.substring(0, index + 1))
          index++
        } else {
          clearInterval(interval)
          // Move to next step after typing completes
          setTimeout(() => {
            setCurrentStep(2)
          }, 1500)
        }
      }, 40)

      return () => clearInterval(interval)
    }
  }, [currentStep, step.prompt])

  // Handle deployment progress animation
  useEffect(() => {
    if (currentStep === 5) {
      const interval = setInterval(() => {
        setDeploymentProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval)
            return 100
          }
          return prev + 1.5
        })

        // Update deployment step based on progress
        if (deploymentProgress < 15) setDeploymentStep(0)
        else if (deploymentProgress < 30) setDeploymentStep(1)
        else if (deploymentProgress < 50) setDeploymentStep(2)
        else if (deploymentProgress < 70) setDeploymentStep(3)
        else if (deploymentProgress < 85) setDeploymentStep(4)
        else setDeploymentStep(5)
      }, 100)

      return () => clearInterval(interval)
    }
  }, [currentStep, deploymentProgress])

  // Auto-advance through steps with zoom effects
  useEffect(() => {
    if (!isAnimating) return

    const timeout = setTimeout(
      () => {
        if (currentStep === 0) {
          // Zoom in from overview
          setZoomLevel(1.2)
          setTimeout(() => {
            setCurrentStep(1)
            setZoomLevel(1)
          }, 800)
        } else if (currentStep < workflowSteps.length - 1) {
          // Zoom out then zoom in for transitions
          setZoomLevel(0.8)
          setTimeout(() => {
            setCurrentStep(currentStep + 1)
            setZoomLevel(1)
          }, 500)
        } else {
          // Reset to beginning with zoom out effect
          setZoomLevel(0.6)
          setTimeout(() => {
            setCurrentStep(0)
            setTypedText("")
            setDeploymentProgress(0)
            setDeploymentStep(0)
            setZoomLevel(1)
            setDiagramRendered(false)
          }, 1000)
        }
      },
      currentStep === 0 ? 3000 : currentStep === 1 ? 4000 : currentStep === 5 ? 8000 : 5000,
    )

    return () => clearTimeout(timeout)
  }, [currentStep, isAnimating])

  const contentRef = useRef<HTMLDivElement>(null)

  // Auto-scroll function for content areas - Fixed to work for all scrollable sections
  useEffect(() => {
    if (contentRef.current && (currentStep === 2 || currentStep === 3 || currentStep === 4 || currentStep === 5)) {
      const scrollContent = () => {
        if (!contentRef.current || !isAnimating) return

        const element = contentRef.current
        const maxScroll = element.scrollHeight - element.clientHeight

        if (maxScroll <= 0) return // No need to scroll if content fits

        // Start auto-scrolling after a delay
        const scrollTimeout = setTimeout(() => {
          let currentScroll = 0

          const scrollInterval = setInterval(() => {
            if (!isAnimating || (currentStep !== 2 && currentStep !== 3 && currentStep !== 4 && currentStep !== 5)) {
              clearInterval(scrollInterval)
              return
            }

            currentScroll += 2 // Scroll speed
            if (currentScroll >= maxScroll) {
              clearInterval(scrollInterval)

              // Reset scroll position after reaching bottom
              setTimeout(() => {
                if (contentRef.current) {
                  contentRef.current.scrollTop = 0
                }
              }, 1000)
            } else {
              if (contentRef.current) {
                contentRef.current.scrollTop = currentScroll
              }
            }
          }, 20) // Scroll interval
        }, 1500) // Delay before starting scroll

        return () => {
          clearTimeout(scrollTimeout)
        }
      }

      scrollContent()
    }
  }, [currentStep, isAnimating])

  // Track when diagram is rendered
  useEffect(() => {
    if (currentStep === 2) {
      const timer = setTimeout(() => {
        setDiagramRendered(true)

        // Add this to ensure diagram fits properly
        setTimeout(() => {
          const svgElement = document.querySelector(".diagram-container svg")
          if (svgElement) {
            svgElement.setAttribute("width", "100%")
            svgElement.setAttribute("height", "auto")
            svgElement.style.maxWidth = "100%"
          }
        }, 100)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [currentStep])

  // Add this specific effect for documentation scrolling
  useEffect(() => {
    if (currentStep === 3 && contentRef.current && isAnimating) {
      console.log("Setting up documentation scrolling")

      // Reset scroll position first
      if (contentRef.current) {
        contentRef.current.scrollTop = 0
      }

      const scrollInterval = setInterval(() => {
        if (!contentRef.current || !isAnimating || currentStep !== 3) {
          clearInterval(scrollInterval)
          return
        }

        const element = contentRef.current
        const maxScroll = element.scrollHeight - element.clientHeight

        console.log("Documentation scroll info:", {
          scrollHeight: element.scrollHeight,
          clientHeight: element.clientHeight,
          maxScroll: maxScroll,
        })

        if (maxScroll <= 0) {
          console.log("No need to scroll documentation")
          clearInterval(scrollInterval)
          return
        }

        // Increment scroll position
        element.scrollTop += 1

        // If we've reached the bottom, reset
        if (element.scrollTop >= maxScroll) {
          console.log("Reached bottom of documentation, resetting")
          setTimeout(() => {
            if (contentRef.current) {
              contentRef.current.scrollTop = 0
            }
          }, 1000)
          clearInterval(scrollInterval)
        }
      }, 30) // Slower scroll speed

      return () => clearInterval(scrollInterval)
    }
  }, [currentStep, isAnimating])

  return (
    <motion.div
      className="relative w-full max-w-[800px] aspect-[4/3] rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden border border-gray-200 dark:border-gray-700"
      animate={{ scale: zoomLevel }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      style={{
        maxWidth: "100%",
        width: "100%",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-3 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-red-400 shadow-sm"></div>
              <div className="w-2 h-2 rounded-full bg-yellow-400 shadow-sm"></div>
              <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm"></div>
            </div>
            <span className="ml-2 text-sm font-semibold">VisualizeAI - AI-Powered Development</span>
          </div>
          <div className="text-xs opacity-90 bg-white/20 px-2 py-1 rounded-full">🚀 From Idea to Production</div>
        </div>
      </div>

      {/* Progress Steps - Only show when not in overview */}
      {currentStep !== 0 && (
        <div className="flex justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          {workflowSteps.slice(1).map((s, index) => (
            <div key={s.id} className="flex items-center min-w-0 text-xs">
              <div
                className={`flex items-center justify-center w-6 h-6 rounded-full ${
                  index + 1 <= currentStep ? s.color : "bg-gray-300 dark:bg-gray-600"
                } text-white transition-all duration-500`}
              >
                {index + 1 < currentStep ? (
                  <CheckCircle className="h-3 w-3" />
                ) : index + 1 === currentStep ? (
                  s.icon
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              <span
                className={`ml-1 text-xs font-medium ${
                  index + 1 <= currentStep ? "text-gray-900 dark:text-gray-100" : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {s.title}
              </span>
              {index < workflowSteps.length - 2 && <ArrowRight className="mx-1 h-3 w-3 text-gray-400" />}
            </div>
          ))}
        </div>
      )}

      {/* Content Area */}
      <div className="p-3 h-[calc(100%-80px)] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="h-full w-full overflow-hidden"
          >
            {/* Overview Step */}
            {currentStep === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="space-y-4"
                >
                  <div className="text-4xl">🚀</div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    AI-Powered Development Workflow
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 max-w-lg">
                    Watch how VisualizeAI transforms a simple description into a complete, production-ready application
                  </p>
                  <div className="grid grid-cols-5 gap-2 mt-6">
                    {workflowSteps.slice(1).map((s, index) => (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.2 }}
                        className="flex flex-col items-center p-2 rounded-lg bg-gray-50 dark:bg-gray-800"
                      >
                        <div className={`p-1 rounded-full ${s.color} text-white mb-1`}>{s.icon}</div>
                        <span className="text-xs font-medium text-center leading-tight">{s.title}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>
            )}

            {/* Step 1: Prompt */}
            {currentStep === 1 && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-blue-500 rounded-full text-white">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold">💬 Describe Your System</h3>
                </div>
                <div className="flex-1 border-2 border-blue-200 dark:border-blue-900 rounded-xl p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                  <div className="mb-3">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      ✨ Tell us what you want to build:
                    </label>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-3 min-h-[80px] border border-gray-200 dark:border-gray-600">
                    <div className="font-mono text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                      {typedText}
                      <motion.span
                        className="inline-block w-0.5 h-4 bg-blue-500 ml-1"
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <motion.button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 font-semibold shadow-lg text-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {typedText.length < step.prompt.length ? (
                        <>
                          <Loader2 className="h-3 w-3 animate-spin" />
                          AI is analyzing...
                        </>
                      ) : (
                        <>
                          Generate Architecture
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Diagrams */}
            {currentStep === 2 && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1 bg-indigo-600 rounded-full text-white">
                    <BarChart2 className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold">🎨 AI Generated Architecture</h3>
                </div>
                <div className="flex-1 border-2 border-indigo-200 dark:border-indigo-900 rounded-xl p-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 overflow-hidden">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-white dark:bg-gray-900 rounded-lg p-2 overflow-hidden"
                  >
                    <div className="h-full overflow-y-auto overflow-x-hidden">
                      {diagramRendered ? (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="w-full max-h-full overflow-auto">
                            <Mermaid
                              chart={step.diagram}
                              className="diagram-container transform scale-[0.85] origin-top"
                              fallback={
                                <div className="flex flex-col items-center justify-center h-full p-4">
                                  <div className="text-3xl mb-3">📊</div>
                                  <h3 className="text-base font-medium mb-2">E-Commerce Microservice Architecture</h3>
                                  <div className="text-xs text-gray-500 text-center">
                                    Visualizing a scalable architecture with user, product, and order services
                                  </div>
                                </div>
                              }
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-3"></div>
                          <p className="text-indigo-600 dark:text-indigo-400 font-medium text-sm">
                            Generating diagram...
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-indigo-600 font-semibold">✨ Microservice Architecture</span> automatically
                    generated
                  </div>
                  <motion.button
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 font-semibold shadow-lg text-xs"
                    whileHover={{ scale: 1.05 }}
                  >
                    Create Documentation
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Step 3: Documentation */}
            {currentStep === 3 && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-purple-600 rounded-full text-white">
                    <FileText className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold">📚 Generated Documentation</h3>
                </div>
                <div className="flex-1 border-2 border-purple-200 dark:border-purple-900 rounded-xl p-3 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 overflow-hidden">
                  <div className="h-full bg-white dark:bg-gray-900 rounded-lg overflow-hidden">
                    <div
                      ref={contentRef}
                      className="h-full overflow-y-auto overflow-x-hidden p-3"
                      style={{ maxHeight: "100%", overflowY: "auto" }}
                    >
                      <div className="prose prose-sm dark:prose-invert max-w-none text-xs leading-relaxed">
                        {step.documentation.split("\n").map((line, i) => {
                          if (line.startsWith("# ")) {
                            return (
                              <h1 key={i} className="text-sm font-bold mt-0 mb-2 text-purple-700 dark:text-purple-300">
                                {line.substring(2)}
                              </h1>
                            )
                          } else if (line.startsWith("## ")) {
                            return (
                              <h2 key={i} className="text-xs font-bold mt-3 mb-1 text-purple-600 dark:text-purple-400">
                                {line.substring(3)}
                              </h2>
                            )
                          } else if (line.startsWith("### ")) {
                            return (
                              <h3
                                key={i}
                                className="text-xs font-semibold mt-2 mb-1 text-purple-500 dark:text-purple-500"
                              >
                                {line.substring(4)}
                              </h3>
                            )
                          } else if (line.startsWith("- ")) {
                            return (
                              <li key={i} className="ml-3 mb-1 text-xs text-gray-700 dark:text-gray-300 list-disc">
                                {line.substring(2)}
                              </li>
                            )
                          } else if (line === "") {
                            return <div key={i} className="h-2" />
                          } else {
                            return (
                              <p key={i} className="my-1 text-gray-700 dark:text-gray-300 text-xs">
                                {line}
                              </p>
                            )
                          }
                        })}

                        {/* Add extra content to ensure scrolling */}
                        <div className="mt-4 space-y-2">
                          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400">
                            🔧 Implementation Details
                          </h2>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Each microservice is containerized using Docker and deployed on Amazon ECS for scalability
                            and reliability.
                          </p>

                          <h3 className="text-xs font-semibold text-purple-500 mt-2">Database Strategy</h3>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Each service maintains its own database to ensure loose coupling and independent scaling.
                          </p>

                          <h3 className="text-xs font-semibold text-purple-500 mt-2">API Design</h3>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            RESTful APIs with OpenAPI specifications for clear documentation and client generation.
                          </p>

                          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-3">
                            📈 Performance Considerations
                          </h2>
                          <ul className="space-y-1">
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              Horizontal scaling with auto-scaling groups
                            </li>
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              Redis caching for frequently accessed data
                            </li>
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              CDN integration for static assets
                            </li>
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              Database read replicas for improved performance
                            </li>
                          </ul>

                          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-3">
                            🚀 Deployment Pipeline
                          </h2>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Automated CI/CD pipeline using GitHub Actions with blue-green deployment strategy.
                          </p>

                          <h3 className="text-xs font-semibold text-purple-500 mt-2">Testing Strategy</h3>
                          <ul className="space-y-1">
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              Unit tests with 90%+ coverage
                            </li>
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              Integration tests for API endpoints
                            </li>
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              End-to-end tests for critical user flows
                            </li>
                            <li className="text-xs text-gray-700 dark:text-gray-300 ml-3 list-disc">
                              Load testing for performance validation
                            </li>
                          </ul>

                          <h2 className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-3">
                            🔒 Security Implementation
                          </h2>
                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            Multi-layered security approach with authentication, authorization, and data protection.
                          </p>

                          <div className="mt-4 p-2 bg-purple-100 dark:bg-purple-900/30 rounded text-xs">
                            <strong>Note:</strong> This documentation is automatically generated and updated as your
                            architecture evolves.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-purple-600 font-semibold">📖 Technical Documentation</span> generated from
                    your architecture
                  </div>
                  <motion.button
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg flex items-center gap-2 font-semibold shadow-lg text-xs"
                    whileHover={{ scale: 1.05 }}
                  >
                    Generate Infrastructure
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Step 4: Infrastructure */}
            {currentStep === 4 && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-pink-600 rounded-full text-white">
                    <Server className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold">🏗️ Infrastructure as Code</h3>
                </div>
                <div className="flex-1 border-2 border-pink-200 dark:border-pink-900 rounded-xl p-3 bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 overflow-hidden">
                  <div className="h-full bg-gray-900 rounded-lg overflow-hidden">
                    <div ref={contentRef} className="h-full overflow-y-auto overflow-x-auto p-3">
                      <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap min-h-[300px]">
                        <code>{step.code}</code>
                      </pre>
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-pink-600 font-semibold">☁️ AWS Terraform</span> infrastructure ready for
                    deployment
                  </div>
                  <motion.button
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg flex items-center gap-2 font-semibold shadow-lg text-xs"
                    whileHover={{ scale: 1.05 }}
                  >
                    Deploy to Cloud
                    <ArrowRight className="h-3 w-3" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Step 5: Deployment */}
            {currentStep === 5 && (
              <div className="h-full flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-rose-600 rounded-full text-white">
                    <Rocket className="h-4 w-4" />
                  </div>
                  <h3 className="text-lg font-bold">🚀 Deploying to Production</h3>
                </div>
                <div className="flex-1 border-2 border-rose-200 dark:border-rose-900 rounded-xl p-4 bg-gradient-to-br from-rose-50 to-orange-50 dark:from-rose-950/30 dark:to-orange-950/30 overflow-hidden">
                  <div ref={contentRef} className="h-full overflow-y-auto overflow-x-hidden">
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold">Deployment Progress</span>
                        <span className="font-mono">{Math.round(deploymentProgress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-gradient-to-r from-rose-500 to-orange-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${deploymentProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3 min-h-[200px]">
                      {step.deployment.steps.map((deployStep, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.3 }}
                          className="flex items-center gap-2"
                        >
                          {idx <= deploymentStep ? (
                            <CheckCircle
                              className={`h-4 w-4 ${idx < deploymentStep ? "text-green-500" : "text-rose-500 animate-pulse"}`}
                            />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-gray-300 dark:border-gray-600"></div>
                          )}
                          <span
                            className={`text-xs ${idx <= deploymentStep ? "text-gray-900 dark:text-gray-100 font-medium" : "text-gray-400"}`}
                          >
                            {deployStep}
                          </span>
                          {idx === deploymentStep && idx < step.deployment.steps.length - 1 && (
                            <Loader2 className="h-3 w-3 animate-spin text-rose-500 ml-auto" />
                          )}
                        </motion.div>
                      ))}
                    </div>

                    {deploymentProgress === 100 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-xs">{step.deployment.status}</span>
                      </motion.div>
                    )}
                  </div>
                </div>
                <div className="mt-2 flex justify-between items-center">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    <span className="text-rose-600 font-semibold">☁️ AWS Deployment</span> in progress
                  </div>
                  {deploymentProgress === 100 ? (
                    <motion.button
                      className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2 font-semibold shadow-lg text-xs"
                      whileHover={{ scale: 1.05 }}
                    >
                      🎉 View Live App
                      <ArrowRight className="h-3 w-3" />
                    </motion.button>
                  ) : (
                    <button className="px-4 py-2 bg-rose-600 text-white rounded-lg flex items-center gap-2 font-semibold opacity-75 text-xs">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Deploying...
                    </button>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="absolute bottom-2 right-2 flex gap-1">
        <motion.button
          onClick={() => setIsAnimating(!isAnimating)}
          className="p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition-colors shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isAnimating ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          )}
        </motion.button>
      </div>
    </motion.div>
  )
}
