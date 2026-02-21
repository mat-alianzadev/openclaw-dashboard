"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Activity, Terminal, Settings } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { Agent } from "@/lib/types"

const mockAgents: Agent[] = [
  { id: "main", name: "Main", emoji: "🧠", status: "idle", lastActivity: new Date(), workspace: "workspace", model: "openrouter/moonshotai/kimi-k2.5" },
  { id: "dev", name: "Dev", emoji: "🔧", status: "busy", currentTask: "Reviewing React component performance", lastActivity: new Date(), workspace: "workspace-dev", model: "openrouter/anthropic/claude-sonnet-4.5" },
  { id: "admin", name: "Admin", emoji: "🖥️", status: "idle", lastActivity: new Date(Date.now() - 3600000), workspace: "workspace-admin", model: "openrouter/moonshotai/kimi-k2.5" },
  { id: "reportes", name: "Reportes", emoji: "📋", status: "offline", lastActivity: new Date(Date.now() - 86400000), workspace: "workspace-reportes", model: "openrouter/moonshotai/kimi-k2.5" },
  { id: "briefing", name: "Briefing", emoji: "☀️", status: "idle", lastActivity: new Date(Date.now() - 7200000), workspace: "workspace", model: "openrouter/moonshotai/kimi-k2.5" },
  { id: "scout", name: "Scout", emoji: "🔍", status: "idle", lastActivity: new Date(Date.now() - 10800000), workspace: "workspace", model: "openrouter/moonshotai/kimi-k2.5" },
]

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

export default function AgentsPage() {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(mockAgents[0])
  const [agents, setAgents] = useState<Agent[]>(mockAgents)

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        lastActivity: agent.status === "busy" ? new Date() : agent.lastActivity
      })))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

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
            <ScrollArea className="h-[600px]">
              <div className="space-y-2">
                {agents.map((agent) => (
                  <button
                    key={agent.id}
                    onClick={() => setSelectedAgent(agent)}
                    className={`w-full flex items-center gap-3 rounded-lg p-3 text-left transition-colors ${
                      selectedAgent?.id === agent.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <span className="text-2xl">{agent.emoji}</span>
                    <div className="flex-1">
                      <p className="font-medium">{agent.name}</p>
                      <p className="text-xs opacity-70">{agent.workspace}</p>
                    </div>
                    <Badge
                      className={`
                        ${agent.status === "idle" && "bg-green-500"}
                        ${agent.status === "busy" && "bg-yellow-500"}
                        ${agent.status === "offline" && "bg-gray-500"}
                        ${agent.status === "error" && "bg-red-500"}
                      `}
                    >
                      {agent.status}
                    </Badge>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Agent Details */}
        {selectedAgent && (
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
                      <Badge className={`
                        ${selectedAgent.status === "idle" && "bg-green-500"}
                        ${selectedAgent.status === "busy" && "bg-yellow-500"}
                        ${selectedAgent.status === "offline" && "bg-gray-500"}
                        ${selectedAgent.status === "error" && "bg-red-500"}
                      `}>
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
                      <p className="font-medium">{formatRelativeTime(selectedAgent.lastActivity)}</p>
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
                  <ScrollArea className="h-[400px] rounded-md border bg-black p-4">
                    <div className="font-mono text-sm text-green-400">
                      {mockOutput[selectedAgent.id]?.map((line, i) => (
                        <div key={i} className="py-1">
                          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {line}
                        </div>
                      )) || (
                        <div className="text-gray-500">No recent output</div>
                      )}
                    </div>
                  </ScrollArea>
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
        )}
      </div>
    </div>
  )
}
