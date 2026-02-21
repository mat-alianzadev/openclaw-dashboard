import { NextResponse } from 'next/server'
import { gatewayClient } from '@/lib/gateway/client'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const status = await gatewayClient.getAgentStatus(params.id)
    return NextResponse.json(status)
  } catch (error) {
    console.error('Failed to fetch agent status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    )
  }
}
