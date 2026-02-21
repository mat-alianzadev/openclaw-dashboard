import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { cva, type VariantProps } from "class-variance-authority"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date()
  const d = typeof date === 'string' ? new Date(date) : date
  const diff = now.getTime() - d.getTime()
  
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)
  
  if (seconds < 60) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    idle: 'bg-green-500',
    busy: 'bg-yellow-500',
    offline: 'bg-gray-500',
    backlog: 'bg-gray-500',
    'in-progress': 'bg-blue-500',
    review: 'bg-purple-500',
    done: 'bg-green-500',
    debug: 'bg-gray-400',
    info: 'bg-blue-500',
    warn: 'bg-yellow-500',
    error: 'bg-red-500',
  }
  return colors[status] || 'bg-gray-500'
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: 'bg-blue-100 text-blue-800',
    medium: 'bg-yellow-100 text-yellow-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  }
  return colors[priority] || 'bg-gray-100 text-gray-800'
}

// Status badge variants using cva
export const statusBadgeVariants = cva("", {
  variants: {
    status: {
      idle: "bg-green-500 hover:bg-green-600",
      busy: "bg-yellow-500 hover:bg-yellow-600",
      offline: "bg-gray-500 hover:bg-gray-600",
      error: "bg-red-500 hover:bg-red-600",
      backlog: "bg-gray-500 hover:bg-gray-600",
      "in-progress": "bg-blue-500 hover:bg-blue-600",
      review: "bg-purple-500 hover:bg-purple-600",
      done: "bg-green-500 hover:bg-green-600",
    },
  },
  defaultVariants: {
    status: "offline",
  },
})

// Helper function to get full status color classes for badges
export function getStatusColorClass(status: string): string {
  const classes: Record<string, string> = {
    idle: "bg-green-500",
    busy: "bg-yellow-500",
    offline: "bg-gray-500",
    error: "bg-red-500",
    backlog: "bg-gray-500",
    "in-progress": "bg-blue-500",
    review: "bg-purple-500",
    done: "bg-green-500",
  }
  return classes[status] || "bg-gray-500"
}
