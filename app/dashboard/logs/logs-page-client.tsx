"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Download, Trash2, Loader2 } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { useGateway } from "@/lib/gateway/useGateway"
import { Skeleton } from "@/components/ui/skeleton"

interface LogEntry {
  id: string
  timestamp: string
  level: 'debug' | 'info' | 'warn' | 'error'
  agentId?: string
  message: string
}

interface Agent {
  id: string
  name: string
  emoji: string
}

export function LogsPageClient() {
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")
  const scrollRef = useRef<HTMLDivElement>(null)
  
  const { status: gatewayStatus } = useGateway({
    onMessage: (message) => {
      if (message.type === 'log') {
        const logEntry = message.data as LogEntry
        setLogs(prev => [logEntry, ...prev].slice(0, 1000)) // Keep last 1000 logs
      }
    }
  })

  // Fetch initial logs and agents with AbortController
  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchData() {
      try {
        // Fetch agents
        const agentsRes = await fetch('/api/agents', { signal: controller.signal })
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json()
          setAgents(agentsData)
        }

        // Fetch logs
        const logsRes = await fetch('/api/logs?limit=100', { signal: controller.signal })
        if (logsRes.ok) {
          const logsData = await logsRes.json()
          setLogs(logsData)
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to fetch data:', err)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    return () => controller.abort()
  }, [])

  // Auto-scroll to bottom for new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
  }, [logs])

  // Memoized filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase())
      const matchesLevel = levelFilter === "all" || log.level === levelFilter
      const matchesAgent = agentFilter === "all" || log.agentId === agentFilter
      return matchesSearch && matchesLevel && matchesAgent
    })
  }, [logs, search, levelFilter, agentFilter])

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: "bg-gray-500",
      info: "bg-blue-500",
      warn: "bg-yellow-500",
      error: "bg-red-500",
    }
    return colors[level] || "bg-gray-500"
  }

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(filteredLogs, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `openclaw-logs-${new Date().toISOString()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleClear = () => {
    setLogs([])
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Logs</h1>
          <p className="text-muted-foreground">View and search agent logs</p>
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-10 w-full" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-[600px]" />
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Logs</h1>
        <p className="text-muted-foreground">View and search agent logs</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warn">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <span className="flex items-center gap-2">
                        <span>{agent.emoji}</span>
                        {agent.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon" onClick={handleExport}>
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleClear}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <Badge variant={gatewayStatus === 'connected' ? 'default' : 'secondary'}>
              {gatewayStatus === 'connected' ? 'Live' : 'Disconnected'}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {filteredLogs.length} logs
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea ref={scrollRef} className="h-[600px]">
            <div className="space-y-2">
              {filteredLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No logs found
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <Badge className={`${getLevelColor(log.level)} text-white shrink-0`}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium break-words">{log.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(log.timestamp)}
                        {log.agentId && (
                          <span className="ml-2">
                            • {agents.find(a => a.id === log.agentId)?.name || log.agentId}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
