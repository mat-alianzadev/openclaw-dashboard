import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { GATEWAY_CONFIG, GatewayMessage } from './config'

export type ConnectionStatus = 'connecting' | 'connected' | 'disconnected' | 'error'

interface GatewayCallbacks {
  onMessage?: (message: GatewayMessage) => void
  onConnect?: () => void
  onDisconnect?: () => void
  onError?: (error: Error) => void
}

interface GatewayState {
  status: ConnectionStatus
  ws: WebSocket | null
  reconnectTimeout: NodeJS.Timeout | null
  subscribers: Map<string, GatewayCallbacks>
  
  // Actions
  connect: () => void
  disconnect: () => void
  sendMessage: (message: unknown) => boolean
  subscribe: (id: string, callbacks: GatewayCallbacks) => () => void
}

export const useGatewayStore = create<GatewayState>()(
  subscribeWithSelector((set, get) => ({
    status: 'disconnected',
    ws: null,
    reconnectTimeout: null,
    subscribers: new Map(),

    connect: () => {
      const state = get()
      
      // Prevent multiple connections
      if (state.ws?.readyState === WebSocket.OPEN) return
      if (state.ws?.readyState === WebSocket.CONNECTING) return

      set({ status: 'connecting' })

      try {
        const ws = new WebSocket(GATEWAY_CONFIG.url)

        ws.onopen = () => {
          set({ status: 'connected' })
          // Authenticate with Gateway
          ws.send(JSON.stringify({
            type: 'auth',
            token: GATEWAY_CONFIG.token
          }))
          
          // Notify all subscribers
          get().subscribers.forEach((callbacks) => {
            callbacks.onConnect?.()
          })
        }

        ws.onmessage = (event) => {
          try {
            const message: GatewayMessage = JSON.parse(event.data)
            // Notify all subscribers
            get().subscribers.forEach((callbacks) => {
              callbacks.onMessage?.(message)
            })
          } catch (err) {
            console.error('Failed to parse Gateway message:', err)
          }
        }

        ws.onclose = () => {
          set({ status: 'disconnected', ws: null })
          
          // Notify all subscribers
          get().subscribers.forEach((callbacks) => {
            callbacks.onDisconnect?.()
          })

          // Auto-reconnect after 5 seconds
          const timeout = setTimeout(() => {
            get().connect()
          }, 5000)
          set({ reconnectTimeout: timeout })
        }

        ws.onerror = () => {
          set({ status: 'error' })
          // Notify all subscribers
          get().subscribers.forEach((callbacks) => {
            callbacks.onError?.(new Error('WebSocket error'))
          })
        }

        set({ ws })
      } catch (err) {
        set({ status: 'error' })
        get().subscribers.forEach((callbacks) => {
          callbacks.onError?.(err as Error)
        })
      }
    },

    disconnect: () => {
      const { ws, reconnectTimeout } = get()
      
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout)
      }
      
      ws?.close()
      set({ ws: null, status: 'disconnected', reconnectTimeout: null })
    },

    sendMessage: (message: unknown) => {
      const { ws } = get()
      if (ws?.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message))
        return true
      }
      return false
    },

    subscribe: (id: string, callbacks: GatewayCallbacks) => {
      set((state) => {
        const newSubscribers = new Map(state.subscribers)
        newSubscribers.set(id, callbacks)
        return { subscribers: newSubscribers }
      })

      // Return unsubscribe function
      return () => {
        set((state) => {
          const newSubscribers = new Map(state.subscribers)
          newSubscribers.delete(id)
          return { subscribers: newSubscribers }
        })
      }
    },
  }))
)

// Initialize connection on first use
let initialized = false
export function initGateway() {
  if (typeof window === 'undefined') return
  if (initialized) return
  initialized = true
  useGatewayStore.getState().connect()
}
