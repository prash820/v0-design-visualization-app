// Mock projects data
export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'E-commerce Platform',
    description: 'A modern e-commerce platform with microservices architecture',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T14:45:00Z',
    lastAccessed: '2024-01-15T14:45:00Z',
    terraformCode: null, // AI-generated code only
    umlDiagrams: {
      architecture: `flowchart TB
    subgraph Frontend
        WEB[Web Application]
        MOBILE[Mobile App]
    end
    
    subgraph Backend
        API[API Gateway]
        AUTH[Authentication Service]
        PRODUCT[Product Service]
        ORDER[Order Service]
        PAYMENT[Payment Service]
    end
    
    subgraph Database
        DB[(Database)]
        CACHE[(Redis Cache)]
    end
    
    WEB --> API
    MOBILE --> API
    API --> AUTH
    API --> PRODUCT
    API --> ORDER
    API --> PAYMENT
    PRODUCT --> DB
    ORDER --> DB
    PAYMENT --> DB
    AUTH --> CACHE`,
      frontend: `flowchart LR
    subgraph Components
        HEADER[Header Component]
        PRODUCT_LIST[Product List]
        CART[Shopping Cart]
        CHECKOUT[Checkout Form]
    end
    
    subgraph Pages
        HOME[Home Page]
        PRODUCTS[Products Page]
        CART_PAGE[Cart Page]
        CHECKOUT_PAGE[Checkout Page]
    end
    
    HOME --> HEADER
    HOME --> PRODUCT_LIST
    PRODUCTS --> PRODUCT_LIST
    CART_PAGE --> CART
    CHECKOUT_PAGE --> CHECKOUT`,
      backend: `flowchart TB
    subgraph Services
        AUTH_SERVICE[Auth Service]
        PRODUCT_SERVICE[Product Service]
        ORDER_SERVICE[Order Service]
        PAYMENT_SERVICE[Payment Service]
    end
    
    subgraph Middleware
        JWT[JWT Middleware]
        VALIDATION[Validation Middleware]
        RATE_LIMIT[Rate Limiting]
    end
    
    subgraph Database
        USERS[(Users Table)]
        PRODUCTS[(Products Table)]
        ORDERS[(Orders Table)]
    end
    
    AUTH_SERVICE --> JWT
    PRODUCT_SERVICE --> VALIDATION
    ORDER_SERVICE --> RATE_LIMIT
    AUTH_SERVICE --> USERS
    PRODUCT_SERVICE --> PRODUCTS
    ORDER_SERVICE --> ORDERS`
    },
    deploymentStatus: 'deployed',
    metadata: JSON.stringify({
      environment: 'production',
      region: 'us-east-1',
      costEstimate: 250
    })
  },
  {
    id: 'project-2',
    name: 'Blog Platform',
    description: 'A scalable blog platform with content management',
    status: 'active',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-12T16:20:00Z',
    lastAccessed: '2024-01-12T16:20:00Z',
    terraformCode: null, // AI-generated code only
    umlDiagrams: {
      architecture: `flowchart TB
    subgraph Frontend
        BLOG[Blog Frontend]
        ADMIN[Admin Panel]
    end
    
    subgraph Backend
        API[Blog API]
        CMS[CMS Service]
        SEARCH[Search Service]
    end
    
    subgraph Storage
        S3[(S3 Storage)]
        CDN[CloudFront CDN]
    end
    
    BLOG --> API
    ADMIN --> API
    API --> CMS
    API --> SEARCH
    CMS --> S3
    S3 --> CDN`,
      frontend: `flowchart LR
    subgraph Components
        HEADER[Header]
        POST_LIST[Post List]
        POST_DETAIL[Post Detail]
        EDITOR[Rich Editor]
    end
    
    subgraph Pages
        HOME[Home]
        POST[Post Page]
        ADMIN[Admin Dashboard]
        EDIT[Edit Post]
    end
    
    HOME --> HEADER
    HOME --> POST_LIST
    POST --> POST_DETAIL
    ADMIN --> EDITOR
    EDIT --> EDITOR`,
      backend: `flowchart TB
    subgraph API
        POSTS_API[Posts API]
        USERS_API[Users API]
        COMMENTS_API[Comments API]
    end
    
    subgraph Services
        AUTH[Authentication]
        SEARCH[Search Service]
        NOTIFICATIONS[Notifications]
    end
    
    subgraph Database
        POSTS[(Posts)]
        USERS[(Users)]
        COMMENTS[(Comments)]
    end
    
    POSTS_API --> POSTS
    USERS_API --> USERS
    COMMENTS_API --> COMMENTS
    POSTS_API --> SEARCH
    USERS_API --> AUTH`
    },
    deploymentStatus: 'deployed',
    metadata: JSON.stringify({
      environment: 'staging',
      region: 'us-west-2',
      costEstimate: 120
    })
  }
];

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
