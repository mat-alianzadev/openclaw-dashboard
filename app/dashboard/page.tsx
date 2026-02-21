import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, Clock, Users } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { SystemStatus, Agent } from "@/lib/types"

async function getSystemStatus(): Promise<SystemStatus> {
  // In a real app, this would fetch from the OpenClaw Gateway
  return {
    gatewayOnline: true,
    connectedAgents: 4,
    activeTasks: 2,
    totalTasks: 12,
    lastUpdate: new Date(),
  }
}

async function getAgents(): Promise<Agent[]> {
  // In a real app, this would fetch from the OpenClaw Gateway
  return [
    { id: "main", name: "Main", emoji: "🧠", status: "idle", lastActivity: new Date(), workspace: "workspace" },
    { id: "dev", name: "Dev", emoji: "🔧", status: "busy", currentTask: "Reviewing React component", lastActivity: new Date(), workspace: "workspace-dev" },
    { id: "admin", name: "Admin", emoji: "🖥️", status: "idle", lastActivity: new Date(Date.now() - 3600000), workspace: "workspace-admin" },
    { id: "reportes", name: "Reportes", emoji: "📋", status: "offline", lastActivity: new Date(Date.now() - 86400000), workspace: "workspace-reportes" },
  ]
}

export default async function DashboardPage() {
  const [status, agents] = await Promise.all([getSystemStatus(), getAgents()])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your OpenClaw agents and activities</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gateway Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Badge variant={status.gatewayOnline ? "default" : "destructive"}>
                {status.gatewayOnline ? "Online" : "Offline"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected Agents</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.connectedAgents}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{status.activeTasks}</div>
            <p className="text-xs text-muted-foreground">of {status.totalTasks} total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Tasks finished</p>
          </CardContent>
        </Card>
      </div>

      {/* Agents Status */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
          <CardDescription>Current status of all your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {agent.currentTask || "No active task"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                  <span className="text-sm text-muted-foreground">
                    {formatRelativeTime(agent.lastActivity)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions from your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { agent: "Dev", action: "Completed code review", time: "5 min ago", emoji: "🔧" },
              { agent: "Admin", action: "Restarted Traefik service", time: "15 min ago", emoji: "🖥️" },
              { agent: "Main", action: "Installed react-best-practices skill", time: "1 hour ago", emoji: "🧠" },
              { agent: "Dev", action: "Created new component", time: "2 hours ago", emoji: "🔧" },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xl">{activity.emoji}</span>
                <div className="flex-1">
                  <p className="font-medium">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">by {activity.agent}</p>
                </div>
                <span className="text-sm text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
