"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import Mermaid from "@/components/mermaid-component"

const diagrams = [
  {
    title: "Class Diagram",
    prompt: "Design a blog system with users, posts and comments",
    type: "diagram",
    diagram: `classDiagram
    class User {
        +String name
        +String email
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
    color: "from-blue-600 to-indigo-700",
  },
  {
    title: "Documentation",
    prompt: "Generate comprehensive API documentation",
    type: "documentation",
    content: `# Blog API Documentation

## Overview
A RESTful API for managing blog posts, users, and comments.

## Endpoints

### Users
- **GET** /api/users - Get all users
- **POST** /api/users - Create new user
- **GET** /api/users/:id - Get user by ID

### Posts  
- **GET** /api/posts - Get all posts
- **POST** /api/posts - Create new post
- **PUT** /api/posts/:id - Update post
- **DELETE** /api/posts/:id - Delete post

### Comments
- **GET** /api/posts/:id/comments - Get post comments
- **POST** /api/posts/:id/comments - Add comment

## Authentication
All endpoints require JWT token in Authorization header.`,
    color: "from-purple-600 to-pink-600",
  },
  {
    title: "Infrastructure Code",
    prompt: "Create AWS infrastructure with Terraform",
    type: "code",
    code: `# main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# VPC
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "blog-vpc"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "blog-igw"
  }
}

# ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "blog-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier = "blog-db"
  engine     = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.micro"
  allocated_storage = 20
  
  db_name  = "blogdb"
  username = var.db_username
  password = var.db_password
  
  skip_final_snapshot = true
}`,
    color: "from-emerald-600 to-teal-700",
  },
  {
    title: "Application Code",
    prompt: "Generate a React blog app with authentication",
    type: "code",
    code: `// BlogApp.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { BlogPost } from './types';

