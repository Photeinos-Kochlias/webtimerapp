'use client'

import { useState, useRef, useCallback, useEffect } from 'react'

const CIRC = 603

function fmt2(n: number) { return String(Math.floor(n)).padStart(2, '0') }
function fmtTimer(s: number) {
  if (s >= 3600) return `${fmt2(s / 3600)}:${fmt2((s % 3600) / 60)}:${fmt2(s % 60)}`
  return `${fmt2(s / 60)}:${fmt2(s % 60)}`
}

type Phase = 'work' | 'short' | 'long'

interface Props {
  onBeep: (type: 'done' | 'break' | 'finish') => void
  onToast: (msg: string, color?: string) => void
}

export default function PomodoroPanel({ onBeep, onToast }: Props) {
  const [workMin, setWorkMin] = useState(25)
  const [shortMin, setShortMin] = useState(5)
  const [longMin, setLongMin] = useState(15)
  const [sets, setSets] = useState(4)

  // form inputs (before apply)
  const [wInput, setWInput] = useState(25)
  const [sInput, setSInput] = useState(5)
  const [lInput, setLInput] = useState(15)
  const [nInput, setNInput] = useState(4)

  const [cur, setCur] = useState(0)
  const [phase, setPhase] = useState<Phase>('work')
  const [left, setLeft] = useState(25 * 60)
  const [total, setTotal] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const stateRef = useRef({ cur, phase, left, total, running, workMin, shortMin, longMin, sets })
  stateRef.current = { cur, phase, left, total, running, workMin, shortMin, longMin, sets }

  const stop = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const phaseTime = useCallback((p: Phase, w: number, sh: number, lo: number) => {
    if (p === 'work') return w * 60
    if (p === 'short') return sh * 60
    return lo * 60
  }, [])

  const ringColor = (p: Phase) =>
    p === 'work' ? '#7c6bff' : p === 'short' ? '#4fc4a0' : '#f0a050'

  const sessionLabel = (p: Phase, c: number, s: number) => {
    const wCount = Math.floor(c / 2) + 1
    if (p === 'work') return `セッション ${Math.min(wCount, s)} / ${s}`
    if (p === 'short') return '短い休憩'
    return '長い休憩'
  }

  const nextPhase = useCallback((prevCur: number, prevPhase: Phase, autoStart: boolean,
    w: number, sh: number, lo: number, s: number) => {
    const nextCur = prevCur + 1
    const wDone = Math.ceil(nextCur / 2)

    if (wDone >= s && nextCur % 2 === 0) {
      onBeep('finish')
      onToast('🎉 全セット完了！お疲れさまでした！', '#4fc4a0')
      // reset
      setCur(0); setPhase('work')
      const t = w * 60; setTotal(t); setLeft(t)
      setRunning(false)
      return
    }

    let nextPhaseVal: Phase
    if (nextCur % 2 === 1) {
      nextPhaseVal = wDone === s ? 'long' : 'short'
    } else {
      nextPhaseVal = 'work'
    }

    const t = phaseTime(nextPhaseVal, w, sh, lo)
    setCur(nextCur); setPhase(nextPhaseVal); setTotal(t); setLeft(t)

    if (autoStart) {
      setRunning(true)
      intervalRef.current = setInterval(() => {
        setLeft(prev => {
          if (prev <= 1) {
            stop()
            const st = stateRef.current
            if (st.phase === 'work') {
              onBeep('done'); onToast('⏰ 作業終了！休憩へ移ります', '#7c6bff')
            } else {
              onBeep('break'); onToast('🌿 休憩終了！作業を再開します', '#4fc4a0')
            }
            setTimeout(() => {
              const st2 = stateRef.current
              nextPhase(st2.cur, st2.phase, true, st2.workMin, st2.shortMin, st2.longMin, st2.sets)
            }, 1500)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
  }, [onBeep, onToast, phaseTime, stop])

  const tick = useCallback(() => {
    setLeft(prev => {
      if (prev <= 1) {
        stop()
        const st = stateRef.current
        if (st.phase === 'work') {
          onBeep('done'); onToast('⏰ 作業終了！休憩へ移ります', '#7c6bff')
        } else {
          onBeep('break'); onToast('🌿 休憩終了！作業を再開します', '#4fc4a0')
        }
        setTimeout(() => {
          const st2 = stateRef.current
          nextPhase(st2.cur, st2.phase, true, st2.workMin, st2.shortMin, st2.longMin, st2.sets)
        }, 1500)
        return 0
      }
      return prev - 1
    })
  }, [stop, onBeep, onToast, nextPhase])

  const toggle = useCallback(() => {
    if (running) {
      stop(); setRunning(false)
    } else {
      setRunning(true)
      intervalRef.current = setInterval(tick, 1000)
    }
  }, [running, stop, tick])

  const skip = useCallback(() => {
    stop()
    const st = stateRef.current
    if (st.phase === 'work') onBeep('done'); else onBeep('break')
    nextPhase(st.cur, st.phase, st.running, st.workMin, st.shortMin, st.longMin, st.sets)
  }, [stop, onBeep, nextPhase])

  const reset = useCallback(() => {
    stop(); setRunning(false)
    setCur(0); setPhase('work')
    const t = workMin * 60; setTotal(t); setLeft(t)
  }, [stop, workMin])

  const apply = useCallback(() => {
    stop(); setRunning(false)
    setWorkMin(wInput); setShortMin(sInput); setLongMin(lInput); setSets(nInput)
    setCur(0); setPhase('work')
    const t = wInput * 60; setTotal(t); setLeft(t)
  }, [stop, wInput, sInput, lInput, nInput])

  useEffect(() => () => stop(), [stop])

  const ratio = total > 0 ? left / total : 0
  const dashOffset = CIRC - ratio * CIRC
  const wCount = Math.floor(cur / 2) + 1

  // render dots
  const dots = []
  for (let i = 0; i < sets; i++) {
    const wStep = i * 2
    const bStep = i * 2 + 1
    const wDone = cur > wStep
    const wActive = cur === wStep && phase === 'work'
    const bDone = cur > bStep
    const bActive = cur === bStep && (phase === 'short' || phase === 'long')
    dots.push(<div key={`w${i}`} className={`pdot${wDone ? ' done' : wActive ? ' active' : ''}`} />)
    if (i < sets - 1) dots.push(<div key={`b${i}`} className={`pdot${bDone ? ' done' : bActive ? ' brk' : ''}`} />)
  }

  const badgeClass = phase === 'work' ? 'work' : phase === 'short' ? 'short' : 'long'
  const badgeTxt = phase === 'work' ? '作業中' : phase === 'short' ? '短い休憩' : '長い休憩'

  return (
    <div className="card">
      <div className="pomo-dots">{dots}</div>
      <div className={`pomo-badge ${badgeClass}`}>
        <span className="pbadge-dot" />
        <span>{badgeTxt}</span>
      </div>

      <div className="ring-wrap" style={{ marginBottom: 20 }}>
        <svg className="ring-svg" viewBox="0 0 220 220">
          <circle className="ring-track" cx="110" cy="110" r="96" />
          <circle
            className="ring-fill"
            cx="110" cy="110" r="96"
            stroke={ringColor(phase)}
            strokeDasharray={CIRC}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="ring-inner">
          <div className="time-num">{fmtTimer(left)}</div>
          <div className="ring-label">{sessionLabel(phase, cur, sets)}</div>
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
        <button className="btn btn-icon" onClick={skip} title="スキップ">
          <svg className="ico" viewBox="0 0 24 24">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      <div className="divider" style={{ marginTop: 20 }} />

      <div className="pomo-settings">
        <div className="ps-cell">
          <label>作業（分）</label>
          <input type="number" min={1} max={60} value={wInput}
            onChange={e => setWInput(parseInt(e.target.value) || 25)} />
        </div>
        <div className="ps-cell">
          <label>短い休憩（分）</label>
          <input type="number" min={1} max={30} value={sInput}
            onChange={e => setSInput(parseInt(e.target.value) || 5)} />
        </div>
        <div className="ps-cell">
          <label>長い休憩（分）</label>
          <input type="number" min={1} max={60} value={lInput}
            onChange={e => setLInput(parseInt(e.target.value) || 15)} />
        </div>
        <div className="ps-cell">
          <label>セット数</label>
          <input type="number" min={1} max={10} value={nInput}
            onChange={e => setNInput(parseInt(e.target.value) || 4)} />
        </div>
        <div className="ps-cell full">
          <div className="apply-row">
            <span className="apply-hint">変更後に適用してください</span>
            <button className="btn" style={{ height: 36, fontSize: 12 }} onClick={apply}>
              <svg className="ico" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              適用
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
