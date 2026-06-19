'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { saveState, loadState, now } from '../utils/persist'
import { Preset, addPreset } from '../utils/presets'
import useWakeLock from '../hooks/useWakeLock'
import PresetManager from './PresetManager'

const CIRC = 603

function fmt2(n: number) { return String(Math.floor(n)).padStart(2, '0') }
function fmtTimer(s: number) {
  if (s >= 3600) return `${fmt2(s / 3600)}:${fmt2((s % 3600) / 60)}:${fmt2(s % 60)}`
  return `${fmt2(s / 60)}:${fmt2(s % 60)}`
}

interface Lap { split: number; total: number }

interface Props {
  onBeep: (type: 'done' | 'break' | 'finish') => void
  onToast: (msg: string, color?: string) => void
}

export default function TimerPanel({ onBeep, onToast }: Props) {
  const [hVal, setHVal] = useState(0)
  const [mVal, setMVal] = useState(5)
  const [sVal, setSVal] = useState(0)
  const [left, setLeft] = useState(300)
  const [total, setTotal] = useState(300)
  const [running, setRunning] = useState(false)
  const [label, setLabel] = useState('準備中')
  const [laps, setLaps] = useState<Lap[]>([])

  const normalizeNumber = useCallback((value: string, min: number, max = Number.POSITIVE_INFINITY) => {
    const num = Number(value)
    if (!Number.isFinite(num)) return min
    return Math.min(max, Math.max(min, Math.trunc(num)))
  }, [])

  const syncTimerDisplay = useCallback((nextH: number, nextM: number, nextS: number) => {
    const nextTotal = nextH * 3600 + nextM * 60 + nextS
    if (!running) {
      setLeft(nextTotal)
      setTotal(nextTotal)
      leftRef.current = nextTotal
      prevLeftRef.current = null
    }
  }, [running])

  const prevLeftRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const leftRef = useRef(left)
  leftRef.current = left

  const getSecs = useCallback(() => hVal * 3600 + mVal * 60 + sVal, [hVal, mVal, sVal])

  const ratio = total > 0 ? left / total : 0
  const color = left < 60 ? '#ff5f5f' : left < 300 ? '#f0a050' : '#7c6bff'
  const dashOffset = CIRC - ratio * CIRC

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const saveTimer = useCallback((extra: any = {}) => {
    try {
      const payload = {
        running,
        left: leftRef.current,
        total,
        prevLeft: prevLeftRef.current,
        ts: now(),
        ...extra,
      }
      saveState('timer', payload)
    } catch {}
  }, [running, total])

  const toggle = useCallback(() => {
    if (running) {
      stop()
      setRunning(false)
      setLabel('一時停止中')
      saveTimer({ running: false })
    } else {
      if (leftRef.current === 0) return
      if (prevLeftRef.current === null) {
        const t = getSecs()
        if (!t) return
        setTotal(t)
        setLeft(t)
        leftRef.current = t
      }
      prevLeftRef.current = leftRef.current
      setRunning(true)
      saveTimer({ running: true, endTs: Date.now() + leftRef.current * 1000 })
      setLabel('カウントダウン中')
      intervalRef.current = setInterval(() => {
        setLeft(prev => {
          const next = prev - 1
          if (next <= 0) {
            stop()
            setRunning(false)
            setLabel('完了！')
            onBeep('done')
            onToast('⏰ 時間です！', '#7c6bff')
            saveTimer({ running: false, left: 0 })
            return 0
          }
          saveTimer({ left: next })
          return next
        })
      }, 1000)
    }
  }, [running, stop, getSecs, onBeep, onToast])

  const reset = useCallback(() => {
    stop()
    prevLeftRef.current = null
    const t = getSecs()
    setTotal(t)
    setLeft(t)
    leftRef.current = t
    setRunning(false)
    setLabel('準備中')
    setLaps([])
    saveState('timer', { running: false, left: t, total: t, prevLeft: null })
  }, [stop, getSecs])

  const lap = useCallback(() => {
    if (!running || prevLeftRef.current === null) return
    const split = prevLeftRef.current - leftRef.current
    setLaps(prev => {
      const newLaps = [...prev, { split, total: total - leftRef.current }]
      prevLeftRef.current = leftRef.current
      return newLaps
    })
  }, [running, total])

  useWakeLock(running)

  useEffect(() => () => stop(), [stop])

  useEffect(() => {
    const saveNow = () => saveTimer()
    const onVisibility = () => { if (document.hidden) saveNow() }
    window.addEventListener('pagehide', saveNow)
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('beforeunload', saveNow)
    return () => {
      window.removeEventListener('pagehide', saveNow)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('beforeunload', saveNow)
    }
  }, [saveTimer])

  useEffect(() => {
    const st = loadState<any>('timer')
    if (!st) return
    if (st.running && st.endTs) {
      const remaining = Math.max(0, Math.ceil((st.endTs - Date.now()) / 1000))
      setTotal(st.total ?? remaining)
      setLeft(remaining)
      leftRef.current = remaining
      prevLeftRef.current = st.prevLeft ?? null
      if (remaining > 0) {
        setRunning(true)
        setLabel('カウントダウン中')
        intervalRef.current = setInterval(() => {
          setLeft(prev => {
            const next = prev - 1
            if (next <= 0) {
              stop(); setRunning(false); setLabel('完了！')
              saveState('timer', { running: false, left: 0 })
              return 0
            }
            saveState('timer', { running: true, left: next, endTs: Date.now() + next * 1000 })
            return next
          })
        }, 1000)
      } else {
        setLabel('完了！')
      }
    } else {
      setLeft(st.left ?? left)
      setTotal(st.total ?? total)
      leftRef.current = st.left ?? left
      prevLeftRef.current = st.prevLeft ?? null
      setRunning(false)
    }
  }, [])

  const splits = laps.map(l => l.split)
  const best = splits.length ? Math.max(...splits) : -1
  const worst = splits.length > 1 ? Math.min(...splits) : -1

  return (
    <div className="card">
      <div className="ring-wrap">
        <svg className="ring-svg" viewBox="0 0 220 220">
          <circle className="ring-track" cx="110" cy="110" r="96" />
          <circle
            className="ring-fill"
            cx="110" cy="110" r="96"
            stroke={color}
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="ring-inner">
          <div className="time-num">{fmtTimer(left)}</div>
          <div className="ring-label">{label}</div>
        </div>
      </div>

      {!running && prevLeftRef.current === null && (
        <div className="t-inputs">
          <div className="t-inp-cell">
            <label>時間</label>
            <input
              type="number"
              min={0}
              step={1}
              value={hVal}
              onChange={e => {
                const next = normalizeNumber(e.target.value, 0)
                setHVal(next)
                syncTimerDisplay(next, mVal, sVal)
              }}
            />
          </div>
          <span className="t-sep">:</span>
          <div className="t-inp-cell">
            <label>分</label>
            <input
              type="number"
              min={0}
              max={59}
              step={1}
              value={mVal}
              onChange={e => {
                const next = normalizeNumber(e.target.value, 0, 59)
                setMVal(next)
                syncTimerDisplay(hVal, next, sVal)
              }}
            />
          </div>
          <span className="t-sep">:</span>
          <div className="t-inp-cell">
            <label>秒</label>
            <input
              type="number"
              min={0}
              max={59}
              step={1}
              value={sVal}
              onChange={e => {
                const next = normalizeNumber(e.target.value, 0, 59)
                setSVal(next)
                syncTimerDisplay(hVal, mVal, next)
              }}
            />
          </div>
        </div>
      )}
      {running && <div style={{ marginBottom: 24 }} />}

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
          <span>{running ? '一時停止' : prevLeftRef.current !== null ? '再開' : 'スタート'}</span>
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
              return (
                <div className="lap-row" key={i}>
                  <span className="lap-n">Lap {i + 1}</span>
                  <span className={`lap-t ${cls}`}>{fmtTimer(l.split)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <PresetManager
        type="timer"
        onSave={() => ({ hours: hVal, minutes: mVal, seconds: sVal })}
        onLoad={(preset: Preset) => {
          const config = preset.config as any
          setHVal(config.hours ?? 0)
          setMVal(config.minutes ?? 0)
          setSVal(config.seconds ?? 0)
          syncTimerDisplay(config.hours ?? 0, config.minutes ?? 0, config.seconds ?? 0)
        }}
      />
    </div>
  )
}
