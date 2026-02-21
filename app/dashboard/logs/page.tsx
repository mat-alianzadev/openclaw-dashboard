import type { Metadata } from "next"
import { LogsPageClient } from "./logs-page-client"

export const metadata: Metadata = {
  title: "Logs - OpenClaw Dashboard",
  description: "View and search agent logs",
}

export default function LogsPage() {
  return <LogsPageClient />
}
