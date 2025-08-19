import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:5001'
    const response = await fetch(`${backendUrl}/api/deployment-wizard/steps`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching wizard steps:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wizard steps' },
      { status: 500 }
    )
  }
} 