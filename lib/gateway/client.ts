import { GATEWAY_CONFIG, GatewayAgent, GatewayLog } from './config'

// HTTP Client for Gateway REST API
class GatewayClient {
  private baseUrl: string
  private token: string

  constructor() {
    this.baseUrl = GATEWAY_CONFIG.restUrl
    this.token = GATEWAY_CONFIG.token
  }

  private async fetch(path: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new Error(`Gateway API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Get all agents
  async getAgents(): Promise<GatewayAgent[]> {
    try {
      // Try Gateway API first
      const agents = await this.fetch('/api/agents')
      return agents
    } catch {
      // Fallback to config-based agent list
      return this.getAgentsFromConfig()
    }
  }

  // Get agent status
  async getAgentStatus(agentId: string): Promise<Partial<GatewayAgent>> {
    try {
      return await this.fetch(`/api/agents/${agentId}/status`)
    } catch {
      return { status: 'offline' }
    }
  }

  // Get logs
  async getLogs(options: {
    limit?: number
    level?: string
    agentId?: string
    since?: string
  } = {}): Promise<GatewayLog[]> {
    const params = new URLSearchParams()
    if (options.limit) params.set('limit', options.limit.toString())
    if (options.level) params.set('level', options.level)
    if (options.agentId) params.set('agentId', options.agentId)
    if (options.since) params.set('since', options.since)

    try {
      return await this.fetch(`/api/logs?${params}`)
    } catch {
      return []
    }
  }

  // Send message to agent
  async sendMessage(agentId: string, message: string): Promise<{ success: boolean }> {
    return this.fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ agentId, message })
    })
  }

  // Get system status
  async getSystemStatus(): Promise<{
    gatewayOnline: boolean
    connectedAgents: number
    activeTasks: number
    totalTasks: number
    lastUpdate: string
  }> {
    try {
      return await this.fetch('/api/status')
    } catch {
      // Return fallback status
      const agents = await this.getAgents()
      return {
        gatewayOnline: true,
        connectedAgents: agents.length,
        activeTasks: 0,
        totalTasks: 0,
        lastUpdate: new Date().toISOString()
      }
    }
  }

  // Fallback: Get agents from OpenClaw config
  private async getAgentsFromConfig(): Promise<GatewayAgent[]> {
    // These match the agents defined in openclaw.json
    return [
      { id: 'main', name: 'Main', workspace: 'workspace', status: 'idle', model: 'openrouter/moonshotai/kimi-k2.5' },
      { id: 'dev', name: 'Dev', workspace: 'workspace-dev', status: 'busy', model: 'openrouter/anthropic/claude-sonnet-4.5' },
      { id: 'admin', name: 'Admin', workspace: 'workspace-admin', status: 'idle', model: 'openrouter/moonshotai/kimi-k2.5' },
      { id: 'reportes', name: 'Reportes', workspace: 'workspace-reportes', status: 'offline', model: 'openrouter/moonshotai/kimi-k2.5' },
      { id: 'briefing', name: 'Briefing', workspace: 'workspace', status: 'idle' },
      { id: 'scout', name: 'Scout', workspace: 'workspace', status: 'idle' },
      { id: 'ventas', name: 'Ventas', workspace: 'workspace', status: 'idle' },
      { id: 'content', name: 'Content', workspace: 'workspace', status: 'idle' },
      { id: 'seo', name: 'SEO', workspace: 'workspace', status: 'idle' },
      { id: 'bidding', name: 'Bidding', workspace: 'workspace', status: 'idle' },
      { id: 'finanzas', name: 'Finanzas', workspace: 'workspace', status: 'idle' },
      { id: 'builder', name: 'Builder', workspace: 'workspace', status: 'idle' },
    ]
  }
}

export const gatewayClient = new GatewayClient()
