import { NextRequest, NextResponse } from 'next/server';

const backend_url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${backend_url}/api/pricing/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Error fetching pricing status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pricing status' },
      { status: 500 }
    );
  }
} 