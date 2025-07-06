# Magic Flow POC Testing Guide

## ✅ Prerequisites Check

### 1. Backend Running
```bash
# Terminal 1: Start backend
cd visualization-backend
npm start

# Should see:
# 🚀 Server running on port 5001
# 🚀 Starting Terraform FastAPI service...
```

### 2. Frontend Running  
```bash
# Terminal 2: Start frontend
cd v0-design-visualization-app
npm run dev

# Should see:
# ▲ Next.js 14.x.x
# - Local:        http://localhost:3000
```

## 🧪 Manual Testing Steps

### Step 1: Access Magic Flow
1. Open browser: `http://localhost:3000`
2. Click **"✨ Magic Flow POC"** button
3. Should redirect to `/magic` with POC header

### Step 2: Test Concept Generation
1. Enter test idea: `"I want to build a simple todo app for small teams"`
2. Click **"Generate Concept & Diagrams"**
3. Should show loading state with progress bar
4. Wait 15-20 seconds for completion

**Expected Result:**
- Progress updates: "Analyzing your idea..." → "Designing app concept..." → "Creating architecture diagrams..."
- Success card: "✅ Concept Generated! Does this look right?"
- 4 tabs: Concept, Architecture, User Flow, Components
- Diagrams render correctly (or show fallback text)

### Step 3: Test Concept Validation
1. Review generated concept details
2. Check all 4 tabs load properly
3. Add optional modification: `"Add user authentication"`
4. Click **"Looks Good! Build My App"**

**Expected Result:**
- Advances to build progress step
- Shows "Building Your App..." with detailed steps

### Step 4: Test Build Progress (Mock)
*Note: This will likely timeout since we're testing without full AWS setup*

**Expected Result:**
- Real-time progress updates
- Step breakdown with icons
- Either completes (unlikely) or shows timeout/error

## 🔍 Debugging Checklist

### Browser Console
Check for logs:
```
Concept status response: {...}
Response status: 200
```

### Network Tab
- `POST /api/magic/generate-concept` → Should return `{jobId, status: "processing"}`
- `GET /api/magic/concept-status/{jobId}` → Should poll every 2 seconds

### Common Issues & Fixes

#### 1. "Cannot destructure property 'concept'" Error
**Fixed with safety checks!** Should now show:
- Debug info in yellow warning card
- Option to try again

#### 2. Backend Not Accessible
```bash
curl http://localhost:5001/health
# Should return: {"status": "healthy", ...}
```

#### 3. Mermaid Diagrams Don't Load
**Fixed with fallback!** Should show:
- Raw diagram text in code block
- Console warning about Mermaid failure

#### 4. API Proxy Issues
```bash
curl -X POST http://localhost:3000/api/magic/generate-concept \
  -H "Content-Type: application/json" \
  -d '{"idea":"test"}'
# Should return: {"jobId": "...", "status": "processing"}
```

## ✨ Success Criteria

### Minimum Viable Test
- ✅ Magic page loads without errors
- ✅ Can enter idea and click generate
- ✅ Shows loading state with progress
- ✅ Either shows concept OR helpful error message

### Full Success
- ✅ Concept generates with all details
- ✅ Diagrams render (Mermaid or fallback)
- ✅ Can add modifications
- ✅ Build process starts (even if times out)

## 🎯 Demo Script for Stakeholders

**30-Second Version:**
> "Here's our simplified Magic Flow. I enter 'todo app for teams', click generate, and in 20 seconds I get a complete concept with diagrams. I can review, modify, then click build for a live app."

**Key Points to Highlight:**
- 🎯 **Addresses feedback**: Single linear flow vs complex tabs
- 🛡️ **Smart validation**: Shows what will be built before wasting resources  
- ⚡ **Real magic feel**: AI generates everything automatically
- 🔄 **Safe to test**: Runs parallel to existing system

---

Ready to demo the future of app development! 🚀 