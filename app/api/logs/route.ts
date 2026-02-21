import { NextResponse } from 'next/server'
import { gatewayClient } from '@/lib/gateway/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '100')
    const level = searchParams.get('level') || undefined
    const agentId = searchParams.get('agentId') || undefined
    const since = searchParams.get('since') || undefined

    const logs = await gatewayClient.getLogs({ limit, level, agentId, since })
    return NextResponse.json(logs)
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}