export default function BlogApp() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch('/api/posts', {
        headers: {
          'Authorization': \`Bearer \${user?.token}\`
        }
      });
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (title: string, content: string) => {
    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': \`Bearer \${user?.token}\`
        },
        body: JSON.stringify({ title, content })
      });
      
      if (response.ok) {
        fetchPosts(); // Refresh posts
      }
    } catch (error) {
      console.error('Failed to create post:', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <header className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">My Blog</h1>
        <div className="flex items-center gap-4">
          <span>Welcome, {user?.name}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </header>

      <main>
        {posts.map(post => (
          <article key={post.id} className="mb-8 p-6 border rounded-lg">
            <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 mb-4">{post.content}</p>
            <div className="text-sm text-gray-500">
              By {post.author} • {post.createdAt}
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}`,
    color: "from-orange-600 to-red-600",
  },
  {
    title: "Deploy to Cloud",
    prompt: "Deploy the application to AWS",
    type: "deployment",
    content: `🚀 Deployment Status

✅ Infrastructure provisioned
✅ Database migrated  
✅ Application built
✅ Docker images pushed
✅ ECS services deployed

🌐 Your application is live at:
https://blog-app.example.com

📊 Deployment Summary:
• Region: us-east-1
• Environment: production
• Instances: 2x t3.medium
• Database: PostgreSQL 15.4
• CDN: CloudFront enabled
• SSL: Certificate issued

⏱️ Deployment completed in 4m 32s`,
    color: "from-green-600 to-blue-600",
  },
]

export default function HeroAnimationFramer() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [typedText, setTypedText] = useState("")
  const [isTyping, setIsTyping] = useState(true)
  const [showDiagram, setShowDiagram] = useState(false)
  const [phase, setPhase] = useState<"typing" | "processing" | "complete">("typing")

  const currentDiagram = diagrams[currentIndex]

  // Handle typing animation
  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (phase === "typing") {
      if (typedText.length < currentDiagram.prompt.length) {
        timeout = setTimeout(() => {
          setTypedText(currentDiagram.prompt.substring(0, typedText.length + 1))
        }, 70)
      } else {
        setIsTyping(false)
        timeout = setTimeout(() => {
          setPhase("processing")

          // After "processing" phase, show diagram
          setTimeout(() => {
            setShowDiagram(true)
            setPhase("complete")

            // After showing diagram for a while, reset and move to next
            setTimeout(() => {
              setCurrentIndex((prev) => (prev + 1) % diagrams.length)
              setTypedText("")
              setIsTyping(true)
              setShowDiagram(false)
              setPhase("typing")
            }, 4000)
          }, 2000)
        }, 500)
      }
    }

    return () => clearTimeout(timeout)
  }, [typedText, phase, currentIndex, currentDiagram.prompt.length])

  return (
    <motion.div
      className="relative w-full max-w-[650px] aspect-[4/3] rounded-2xl bg-white shadow-2xl dark:bg-gray-900 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header with dynamic gradient */}
      <motion.div
        className={`bg-gradient-to-r ${currentDiagram.color} p-4 text-white`}
        animate={{
          background: `linear-gradient(to right, var(--${currentDiagram.color.split(" ")[0].substring(5)}), var(--${currentDiagram.color.split(" ")[1].substring(3)}))`,
        }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="flex gap-2">
            <motion.div className="w-3 h-3 rounded-full bg-red-400" whileHover={{ scale: 1.2 }} />
            <motion.div className="w-3 h-3 rounded-full bg-yellow-400" whileHover={{ scale: 1.2 }} />
            <motion.div className="w-3 h-3 rounded-full bg-green-400" whileHover={{ scale: 1.2 }} />
          </div>
          <motion.span
            className="ml-2 text-sm font-medium"
            key={currentDiagram.title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            VisualizeAI - {currentDiagram.title}
          </motion.span>
        </div>
      </motion.div>

      {/* Content */}
      <div className="p-6 h-full flex flex-col">
        {/* Input Section */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {currentDiagram.type === "deployment"
              ? "Deploy your application:"
              : `Describe your ${currentDiagram.type === "code" ? "application" : currentDiagram.type}:`}
          </label>
          <div className="relative">
            <motion.textarea
              className="w-full h-24 p-3 border border-gray-300 rounded-lg resize-none text-sm"
              value={typedText}
              readOnly
              placeholder="Type your description here..."
              initial={{ borderColor: "#e5e7eb" }}
              animate={{
                borderColor: phase === "typing" ? "#e5e7eb" : phase === "processing" ? "#3b82f6" : "#10b981",
              }}
              transition={{ duration: 0.3 }}
            />
            {isTyping && (
              <motion.div
                className="absolute bottom-3 right-3 w-0.5 h-4 bg-blue-500"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
              />
            )}
          </div>
        </div>

        {/* Generate Button */}
        <div className="mb-4">
          <motion.button
            className={`px-4 py-2 rounded-lg font-medium text-white ${
              phase === "typing" ? "bg-gray-400" : phase === "processing" ? "bg-blue-500" : "bg-green-500"
            }`}
            whileHover={phase !== "typing" ? { scale: 1.03 } : {}}
            whileTap={phase !== "typing" ? { scale: 0.98 } : {}}
            disabled={phase === "typing"}
          >
            {phase === "typing" && "Typing..."}
            {phase === "processing" && (
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                />
                {currentDiagram.type === "deployment" ? "Deploying..." : "Generating..."}
              </div>
            )}
            {phase === "complete" && (currentDiagram.type === "deployment" ? "Deployed!" : "Generated!")}
          </motion.button>
        </div>

        {/* Content Section */}
        <motion.div
          className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden"
          animate={{
            borderColor: phase === "complete" ? "#10b981" : "#e5e7eb",
            boxShadow: phase === "complete" ? "0 0 0 2px rgba(16, 185, 129, 0.2)" : "none",
          }}
        >
          <AnimatePresence mode="wait">
            {!showDiagram ? (
              <motion.div
                key="placeholder"
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {phase === "typing" ? (
                  <div className="text-gray-500">Waiting for input...</div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <motion.div
                      className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
                    />
                    <div className="text-sm text-gray-600">AI is working...</div>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="content"
                className="w-full h-full p-2"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                {currentDiagram.type === "code" ? (
                  <div className="w-full h-full bg-gray-900 rounded-lg p-4 overflow-auto">
                    <pre className="text-green-400 text-xs font-mono leading-relaxed whitespace-pre-wrap">
                      {currentDiagram.code}
                    </pre>
                  </div>
                ) : currentDiagram.type === "documentation" ? (
                  <div className="w-full h-full bg-white rounded-lg p-4 overflow-auto">
                    <div className="prose prose-sm max-w-none">
                      <pre className="text-gray-800 text-xs leading-relaxed whitespace-pre-wrap">
                        {currentDiagram.content}
                      </pre>
                    </div>
                  </div>
                ) : currentDiagram.type === "deployment" ? (
                  <div className="w-full h-full bg-gray-900 rounded-lg p-4 overflow-auto">
                    <pre className="text-green-400 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                      {currentDiagram.content}
                    </pre>
                  </div>
                ) : (
                  <Mermaid chart={currentDiagram.diagram} />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
        {diagrams.map((_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full bg-gray-300"
            animate={{
              scale: index === currentIndex ? 1.5 : 1,
              backgroundColor: index === currentIndex ? "#3b82f6" : "#d1d5db",
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </motion.div>
  )
}
