import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authHeader = request.headers.get('Authorization')
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/deployment/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || ''
      },
      body: JSON.stringify(body)
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Cleanup infrastructure error:', error)
    return NextResponse.json(
      { error: 'Failed to cleanup infrastructure' },
      { status: 500 }
    )
  }
} 