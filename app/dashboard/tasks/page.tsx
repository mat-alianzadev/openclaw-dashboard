"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  SortableContext,
  arrayMove,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Task } from "@/lib/types"
import { getPriorityColor } from "@/lib/utils"

const initialTasks: Task[] = [
  { id: "1", title: "Review React components", description: "Code review for new dashboard", status: "in-progress", priority: "high", assignedTo: "dev", createdAt: new Date(), updatedAt: new Date(), tags: ["code-review", "react"] },
  { id: "2", title: "Setup Docker deployment", description: "Configure production deployment", status: "backlog", priority: "medium", assignedTo: "admin", createdAt: new Date(), updatedAt: new Date(), tags: ["devops", "docker"] },
  { id: "3", title: "Create technical report", description: "Service report for client", status: "review", priority: "high", assignedTo: "reportes", createdAt: new Date(), updatedAt: new Date(), tags: ["documentation"] },
  { id: "4", title: "Optimize database queries", description: "Improve performance", status: "done", priority: "medium", createdAt: new Date(), updatedAt: new Date(), tags: ["performance"] },
  { id: "5", title: "Update dependencies", description: "Security patches", status: "backlog", priority: "low", createdAt: new Date(), updatedAt: new Date(), tags: ["maintenance"] },
]

const columns = [
  { id: "backlog", title: "Backlog", color: "bg-gray-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50" },
  { id: "review", title: "Review", color: "bg-purple-50" },
  { id: "done", title: "Done", color: "bg-green-50" },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeTask = tasks.find((t) => t.id === active.id)
    const overColumn = columns.find((c) => c.id === over.id)

    if (activeTask && overColumn) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === active.id
            ? { ...t, status: overColumn.id as Task["status"], updatedAt: new Date() }
            : t
        )
      )
    }
  }

  const activeTask = tasks.find((t) => t.id === activeId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and delegate tasks to your agents</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <Column
              key={column.id}
              column={column}
              tasks={tasks.filter((t) => t.status === column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

function Column({
  column,
  tasks,
}: {
  column: { id: string; title: string; color: string }
  tasks: Task[]
}) {
  return (
    <div className={`${column.color} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  return (
    <Card
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 rotate-2" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
          {task.assignedTo && (
            <span className="text-lg" title={`Assigned to ${task.assignedTo}`}>
              {getAgentEmoji(task.assignedTo)}
            </span>
          )}
        </div>
        <h4 className="font-medium mb-1">{task.title}</h4>
        <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
        <div className="flex flex-wrap gap-1">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function getAgentEmoji(agentId: string): string {
  const emojis: Record<string, string> = {
    main: "🧠",
    dev: "🔧",
    admin: "🖥️",
    reportes: "📋",
    briefing: "☀️",
    scout: "🔍",
    ventas: "💰",
    content: "✍️",
    seo: "🎯",
    bidding: "📝",
    finanzas: "💵",
    builder: "🏗️",
  }
  return emojis[agentId] || "🤖"
}
