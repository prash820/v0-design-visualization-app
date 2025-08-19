"use client"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play,
  Pause,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Zap,
  FileText,
  Server,
  Code,
  Rocket,
  CheckCircle,
  Loader2,
  Eye,
  Download,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Mermaid from "@/components/mermaid-component"

const demoSteps = [
  {
    id: "input",
    title: "Describe Your System",
    subtitle: "Natural Language Input",
    icon: <MessageSquare className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-500",
    duration: 4000,
    content: {
      type: "input",
      prompt:
        "Create a modern e-commerce platform with user authentication, product catalog, shopping cart, order processing, payment integration, and admin dashboard. Include microservices architecture with API gateway, separate databases for each service, and deploy on AWS with auto-scaling capabilities.",
      features: [
        "🔐 User Authentication & Authorization",
        "📦 Product Catalog Management",
        "🛒 Shopping Cart & Checkout",
        "💳 Payment Processing Integration",
        "📊 Admin Dashboard & Analytics",
        "🏗️ Microservices Architecture",
        "☁️ AWS Cloud Deployment",
      ],
    },
  },
  {
    id: "processing",
    title: "AI Analysis",
    subtitle: "Understanding Requirements",
    icon: <Zap className="h-6 w-6" />,
    color: "from-purple-500 to-pink-500",
    duration: 3000,
    content: {
      type: "processing",
      steps: [
        "🧠 Analyzing system requirements...",
        "🔍 Identifying core components...",
        "🏗️ Planning architecture patterns...",
        "📋 Determining technology stack...",
        "🔗 Mapping service dependencies...",
        "☁️ Designing cloud infrastructure...",
      ],
    },
  },
  {
    id: "diagrams",
    title: "Generate Architecture",
    subtitle: "Visual System Design",
    icon: <Eye className="h-6 w-6" />,
    color: "from-indigo-500 to-blue-500",
    duration: 5000,
    content: {
      type: "diagrams",
      diagrams: [
        {
          title: "System Architecture",
          type: "architecture",
          diagram: `flowchart TB
    subgraph "Client Layer"
        Web[Web App]
        Mobile[Mobile App]
        Admin[Admin Panel]
    end
    
    subgraph "API Gateway"
        Gateway[API Gateway]
    end
    
    subgraph "Microservices"
        Auth[Auth Service]
        Product[Product Service]
        Cart[Cart Service]
        Order[Order Service]
        Payment[Payment Service]
        Notification[Notification Service]
    end
    
    subgraph "Databases"
        UserDB[(User DB)]
        ProductDB[(Product DB)]
        OrderDB[(Order DB)]
    end
    
    subgraph "External Services"
        PaymentGW[Payment Gateway]
        EmailSvc[Email Service]
    end
    
    Web --> Gateway
    Mobile --> Gateway
    Admin --> Gateway
    
    Gateway --> Auth
    Gateway --> Product
    Gateway --> Cart
    Gateway --> Order
    Gateway --> Payment
    Gateway --> Notification
    
    Auth --> UserDB
    Product --> ProductDB
    Cart --> UserDB
    Order --> OrderDB
    Payment --> PaymentGW
    Notification --> EmailSvc`,
        },
        {
          title: "Class Structure",
          type: "class",
          diagram: `classDiagram
      class User {
        +String name
        +String email
        -String password
        +login(): boolean
      }
      class Admin {
        +String role
        +manageUsers(): void
      }
      User <|-- Admin`,
        },
        {
          title: "API Flow",
          type: "sequence",
          diagram: `sequenceDiagram
      Client->>Server: POST /api/login
      Server->>Database: Validate credentials
      Database-->>Server: Return user data
      Server-->>Client: Return JWT token`,
        },
      ],
    },
  },
  {
    id: "documentation",
    title: "Create Documentation",
    subtitle: "Technical & Business Docs",
    icon: <FileText className="h-6 w-6" />,
    color: "from-green-500 to-emerald-500",
    duration: 4000,
    content: {
      type: "documentation",
      sections: [
        {
          title: "🎯 Project Overview",
          content: `# E-Commerce Platform

## Business Objectives
- Create a scalable online marketplace
- Support multiple vendors and customers
- Ensure high availability and performance
- Implement secure payment processing

## Key Features
- User registration and authentication
- Product catalog with search and filtering
- Shopping cart and checkout process
- Order management and tracking
- Payment integration with multiple gateways
- Admin dashboard for management`,
        },
        {
          title: "🏗️ Technical Architecture",
          content: `## Microservices Architecture

### Core Services
- **Auth Service**: JWT-based authentication
- **Product Service**: Catalog management
- **Cart Service**: Shopping cart operations
- **Order Service**: Order processing
- **Payment Service**: Payment gateway integration
- **Notification Service**: Email/SMS notifications

### Technology Stack
- **Frontend**: React.js with TypeScript
- **Backend**: Node.js with Express
- **Database**: PostgreSQL with Redis cache
- **Message Queue**: RabbitMQ
- **Container**: Docker with Kubernetes
- **Cloud**: AWS with auto-scaling`,
        },
        {
          title: "🔐 Security Implementation",
          content: `## Security Measures

### Authentication & Authorization
- JWT tokens with refresh mechanism
- Role-based access control (RBAC)
- OAuth2 integration for social login
- Multi-factor authentication (MFA)

### Data Protection
- Encryption at rest and in transit
- PCI DSS compliance for payments
- GDPR compliance for user data
- Regular security audits and penetration testing

### Infrastructure Security
- VPC with private subnets
- WAF for application protection
- SSL/TLS certificates
- Regular security updates`,
        },
      ],
    },
  },
  {
    id: "infrastructure",
    title: "Generate Infrastructure",
    subtitle: "Cloud-Ready Terraform",
    icon: <Server className="h-6 w-6" />,
    color: "from-orange-500 to-red-500",
    duration: 4000,
    content: {
      type: "infrastructure",
      code: `# E-Commerce Platform Infrastructure
# Generated by VisualizeAI

terraform {
  required_version = ">= 1.0"
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

# VPC Configuration
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true
  
  tags = {
    Name = "ecommerce-vpc"
    Environment = var.environment
  }
}

# Internet Gateway
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  
  tags = {
    Name = "ecommerce-igw"
  }
}

# Public Subnets
resource "aws_subnet" "public" {
  count = 2
  
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.\${count.index + 1}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true
  
  tags = {
    Name = "ecommerce-public-\${count.index + 1}"
    Type = "Public"
  }
}

# Private Subnets
resource "aws_subnet" "private" {
  count = 2
  
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.\${count.index + 10}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]
  
  tags = {
    Name = "ecommerce-private-\${count.index + 1}"
    Type = "Private"
  }
}

# EKS Cluster
resource "aws_eks_cluster" "main" {
  name     = "ecommerce-cluster"
  role_arn = aws_iam_role.eks_cluster.arn
  version  = "1.28"
  
  vpc_config {
    subnet_ids              = concat(aws_subnet.public[*].id, aws_subnet.private[*].id)
    endpoint_private_access = true
    endpoint_public_access  = true
  }
  
  depends_on = [
    aws_iam_role_policy_attachment.eks_cluster_policy,
  ]
}

# RDS Database
resource "aws_db_instance" "main" {
  identifier     = "ecommerce-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = "ecommerce"
  username = "admin"
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "ecommerce-db-final-snapshot"
  
  tags = {
    Name = "ecommerce-database"
  }
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "ecommerce-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_cluster" "main" {
  cluster_id           = "ecommerce-cache"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  subnet_group_name    = aws_elasticache_subnet_group.main.name
  security_group_ids   = [aws_security_group.redis.id]
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "ecommerce-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = aws_subnet.public[*].id
  
  enable_deletion_protection = false
  
  tags = {
    Name = "ecommerce-alb"
  }
}

# Variables
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "production"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}`,
    },
  },
  {
    id: "code",
    title: "Generate Application Code",
    subtitle: "Full-Stack Implementation",
    icon: <Code className="h-6 w-6" />,
    color: "from-cyan-500 to-blue-500",
    duration: 5000,
    content: {
      type: "code",
      files: [
        {
          name: "Frontend - Product Component",
          language: "typescript",
          code: `import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, isLoading } = useCart();
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      // Redirect to login
      return;
    }
    
    try {
      await addToCart({
        productId: product.id,
        quantity: 1,
        price: product.price
      });
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // API call to update favorites
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-300">
      <CardHeader className="p-0">
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            onClick={toggleFavorite}
          >
            <Heart className={\`h-4 w-4 \${isFavorite ? 'fill-red-500 text-red-500' : ''}\`} />
          </Button>
          {product.discount && (
            <Badge className="absolute top-2 left-2 bg-red-500">
              -{product.discount}%
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <CardTitle className="text-lg mb-2 line-clamp-2">
          {product.name}
        </CardTitle>
        
        <div className="flex items-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={\`h-4 w-4 \${
                i < product.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }\`}
            />
          ))}
          <span className="text-sm text-gray-600 ml-1">
            ({product.reviewCount})
          </span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">
              \${product.price}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">
                \${product.originalPrice}
              </span>
            )}
          </div>
          <Badge variant={product.stock > 0 ? 'default' : 'destructive'}>
            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
          </Badge>
        </div>
        
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isLoading || product.stock === 0}
        >
          <ShoppingCart className="h-4 w-4 mr-2" />
          {isLoading ? 'Adding...' : 'Add to Cart'}
        </Button>
      </CardContent>
    </Card>
  );
};`,
        },
        {
          name: "Backend - Order Service",
          language: "typescript",
          code: `import express from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { OrderService } from '../services/OrderService';
import { PaymentService } from '../services/PaymentService';
import { NotificationService } from '../services/NotificationService';
import { logger } from '../utils/logger';

const router = express.Router();
const orderService = new OrderService();
const paymentService = new PaymentService();
const notificationService = new NotificationService();

// Create new order
router.post('/orders',
  authenticateToken,
  [
    body('items').isArray().withMessage('Items must be an array'),
    body('items.*.productId').isUUID().withMessage('Invalid product ID'),
    body('items.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be positive'),
    body('shippingAddress').isObject().withMessage('Shipping address required'),
    body('paymentMethodId').notEmpty().withMessage('Payment method required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { items, shippingAddress, paymentMethodId } = req.body;
      const userId = req.user.id;

      // Calculate total amount
      const totalAmount = await orderService.calculateTotal(items);

      // Create order
      const order = await orderService.createOrder({
        userId,
        items,
        shippingAddress,
        totalAmount,
        status: 'pending'
      });

      // Process payment
      const paymentResult = await paymentService.processPayment({
        orderId: order.id,
        amount: totalAmount,
        paymentMethodId,
        currency: 'USD'
      });

      if (paymentResult.success) {
        // Update order status
        await orderService.updateOrderStatus(order.id, 'confirmed');
        
        // Send confirmation email
        await notificationService.sendOrderConfirmation({
          userId,
          orderId: order.id,
          orderDetails: order
        });

        // Update inventory
        await orderService.updateInventory(items);

        logger.info(\`Order \${order.id} created successfully for user \${userId}\`);
        
        res.status(201).json({
          success: true,
          order: {
            ...order,
            status: 'confirmed',
            paymentId: paymentResult.paymentId
          }
        });
      } else {
        // Payment failed
        await orderService.updateOrderStatus(order.id, 'payment_failed');
        
        res.status(400).json({
          success: false,
          message: 'Payment processing failed',
          error: paymentResult.error
        });
      }
    } catch (error) {
      logger.error('Order creation failed:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }
  }
);

// Get user orders
router.get('/orders',
  authenticateToken,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 10, status } = req.query;

      const orders = await orderService.getUserOrders({
        userId,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        status: status as string
      });

      res.json({
        success: true,
        orders: orders.data,
        pagination: {
          page: orders.page,
          limit: orders.limit,
          total: orders.total,
          totalPages: orders.totalPages
        }
      });
    } catch (error) {
      logger.error('Failed to fetch orders:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch orders'
      });
    }
  }
);

// Get order by ID
router.get('/orders/:orderId',
  authenticateToken,
  async (req, res) => {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await orderService.getOrderById(orderId, userId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      res.json({
        success: true,
        order
      });
    } catch (error) {
      logger.error('Failed to fetch order:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch order'
      });
    }
  }
);

export default router;`,
        },
      ],
    },
  },
  {
    id: "deployment",
    title: "Deploy to Production",
    subtitle: "Cloud Deployment",
    icon: <Rocket className="h-6 w-6" />,
    color: "from-pink-500 to-rose-500",
    duration: 6000,
    content: {
      type: "deployment",
      phases: [
        {
          name: "Infrastructure Provisioning",
          steps: [
            "🏗️ Creating VPC and networking components",
            "🔐 Setting up security groups and IAM roles",
            "🗄️ Provisioning RDS PostgreSQL database",
            "⚡ Configuring ElastiCache Redis cluster",
            "🚀 Creating EKS Kubernetes cluster",
          ],
        },
        {
          name: "Application Deployment",
          steps: [
            "🐳 Building Docker container images",
            "📦 Pushing images to ECR registry",
            "⚙️ Deploying microservices to EKS",
            "🔄 Configuring service mesh and load balancing",
            "📊 Setting up monitoring and logging",
          ],
        },
        {
          name: "Final Configuration",
          steps: [
            "🌐 Configuring domain and SSL certificates",
            "🔍 Running health checks and smoke tests",
            "📈 Setting up auto-scaling policies",
            "🚨 Configuring alerts and notifications",
            "✅ Deployment complete - System is live!",
          ],
        },
      ],
      metrics: {
        "Services Deployed": 6,
        "Database Tables": 12,
        "API Endpoints": 45,
        "Deployment Time": "8m 32s",
      },
    },
  },
]

