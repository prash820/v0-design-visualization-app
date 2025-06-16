// Mock projects data
export const mockProjects = [
  {
    id: "project-1",
    userId: "user-1",
    name: "E-commerce Platform",
    description:
      "UML diagrams and documentation for an e-commerce platform with user management, product catalog, and order processing.",
    lastPrompt: "Generate a class diagram for an e-commerce system with users, products, and orders.",
    diagramType: "Class Diagram",
    createdAt: "2025-04-15T10:30:00Z",
  },
  {
    id: "project-2",
    userId: "user-1",
    name: "Banking System",
    description: "Architecture diagrams for a banking system with accounts, transactions, and customer management.",
    diagramType: "Sequence Diagram",
    createdAt: "2025-04-20T14:45:00Z",
  },
  {
    id: "project-3",
    userId: "user-1",
    name: "Healthcare App",
    description:
      "UML and documentation for a healthcare application with patient records, appointments, and medical staff management.",
    diagramType: "Component Diagram",
    createdAt: "2025-05-01T09:15:00Z",
  },
  {
    id: "project-4",
    userId: "user-1",
    name: "Social Media Platform",
    description: "System architecture for a social media platform with user profiles, posts, comments, and messaging.",
    createdAt: "2025-05-05T16:20:00Z",
  },
]

// Mock UML diagrams data - Using very simple diagrams that are more likely to render
export const mockDiagrams = [
  {
    id: "diagram-1",
    projectId: "project-1",
    diagramType: "Class Diagram",
    diagramData: `graph TD
    A[User] --> B[Order]
    B --> C[Product]`,
    prompt: "Generate a class diagram for an e-commerce system with users, products, and orders.",
    createdAt: "2025-04-16T11:30:00Z",
    updatedAt: "2025-04-16T11:30:00Z",
  },
  {
    id: "diagram-2",
    projectId: "project-2",
    diagramType: "Sequence Diagram",
    diagramData: `sequenceDiagram
    Alice->>John: Hello John, how are you?
    John-->>Alice: Great!`,
    prompt: "Create a sequence diagram for an ATM withdrawal process in a banking system.",
    createdAt: "2025-04-21T15:45:00Z",
    updatedAt: "2025-04-21T15:45:00Z",
  },
  {
    id: "diagram-3",
    projectId: "project-3",
    diagramType: "Component Diagram",
    diagramData: `graph TD
    A[Patient Portal] --> B[Authentication]
    A --> C[Medical Records]`,
    prompt: "Generate a component diagram for a healthcare application.",
    createdAt: "2025-05-02T10:15:00Z",
    updatedAt: "2025-05-02T10:15:00Z",
  },
  {
    id: "diagram-4",
    projectId: "project-1",
    diagramType: "ERD Diagram",
    diagramData: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ PRODUCT : contains`,
    prompt: "Generate an ERD diagram for an e-commerce database.",
    createdAt: "2025-04-18T09:30:00Z",
    updatedAt: "2025-04-18T09:30:00Z",
  },
  {
    id: "diagram-5",
    projectId: "project-1",
    diagramType: "Architecture Diagram",
    diagramData: `graph TD
    A[Web App] --> B[API Gateway]
    B --> C[Services]
    C --> D[Database]`,
    prompt: "Generate an architecture diagram for a social media platform.",
    createdAt: "2025-05-06T14:20:00Z",
    updatedAt: "2025-05-06T14:20:00Z",
  },
]

// Mock documentation
export const mockDocumentation = `# E-commerce System Documentation

## Overview
This document provides a comprehensive overview of the e-commerce system architecture, including its components, relationships, and functionality.

## System Components

### User Management
- **User Registration**: New users can register by providing their name, email, and password.
- **Authentication**: Users can log in using their email and password.
- **Profile Management**: Users can view and update their profile information.

### Product Catalog
- **Product Listing**: Products are displayed with their name, description, price, and availability.
- **Product Categories**: Products are organized into categories for easy navigation.
- **Search Functionality**: Users can search for products by name, category, or description.

### Shopping Cart
- **Add to Cart**: Users can add products to their shopping cart.
- **Update Quantities**: Users can update the quantity of items in their cart.
- **Remove Items**: Users can remove items from their cart.

### Order Processing
- **Checkout**: Users can proceed to checkout from their shopping cart.
- **Payment Processing**: The system integrates with payment gateways to process payments.
- **Order Confirmation**: Users receive confirmation of their order.
- **Order History**: Users can view their order history.

## Data Models

### User
- id: String (unique identifier)
- name: String
- email: String (unique)
- password: String (hashed)
- address: Object
- createdAt: Date

### Product
- id: String (unique identifier)
- name: String
- description: String
- price: Number
- stock: Number
- category: String
- images: Array of Strings
- createdAt: Date

### Order
- id: String (unique identifier)
- userId: String (reference to User)
- items: Array of Objects (product id, quantity, price)
- totalAmount: Number
- status: String (pending, paid, shipped, delivered, cancelled)
- shippingAddress: Object
- paymentMethod: String
- createdAt: Date

## System Architecture
The system follows a microservices architecture with the following services:
- User Service: Handles user registration, authentication, and profile management.
- Product Service: Manages the product catalog and inventory.
- Cart Service: Manages shopping cart functionality.
- Order Service: Handles order processing and payment.
- Notification Service: Sends notifications to users about their orders.

## Class Diagram
The class diagram illustrates the relationships between the main entities in the system.

## Sequence Diagram
The sequence diagram shows the interaction between components during the checkout process.

## Security Considerations
- All passwords are hashed before storage.
- API endpoints are protected with JWT authentication.
- HTTPS is used for all communications.
- Input validation is performed on all user inputs.

## Deployment
The system is deployed using Docker containers on AWS infrastructure, with the following components:
- EC2 instances for application services
- RDS for database storage
- S3 for static assets and images
- CloudFront for content delivery
- Load balancers for traffic distribution

## Future Enhancements
- Integration with additional payment gateways
- Implementation of a recommendation system
- Addition of a review and rating system
- Support for multiple languages and currencies`

// Mock Terraform configuration
export const mockTerraformConfig = `# AWS Provider Configuration
provider "aws" {
  region = "us-west-2"
}

# VPC Configuration
resource "aws_vpc" "ecommerce_vpc" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = {
    Name = "ecommerce-vpc"
  }
}

# Public Subnets
resource "aws_subnet" "public_subnet_1" {
  vpc_id                  = aws_vpc.ecommerce_vpc.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "us-west-2a"
  map_public_ip_on_launch = true

  tags = {
    Name = "ecommerce-public-subnet-1"
  }
}

resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.ecommerce_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "us-west-2b"
  map_public_ip_on_launch = true

  tags = {
    Name = "ecommerce-public-subnet-2"
  }
}

