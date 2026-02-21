'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GATEWAY_CONFIG, GatewayMessage } from './config'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface UseGatewayOptions {
  onMessage?: (message: GatewayMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function useGateway(options: UseGatewayOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>()
  const { onMessage, onConnect, onDisconnect, onError } = options

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    setStatus('connecting')

    try {
      const ws = new WebSocket(GATEWAY_CONFIG.url)
      
      ws.onopen = () => {
        setStatus('connected')
        // Authenticate with Gateway
        ws.send(JSON.stringify({
          type: 'auth',
          token: GATEWAY_CONFIG.token
        }))
        onConnect?.()
      }

      ws.onmessage = (event) => {
        try {
          const message: GatewayMessage = JSON.parse(event.data)
          onMessage?.(message)
        } catch (err) {
          console.error('Failed to parse Gateway message:', err)
        }
      }

      ws.onclose = () => {
        setStatus('disconnected')
        onDisconnect?.()
        // Auto-reconnect after 5 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          connect()
        }, 5000)
      }

      ws.onerror = (error) => {
        setStatus('error')
        onError?.(new Error('WebSocket error'))
      }

      wsRef.current = ws
    } catch (err) {
      setStatus('error')
      onError?.(err as Error)
    }
  }, [onMessage, onConnect, onDisconnect, onError])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    wsRef.current?.close()
    wsRef.current = null
    setStatus('disconnected')
  }, [])

  const sendMessage = useCallback((message: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message))
      return true
    }
    return false
  }, [])

  useEffect(() => {
    connect()
    return () => disconnect()
  }, [connect, disconnect])

  return {
    status,
    connect,
    disconnect,
    sendMessage,
    isConnected: status === 'connected'
  }
}

// Hook for agent status updates
export function useAgentStatus() {
  const [agents, setAgents] = useState<Record<string, { status: string; lastActivity: Date }>>({})
  
  const { isConnected } = useGateway({
    onMessage: (message) => {
      if (message.type === 'agent_status' && message.agentId) {
        setAgents(prev => ({
          ...prev,
          [message.agentId!]: {
            status: (message.data as { status: string }).status || 'unknown',
            lastActivity: new Date()
          }
        }))
      }
    }
  })

  return { agents, isConnected }
}

// Hook for chat messages
export function useChat(agentId: string) {
  const [messages, setMessages] = useState<Array<{
    id: string
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>>([])
  const [isLoading, setIsLoading] = useState(false)

  const { sendMessage, isConnected } = useGateway({
    onMessage: (message) => {
      if (message.type === 'chat' && message.agentId === agentId) {
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: (message.data as { content: string }).content,
          timestamp: new Date()
        }])
        setIsLoading(false)
      }
    }
  })

  const sendChatMessage = useCallback(async (content: string) => {
    if (!isConnected) {
      throw new Error('Not connected to Gateway')
    }

    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Send to Gateway
    sendMessage({
      type: 'chat',
      agentId,
      content
    })
  }, [agentId, isConnected, sendMessage])

  return {
    messages,
    isLoading,
    isConnected,
    sendChatMessage
  }
}
