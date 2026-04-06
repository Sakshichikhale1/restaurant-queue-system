import { useEffect, useCallback, useState } from 'react'
import { socket } from '../utils/api'

/**
 * Subscribes to booking_update socket events.
 * Calls `onUpdate` whenever the server emits one.
 * Also exposes connection status.
 */
export function useRealtime(onUpdate) {
  const [connected, setConnected] = useState(socket.connected)

  const handler = useCallback(() => {
    if (onUpdate) onUpdate()
  }, [onUpdate])

  useEffect(() => {
    socket.on('connect',        () => setConnected(true))
    socket.on('disconnect',     () => setConnected(false))
    socket.on('booking_update', handler)

    return () => {
      socket.off('connect')
      socket.off('disconnect')
      socket.off('booking_update', handler)
    }
  }, [handler])

  return { connected }
}