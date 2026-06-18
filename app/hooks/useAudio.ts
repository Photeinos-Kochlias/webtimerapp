'use client'

import { useRef, useCallback } from 'react'

type BeepType = 'done' | 'break' | 'finish'

export function useAudio() {
  const ctxRef = useRef<AudioContext | null>(null)

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return ctxRef.current
  }, [])

  const beep = useCallback((type: BeepType = 'done') => {
    try {
      const ctx = getCtx()
      if (ctx.state === 'suspended') ctx.resume()
      const now = ctx.currentTime

      const play = (freqs: [number, number][]) => {
        freqs.forEach(([freq, t]) => {
          const o = ctx.createOscillator()
          const g = ctx.createGain()
          o.type = 'sine'
          o.frequency.value = freq
          g.gain.setValueAtTime(0, now + t)
          g.gain.linearRampToValueAtTime(0.28, now + t + 0.02)
          g.gain.exponentialRampToValueAtTime(0.001, now + t + 0.7)
          o.connect(g)
          g.connect(ctx.destination)
          o.start(now + t)
          o.stop(now + t + 0.75)
        })
      }

      if (type === 'done') {
        play([[523, 0], [659, 0.18], [784, 0.36]])
      } else if (type === 'break') {
        play([[392, 0], [330, 0.22]])
      } else if (type === 'finish') {
        play([[523, 0], [659, 0.15], [784, 0.30], [1047, 0.48]])
      }
    } catch (e) {
      console.warn('audio:', e)
    }
  }, [getCtx])

  const resume = useCallback(() => {
    try { getCtx().resume() } catch (_) {}
  }, [getCtx])

  return { beep, resume }
}
