# OpenClaw Dashboard

A modern Next.js dashboard for monitoring and managing OpenClaw agents.

## Features

- 🔐 **Secure Login** - JWT-based authentication
- 📊 **Real-time Overview** - Dashboard with system status and agent activity
- 🤖 **Agent Management** - View all agents, their status, and output
- 📋 **Kanban Board** - Drag & drop task delegation
- 📜 **Logs Viewer** - Real-time log streaming with filtering
- 💬 **Chat Interface** - Direct interaction with agents
- 🎨 **Modern UI** - Tailwind CSS + shadcn/ui components

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- @dnd-kit (drag & drop)
- WebSocket for real-time updates

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env.local
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000

Default login:
- Username: `admin`
- Password: `admin123`

## Project Structure

```
app/
├── api/            # API routes
├── dashboard/      # Dashboard pages
│   ├── agents/     # Agent management
│   ├── tasks/      # Kanban board
│   ├── logs/       # Logs viewer
│   └── chat/       # Chat interface
├── login/          # Login page
├── layout.tsx      # Root layout
└── page.tsx        # Home redirect
components/
├── ui/             # shadcn/ui components
└── dashboard-layout.tsx
lib/
├── types.ts        # TypeScript types
└── utils.ts        # Utility functions
```

## Connecting to OpenClaw

The dashboard connects to the OpenClaw Gateway via WebSocket:
- Gateway URL: `ws://localhost:18789`
- Authentication: Gateway token from `~/.openclaw/openclaw.json`

## License

MIT
