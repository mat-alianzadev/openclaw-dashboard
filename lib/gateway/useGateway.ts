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
