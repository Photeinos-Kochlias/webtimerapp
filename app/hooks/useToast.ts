'use client'

import { useState, useCallback, useRef } from 'react'

interface ToastState {
  msg: string
  color: string
  visible: boolean
}

export function useToast() {
  const [state, setState] = useState<ToastState>({ msg: '', color: '#7c6bff', visible: false })
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const toast = useCallback((msg: string, color = '#7c6bff') => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setState({ msg, color, visible: true })
    timerRef.current = setTimeout(() => setState(s => ({ ...s, visible: false })), 3000)
  }, [])

  return { toastState: state, toast }
}