export default function DemoWorkflow() {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  const step = demoSteps[currentStep]

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying) return

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          // Move to next step
          if (currentStep < demoSteps.length - 1) {
            setCurrentStep(currentStep + 1)
            return 0
          } else {
            // Reset to beginning
            setCurrentStep(0)
            return 0
          }
        }
        return prev + 100 / (step.duration / 100)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, currentStep, step.duration])

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setCurrentStep(0)
    setProgress(0)
  }

  const handleStepChange = (stepIndex: number) => {
    setCurrentStep(stepIndex)
    setProgress(0)
    setIsPlaying(false)
  }

  const handleNext = () => {
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress(0)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress(0)
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button onClick={handlePlay} className={`bg-gradient-to-r ${step.color} text-white hover:opacity-90`}>
            {isPlaying ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrevious} disabled={currentStep === 0} variant="outline" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium px-3">
            {currentStep + 1} of {demoSteps.length}
          </span>
          <Button onClick={handleNext} disabled={currentStep === demoSteps.length - 1} variant="outline" size="sm">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {demoSteps.map((s, index) => (
          <button
            key={s.id}
            onClick={() => handleStepChange(index)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              index === currentStep
                ? `bg-gradient-to-r ${s.color} text-white shadow-lg`
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            {s.icon}
            <span className="hidden sm:inline">{s.title}</span>
          </button>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>{step.title}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <motion.div
            className={`bg-gradient-to-r ${step.color} h-2 rounded-full`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Main Content */}
      <Card className="min-h-[600px]">
        <CardHeader className={`bg-gradient-to-r ${step.color} text-white`}>
          <div className="flex items-center gap-3">
            {step.icon}
            <div>
              <CardTitle className="text-2xl">{step.title}</CardTitle>
              <p className="text-white/80">{step.subtitle}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              <StepContent step={step} progress={progress} />
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>
    </div>
  )
}

function StepContent({ step, progress }: { step: (typeof demoSteps)[0]; progress: number }) {
  const { content } = step

  if (content.type === "input") {
    return <InputStep content={content} progress={progress} />
  } else if (content.type === "processing") {
    return <ProcessingStep content={content} progress={progress} />
  } else if (content.type === "diagrams") {
    return <DiagramsStep content={content} progress={progress} />
  } else if (content.type === "documentation") {
    return <DocumentationStep content={content} progress={progress} />
  } else if (content.type === "infrastructure") {
    return <InfrastructureStep content={content} progress={progress} />
  } else if (content.type === "code") {
    return <CodeStep content={content} progress={progress} />
  } else if (content.type === "deployment") {
    return <DeploymentStep content={content} progress={progress} />
  }

  return null
}

function InputStep({ content, progress }: { content: any; progress: number }) {
  const [typedText, setTypedText] = useState("")

  useEffect(() => {
    const targetLength = Math.floor((progress / 100) * content.prompt.length)
    setTypedText(content.prompt.substring(0, targetLength))
  }, [progress, content.prompt])

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">💬 System Description</h3>
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 min-h-[200px]">
            <div className="font-mono text-sm text-foreground">
              {typedText}
              {progress < 100 && (
                <motion.span
                  className="inline-block w-0.5 h-4 bg-primary ml-1"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
                />
              )}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">✨ Identified Features</h3>
          <div className="space-y-2">
            {content.features.map((feature: string, index: number) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{
                  opacity: progress > (index / content.features.length) * 100 ? 1 : 0.3,
                  x: 0,
                }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2 p-2 bg-card/50 border border-border rounded"
              >
                {progress > (index / content.features.length) * 100 ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                )}
                <span className="text-sm text-foreground">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function ProcessingStep({ content, progress }: { content: any; progress: number }) {
  const currentStepIndex = Math.floor((progress / 100) * content.steps.length)

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <motion.div
          className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "linear" }}
        />
        <h3 className="text-xl font-semibold">AI is analyzing your requirements...</h3>
      </div>

      <div className="space-y-3">
        {content.steps.map((step: string, index: number) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{
              opacity: index <= currentStepIndex ? 1 : 0.3,
              x: 0,
            }}
            className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border"
          >
            {index < currentStepIndex ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : index === currentStepIndex ? (
              <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
            ) : (
              <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
            )}
            <span className={index <= currentStepIndex ? "font-medium text-foreground" : "text-muted-foreground"}>
              {step}
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function DiagramsStep({ content, progress }: { content: any; progress: number }) {
  const [currentDiagram, setCurrentDiagram] = useState(0)

  useEffect(() => {
    const diagramIndex = Math.floor((progress / 100) * content.diagrams.length)
    setCurrentDiagram(Math.min(diagramIndex, content.diagrams.length - 1))
  }, [progress, content.diagrams.length])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Generated Architecture Diagrams</h3>
        <div className="flex gap-2">
          {content.diagrams.map((_: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentDiagram(index)}
              className={`px-3 py-1 rounded text-sm ${
                index === currentDiagram ? "bg-blue-500 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {content.diagrams[index].title}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={currentDiagram}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-lg p-4 border"
      >
        <h4 className="font-semibold mb-4">{content.diagrams[currentDiagram].title}</h4>
        <div className="overflow-auto">
          <Mermaid chart={content.diagrams[currentDiagram].diagram} className="max-w-full" />
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Diagrams
        </Button>
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          View All
        </Button>
      </div>
    </div>
  )
}

function DocumentationStep({ content, progress }: { content: any; progress: number }) {
  const [currentSection, setCurrentSection] = useState(0)

  useEffect(() => {
    const sectionIndex = Math.floor((progress / 100) * content.sections.length)
    setCurrentSection(Math.min(sectionIndex, content.sections.length - 1))
  }, [progress, content.sections.length])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Generated Documentation</h3>
        <div className="flex gap-2">
          {content.sections.map((section: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`px-3 py-1 rounded text-sm ${
                index === currentSection ? "bg-green-500 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {section.title}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={currentSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-900 rounded-lg p-6 border max-h-96 overflow-y-auto"
      >
        <div className="prose dark:prose-invert max-w-none">
          {content.sections[currentSection].content.split("\n").map((line: string, index: number) => {
            if (line.startsWith("# ")) {
              return (
                <h1 key={index} className="text-2xl font-bold mt-0 mb-4">
                  {line.substring(2)}
                </h1>
              )
            } else if (line.startsWith("## ")) {
              return (
                <h2 key={index} className="text-xl font-semibold mt-6 mb-3">
                  {line.substring(3)}
                </h2>
              )
            } else if (line.startsWith("### ")) {
              return (
                <h3 key={index} className="text-lg font-medium mt-4 mb-2">
                  {line.substring(4)}
                </h3>
              )
            } else if (line.startsWith("- ")) {
              return (
                <li key={index} className="ml-4 mb-1">
                  {line.substring(2)}
                </li>
              )
            } else if (line === "") {
              return <div key={index} className="h-2" />
            } else {
              return (
                <p key={index} className="mb-2">
                  {line}
                </p>
              )
            }
          })}
        </div>
      </motion.div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Documentation
        </Button>
        <Button variant="outline" className="gap-2">
          <FileText className="h-4 w-4" />
          View Full Docs
        </Button>
      </div>
    </div>
  )
}

function InfrastructureStep({ content, progress }: { content: any; progress: number }) {
  const [visibleLines, setVisibleLines] = useState(0)
  const totalLines = content.code.split("\n").length

  useEffect(() => {
    const targetLines = Math.floor((progress / 100) * totalLines)
    setVisibleLines(targetLines)
  }, [progress, totalLines])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Infrastructure as Code (Terraform)</h3>
        <Badge variant="secondary">AWS Cloud</Badge>
      </div>

      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-sm">
          <code className="text-green-400">
            {content.code.split("\n").slice(0, visibleLines).join("\n")}
            {progress < 100 && (
              <motion.span
                className="inline-block w-2 h-4 bg-green-400 ml-1"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1 }}
              />
            )}
          </code>
        </pre>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "VPC & Networking", icon: "🌐" },
          { label: "EKS Cluster", icon: "☸️" },
          { label: "RDS Database", icon: "🗄️" },
          { label: "Load Balancer", icon: "⚖️" },
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: progress > (index / 4) * 100 ? 1 : 0.3,
              scale: progress > (index / 4) * 100 ? 1 : 0.9,
            }}
            className="text-center p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg"
          >
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-sm font-medium">{item.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Terraform
        </Button>
        <Button className="gap-2 bg-orange-500 hover:bg-orange-600">
          <Rocket className="h-4 w-4" />
          Deploy Infrastructure
        </Button>
      </div>
    </div>
  )
}

function CodeStep({ content, progress }: { content: any; progress: number }) {
  const [currentFile, setCurrentFile] = useState(0)

  useEffect(() => {
    const fileIndex = Math.floor((progress / 100) * content.files.length)
    setCurrentFile(Math.min(fileIndex, content.files.length - 1))
  }, [progress, content.files.length])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Generated Application Code</h3>
        <div className="flex gap-2">
          {content.files.map((file: any, index: number) => (
            <button
              key={index}
              onClick={() => setCurrentFile(index)}
              className={`px-3 py-1 rounded text-sm ${
                index === currentFile ? "bg-cyan-500 text-white" : "bg-gray-200 dark:bg-gray-700"
              }`}
            >
              {file.name}
            </button>
          ))}
        </div>
      </div>

      <motion.div
        key={currentFile}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 rounded-lg overflow-hidden"
      >
        <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
          <span className="text-white font-medium">{content.files[currentFile].name}</span>
          <Badge variant="secondary">{content.files[currentFile].language}</Badge>
        </div>
        <div className="p-4 overflow-auto max-h-80">
          <pre className="text-sm">
            <code className="text-gray-300">{content.files[currentFile].code}</code>
          </pre>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "React Components", count: "24", icon: "⚛️" },
          { label: "API Endpoints", count: "18", icon: "🔌" },
          { label: "Database Models", count: "12", icon: "🗄️" },
          { label: "Test Files", count: "36", icon: "🧪" },
        ].map((item, index) => (
          <div key={index} className="text-center p-3 bg-cyan-50 dark:bg-cyan-950/30 rounded-lg">
            <div className="text-2xl mb-1">{item.icon}</div>
            <div className="text-lg font-bold">{item.count}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{item.label}</div>
          </div>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Download Code
        </Button>
        <Button className="gap-2 bg-cyan-500 hover:bg-cyan-600">
          <Code className="h-4 w-4" />
          Open in IDE
        </Button>
      </div>
    </div>
  )
}

function DeploymentStep({ content, progress }: { content: any; progress: number }) {
  const [currentPhase, setCurrentPhase] = useState(0)
  const [currentStepInPhase, setCurrentStepInPhase] = useState(0)

  useEffect(() => {
    const totalSteps = content.phases.reduce((acc: number, phase: any) => acc + phase.steps.length, 0)
    const targetStep = Math.floor((progress / 100) * totalSteps)

    let stepCount = 0
    let phaseIndex = 0
    let stepInPhase = 0

    for (let i = 0; i < content.phases.length; i++) {
      if (stepCount + content.phases[i].steps.length > targetStep) {
        phaseIndex = i
        stepInPhase = targetStep - stepCount
        break
      }
      stepCount += content.phases[i].steps.length
    }

    setCurrentPhase(phaseIndex)
    setCurrentStepInPhase(stepInPhase)
  }, [progress, content.phases])

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Deploying to Production</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Phase {currentPhase + 1} of {content.phases.length}: {content.phases[currentPhase].name}
        </p>
      </div>

      <div className="space-y-6">
        {content.phases.map((phase: any, phaseIndex: number) => (
          <div key={phaseIndex} className="space-y-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  phaseIndex < currentPhase
                    ? "bg-green-500 text-white"
                    : phaseIndex === currentPhase
                      ? "bg-pink-500 text-white"
                      : "bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400"
                }`}
              >
                {phaseIndex < currentPhase ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <span className="text-sm font-bold">{phaseIndex + 1}</span>
                )}
              </div>
              <h4 className="font-semibold">{phase.name}</h4>
            </div>

            <div className="ml-4 space-y-2">
              {phase.steps.map((step: string, stepIndex: number) => (
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity:
                      phaseIndex < currentPhase || (phaseIndex === currentPhase && stepIndex <= currentStepInPhase)
                        ? 1
                        : 0.3,
                    x: 0,
                  }}
                  className="flex items-center gap-3 p-2 rounded"
                >
                  {phaseIndex < currentPhase || (phaseIndex === currentPhase && stepIndex < currentStepInPhase) ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : phaseIndex === currentPhase && stepIndex === currentStepInPhase ? (
                    <Loader2 className="h-4 w-4 text-pink-500 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                  )}
                  <span className="text-sm">{step}</span>
                </motion.div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center p-6 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800"
        >
          <div className="text-4xl mb-3">🎉</div>
          <h4 className="text-xl font-bold text-green-700 dark:text-green-300 mb-2">Deployment Successful!</h4>
          <p className="text-green-600 dark:text-green-400 mb-4">
            Your e-commerce platform is now live and ready for customers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {Object.entries(content.metrics).map(([key, value]) => (
              <div key={key} className="text-center">
                <div className="text-lg font-bold text-green-700 dark:text-green-300">{value}</div>
                <div className="text-sm text-green-600 dark:text-green-400">{key}</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="flex justify-center gap-4">
        <Button variant="outline" className="gap-2">
          <Eye className="h-4 w-4" />
          View Live Site
        </Button>
        <Button className="gap-2 bg-pink-500 hover:bg-pink-600">
          <Rocket className="h-4 w-4" />
          Manage Deployment
        </Button>
      </div>
    </div>
  )
}
