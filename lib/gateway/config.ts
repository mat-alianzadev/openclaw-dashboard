// OpenClaw Gateway Configuration
export const GATEWAY_CONFIG = {
  url: process.env.OPENCLAW_GATEWAY_URL || 'ws://localhost:18789',
  restUrl: process.env.OPENCLAW_REST_URL || 'http://localhost:18789',
  token: process.env.OPENCLAW_GATEWAY_TOKEN || '',
}

// Agent type mapping from Gateway to Dashboard
export interface GatewayAgent {
  id: string
  name: string
  workspace: string
  status?: 'idle' | 'busy' | 'offline' | 'error'
  model?: string
  lastActivity?: string
  currentTask?: string
}

export interface GatewayMessage {
  type: 'agent_status' | 'log' | 'chat' | 'task_update' | 'system'
  agentId?: string
  timestamp: string
  data: unknown
}

export interface GatewayLog {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  agentId?: string
  message: string
  metadata?: Record<string, unknown>
}
