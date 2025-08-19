import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/iac/user/${params.userId}`, {
      method: 'GET',
      headers,
    })
    
    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.error || 'Failed to fetch user jobs' },
        { status: response.status }
      )
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching user jobs:', error)
    return NextResponse.json({ error: 'Failed to fetch user jobs' }, { status: 500 })
  }
} 