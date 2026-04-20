import { useState, useEffect, useCallback } from 'react'
import socketService from '../services/socket'

export function useSocket(event, callback) {
  useEffect(() => {
    socketService.on(event, callback)

    return () => {
      socketService.off(event, callback)
    }
  }, [event, callback])
}

export function useSocketEmit() {
  return useCallback((event, data) => {
    socketService.emit(event, data)
  }, [])
}
