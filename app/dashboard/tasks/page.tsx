import type { Metadata } from "next"
import { TasksPageClient } from "./tasks-page-client"

export const metadata: Metadata = {
  title: "Tasks - OpenClaw Dashboard",
  description: "Manage and delegate tasks to your agents",
}

export default function TasksPage() {
  return <TasksPageClient />
}
