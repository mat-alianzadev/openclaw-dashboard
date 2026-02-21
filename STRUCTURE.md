# OpenClaw Dashboard - Code Structure Analysis

**Generated:** 2026-02-21  
**Framework:** Next.js 14.2.5 (App Router)  
**Styling:** Tailwind CSS + shadcn/ui

---

## 📁 Directory Structure

```
openclaw-dashboard/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── agents/
│   │   │   ├── route.ts          # GET /api/agents (list all)
│   │   │   └── [id]/
│   │   │       └── status/
│   │   │           └── route.ts  # GET /api/agents/:id/status
│   │   ├── auth/
│   │   │   ├── login/
│   │   │   │   └── route.ts      # POST /api/auth/login
│   │   │   └── logout/
│   │   │       └── route.ts      # POST /api/auth/logout
│   │   ├── chat/
│   │   │   └── route.ts          # POST /api/chat (send message)
│   │   ├── logs/
│   │   │   └── route.ts          # GET /api/logs (query params: limit, level, agentId)
│   │   └── status/
│   │       └── route.ts          # GET /api/status (system health)
│   ├── dashboard/                # Dashboard pages (protected)
│   │   ├── page.tsx              # /dashboard (overview)
│   │   ├── layout.tsx            # Dashboard layout (root)
│   │   ├── agents/
│   │   │   └── page.tsx          # /dashboard/agents
│   │   ├── chat/
│   │   │   └── page.tsx          # /dashboard/chat
│   │   ├── logs/
│   │   │   └── page.tsx          # /dashboard/logs
│   │   └── tasks/
│   │       └── page.tsx          # /dashboard/tasks
│   ├── login/
│   │   └── page.tsx              # /login
│   ├── page.tsx                  # / (redirects to /login)
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles + Tailwind
├── components/                   # React components
│   ├── ui/                       # shadcn/ui components
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── skeleton.tsx
│   │   ├── tabs.tsx
│   │   ├── textarea.tsx
│   │   └── tooltip.tsx
│   ├── connection-status.tsx     # Gateway connection indicator
│   ├── dashboard-layout.tsx      # Sidebar + main content layout
│   └── error-boundary.tsx        # React Error Boundary
├── lib/                          # Utilities and business logic
│   ├── gateway/                  # Gateway communication layer
│   │   ├── client.ts             # HTTP client for REST API
│   │   ├── config.ts             # Gateway config + types
│   │   └── useGateway.ts         # React hooks (WebSocket, Chat, AgentStatus)
│   ├── types.ts                  # Domain types (Agent, Task, LogEntry, etc.)
│   └── utils.ts                  # Helper functions (cn, formatters)
├── public/                       # Static assets
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS config
└── next.config.js                # Next.js config
```

---

## 🏗️ Architecture Overview

### 1. Next.js App Router Structure

The app uses the **App Router** (Next.js 13+) with:

- **Server Components by default** - Most pages are Server Components
- **Client Components** marked with `"use client"` when needed (interactivity, hooks, browser APIs)
- **Route Groups** - Dashboard is grouped under `/dashboard/*` with shared layout

### 2. Component Hierarchy

```
RootLayout (Server)
├── Layout.tsx (Root, Server)
│   └── body
│       └── LoginPage (Client) [if route = /login]
│       OR
│       └── DashboardLayout (Client) [if route = /dashboard/*]
│           ├── Sidebar (Client)
│           └── Main Content (Server or Client)
│               ├── DashboardPage (Server) - /dashboard
│               ├── AgentsPage (Client)    - /dashboard/agents
│               ├── ChatPage (Client)      - /dashboard/chat
│               ├── LogsPage (Client)      - /dashboard/logs
│               └── TasksPage (Client)     - /dashboard/tasks
```

