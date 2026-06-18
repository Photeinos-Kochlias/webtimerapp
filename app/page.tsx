'use client'

import { useState, useEffect, useCallback } from 'react'
import Toast from './components/Toast'
import TimerPanel from './components/TimerPanel'
import StopwatchPanel from './components/StopwatchPanel'
import PomodoroPanel from './components/PomodoroPanel'
import { useAudio } from './hooks/useAudio'
import { useToast } from './hooks/useToast'

type Tab = 'timer' | 'sw' | 'pomo'

export default function Home() {
  const [tab, setTab] = useState<Tab>('timer')
  const { beep, resume } = useAudio()
  const { toastState, toast } = useToast()

  // iOS: resume AudioContext on first touch
  useEffect(() => {
    const handler = () => resume()
    document.addEventListener('touchstart', handler, { once: true, passive: true })
    return () => document.removeEventListener('touchstart', handler)
  }, [resume])

  return (
    <>
      <Toast {...toastState} />
      <div className="shell">
        <p className="wordmark">Timer</p>

        <div className="tabs">
          {(['timer', 'sw', 'pomo'] as Tab[]).map(t => (
            <button
              key={t}
              className={`tab${tab === t ? ' on' : ''}`}
              onClick={() => setTab(t)}
            >
              {t === 'timer' ? 'タイマー' : t === 'sw' ? 'ストップウォッチ' : 'ポモドーロ'}
            </button>
          ))}
        </div>

        {tab === 'timer' && <TimerPanel onBeep={beep} onToast={toast} />}
        {tab === 'sw' && <StopwatchPanel />}
        {tab === 'pomo' && <PomodoroPanel onBeep={beep} onToast={toast} />}
      </div>
    </>
  )
}
