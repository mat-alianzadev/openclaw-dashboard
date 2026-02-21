import { NextResponse } from 'next/server'
import { gatewayClient } from '@/lib/gateway/client'

export async function GET() {
  try {
    const agents = await gatewayClient.getAgents()
    return NextResponse.json(agents)
  } catch (error) {
    console.error('Failed to fetch agents:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    )
  }
}
