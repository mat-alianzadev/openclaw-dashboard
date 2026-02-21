import { NextResponse } from 'next/server'
import { gatewayClient } from '@/lib/gateway/client'

export async function GET() {
  try {
    const status = await gatewayClient.getSystemStatus()
    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to fetch system status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch system status' },
      { status: 500 }
    )
  }
}
