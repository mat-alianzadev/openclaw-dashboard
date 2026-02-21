export interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: 'idle' | 'busy' | 'offline' | 'error';
  currentTask?: string;
  lastActivity: string;  // ISO string from API
  workspace: string;
  model?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'backlog' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string;
  createdAt: string;  // ISO string from API
  updatedAt: string;  // ISO string from API
  tags: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;  // ISO string from API
  level: 'debug' | 'info' | 'warn' | 'error';
  agentId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;  // ISO string from API
  agentId?: string;
}

export interface AgentActivity {
  agentId: string;
  type: 'task_started' | 'task_completed' | 'task_failed' | 'tool_called' | 'message';
  timestamp: string;  // ISO string from API
  details: string;
  metadata?: Record<string, unknown>;
}

export interface SystemStatus {
  gatewayOnline: boolean;
  connectedAgents: number;
  activeTasks: number;
  totalTasks: number;
  lastUpdate: string;  // ISO string from API
}
