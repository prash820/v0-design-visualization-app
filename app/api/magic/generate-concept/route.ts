import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('[Magic API] Received request body:', body);
    
    // Transform frontend payload to backend format
    const backendPayload = {
      prompt: body.idea || body.prompt || '', // Support both old 'idea' and new 'prompt' field
      targetCustomers: body.targetCustomers || body.users || 'General users', // Support multiple field names
      projectId: body.projectId // Optional project ID
    };
    
    console.log('[Magic API] Transformed payload:', backendPayload);
    console.log('[Magic API] BACKEND_URL:', BACKEND_URL);
    console.log('[Magic API] Full request URL:', `${BACKEND_URL}/api/magic/generate-concept`);
    
    // Validate that we have a prompt
    if (!backendPayload.prompt) {
      console.error('[Magic API] ERROR: No prompt after transformation!');
      return NextResponse.json(
        { error: 'No app idea provided' },
        { status: 400 }
      );
    }
    
    console.log('[Magic API] Making request to backend...');
    
    const response = await fetch(`${BACKEND_URL}/api/magic/generate-concept`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    console.log('[Magic API] Backend response status:', response.status);
    
    const data = await response.json();
    
    console.log('[Magic API] Backend response data:', data);
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Magic API] Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
} 