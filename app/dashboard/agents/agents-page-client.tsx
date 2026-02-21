"use client"

import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Terminal, Settings, Loader2 } from "lucide-react"
import { formatRelativeTime, getStatusColorClass } from "@/lib/utils"
import { Agent } from "@/lib/types"
import { Skeleton } from "@/components/ui/skeleton"

// Memoized agent list item to prevent unnecessary re-renders
function AgentListItem({
  agent,
  isSelected,
  onClick,
}: {
  agent: Agent
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
        isSelected
          ? "bg-primary text-primary-foreground"
          : "hover:bg-accent"
      }`}
    >
      <span className="text-2xl">{agent.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{agent.name}</p>
        <p className="text-xs opacity-70 truncate">{agent.workspace}</p>
      </div>
      <Badge className={`${getStatusColorClass(agent.status)} shrink-0`}>
        {agent.status}
      </Badge>
    </button>
  )
}

// Memoized agent list to prevent re-renders when parent updates
const AgentList = React.memo(function AgentList({
  agents,
  selectedId,
  onSelect,
}: {
  agents: Agent[]
  selectedId: string | null
  onSelect: (agent: Agent) => void
}) {
  return (
    <ScrollArea className="h-[600px]">
      <div className="space-y-2">
        {agents.map((agent) => (
          <AgentListItem
            key={agent.id}
            agent={agent}
            isSelected={selectedId === agent.id}
            onClick={() => onSelect(agent)}
          />
        ))}
      </div>
    </ScrollArea>
  )
})

// Loading skeleton for agent list
function AgentListSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg p-3">
          <Skeleton className="h-8 w-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
          <Skeleton className="h-6 w-[60px]" />
        </div>
      ))}
    </div>
  )
}

// Output viewer component
function OutputViewer({ agentId }: { agentId: string }) {
  const [output, setOutput] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const controller = new AbortController()
    
    // In production, this would fetch real output from Gateway
    setLoading(true)
    const mockOutput: Record<string, string[]> = {
      dev: [
        "Analyzing component structure...",
        "Found 3 potential performance issues",
        "✅ Fixed: Removed unnecessary re-renders",
        "✅ Fixed: Added React.memo() to heavy components",
        "✅ Fixed: Implemented lazy loading",
        "Code review completed successfully",
      ],
      admin: [
        "Connecting to server 192.168.1.75...",
        "Checking Docker containers...",
        "Found 1 container to restart: dokploy-traefik",
        "Restarting container...",
        "✅ Container restarted successfully",
        "Status: Up 3 seconds",
      ],
    }
    
    // Simulate async fetch
    const timer = setTimeout(() => {
      if (!controller.signal.aborted) {
        setOutput(mockOutput[agentId] || ["No recent output available"])
        setLoading(false)
      }
    }, 500)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [agentId])

  if (loading) {
    return (
      <div className="h-[400px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border bg-black p-4">
      <div className="font-mono text-sm text-green-400">
        {output.map((line, i) => (
          <div key={i} className="py-1">
            <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {line}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

export function AgentsPageClient() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch agents on mount with AbortController
  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchAgents() {
      try {
        const res = await fetch("/api/agents", { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setAgents(data)
          if (data.length > 0 && !selectedAgent) {
            setSelectedAgent(data[0])
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error("Failed to fetch agents:", err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
    
    return () => controller.abort()
  }, [])

  // Memoized callback for agent selection to prevent unnecessary re-renders
  const handleSelectAgent = useCallback((agent: Agent) => {
    setSelectedAgent(agent)
  }, [])

  // Memoized selected agent ID for comparison
  const selectedId = useMemo(() => selectedAgent?.id ?? null, [selectedAgent])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Agents</h1>
        <p className="text-muted-foreground">Monitor and manage your OpenClaw agents</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Agent List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>All Agents</CardTitle>
            <CardDescription>Select an agent to view details</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <AgentListSkeleton />
            ) : (
              <AgentList
                agents={agents}
                selectedId={selectedId}
                onSelect={handleSelectAgent}
              />
            )}
          </CardContent>
        </Card>

        {/* Agent Details */}
        {selectedAgent ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedAgent.emoji}</span>
                  <div>
                    <CardTitle>{selectedAgent.name}</CardTitle>
                    <CardDescription>Agent ID: {selectedAgent.id}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure
                  </Button>
                  <Button size="sm">
                    <Activity className="h-4 w-4 mr-2" />
                    Spawn Task
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details">
                <TabsList>
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="output">Output</TabsTrigger>
                  <TabsTrigger value="logs">Logs</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <Badge className={getStatusColorClass(selectedAgent.status)}>
                        {selectedAgent.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Model</p>
                      <p className="font-medium">{selectedAgent.model || "Default"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Workspace</p>
                      <p className="font-medium">{selectedAgent.workspace}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Last Activity</p>
                      <p className="font-medium">{formatRelativeTime(selectedAgent.lastActivity || new Date())}</p>
                    </div>
                  </div>

                  {selectedAgent.currentTask && (
                    <div>
                      <p className="text-sm text-muted-foreground">Current Task</p>
                      <p className="font-medium">{selectedAgent.currentTask}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="output">
                  <OutputViewer agentId={selectedAgent.id} />
                </TabsContent>

                <TabsContent value="logs">
                  <ScrollArea className="h-[400px] rounded-md border p-4">
                    <div className="font-mono text-sm">
                      <div className="text-gray-500">[INFO] Agent initialized</div>
                      <div className="text-gray-500">[INFO] Connected to OpenClaw Gateway</div>
                      <div className="text-gray-500">[INFO] Workspace loaded: {selectedAgent.workspace}</div>
                      <div className="text-blue-500">[DEBUG] Skills loaded successfully</div>
                      <div className="text-green-500">[INFO] Ready to accept tasks</div>
                    </div>
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2 flex items-center justify-center h-[400px]">
            <p className="text-muted-foreground">Select an agent to view details</p>
          </Card>
        )}
      </div>
    </div>
  )
}
