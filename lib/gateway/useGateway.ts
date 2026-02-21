'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { GatewayMessage } from './config'
import { useGatewayStore, ConnectionStatus, initGateway } from './store'

interface UseGatewayOptions {
  onMessage?: (message: GatewayMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

export function useGateway(options: UseGatewayOptions = {}) {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const callbacksRef = useRef(options)
  
  // Keep callbacks up to date without triggering re-renders
  callbacksRef.current = options

  // Get store state and actions
  const { connect, disconnect, sendMessage } = useGatewayStore()

  // Subscribe to store status changes
  useEffect(() => {
    const unsubscribe = useGatewayStore.subscribe(
      (state) => state.status,
      (newStatus) => {
        setStatus(newStatus)
      }
    )
    
    // Set initial status
    setStatus(useGatewayStore.getState().status)
    
    return unsubscribe
  }, [])

  // Subscribe to gateway events with stable callbacks
  useEffect(() => {
    const id = Math.random().toString(36).slice(2)
    
    const unsubscribe = useGatewayStore.getState().subscribe(id, {
      onMessage: (message) => {
        callbacksRef.current.onMessage?.(message)
      },
      onConnect: () => {
        callbacksRef.current.onConnect?.()
      },
      onDisconnect: () => {
        callbacksRef.current.onDisconnect?.()
      },
      onError: (error) => {
        callbacksRef.current.onError?.(error)
      },
    })

    // Initialize connection on first mount
    initGateway()

    return unsubscribe
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    connect()
  }, [connect, disconnect])

  return {
    status,
    connect,
    disconnect,
    reconnect,
    sendMessage,
    isConnected: status === 'connected'
  }
}

// Hook for agent status updates
export function useAgentStatus() {
  const [agents, setAgents] = useState<Record<string, { status: string; lastActivity: Date }>>({})
  
  useEffect(() => {
    const id = Math.random().toString(36).slice(2)
    
    const unsubscribe = useGatewayStore.getState().subscribe(id, {
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

    initGateway()
    
    return unsubscribe
  }, [])

  const isConnected = useGatewayStore((state) => state.status === 'connected')

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

  useEffect(() => {
    const id = Math.random().toString(36).slice(2)
    
    const unsubscribe = useGatewayStore.getState().subscribe(id, {
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

    initGateway()
    
    return unsubscribe
  }, [agentId])

  const sendChatMessage = useCallback(async (content: string) => {
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
    const sent = useGatewayStore.getState().sendMessage({
      type: 'chat',
      agentId,
      content
    })

    if (!sent) {
      setIsLoading(false)
      throw new Error('Not connected to Gateway')
    }
  }, [agentId])

  const isConnected = useGatewayStore((state) => state.status === 'connected')

  return {
    messages,
    isLoading,
    isConnected,
    sendChatMessage
  }
}