### 3. Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                               │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────────────┐ │
│  │ useGateway  │  │   useChat    │  │   useAgentStatus    │ │
│  │ (WebSocket) │  │  (WebSocket) │  │    (WebSocket)      │ │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          │                                  │
│                          ▼                                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              gatewayClient (HTTP)                     │   │
│  │   - getAgents()    - getLogs()                       │   │
│  │   - getAgentStatus()  - sendMessage()                │   │
│  │   - getSystemStatus()                                │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      API ROUTES (Next.js)                    │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────────────┐ │
│  │ /api/... │ │ /api/... │ │ /api/...│ │  /api/chat       │ │
│  └────┬─────┘ └────┬─────┘ └────┬────┘ └────────┬─────────┘ │
│       └─────────────┴────────────┴───────────────┘           │
│                          │                                   │
└──────────────────────────┼───────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 OPENCLAW GATEWAY (External)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │ WebSocket    │  │   REST API   │  │   Agent Manager  │   │
│  │  (ws://...)  │  │ (http://...) │  │                  │   │
│  └──────────────┘  └──────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔌 Gateway Communication Layer

### Files

| File | Purpose | Type |
|------|---------|------|
| `lib/gateway/config.ts` | Gateway URLs, tokens, TypeScript interfaces | Config |
| `lib/gateway/client.ts` | HTTP client for REST API calls | Singleton Class |
| `lib/gateway/useGateway.ts` | React hooks for real-time WebSocket | Hooks |

### Exports from `useGateway.ts`

```typescript
useGateway(options)     // Core WebSocket hook
useAgentStatus()        // Subscribe to agent status updates
useChat(agentId)        // Chat interface with specific agent
```

### Gateway Client Methods

```typescript
gatewayClient.getAgents()           // GET /api/agents
gatewayClient.getAgentStatus(id)    // GET /api/agents/:id/status
gatewayClient.getLogs(options)      // GET /api/logs?...
gatewayClient.sendMessage(id, msg)  // POST /api/chat
gatewayClient.getSystemStatus()     // GET /api/status
```

---

## 🎨 Component Organization

### shadcn/ui Components (`components/ui/`)

Standard shadcn/ui component structure using **Radix UI primitives**:

| Component | Radix Primitive | Usage |
|-----------|-----------------|-------|
| `avatar.tsx` | `@radix-ui/react-avatar` | Agent avatars |
| `badge.tsx` | Custom | Status indicators |
| `button.tsx` | `@radix-ui/react-slot` | Actions |
| `card.tsx` | Custom | Content containers |
| `dialog.tsx` | `@radix-ui/react-dialog` | Modals |
| `input.tsx` | Custom | Forms |
| `scroll-area.tsx` | `@radix-ui/react-scroll-area` | Lists, chat |
| `select.tsx` | `@radix-ui/react-select` | Dropdowns |
| `separator.tsx` | `@radix-ui/react-separator` | Dividers |
| `skeleton.tsx` | Custom | Loading states |
| `tabs.tsx` | `@radix-ui/react-tabs` | Navigation |
| `textarea.tsx` | Custom | Multi-line input |
| `tooltip.tsx` | `@radix-ui/react-tooltip` | Hints |

### Custom Components

| Component | Type | Purpose |
|-----------|------|---------|
| `dashboard-layout.tsx` | Client | Sidebar + main content wrapper |
| `connection-status.tsx` | Client | Gateway connection indicator |
| `error-boundary.tsx` | Client | Error handling wrapper |

---

## 📦 TypeScript Types

### Domain Types (`lib/types.ts`)

```typescript
interface Agent          // Agent representation
interface Task           // Task/Kanban card
interface LogEntry       // System log line
interface ChatMessage    // Chat message
interface AgentActivity  // Activity feed item
interface SystemStatus   // Dashboard stats
```

### Gateway Types (`lib/gateway/config.ts`)

```typescript
interface GatewayAgent    // Agent from Gateway API
interface GatewayMessage  // WebSocket message
interface GatewayLog      // Log from Gateway
```

---

## 🔄 Data Fetching Patterns

### Server Components (Pages)

Using **direct async calls** with Suspense:

```tsx
// app/dashboard/page.tsx
async function StatsSection() {
  const status = await gatewayClient.getSystemStatus()
  // ...render
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<StatsSkeleton />}>
      <StatsSection />
    </Suspense>
  )
}
```

### Client Components (Hooks)

Using **manual fetch in useEffect** (⚠️ needs improvement):

```tsx
// app/dashboard/chat/page.tsx
useEffect(() => {
  async function fetchAgents() {
    const res = await fetch('/api/agents')
    // ...
  }
  fetchAgents()
}, [])
```

### Real-time (WebSocket)

Using **custom hook per feature**:

```tsx
const { messages, isLoading, sendChatMessage } = useChat(agentId)
const { agents, isConnected } = useAgentStatus()
const { status, sendMessage } = useGateway(options)
```

---

## 🎭 Page Breakdown

| Page | Route | Component Type | Data Source |
|------|-------|----------------|-------------|
| Login | `/login` | Client Component | API POST |
| Dashboard | `/dashboard` | Server + Client | Server: gatewayClient, Client: useGateway |
| Agents | `/dashboard/agents` | Client Component | fetch() + useGateway |
| Chat | `/dashboard/chat` | Client Component | fetch() + useChat |
| Logs | `/dashboard/logs` | Client Component | fetch() |
| Tasks | `/dashboard/tasks` | Client Component | fetch() |

---

## ⚙️ Configuration Files

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]   // Path alias for imports
    }
  }
}
```

### `next.config.js`

```javascript
{
  reactStrictMode: true,
  output: 'standalone',     // For Docker/containerization
  headers: { /* CORS */ }   // API route CORS headers
}
```

### `tailwind.config.js`

```javascript
{
  darkMode: ["class"],
  content: ["app/**/*.{ts,tsx}", "components/**/*.{ts,tsx}"],
  // ... theme extensions for shadcn/ui
}
```

---

## 🔒 Authentication Flow

```
1. User visits /login
2. Submits credentials → POST /api/auth/login
3. Server sets HTTP-only cookie with JWT
4. Client redirects to /dashboard
5. Dashboard pages check for valid session
6. Logout → POST /api/auth/logout → clears cookie
```

---

## 🚨 Current Architecture Issues

### 1. Mixed Data Fetching Patterns
- Server Components use `gatewayClient` (good)
- Client Components use raw `fetch()` (inconsistent)
- **Recommendation:** Use SWR or TanStack Query for client fetching

### 2. WebSocket Per Hook
- Each `useGateway()`, `useChat()`, `useAgentStatus()` creates separate connection
- **Recommendation:** Singleton GatewaySocket with pub/sub

### 3. No State Management
- Local state only (`useState`)
- No global state for shared data (agents list)
- **Recommendation:** Zustand for lightweight global state

### 4. Error Handling Inconsistent
- Some places have try/catch
- Others don't handle errors
- **Recommendation:** Unified error handling strategy

---

## ✅ Strengths

1. **Clean directory structure** - Standard Next.js App Router
2. **TypeScript throughout** - Good type coverage
3. **Separation of concerns** - Components, lib, API routes well separated
4. **shadcn/ui integration** - Consistent, accessible UI
5. **Server Components where possible** - Good use of Next.js 13+ features
6. **Error Boundaries** - Proper error handling with fallback UI
7. **Tailwind CSS** - No runtime CSS-in-JS overhead

---

## 📊 File Count Summary

| Category | Count |
|----------|-------|
| API Routes | 7 |
| Pages | 7 |
| UI Components | 13 |
| Custom Components | 3 |
| Hooks | 3 |
| Utility files | 3 |
| **Total** | **36** |

---

## 🎯 Recommended Refactoring

### Phase 1: Standardize Data Fetching
```
lib/
  ├── api/
  │   ├── agents.ts      # SWR hooks for agents
  │   ├── logs.ts        # SWR hooks for logs
  │   └── status.ts      # SWR hooks for status
  └── gateway/
      └── socket.ts      # Singleton WebSocket
```

### Phase 2: State Management
```
lib/
  └── store/
      ├── index.ts       # Zustand store
      ├── agents.ts      # Agents slice
      └── ui.ts          # UI state slice
```

### Phase 3: Feature Organization
```
app/
  └── dashboard/
      ├── _components/   # Dashboard-specific components
      ├── _hooks/        # Dashboard-specific hooks
      └── _lib/          # Dashboard-specific utilities
```

---

**End of Analysis**
