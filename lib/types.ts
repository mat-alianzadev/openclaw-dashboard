export interface Agent {
  id: string;
  name: string;
  emoji: string;
  status: 'idle' | 'busy' | 'offline' | 'error';
  currentTask?: string;
  lastActivity: Date;
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
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'debug' | 'info' | 'warn' | 'error';
  agentId?: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  agentId?: string;
}

export interface AgentActivity {
  agentId: string;
  type: 'task_started' | 'task_completed' | 'task_failed' | 'tool_called' | 'message';
  timestamp: Date;
  details: string;
  metadata?: Record<string, unknown>;
}

export interface SystemStatus {
  gatewayOnline: boolean;
  connectedAgents: number;
  activeTasks: number;
  totalTasks: number;
  lastUpdate: Date;
}
