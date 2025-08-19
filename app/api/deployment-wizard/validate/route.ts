import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${backendUrl}/api/deployment-wizard/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error validating wizard configuration:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to validate configuration' },
      { status: 500 }
    )
  }
} 