# Private Subnets
resource "aws_subnet" "private_subnet_1" {
  vpc_id            = aws_vpc.ecommerce_vpc.id
  cidr_block        = "10.0.3.0/24"
  availability_zone = "us-west-2a"

  tags = {
    Name = "ecommerce-private-subnet-1"
  }
}

resource "aws_subnet" "private_subnet_2" {
  vpc_id            = aws_vpc.ecommerce_vpc.id
  cidr_block        = "10.0.4.0/24"
  availability_zone = "us-west-2b"

  tags = {
    Name = "ecommerce-private-subnet-2"
  }
}

# Internet Gateway
resource "aws_internet_gateway" "igw" {
  vpc_id = aws_vpc.ecommerce_vpc.id

  tags = {
    Name = "ecommerce-igw"
  }
}

# Route Table for Public Subnets
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.ecommerce_vpc.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.igw.id
  }

  tags = {
    Name = "ecommerce-public-route-table"
  }
}

# Route Table Association for Public Subnets
resource "aws_route_table_association" "public_subnet_1_association" {
  subnet_id      = aws_subnet.public_subnet_1.id
  route_table_id = aws_route_table.public_route_table.id
}

resource "aws_route_table_association" "public_subnet_2_association" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_route_table.id
}

# Security Group for Web Servers
resource "aws_security_group" "web_sg" {
  name        = "web-sg"
  description = "Security group for web servers"
  vpc_id      = aws_vpc.ecommerce_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecommerce-web-sg"
  }
}

