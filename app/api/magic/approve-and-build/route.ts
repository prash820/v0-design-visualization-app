import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Transform the payload for the new workflow format
    const backendPayload = {
      jobId: body.jobId || body.conceptJobId, // Support both field names
      confirmed: body.confirmed !== false, // Default to true unless explicitly false
      rejectionReason: body.rejectionReason,
      updatedPrompt: body.updatedPrompt,
      updatedTargetCustomers: body.updatedTargetCustomers
    };
    
    console.log('[Magic Approve API] Forwarding request to backend:', {
      url: `${BACKEND_URL}/api/magic/approve-and-build`,
      payload: backendPayload
    });
    
    const response = await fetch(`${BACKEND_URL}/api/magic/approve-and-build`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backendPayload),
    });

    const data = await response.json();
    
    console.log('[Magic Approve API] Backend response:', {
      status: response.status,
      data: data
    });
    
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to connect to backend' },
      { status: 500 }
    );
  }
} 