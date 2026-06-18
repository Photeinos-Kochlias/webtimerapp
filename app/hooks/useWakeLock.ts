"use client"

import { useCallback, useEffect, useRef } from 'react'

type WakeLockSentinel = {
  release: () => Promise<void>
  addEventListener: (type: string, listener: () => void) => void
}

export default function useWakeLock(active: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  const requestWakeLock = useCallback(async () => {
    if (!('wakeLock' in navigator)) return
    try {
      wakeLockRef.current = await (navigator as any).wakeLock.request('screen')
      wakeLockRef.current.addEventListener('release', () => {
        wakeLockRef.current = null
      })
    } catch {
      // ignore wake lock failures
    }
  }, [])

  useEffect(() => {
    if (!active) return
    requestWakeLock()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible' && active) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => undefined)
        wakeLockRef.current = null
      }
    }
  }, [active, requestWakeLock])
}
