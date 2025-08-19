import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Get the authorization header from the frontend request
    const authHeader = request.headers.get('authorization')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward the authorization header if it exists
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/architecture/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    })
    
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to generate architecture recommendations' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error generating architecture recommendations:', error)
    return NextResponse.json({ error: 'Failed to generate architecture recommendations' }, { status: 500 })
  }
} 