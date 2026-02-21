import type { Metadata } from "next"
import { ChatPageClient } from "./chat-page-client"

export const metadata: Metadata = {
  title: "Chat - OpenClaw Dashboard",
  description: "Interact with your OpenClaw agents",
}

export default function ChatPage() {
  return <ChatPageClient />
}
