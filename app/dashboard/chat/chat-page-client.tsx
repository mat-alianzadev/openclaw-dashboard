"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Send, Loader2, Wifi, WifiOff } from "lucide-react"
import { formatRelativeTime } from "@/lib/utils"
import { useGateway, useChat } from "@/lib/gateway/useGateway"
import { Skeleton } from "@/components/ui/skeleton"

interface Agent {
  id: string
  name: string
  emoji: string
  status: string
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

// Agent selector with real data
function AgentSelector({ 
  value, 
  onChange, 
  agents,
  loading 
}: { 
  value: string
  onChange: (value: string) => void
  agents: Agent[]
  loading: boolean
}) {
  if (loading) {
    return <Skeleton className="h-10 w-[180px]" />
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select agent" />
      </SelectTrigger>
      <SelectContent>
        {agents.map((agent) => (
          <SelectItem key={agent.id} value={agent.id}>
            <span className="flex items-center gap-2">
              <span>{agent.emoji}</span>
              <span>{agent.name}</span>
              <Badge 
                variant="outline" 
                className={`ml-2 text-xs ${
                  agent.status === 'idle' ? 'bg-green-100 text-green-800' :
                  agent.status === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}
              >
                {agent.status}
              </Badge>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

// Connection status indicator
function ConnectionStatus({ status }: { status: 'connecting' | 'connected' | 'disconnected' | 'error' }) {
  const icons = {
    connecting: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
    connected: <Wifi className="h-4 w-4 text-green-500" />,
    disconnected: <WifiOff className="h-4 w-4 text-gray-500" />,
    error: <WifiOff className="h-4 w-4 text-red-500" />
  }

  const labels = {
    connecting: 'Connecting...',
    connected: 'Connected',
    disconnected: 'Disconnected',
    error: 'Error'
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      {icons[status]}
      <span className={`
        ${status === 'connected' ? 'text-green-600' : ''}
        ${status === 'error' ? 'text-red-600' : ''}
        ${status === 'connecting' ? 'text-yellow-600' : ''}
      `}>
        {labels[status]}
      </span>
    </div>
  )
}

export function ChatPageClient() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [selectedAgent, setSelectedAgent] = useState("")
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  // Fetch agents from API with AbortController
  const [agentsLoading, setAgentsLoading] = useState(true)
  
  useEffect(() => {
    const controller = new AbortController()
    
    async function fetchAgents() {
      try {
        const res = await fetch('/api/agents', { signal: controller.signal })
        if (res.ok) {
          const data = await res.json()
          setAgents(data)
          if (data.length > 0 && !selectedAgent) {
            setSelectedAgent(data[0].id)
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Failed to fetch agents:', err)
        }
      } finally {
        setAgentsLoading(false)
      }
    }

    fetchAgents()
    
    return () => controller.abort()
  }, [selectedAgent])

  // Gateway connection for status
  const { status: gatewayStatus, isConnected } = useGateway()

  // Chat hook
  const { messages, isLoading: chatLoading, sendChatMessage } = useChat(selectedAgent)

  // Consolidate loading states - show loading if either agents or chat is loading
  const isLoading = useMemo(() => agentsLoading || chatLoading, [agentsLoading, chatLoading])

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !isConnected) return

    try {
      await sendChatMessage(input)
      setInput("")
    } catch (err) {
      console.error('Failed to send message:', err)
    }
  }, [input, isLoading, isConnected, sendChatMessage])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const selectedAgentData = agents.find(a => a.id === selectedAgent)

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chat</h1>
          <p className="text-muted-foreground">Interact with your OpenClaw agents</p>
        </div>
        <div className="flex items-center gap-4">
          <ConnectionStatus status={gatewayStatus} />
          <AgentSelector 
            value={selectedAgent} 
            onChange={setSelectedAgent}
            agents={agents}
            loading={agentsLoading}
          />
        </div>
      </div>

      <Card className="flex flex-col h-[calc(100%-6rem)]">
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <span className="text-2xl">
              {selectedAgentData?.emoji || "🤖"}
            </span>
            <div>
              <CardTitle className="text-lg">
                {selectedAgentData?.name || "Select an agent"}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {isConnected ? 'Ready to assist' : 'Connecting to Gateway...'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col p-0">
          <ScrollArea ref={scrollRef} className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 && !isLoading && (
                <div className="text-center text-muted-foreground py-8">
                  <p>Select an agent and start a conversation</p>
                </div>
              )}
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === "user" 
                        ? "👤" 
                        : selectedAgentData?.emoji || "🤖"
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.role === "user"
                          ? "text-primary-foreground/70"
                          : "text-muted-foreground"
                      }`}
                    >
                      {formatRelativeTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {selectedAgentData?.emoji || "🤖"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <span className="animate-bounce">●</span>
                      <span className="animate-bounce delay-100">●</span>
                      <span className="animate-bounce delay-200">●</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder={isConnected ? "Type your message..." : "Connecting to Gateway..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isLoading || !isConnected || !selectedAgent}
              />
              <Button 
                onClick={handleSend} 
                disabled={isLoading || !isConnected || !input.trim() || !selectedAgent}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            {!isConnected && (
              <p className="text-xs text-red-500 mt-2">
                Not connected to OpenClaw Gateway. Please wait or refresh the page.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
