"use client"

import { useState } from "react"
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
import { Search, Download, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

const mockLogs = [
  { id: "1", timestamp: new Date(), level: "info", agentId: "dev", message: "Starting code review for dashboard components" },
  { id: "2", timestamp: new Date(Date.now() - 60000), level: "debug", agentId: "dev", message: "Found 3 components to review" },
  { id: "3", timestamp: new Date(Date.now() - 120000), level: "info", agentId: "admin", message: "Connecting to server 192.168.1.75" },
  { id: "4", timestamp: new Date(Date.now() - 180000), level: "warn", agentId: "admin", message: "Container dokploy-traefik needs restart" },
  { id: "5", timestamp: new Date(Date.now() - 240000), level: "info", agentId: "admin", message: "Container restarted successfully" },
  { id: "6", timestamp: new Date(Date.now() - 300000), level: "info", agentId: "main", message: "Installing skill react-best-practices" },
  { id: "7", timestamp: new Date(Date.now() - 360000), level: "debug", agentId: "main", message: "Downloaded 59 rule files" },
  { id: "8", timestamp: new Date(Date.now() - 420000), level: "info", agentId: "main", message: "Skill installed successfully" },
  { id: "9", timestamp: new Date(Date.now() - 480000), level: "error", agentId: "reportes", message: "Failed to generate PDF: template not found" },
  { id: "10", timestamp: new Date(Date.now() - 540000), level: "info", agentId: "reportes", message: "Retrying with default template" },
]

export default function LogsPage() {
  const [search, setSearch] = useState("")
  const [levelFilter, setLevelFilter] = useState<string>("all")
  const [agentFilter, setAgentFilter] = useState<string>("all")

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch = log.message.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesAgent = agentFilter === "all" || log.agentId === agentFilter
    return matchesSearch && matchesLevel && matchesAgent
  })

  const getLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      debug: "bg-gray-500",
      info: "bg-blue-500",
      warn: "bg-yellow-500",
      error: "bg-red-500",
    }
    return colors[level] || "bg-gray-500"
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
                  <SelectItem value="main">Main</SelectItem>
                  <SelectItem value="dev">Dev</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="reportes">Reportes</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted transition-colors"
                >
                  <Badge className={`${getLevelColor(log.level)} text-white`}>
                    {log.level.toUpperCase()}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium">{log.message}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(log.timestamp)} • {log.agentId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
