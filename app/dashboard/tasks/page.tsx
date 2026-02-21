"use client"

import { useState, useEffect } from "react"
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
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Task } from "@/lib/types"
import { getPriorityColor } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface Agent {
  id: string
  name: string
  emoji: string
}

const columns = [
  { id: "backlog", title: "Backlog", color: "bg-gray-100" },
  { id: "in-progress", title: "In Progress", color: "bg-blue-50" },
  { id: "review", title: "Review", color: "bg-purple-50" },
  { id: "done", title: "Done", color: "bg-green-50" },
]

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  
  // New task form
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    assignedTo: ""
  })

  // Fetch tasks and agents
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch agents
        const agentsRes = await fetch('/api/agents')
        if (agentsRes.ok) {
          const agentsData = await agentsRes.json()
          setAgents(agentsData)
        }

        // For now, we'll use an empty tasks array
        // In production, this would fetch from a tasks API endpoint
        setTasks([])
      } catch (err) {
        console.error('Failed to fetch data:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

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

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      status: "backlog",
      priority: newTask.priority,
      assignedTo: newTask.assignedTo || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: []
    }

    setTasks(prev => [...prev, task])
    setDialogOpen(false)
    setNewTask({ title: "", description: "", priority: "medium", assignedTo: "" })
  }

  const activeTask = tasks.find((t) => t.id === activeId)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tasks</h1>
            <p className="text-muted-foreground">Manage and delegate tasks to your agents</p>
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[400px]" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage and delegate tasks to your agents</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Create a task and assign it to an agent
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Title</label>
                <Input
                  placeholder="Task title"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Task description"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(v) => setNewTask({ ...newTask, priority: v as Task["priority"] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Assign To</label>
                  <Select
                    value={newTask.assignedTo}
                    onValueChange={(v) => setNewTask({ ...newTask, assignedTo: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
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
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateTask} disabled={!newTask.title.trim()}>
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-muted-foreground mb-4">No tasks yet. Create your first task to get started.</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        </div>
      ) : (
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
                agents={agents}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} agents={agents} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}

function Column({
  column,
  tasks,
  agents,
}: {
  column: { id: string; title: string; color: string }
  tasks: Task[]
  agents: Agent[]
}) {
  return (
    <div className={`${column.color} rounded-lg p-4`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">{column.title}</h3>
        <Badge variant="secondary">{tasks.length}</Badge>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} agents={agents} />
        ))}
      </div>
    </div>
  )
}

function TaskCard({ 
  task, 
  agents, 
  isDragging 
}: { 
  task: Task
  agents: Agent[]
  isDragging?: boolean 
}) {
  const assignedAgent = agents.find(a => a.id === task.assignedTo)

  return (
    <Card
      className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-50 rotate-2" : ""}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
          {assignedAgent && (
            <span className="text-lg" title={`Assigned to ${assignedAgent.name}`}>
              {assignedAgent.emoji}
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
