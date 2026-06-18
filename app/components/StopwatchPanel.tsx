'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const CIRC = 603

function fmt2(n: number) { return String(Math.floor(n)).padStart(2, '0') }
function fmtTimer(s: number) {
  if (s >= 3600) return `${fmt2(s / 3600)}:${fmt2((s % 3600) / 60)}:${fmt2(s % 60)}`
  return `${fmt2(s / 60)}:${fmt2(s % 60)}`
}

interface Lap { split: number; total: number }

export default function StopwatchPanel() {
  const [ms, setMs] = useState(0)
  const [running, setRunning] = useState(false)
  const [laps, setLaps] = useState<Lap[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const msRef = useRef(0)
  const prevRef = useRef(0)

  msRef.current = ms

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const toggle = useCallback(() => {
    if (running) {
      stop(); setRunning(false)
    } else {
      setRunning(true)
      intervalRef.current = setInterval(() => setMs(prev => prev + 1), 10)
    }
  }, [running, stop])

  const reset = useCallback(() => {
    stop(); setRunning(false)
    setMs(0); msRef.current = 0; prevRef.current = 0
    setLaps([])
  }, [stop])

  const lap = useCallback(() => {
    const cur = msRef.current
    const split = cur - prevRef.current
    prevRef.current = cur
    setLaps(prev => [...prev, { split, total: cur }])
  }, [])

  useEffect(() => () => stop(), [stop])

  const secs = Math.floor(ms / 100)
  const centis = ms % 100
  const dashOffset = CIRC - ((ms % 6000) / 6000) * CIRC

  const splits = laps.map(l => l.split)
  const best = splits.length ? Math.min(...splits) : -1
  const worst = splits.length > 1 ? Math.max(...splits) : -1

  return (
    <div className="card">
      <div className="ring-wrap">
        <svg className="ring-svg" viewBox="0 0 220 220">
          <circle className="ring-track" cx="110" cy="110" r="96" />
          <circle
            className="ring-fill"
            cx="110" cy="110" r="96"
            stroke="#4fc4a0"
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="ring-inner">
          <div className="time-num">{fmtTimer(secs)}</div>
          <div className="time-ms">.{fmt2(centis)}</div>
        </div>
      </div>

      <div className="btns">
        <button className="btn btn-icon" onClick={reset} title="リセット">
          <svg className="ico" viewBox="0 0 24 24">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 .49-3.14" />
          </svg>
        </button>
        <button className={`btn btn-main${running ? ' pause' : ''}`} onClick={toggle}>
          {running
            ? <svg className="ico" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
            : <svg className="ico" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3" /></svg>
          }
          <span>{running ? '一時停止' : 'スタート'}</span>
        </button>
        <button className="btn btn-icon" onClick={lap} disabled={!running} title="ラップ">
          <svg className="ico" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </button>
      </div>

      {laps.length > 0 && (
        <div className="laps-wrap">
          <div className="laps-head">
            <span>ラップ</span>
            <span>{laps.length}回</span>
          </div>
          <div className="laps-scroll">
            {[...laps].reverse().map((l, ri) => {
              const i = laps.length - 1 - ri
              const cls = laps.length > 1 ? l.split === best ? 'best' : l.split === worst ? 'worst' : '' : ''
              const s = Math.floor(l.split / 100)
              const cs = l.split % 100
              return (
                <div className="lap-row" key={i}>
                  <span className="lap-n">Lap {i + 1}</span>
                  <span className={`lap-t ${cls}`}>{fmtTimer(s)}.{fmt2(cs)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
