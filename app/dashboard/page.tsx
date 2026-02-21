import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, Clock, Users } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { SystemStatus, Agent, AgentActivity } from "@/lib/types"
import { gatewayClient } from "@/lib/gateway/client"
import { ErrorBoundary } from "@/components/error-boundary"
import { Skeleton } from "@/components/ui/skeleton"

// Loading skeleton for stats
function StatsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-[100px]" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-[60px]" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Stats component with real data
async function StatsSection() {
  const status = await gatewayClient.getSystemStatus()
  
  const stats = [
    {
      title: "Gateway Status",
      icon: Activity,
      value: status.gatewayOnline ? "Online" : "Offline",
      variant: (status.gatewayOnline ? "default" : "destructive") as "default" | "destructive",
    },
    {
      title: "Connected Agents",
      icon: Users,
      value: status.connectedAgents.toString(),
    },
    {
      title: "Active Tasks",
      icon: Clock,
      value: status.activeTasks.toString(),
      subtext: `of ${status.totalTasks} total`,
    },
    {
      title: "Completed Today",
      icon: CheckCircle,
      value: "8", // This would come from real metrics
      subtext: "Tasks finished",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stat.variant ? (
              <Badge variant={stat.variant}>{stat.value}</Badge>
            ) : (
              <div className="text-2xl font-bold">{stat.value}</div>
            )}
            {stat.subtext && (
              <p className="text-xs text-muted-foreground">{stat.subtext}</p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Agent list loading skeleton
function AgentListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-3 w-[150px]" />
            </div>
          </div>
          <Skeleton className="h-6 w-[60px]" />
        </div>
      ))}
    </div>
  )
}

// Agent list with real data
async function AgentListSection() {
  const agents = await gatewayClient.getAgents()

  return (
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
              {formatRelativeTime(agent.lastActivity || new Date())}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

// Activity loading skeleton
function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-6 w-6" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[100px]" />
          </div>
          <Skeleton className="h-3 w-[60px]" />
        </div>
      ))}
    </div>
  )
}

// Recent activity with real data (placeholder for now)
async function ActivitySection() {
  // In production, this would fetch from Gateway activity log
  const activities = [
    { agent: "Dev", action: "Completed code review", time: "5 min ago", emoji: "🔧" },
    { agent: "Admin", action: "Restarted Traefik service", time: "15 min ago", emoji: "🖥️" },
    { agent: "Main", action: "Installed react-best-practices skill", time: "1 hour ago", emoji: "🧠" },
    { agent: "Dev", action: "Created new component", time: "2 hours ago", emoji: "🔧" },
  ]

  return (
    <div className="space-y-4">
      {activities.map((activity, i) => (
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
  )
}

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your OpenClaw agents and activities</p>
      </div>

      {/* Stats with Suspense for streaming */}
      <ErrorBoundary fallback={<div className="text-red-500">Failed to load stats</div>}>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>
      </ErrorBoundary>

      {/* Agents Status with Suspense */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
          <CardDescription>Current status of all your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <ErrorBoundary fallback={<div className="text-red-500">Failed to load agents</div>}>
            <Suspense fallback={<AgentListSkeleton />}>
              <AgentListSection />
            </Suspense>
          </ErrorBoundary>
        </CardContent>
      </Card>

      {/* Recent Activity with Suspense */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest actions from your agents</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<ActivitySkeleton />}>
            <ActivitySection />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  )
}
