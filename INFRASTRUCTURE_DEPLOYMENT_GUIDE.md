# Infrastructure Deployment Guide

This guide explains how to use the new **One-Click Infrastructure Deployment** feature in your application.

## 🚀 Overview

The infrastructure deployment feature allows you to:
- **Deploy infrastructure with one click** using generated Terraform code
- **Monitor deployment progress** in real-time
- **Track infrastructure costs** and resource usage
- **Manage infrastructure lifecycle** (deploy, monitor, destroy)
- **View Terraform outputs** and state information

## 📋 Prerequisites

Before using the deployment feature, ensure you have:

1. **AWS Credentials Configured** on your backend server:
   ```bash
   export AWS_ACCESS_KEY_ID=your_access_key
   export AWS_SECRET_ACCESS_KEY=your_secret_key
   export AWS_DEFAULT_REGION=us-east-1
   ```

2. **Terraform Runner Service Running**:
   ```bash
   cd visualization-backend/terraform-runner
   pip install fastapi uvicorn python-terraform python-dotenv
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

3. **Backend Server Running**:
   ```bash
   cd visualization-backend
   npm run dev
   ```

## 🎯 Step-by-Step Deployment Process

### Step 1: Generate Infrastructure Code

1. **Navigate to your project** in the application
2. **Go to the "Infrastructure" tab**
3. **Click "Generate Infrastructure"** to create Terraform code based on your diagrams
4. **Wait for generation to complete**

### Step 2: Deploy Infrastructure

Once infrastructure code is generated, you have two options:

#### Option A: Quick Deploy from Infrastructure Tab
1. **Look for the green "Ready to Deploy" section** at the bottom of the infrastructure tab
2. **Click "Deploy Infrastructure"** button
3. **You'll be automatically taken to the Deploy tab**

#### Option B: Navigate to Deploy Tab
1. **Click on the "Deploy" tab** in the main navigation
2. **Review the deployment interface**

### Step 3: Monitor Deployment

The deployment process includes:

1. **Configuration Validation** - Checks if Terraform code is valid
2. **Infrastructure Deployment** - Deploys resources to AWS
3. **Progress Tracking** - Real-time progress updates
4. **Output Retrieval** - Gets deployment outputs and status

### Step 4: Review Results

After successful deployment, you can:

- **View deployment status** in the Overview tab
- **Check cost estimates** in the Costs tab
- **Review Terraform outputs** in the Outputs tab
- **Inspect Terraform state** in the State tab

## 🎛️ Deployment Interface

The deployment interface consists of four main tabs:

### Overview Tab
- **Infrastructure Status** - Current deployment state
- **Deploy Button** - One-click deployment (when not deployed)
- **Management Actions** - Destroy infrastructure, refresh status

### Costs Tab
- **Monthly Cost Breakdown** - Compute, storage, networking, database
- **Resource Counts** - Number of each resource type
- **Total Cost Estimation** - Overall monthly cost

### Outputs Tab
- **Terraform Outputs** - Important values from deployment
- **Resource URLs** - API endpoints, database connections, etc.
- **Configuration Values** - Generated resource names and IDs

### State Tab
- **Terraform State** - Complete state information
- **Resource Details** - All deployed resources and their properties
- **State Management** - For advanced users

## 🔧 Deployment Status Types

- **Not Deployed** - Infrastructure code generated but not deployed
- **Pending** - Deployment job is in progress
- **Deployed** - Infrastructure successfully deployed
- **Failed** - Deployment encountered an error
- **Destroyed** - Infrastructure has been cleaned up

## 💰 Cost Management

The system provides cost estimation for:

- **Compute Resources** - EC2 instances, Lambda functions
- **Storage** - S3 buckets, EBS volumes
- **Networking** - API Gateway, CloudFront, VPC
- **Database** - RDS, DynamoDB, ElastiCache

**Note**: Cost estimates are approximate and based on standard AWS pricing.

## 🛡️ Security Considerations

1. **AWS Credentials** - Store securely using environment variables
2. **Resource Permissions** - Ensure IAM roles have appropriate permissions
3. **Network Security** - Review security groups and network ACLs
4. **Data Protection** - Consider encryption for sensitive data

## 🧹 Infrastructure Cleanup

To avoid unnecessary costs, you can destroy infrastructure:

1. **Go to the Deploy tab**
2. **Click "Destroy Infrastructure"** button
3. **Confirm the action** (this cannot be undone)
4. **Wait for cleanup to complete**

## 🔍 Troubleshooting

### Common Issues

1. **"Terraform Runner Not Running"**
   - Ensure the Python service is running on port 8000
   - Check logs for connection errors

2. **"AWS Credentials Issues"**
   - Verify AWS credentials are properly configured
   - Check IAM permissions for required services

3. **"Deployment Timeout"**
   - Some resources (like RDS) can take 10-15 minutes
   - Monitor progress in the deployment interface

4. **"Configuration Validation Failed"**
   - Review the generated Terraform code
   - Check for syntax errors or missing providers

### Debug Steps

1. **Check Backend Logs**:
   ```bash
   tail -f visualization-backend/logs/server.log
   ```

2. **Check Terraform Runner Logs**:
   ```bash
   tail -f terraform-runner/logs/terraform.log
   ```

3. **Enable Debug Logging**:
   ```bash
   export TF_LOG=DEBUG
   export TF_LOG_PATH=terraform.log
   ```

## 📊 Best Practices

1. **Always review generated code** before deployment
2. **Monitor costs regularly** using the cost estimation feature
3. **Use staging environments** for testing deployments
4. **Keep infrastructure code versioned** in your project
5. **Clean up resources** when no longer needed
6. **Backup important data** before destroying infrastructure

## 🔄 Workflow Integration

The deployment feature integrates seamlessly with your existing workflow:

1. **Generate Diagrams** → Create UML/architecture diagrams
2. **Generate Documentation** → Create comprehensive documentation
3. **Generate Infrastructure** → Create Terraform configuration
4. **Deploy Infrastructure** → Deploy to AWS (NEW!)
5. **Generate Application Code** → Create application code
6. **Deploy Application** → Deploy your application (future feature)

## 🚀 Advanced Features

### Custom Terraform Code
You can modify the generated Terraform code before deployment:
1. **Copy the generated code**
2. **Make your modifications**
3. **Paste it back** in the infrastructure tab
4. **Deploy the modified version**

### Multiple Environments
For production use, consider:
- **Separate AWS accounts** for different environments
- **Remote state storage** (S3 + DynamoDB)
- **CI/CD integration** for automated deployments
- **Infrastructure as Code** versioning

## 📞 Support

If you encounter issues:

1. **Check the troubleshooting section** above
2. **Review backend logs** for detailed error messages
3. **Verify AWS credentials** and permissions
4. **Ensure all services are running** properly

## 🔮 Future Enhancements

Planned features include:
- **Multi-cloud support** (Azure, GCP)
- **Infrastructure drift detection**
- **Automated backup and recovery**
- **Advanced cost optimization**
- **CI/CD pipeline integration**
- **Infrastructure monitoring and alerting**

---

**Happy Deploying! 🎉**

Your infrastructure deployment is now just one click away. Enjoy the power of automated cloud infrastructure management! 