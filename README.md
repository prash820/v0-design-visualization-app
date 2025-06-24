# Chart App Frontend - Multi-Tenant AWS Infrastructure Provisioning UI

A Next.js frontend application that provides a user interface for creating applications from prompts using AI-generated infrastructure and automated AWS deployment.

## 🏗️ Features

- **Project Management**: Create and manage multiple projects
- **Infrastructure Deployment**: Deploy AWS infrastructure via Terraform
- **Application Deployment**: Deploy application code to provisioned infrastructure
- **Separated UI Tabs**: Clean separation between infrastructure and application operations
- **Real-time Status**: Live deployment progress monitoring
- **Application Purge**: Safe cleanup of deployed applications
- **Cost Monitoring**: View estimated and actual resource costs

## 🚀 Quick Deployment to Vercel

```bash
# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://your-backend-app.herokuapp.com/api
# NEXT_PUBLIC_ENVIRONMENT=production
```

## 🔧 Environment Variables

Set these in your Vercel dashboard or `.env.local`:

```bash
# Backend API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-app.herokuapp.com/api
NEXT_PUBLIC_ENVIRONMENT=production

# Optional: Analytics and monitoring
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 🏃‍♂️ Local Development

```bash
# Install dependencies
npm install
# or
pnpm install

# Start development server
npm run dev
# or
pnpm dev

# Open http://localhost:3000
```

## 🎯 User Interface

### Main Navigation
- **Projects**: List and manage all projects
- **Create Project**: Start new infrastructure project
- **Deploy**: Infrastructure and application deployment tabs

### Infrastructure Tab
- Deploy AWS infrastructure (S3, Lambda, DynamoDB, API Gateway)
- Monitor deployment progress
- View infrastructure outputs
- Destroy infrastructure (with safety checks)

### Application Tab
- Deploy application code to provisioned infrastructure
- Retry failed deployments
- Monitor application status
- Purge application files

## 🔐 Security Features

- **User Authentication**: Secure user sessions
- **Resource Isolation**: Each user sees only their resources
- **Cost Visibility**: Real-time cost estimates and limits
- **Safe Operations**: Confirmation dialogs for destructive actions

## 🤝 Backend Integration

This frontend is designed to work with the companion Node.js backend:
- **API Communication**: RESTful API calls to backend
- **Real-time Updates**: Polling for deployment status
- **Error Handling**: User-friendly error messages
- **Loading States**: Progress indicators for long operations

## 📊 Project Structure

```
v0-design-visualization-app/
├── app/                       # Next.js app router
│   ├── projects/             # Project management pages
│   ├── deploy/               # Deployment interface
│   └── api/                  # API route handlers
├── components/               # Reusable UI components
│   ├── ui/                   # Base UI components
│   ├── infrastructure/       # Infrastructure deployment
│   └── application/          # Application deployment
├── lib/                      # Utility functions and API clients
├── hooks/                    # Custom React hooks
└── styles/                   # Global styles and Tailwind config
```

## 🎨 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React hooks and context
- **API Client**: Fetch with custom error handling
- **Deployment**: Vercel

## 🔄 API Integration

The frontend communicates with the backend via these main endpoints:

- `GET /api/projects` - List user projects
- `POST /api/deploy` - Deploy infrastructure
- `POST /api/deploy/app` - Deploy application
- `GET /api/deploy/status/:projectId` - Get deployment status
- `DELETE /api/deploy/app/purge` - Purge application

## 🚨 Error Handling

- **Network Errors**: Automatic retry with exponential backoff
- **API Errors**: User-friendly error messages
- **Validation**: Client-side form validation
- **Fallbacks**: Graceful degradation for failed operations

## 📈 Performance

- **Code Splitting**: Automatic code splitting with Next.js
- **Image Optimization**: Next.js Image component
- **Caching**: API response caching where appropriate
- **Bundle Size**: Optimized for fast loading

## 🆘 Troubleshooting

### Common Issues

1. **API Connection Failed**: Check `NEXT_PUBLIC_API_URL` environment variable
2. **Build Failures**: Ensure all dependencies are installed
3. **Deployment Issues**: Verify Vercel environment variables
4. **Authentication Problems**: Check backend CORS configuration

### Development Commands

```bash
# Build for production
npm run build

# Run production build locally
npm start

# Run linter
npm run lint

# Type checking
npm run type-check
```

This frontend provides a complete user interface for the multi-tenant AWS infrastructure provisioning platform, with a focus on usability, security, and real-time feedback.
