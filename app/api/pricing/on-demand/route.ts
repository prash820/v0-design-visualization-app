import { NextRequest, NextResponse } from 'next/server';

const backend_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${backend_url}/api/pricing/on-demand`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error getting on-demand pricing:', error);
    return NextResponse.json(
      { error: 'Failed to get on-demand pricing' },
      { status: 500 }
    );
  }
} 