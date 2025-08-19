import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header from the frontend request
    const authHeader = request.headers.get('authorization')
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    // Forward the authorization header if it exists
    if (authHeader) {
      headers['Authorization'] = authHeader
    }
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/auth/validate`, {
      method: 'GET',
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Token validation failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error during token validation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 