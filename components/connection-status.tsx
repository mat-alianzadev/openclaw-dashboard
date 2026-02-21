'use client'

import { useGateway } from '@/lib/gateway/useGateway'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Wifi, WifiOff, Loader2 } from 'lucide-react'

export function ConnectionStatus() {
  const { status, isConnected } = useGateway()

  const getIcon = () => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'connecting':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />
      case 'error':
      case 'disconnected':
        return <WifiOff className="h-4 w-4 text-red-500" />
    }
  }

  const getLabel = () => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'connecting':
        return 'Connecting...'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Error'
    }
  }

  const getVariant = () => {
    switch (status) {
      case 'connected':
        return 'default'
      case 'connecting':
        return 'secondary'
      case 'disconnected':
      case 'error':
        return 'destructive'
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant={getVariant()} className="cursor-pointer gap-1">
            {getIcon()}
            <span className="hidden sm:inline">{getLabel()}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Gateway: {getLabel()}</p>
          {status === 'disconnected' && <p className="text-xs">Auto-reconnecting...</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
