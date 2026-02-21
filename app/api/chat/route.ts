import { NextResponse } from 'next/server'
import { gatewayClient } from '@/lib/gateway/client'

export async function POST(request: Request) {
  try {
    const { agentId, message } = await request.json()

    if (!agentId || !message) {
      return NextResponse.json(
        { error: 'Missing agentId or message' },
        { status: 400 }
      )
    }

    const result = await gatewayClient.sendMessage(agentId, message)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Failed to send message:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
