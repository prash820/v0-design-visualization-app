import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { infrastructureId: string } }
) {
  try {
    const authHeader = request.headers.get('Authorization')
    
    const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5001'}/api/deployment/cleanup/status/${params.infrastructureId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader || ''
      }
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error('Get cleanup status error:', error)
    return NextResponse.json(
      { error: 'Failed to get cleanup status' },
      { status: 500 }
    )
  }
} 