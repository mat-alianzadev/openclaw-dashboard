import type { Metadata } from "next"
import { AgentsPageClient } from "./agents-page-client"

export const metadata: Metadata = {
  title: "Agents - OpenClaw Dashboard",
  description: "Monitor and manage your OpenClaw agents",
}

export default function AgentsPage() {
  return <AgentsPageClient />
}
