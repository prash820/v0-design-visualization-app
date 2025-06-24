#!/bin/bash

# Infrastructure Deployment Startup Script
# This script starts all required services for infrastructure deployment

echo "🚀 Starting Infrastructure Deployment Services"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

# Check if Node.js is installed
if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if Python is installed
if ! command_exists python3; then
    echo -e "${RED}❌ Python 3 is not installed. Please install Python 3 first.${NC}"
    exit 1
fi

# Check if pip is installed
if ! command_exists pip3; then
    echo -e "${RED}❌ pip3 is not installed. Please install pip3 first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"

# Check if AWS credentials are set
echo -e "${BLUE}🔐 Checking AWS credentials...${NC}"
if [ -z "$AWS_ACCESS_KEY_ID" ] || [ -z "$AWS_SECRET_ACCESS_KEY" ]; then
    echo -e "${YELLOW}⚠️  AWS credentials not found in environment variables${NC}"
    echo -e "${YELLOW}   Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY${NC}"
    echo -e "${YELLOW}   You can also configure AWS CLI: aws configure${NC}"
else
    echo -e "${GREEN}✅ AWS credentials found${NC}"
fi

# Check if AWS region is set
if [ -z "$AWS_DEFAULT_REGION" ]; then
    echo -e "${YELLOW}⚠️  AWS_DEFAULT_REGION not set, defaulting to us-east-1${NC}"
    export AWS_DEFAULT_REGION=us-east-1
else
    echo -e "${GREEN}✅ AWS region set to: $AWS_DEFAULT_REGION${NC}"
fi

# Function to start backend server
start_backend() {
    echo -e "${BLUE}🔧 Starting backend server...${NC}"
    cd visualization-backend
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
        npm install
    fi
    
    # Start the server
    echo -e "${GREEN}🚀 Starting backend server on port 5001...${NC}"
    npm run dev &
    BACKEND_PID=$!
    echo $BACKEND_PID > .backend.pid
    
    # Wait for backend to start
    sleep 5
    if port_in_use 5001; then
        echo -e "${GREEN}✅ Backend server started successfully${NC}"
    else
        echo -e "${RED}❌ Backend server failed to start${NC}"
        exit 1
    fi
}

# Function to start Terraform runner
start_terraform_runner() {
    echo -e "${BLUE}🔧 Starting Terraform runner...${NC}"
    cd visualization-backend/terraform-runner
    
    # Install Python dependencies
    echo -e "${YELLOW}📦 Installing Python dependencies...${NC}"
    pip3 install fastapi uvicorn python-terraform python-dotenv
    
    # Create workspace directory if it doesn't exist
    mkdir -p workspace
    
    # Start the Terraform runner
    echo -e "${GREEN}🚀 Starting Terraform runner on port 8000...${NC}"
    python3 -m uvicorn main:app --host 0.0.0.0 --port 8000 &
    TERRAFORM_PID=$!
    echo $TERRAFORM_PID > .terraform.pid
    
    # Wait for Terraform runner to start
    sleep 3
    if port_in_use 8000; then
        echo -e "${GREEN}✅ Terraform runner started successfully${NC}"
    else
        echo -e "${RED}❌ Terraform runner failed to start${NC}"
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    echo -e "${BLUE}🔧 Starting frontend...${NC}"
    cd v0-design-visualization-app
    
    # Install dependencies if node_modules doesn't exist
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
        npm install
    fi
    
    # Start the frontend
    echo -e "${GREEN}🚀 Starting frontend on port 3000...${NC}"
    npm run dev &
    FRONTEND_PID=$!
    echo $FRONTEND_PID > .frontend.pid
    
    # Wait for frontend to start
    sleep 5
    if port_in_use 3000; then
        echo -e "${GREEN}✅ Frontend started successfully${NC}"
    else
        echo -e "${RED}❌ Frontend failed to start${NC}"
        exit 1
    fi
}

# Function to stop all services
stop_services() {
    echo -e "${YELLOW}🛑 Stopping all services...${NC}"
    
    # Stop backend
    if [ -f "visualization-backend/.backend.pid" ]; then
        BACKEND_PID=$(cat visualization-backend/.backend.pid)
        kill $BACKEND_PID 2>/dev/null
        rm visualization-backend/.backend.pid
        echo -e "${GREEN}✅ Backend stopped${NC}"
    fi
    
    # Stop Terraform runner
    if [ -f "visualization-backend/terraform-runner/.terraform.pid" ]; then
        TERRAFORM_PID=$(cat visualization-backend/terraform-runner/.terraform.pid)
        kill $TERRAFORM_PID 2>/dev/null
        rm visualization-backend/terraform-runner/.terraform.pid
        echo -e "${GREEN}✅ Terraform runner stopped${NC}"
    fi
    
    # Stop frontend
    if [ -f "v0-design-visualization-app/.frontend.pid" ]; then
        FRONTEND_PID=$(cat v0-design-visualization-app/.frontend.pid)
        kill $FRONTEND_PID 2>/dev/null
        rm v0-design-visualization-app/.frontend.pid
        echo -e "${GREEN}✅ Frontend stopped${NC}"
    fi
}

# Handle script interruption
trap stop_services INT

# Check if services are already running
echo -e "${BLUE}🔍 Checking if services are already running...${NC}"

if port_in_use 5001; then
    echo -e "${YELLOW}⚠️  Backend server is already running on port 5001${NC}"
else
    start_backend
fi

if port_in_use 8000; then
    echo -e "${YELLOW}⚠️  Terraform runner is already running on port 8000${NC}"
else
    start_terraform_runner
fi

if port_in_use 3000; then
    echo -e "${YELLOW}⚠️  Frontend is already running on port 3000${NC}"
else
    start_frontend
fi

echo ""
echo -e "${GREEN}🎉 All services started successfully!${NC}"
echo ""
echo -e "${BLUE}📱 Access your application:${NC}"
echo -e "   Frontend: ${GREEN}http://localhost:3000${NC}"
echo -e "   Backend API: ${GREEN}http://localhost:5001${NC}"
echo -e "   Terraform Runner: ${GREEN}http://localhost:8000${NC}"
echo ""
echo -e "${BLUE}📚 Next steps:${NC}"
echo -e "   1. Open ${GREEN}http://localhost:3000${NC} in your browser"
echo -e "   2. Create a new project or open an existing one"
echo -e "   3. Generate diagrams and infrastructure code"
echo -e "   4. Use the new 'Deploy' tab to deploy your infrastructure!"
echo ""
echo -e "${YELLOW}💡 To stop all services, press Ctrl+C${NC}"
echo ""

# Keep script running
wait 