# Security Group for Database
resource "aws_security_group" "db_sg" {
  name        = "db-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.ecommerce_vpc.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.web_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "ecommerce-db-sg"
  }
}

# RDS Subnet Group
resource "aws_db_subnet_group" "db_subnet_group" {
  name       = "ecommerce-db-subnet-group"
  subnet_ids = [aws_subnet.private_subnet_1.id, aws_subnet.private_subnet_2.id]

  tags = {
    Name = "ecommerce-db-subnet-group"
  }
}

# RDS Instance
resource "aws_db_instance" "ecommerce_db" {
  allocated_storage      = 20
  storage_type           = "gp2"
  engine                 = "postgres"
  engine_version         = "13.4"
  instance_class         = "db.t3.micro"
  name                   = "ecommercedb"
  username               = "admin"
  password               = "Password123!"  # In production, use AWS Secrets Manager
  parameter_group_name   = "default.postgres13"
  db_subnet_group_name   = aws_db_subnet_group.db_subnet_group.name
  vpc_security_group_ids = [aws_security_group.db_sg.id]
  skip_final_snapshot    = true
  multi_az               = true

  tags = {
    Name = "ecommerce-db"
  }
}

# S3 Bucket for Static Assets
resource "aws_s3_bucket" "static_assets" {
  bucket = "ecommerce-static-assets"
  acl    = "private"

  tags = {
    Name = "ecommerce-static-assets"
  }
}

# EC2 Launch Template
resource "aws_launch_template" "web_launch_template" {
  name_prefix   = "web-launch-template"
  image_id      = "ami-0c55b159cbfafe1f0"  # Amazon Linux 2 AMI
  instance_type = "t2.micro"

  vpc_security_group_ids = [aws_security_group.web_sg.id]

  user_data = base64encode(<<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker
    service docker start
    docker pull ecommerce/web-app:latest
    docker run -d -p 80:80 ecommerce/web-app:latest
  EOF
  )

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "ecommerce-web-server"
    }
  }
}

# Auto Scaling Group
resource "aws_autoscaling_group" "web_asg" {
  desired_capacity    = 2
  max_size            = 5
  min_size            = 2
  vpc_zone_identifier = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  launch_template {
    id      = aws_launch_template.web_launch_template.id
    version = "$Latest"
  }

  tag {
    key                 = "Name"
    value               = "ecommerce-web-asg"
    propagate_at_launch = true
  }
}

# Application Load Balancer
resource "aws_lb" "web_alb" {
  name               = "web-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.web_sg.id]
  subnets            = [aws_subnet.public_subnet_1.id, aws_subnet.public_subnet_2.id]

  tags = {
    Name = "ecommerce-web-alb"
  }
}

# ALB Target Group
resource "aws_lb_target_group" "web_target_group" {
  name     = "web-target-group"
  port     = 80
  protocol = "HTTP"
  vpc_id   = aws_vpc.ecommerce_vpc.id

  health_check {
    path                = "/"
    port                = "traffic-port"
    healthy_threshold   = 3
    unhealthy_threshold = 3
    timeout             = 5
    interval            = 30
  }
}

# ALB Listener
resource "aws_lb_listener" "web_listener" {
  load_balancer_arn = aws_lb.web_alb.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.web_target_group.arn
  }
}

# Auto Scaling Attachment
resource "aws_autoscaling_attachment" "web_asg_attachment" {
  autoscaling_group_name = aws_autoscaling_group.web_asg.name
  alb_target_group_arn   = aws_lb_target_group.web_target_group.arn
}

# Output the ALB DNS name
output "alb_dns_name" {
  value = aws_lb.web_alb.dns_name
}

# Output the RDS endpoint
output "rds_endpoint" {
  value = aws_db_instance.ecommerce_db.endpoint
}

# Output the S3 bucket name
output "s3_bucket_name" {
  value = aws_s3_bucket.static_assets.bucket
}
`
